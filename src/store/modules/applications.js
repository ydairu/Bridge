import { db } from '../../firebase/config'
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  updateDoc,
  doc,
  orderBy 
} from 'firebase/firestore'

export default {
  namespaced: true,
  
  state: {
    applications: [],
    loading: false,
    error: null
  },
  
  mutations: {
    SET_APPLICATIONS(state, applications) {
      state.applications = applications
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  
  actions: {
    async submitApplication({ commit }, applicationData) {
      commit('SET_LOADING', true)
      try {
        const docRef = await addDoc(collection(db, 'applications'), {
          ...applicationData,
          status: 'pending',
          createdAt: new Date().toISOString()
        })
        
        commit('SET_LOADING', false)
        return docRef.id
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    async fetchUserApplications({ commit }, userId) {
      commit('SET_LOADING', true)
      try {
        const jobsQuery = query(collection(db, 'jobs'))
        const jobsSnapshot = await getDocs(jobsQuery)
        console.log('📊 Total jobs in database:', jobsSnapshot.size)
        if (jobsSnapshot.size > 0) {
          console.log('Sample job:', jobsSnapshot.docs[0].id, jobsSnapshot.docs[0].data())
        }
        
        const q = query(
          collection(db, 'applications'),
          where('userId', '==', userId)
        )
        
        const querySnapshot = await getDocs(q)
        console.log('📊 Total applications for user:', querySnapshot.size)
        const applications = []
        
        for (const docSnapshot of querySnapshot.docs) {
          const applicationData = { id: docSnapshot.id, ...docSnapshot.data() }
          console.log('Processing application:', applicationData.id, 'jobId:', applicationData.jobId, 'userId:', applicationData.userId)
          
          let jobData = null
          let candidateData = null
          
          try {
            const jobDoc = await getDoc(doc(db, 'jobs', applicationData.jobId))
            if (jobDoc.exists()) {
              jobData = jobDoc.data()
              console.log('Job data found:', {
                id: applicationData.jobId,
                title: jobData.title,
                company: jobData.company,
                location: jobData.location,
                salary: jobData.salary
              })
            } else {
              console.log('❌ Job document not found for jobId:', applicationData.jobId)
            }
          } catch (jobError) {
            console.error('❌ Error fetching job details for application:', applicationData.id, jobError)
          }

          try {
            const candidateDoc = await getDoc(doc(db, 'users', applicationData.userId))
            if (candidateDoc.exists()) {
              candidateData = candidateDoc.data()
              console.log('Candidate data found:', {
                id: applicationData.userId,
                name: candidateData.name,
                email: candidateData.email
              })
            } else {
              console.log('❌ Candidate document not found for userId:', applicationData.userId)
            }
          } catch (candidateError) {
            console.error('❌ Error fetching candidate details for application:', applicationData.id, candidateError)
          }
          
          applications.push({
            ...applicationData,
            jobTitle: jobData?.title || 'Job Title Not Available',
            company: jobData?.company || 'Company Not Available',
            location: jobData?.location || 'Location Not Available',
            salary: jobData?.salary || 'Salary Not Available',
            candidateName: candidateData?.name || 'Unknown Candidate',
            candidateEmail: candidateData?.email || 'Email Not Available'
          })
        }

        applications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        
        commit('SET_APPLICATIONS', applications)
        commit('SET_LOADING', false)
        return applications
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    async fetchJobApplications({ commit }, jobId) {
      commit('SET_LOADING', true)
      try {
        const q = query(
          collection(db, 'applications'),
          where('jobId', '==', jobId)
        )
        
        const querySnapshot = await getDocs(q)
        const applications = []
        
        let jobData = null
        try {
          const jobDoc = await getDoc(doc(db, 'jobs', jobId))
          if (jobDoc.exists()) {
            jobData = jobDoc.data()
          }
        } catch (jobError) {
          console.error('Error fetching job details:', jobError)
        }
        
        for (const docSnapshot of querySnapshot.docs) {
          const applicationData = { id: docSnapshot.id, ...docSnapshot.data() }
          
          let candidateData = null
          
          try {
            const candidateDoc = await getDoc(doc(db, 'users', applicationData.userId))
            if (candidateDoc.exists()) {
              candidateData = candidateDoc.data()
            }
          } catch (candidateError) {
            console.error('Error fetching candidate details:', candidateError)
          }
          
          applications.push({
            ...applicationData,
            jobTitle: jobData?.title || 'Job Title Not Available',
            company: jobData?.company || 'Company Not Available',
            location: jobData?.location || 'Location Not Available',
            salary: jobData?.salary || 'Salary Not Available',
            candidateName: candidateData?.name || 'Unknown Candidate',
            candidateEmail: candidateData?.email || 'Email Not Available'
          })
        }
        
        applications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        
        commit('SET_APPLICATIONS', applications)
        commit('SET_LOADING', false)
        return applications
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    async fetchApplicationById({ commit }, applicationId) {
      commit('SET_LOADING', true)
      try {
        const applicationDoc = await getDoc(doc(db, 'applications', applicationId))
        if (!applicationDoc.exists()) {
          throw new Error('Application not found')
        }
        
        const applicationData = { id: applicationDoc.id, ...applicationDoc.data() }
        
        let jobData = null
        try {
          const jobDoc = await getDoc(doc(db, 'jobs', applicationData.jobId))
          if (jobDoc.exists()) {
            jobData = jobDoc.data()
          }
        } catch (jobError) {
          console.error('Error fetching job details:', jobError)
        }
        
        let candidateData = null
        try {
          const candidateDoc = await getDoc(doc(db, 'users', applicationData.userId))
          if (candidateDoc.exists()) {
            candidateData = candidateDoc.data()
          }
        } catch (candidateError) {
          console.error('Error fetching candidate details:', candidateError)
        }
        
        const fullApplication = {
          ...applicationData,
          jobTitle: jobData?.title || 'Job Title Not Available',
          company: jobData?.company || 'Company Not Available',
          location: jobData?.location || 'Location Not Available',
          salary: jobData?.salary || 'Salary Not Available',
          candidateName: candidateData?.name || 'Unknown Candidate',
          candidateEmail: candidateData?.email || 'Email Not Available'
        }
        
        commit('SET_LOADING', false)
        return fullApplication
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    async updateApplicationStatus({ commit }, { applicationId, status }) {
      commit('SET_LOADING', true)
      try {
        console.log('Updating application status:', { applicationId, status })
        await updateDoc(doc(db, 'applications', applicationId), {
          status,
          updatedAt: new Date().toISOString()
        })
        
        console.log('Application status updated successfully')
        commit('SET_LOADING', false)
      } catch (error) {
        console.error('Error updating application status:', error)
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    }
  },
  
  getters: {
    allApplications: state => state.applications,
    loading: state => state.loading
  }
}

