<template>
  <div 
    class="job-card"
    @click="handleViewDetails"
  >
    <div class="job-card-wrapper">
      <div class="job-card-header">
        <div class="company-logo-wrapper-small">
          <div class="company-logo-small">
            <img 
              v-if="job.companyLogo" 
              :src="job.companyLogo" 
              :alt="job.company || 'Company Logo'"
              class="company-logo-img-small"
            />
            <span v-else class="company-logo-initials-small">{{ getCompanyInitials(job.company) }}</span>
          </div>
        </div>
        <div class="job-title-section">
          <h3 class="job-title">{{ job.title }}</h3>
          <p class="company-name">{{ job.company }}</p>
        </div>
      </div>

      <div class="job-details">
        <div class="detail-item">
          <svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <span>{{ capitalizeLocation(job.location) }}</span>
        </div>
        <div class="detail-item">
          <svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>${{ job.salary }}</span>
        </div>
        <div class="detail-item">
          <svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>{{ capitalize(job.type || 'full-time') }}</span>
        </div>
      </div>

      <div class="job-tags">
        <span 
          v-for="tag in tags" 
          :key="tag" 
          class="tag"
        >
          {{ tag }}
        </span>
      </div>

      <p class="job-description">
        {{ truncateDescription(job.description) }}
      </p>

      <div class="job-footer">
        <span class="posted-date">{{ formatDate(job.createdAt) }}</span>
        <button class="view-details-btn">
          View Details
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'JobCard',
  props: {
    job: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const router = useRouter()
    const isBookmarked = ref(false)

    const tags = computed(() => {
      const tagsList = []
      if (props.job.category) {
        tagsList.push(props.job.category)
      }
      if (props.job.tags && Array.isArray(props.job.tags)) {
        tagsList.push(...props.job.tags)
      }
      return tagsList
    })

    const handleBookmark = (e) => {
      e.stopPropagation()
      isBookmarked.value = !isBookmarked.value
      console.log('Job bookmarked:', props.job.id)
    }

    const handleViewDetails = () => {
      router.push(`/jobs/${props.job.id}`)
    }

    const truncateDescription = (description, maxLength = 120) => {
      if (!description) return ''
      return description.length > maxLength 
        ? description.substring(0, maxLength) + '...' 
        : description
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

    const formatDate = (dateString) => {
      if (!dateString) return 'Recently'
      const date = new Date(dateString)
      const now = new Date()
      
      const isSameDay = date.getFullYear() === now.getFullYear() &&
                       date.getMonth() === now.getMonth() &&
                       date.getDate() === now.getDate()
      
      if (isSameDay) return 'Today'
      
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      const isYesterday = date.getFullYear() === yesterday.getFullYear() &&
                         date.getMonth() === yesterday.getMonth() &&
                         date.getDate() === yesterday.getDate()
      
      if (isYesterday) return 'Yesterday'
      
      const diffTime = Math.abs(now - date)
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
      return date.toLocaleDateString()
    }

    const capitalize = (str) => {
      if (!str) return ''
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
    }

    const capitalizeLocation = (str) => {
      if (!str) return ''
      return str.charAt(0).toUpperCase() + str.slice(1)
    }

    return {
      isBookmarked,
      tags,
      handleBookmark,
      handleViewDetails,
      truncateDescription,
      formatDate,
      capitalize,
      capitalizeLocation,
      getCompanyInitials
    }
  }
}
</script>

<style scoped>
.job-card {
  display: flex;
  height: 100%;
  width: 100%;
  max-width: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}


.job-card-wrapper {
  background: var(--bg);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 20px;
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.job-card:hover .job-card-wrapper {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-color: rgba(0, 0, 0, 0.12);
}

.job-card-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.company-logo-wrapper-small {
  flex-shrink: 0;
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

.job-title-section {
  flex: 1;
  min-width: 0;
}

.job-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 4px 0;
  line-height: 1.3;
  transition: color 0.3s ease;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.job-card:hover .job-title {
  color: var(--primary);
}

.company-name {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
}

.icon {
  width: 18px;
  height: 18px;
}

.job-details {
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

.job-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.tag {
  background: var(--bg-light);
  color: var(--text);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.job-description {
  font-size: 0.875rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0 0 16px 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.job-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  margin-top: auto;
}

.posted-date {
  font-size: 0.75rem;
  color: var(--text-muted);
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

.job-card:hover .view-details-btn {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.dark-mode .view-details-btn {
  border: 1px solid rgba(255, 255, 255, 0.08);
}

@media (max-width: 768px) {
  .job-card-wrapper {
    padding: 16px;
  }
  
  .job-title {
    font-size: 1.1rem;
  }
  
  .job-details {
    gap: 8px;
  }
  
  .detail-item {
    font-size: 0.7rem;
  }
}
</style>

