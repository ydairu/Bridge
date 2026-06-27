import { db } from '../../firebase/config'
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp, 
  startAfter, 
  Timestamp
} from 'firebase/firestore'

export default {
  namespaced: true,
  
  state: {
    // From both versions
    reviews: [],
    loading: false,
    error: null,

    // Candidate-based reviews (from the incoming branch)
    reviewsByCandidateId: {}, // candidateId -> { items, lastDoc, totalCount, average }
    myReviewByCandidateId: {} // candidateId -> review or null
  },
  
  mutations: {
    // General reviews (from your version)
    SET_REVIEWS(state, reviews) {
      state.reviews = reviews
    },
    ADD_REVIEW(state, review) {
      state.reviews.unshift(review)
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    },

    // Candidate reviews (from incoming version)
    SET_CANDIDATE_REVIEWS(state, { candidateId, items, lastDoc }) {
      state.reviewsByCandidateId[candidateId] = {
        ...(state.reviewsByCandidateId[candidateId] || {}),
        items,
        lastDoc,
        totalCount: items.length,
        average: items.length
          ? Math.round((items.reduce((s, r) => s + (r.rating || 0), 0) / items.length) * 10) / 10
          : 0
      }
    },
    APPEND_REVIEWS(state, { candidateId, items, lastDoc }) {
      const current = state.reviewsByCandidateId[candidateId]?.items || []
      const merged = [...current, ...items]
      state.reviewsByCandidateId[candidateId] = {
        items: merged,
        lastDoc,
        totalCount: merged.length,
        average: merged.length
          ? Math.round((merged.reduce((s, r) => s + (r.rating || 0), 0) / merged.length) * 10) / 10
          : 0
      }
    },
    SET_MY_REVIEW(state, { candidateId, review }) {
      state.myReviewByCandidateId[candidateId] = review || null
    }
  },
  
  actions: {
    // ======= Original review actions =======
    async submitReview({ commit }, reviewData) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      try {
        const docRef = await addDoc(collection(db, 'reviews'), {
          ...reviewData,
          date: Timestamp.now(),
          likes: 0,
          createdAt: Timestamp.now()
        })
        
        const now = new Date()
        const newReview = {
          id: docRef.id,
          ...reviewData,
          date: now.toISOString(),
          likes: 0,
          isLiked: false
        }
        
        commit('ADD_REVIEW', newReview)
        commit('SET_LOADING', false)
        return docRef.id
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    async fetchReviews({ commit }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      try {
        const q = query(collection(db, 'reviews'), orderBy('date', 'desc'))
        const querySnapshot = await getDocs(q)
        
        const reviews = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          let dateValue
          if (data.date?.toDate) {
            dateValue = data.date.toDate().toISOString()
          } else if (data.date) {
            dateValue = data.date
          } else {
            dateValue = new Date().toISOString()
          }
          
          reviews.push({
            id: doc.id,
            company: data.company,
            industry: data.industry,
            rating: data.rating,
            review: data.review,
            reviewerName: data.reviewerName,
            reviewerType: data.reviewerType,
            date: dateValue,
            likes: data.likes || 0,
            isLiked: false,
            userId: data.userId
          })
        })
        
        commit('SET_REVIEWS', reviews)
        commit('SET_LOADING', false)
        return reviews
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },

    // ======= Candidate review actions =======
    async fetchReviewsByCandidate({ commit }, { candidateId, pageSize = 10, cursor = null }) {
      const base = query(
        collection(db, 'candidateReviews'),
        where('candidateId', '==', candidateId),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      )

      const q = cursor ? query(base, startAfter(cursor)) : base
      const snap = await getDocs(q)
      const items = []
      snap.forEach(d => items.push({ id: d.id, ...d.data() }))
      const lastDoc = snap.docs[snap.docs.length - 1] || null

      if (cursor) {
        commit('APPEND_REVIEWS', { candidateId, items, lastDoc })
      } else {
        commit('SET_CANDIDATE_REVIEWS', { candidateId, items, lastDoc })
      }

      return { items, lastDoc }
    },

    async fetchReviewByEmployer({ commit, rootGetters }, candidateId) {
      const employerId = rootGetters['auth/currentUser']?.uid
      if (!employerId) return null

      const q = query(
        collection(db, 'candidateReviews'),
        where('candidateId', '==', candidateId),
        where('employerId', '==', employerId),
        limit(1)
      )
      const snap = await getDocs(q)
      if (!snap.empty) {
        const d = snap.docs[0]
        const review = { id: d.id, ...d.data() }
        commit('SET_MY_REVIEW', { candidateId, review })
        return review
      }
      commit('SET_MY_REVIEW', { candidateId, review: null })
      return null
    },

    async createReview({ commit, dispatch, rootGetters }, { candidateId, rating, comment, jobId }) {
      const employerId = rootGetters['auth/currentUser']?.uid
      const employerCompany = rootGetters['auth/userProfile']?.company || ''
      if (!employerId) throw new Error('Not authenticated')

      const reviewData = {
        candidateId,
        employerId,
        employerCompany,
        rating,
        comment: (comment || '').trim().slice(0, 500),
        createdAt: serverTimestamp()
      }
      
      if (jobId) reviewData.jobId = jobId
      
      const docRef = await addDoc(collection(db, 'candidateReviews'), reviewData)
      await dispatch('fetchReviewByEmployer', candidateId)
      await dispatch('fetchReviewsByCandidate', { candidateId, pageSize: 10 })
      
      return docRef.id
    },

    async updateReview({ dispatch }, { reviewId, candidateId, rating, comment }) {
      await updateDoc(doc(db, 'candidateReviews', reviewId), {
        rating,
        comment: (comment || '').trim().slice(0, 500)
      })
      await dispatch('fetchReviewByEmployer', candidateId)
      await dispatch('fetchReviewsByCandidate', { candidateId, pageSize: 10 })
    },

    async deleteReview({ dispatch }, { reviewId, candidateId }) {
      await deleteDoc(doc(db, 'candidateReviews', reviewId))
      await dispatch('fetchReviewByEmployer', candidateId)
      await dispatch('fetchReviewsByCandidate', { candidateId, pageSize: 10 })
    }
  },
  
  getters: {
    allReviews: state => state.reviews,
    loading: state => state.loading,
    error: state => state.error,

    // Candidate review getters
    reviewsByCandidate: (state) => (candidateId) => state.reviewsByCandidateId[candidateId]?.items || [],
    reviewsPageCursor: (state) => (candidateId) => state.reviewsByCandidateId[candidateId]?.lastDoc || null,
    averageRating: (state) => (candidateId) => state.reviewsByCandidateId[candidateId]?.average || 0,
    reviewsCount: (state) => (candidateId) => state.reviewsByCandidateId[candidateId]?.totalCount || 0,
    myReviewForCandidate: (state) => (candidateId) => state.myReviewByCandidateId[candidateId] || null
  }
}
