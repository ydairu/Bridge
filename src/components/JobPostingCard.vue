<template>
  <div class="job-posting-card">
    <div class="job-header">
      <div class="job-info-with-logo">
        <div class="company-logo-small">
          <img 
            v-if="job.companyLogo" 
            :src="job.companyLogo" 
            :alt="job.company || 'Company Logo'"
            class="company-logo-img-small"
          />
          <span v-else class="company-logo-initials-small">{{ getCompanyInitials(job.company) }}</span>
        </div>
        <div class="job-info">
          <h3 class="job-title">{{ job.title }}</h3>
          <p class="job-company">{{ job.company }}</p>
        </div>
      </div>
      <span class="job-status" :class="statusClass">{{ job.status || 'active' }}</span>
    </div>
    
    <div class="job-meta">
      <span class="meta-item">
        <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        {{ capitalizeLocation(job.location) }}
      </span>
      <span class="meta-item">
        <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        ${{ job.salary }}/month
      </span>
      <span v-if="job.applicationsCount !== undefined" class="meta-item applications-count">
        {{ job.applicationsCount }} applications
      </span>
    </div>
    
    <p class="job-description">{{ truncateDescription(job.description) }}</p>
    
    <div class="job-footer">
      <span class="job-date">Posted {{ formatDate(job.createdAt) }}</span>
      <div class="job-actions">
        <router-link :to="`/jobs/${job.id}`" class="btn-view">View</router-link>
        <button @click="$emit('edit', job.id)" class="btn-edit">Edit</button>
        <button @click="$emit('delete', job.id)" class="btn-delete">Delete</button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'JobPostingCard',
  props: {
    job: {
      type: Object,
      required: true
    }
  },
  emits: ['edit', 'delete'],
  setup(props) {
    const truncateDescription = (description) => {
      if (!description) return ''
      return description.length > 150 
        ? description.substring(0, 150) + '...' 
        : description
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'recently'
      const date = new Date(dateString)
      const now = new Date()

      const isSameDay = date.getFullYear() === now.getFullYear() &&
                       date.getMonth() === now.getMonth() &&
                       date.getDate() === now.getDate()
      
      if (isSameDay) return 'today'
      
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      const isYesterday = date.getFullYear() === yesterday.getFullYear() &&
                         date.getMonth() === yesterday.getMonth() &&
                         date.getDate() === yesterday.getDate()
      
      if (isYesterday) return 'yesterday'
      
      const diffTime = Math.abs(now - date)
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    const capitalizeLocation = (str) => {
      if (!str) return ''
      return str.charAt(0).toUpperCase() + str.slice(1)
    }

    const getCompanyInitials = (companyName) => {
      if (!companyName) return '??'
      return companyName
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }

    const statusClass = computed(() => {
      const status = (props.job.status || 'active').toLowerCase()
      return `status-${status}`
    })

    return {
      truncateDescription,
      formatDate,
      capitalizeLocation,
      statusClass,
      getCompanyInitials
    }
  }
}
</script>

<style scoped>
.job-posting-card {
  background: var(--bg);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.job-posting-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-color: rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.dark-mode .job-posting-card {
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.dark-mode .job-posting-card:hover {
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.job-info-with-logo {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.company-logo-small {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid var(--border);
}

.company-logo-img-small {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.company-logo-initials-small {
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
}

.job-info {
  flex: 1;
  min-width: 0;
}

.job-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.job-company {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
}

.job-status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  white-space: nowrap;
  flex-shrink: 0;
}

.status-active {
  background: oklch(0.9 0.02 160);
  color: var(--success);
}

.status-draft {
  background: oklch(0.9 0.02 50);
  color: var(--warning);
}

.status-expired {
  background: oklch(0.9 0.02 30);
  color: var(--danger);
}

.job-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
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
}

.applications-count {
  color: var(--primary);
  font-weight: 500;
}

.job-description {
  font-size: 0.875rem;
  color: var(--text);
  line-height: 1.6;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.job-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.job-date {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.job-actions {
  display: flex;
  gap: 8px;
}

.btn-view,
.btn-edit,
.btn-delete {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-view {
  background: var(--bg-light);
  color: var(--text);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.btn-view:hover {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.dark-mode .btn-view {
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.btn-edit {
  background: var(--primary);
  color: white;
}

.btn-edit:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.btn-delete {
  background: var(--danger, #ef4444);
  color: white;
}

.btn-delete:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .job-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .job-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .job-actions {
    width: 100%;
  }
  
  .btn-view,
  .btn-edit,
  .btn-delete {
    flex: 1;
  }
}
</style>
