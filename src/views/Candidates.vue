<template>
  <div class="candidates-page">
    <div class="candidates-container">
      <div class="page-header">
        <h1>Browse Candidates</h1>
        <p>Find qualified workers for your job openings</p>
      </div>

      <!-- Search and Filters -->
      <div class="filters-section">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search candidates by name or skills..."
          class="search-input"
        />
        
        <div class="filter-row">
          <select v-model="selectedSkill" class="filter-select">
            <option value="">All Skills</option>
            <option value="construction">Construction</option>
            <option value="plumbing">Plumbing</option>
            <option value="electrical">Electrical</option>
            <option value="carpentry">Carpentry</option>
          </select>

          <select v-model="selectedExperience" class="filter-select">
            <option value="">All Experience Levels</option>
            <option value="0-2">0–2 years</option>
            <option value="3-5">3–5 years</option>
            <option value="6-10">6–10 years</option>
            <option value="10+">10+ years</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <p>Loading candidates...</p>
      </div>

      <!-- Candidates Grid -->
      <div v-else-if="filteredCandidates.length === 0" class="empty-state">
        <p>No candidates found. Try adjusting your filters.</p>
      </div>

      <div v-else class="candidates-grid">
        <div v-for="candidate in filteredCandidates" :key="candidate.id" class="card card-interactive candidate-card">
          <div class="candidate-avatar">
            <img 
              v-if="candidate.photoURL" 
              :src="candidate.photoURL" 
              :alt="candidate.name"
              class="avatar-image"
            />
            <span v-else>{{ getInitials(candidate.name) }}</span>
          </div>
          
          <div class="candidate-info">
            <h3>{{ candidate.name }}</h3>
            <p class="experience">{{ candidate.experience }} years of experience</p>
            
            <div class="skills">
              <span v-for="skill in candidate.skills" :key="skill" class="skill-tag">
                {{ skill }}
              </span>
            </div>

            <!-- Employer-only rating summary -->
            <div v-if="isEmployer" class="rating-summary">
              <div v-if="ratingsMap[candidate.id]?.count > 0" class="rating-badge">
                <span class="rating-star">★</span>
                <span class="rating-value">{{ ratingsMap[candidate.id].avg.toFixed(1) }}</span>
                <span class="rating-count">({{ ratingsMap[candidate.id].count }})</span>
              </div>
              <span v-else class="no-rating">No reviews</span>
            </div>

            <div v-if="candidate.badges && candidate.badges.length > 0" class="badges">
              <span class="badge-icon" v-for="i in Math.min(candidate.badges.length, 3)" :key="i">
                🏆
              </span>
              <span v-if="candidate.badges.length > 3" class="badge-count">
                +{{ candidate.badges.length - 3 }}
              </span>
            </div>
          </div>

          <div class="candidate-actions">
            <router-link :to="`/profile/${candidate.id}`" class="btn btn-secondary">
              <User :size="16" :stroke-width="2" class="btn-icon" />
              View Profile
            </router-link>
            <button @click="contactCandidate(candidate)" class="btn btn-primary">
              <Mail :size="16" :stroke-width="2" class="btn-icon" />
              Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '../firebase/config'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { useStore } from 'vuex'
import { User, Mail } from 'lucide-vue-next'
import { useToast } from '../composables/useToast'

export default {
  name: 'Candidates',
  components: {
    User,
    Mail
  },
  setup() {
    const router = useRouter()
    const store = useStore()
    const { showToast } = useToast()

    const searchQuery = ref('')
    const selectedSkill = ref('')
    const selectedExperience = ref('')
    const candidates = ref([])
    const loading = ref(false)
    const ratingsMap = ref({})

    const currentUser = computed(() => store.getters['auth/currentUser'])
    const isEmployer = computed(() => store.getters['auth/isEmployer'])

    // Filtered candidates based on search and filters
    const filteredCandidates = computed(() => {
      let filtered = [...candidates.value]

      // Filter by search query (name or skills)
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim()
        filtered = filtered.filter(candidate => {
          const nameMatch = candidate.name?.toLowerCase().includes(query) || false
          const skillsMatch = candidate.skills?.some(skill => 
            skill.toLowerCase().includes(query)
          ) || false
          return nameMatch || skillsMatch
        })
      }

      // Filter by skill
      if (selectedSkill.value) {
        filtered = filtered.filter(candidate => {
          const skills = candidate.skills || []
          return skills.some(skill => 
            skill.toLowerCase() === selectedSkill.value.toLowerCase()
          )
        })
      }

      // Filter by experience
      if (selectedExperience.value) {
        filtered = filtered.filter(candidate => {
          const experience = candidate.experience || 0
          const expRange = selectedExperience.value

          if (expRange === '0-2') {
            return experience >= 0 && experience <= 2
          } else if (expRange === '3-5') {
            return experience >= 3 && experience <= 5
          } else if (expRange === '6-10') {
            return experience >= 6 && experience <= 10
          } else if (expRange === '10+') {
            return experience > 10
          }
          return true
        })
      }

      return filtered
    })

    const fetchCandidates = async () => {
      loading.value = true
      try {
        // Fetch all job seekers from the users collection
        const q = query(
          collection(db, 'users'),
          where('role', '==', 'jobseeker')
        )
        
        const querySnapshot = await getDocs(q)
        const jobSeekers = []
        querySnapshot.forEach((doc) => {
          jobSeekers.push({ 
            id: doc.id, 
            ...doc.data(),
            // Ensure skills is an array
            skills: doc.data().skills || []
          })
        })
        
        candidates.value = jobSeekers
      } catch (error) {
        console.error('Error fetching candidates:', error)
      } finally {
        loading.value = false
      }
    }

    onMounted(async () => {
      await fetchCandidates()
      if (isEmployer.value) {
        // fetch first-page reviews summary per candidate (simple approach)
        for (const c of candidates.value) {
          const { items } = await store.dispatch('reviews/fetchReviewsByCandidate', { candidateId: c.id, pageSize: 10 })
          const count = items.length
          const avg = count ? items.reduce((s, r) => s + (r.rating || 0), 0) / count : 0
          ratingsMap.value[c.id] = { count, avg }
        }
      }
    })

    const getInitials = (name) => {
      if (!name) return '?'
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }

    const contactCandidate = (candidate) => {
      if (!currentUser.value) {
        showToast('Please log in to contact candidates', 'error')
        return
      }

      // Navigate to chat page with modal auto-open and pre-filled search
      router.push({
        path: '/chat',
        query: {
          openModal: 'true',
          searchName: candidate.name
        }
      })
    }

    return {
      searchQuery,
      selectedSkill,
      selectedExperience,
      candidates,
      filteredCandidates,
      loading,
      isEmployer,
      ratingsMap,
      getInitials,
      contactCandidate
    }
  }
}
</script>
<style scoped>
.candidates-page {
  min-height: calc(100vh - 72px);
  background: var(--bg);
  padding: 56px 48px 80px;
}

.candidates-container {
  max-width: 1280px;
  margin: 0 auto;
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-header {
  margin-bottom: 48px;
  text-align: center;
}

.page-header h1 {
  font-size: clamp(2.25rem, 4vw, 3rem);
  font-weight: 800;
  margin-bottom: 12px;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #1a1a1a 0%, var(--primary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark-mode .page-header h1 {
  background: linear-gradient(135deg, #ffffff 0%, var(--primary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-header p {
  font-size: 1.15rem;
  color: var(--text-muted);
  max-width: 600px;
  margin: 0 auto;
}

.filters-section {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 32px;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06),
              0 2px 8px rgba(0, 0, 0, 0.04);
  margin-bottom: 40px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  animation: slideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both;
}

.dark-mode .filters-section {
  background: rgba(20, 20, 25, 0.6);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-input {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid rgba(0, 0, 0, 0.08);
  border-radius: 14px;
  font-size: 1rem;
  margin-bottom: 20px;
  background: var(--bg-light);
  color: var(--text);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
}

.search-input::placeholder {
  color: var(--text-muted);
  opacity: 0.7;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.1);
  transform: translateY(-2px);
}

.dark-mode .search-input {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.dark-mode .search-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.15);
}

.filter-row {
  display: flex;
  gap: 16px;
}

.filter-select {
  flex: 1;
  padding: 16px 48px 16px 20px;
  border: 2px solid rgba(0, 0, 0, 0.08);
  border-radius: 14px;
  font-size: 1rem;
  background: var(--bg-light);
  color: var(--text);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M7 10L12 15L17 10' stroke='%23007bff' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 20px;
  position: relative;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.1),
              0 4px 16px rgba(0, 123, 255, 0.15);
  transform: translateY(-2px);
  background-color: white;
}

.filter-select:hover {
  border-color: rgba(0, 123, 255, 0.4);
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.dark-mode .filter-select {
  border-color: rgba(255, 255, 255, 0.1);
  background-color: rgba(0, 0, 0, 0.2);
  background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M7 10L12 15L17 10' stroke='%23ffffff' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
}

.dark-mode .filter-select:hover {
  background-color: rgba(0, 0, 0, 0.3);
  border-color: rgba(0, 123, 255, 0.4);
}

.dark-mode .filter-select:focus {
  border-color: var(--primary);
  background-color: rgba(0, 0, 0, 0.4);
  box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.15),
              0 4px 16px rgba(0, 123, 255, 0.2);
}

/* Custom option styling - Professional & Minimalistic */
.filter-select option {
  padding: 12px 16px;
  background: white;
  color: #2a2a2a;
  font-weight: 500;
  font-size: 0.95rem;
  line-height: 1.6;
  letter-spacing: 0.01em;
  cursor: pointer;
}

.filter-select option:first-child {
  font-weight: 600;
  color: #4a4a4a;
  background: rgba(0, 123, 255, 0.03);
}

.filter-select option:hover,
.filter-select option:focus {
  background: rgba(0, 123, 255, 0.08);
  color: var(--primary);
}

.filter-select option:checked {
  background: rgba(0, 123, 255, 0.12);
  color: var(--primary);
  font-weight: 600;
}

/* Dark Mode Options */
.dark-mode .filter-select option {
  background: #1e1e1e;
  color: #e0e0e0;
}

.dark-mode .filter-select option:first-child {
  background: rgba(0, 123, 255, 0.08);
  color: #b0b0b0;
}

.dark-mode .filter-select option:hover,
.dark-mode .filter-select option:focus {
  background: rgba(0, 123, 255, 0.15);
  color: #4da3ff;
}

.dark-mode .filter-select option:checked {
  background: rgba(0, 123, 255, 0.25);
  color: #4da3ff;
}

.loading-state {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 80px 32px;
  border-radius: 20px;
  text-align: center;
  color: var(--text-muted);
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  font-size: 1.1rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.dark-mode .loading-state {
  background: rgba(20, 20, 25, 0.6);
  border-color: rgba(255, 255, 255, 0.08);
}

.empty-state {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 80px 32px;
  border-radius: 20px;
  text-align: center;
  color: var(--text-muted);
  font-size: 1.15rem;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
}

.dark-mode .empty-state {
  background: rgba(20, 20, 25, 0.6);
  border-color: rgba(255, 255, 255, 0.08);
}

.candidates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 32px;
  animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.candidate-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06),
              0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.candidate-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--primary);
  opacity: 0;
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.candidate-card:hover::before {
  opacity: 1;
}

.candidate-card:hover {
  transform: translateY(-8px) scale(1.01);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12),
              0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: rgba(0, 123, 255, 0.2);
}

.dark-mode .candidate-card {
  background: rgba(20, 20, 30, 0.7);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.dark-mode .candidate-card:hover {
  border-color: rgba(0, 123, 255, 0.3);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.candidate-avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary) 0%, #0056b3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0 auto 24px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 123, 255, 0.25),
              0 4px 16px rgba(0, 0, 0, 0.1);
  border: 4px solid rgba(255, 255, 255, 0.9);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.candidate-card:hover .candidate-avatar {
  transform: scale(1.08);
  box-shadow: 0 16px 50px rgba(0, 123, 255, 0.35),
              0 6px 20px rgba(0, 0, 0, 0.15);
}

.dark-mode .candidate-avatar {
  border-color: rgba(20, 20, 30, 0.9);
}

.candidate-avatar .avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.candidate-info {
  text-align: center;
}

.candidate-info h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 8px;
  letter-spacing: -0.01em;
}

.experience {
  color: var(--text-muted);
  margin-bottom: 20px;
  font-size: 0.95rem;
  font-weight: 500;
}

.skills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;
}

.skill-tag {
  background: rgba(0, 123, 255, 0.08);
  color: var(--primary);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  border: 1px solid rgba(0, 123, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.skill-tag:hover {
  transform: translateY(-2px);
  background: rgba(0, 123, 255, 0.12);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
  border-color: var(--primary);
}

.dark-mode .skill-tag {
  background: rgba(0, 123, 255, 0.12);
  border-color: rgba(0, 123, 255, 0.3);
}

.dark-mode .skill-tag:hover {
  background: rgba(0, 123, 255, 0.18);
}

.badges {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
}

.badge-icon {
  font-size: 1.5rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  animation: bounceIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes bounceIn {
  from {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.badge-count {
  color: var(--text-muted);
  font-size: 0.95rem;
  font-weight: 600;
}

.candidate-actions {
  display: flex;
  gap: 8px;
  margin-top: 20px;
}

.candidate-actions .btn {
  flex: 1;
  padding: 10px 18px;
  font-weight: 500;
  font-size: 0.875rem;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-icon {
  flex-shrink: 0;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.candidate-actions .btn:hover .btn-icon {
  transform: scale(1.08);
}

.candidate-actions .btn-primary {
  background: var(--primary);
  border: none;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.2);
}

.candidate-actions .btn-primary:hover {
  background: #0056b3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.candidate-actions .btn-secondary {
  background: transparent;
  border: 1.5px solid rgba(0, 0, 0, 0.12);
  color: var(--text);
}

.candidate-actions .btn-secondary:hover {
  background: rgba(0, 123, 255, 0.06);
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-1px);
}

.dark-mode .candidate-actions .btn-secondary {
  border-color: rgba(255, 255, 255, 0.15);
}

.dark-mode .candidate-actions .btn-secondary:hover {
  background: rgba(0, 123, 255, 0.12);
}

.rating-summary {
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
}

.rating-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(251, 191, 36, 0.15));
  color: #f59e0b;
  padding: 10px 18px;
  border-radius: 20px;
  font-size: 0.95rem;
  font-weight: 600;
  border: 1px solid rgba(245, 158, 11, 0.25);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.rating-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.25);
}

.rating-star {
  font-size: 1.1rem;
}

.rating-value {
  font-weight: 700;
  font-size: 1rem;
}

.rating-count {
  font-weight: 500;
  opacity: 0.85;
}

.no-rating {
  color: var(--text-muted);
  font-size: 0.9rem;
  font-style: italic;
  font-weight: 500;
}

/* Mobile & Tablet Responsiveness */
@media (max-width: 1024px) {
  .candidates-page {
    padding: 40px 32px 60px;
  }

  .candidates-grid {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .candidates-page {
    padding: 32px 20px 48px;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .page-header p {
    font-size: 1rem;
  }

  .filters-section {
    padding: 24px;
  }

  .filter-row {
    flex-direction: column;
  }

  .candidates-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .candidate-card {
    padding: 24px;
  }

  .candidate-avatar {
    width: 80px;
    height: 80px;
  }

  .candidate-info h3 {
    font-size: 1.35rem;
  }

  .candidate-actions {
    flex-direction: column;
    gap: 8px;
    margin-top: 16px;
  }

  .candidate-actions .btn {
    width: 100%;
    padding: 11px 16px;
  }
}

@media (max-width: 480px) {
  .candidates-page {
    padding: 24px 16px 40px;
  }

  .page-header {
    margin-bottom: 32px;
  }

  .filters-section {
    padding: 20px;
  }

  .search-input {
    padding: 14px 16px;
  }

  .filter-select {
    padding: 14px 44px 14px 16px;
    background-position: right 12px center;
    background-size: 18px;
  }
}
</style>


