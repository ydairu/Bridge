<template>
  <div class="dashboard">
    <div class="dashboard-container">
      <!-- Header -->
      <div class="dashboard-header">
        <h1>Welcome back, {{ employerName }}!</h1>
        <p class="header-subtitle">
          Manage your job postings and connect with skilled migrant workers
        </p>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <StatCard
          label="Active Jobs"
          :value="activeJobsCount"
          icon-bg="bg-blue-50"
        >
          <template #icon>
            <Briefcase :size="20" :stroke-width="2" />
          </template>
        </StatCard>
        
        <StatCard
          label="Total Applications"
          :value="totalApplications"
          icon-bg="bg-green-50"
        >
          <template #icon>
            <FileCheck :size="20" :stroke-width="2" />
          </template>
        </StatCard>
        
        <StatCard
          label="Candidates Hired"
          :value="hiredCount"
          icon-bg="bg-purple-50"
        >
          <template #icon>
            <UserCheck :size="20" :stroke-width="2" />
          </template>
        </StatCard>
      </div>

      <!-- Main Content Grid -->
      <div class="main-content-grid">
        <!-- Left Column - Job Postings -->
        <div class="job-postings-column">
          <div class="section-header">
            <h2>Your Job Postings</h2>
            <router-link to="/employer/post-job" class="btn btn-primary">
              <svg style="width: 16px; height: 16px; margin-right: 8px; display: inline-block; vertical-align: middle;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
              </svg>
              Post New Job
            </router-link>
          </div>

          <div v-if="loading" class="loading-state">
            <p>Loading your jobs...</p>
          </div>

          <div v-else-if="employerJobs.length === 0" class="empty-state">
            <p>You haven't posted any jobs yet.</p>
            <router-link to="/employer/post-job" class="btn btn-primary">Post Your First Job</router-link>
          </div>

          <Tabs
            v-else
            v-model="activeTab"
            :tabs="jobTabs"
            class="job-tabs"
          >
            <div class="tabs-content-wrapper">
              <div v-if="activeTab === 'all'" class="tab-pane">
                <div class="jobs-list">
                  <JobPostingCard
                    v-for="job in filteredJobs"
                    :key="job.id"
                    :job="job"
                    @edit="editJob"
                    @delete="deleteJob"
                  />
                </div>
              </div>
              
              <div v-if="activeTab === 'active'" class="tab-pane">
                <div class="jobs-list">
                  <JobPostingCard
                    v-for="job in activeJobs"
                    :key="job.id"
                    :job="job"
                    @edit="editJob"
                    @delete="deleteJob"
                  />
                </div>
              </div>
              
              <div v-if="activeTab === 'draft'" class="tab-pane">
                <div v-if="draftJobs.length === 0" class="empty-tab">
                  <p>No draft jobs</p>
                </div>
                <div v-else class="jobs-list">
                  <JobPostingCard
                    v-for="job in draftJobs"
                    :key="job.id"
                    :job="job"
                    @edit="editJob"
                    @delete="deleteJob"
                  />
                </div>
              </div>
              
              <div v-if="activeTab === 'expired'" class="tab-pane">
                <div v-if="expiredJobs.length === 0" class="empty-tab">
                  <p>No expired jobs</p>
                </div>
                <div v-else class="jobs-list">
                  <JobPostingCard
                    v-for="job in expiredJobs"
                    :key="job.id"
                    :job="job"
                    @edit="editJob"
                    @delete="deleteJob"
                  />
                </div>
              </div>
            </div>
          </Tabs>
        </div>

        <!-- Right Column - Recent Applications -->
        <div class="sidebar-column">
          <!-- Recent Applications -->
          <div class="sidebar-section">
            <h2>Recent Applications</h2>
            <div v-if="loadingApplications" class="loading-state-small">
              <p>Loading applications...</p>
            </div>
            <div v-else-if="recentApplications.length === 0" class="empty-state-small">
              <p>No applications yet.</p>
              <p class="empty-subtitle">Applications will appear here when candidates apply to your jobs.</p>
            </div>
            <div v-else class="card applications-card">
              <div class="applications-list">
                <ApplicationItem
                  v-for="application in recentApplications"
                  :key="application.id"
                  :application="application"
                />
              </div>
              <router-link to="/employer/applications" class="btn btn-outline full-width">
                View All Applications
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Dialog for Delete -->
    <ConfirmationDialog
      :show="showDeleteDialog"
      title="Delete Job"
      message="Are you sure you want to delete this job? This action cannot be undone."
      confirm-text="Delete"
      cancel-text="Cancel"
      @confirm="handleDeleteConfirm"
      @cancel="handleDeleteCancel"
      @update:show="showDeleteDialog = $event"
    />
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useToast } from '../composables/useToast'
import { Briefcase, FileCheck, UserCheck } from 'lucide-vue-next'
import StatCard from '../components/StatCard.vue'
import JobPostingCard from '../components/JobPostingCard.vue'
import ApplicationItem from '../components/ApplicationItem.vue'
import Tabs from '../components/Tabs.vue'
import ConfirmationDialog from '../components/ConfirmationDialog.vue'

export default {
  name: 'EmployerDashboard',
  components: {
    StatCard,
    JobPostingCard,
    ApplicationItem,
    Tabs,
    ConfirmationDialog,
    Briefcase,
    FileCheck,
    UserCheck
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const { showToast } = useToast()
    
    const employerJobs = ref([])
    const recentApplications = ref([])
    const allApplications = ref([])
    const loading = ref(false)
    const loadingApplications = ref(false)
    const activeTab = ref('all')
    const showDeleteDialog = ref(false)
    const jobToDelete = ref(null)

    const userProfile = computed(() => store.getters['auth/userProfile'])
    const currentUser = computed(() => store.getters['auth/currentUser'])
    
    // Employer name for greeting
    const employerName = computed(() => {
      return userProfile.value?.name || 'Employer'
    })
    
    // Stats calculations
    const totalApplications = computed(() => allApplications.value.length)

    const uniqueCandidates = computed(() => {
      const uniqueCandidateIds = new Set(allApplications.value.map(app => app.candidateId))
      return uniqueCandidateIds.size
    })

    const hiredCount = computed(() => {
      return allApplications.value.filter(app => app.status === 'accepted').length
    })

    const activeJobsCount = computed(() => {
      return employerJobs.value.filter(job => job.status === 'active').length
    })

    // Job filtering
    const filteredJobs = computed(() => employerJobs.value)

    const activeJobs = computed(() => {
      return employerJobs.value.filter(job => job.status === 'active')
    })

    const draftJobs = computed(() => {
      return employerJobs.value.filter(job => job.status === 'draft')
    })

    const expiredJobs = computed(() => {
      return employerJobs.value.filter(job => job.status === 'expired')
    })

    // Tabs configuration
    const jobTabs = computed(() => [
      { value: 'all', label: `All Jobs (${employerJobs.value.length})` },
      { value: 'active', label: `Active (${activeJobs.value.length})` },
      { value: 'draft', label: `Draft (${draftJobs.value.length})` },
      { value: 'expired', label: `Expired (${expiredJobs.value.length})` }
    ])

    // Stats changes (placeholder - you can calculate these based on historical data)
    const statsChange = ref({
      activeJobs: 0, // Calculate from historical data
      totalApplications: 0,
      candidatesHired: 0
    })

    const fetchEmployerJobs = async () => {
      if (!currentUser.value) {
        console.log('No current user found')
        return
      }
      
      console.log('Fetching jobs for employer:', currentUser.value.uid)
      loading.value = true
      try {
        await store.dispatch('jobs/fetchJobsByEmployer', currentUser.value.uid)
        employerJobs.value = store.getters['jobs/allJobs']
        console.log('Fetched jobs:', employerJobs.value)
      } catch (error) {
        console.error('Error fetching employer jobs:', error)
      } finally {
        loading.value = false
      }
    }

    const fetchRecentApplications = async () => {
      if (!currentUser.value || employerJobs.value.length === 0) {
        return
      }
      
      loadingApplications.value = true
      try {
        // Get all applications for the employer's jobs
        const fetchedApplications = []
        
        for (const job of employerJobs.value) {
          try {
            const jobApplications = await store.dispatch('applications/fetchJobApplications', job.id)
            fetchedApplications.push(...jobApplications)
          } catch (error) {
            console.error('Error fetching applications for job:', job.id, error)
          }
        }
        
        // Sort by creation date
        fetchedApplications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        
        // Store all applications for total count
        allApplications.value = fetchedApplications
        
        // Take the most recent 5 for display
        recentApplications.value = fetchedApplications.slice(0, 5)
        
        console.log('Fetched all applications:', allApplications.value.length)
        console.log('Recent applications:', recentApplications.value.length)
      } catch (error) {
        console.error('Error fetching recent applications:', error)
      } finally {
        loadingApplications.value = false
      }
    }

    const editJob = (jobId) => {
      router.push({ 
        path: '/employer/post-job', 
        query: { jobId } 
      })
    }

    const deleteJob = (jobId) => {
      jobToDelete.value = jobId
      showDeleteDialog.value = true
    }

    const handleDeleteConfirm = async () => {
      if (!jobToDelete.value) return
      
      try {
        await store.dispatch('jobs/deleteJob', jobToDelete.value)
        showToast('Job deleted successfully', 'success')
        // Refresh the jobs list
        await fetchEmployerJobs()
        // Also refresh applications since deleting a job affects applications
        await fetchRecentApplications()
      } catch (error) {
        console.error('Error deleting job:', error)
        showToast('Failed to delete job. Please try again.', 'error')
      } finally {
        jobToDelete.value = null
        showDeleteDialog.value = false
      }
    }

    const handleDeleteCancel = () => {
      jobToDelete.value = null
      showDeleteDialog.value = false
    }

    onMounted(async () => {
      await fetchEmployerJobs()
      // Fetch applications after jobs are loaded
      await fetchRecentApplications()
      
      // Set up auto-refresh every 30 seconds
      setInterval(async () => {
        await fetchRecentApplications()
      }, 30000)
    })

    return {
      userProfile,
      employerName,
      employerJobs,
      recentApplications,
      allApplications,
      totalApplications,
      uniqueCandidates,
      hiredCount,
      activeJobsCount,
      loading,
      loadingApplications,
      activeTab,
      jobTabs,
      filteredJobs,
      activeJobs,
      draftJobs,
      expiredJobs,
      statsChange,
      editJob,
      deleteJob,
      showDeleteDialog,
      handleDeleteConfirm,
      handleDeleteCancel
    }
  }
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: var(--bg-dark);
  padding: 32px 0;
}

.dashboard-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 16px;
}

/* Header */
.dashboard-header {
  margin-bottom: 32px;
}

.dashboard-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 8px;
}

.header-subtitle {
  font-size: 1rem;
  color: var(--text-muted);
  margin: 0;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

@media (min-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Main Content Grid */
.main-content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 1024px) {
  .main-content-grid {
    grid-template-columns: 2fr 1fr;
  }
}

/* Job Postings Column */
.job-postings-column {
  min-width: 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

/* Tabs */
.job-tabs {
  width: 100%;
}

.tabs-content-wrapper {
  margin-top: 0;
}

.tab-pane {
  width: 100%;
}

.jobs-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-tab {
  text-align: center;
  color: var(--text-muted);
  padding: 48px 20px;
  background: var(--bg);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.dark-mode .empty-tab {
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.empty-tab p {
  margin: 0;
}

/* Sidebar Column */
.sidebar-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sidebar-section {
  width: 100%;
}

.sidebar-section h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 16px;
}

.applications-card {
  padding: 16px;
}

.applications-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: 16px;
}

.full-width {
  width: 100%;
  display: block;
  text-align: center;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
}

.btn-outline:hover {
  background: var(--bg-light);
}

/* Loading and Empty States */
.loading-state {
  background: var(--bg);
  padding: 60px 20px;
  border-radius: 12px;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.dark-mode .loading-state {
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.loading-state p {
  color: var(--text-muted);
  margin: 0;
}

.loading-state-small {
  padding: 20px;
  text-align: center;
}

.loading-state-small p {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin: 0;
}

.empty-state {
  background: var(--bg);
  padding: 60px 20px;
  border-radius: 12px;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.dark-mode .empty-state {
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.empty-state p {
  color: var(--text-muted);
  margin-bottom: 20px;
}

.empty-state-small {
  padding: 20px;
  text-align: center;
}

.empty-state-small p {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin: 0;
}

.empty-subtitle {
  margin-top: 8px;
  font-size: 0.75rem;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .dashboard {
    padding: 20px 0;
  }
  
  .dashboard-container {
    padding: 0 16px;
  }
  
  .dashboard-header h1 {
    font-size: 1.5rem;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .section-header h2 {
    font-size: 1.25rem;
  }
}
</style>