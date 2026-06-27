<template>
  <div class="job-details">
    <div v-if="loading" class="loading">
      <p>Loading job details...</p>
    </div>

    <div v-else-if="job" class="job-content">
      <!-- Job Header -->
      <div class="job-header">
        <div class="job-header-content">
          <div class="company-avatar">
            <img 
              v-if="job.companyLogo" 
              :src="job.companyLogo" 
              :alt="job.company || 'Company Logo'"
              class="company-logo-img"
            />
            <div v-else class="avatar-fallback">
              {{ getCompanyInitials(job.company) }}
            </div>
          </div>
          <div class="job-title-section">
            <h1>{{ job.title }}</h1>
            <p class="company-name">{{ job.company }}</p>
          </div>
        </div>

        <div class="job-tags">
          <span class="badge" v-for="tag in jobTags" :key="tag">{{ tag }}</span>
        </div>
      </div>

      <!-- Key Details Grid -->
      <div class="details-grid">
        <div class="detail-card">
          <div class="detail-icon">
            <img :src="salaryIcon" alt="Salary" />
          </div>
          <div class="detail-content">
            <p class="detail-label">Salary</p>
            <p class="detail-value">${{ job.salary }}/mo</p>
          </div>
        </div>

        <div class="detail-card">
          <div class="detail-icon">
            <img :src="locationIcon" alt="Location" />
          </div>
          <div class="detail-content">
            <p class="detail-label">Location</p>
            <p class="detail-value">{{ capitalizeLocation(job.location) }}</p>
          </div>
        </div>

        <div class="detail-card">
          <div class="detail-icon">
            <img :src="briefcaseIcon" alt="Job Type" />
          </div>
          <div class="detail-content">
            <p class="detail-label">Job Type</p>
            <p class="detail-value">{{ capitalize(job.type) }}</p>
          </div>
        </div>

        <div class="detail-card">
          <div class="detail-icon">
            <img :src="clockIcon" alt="Posted" />
          </div>
          <div class="detail-content">
            <p class="detail-label">Posted</p>
            <p class="detail-value">{{ formatDate(job.createdAt) }}</p>
          </div>
        </div>
      </div>

      <div class="separator"></div>

      <!-- Job Description -->
      <div class="section">
        <div class="section-header">
          <img :src="briefcaseIcon" alt="Briefcase" class="section-icon" />
          <h3>Job Description</h3>
        </div>
        <p class="section-text">{{ job.description }}</p>
        <p class="section-text">
          We are looking for dedicated and hardworking individuals to join our team. 
          This role offers competitive compensation, good working conditions, and opportunities for career advancement.
        </p>
      </div>

      <div class="separator"></div>

      <!-- Requirements -->
      <div class="section">
        <div class="section-header">
          <img src="/public/icons/check-circle.svg" alt="Requirements" class="section-icon" />
          <h3>Requirements</h3>
        </div>
        <ul class="requirements-list">
          <li v-for="(req, index) in job.requirements" :key="index" class="requirement-item">
            <img src="/public/icons/check-circle.svg" alt="Check" class="check-icon" />
            <span>{{ req }}</span>
          </li>
        </ul>
      </div>

      <div class="separator"></div>

      <!-- Benefits -->
      <div class="section">
        <div class="section-header">
          <img src="/public/icons/sparkles.svg" alt="Benefits" class="section-icon" />
          <h3>Benefits</h3>
        </div>
        <div class="benefits-grid">
          <div class="benefit-item" v-for="(benefit, index) in job.benefits" :key="index">
            <img src="/public/icons/check-circle.svg" alt="Check" class="check-icon-small" />
            <span>{{ benefit }}</span>
          </div>
        </div>
      </div>

      <div class="separator"></div>

      <!-- Company Details -->
      <div v-if="employerProfile" class="section">
        <div class="section-header">
          <img src="/icons/building.svg" alt="Building" class="section-icon" />
          <h3>About {{ job.company }}</h3>
        </div>
        
        <div class="company-details-grid">
          <div v-if="employerProfile.industry" class="company-detail-item">
            <div class="company-detail-label">
              <img :src="briefcaseIcon" alt="Industry" class="detail-icon" />
              <span>Industry</span>
            </div>
            <p class="company-detail-value">{{ employerProfile.industry }}</p>
          </div>
          
          <div v-if="employerProfile.companySize" class="company-detail-item">
            <div class="company-detail-label">
              <img src="/icons/users.svg" alt="Company Size" class="detail-icon" />
              <span>Company Size</span>
            </div>
            <p class="company-detail-value">{{ formatCompanySize(employerProfile.companySize) }}</p>
          </div>
          
          <div v-if="employerProfile.companyWebsite" class="company-detail-item">
            <div class="company-detail-label">
              <img src="/icons/search.svg" alt="Website" class="detail-icon" />
              <span>Website</span>
            </div>
            <p class="company-detail-value">
              <a :href="employerProfile.companyWebsite" target="_blank" rel="noopener noreferrer" class="website-link">
                {{ employerProfile.companyWebsite }}
              </a>
            </p>
          </div>
          
          <div v-if="employerProfile.companyUEN" class="company-detail-item">
            <div class="company-detail-label">
              <img src="/icons/file-text.svg" alt="UEN" class="detail-icon" />
              <span>UEN</span>
            </div>
            <p class="company-detail-value">{{ employerProfile.companyUEN }}</p>
            <p class="company-detail-hint">Unique Entity Number (Singapore)</p>
          </div>
          
          <div v-if="employerProfile.companyAddress" class="company-detail-item">
            <div class="company-detail-label">
              <img :src="locationIcon" alt="Address" class="detail-icon" />
              <span>Address</span>
            </div>
            <p class="company-detail-value">{{ employerProfile.companyAddress }}</p>
          </div>
          
          <div v-if="employerProfile.companyDescription" class="company-detail-item full-width">
            <div class="company-detail-label">
              <img src="/icons/file-text.svg" alt="Description" class="detail-icon" />
              <span>Company Description</span>
            </div>
            <p class="company-detail-value">{{ employerProfile.companyDescription }}</p>
          </div>
        </div>
      </div>

      <div class="separator"></div>

      <!-- Action Buttons -->
      <div class="actions" v-if="isJobSeeker">
        <button @click="applyForJob" class="btn btn-primary">
          Apply Now
        </button>
      </div>

      <!-- Application Form Modal -->
      <div v-if="showApplicationForm" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <h2>Apply for {{ job.title }}</h2>
          <form @submit.prevent="submitApplication">
            <div class="form-group">
              <label>Cover Letter</label>
              <textarea
                v-model="application.coverLetter"
                rows="6"
                placeholder="Tell us why you're a great fit..."
                required
              ></textarea>
            </div>

            <div class="form-group">
              <label>Resume (URL or text)</label>
              <input
                type="text"
                v-model="application.resume"
                placeholder="Paste resume URL or brief summary"
                required
              />
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeModal" class="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                Submit Application
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useToast } from '../composables/useToast'
import { db } from '../firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import briefcaseIcon from '../assets/briefcase.svg'
import locationIcon from '../assets/location.svg'
import salaryIcon from '../assets/salary.svg'
import envelopeIcon from '../assets/envelope.svg'
import phoneIcon from '../assets/phone.svg'
import clockIcon from '../assets/clock.svg'

export default {
  name: 'JobDetails',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const { showToast } = useToast()
    
    const job = ref(null)
    const employerProfile = ref(null)
    const loading = ref(true)
    const showApplicationForm = ref(false)

    const application = reactive({
      coverLetter: '',
      resume: ''
    })

    const isJobSeeker = computed(() => {
      const userProfile = store.getters['auth/userProfile']
      return userProfile?.role === 'jobseeker'
    })

    const jobTags = computed(() => {
      if (!job.value) return []
      return [
        job.value.category ? capitalize(job.value.category) : null,
        job.value.type ? capitalize(job.value.type) : null
      ].filter(Boolean)
    })

    const getCompanyInitials = (name) => {
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    }

    const capitalize = (str) => {
      if (!str) return ''
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
    }

    const capitalizeLocation = (str) => {
      if (!str) return ''
      return str.charAt(0).toUpperCase() + str.slice(1)
    }

    const formatDate = (timestamp) => {
      if (!timestamp) return 'Recently'
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      const now = new Date()
      
      // Check if same calendar day
      const isSameDay = date.getFullYear() === now.getFullYear() &&
                       date.getMonth() === now.getMonth() &&
                       date.getDate() === now.getDate()
      
      if (isSameDay) return 'Today'
      
      // Check if yesterday (previous calendar day)
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      const isYesterday = date.getFullYear() === yesterday.getFullYear() &&
                         date.getMonth() === yesterday.getMonth() &&
                         date.getDate() === yesterday.getDate()
      
      if (isYesterday) return 'Yesterday'
      
      // Calculate difference in days using floor instead of ceil
      const diffTime = Math.abs(now - date)
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
      return `${Math.floor(diffDays / 30)} months ago`
    }

    const formatCompanySize = (size) => {
      if (!size) return ''
      const sizeMap = {
        '1-10': '1-10 employees',
        '11-50': '11-50 employees',
        '51-200': '51-200 employees',
        '201-500': '201-500 employees',
        '501-1000': '501-1000 employees',
        '1000+': '1000+ employees'
      }
      return sizeMap[size] || size
    }

    const fetchJob = async () => {
      loading.value = true
      try {
        const jobData = await store.dispatch('jobs/fetchJobById', route.params.id)
        job.value = jobData
        
        // Fetch employer profile to get company details
        if (jobData.employerId) {
          try {
            const employerDoc = await getDoc(doc(db, 'users', jobData.employerId))
            if (employerDoc.exists()) {
              employerProfile.value = employerDoc.data()
            }
          } catch (error) {
            // Silently fail - company details section just won't show
            // This is expected if user is not authenticated and Firestore rules deny access
            console.warn('Could not fetch employer profile:', error.message)
          }
        }
      } catch (error) {
        console.error('Error fetching job:', error)
      } finally {
        loading.value = false
      }
    }

    const applyForJob = () => {
      const isAuthenticated = store.getters['auth/isAuthenticated']
      if (!isAuthenticated) {
        router.push('/login')
        return
      }
      showApplicationForm.value = true
    }

    const saveJob = () => {
      console.log('Job saved')
    }

    const submitApplication = async () => {
      try {
        const user = store.getters['auth/currentUser']
        await store.dispatch('applications/submitApplication', {
          jobId: job.value.id,
          userId: user.uid,
          coverLetter: application.coverLetter,
          resume: application.resume
        })
        
        showToast('Application submitted successfully!', 'success')
        showApplicationForm.value = false
        setTimeout(() => {
          router.push('/applications')
        }, 500)
      } catch (error) {
        console.error('Error submitting application:', error)
        showToast('Failed to submit application. Please try again.', 'error')
      }
    }

    const closeModal = () => {
      showApplicationForm.value = false
    }

    onMounted(() => {
      fetchJob()
    })

    return {
      job,
      employerProfile,
      loading,
      showApplicationForm,
      application,
      isJobSeeker,
      jobTags,
      briefcaseIcon,
      locationIcon,
      salaryIcon,
      envelopeIcon,
      phoneIcon,
      clockIcon,
      getCompanyInitials,
      capitalize,
      capitalizeLocation,
      formatDate,
      formatCompanySize,
      applyForJob,
      saveJob,
      submitApplication,
      closeModal
    }
  }
}
</script>

<style scoped>
.job-details {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  font-size: 1.1rem;
  color: var(--text-muted);
}

.job-content {
  width: 100%;
}

/* Job Header */
.job-header {
  margin-bottom: 24px;
}

.job-header-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.company-avatar {
  flex-shrink: 0;
}

.avatar-fallback {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  background: var(--bg-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  font-weight: 600;
  font-size: 1.25rem;
  border: 2px solid var(--border);
}

.company-logo-img {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  object-fit: cover;
  border: 2px solid var(--border);
}

.dark-mode .avatar-fallback {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.job-title-section {
  flex: 1;
  min-width: 0;
}

.job-title-section h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 4px;
  line-height: 1.3;
}

.company-name {
  font-size: 1rem;
  color: var(--text-muted);
  margin: 0;
}

.job-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  background: var(--bg-light);
  color: var(--text);
  border-radius: 4px;
  font-size: 0.875rem;
  border: 1px solid var(--border);
}

/* Details Grid */
.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.detail-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: var(--bg-light);
  transition: all 0.2s;
}

.dark-mode .detail-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dark-mode .detail-icon {
  background: rgba(255, 255, 255, 0.1);
}

.detail-icon img {
  width: 20px;
  height: 20px;
  opacity: 0.6;
}

.dark-mode .detail-icon img {
  filter: brightness(0) invert(1);
  opacity: 0.8;
}

.detail-content {
  min-width: 0;
}

.detail-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0 0 2px 0;
}

.detail-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

/* Separator */
.separator {
  height: 1px;
  background: var(--border);
  margin: 24px 0;
}

/* Section */
.section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.section-icon {
  width: 20px;
  height: 20px;
  opacity: 0.8;
}

.dark-mode .section-icon {
  filter: brightness(0) invert(1);
  opacity: 0.9;
}

.section-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.section-text {
  font-size: 0.875rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0;
}

/* Requirements List */
.requirements-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.requirement-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.875rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.check-icon {
  width: 16px;
  height: 16px;
  margin-top: 2px;
  flex-shrink: 0;
}

.dark-mode .check-icon {
  filter: brightness(0) invert(1);
}

/* Benefits Grid */
.benefits-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: var(--text-muted);
}

.check-icon-small {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.dark-mode .check-icon-small {
  filter: brightness(0) invert(1);
}

/* Company Details Section */
.company-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 16px;
}

.company-detail-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.company-detail-item.full-width {
  grid-column: 1 / -1;
}

.company-detail-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-muted);
}

.company-detail-label .detail-icon {
  width: 16px;
  height: 16px;
  opacity: 0.7;
}

.dark-mode .company-detail-label .detail-icon {
  filter: brightness(0) invert(1);
  opacity: 0.8;
}

.company-detail-value {
  font-size: 0.95rem;
  color: var(--text);
  line-height: 1.6;
  margin: 0;
}

.company-detail-value .website-link {
  color: var(--primary);
  text-decoration: none;
  word-break: break-all;
}

.company-detail-value .website-link:hover {
  text-decoration: underline;
}

.company-detail-hint {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 4px 0 0 0;
  font-style: italic;
}

/* Company Contact */
.company-contact {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: var(--text-muted);
}

.contact-item img {
  width: 16px;
  height: 16px;
  opacity: 0.6;
}

.dark-mode .contact-item img {
  filter: brightness(0) invert(1);
  opacity: 0.8;
}

/* Actions */
.actions {
  display: flex;
  gap: 12px;
  padding: 24px 0;
}

.btn {
  flex: 1;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--bg-light);
  color: var(--text);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: var(--bg);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

.modal-content {
  background: #ffffff;
  padding: 32px;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--border);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
}

.dark-mode .modal-content {
  background: #1a1a1a;
}

.modal-content h2 {
  margin-bottom: 20px;
  color: var(--text);
  font-size: 1.5rem;
  font-weight: 600;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: var(--text);
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  background: #ffffff;
  color: #333333;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
}

.dark-mode .modal-content {
  background: #1a1a1a !important;
  border-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .form-group input,
.dark-mode .form-group textarea {
  background: #2a2a2a !important;
  border-color: rgba(255, 255, 255, 0.2);
  color: #ffffff !important;
}

.dark-mode .form-group label {
  color: #ffffff !important;
}

.dark-mode .modal-content h2 {
  color: #ffffff !important;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.modal-actions .btn {
  flex: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .details-grid {
    grid-template-columns: 1fr;
  }

  .benefits-grid {
    grid-template-columns: 1fr;
  }
}
</style>
