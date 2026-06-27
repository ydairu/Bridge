<template>
  <div class="applications-page">
    <div class="applications-container">
      <div class="page-header">
        <div class="header-content">
          <div>
            <h1>My Applications</h1>
            <p class="header-subtitle">Track and manage your job applications</p>
          </div>
          <div class="applications-count">
            <span class="count-number">{{ filteredApplications.length }}</span>
            <span class="count-label">{{ filteredApplications.length === 1 ? 'Application' : 'Applications' }}</span>
          </div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button
          :class="['filter-tab', { active: activeFilter === 'all' }]"
          @click="activeFilter = 'all'"
        >
          All
          <span class="tab-count">{{ applications.length }}</span>
        </button>
        <button
          :class="['filter-tab', { active: activeFilter === 'pending' }]"
          @click="activeFilter = 'pending'"
        >
          Pending
          <span class="tab-count">{{ applications.filter(a => a.status === 'pending').length }}</span>
        </button>
        <button
          :class="['filter-tab', { active: activeFilter === 'accepted' }]"
          @click="activeFilter = 'accepted'"
        >
          Accepted
          <span class="tab-count">{{ applications.filter(a => a.status === 'accepted').length }}</span>
        </button>
        <button
          :class="['filter-tab', { active: activeFilter === 'rejected' }]"
          @click="activeFilter = 'rejected'"
        >
          Rejected
          <span class="tab-count">{{ applications.filter(a => a.status === 'rejected').length }}</span>
        </button>
      </div>

      <!-- Applications List -->
      <div v-if="filteredApplications.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <h3>No applications found</h3>
        <p>Start applying to jobs to see your applications here.</p>
        <router-link to="/jobs" class="btn-primary">Browse Jobs</router-link>
      </div>

      <div v-else class="applications-list">
        <div
          v-for="application in filteredApplications"
          :key="application.id"
          class="application-card"
        >
          <div class="card-wrapper">
            <div class="application-header">
              <div class="header-main">
                <div class="title-section">
                  <h3 class="job-title">{{ application.jobTitle || 'Job Title Not Available' }}</h3>
                  <p class="company">{{ application.company || 'Company Not Available' }}</p>
                </div>
                <span :class="['status-badge', application.status]">
                  {{ formatStatus(application.status) }}
                </span>
              </div>
            </div>
            
            <div class="application-meta">
              <div class="meta-item">
                <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span>{{ capitalizeLocation(application.location) }}</span>
              </div>
              <div class="meta-item">
                <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>${{ application.salary }}</span>
              </div>
              <div class="meta-item">
                <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Applied {{ formatDate(application.createdAt) }}</span>
              </div>
            </div>

            <!-- Application Preview -->
            <div class="application-preview" v-if="application.coverLetter">
              <div class="preview-header">
                <h4>Cover Letter</h4>
              </div>
              <p class="preview-text">
                {{ truncateText(application.coverLetter, 150) }}
              </p>
            </div>

            <div class="application-footer">
              <div class="footer-actions">
                <router-link :to="`/jobs/${application.jobId}`" class="btn-view-job">
                  <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  View Job
                </router-link>
                <router-link :to="`/applications/${application.id}`" class="btn-view-details">
                  View Details
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'

export default {
  name: 'Applications',
  setup() {
    const store = useStore()
    const route = useRoute()
    const activeFilter = ref('all')
    const applications = ref([])

    const currentUser = computed(() => store.getters['auth/currentUser'])

    const filteredApplications = computed(() => {
      if (activeFilter.value === 'all') {
        return applications.value
      }
      return applications.value.filter(app => app.status === activeFilter.value)
    })

    const formatDate = (dateString) => {
      if (!dateString) return 'Recently'
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) return 'Today'
      if (diffDays === 1) return 'Yesterday'
      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    const formatStatus = (status) => {
      if (!status) return 'Pending'
      return status.charAt(0).toUpperCase() + status.slice(1)
    }

    const truncateText = (text, maxLength) => {
      if (!text) return ''
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength).trim() + '...'
    }

    const capitalizeLocation = (str) => {
      if (!str) return ''
      return str.charAt(0).toUpperCase() + str.slice(1)
    }

    const fetchApplications = async () => {
      if (currentUser.value) {
        try {
          applications.value = await store.dispatch(
            'applications/fetchUserApplications',
            currentUser.value.uid
          )
          
          console.log('Fetched applications:', applications.value)
          console.log('First application:', applications.value[0])
          
          // If there are pending applications and we're on the default "all" filter,
          // switch to "pending" to highlight new applications
          if (activeFilter.value === 'all' && applications.value.some(app => app.status === 'pending')) {
            activeFilter.value = 'pending'
          }
        } catch (error) {
          console.error('Error fetching applications:', error)
        }
      }
    }

    onMounted(() => {
      fetchApplications()
    })

    // Watch for route changes to refresh applications
    watch(() => route.path, () => {
      fetchApplications()
    })

    return {
      activeFilter,
      applications,
      filteredApplications,
      formatDate,
      formatStatus,
      truncateText,
      capitalizeLocation
    }
  }
}
</script>

<style scoped>
.applications-page {
  min-height: calc(100vh - 70px);
  background: var(--bg-dark);
  padding: 40px 20px;
}

.applications-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.page-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  flex-wrap: wrap;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 8px 0;
}

.header-subtitle {
  font-size: 1.1rem;
  color: var(--text-muted);
  margin: 0;
}

.applications-count {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  padding: 16px 24px;
  background: var(--bg-light);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.count-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary);
  line-height: 1;
}

.count-label {
  font-size: 0.875rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: var(--bg-light);
  color: var(--text-muted);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.filter-tab:hover {
  border-color: var(--primary);
  color: var(--text);
}

.filter-tab.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
}

.filter-tab.active .tab-count {
  background: rgba(255, 255, 255, 0.25);
}

/* Empty State */
.empty-state {
  background: var(--bg-light);
  padding: 80px 40px;
  border-radius: 16px;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  color: var(--text-muted);
  opacity: 0.5;
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 12px 0;
}

.empty-state p {
  color: var(--text-muted);
  margin: 0 0 24px 0;
  font-size: 1rem;
}

.btn-primary {
  display: inline-block;
  padding: 12px 24px;
  background: var(--primary);
  color: white;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* Applications List */
.applications-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Application Card */
.application-card {
  display: flex;
  height: 100%;
  transition: all 0.3s ease;
}

.application-card:hover {
  /* Hover animation removed */
}

.card-wrapper {
  background: var(--bg-light);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.application-card:hover .card-wrapper {
  box-shadow: var(--shadow-md);
  border-color: rgba(0, 0, 0, 0.12);
}

/* Card Header */
.application-header {
  margin-bottom: 16px;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.title-section {
  flex: 1;
  min-width: 0;
}

.job-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 6px 0;
  line-height: 1.3;
}

.company {
  font-size: 1rem;
  color: var(--text-muted);
  margin: 0;
}

/* Status Badge */
.status-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  white-space: nowrap;
  flex-shrink: 0;
}

.status-badge.pending {
  background: oklch(0.9 0.02 100);
  color: var(--warning);
}

.status-badge.accepted {
  background: oklch(0.9 0.02 160);
  color: var(--success);
}

.status-badge.rejected {
  background: oklch(0.9 0.02 30);
  color: var(--danger);
}

/* Application Meta */
.application-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: var(--text-muted);
}

.meta-icon {
  width: 16px;
  height: 16px;
  opacity: 0.7;
}

/* Application Preview */
.application-preview {
  margin-bottom: 16px;
  flex: 1;
}

.preview-header {
  margin-bottom: 8px;
}

.preview-header h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}

.preview-text {
  font-size: 0.875rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Application Footer */
.application-footer {
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  margin-top: auto;
}

.footer-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.btn-view-job {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: var(--bg);
  color: var(--text);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
}

.btn-view-job:hover {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.btn-view-details {
  display: inline-block;
  padding: 10px 16px;
  background: transparent;
  color: var(--primary);
  border: 1px solid var(--primary);
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
}

.btn-view-details:hover {
  background: var(--primary);
  color: white;
}

/* Responsive Design */
@media (max-width: 768px) {
  .applications-page {
    padding: 24px 16px;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .header-content {
    flex-direction: column;
  }

  .applications-count {
    align-self: flex-start;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  .count-number {
    font-size: 1.5rem;
  }

  .filter-tabs {
    gap: 8px;
  }

  .filter-tab {
    flex: 1;
    min-width: 0;
    justify-content: center;
    padding: 10px 16px;
  }

  .card-wrapper {
    padding: 20px;
  }

  .header-main {
    flex-direction: column;
    gap: 12px;
  }

  .application-meta {
    flex-direction: column;
    gap: 12px;
  }

  .footer-actions {
    flex-direction: column;
    width: 100%;
  }

  .btn-view-job,
  .btn-view-details {
    width: 100%;
    justify-content: center;
  }
}
</style>

