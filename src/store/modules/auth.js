import { auth, db } from '../../firebase/config'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'

export default {
  namespaced: true,
  
  state: {
    user: null,
    userProfile: null,
    loading: false,
    error: null
  },
  
  mutations: {
    SET_USER(state, user) {
      state.user = user
    },
    SET_USER_PROFILE(state, profile) {
      state.userProfile = profile
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  
  actions: {
    async login({ commit }, { email, password }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        commit('SET_USER', userCredential.user)
        
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid))
        if (userDoc.exists()) {
          commit('SET_USER_PROFILE', userDoc.data())
        }
        
        commit('SET_LOADING', false)
        return userCredential.user
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    async register({ commit }, { email, password, userData }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          ...userData,
          email,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        
        commit('SET_USER', userCredential.user)
        commit('SET_USER_PROFILE', userData)
        commit('SET_LOADING', false)
        return userCredential.user
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    async logout({ commit }) {
      try {
        await signOut(auth)
        commit('SET_USER', null)
        commit('SET_USER_PROFILE', null)
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },
    
    async fetchUserProfile({ commit }, userId) {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId))
        if (userDoc.exists()) {
          commit('SET_USER_PROFILE', userDoc.data())
          return userDoc.data()
        }
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },
    
    async updateProfile({ commit, state }, updatedData) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      try {
        const userId = state.user.uid
        await updateDoc(doc(db, 'users', userId), {
          ...updatedData,
          updatedAt: new Date().toISOString()
        })
        
        commit('SET_USER_PROFILE', {
          ...state.userProfile,
          ...updatedData
        })
        
        commit('SET_LOADING', false)
        return true
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    async uploadProfilePicture({ commit, state }, file) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      try {
        const userId = state.user.uid

        const base64Image = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        
        await updateDoc(doc(db, 'users', userId), {
          photoURL: base64Image,
          updatedAt: new Date().toISOString()
        })
        
        commit('SET_USER_PROFILE', {
          ...state.userProfile,
          photoURL: base64Image
        })
        
        commit('SET_LOADING', false)
        return base64Image
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    async removeProfilePicture({ commit, state }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      try {
        const userId = state.user.uid
        
        await updateDoc(doc(db, 'users', userId), {
          photoURL: null,
          updatedAt: new Date().toISOString()
        })
        
        commit('SET_USER_PROFILE', {
          ...state.userProfile,
          photoURL: null
        })
        
        commit('SET_LOADING', false)
        return true
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    async uploadCompanyLogo({ commit, state }, file) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      try {
        const userId = state.user.uid
        
        const base64Image = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        
        await updateDoc(doc(db, 'users', userId), {
          companyLogo: base64Image,
          updatedAt: new Date().toISOString()
        })
        
        commit('SET_USER_PROFILE', {
          ...state.userProfile,
          companyLogo: base64Image
        })
        
        commit('SET_LOADING', false)
        return base64Image
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    async removeCompanyLogo({ commit, state }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      try {
        const userId = state.user.uid
        
        await updateDoc(doc(db, 'users', userId), {
          companyLogo: null,
          updatedAt: new Date().toISOString()
        })
        
        commit('SET_USER_PROFILE', {
          ...state.userProfile,
          companyLogo: null
        })
        
        commit('SET_LOADING', false)
        return true
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    initAuthListener({ commit, dispatch }) {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          commit('SET_USER', user)
          await dispatch('fetchUserProfile', user.uid)
        } else {
          commit('SET_USER', null)
          commit('SET_USER_PROFILE', null)
        }
      })
    }
  },
  
  getters: {
    isAuthenticated: state => !!state.user,
    currentUser: state => state.user,
    userProfile: state => state.userProfile,
    isEmployer: state => state.userProfile?.role === 'employer',
    isJobSeeker: state => state.userProfile?.role === 'jobseeker',
    loading: state => state.loading,
    error: state => state.error
  }
}

