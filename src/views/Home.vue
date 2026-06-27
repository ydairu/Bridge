<template>
  <div class="home">
    <!-- Logged Out Home Page -->
    <template v-if="!isAuthenticated">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title">
              <GradientText
                :colors="['var(--primary)', '#ffffff', 'oklch(0.7 0.1 245)', '#ffffff', 'var(--primary)']"
                :animationSpeed="3"
              >
                BRIDGE
              </GradientText>
            </h1>
            <p class="hero-subtitle">
              <TextType 
                :text="[$t('hero.line1'), $t('hero.line2'), $t('hero.line3')]"
                :typingSpeed="75"
                :pauseDuration="2000"
                :showCursor="true"
                cursorCharacter="|"
              />
            </p>
            <p class="hero-description">
              {{ $t('hero.description') }}
            </p>
            <div class="hero-actions">
              <router-link to="/login" class="btn btn-primary btn-hero">
                {{ $t('auth.signIn') }}
              </router-link>
              <router-link to="/register" class="btn btn-secondary btn-hero">
                {{ $t('nav.signUp') }}
              </router-link>
            </div>
          </div>
        </div>
        
        <!-- Carousel Background -->
        <div class="hero-bg">
          <div class="carousel-container">
            <div class="carousel-wrapper">
              <div
                class="carousel-slide"
                :class="{ active: currentSlide === index }"
                v-for="(image, index) in heroImages"
                :key="index"
              >
                <img :src="image.src" :alt="image.alt" />
              </div>
            </div>

            <!-- Carousel Navigation Dots -->
            <div class="carousel-dots">
              <button
                v-for="(image, index) in heroImages"
                :key="index"
                @click="currentSlide = index"
                class="dot"
                :class="{ active: currentSlide === index }"
                :aria-label="`Go to slide ${index + 1}`"
              ></button>
            </div>

            <!-- Carousel Arrows -->
            <button 
              @click="previousSlide" 
              class="carousel-arrow carousel-arrow-prev"
              aria-label="Previous slide"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              @click="nextSlide" 
              class="carousel-arrow carousel-arrow-next"
              aria-label="Next slide"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div class="hero-overlay"></div>
        </div>
      </section>

      <!-- How It Works Section -->
      <section class="how-it-works-section">
        <HowItWorks />
      </section>

      <!-- Stats Section -->
      <section class="stats-section">
        <StatsSection />
      </section>
      
      <!-- Category Chips Section -->
      <section class="categories-section">
        <div class="section-container">
          <div class="section-header">
            <h2 class="section-title">{{ $t('home.exploreTitle') }}</h2>
            <p class="section-description">
              {{ $t('home.exploreDescription') }}
            </p>
          </div>
          <CategoryChips @category-selected="onCategorySelected" />
        </div>
      </section>

      <!-- Call to Action Section -->
      <section class="cta-section">
        <div class="section-container">
          <div class="cta-content">
            <div class="cta-icon">
              <img src="../assets/briefcase.svg" :alt="$t('marketplace.browse')" class="cta-icon-img" />
            </div>
            <h2 class="cta-title">{{ $t('home.ctaTitle') }}</h2>
            <p class="cta-description">
              {{ $t('home.ctaDescription') }}
            </p>
            <router-link to="/browse-jobs" class="btn btn-primary btn-cta">
              {{ $t('home.ctaButton') }}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </router-link>
          </div>
        </div>
      </section>
    </template>

    <!-- Job Seeker Personalized Home Page -->
    <template v-else-if="isJobSeeker">
      <!-- Personalized Hero Section -->
      <section class="personalized-hero">
        <div class="hero-gradient-bg"></div>
        <div class="section-container">
          <div class="hero-content-wrapper">
            <div class="hero-greeting">
              <div class="greeting-icon">
                <img v-if="userProfile?.photoURL" :src="userProfile.photoURL" :alt="userName" class="profile-avatar" />
                <div v-else class="avatar-placeholder">
                  {{ userName.charAt(0).toUpperCase() }}
                </div>
              </div>
              <div class="greeting-text">
                <h1 class="greeting-title">
                  <span class="greeting-time">{{ timeBasedGreeting }}</span>
                  <span class="greeting-name">{{ userName }}!</span>
                </h1>
                <p class="greeting-subtitle">{{ personalizedMessage }}</p>
              </div>
            </div>
            
            <!-- Quick Stats Cards -->
            <div class="quick-stats-grid">
              <div class="quick-stat-card" @click="$router.push('/applications')">
                <div class="stat-icon-wrapper stat-primary">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ totalApplications }}</div>
                  <div class="stat-label">Total Applications</div>
                </div>
              </div>

              <div class="quick-stat-card" @click="$router.push('/applications')">
                <div class="stat-icon-wrapper stat-warning">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ pendingApplications }}</div>
                  <div class="stat-label">Pending</div>
                </div>
              </div>

              <div class="quick-stat-card" @click="$router.push('/profile')">
                <div class="stat-icon-wrapper stat-success">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ profileCompletion }}%</div>
                  <div class="stat-label">Profile Complete</div>
                </div>
              </div>

              <div class="quick-stat-card" @click="$router.push('/browse-jobs')">
                <div class="stat-icon-wrapper stat-info">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ recommendedJobsCount }}</div>
                  <div class="stat-label">Recommended Jobs</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Recent Applications Section -->
      <section class="recent-applications-section" v-if="recentApplications.length > 0">
        <div class="section-container">
          <div class="section-header-with-action">
            <div>
              <h2 class="section-title">Recent Applications</h2>
              <p class="section-description">
                Track the status of your latest job applications
              </p>
            </div>
            <router-link to="/applications" class="view-all-link">
              View All <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </router-link>
          </div>
          
          <div class="applications-list">
            <div
              v-for="application in recentApplications.slice(0, 3)"
              :key="application.id"
              class="application-card"
              @click="$router.push(`/applications/${application.id}`)"
            >
              <div class="application-header">
                <div class="application-info">
                  <h3 class="application-job-title">{{ application.jobTitle }}</h3>
                  <p class="application-company">{{ application.company }}</p>
                </div>
                <div class="application-status" :class="`status-${application.status}`">
                  {{ formatStatus(application.status) }}
                </div>
              </div>
              <div class="application-footer">
                <span class="application-date">{{ formatDate(application.createdAt) }}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Quick Actions Section -->
      <section class="quick-actions-section">
        <div class="section-container">
          <h2 class="section-title">Quick Actions</h2>
          <div class="actions-grid">
            <router-link to="/browse-jobs" class="action-card action-primary">
              <div class="action-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3>Browse Jobs</h3>
              <p>Explore new opportunities</p>
            </router-link>

            <router-link to="/profile" class="action-card action-secondary">
              <div class="action-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3>Update Profile</h3>
              <p>Keep your profile current</p>
            </router-link>

            <router-link to="/quizzes" class="action-card action-accent">
              <div class="action-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3>Take Quiz</h3>
              <p>Improve your skills</p>
            </router-link>

            <router-link to="/achievements" class="action-card action-tertiary">
              <div class="action-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3>View Achievements</h3>
              <p>See your progress</p>
            </router-link>
          </div>
        </div>
      </section>

      <!-- Category Chips Section -->
      <section class="categories-section">
        <div class="section-container">
          <CategoryChips @category-selected="onCategorySelected" />
        </div>
      </section>
    </template>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import CategoryChips from '../components/CategoryChips.vue'
import HowItWorks from '../components/HowItWorks.vue'
import StatsSection from '../components/StatsSection.vue'
import GradientText from '../components/GradientText.vue'
import TextType from '../components/TextType.vue'
import JobCard from '../components/JobCard.vue'
import { getCarouselImagesFromConfig } from '../config/carousel.js'

export default {
  name: 'Home',
  components: {
    CategoryChips,
    HowItWorks,
    StatsSection,
    TextType,
    GradientText,
    JobCard
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const loading = computed(() => store.getters['jobs/loading'])
    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
    const isJobSeeker = computed(() => store.getters['auth/isJobSeeker'])
    const userProfile = computed(() => store.getters['auth/userProfile'])
    const currentUser = computed(() => store.getters['auth/currentUser'])
    const allJobs = computed(() => store.getters['jobs/allJobs'])
    const allApplications = computed(() => store.getters['applications/allApplications'])
    
    const currentSlide = ref(0)
    let autoSlideInterval = null

    // Automatically load ALL images from src/assets/carousel/ folder
    const heroImages = getCarouselImagesFromConfig()

    // Personalized greeting based on time of day
    const timeBasedGreeting = computed(() => {
      const hour = new Date().getHours()
      if (hour < 12) return 'Good Morning'
      if (hour < 17) return 'Good Afternoon'
      return 'Good Evening'
    })

    // User's name
    const userName = computed(() => {
      return userProfile.value?.name || 'there'
    })

    // Personalized message
    const personalizedMessage = computed(() => {
      if (!userProfile.value) return 'Welcome back!'
      
      const totalApps = totalApplications.value
      const pendingApps = pendingApplications.value
      
      if (totalApps === 0) {
        return 'Start your job search journey today! Browse opportunities that match your skills.'
      } else if (pendingApps > 0) {
        return `You have ${pendingApps} ${pendingApps === 1 ? 'application' : 'applications'} pending. Keep it up!`
      } else if (profileCompletion.value < 50) {
        return 'Complete your profile to unlock better job recommendations!'
      } else {
        return 'Your career journey continues. Check out new opportunities below!'
      }
    })

    // Total applications
    const totalApplications = computed(() => {
      return allApplications.value.length
    })

    // Pending applications
    const pendingApplications = computed(() => {
      return allApplications.value.filter(app => app.status === 'pending').length
    })

    // Recent applications (last 3)
    const recentApplications = computed(() => {
      return allApplications.value.slice(0, 3)
    })

    // Profile completion percentage
    const profileCompletion = computed(() => {
      if (!userProfile.value) return 0
      
      let completed = 0
      const fields = ['name', 'email', 'phone', 'skills', 'experience']
      
      fields.forEach(field => {
        if (userProfile.value[field]) {
          if (field === 'skills' && Array.isArray(userProfile.value[field]) && userProfile.value[field].length > 0) {
            completed++
          } else if (field !== 'skills') {
            completed++
          }
        }
      })
      
      // Add photo as bonus
      if (userProfile.value.photoURL) completed += 0.5
      
      return Math.min(100, Math.round((completed / fields.length) * 100))
    })

    // Recommended jobs based on skills
    const recommendedJobs = computed(() => {
      if (!userProfile.value || !allJobs.value.length) return []
      
      const userSkills = userProfile.value.skills || []
      if (userSkills.length === 0) return allJobs.value.slice(0, 6)
      
      // Score jobs based on category match with skills
      const scoredJobs = allJobs.value.map(job => {
        let score = 0
        const jobCategory = job.category?.toLowerCase() || ''
        
        userSkills.forEach(skill => {
          const skillLower = skill.toLowerCase()
          if (jobCategory.includes(skillLower) || job.title?.toLowerCase().includes(skillLower)) {
            score += 2
          }
          if (job.description?.toLowerCase().includes(skillLower)) {
            score += 1
          }
        })
        
        return { ...job, score }
      })
      
      // Sort by score and return top matches
      return scoredJobs
        .sort((a, b) => b.score - a.score)
        .filter(job => job.score > 0 || scoredJobs.length < 6)
        .slice(0, 6)
        .map(({ score, ...job }) => job)
    })

    const recommendedJobsCount = computed(() => {
      return recommendedJobs.value.length
    })

    const nextSlide = () => {
      currentSlide.value = (currentSlide.value + 1) % heroImages.length
    }

    const previousSlide = () => {
      currentSlide.value = (currentSlide.value - 1 + heroImages.length) % heroImages.length
    }

    const startAutoSlide = () => {
      autoSlideInterval = setInterval(() => {
        nextSlide()
      }, 5000)
    }

    const stopAutoSlide = () => {
      if (autoSlideInterval) {
        clearInterval(autoSlideInterval)
      }
    }

    const onCategorySelected = (category) => {
      router.push(`/browse-jobs?category=${category.id}`)
    }

    const formatStatus = (status) => {
      const statusMap = {
        pending: 'Pending',
        accepted: 'Accepted',
        rejected: 'Rejected'
      }
      return statusMap[status] || status
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

    const fetchJobs = async () => {
      try {
        await store.dispatch('jobs/fetchJobs')
      } catch (error) {
        console.error('Error fetching jobs:', error)
      }
    }

    const fetchApplications = async () => {
      if (isAuthenticated.value && currentUser.value) {
        try {
          await store.dispatch('applications/fetchUserApplications', currentUser.value.uid)
        } catch (error) {
          console.error('Error fetching applications:', error)
        }
      }
    }

    onMounted(() => {
      fetchJobs()
      if (isAuthenticated.value) {
        fetchApplications()
      }
      if (!isAuthenticated.value) {
        startAutoSlide()
      }
    })

    onUnmounted(() => {
      stopAutoSlide()
    })

    return {
      isAuthenticated,
      isJobSeeker,
      userProfile,
      loading,
      onCategorySelected,
      heroImages,
      currentSlide,
      nextSlide,
      previousSlide,
      timeBasedGreeting,
      userName,
      personalizedMessage,
      totalApplications,
      pendingApplications,
      recentApplications,
      profileCompletion,
      recommendedJobs,
      recommendedJobsCount,
      formatStatus,
      formatDate
    }
  }
}
</script>

<style scoped>
.home {
  width: 100%;
  overflow-x: hidden;
  background: var(--bg);
}

.dark-mode .home {
  background: var(--bg-dark);
}

/* Hero Section */
.hero-section {
  position: relative;
  min-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 120px 20px 80px;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.hero-text {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: clamp(3rem, 8vw, 5rem);
  color: #fff;
  margin-bottom: 24px;
  font-weight: 700;
  line-height: 1.1;
  animation: fadeInUp 0.8s ease-out;
}

.hero-subtitle {
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  color: #fff;
  margin-bottom: 16px;
  font-weight: 600;
  min-height: 60px;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.hero-description {
  font-size: clamp(1rem, 2vw, 1.125rem);
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 40px;
  line-height: 1.6;
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  animation: fadeInUp 0.8s ease-out 0.6s both;
}

.btn-hero {
  padding: 14px 32px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
  min-width: 140px;
}

.btn-primary.btn-hero {
  background: #fff;
  color: black;
  border: 2px solid #fff;
}

.btn-primary.btn-hero:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.btn-secondary.btn-hero {
  background: transparent;
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.6);
}

.btn-secondary.btn-hero:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.9);
}

/* Hero Background */
.hero-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.4) 100%);
  z-index: 1;
}

/* Carousel Styles */
.carousel-container {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.carousel-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.8s ease-in-out;
}

.carousel-slide.active {
  opacity: 1;
}

.carousel-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Carousel Navigation Dots */
.carousel-dots {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  gap: 10px;
  z-index: 3;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  border-radius: 20px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.dot:hover {
  background: rgba(255, 255, 255, 0.6);
}

.dot.active {
  background: #fff;
  width: 24px;
  border-radius: 5px;
}

/* Carousel Arrows */
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 3;
  padding: 0;
}

.carousel-arrow:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-50%) scale(1.1);
}

.carousel-arrow-prev {
  left: 24px;
}

.carousel-arrow-next {
  right: 24px;
}

/* Section Styles */
.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-header {
  text-align: center;
  margin-bottom: 48px;
}

.section-title {
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 700;
  color: var(--text);
  margin-bottom: 16px;
  line-height: 1.2;
}

.section-description {
  font-size: clamp(1rem, 2vw, 1.125rem);
  color: var(--text-muted);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* How It Works Section */
.how-it-works-section {
  padding: 80px 0;
  background: var(--bg);
}

.dark-mode .how-it-works-section {
  background: var(--bg-dark);
}

/* Stats Section */
.stats-section {
  padding: 80px 0;
  background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.05) 0%, var(--bg) 100%);
}

.dark-mode .stats-section {
  background: var(--bg-dark);
}

/* Categories Section */
.categories-section {
  padding: 80px 0;
  background: var(--bg-light);
}

.dark-mode .categories-section {
  background: var(--bg-dark);
}

/* CTA Section */
.cta-section {
  padding: 100px 0;
  background: linear-gradient(135deg, var(--primary) 0%, oklch(0.4 0.15 245) 100%);
  position: relative;
  overflow: hidden;
}

.cta-section::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.cta-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 700px;
  margin: 0 auto;
}

.cta-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cta-icon-img {
  width: 40px;
  height: 40px;
  filter: brightness(0) invert(1);
}

.cta-title {
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 700;
  color: #fff;
  margin-bottom: 16px;
  line-height: 1.2;
}

.cta-description {
  font-size: clamp(1rem, 2vw, 1.125rem);
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 32px;
  line-height: 1.6;
}

.btn-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 16px 40px;
  font-size: 1.125rem;
  font-weight: 600;
  background: #fff;
  color: var(--primary);
  border: 2px solid #fff;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.btn-cta:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

.btn-icon {
  transition: transform 0.3s ease;
}

.btn-cta:hover .btn-icon {
  transform: translateX(4px);
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-section {
    min-height: 70vh;
    padding: 100px 20px 60px;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .btn-hero {
    width: 100%;
    max-width: 280px;
  }

  .carousel-arrow {
    width: 40px;
    height: 40px;
  }

  .carousel-arrow-prev {
    left: 12px;
  }

  .carousel-arrow-next {
    right: 12px;
  }

  .carousel-dots {
    bottom: 20px;
    padding: 6px 12px;
  }

  .how-it-works-section,
  .stats-section,
  .categories-section {
    padding: 60px 0;
  }

  .cta-section {
    padding: 60px 0;
  }

  .section-header {
    margin-bottom: 32px;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 80px 16px 40px;
  }

  .carousel-dots {
    gap: 8px;
  }

  .dot {
    width: 8px;
    height: 8px;
  }

  .dot.active {
    width: 20px;
  }
}

/* ============================================
   PERSONALIZED JOB SEEKER HOMEPAGE STYLES
   ============================================ */

/* Personalized Hero Section */
.personalized-hero {
  position: relative;
  padding: 100px 0 80px;
  background: linear-gradient(135deg, #0066cc 0%, #8b5cf6 50%, #6366f1 100%);
  overflow: hidden;
  margin-bottom: 0;
}

.hero-gradient-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.12) 0%, transparent 50%),
    radial-gradient(circle at 50% 20%, rgba(139, 92, 246, 0.2) 0%, transparent 60%);
  pointer-events: none;
  animation: gradientShift 15s ease infinite;
}

@keyframes gradientShift {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

.hero-content-wrapper {
  position: relative;
  z-index: 1;
}

.hero-greeting {
  display: flex;
  align-items: center;
  gap: 28px;
  margin-bottom: 56px;
  animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both;
}

.greeting-icon {
  flex-shrink: 0;
  position: relative;
}

.greeting-icon::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1));
  animation: pulseRing 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  z-index: -1;
}

@keyframes pulseRing {
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.3;
  }
}

.profile-avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25),
              0 4px 16px rgba(0, 0, 0, 0.15);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.profile-avatar:hover {
  transform: scale(1.05);
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.3),
              0 6px 20px rgba(0, 0, 0, 0.2);
}

.avatar-placeholder {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.15));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 4px solid rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  font-weight: 700;
  color: #fff;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25),
              0 4px 16px rgba(0, 0, 0, 0.15);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.avatar-placeholder:hover {
  transform: scale(1.05);
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.3),
              0 6px 20px rgba(0, 0, 0, 0.2);
}

.greeting-text {
  flex: 1;
}

.greeting-title {
  font-size: clamp(2.25rem, 5vw, 3.25rem);
  font-weight: 800;
  color: #fff;
  margin: 0 0 12px 0;
  line-height: 1.2;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  letter-spacing: -0.02em;
  text-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.greeting-time {
  opacity: 1;
  animation: fadeIn 0.6s ease-out 0.3s both;
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

.greeting-name {
  background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 50%, #ffffff 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 3s ease-in-out infinite, fadeIn 0.6s ease-out 0.5s both;
  filter: drop-shadow(0 2px 8px rgba(255, 255, 255, 0.3));
}

@keyframes shimmer {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.greeting-subtitle {
  font-size: clamp(1.05rem, 2.2vw, 1.35rem);
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  line-height: 1.6;
  font-weight: 400;
  animation: fadeIn 0.6s ease-out 0.7s both;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Quick Stats Grid */
.quick-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
  animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both;
}

.quick-stat-card {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 20px;
  padding: 28px;
  display: flex;
  align-items: center;
  gap: 20px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12),
              0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.4);
  position: relative;
  overflow: hidden;
}

.quick-stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary), #8b5cf6);
  opacity: 0;
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.quick-stat-card:hover::before {
  opacity: 1;
}

.quick-stat-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.18),
              0 4px 16px rgba(0, 0, 0, 0.12);
  background: #fff;
  border-color: rgba(255, 255, 255, 0.6);
}

.dark-mode .quick-stat-card {
  background: rgba(20, 20, 30, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.dark-mode .quick-stat-card:hover {
  background: rgba(30, 30, 40, 0.8);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6);
}

.stat-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.quick-stat-card:hover .stat-icon-wrapper {
  transform: scale(1.1) rotate(-5deg);
}

.stat-icon-wrapper svg {
  width: 28px;
  height: 28px;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
}

.stat-primary {
  background: rgba(59, 130, 246, 0.1);
  color: rgb(59, 130, 246);
}

.stat-warning {
  background: rgba(249, 115, 22, 0.1);
  color: rgb(249, 115, 22);
}

.stat-success {
  background: rgba(34, 197, 94, 0.1);
  color: rgb(34, 197, 94);
}

.stat-info {
  background: rgba(147, 51, 234, 0.1);
  color: rgb(147, 51, 234);
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-content .stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text);
  line-height: 1.2;
  margin-bottom: 4px;
}

.stat-content .stat-label {
  font-size: 0.875rem;
  color: var(--text-muted);
  font-weight: 500;
}

/* Section Header with Action */
.section-header-with-action {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 24px;
}

.view-all-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--primary);
  font-weight: 600;
  font-size: 0.875rem;
  text-decoration: none;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.view-all-link:hover {
  color: var(--primary);
  gap: 8px;
}

.view-all-link svg {
  transition: transform 0.3s ease;
}

.view-all-link:hover svg {
  transform: translateX(4px);
}

/* Recommended Jobs Section */
.recommended-jobs-section {
  padding: 80px 0;
  background: var(--bg);
}

.jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--bg-light);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: var(--text-muted);
  font-size: 1rem;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  gap: 16px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--bg-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: var(--text);
  margin: 0;
}

.empty-state p {
  color: var(--text-muted);
  margin: 0;
  max-width: 400px;
}

/* Recent Applications Section */
.recent-applications-section {
  padding: 80px 0;
  background: var(--bg-light);
}

.dark-mode .recent-applications-section {
  background: var(--bg-dark);
}

.applications-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.application-card {
  background: var(--bg);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.dark-mode .application-card {
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.application-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary);
}

.application-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.application-info {
  flex: 1;
  min-width: 0;
}

.application-job-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.application-company {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
}

.application-status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
  flex-shrink: 0;
}

.status-pending {
  background: rgba(249, 115, 22, 0.1);
  color: rgb(249, 115, 22);
}

.status-accepted {
  background: rgba(34, 197, 94, 0.1);
  color: rgb(34, 197, 94);
}

.status-rejected {
  background: rgba(239, 68, 68, 0.1);
  color: rgb(239, 68, 68);
}

.application-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.dark-mode .application-footer {
  border-top-color: rgba(255, 255, 255, 0.08);
}

.application-date {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.application-footer svg {
  color: var(--text-muted);
  transition: transform 0.3s ease;
}

.application-card:hover .application-footer svg {
  transform: translateX(4px);
}

/* Quick Actions Section */
.quick-actions-section {
  padding: 80px 0;
  background: var(--bg);
}

.dark-mode .quick-actions-section {
  background: var(--bg-dark);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.action-card {
  background: var(--bg-light);
  border: 2px solid transparent;
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
}

.action-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary);
}

.action-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  transition: all 0.3s ease;
}

.action-primary .action-icon {
  background: rgba(59, 130, 246, 0.1);
  color: rgb(59, 130, 246);
}

.action-secondary .action-icon {
  background: rgba(147, 51, 234, 0.1);
  color: rgb(147, 51, 234);
}

.action-accent .action-icon {
  background: rgba(249, 115, 22, 0.1);
  color: rgb(249, 115, 22);
}

.action-tertiary .action-icon {
  background: rgba(34, 197, 94, 0.1);
  color: rgb(34, 197, 94);
}

.action-card:hover .action-icon {
  transform: scale(1.1) rotate(5deg);
}

.action-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 8px 0;
}

.action-card p {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
}

/* Responsive Design for Personalized Sections */
@media (max-width: 768px) {
  .personalized-hero {
    padding: 60px 0 40px;
  }

  .hero-greeting {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .greeting-icon {
    margin: 0 auto;
  }

  .quick-stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .quick-stat-card {
    padding: 20px;
  }

  .stat-content .stat-value {
    font-size: 1.5rem;
  }

  .section-header-with-action {
    flex-direction: column;
    align-items: flex-start;
  }

  .jobs-grid {
    grid-template-columns: 1fr;
  }

  .applications-list {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .recommended-jobs-section,
  .recent-applications-section,
  .quick-actions-section {
    padding: 60px 0;
  }
}

@media (max-width: 480px) {
  .quick-stats-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .profile-avatar,
  .avatar-placeholder {
    width: 60px;
    height: 60px;
  }

  .greeting-title {
    font-size: 1.75rem;
  }
}
</style>
