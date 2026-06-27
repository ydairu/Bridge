<template>
  <div class="company-reviews-page">
    <!-- Page Header -->
    <section class="reviews-header-section">
      <div class="container">
        <div class="header-content">
          <h2>Company Reviews</h2>
          <p class="reviews-description">Read honest reviews from workers and employers in Singapore</p>
        </div>
      </div>
    </section>

    <!-- Reviews Section -->
    <section class="reviews-section">
      <div class="container">
        <div class="reviews-layout">
          <!-- Filter Sidebar -->
          <aside class="filter-sidebar-wrapper">
            <div class="filter-sidebar">
              <div class="filter-section">
                <h4>Filters</h4>
                
                <!-- Search Bar -->
                <div class="search-bar-wrapper">
                  <img src="/icons/search.svg" alt="Search" class="search-icon" />
                  <input
                    type="text"
                    v-model="searchQuery"
                    placeholder="Search companies..."
                    class="search-input"
                  />
                </div>
              </div>

              <div class="separator"></div>

              <!-- Industry Filter -->
              <div class="filter-section">
                <h4>Industry</h4>
                <div class="filter-options">
                  <label v-for="industry in industries" :key="industry.value" class="filter-option">
                    <input
                      type="checkbox"
                      :value="industry.value"
                      v-model="selectedIndustries"
                    />
                    <span>{{ industry.label }}</span>
                  </label>
                </div>
              </div>

              <div class="separator"></div>

              <!-- Rating Filter -->
              <div class="filter-section">
                <h4>Rating</h4>
                <div class="filter-options">
                  <label class="filter-option">
                    <input type="checkbox" value="5" v-model="selectedRatings" />
                    <span class="filter-rating-stars">
                      <img 
                        v-for="n in 5" 
                        :key="n" 
                        src="/icons/star.svg" 
                        alt="Star" 
                        class="filter-star-icon"
                      />
                      <span>5 Stars</span>
                    </span>
                  </label>
                  <label class="filter-option">
                    <input type="checkbox" value="4" v-model="selectedRatings" />
                    <span class="filter-rating-stars">
                      <img 
                        v-for="n in 4" 
                        :key="n" 
                        src="/icons/star.svg" 
                        alt="Star" 
                        class="filter-star-icon"
                      />
                      <span>4+ Stars</span>
                    </span>
                  </label>
                  <label class="filter-option">
                    <input type="checkbox" value="3" v-model="selectedRatings" />
                    <span class="filter-rating-stars">
                      <img 
                        v-for="n in 3" 
                        :key="n" 
                        src="/icons/star.svg" 
                        alt="Star" 
                        class="filter-star-icon"
                      />
                      <span>3+ Stars</span>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          <!-- Main Content -->
          <div class="reviews-main-content">
            <!-- Header with Count -->
            <div class="reviews-header">
              <div>
                <h2>Company Reviews</h2>
                <p class="reviews-count">{{ filteredReviews.length }} reviews</p>
              </div>
              <button @click="openModal" class="btn btn-primary">
                Write a Review
              </button>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="reviews-grid">
              <div v-for="n in 6" :key="n" class="review-card-skeleton">
                <div class="skeleton-header"></div>
                <div class="skeleton-body"></div>
                <div class="skeleton-footer"></div>
              </div>
            </div>

            <!-- No Results -->
            <div v-else-if="filteredReviews.length === 0" class="no-results">
              <p>No reviews found. Try adjusting your filters.</p>
            </div>

            <!-- Reviews Grid -->
            <div v-else class="reviews-grid">
              <div 
                v-for="review in filteredReviews" 
                :key="review.id"
                class="review-card"
              >
                <div class="review-header">
                  <div class="company-info-with-logo">
                    <div class="company-logo-wrapper-small">
                      <div class="company-logo-small">
                        <img 
                          v-if="getCompanyLogo(review.company)" 
                          :src="getCompanyLogo(review.company)" 
                          :alt="review.company || 'Company Logo'"
                          class="company-logo-img-small"
                        />
                        <span v-else class="company-logo-initials-small">{{ getCompanyInitials(review.company) }}</span>
                      </div>
                    </div>
                    <div class="company-info">
                      <h3>{{ review.company }}</h3>
                      <span class="industry-tag">{{ getIndustryLabel(review.industry) }}</span>
                    </div>
                  </div>
                  <div class="rating">
                    <div class="stars-container">
                      <img 
                        v-for="n in Math.floor(review.rating)" 
                        :key="n" 
                        src="/icons/star.svg" 
                        alt="Star" 
                        class="star-icon"
                      />
                      <span v-if="review.rating % 1 >= 0.5" class="half-star">½</span>
                    </div>
                    <span class="rating-number">{{ review.rating }}/5</span>
                  </div>
                </div>

                <div class="review-body">
                  <p class="review-text">{{ review.review }}</p>
                </div>

                <div class="review-footer">
                  <div class="review-meta">
                    <span class="reviewer">{{ review.reviewerName }} ({{ review.reviewerType }})</span>
                    <span class="date">{{ formatDate(review.date) }}</span>
                  </div>
                  <button 
                    @click="likeReview(review.id)" 
                    class="helpful-btn"
                    :class="{ 'is-liked': review.isLiked }"
                  >
                    <img src="/icons/thumbs-up.svg?v=2" alt="Thumbs up" class="thumbs-icon" />
                    <span>Helpful ({{ review.likes || 0 }})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Add Review Modal -->
    <div v-if="showAddReviewModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Write a Review</h2>
          <button @click="closeModal" class="close-btn" aria-label="Close">&times;</button>
        </div>
        
        <form @submit.prevent="submitReview" class="review-form">
          <!-- Error Message -->
          <div v-if="submitError" class="error-message">
            {{ submitError }}
          </div>

          <!-- Success Message -->
          <div v-if="submitSuccess" class="success-message">
            Thank you for your review! It has been submitted successfully.
          </div>

          <!-- Company Name -->
          <div class="form-group">
            <label for="company">Company Name <span class="required">*</span></label>
            <select
              id="company"
              v-model="reviewForm.company"
              @change="onCompanyChange"
              required
              class="form-select"
            >
              <option value="">Select a company</option>
              <option v-for="company in availableCompanies" :key="company" :value="company">
                {{ company }}
              </option>
            </select>
            <p v-if="availableCompanies.length === 0" class="helper-text">
              No companies available. Companies will appear here once jobs are posted.
            </p>
          </div>

          <!-- Industry -->
          <div class="form-group">
            <label for="industry">Industry <span class="required">*</span></label>
            <select
              id="industry"
              v-model="reviewForm.industry"
              required
              class="form-select"
            >
              <option value="">Select an industry</option>
              <option v-for="industry in industries" :key="industry.value" :value="industry.value">
                {{ industry.label }}
              </option>
            </select>
          </div>

          <!-- Rating -->
          <div class="form-group">
            <label class="rating-label">Rating <span class="required">*</span></label>
            <div class="rating-selector centered">
              <button
                v-for="n in 5"
                :key="n"
                type="button"
                @click="reviewForm.rating = n"
                class="star-btn"
                :class="{ active: reviewForm.rating >= n }"
              >
                <img src="/icons/star.svg" alt="Star" class="star-icon" />
              </button>
              <span v-if="reviewForm.rating" class="rating-text">
                {{ reviewForm.rating }} {{ reviewForm.rating === 1 ? 'star' : 'stars' }}
              </span>
            </div>
          </div>

          <!-- Review Text -->
          <div class="form-group">
            <label for="review">Your Review <span class="required">*</span></label>
            <textarea
              id="review"
              v-model="reviewForm.review"
              placeholder="Share your experience working with this company..."
              required
              rows="6"
              class="form-textarea"
              minlength="20"
            ></textarea>
            <div class="char-count">
              {{ reviewForm.review.length }} characters (minimum 20)
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn btn-secondary" :disabled="submitting">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="submitting || !isFormValid">
              <span v-if="submitting">Submitting...</span>
              <span v-else>Submit Review</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'CompanyReviews',
  setup() {
    const store = useStore()
    const searchQuery = ref('')
    const selectedIndustries = ref([])
    const selectedRatings = ref([])
    const showAddReviewModal = ref(false)
    const submitting = ref(false)
    const submitError = ref('')
    const submitSuccess = ref(false)

    const industries = [
      { value: 'construction', label: 'Construction' },
      { value: 'manufacturing', label: 'Manufacturing' },
      { value: 'hospitality', label: 'Hospitality' },
      { value: 'maintenance', label: 'Maintenance' },
      { value: 'logistics', label: 'Logistics' },
      { value: 'cleaning', label: 'Cleaning' },
      { value: 'security', label: 'Security' },
      { value: 'facilities', label: 'Facilities' },
      { value: 'healthcare', label: 'Healthcare' }
    ]

    // Review form data
    const reviewForm = ref({
      company: '',
      industry: '',
      rating: 0,
      review: ''
    })

    // Get reviews from store
    const reviews = computed(() => store.getters['reviews/allReviews'])
    const loading = computed(() => store.getters['reviews/loading'])
    const jobs = computed(() => store.getters['jobs/allJobs'])
    
    // Extract unique company names from jobs
    const availableCompanies = computed(() => {
      const companiesSet = new Set()
      jobs.value.forEach(job => {
        if (job.company && job.company.trim() !== '') {
          companiesSet.add(job.company.trim())
        }
      })
      return Array.from(companiesSet).sort()
    })
    
    // Store company to industry mapping
    const companyIndustryMap = computed(() => {
      const map = {}
      jobs.value.forEach(job => {
        if (job.company && job.category) {
          map[job.company.trim()] = job.category
        }
      })
      return map
    })
    
    // Auto-populate industry when company is selected
    const onCompanyChange = () => {
      if (reviewForm.value.company && companyIndustryMap.value[reviewForm.value.company]) {
        const industry = companyIndustryMap.value[reviewForm.value.company]
        // Map job category to review industry if possible
        const mappedIndustry = industries.find(i => 
          i.value === industry || i.label.toLowerCase() === industry.toLowerCase()
        )
        if (mappedIndustry) {
          reviewForm.value.industry = mappedIndustry.value
        } else {
          // If exact match not found, try to set it anyway if it's a valid industry
          if (industries.some(i => i.value === industry)) {
            reviewForm.value.industry = industry
          }
        }
      }
    }

    const filteredReviews = computed(() => {
      let result = reviews.value

      if (searchQuery.value) {
        result = result.filter(review =>
          review.company.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      }

      if (selectedIndustries.value.length > 0) {
        result = result.filter(review => 
          selectedIndustries.value.includes(review.industry)
        )
      }

      if (selectedRatings.value.length > 0) {
        result = result.filter(review => 
          selectedRatings.value.some(rating => review.rating >= parseFloat(rating))
        )
      }

      return result
    })

    const getIndustryLabel = (value) => {
      const industry = industries.find(i => i.value === value)
      return industry ? industry.label : value
    }
    
    // Get company logo from jobs by matching company name
    const getCompanyLogo = (companyName) => {
      if (!companyName) return null
      const companyJob = jobs.value.find(job => 
        job.company && job.company.trim().toLowerCase() === companyName.trim().toLowerCase()
      )
      return companyJob?.companyLogo || null
    }
    
    // Get company initials for fallback
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
      const date = new Date(dateString)
      return date.toLocaleDateString('en-SG', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    }

    const isFormValid = computed(() => {
      return reviewForm.value.company !== '' &&
             reviewForm.value.industry !== '' &&
             reviewForm.value.rating > 0 &&
             reviewForm.value.review.trim().length >= 20
    })

    const likeReview = (reviewId) => {
      const review = reviews.value.find(r => r.id === reviewId)
      if (review) {
        if (review.isLiked) {
          // Unlike - decrease count
          review.likes = Math.max(0, (review.likes || 0) - 1)
          review.isLiked = false
        } else {
          // Like - increase count
          review.likes = (review.likes || 0) + 1
          review.isLiked = true
        }
      }
    }

    const closeModal = () => {
      showAddReviewModal.value = false
      // Reset form after animation
      setTimeout(() => {
        reviewForm.value = {
          company: '',
          industry: '',
          rating: 0,
          review: ''
        }
        submitError.value = ''
        submitSuccess.value = false
      }, 200)
    }

    const submitReview = async () => {
      if (!isFormValid.value) {
        submitError.value = 'Please fill in all required fields correctly.'
        return
      }

      // Check if user is authenticated
      const currentUser = store.getters['auth/currentUser']
      const userProfile = store.getters['auth/userProfile']
      
      if (!currentUser || !userProfile) {
        submitError.value = 'You must be logged in to submit a review.'
        return
      }

      submitting.value = true
      submitError.value = ''
      submitSuccess.value = false

      try {
        // Determine reviewer type based on user role
        const reviewerType = userProfile.role === 'employer' ? 'Employer' : 'Worker'
        
        // Get reviewer name (use first name + last initial if full name exists)
        let reviewerName = userProfile.name || 'Anonymous'
        if (reviewerName.includes(' ')) {
          const parts = reviewerName.split(' ')
          reviewerName = `${parts[0]} ${parts[parts.length - 1][0]}.`
        } else if (reviewerName.length > 8) {
          reviewerName = reviewerName.substring(0, 8) + '...'
        }

        const reviewData = {
          company: reviewForm.value.company.trim(),
          industry: reviewForm.value.industry,
          rating: reviewForm.value.rating,
          review: reviewForm.value.review.trim(),
          reviewerName,
          reviewerType,
          userId: currentUser.uid
        }

        await store.dispatch('reviews/submitReview', reviewData)
        
        submitSuccess.value = true
        
        // Close modal after 2 seconds
        setTimeout(() => {
          closeModal()
        }, 2000)
      } catch (error) {
        submitError.value = error.message || 'Failed to submit review. Please try again.'
        console.error('Error submitting review:', error)
      } finally {
        submitting.value = false
      }
    }

    onMounted(async () => {
      // Fetch reviews from Firestore
      try {
        await store.dispatch('reviews/fetchReviews')
      } catch (error) {
        console.error('Error fetching reviews:', error)
      }
      
      // Fetch jobs to populate company dropdown
      try {
        await store.dispatch('jobs/fetchJobs')
      } catch (error) {
        console.error('Error fetching jobs:', error)
      }
    })
    
    // Fetch jobs when modal opens (in case jobs weren't loaded yet)
    const openModal = () => {
      showAddReviewModal.value = true
      // Refresh jobs list when opening modal
      if (jobs.value.length === 0) {
        store.dispatch('jobs/fetchJobs').catch(error => {
          console.error('Error fetching jobs:', error)
        })
      }
    }

    return {
      searchQuery,
      selectedIndustries,
      selectedRatings,
      loading,
      showAddReviewModal,
      filteredReviews,
      industries,
      getIndustryLabel,
      formatDate,
      likeReview,
      getCompanyLogo,
      getCompanyInitials,
      reviewForm,
      submitting,
      submitError,
      submitSuccess,
      isFormValid,
      closeModal,
      submitReview,
      availableCompanies,
      onCompanyChange,
      openModal
    }
  }
}
</script>

<style scoped>
.company-reviews-page {
  width: 100%;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header Section */
.reviews-header-section {
  background: var(--bg);
  padding: 40px 0;
}

.header-content {
  text-align: center;
}

.header-content h2 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 8px;
  line-height: 1.2;
}

.reviews-description {
  font-size: 1rem;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.5;
}

/* Reviews Section */
.reviews-section {
  padding: 40px 0;
  background: var(--bg);
}

.reviews-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 32px;
}

/* Filter Sidebar */
.filter-sidebar {
  background: var(--bg);
  padding: 24px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  height: fit-content;
  position: sticky;
  top: 100px;
}

.dark-mode .filter-sidebar {
  border-color: rgba(255, 255, 255, 0.1);
}

.filter-section h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 16px 0;
}

.separator {
  height: 1px;
  background: var(--border);
  margin: 24px 0;
}

.search-bar-wrapper {
  position: relative;
  margin-bottom: 16px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  opacity: 0.5;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-size: 0.875rem;
  background: var(--bg);
  color: var(--text);
}

.dark-mode .search-input {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: var(--text);
  cursor: pointer;
}

.filter-option input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.filter-rating-stars {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.filter-star-icon {
  width: 16px;
  height: 16px;
}

/* Reviews Main Content */
.reviews-main-content {
  width: 100%;
}

.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.reviews-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.reviews-count {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
}

/* Reviews Grid */
.reviews-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
}

/* Review Card */
.review-card {
  background: var(--bg);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.2s;
}

.dark-mode .review-card {
  border-color: rgba(255, 255, 255, 0.1);
}

.review-card:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow-sm);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.company-info-with-logo {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.company-logo-wrapper-small {
  flex-shrink: 0;
}

.company-logo-small {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--primary) 0%, #4a90e2 100%);
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

.company-info {
  flex: 1;
  min-width: 0;
}

.company-info h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 8px 0;
}

.industry-tag {
  display: inline-block;
  padding: 4px 12px;
  background: var(--bg-light);
  color: var(--text);
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.rating {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.stars-container {
  display: flex;
  gap: 2px;
  align-items: center;
}

.star-icon {
  width: 16px;
  height: 16px;
}

.half-star {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.rating-number {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text);
}

.review-body {
  margin-bottom: 16px;
}

.review-text {
  font-size: 0.875rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0;
}

.review-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.dark-mode .review-footer {
  border-top-color: rgba(255, 255, 255, 0.1);
}

.review-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reviewer {
  font-size: 0.813rem;
  font-weight: 600;
  color: var(--text);
}

.date {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.helpful-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--bg-light);
  color: var(--text);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 6px;
  font-size: 0.813rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.helpful-btn:hover:not(.is-liked) {
  background: var(--bg);
  border-color: var(--primary);
}


.helpful-btn.is-liked {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.helpful-btn.is-liked:hover {
  background: var(--primary);
  border-color: var(--primary);
}

.helpful-btn.is-liked .thumbs-icon {
  filter: brightness(0) invert(1);
}

.thumbs-icon {
  width: 16px;
  height: 16px;
  transition: all 0.2s;
}

/* Skeleton Loading */
.review-card-skeleton {
  background: var(--bg);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 24px;
}

.skeleton-header {
  height: 80px;
  background: var(--bg-light);
  border-radius: 8px;
  margin-bottom: 16px;
}

.skeleton-body {
  height: 120px;
  background: var(--bg-light);
  border-radius: 8px;
  margin-bottom: 16px;
}

.skeleton-footer {
  height: 40px;
  background: var(--bg-light);
  border-radius: 8px;
}

/* No Results */
.no-results {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
  font-size: 1rem;
}

/* Modal */
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
  animation: fadeIn 0.2s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: #ffffff;
  padding: 0;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s;
}

.dark-mode .modal-content {
  background: #1a1a1a;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background: transparent;
}

.dark-mode .modal-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  color: #333333;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.dark-mode .modal-header h2 {
  color: #ffffff;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #666666;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  line-height: 1;
}

.dark-mode .close-btn {
  color: #999999;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #333333;
}

.dark-mode .close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.review-form {
  padding: 32px;
  background: transparent;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #333333;
  margin-bottom: 8px;
}

.dark-mode .form-group label {
  color: #ffffff;
}

.required {
  color: #e74c3c;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-size: 0.875rem;
  background: #ffffff;
  color: #333333;
  font-family: inherit;
  transition: all 0.2s;
}

.dark-mode .form-input,
.dark-mode .form-select,
.dark-mode .form-textarea {
  border-color: rgba(255, 255, 255, 0.2);
  background: #2a2a2a;
  color: #ffffff;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.char-count {
  font-size: 0.75rem;
  color: #666666;
  margin-top: 4px;
}

.dark-mode .char-count {
  color: #999999;
}

.helper-text {
  font-size: 0.75rem;
  color: #666666;
  margin-top: 8px;
  font-style: italic;
}

.dark-mode .helper-text {
  color: #999999;
}

.rating-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #333333;
  margin-bottom: 8px;
}

.dark-mode .rating-label {
  color: #ffffff;
}

.rating-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.rating-selector.centered {
  justify-content: center;
  width: 100%;
}

.star-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 4px;
}

.star-btn:hover {
  background: var(--bg-light);
  transform: scale(1.1);
}

.star-btn .star-icon {
  width: 28px;
  height: 28px;
  opacity: 0.3;
  transition: all 0.2s;
}

.star-btn.active .star-icon {
  opacity: 1;
  filter: brightness(0) saturate(100%) invert(77%) sepia(87%) saturate(1352%) hue-rotate(348deg) brightness(102%) contrast(96%);
}

.star-btn.active:hover .star-icon {
  transform: scale(1.1);
}

.rating-text {
  font-size: 0.875rem;
  color: #333333;
  font-weight: 500;
  margin-left: 8px;
}

.dark-mode .rating-text {
  color: #ffffff;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  background: transparent;
}

.dark-mode .form-actions {
  border-top-color: rgba(255, 255, 255, 0.1);
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--bg-light);
  color: var(--text);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.dark-mode .btn-secondary {
  border-color: rgba(255, 255, 255, 0.1);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg);
}

.btn-primary {
  background: var(--primary);
  color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 123, 255, 0.3);
  filter: brightness(1.1);
}

.dark-mode .btn-primary:hover:not(:disabled) {
  background: var(--primary);
  box-shadow: 0 4px 12px rgba(64, 123, 255, 0.4);
  filter: brightness(1.15);
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 0.875rem;
  border-left: 4px solid #c33;
}

.dark-mode .error-message {
  background: rgba(204, 51, 51, 0.2);
  color: #ff6b6b;
  border-left-color: #ff6b6b;
}

.success-message {
  background: #efe;
  color: #3c3;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 0.875rem;
  border-left: 4px solid #3c3;
}

.dark-mode .success-message {
  background: rgba(51, 204, 51, 0.2);
  color: #51cf66;
  border-left-color: #51cf66;
}

/* Responsive */
@media (max-width: 1200px) {
  .reviews-layout {
    grid-template-columns: 260px 1fr;
  }
}

@media (max-width: 992px) {
  .reviews-layout {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .filter-sidebar {
    position: static;
  }

  .reviews-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .reviews-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-content h2 {
    font-size: 1.75rem;
  }

  .modal-content {
    width: 95%;
    max-height: 95vh;
  }

  .modal-header {
    padding: 20px;
  }

  .review-form {
    padding: 20px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
