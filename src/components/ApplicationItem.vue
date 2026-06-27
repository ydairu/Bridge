<template>
  <div class="application-item">
    <div class="application-header">
      <div class="application-info">
        <h4 class="application-title">{{ application.jobTitle || application.title }}</h4>
        <p class="candidate-name">{{ application.candidateName || 'Unknown Candidate' }}</p>
        <p class="application-date">Applied {{ formatDate(application.createdAt) }}</p>
      </div>
      <span class="status-badge" :class="statusClass">
        {{ formatStatus(application.status) }}
      </span>
    </div>
    
    <div class="application-meta">
      <span class="meta-item">
        <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        {{ capitalizeLocation(application.location) }}
      </span>
      <span class="meta-item">
        <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        ${{ application.salary }}
      </span>
    </div>
    
    <div class="application-actions">
      <router-link :to="`/applications/${application.id}`" class="btn-view">
        View Details
      </router-link>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'ApplicationItem',
  props: {
    application: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const formatDate = (dateString) => {
      if (!dateString) return 'recently'
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) return 'today'
      if (diffDays === 1) return 'yesterday'
      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    const formatStatus = (status) => {
      if (!status) return 'Pending'
      return status.charAt(0).toUpperCase() + status.slice(1)
    }

    const capitalizeLocation = (str) => {
      if (!str) return ''
      return str.charAt(0).toUpperCase() + str.slice(1)
    }

    const statusClass = computed(() => {
      const status = (props.application.status || 'pending').toLowerCase()
      return `status-${status}`
    })

    return {
      formatDate,
      formatStatus,
      capitalizeLocation,
      statusClass
    }
  }
}
</script>

<style scoped>
.application-item {
  padding: 16px;
  border-bottom: 1px solid rgba(74, 158, 245, 0.08);
}

.application-item:last-child {
  border-bottom: none;
}

.application-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 12px;
}

.application-info {
  flex: 1;
  min-width: 0;
}

.application-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.candidate-name {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0 0 4px 0;
}

.application-date {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.status-pending {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}

.status-accepted {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
}

.status-rejected {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.application-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: var(--text-muted);
}

.meta-icon {
  width: 14px;
  height: 14px;
}

.application-actions {
  display: flex;
  gap: 8px;
}

.btn-view {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  background: rgba(26, 111, 212, 0.12);
  color: #4A9EF5;
  border: 1px solid rgba(74, 158, 245, 0.2);
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: all 0.2s ease;
}

.btn-view:hover {
  background: #1A6FD4;
  color: white;
  border-color: #1A6FD4;
}
</style>
