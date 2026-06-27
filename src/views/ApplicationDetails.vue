<template>
  <div class="application-details-page">
    <div class="application-details-container">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <p>Loading application details...</p>
      </div>
      
      <!-- Application Not Found -->
      <div v-else-if="!application" class="error-state">
        <h2>Application Not Found</h2>
        <p>The application you're looking for doesn't exist or you don't have permission to view it.</p>
        <router-link to="/" class="btn btn-primary">Go Home</router-link>
      </div>
      
      <!-- Application Details -->
      <div v-else class="application-content">
        <!-- Header -->
        <div class="application-header">
          <div class="header-info">
            <h1>{{ application.jobTitle }}</h1>
            <p class="company">{{ application.company }}</p>
            <div class="application-meta">
              <div class="meta-item">
                <img src="../assets/location.svg" alt="Location" class="meta-icon" />
                <span>{{ capitalizeLocation(application.location) }}</span>
              </div>
              <div class="meta-item">
                <img src="../assets/salary.svg" alt="Salary" class="meta-icon" />
                <span>${{ application.salary }}</span>
              </div>
              <div class="meta-item">
                <span class="label">Applied:</span>
                <span>{{ formatDate(application.createdAt) }}</span>
              </div>
            </div>
          </div>
          <div class="header-actions">
            <span :class="['status-badge', application.status]">
              {{ application.status.charAt(0).toUpperCase() + application.status.slice(1) }}
            </span>
            <div v-if="isEmployer && application.status === 'pending'" class="action-buttons">
              <button @click="updateStatus('accepted')" class="btn btn-success">
                Accept Application
              </button>
              <button @click="updateStatus('rejected')" class="btn btn-danger">
                Reject Application
              </button>
            </div>
          </div>
        </div>

        <!-- Candidate Information -->
        <div class="candidate-section">
          <h2>Candidate Information</h2>
          <div class="candidate-info">
            <div class="info-item">
              <span class="label">Name:</span>
              <span>{{ application.candidateName }}</span>
            </div>
            <div class="info-item">
              <span class="label">Email:</span>
              <span>{{ application.candidateEmail }}</span>
            </div>
          </div>
        </div>

        <!-- Application Information -->
        <div class="application-section">
          <h2>Application Details</h2>
          
          <div class="info-section">
            <h3>Cover Letter</h3>
            <div class="content-box">
              <p>{{ application.coverLetter }}</p>
            </div>
          </div>
          
          <div class="info-section">
            <h3>Resume</h3>
            <div class="content-box">
              <p>{{ application.resume }}</p>
            </div>
          </div>
        </div>

        <!-- Job Information -->
        <div class="job-section">
          <h2>Job Information</h2>
          <div class="job-actions">
            <router-link :to="`/jobs/${application.jobId}`" class="btn btn-secondary">
              View Job Posting
            </router-link>
            <router-link to="/applications" class="btn btn-primary">
              Back to Applications
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useToast } from '../composables/useToast'

export default {
  name: 'ApplicationDetails',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const { showToast } = useToast()
    
    const application = ref(null)
    const loading = ref(true)

    const currentUser = computed(() => store.getters['auth/currentUser'])
    const userProfile = computed(() => store.getters['auth/userProfile'])
    const isEmployer = computed(() => userProfile.value?.role === 'employer')

    const fetchApplication = async () => {
      loading.value = true
      try {
        const applicationId = route.params.id
        
        // Fetch the application by ID
        application.value = await store.dispatch('applications/fetchApplicationById', applicationId)
        
        // Check permissions
        if (isEmployer.value) {
          // For employers, check if the application is for one of their jobs
          const employerJobs = await store.dispatch('jobs/fetchJobsByEmployer', currentUser.value.uid)
          const hasAccess = employerJobs.some(job => job.id === application.value.jobId)
          
          if (!hasAccess) {
            application.value = null
            console.error('Employer does not have access to this application')
          }
        } else {
          // For job seekers, check if they own this application
          if (application.value.userId !== currentUser.value.uid) {
            application.value = null
            console.error('Job seeker does not have access to this application')
          }
        }
        
      } catch (error) {
        console.error('Error fetching application:', error)
        application.value = null
      } finally {
        loading.value = false
      }
    }

    const updateStatus = async (status) => {
      try {
        await store.dispatch('applications/updateApplicationStatus', {
          applicationId: application.value.id,
          status
        })
        
        // Update the local state reactively
        application.value = {
          ...application.value,
          status: status
        }
        
        showToast(`Application ${status} successfully!`, 'success')
      } catch (error) {
        console.error('Error updating application status:', error)
        showToast(`Failed to update application status: ${error.message || 'Please try again.'}`, 'error')
      }
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    }
    
    const capitalizeLocation = (str) => {
      if (!str) return ''
      return str
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    }

    onMounted(() => {
      fetchApplication()
    })

    return {
      application,
      loading,
      isEmployer,
      updateStatus,
      formatDate,
      capitalizeLocation
    }
  }
}
</script>

<style scoped>
.application-details-page {
  min-height: calc(100vh - 70px);
  background: var(--bg-light);
  padding: 40px 20px;
}

.application-details-container {
  max-width: 1000px;
  margin: 0 auto;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  font-size: 1.1rem;
  color: var(--text-muted);
}

.error-state {
  text-align: center;
  padding: 60px 20px;
}

.error-state h2 {
  font-size: 2rem;
  color: var(--text);
  margin-bottom: 15px;
}

.error-state p {
  color: var(--text-muted);
  margin-bottom: 30px;
}

.application-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.application-header {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: start;
}

.dark-mode .application-header {
  background: var(--bg);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.header-info h1 {
  font-size: 2.5rem;
  color: var(--text);
  margin-bottom: 10px;
}

.company {
  font-size: 1.2rem;
  color: var(--text-muted);
  margin-bottom: 20px;
}

.application-meta {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
}

.meta-icon {
  width: 16px;
  height: 16px;
  opacity: 0.7;
}

.label {
  font-weight: 500;
  color: var(--text-muted);
}

.header-actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: flex-end;
}

.status-badge {
  padding: 10px 20px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge.pending {
  background: var(--warning);
  color: var(--text);
}

.dark-mode .status-badge.pending {
  color: #000;
}

.status-badge.accepted {
  background: var(--success);
  color: white;
}

.status-badge.rejected {
  background: var(--danger);
  color: white;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.candidate-section,
.application-section,
.job-section {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.dark-mode .candidate-section,
.dark-mode .application-section,
.dark-mode .job-section {
  background: var(--bg);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.candidate-section h2,
.application-section h2,
.job-section h2 {
  font-size: 1.8rem;
  color: var(--text);
  margin-bottom: 20px;
}

.candidate-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-item {
  display: flex;
  gap: 10px;
}

.info-section {
  margin-bottom: 25px;
}

.info-section:last-child {
  margin-bottom: 0;
}

.info-section h3 {
  font-size: 1.3rem;
  color: var(--text);
  margin-bottom: 15px;
}

.content-box {
  background: var(--bg-light);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid var(--border);
}

.dark-mode .content-box {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.content-box p {
  color: var(--text-muted);
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.job-actions {
  display: flex;
  gap: 15px;
}

.btn {
  padding: 12px 25px;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: oklch(0.3 0.1 245);
  transform: translateY(-2px);
}

.btn-secondary {
  background: var(--bg-light);
  color: var(--text);
  border: 2px solid var(--border);
}

.dark-mode .btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: var(--bg);
  border-color: var(--primary);
}

.dark-mode .btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--primary);
}

.btn-success {
  background: var(--success);
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: oklch(0.4 0.1 145);
  transform: translateY(-2px);
}

.btn-danger {
  background: var(--danger);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: oklch(0.4 0.1 15);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .application-header {
    flex-direction: column;
    gap: 20px;
  }
  
  .header-actions {
    align-items: stretch;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .application-meta {
    flex-direction: column;
    gap: 15px;
  }
  
  .job-actions {
    flex-direction: column;
  }
}
</style>
