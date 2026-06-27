<template>
  <div class="reviews-container">
    <div class="summary-card" v-if="loadedOnce">
      <div class="summary-content">
        <div class="rating-display">
          <div class="rating-value">{{ average > 0 ? average.toFixed(1) : '—' }}</div>
          <div class="rating-stars">
            <svg 
              v-for="n in 5" 
              :key="n" 
              class="star-icon"
              :class="{ filled: n <= Math.round(average) }"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
        </div>
        <div class="review-count">
          <span class="count-number">{{ count }}</span>
          <span class="count-label">{{ count === 1 ? 'Review' : 'Reviews' }}</span>
        </div>
      </div>
      <p v-if="count === 0" class="no-reviews">No reviews yet. Be the first to review this candidate!</p>
    </div>

    <div v-if="loading && !loadedOnce" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading reviews...</p>
    </div>

    <div v-else-if="reviews.length > 0" class="reviews-list">
      <div 
        v-for="review in reviews" 
        :key="review.id" 
        class="review-card"
      >
        <div class="review-header">
          <div class="reviewer-info">
            <div class="reviewer-name">{{ review.employerCompany || 'Employer' }}</div>
            <div class="review-date">{{ formatDate(review.createdAt) }}</div>
          </div>
          <div class="review-rating">
            <span 
              v-for="n in 5" 
              :key="n" 
              class="star"
              :class="{ filled: n <= review.rating }"
            >
              ★
            </span>
          </div>
        </div>
        <p v-if="review.comment" class="review-comment">{{ review.comment }}</p>
        <p v-else class="review-comment muted">No comment provided.</p>
      </div>
    </div>

    <div v-else-if="loadedOnce && reviews.length === 0" class="empty-state">
      <p>No reviews yet.</p>
    </div>

    <div v-if="cursor" class="load-more-container">
      <button 
        class="btn-load-more" 
        @click="loadMore" 
        :disabled="loading"
      >
        <span v-if="loading">Loading...</span>
        <span v-else>Load More Reviews</span>
      </button>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'CandidateReviewList',
  props: {
    candidateId: { type: String, required: true }
  },
  setup(props) {
    const store = useStore()
    const loading = ref(false)
    const loadedOnce = ref(false)

    const reviews = computed(() => store.getters['reviews/reviewsByCandidate'](props.candidateId))
    const cursor = computed(() => store.getters['reviews/reviewsPageCursor'](props.candidateId))
    const average = computed(() => store.getters['reviews/averageRating'](props.candidateId))
    const count = computed(() => store.getters['reviews/reviewsCount'](props.candidateId))

    const load = async () => {
      loading.value = true
      try {
        await store.dispatch('reviews/fetchReviewsByCandidate', { 
          candidateId: props.candidateId, 
          pageSize: 10 
        })
        loadedOnce.value = true
      } finally {
        loading.value = false
      }
    }

    const loadMore = async () => {
      if (!cursor.value || loading.value) return
      loading.value = true
      try {
        await store.dispatch('reviews/fetchReviewsByCandidate', { 
          candidateId: props.candidateId, 
          pageSize: 10, 
          cursor: cursor.value 
        })
      } finally {
        loading.value = false
      }
    }

    const formatDate = (ts) => {
      try {
        let date
        if (ts?.seconds) {
          date = new Date(ts.seconds * 1000)
        } else if (ts?.toDate) {
          date = ts.toDate()
        } else if (ts) {
          date = new Date(ts)
        } else {
          return 'Unknown date'
        }
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })
      } catch {
        return 'Unknown date'
      }
    }

    onMounted(load)
    watch(() => props.candidateId, load)

    return { 
      reviews, 
      cursor, 
      average, 
      count, 
      loading, 
      loadedOnce, 
      loadMore, 
      formatDate 
    }
  }
}
</script>

<style scoped>
.reviews-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.summary-card {
  background: var(--bg-light);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  padding: 24px;
  color: var(--text);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.summary-card:hover {
  box-shadow: var(--shadow-md);
  border-color: rgba(0, 0, 0, 0.12);
}


.summary-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.rating-display {
  display: flex;
  align-items: center;
  gap: 16px;
}

.rating-value {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1;
  color: var(--text);
}

.rating-stars {
  display: flex;
  gap: 4px;
}

.star-icon {
  width: 24px;
  height: 24px;
  fill: var(--border);
  transition: fill 0.2s;
}

.star-icon.filled {
  fill: #f59e0b;
}

.review-count {
  text-align: right;
}

.count-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  color: var(--text);
}

.count-label {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.no-reviews {
  margin-top: 16px;
  font-size: 0.95rem;
  color: var(--text-muted);
  text-align: center;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: var(--text-muted);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s;
}

.review-card:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow-sm);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 16px;
}

.reviewer-info {
  flex: 1;
}

.reviewer-name {
  font-weight: 600;
  color: var(--text);
  margin-bottom: 4px;
  font-size: 1rem;
}

.review-date {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.review-rating {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

.review-rating .star {
  font-size: 1.2rem;
  color: var(--border);
  line-height: 1;
}

.review-rating .star.filled {
  color: #f59e0b;
}

.review-comment {
  color: var(--text);
  line-height: 1.6;
  margin: 0;
  font-size: 0.95rem;
}

.review-comment.muted {
  color: var(--text-muted);
  font-style: italic;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--text-muted);
}

.load-more-container {
  text-align: center;
  padding-top: 8px;
}

.btn-load-more {
  background: transparent;
  border: 2px solid var(--primary);
  color: var(--primary);
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-load-more:hover:not(:disabled) {
  background: var(--primary);
  color: white;
  transform: translateY(-1px);
}

.btn-load-more:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .summary-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .review-count {
    text-align: left;
  }

  .rating-value {
    font-size: 2.5rem;
  }

  .review-header {
    flex-direction: column;
    gap: 8px;
  }

  .review-rating {
    align-self: flex-start;
  }
}
</style>
