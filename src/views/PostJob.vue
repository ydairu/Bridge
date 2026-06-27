<template>
  <div class="post-job-page">
    <div class="post-job-container">
      <!-- Header -->
      <div class="header-section">
        <div class="header-icon-wrapper">
          <div class="header-icon">
            <img src="../assets/briefcase.svg" alt="Briefcase" class="icon-img" />
          </div>
          <div class="header-text">
            <h1>{{ isEditMode ? 'Edit Job Listing' : 'Post a New Job' }}</h1>
            <p class="header-subtitle">
              {{ isEditMode ? 'Update the details of your job listing' : 'Fill in the details to attract the best candidates' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Success Alert -->
      <div v-if="success" class="alert alert-success">
        <div class="alert-icon">
          <img src="/icons/check-circle.svg" alt="Success" class="icon-small" />
        </div>
        <div class="alert-content">
          Job {{ isEditMode ? 'updated' : 'posted' }} successfully! Redirecting to dashboard...
        </div>
      </div>

      <!-- Error Alert -->
      <div v-if="error" class="alert alert-error">
        <div class="alert-content">
          {{ error }}
        </div>
      </div>

      <form @submit.prevent="handleSubmit">
        <!-- Basic Information Card -->
        <div class="card card-section">
          <div class="card-header">
            <div class="card-header-content">
              <img src="/icons/sparkles.svg" alt="Sparkles" class="card-header-icon" />
              <div>
                <h2 class="card-title">Basic Information</h2>
                <p class="card-description">Let's start with the essentials about the position</p>
              </div>
            </div>
          </div>
          <div class="card-body">
            <!-- Job Title -->
            <div class="form-group">
              <label for="title" class="label-with-badge">
                <div class="label-content">
                  <img src="../assets/briefcase.svg" alt="Briefcase" class="label-icon" />
                  <span>Job Title</span>
                </div>
                <span class="badge badge-required">Required</span>
              </label>
              <input
                id="title"
                type="text"
                v-model="formData.title"
                placeholder="e.g., Senior Construction Worker"
                class="form-input"
                required
              />
            </div>

            <!-- Category and Job Type Row -->
            <div class="form-row">
              <div class="form-group">
                <label for="category" class="label-with-badge">
                  <div class="label-content">
                    <img src="/icons/file-text.svg" alt="File" class="label-icon" />
                    <span>Category</span>
                  </div>
                  <span class="badge badge-required">Required</span>
                </label>
                <select
                  id="category"
                  v-model="formData.category"
                  class="form-select"
                  required
                >
                  <option value="">Select a category</option>
                  <option v-for="cat in categories" :key="cat.value" :value="cat.value">
                    {{ cat.label }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label for="type" class="label-with-badge">
                  <div class="label-content">
                    <img src="../assets/clock.svg" alt="Clock" class="label-icon" />
                    <span>Job Type</span>
                  </div>
                  <span class="badge badge-required">Required</span>
                </label>
                <select
                  id="type"
                  v-model="formData.type"
                  class="form-select"
                  required
                >
                  <option value="">Select job type</option>
                  <option v-for="type in jobTypes" :key="type.value" :value="type.value">
                    {{ type.label }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Location and Salary Row -->
            <div class="form-row">
              <div class="form-group">
                <label for="location" class="label-with-badge">
                  <div class="label-content">
                    <img src="../assets/location.svg" alt="Location" class="label-icon" />
                    <span>Location</span>
                  </div>
                  <span class="badge badge-required">Required</span>
                </label>
                <select
                  id="location"
                  v-model="formData.location"
                  class="form-select"
                  required
                >
                  <option value="">Select location</option>
                  <option v-for="loc in locations" :key="loc.value" :value="loc.value">
                    {{ loc.label }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label for="salary" class="label-with-badge">
                  <div class="label-content">
                    <img src="../assets/salary.svg" alt="Salary" class="label-icon" />
                    <span>Monthly Salary (SGD)</span>
                  </div>
                  <span class="badge badge-required">Required</span>
                </label>
                <input
                  id="salary"
                  type="number"
                  v-model="formData.salary"
                  placeholder="e.g., 3000"
                  class="form-input"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Job Details Card -->
        <div class="card card-section">
          <div class="card-header card-header-indigo">
            <div class="card-header-content">
              <img src="/icons/file-text.svg" alt="File" class="card-header-icon" />
              <div>
                <h2 class="card-title">Job Details</h2>
                <p class="card-description">Provide comprehensive information about the role</p>
              </div>
            </div>
          </div>
          <div class="card-body">
            <!-- Description -->
            <div class="form-group">
              <label for="description" class="label-with-badge">
                <span>Job Description</span>
                <span class="badge badge-required">Required</span>
              </label>
              <textarea
                id="description"
                v-model="formData.description"
                placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                class="form-textarea"
                rows="6"
                required
              ></textarea>
              <p class="form-hint">Tip: Be clear and detailed to attract qualified candidates</p>
            </div>

            <!-- Requirements -->
            <div class="form-group">
              <label for="requirements" class="label-with-badge">
                <div class="label-content">
                  <img src="/icons/check-circle.svg" alt="Check" class="label-icon" />
                  <span>Requirements</span>
                </div>
                <span class="badge badge-optional">Optional</span>
              </label>
              <textarea
                id="requirements"
                v-model="requirementsText"
                placeholder="Enter each requirement on a new line, e.g.:&#10;• 2+ years of experience&#10;• Valid certification&#10;• Good communication skills"
                class="form-textarea"
                rows="5"
              ></textarea>
            </div>

            <!-- Benefits -->
            <div class="form-group">
              <label for="benefits" class="label-with-badge">
                <div class="label-content">
                  <img src="/icons/star.svg" alt="Star" class="label-icon" />
                  <span>Benefits & Perks</span>
                </div>
                <span class="badge badge-optional">Optional</span>
              </label>
              <textarea
                id="benefits"
                v-model="benefitsText"
                placeholder="Enter each benefit on a new line, e.g.:&#10;• Health insurance&#10;• Annual bonus&#10;• Flexible working hours"
                class="form-textarea"
                rows="5"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Form Actions Card -->
        <div class="card card-actions">
          <div class="form-actions">
            <button
              type="button"
              @click="handleCancel"
              class="btn btn-outline"
            >
              <span class="btn-icon">←</span>
              Cancel
            </button>

            <button
              type="submit"
              :disabled="loading || !isFormValid"
              class="btn btn-primary btn-gradient"
            >
              <span v-if="loading" class="spinner">⏳</span>
              <img v-else src="../assets/briefcase.svg" alt="Briefcase" class="btn-icon-img" />
              {{ loading ? (isEditMode ? 'Updating...' : 'Posting...') : (isEditMode ? 'Update Job' : 'Post Job') }}
            </button>
          </div>

          <p v-if="!isFormValid" class="form-validation-hint">
            Please fill in all required fields to continue
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from '../composables/useToast'

export default {
  name: 'PostJob',
  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    const { showToast } = useToast()
    
    const loading = ref(false)
    const error = ref(null)
    const success = ref(false)
    const requirementsText = ref('')
    const benefitsText = ref('')
    const isEditMode = ref(false)
    const jobId = ref(null)

    const userProfile = computed(() => store.getters['auth/userProfile'])
    const currentUser = computed(() => store.getters['auth/currentUser'])

    const categories = [
      { value: 'construction', label: 'Construction' },
      { value: 'manufacturing', label: 'Manufacturing' },
      { value: 'hospitality', label: 'Hospitality' },
      { value: 'maintenance', label: 'Maintenance' },
      { value: 'logistics', label: 'Logistics' },
      { value: 'cleaning', label: 'Cleaning' },
      { value: 'security', label: 'Security' },
      { value: 'facilities', label: 'Facilities' },
    ]

    const jobTypes = [
      { value: 'full-time', label: 'Full Time' },
      { value: 'part-time', label: 'Part Time' },
      { value: 'contract', label: 'Contract' },
    ]

    const locations = [
      { value: 'central', label: 'Central' },
      { value: 'east', label: 'East' },
      { value: 'west', label: 'West' },
      { value: 'north', label: 'North' },
      { value: 'south', label: 'South' },
    ]

    const formData = reactive({
      title: '',
      category: '',
      type: '',
      location: '',
      salary: '',
      description: '',
      company: userProfile.value?.company || '',
      employerId: currentUser.value?.uid || ''
    })

    const isFormValid = computed(() => {
      return formData.title && 
             formData.category && 
             formData.type && 
             formData.location && 
             formData.salary && 
             formData.description
    })

    const loadJobData = async () => {
      const jobIdParam = route.query.jobId
      if (jobIdParam) {
        isEditMode.value = true
        jobId.value = jobIdParam
        loading.value = true
        
        try {
          const job = await store.dispatch('jobs/fetchJobById', jobIdParam)
          
          if (job) {
            formData.title = job.title || ''
            formData.category = job.category || ''
            formData.type = job.type || ''
            formData.location = job.location || ''
            formData.salary = job.salary || ''
            formData.description = job.description || ''
            
            if (job.requirements && Array.isArray(job.requirements)) {
              requirementsText.value = job.requirements.join('\n')
            } else if (job.requirements) {
              requirementsText.value = job.requirements
            }
            
            if (job.benefits && Array.isArray(job.benefits)) {
              benefitsText.value = job.benefits.join('\n')
            } else if (job.benefits) {
              benefitsText.value = job.benefits
            }
          }
        } catch (err) {
          error.value = err.message || 'Failed to load job data. Please try again.'
          showToast('Failed to load job data', 'error')
        } finally {
          loading.value = false
        }
      }
    }

    const handleSubmit = async () => {
      loading.value = true
      error.value = null
      success.value = false

      try {
        const jobData = {
          ...formData,
          requirements: requirementsText.value.split('\n').filter(r => r.trim()),
          benefits: benefitsText.value.split('\n').filter(b => b.trim()),
          companyLogo: userProfile.value?.companyLogo || null,
          companyDescription: userProfile.value?.companyDescription || null
        }

        if (isEditMode.value && jobId.value) {
          await store.dispatch('jobs/updateJob', { jobId: jobId.value, jobData })
          showToast('Job updated successfully!', 'success')
        } else {
          await store.dispatch('jobs/createJob', jobData)
          showToast('Job posted successfully!', 'success')
        }
        
        success.value = true
        
        setTimeout(() => {
          router.push('/employer/dashboard')
        }, 1500)
      } catch (err) {
        error.value = err.message || (isEditMode.value ? 'Failed to update job. Please try again.' : 'Failed to post job. Please try again.')
        showToast(error.value, 'error')
      } finally {
        loading.value = false
      }
    }

    const handleCancel = () => {
      router.back()
    }

    onMounted(() => {
      loadJobData()
    })

    return {
      formData,
      requirementsText,
      benefitsText,
      loading,
      error,
      success,
      isEditMode,
      isFormValid,
      categories,
      jobTypes,
      locations,
      handleSubmit,
      handleCancel
    }
  }
}
</script>

<style scoped>
.post-job-page {
  min-height: calc(100vh - 70px);
  background: var(--bg-dark);
  padding: 2rem 1rem;
}

.dark-mode .post-job-page {
  background: var(--bg-dark);
}

.post-job-container {
  max-width: 56rem;
  margin: 0 auto;
}

/* Header Section */
.header-section {
  margin-bottom: 2rem;
}

.header-icon-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.header-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: linear-gradient(to bottom right, #2563eb, #4f46e5);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.icon-img {
  width: 1.5rem;
  height: 1.5rem;
  filter: brightness(0) invert(1);
}

.header-text h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  line-height: 1.2;
}

.dark-mode .header-text h1 {
  color: var(--text);
}

.header-subtitle {
  color: #475569;
  margin-top: 0.25rem;
  font-size: 0.875rem;
}

.dark-mode .header-subtitle {
  color: var(--text-muted);
}

/* Alert Styles */
.alert {
  margin-bottom: 1.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.alert-success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
}

.dark-mode .alert-success {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
  color: rgb(74, 222, 128);
}

.alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

.dark-mode .alert-error {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: rgb(248, 113, 113);
}

.alert-icon {
  display: flex;
  align-items: center;
}

.icon-small {
  width: 1rem;
  height: 1rem;
}

.dark-mode .icon-small {
  filter: brightness(0) invert(1);
}

.alert-content {
  flex: 1;
  font-size: 0.875rem;
}

/* Card Styles */
.card {
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 0.75rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s;
  margin-bottom: 1.5rem;
}

.dark-mode .card {
  background: var(--bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
}

.card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.dark-mode .card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
}

.card-header {
  background: linear-gradient(to right, #f8fafc, #e0f2fe);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding: 1.25rem 1.5rem;
  border-radius: 0.75rem 0.75rem 0 0;
}

.dark-mode .card-header {
  background: linear-gradient(to right, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.08));
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.card-header-indigo {
  background: linear-gradient(to right, #f8fafc, #eef2ff);
}

.dark-mode .card-header-indigo {
  background: linear-gradient(to right, rgba(255, 255, 255, 0.05), rgba(147, 51, 234, 0.15));
}

.card-header-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-header-icon {
  width: 1.25rem;
  height: 1.25rem;
  filter: brightness(0) saturate(100%) invert(42%) sepia(93%) saturate(1421%) hue-rotate(200deg) brightness(99%) contrast(101%);
}

.dark-mode .card-header-icon {
  filter: brightness(0) invert(1);
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.dark-mode .card-title {
  color: var(--text);
}

.card-description {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.25rem 0 0 0;
}

.dark-mode .card-description {
  color: var(--text-muted);
}

.card-body {
  padding: 1.5rem;
}

.card-actions {
  padding: 1.5rem;
}

/* Form Styles */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.label-with-badge {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  color: #334155;
}

.dark-mode .label-with-badge {
  color: var(--text);
}

.label-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.label-icon {
  width: 1rem;
  height: 1rem;
  opacity: 0.6;
}

.dark-mode .label-icon {
  filter: brightness(0) invert(1);
  opacity: 0.8;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-required {
  background: #f1f5f9;
  color: #475569;
}

.dark-mode .badge-required {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-muted);
}

.badge-optional {
  background: transparent;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.dark-mode .badge-optional {
  color: var(--text-muted);
  border-color: rgba(255, 255, 255, 0.2);
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-family: inherit;
  color: #1e293b;
  background: white;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.dark-mode .form-input,
.dark-mode .form-select,
.dark-mode .form-textarea {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
  color: var(--text);
}

.dark-mode .form-input::placeholder,
.dark-mode .form-textarea::placeholder {
  color: var(--text-muted);
}

.dark-mode .form-select option {
  background: var(--bg);
  color: var(--text);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.dark-mode .form-input:focus,
.dark-mode .form-select:focus,
.dark-mode .form-textarea:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.form-textarea {
  min-height: 7.5rem;
  resize: vertical;
}

.form-hint {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.5rem;
}

.dark-mode .form-hint {
  color: var(--text-muted);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

/* Form Actions */
.form-actions {
  display: flex;
  flex-direction: column-reverse;
  gap: 0.75rem;
  justify-content: space-between;
  align-items: center;
}

@media (min-width: 640px) {
  .form-actions {
    flex-direction: row;
  }
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline {
  width: 100%;
  background: white;
  color: #1e293b;
  border: 1px solid #cbd5e1;
}

.dark-mode .btn-outline {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text);
  border-color: rgba(255, 255, 255, 0.2);
}

.btn-outline:hover:not(:disabled) {
  background: #f8fafc;
}

.dark-mode .btn-outline:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

@media (min-width: 640px) {
  .btn-outline {
    width: auto;
  }
}

.btn-primary {
  flex: 1;
  background: linear-gradient(to right, #2563eb, #4f46e5);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(to right, #1d4ed8, #4338ca);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.btn-gradient {
  font-weight: 500;
}

@media (min-width: 640px) {
  .btn-primary {
    flex: none;
  }
}

.btn-icon {
  font-size: 1rem;
}

.btn-icon-img {
  width: 1rem;
  height: 1rem;
  filter: brightness(0) invert(1);
}

.spinner {
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.form-validation-hint {
  font-size: 0.875rem;
  color: #d97706;
  margin-top: 1rem;
  text-align: center;
}

.dark-mode .form-validation-hint {
  color: rgb(251, 146, 60);
}

@media (min-width: 640px) {
  .form-validation-hint {
    text-align: right;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .header-text h1 {
    font-size: 1.5rem;
  }
}
</style>
