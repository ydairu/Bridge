<template>
  <div class="all-applications-page">
    <section class="applications-section">
      <div class="container">
        <div class="applications-layout">
          <!-- Main Content -->
          <div class="applications-main-content">
            <!-- Header with Search -->
            <div class="applications-header-section">
              <div class="applications-header-left">
                <h2>All Applications</h2>
                <p class="applications-count">{{ filteredApplications.length }} {{ filteredApplications.length === 1 ? 'application' : 'applications' }} available</p>
              </div>
              <div class="header-middle">
                <div class="search-bar-wrapper">
                  <img src="/icons/search.svg" alt="Search" class="search-icon" />
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search by candidate name or job title..."
                    class="search-input"
                    @input="applyFilters"
                  />
                </div>
              </div>
            </div>

            <!-- Filter Tabs -->
            <div class="filter-tabs-wrapper">
              <button
                :class="['filter-tab', { active: activeFilter === 'all' }]"
                @click="activeFilter = 'all'"
              >
                All
              </button>
              <button
                :class="['filter-tab', { active: activeFilter === 'pending' }]"
                @click="activeFilter = 'pending'"
              >
                Pending
              </button>
              <button
                :class="['filter-tab', { active: activeFilter === 'accepted' }]"
                @click="activeFilter = 'accepted'"
              >
                Accepted
              </button>
              <button
                :class="['filter-tab', { active: activeFilter === 'rejected' }]"
                @click="activeFilter = 'rejected'"
              >
                Rejected
              </button>
              <button @click="refreshApplications" class="btn-refresh" :disabled="loading">
                {{ loading ? 'Refreshing...' : 'Refresh' }}
              </button>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="applications-grid">
              <div v-for="n in 6" :key="n" class="application-skeleton">
                <div class="skeleton-header">
                  <div class="skeleton-line skeleton-title"></div>
                  <div class="skeleton-line skeleton-subtitle"></div>
                </div>
                <div class="skeleton-content">
                  <div class="skeleton-line skeleton-text"></div>
                  <div class="skeleton-line skeleton-text"></div>
                </div>
              </div>
            </div>

            <!-- No Results -->
            <div v-else-if="filteredApplications.length === 0" class="no-results">
              <p>No applications found.</p>
              <p class="empty-subtitle">Applications will appear here when candidates apply to your jobs.</p>
              <router-link to="/employer/post-job" class="btn btn-primary">Post a Job</router-link>
            </div>

            <!-- Applications Grid -->
            <div v-else class="applications-grid">
              <div
                v-for="application in paginatedApplications"
                :key="application.id"
                class="application-card"
              >
                <div class="application-card-wrapper">
                  <div class="application-card-header">
                    <div class="application-title-section">
                      <h3 class="application-title">{{ application.jobTitle }}</h3>
                      <p class="candidate-name">{{ application.candidateName }}</p>
                    </div>
                    <span :class="['status-badge', application.status]">
                      {{ application.status.charAt(0).toUpperCase() + application.status.slice(1) }}
                    </span>
                  </div>

                  <div class="application-details">
                    <div class="detail-item">
                      <svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      <span>{{ capitalizeLocation(application.location) }}</span>
                    </div>
                    <div class="detail-item">
                      <svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <span>${{ application.salary }}</span>
                    </div>
                    <div class="detail-item">
                      <svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <span>Applied {{ formatDate(application.createdAt) }}</span>
                    </div>
                  </div>

                  <div class="application-preview">
                    <p class="application-text">
                      {{ application.coverLetter.substring(0, 120) }}{{ application.coverLetter.length > 120 ? '...' : '' }}
                    </p>
                  </div>

                  <div class="application-footer">
                    <div class="application-actions">
                      <router-link :to="`/applications/${application.id}`" class="view-details-btn">
                        View Details
                      </router-link>
                      <div v-if="application.status === 'pending'" class="status-actions">
                        <button @click="updateApplicationStatus(application.id, 'accepted')" class="btn-action btn-accept">
                          Accept
                        </button>
                        <button @click="updateApplicationStatus(application.id, 'rejected')" class="btn-action btn-reject">
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="pagination">
              <button 
                @click="currentPage = Math.max(1, currentPage - 1)"
                :disabled="currentPage === 1"
                class="btn btn-secondary"
              >
                Previous
              </button>
              <span class="page-info">
                Page {{ currentPage }} of {{ totalPages }}
              </span>
              <button 
                @click="currentPage = Math.min(totalPages, currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="btn btn-secondary"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useToast } from '../composables/useToast'

export default {
  name: 'AllApplications',
  setup() {
    const store = useStore()
    const { showToast } = useToast()
    
    const applications = ref([])
    const loading = ref(false)
    const activeFilter = ref('all')
    const searchQuery = ref('')
    const currentPage = ref(1)
    const itemsPerPage = 10

    const currentUser = computed(() => store.getters['auth/currentUser'])

    const filteredApplications = computed(() => {
      let filtered = applications.value

      // Filter by status
      if (activeFilter.value !== 'all') {
        filtered = filtered.filter(app => app.status === activeFilter.value)
      }

      // Filter by search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(app => 
          app.candidateName.toLowerCase().includes(query) ||
          app.jobTitle.toLowerCase().includes(query) ||
          app.company.toLowerCase().includes(query)
        )
      }

      return filtered
    })

    const paginatedApplications = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return filteredApplications.value.slice(start, end)
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredApplications.value.length / itemsPerPage)
    })

    const fetchAllApplications = async () => {
      if (!currentUser.value) return
      
      loading.value = true
      try {
        // Get all jobs for the employer
        const employerJobs = await store.dispatch('jobs/fetchJobsByEmployer', currentUser.value.uid)
        
        // Get all applications for these jobs
        const allApplications = []
        
        for (const job of employerJobs) {
          try {
            const jobApplications = await store.dispatch('applications/fetchJobApplications', job.id)
            allApplications.push(...jobApplications)
          } catch (error) {
            console.error('Error fetching applications for job:', job.id, error)
          }
        }
        
        // Sort by creation date (newest first)
        allApplications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        applications.value = allApplications
        
        console.log('Fetched all applications:', applications.value.length)
      } catch (error) {
        console.error('Error fetching applications:', error)
      } finally {
        loading.value = false
      }
    }

    const updateApplicationStatus = async (applicationId, status) => {
      try {
        await store.dispatch('applications/updateApplicationStatus', {
          applicationId,
          status
        })
        
        // Update the local state reactively
        const index = applications.value.findIndex(app => app.id === applicationId)
        if (index !== -1) {
          // Create a new object to ensure reactivity
          applications.value[index] = {
            ...applications.value[index],
            status: status
          }
        }
        
        showToast(`Application ${status} successfully!`, 'success')
        
        // Refresh the applications list to ensure consistency
        // Small delay to let Firestore sync
        setTimeout(() => {
          fetchAllApplications()
        }, 500)
      } catch (error) {
        console.error('Error updating application status:', error)
        showToast(`Failed to update application status: ${error.message || 'Please try again.'}`, 'error')
      }
    }

    const refreshApplications = async () => {
      await fetchAllApplications()
    }

    const applyFilters = async () => {
      // Filtering is handled by computed properties
      // This method is just a placeholder for consistency with BrowseJobs
    }

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
      return date.toLocaleDateString()
    }

    const capitalizeLocation = (str) => {
      if (!str) return ''
      return str.charAt(0).toUpperCase() + str.slice(1)
    }

    // Reset to first page when filter changes
    watch(activeFilter, () => {
      currentPage.value = 1
    })

    watch(searchQuery, () => {
      currentPage.value = 1
    })

    onMounted(() => {
      fetchAllApplications()
    })

    return {
      applications,
      loading,
      activeFilter,
      searchQuery,
      currentPage,
      filteredApplications,
      paginatedApplications,
      totalPages,
      updateApplicationStatus,
      refreshApplications,
      applyFilters,
      formatDate,
      capitalizeLocation
    }
  }
}
</script>

<style scoped>
.all-applications-page {
  min-height: 100vh;
  background: var(--bg);
}

.applications-section {
  padding: 60px 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.applications-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  align-items: start;
}

.applications-main-content {
  width: 100%;
  min-width: 0;
}

/* Header Section */
.applications-header-section {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.applications-header-left h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 4px 0;
}

.applications-count {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
}

.header-middle {
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 500px;
  margin: 0 auto;
}

.search-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-light);
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 10px 16px;
  width: 100%;
  max-width: 500px;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.search-bar-wrapper:focus-within {
  border-color: var(--primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-icon {
  width: 18px;
  height: 18px;
  opacity: 0.6;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  min-width: 0;
  padding: 0;
  border: none;
  border-radius: 0;
  font-size: 1rem;
  background: transparent;
  color: var(--text);
  outline: none;
}

.search-input::placeholder {
  color: var(--text-muted);
}

/* Filter Tabs */
.filter-tabs-wrapper {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-tab {
  padding: 10px 20px;
  border: 1px solid var(--border);
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

.btn-refresh {
  margin-left: auto;
  padding: 10px 20px;
  border: 1px solid var(--border);
  background: var(--bg-light);
  color: var(--text);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.btn-refresh:hover:not(:disabled) {
  border-color: var(--primary);
  background: var(--primary);
  color: white;
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Applications Grid */
.applications-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

/* Application Card */
.application-card {
  display: flex;
  height: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.application-card:hover {
  /* Hover animation removed */
}

.application-card-wrapper {
  background: var(--bg-light);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 20px;
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.3s ease;
}

.application-card:hover .application-card-wrapper {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-color: rgba(0, 0, 0, 0.12);
}

/* Card Header */
.application-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.application-title-section {
  flex: 1;
  min-width: 0;
}

.application-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 4px 0;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.candidate-name {
  font-size: 0.875rem;
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

/* Application Details */
.application-details {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.icon-xs {
  width: 14px;
  height: 14px;
}

/* Application Preview */
.application-preview {
  margin-bottom: 12px;
  flex: 1;
}

.application-text {
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  margin-top: auto;
}

.application-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 8px;
  flex-wrap: wrap;
}

.view-details-btn {
  background: var(--bg-light);
  color: var(--text);
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.application-card:hover .view-details-btn {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.dark-mode .view-details-btn {
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.status-actions {
  display: flex;
  gap: 8px;
}

.btn-action {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid;
  white-space: nowrap;
}

.btn-accept {
  background: transparent;
  color: var(--success);
  border-color: var(--success);
}

.btn-accept:hover {
  background: var(--success);
  color: white;
}

.btn-reject {
  background: transparent;
  color: var(--danger);
  border-color: var(--danger);
}

.btn-reject:hover {
  background: var(--danger);
  color: white;
}

/* Loading State */
.applications-grid .loading-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
  font-size: 1.1rem;
}

/* Skeleton Loading */
.application-skeleton {
  background: var(--bg-light);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 20px;
}

.skeleton-header {
  margin-bottom: 12px;
}

.skeleton-line {
  background: linear-gradient(90deg, var(--bg-light) 25%, var(--bg) 50%, var(--bg-light) 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
  height: 12px;
  margin-bottom: 8px;
}

.skeleton-title {
  width: 70%;
  height: 20px;
}

.skeleton-subtitle {
  width: 50%;
  height: 16px;
}

.skeleton-text {
  width: 100%;
  height: 12px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.skeleton-content {
  margin-top: 12px;
}

/* No Results */
.no-results {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
  font-size: 1.1rem;
  background: var(--bg-light);
  border-radius: 12px;
  border: 1px solid var(--border);
}

.empty-subtitle {
  font-size: 0.95rem;
  margin-top: 10px;
  margin-bottom: 20px;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 40px;
  padding: 20px 0;
}

.page-info {
  color: var(--text-muted);
  font-weight: 500;
}

/* Responsive Design */
@media (min-width: 1280px) {
  .applications-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1024px) {
  .applications-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .applications-header-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-middle {
    width: 100%;
  }

  .search-bar-wrapper {
    max-width: 100%;
  }

  .filter-tabs-wrapper {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-tab,
  .btn-refresh {
    width: 100%;
  }

  .btn-refresh {
    margin-left: 0;
  }

  .applications-grid {
    grid-template-columns: 1fr;
  }

  .application-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .status-actions {
    width: 100%;
    justify-content: center;
  }
}
</style>
