import { db } from '../../firebase/config'
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  updateDoc,
  deleteDoc 
} from 'firebase/firestore'

export default {
  namespaced: true,
  
  state: {
    jobs: [],
    currentJob: null,
    loading: false,
    error: null
  },
  
  mutations: {
    SET_JOBS(state, jobs) {
      state.jobs = jobs
    },
    SET_CURRENT_JOB(state, job) {
      state.currentJob = job
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  
  actions: {
    async fetchJobs({ commit }, filters = {}) {
      commit('SET_LOADING', true)
      try {
        let q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'))
        
        // Apply filters if provided
        if (filters.category) {
          q = query(q, where('category', '==', filters.category))
        }
        if (filters.location) {
          q = query(q, where('location', '==', filters.location))
        }
        
        const querySnapshot = await getDocs(q)
        const jobs = []
        
        // First pass: collect all jobs and identify which need employer profile enrichment
        const jobsNeedingEnrichment = []
        const employerIdsToFetch = new Set()
        
        for (const docSnapshot of querySnapshot.docs) {
          const jobData = { id: docSnapshot.id, ...docSnapshot.data() }
          
          // Collect employer IDs that need to be fetched
          if (jobData.employerId && (!jobData.companyLogo || !jobData.companyDescription)) {
            employerIdsToFetch.add(jobData.employerId)
            jobsNeedingEnrichment.push(jobData)
          }
          
          jobs.push(jobData)
        }
        
        // Batch fetch all employer profiles in parallel (much faster!)
        if (employerIdsToFetch.size > 0) {
          const employerProfiles = {}
          const fetchPromises = Array.from(employerIdsToFetch).map(async (employerId) => {
            try {
              const employerDoc = await getDoc(doc(db, 'users', employerId))
              if (employerDoc.exists()) {
                employerProfiles[employerId] = employerDoc.data()
              }
            } catch (err) {
              // Silently fail - job will display without company logo/description
              console.warn('Could not fetch employer profile:', employerId, err.message)
            }
          })
          
          // Wait for all employer profile fetches to complete
          await Promise.all(fetchPromises)
          
          // Enrich jobs with employer profile data
          jobsNeedingEnrichment.forEach((jobData) => {
            const employerData = employerProfiles[jobData.employerId]
            if (employerData) {
              if (!jobData.companyLogo && employerData.companyLogo) {
                jobData.companyLogo = employerData.companyLogo
              }
              if (!jobData.companyDescription && employerData.companyDescription) {
                jobData.companyDescription = employerData.companyDescription
              }
            }
          })
        }
        
        commit('SET_JOBS', jobs)
        commit('SET_LOADING', false)
        return jobs
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },

    async fetchJobsByEmployer({ commit }, employerId) {
      commit('SET_LOADING', true)
      try {
        const q = query(
          collection(db, 'jobs'), 
          where('employerId', '==', employerId)
        )
        
        const querySnapshot = await getDocs(q)
        const jobs = []
        
        // Fetch employer profile once for all jobs
        let employerProfile = null
        try {
          const employerDoc = await getDoc(doc(db, 'users', employerId))
          if (employerDoc.exists()) {
            employerProfile = employerDoc.data()
          }
        } catch (err) {
          console.warn('Could not fetch employer profile:', err.message)
        }
        
        querySnapshot.forEach((docSnapshot) => {
          const jobData = { id: docSnapshot.id, ...docSnapshot.data() }
          
          // Enrich with company logo and description from employer profile if missing
          if (!jobData.companyLogo && employerProfile?.companyLogo) {
            jobData.companyLogo = employerProfile.companyLogo
          }
          if (!jobData.companyDescription && employerProfile?.companyDescription) {
            jobData.companyDescription = employerProfile.companyDescription
          }
          
          jobs.push(jobData)
        })
        
        // Sort by createdAt in JavaScript since we can't use orderBy in the query
        jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        
        commit('SET_JOBS', jobs)
        commit('SET_LOADING', false)
        return jobs
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    async fetchJobById({ commit }, jobId) {
      commit('SET_LOADING', true)
      try {
        const jobDoc = await getDoc(doc(db, 'jobs', jobId))
        if (jobDoc.exists()) {
          const job = { id: jobDoc.id, ...jobDoc.data() }
          
          // If job doesn't have companyLogo or companyDescription but has employerId, fetch from employer profile
          // Note: This is a single job fetch, so sequential is fine, but we keep it optimized
          if (job.employerId && (!job.companyLogo || !job.companyDescription)) {
            try {
              const employerDoc = await getDoc(doc(db, 'users', job.employerId))
              if (employerDoc.exists()) {
                const employerData = employerDoc.data()
                if (!job.companyLogo && employerData.companyLogo) {
                  job.companyLogo = employerData.companyLogo
                }
                if (!job.companyDescription && employerData.companyDescription) {
                  job.companyDescription = employerData.companyDescription
                }
              }
            } catch (err) {
              // Silently fail - job will display without company logo/description
              console.warn('Could not fetch employer profile for job:', jobId, err.message)
            }
          }
          
          commit('SET_CURRENT_JOB', job)
          commit('SET_LOADING', false)
          return job
        }
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    async createJob({ commit }, jobData) {
      commit('SET_LOADING', true)
      try {
        const docRef = await addDoc(collection(db, 'jobs'), {
          ...jobData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'active'
        })
        commit('SET_LOADING', false)
        return docRef.id
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    async updateJob({ commit }, { jobId, jobData }) {
      commit('SET_LOADING', true)
      try {
        await updateDoc(doc(db, 'jobs', jobId), {
          ...jobData,
          updatedAt: new Date().toISOString()
        })
        commit('SET_LOADING', false)
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    },
    
    async deleteJob({ commit }, jobId) {
      commit('SET_LOADING', true)
      try {
        await deleteDoc(doc(db, 'jobs', jobId))
        commit('SET_LOADING', false)
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('SET_LOADING', false)
        throw error
      }
    }
  },
  
  getters: {
    allJobs: state => state.jobs,
    currentJob: state => state.currentJob,
    loading: state => state.loading,
    error: state => state.error
  }
}

