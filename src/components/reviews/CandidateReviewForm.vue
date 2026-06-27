<template>
  <div class="review-form-card">
    <div class="form-header">
      <h3>{{ existingReview ? 'Edit Your Review' : 'Write a Review' }}</h3>
      <p class="form-subtitle">Share your experience with this candidate</p>
    </div>

    <div class="rating-section">
      <label class="rating-label">Rating *</label>
      <div class="stars-container">
        <button
          v-for="n in 5"
          :key="n"
          type="button"
          class="star-btn"
          :class="{ active: rating >= n, hover: hoverRating >= n }"
          @mouseenter="hoverRating = n"
          @mouseleave="hoverRating = 0"
          @click="setRating(n)"
          :aria-label="`${n} star${n > 1 ? 's' : ''}`"
        >
          <svg class="star-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </button>
      </div>
      <span v-if="rating > 0" class="rating-text">
        {{ rating === 5 ? 'Excellent' : rating === 4 ? 'Very Good' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor' }}
      </span>
    </div>

    <div class="comment-section">
      <label for="review-comment" class="comment-label">Comments (Optional)</label>
      <textarea
        id="review-comment"
        v-model="comment"
        class="comment-input"
        placeholder="Tell other employers about your experience working with this candidate..."
        rows="4"
        maxlength="500"
      ></textarea>
      <div class="char-count">{{ comment.length }}/500</div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div class="form-actions">
      <button 
        class="btn-submit" 
        :disabled="submitting || !rating" 
        @click="submit"
      >
        <span v-if="submitting" class="btn-loader"></span>
        <span v-else>{{ existingReview ? 'Update Review' : 'Submit Review' }}</span>
      </button>
      <button 
        v-if="existingReview" 
        class="btn-delete" 
        :disabled="submitting" 
        @click="confirmDelete"
      >
        Delete
      </button>
    </div>
  </div>
</template>

<script>
import { ref, watch, computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'CandidateReviewForm',
  props: {
    candidateId: { type: String, required: true }
  },
  setup(props) {
    const store = useStore()
    const rating = ref(0)
    const comment = ref('')
    const error = ref('')
    const submitting = ref(false)
    const hoverRating = ref(0)

    const existingReview = computed(() => store.getters['reviews/myReviewForCandidate'](props.candidateId))

    const hydrateFromExisting = () => {
      if (existingReview.value) {
        rating.value = existingReview.value.rating || 0
        comment.value = existingReview.value.comment || ''
      } else {
        rating.value = 0
        comment.value = ''
      }
    }

    watch(existingReview, hydrateFromExisting, { immediate: true })

    const setRating = (n) => {
      rating.value = n
      error.value = ''
    }

    const submit = async () => {
      error.value = ''
      if (!rating.value || rating.value < 1 || rating.value > 5) {
        error.value = 'Please select a rating.'
        return
      }
      
      try {
        submitting.value = true
        if (existingReview.value) {
          await store.dispatch('reviews/updateReview', {
            reviewId: existingReview.value.id,
            candidateId: props.candidateId,
            rating: rating.value,
            comment: comment.value
          })
        } else {
          await store.dispatch('reviews/createReview', {
            candidateId: props.candidateId,
            rating: rating.value,
            comment: comment.value
          })
        }
        error.value = ''
      } catch (e) {
        error.value = e?.message || 'Failed to submit review. Please try again.'
      } finally {
        submitting.value = false
      }
    }

    const confirmDelete = async () => {
      if (!existingReview.value) return
      if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
        return
      }

      try {
        submitting.value = true
        await store.dispatch('reviews/deleteReview', {
          reviewId: existingReview.value.id,
          candidateId: props.candidateId
        })
      } catch (e) {
        error.value = e?.message || 'Failed to delete review. Please try again.'
      } finally {
        submitting.value = false
      }
    }

    return { 
      rating, 
      comment, 
      error, 
      submitting, 
      existingReview, 
      hoverRating,
      setRating, 
      submit, 
      confirmDelete 
    }
  }
}
</script>

<style scoped>
.review-form-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.form-header {
  margin-bottom: 24px;
}

.form-header h3 {
  font-size: 1.5rem;
  color: var(--text);
  margin-bottom: 4px;
  font-weight: 600;
}

.form-subtitle {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin: 0;
}

.rating-section {
  margin-bottom: 24px;
}

.rating-label {
  display: block;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 12px;
  font-size: 0.95rem;
}

.stars-container {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.star-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  transition: transform 0.2s;
  color: var(--border);
}

.star-btn:hover {
  transform: scale(1.1);
}

.star-btn.active,
.star-btn.hover {
  color: #f59e0b;
}

.star-icon {
  width: 32px;
  height: 32px;
  display: block;
}

.rating-text {
  font-size: 0.9rem;
  color: var(--text-muted);
  font-weight: 500;
}

.comment-section {
  margin-bottom: 20px;
}

.comment-label {
  display: block;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.comment-input {
  width: 100%;
  padding: 12px;
  border: 2px solid var(--border);
  border-radius: 8px;
  background: var(--bg-light);
  color: var(--text);
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  transition: border-color 0.3s;
}

.comment-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.char-count {
  text-align: right;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #dc2626;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-bottom: 16px;
}

.form-actions {
  display: flex;
  gap: 12px;
}

.btn-submit,
.btn-delete {
  flex: 1;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
}

.btn-submit {
  background: var(--primary);
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: oklch(0.35 0.1 245);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-delete {
  background: transparent;
  color: var(--danger);
  border: 2px solid var(--danger);
}

.btn-delete:hover:not(:disabled) {
  background: var(--danger);
  color: white;
}

.btn-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-loader {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .review-form-card {
    padding: 20px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .star-icon {
    width: 28px;
    height: 28px;
  }
}
</style>
