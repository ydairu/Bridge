<template>
  <div class="home">
    <!-- ── Unauthenticated Hero ─────────────────────────────── -->
    <template v-if="!isAuthenticated">
      <!-- Full-screen carousel hero -->
      <section class="hero-section">
        <!-- Carousel Background -->
        <div class="hero-bg">
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
          <!-- Subtle bottom-fade so text reads on any image -->
          <div class="hero-fade-bottom"></div>
        </div>

        <!-- Hero content -->
        <div class="hero-content">
          <AnimatedHeading
            :text="heroHeadingText"
            class="hero-title"
            :initialDelay="200"
            :charDelay="28"
          />

          <FadeIn :delay="900" :duration="900" class="hero-sub-wrap">
            <p class="hero-subtitle">
              Bridge connects migrant workers in Singapore directly with employers
              — no agencies, no hidden fees, no empty promises.
            </p>
          </FadeIn>

          <FadeIn :delay="1300" :duration="800" class="hero-actions-wrap">
            <div class="hero-actions">
              <router-link to="/register" class="btn-hero-primary">Find jobs now</router-link>
              <router-link to="/login"    class="btn-hero-glass">Sign in</router-link>
            </div>
          </FadeIn>
        </div>

        <!-- Carousel navigation -->
        <div class="carousel-dots">
          <button
            v-for="(image, index) in heroImages"
            :key="index"
            @click="currentSlide = index"
            class="dot"
            :class="{ active: currentSlide === index }"
            :aria-label="`Slide ${index + 1}`"
          ></button>
        </div>
        <button @click="previousSlide" class="carousel-arrow carousel-arrow-prev" aria-label="Previous">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button @click="nextSlide" class="carousel-arrow carousel-arrow-next" aria-label="Next">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </section>

      <!-- How It Works -->
      <section class="content-section">
        <HowItWorks />
      </section>

      <!-- Stats -->
      <section class="content-section alt">
        <StatsSection />
      </section>

      <!-- Category Chips -->
      <section class="content-section">
        <div class="section-container">
          <div class="section-header">
            <h2 class="section-title">Explore Opportunities</h2>
            <p class="section-description">
              Browse jobs by category and find the perfect match for your skills
            </p>
          </div>
          <CategoryChips @category-selected="onCategorySelected" />
        </div>
      </section>

      <!-- CTA -->
      <section class="cta-section">
        <div class="section-container">
          <div class="cta-content">
            <div class="cta-icon">
              <img src="../assets/briefcase.svg" alt="Briefcase" class="cta-icon-img" />
            </div>
            <h2 class="cta-title">Ready to Find Your Next Job?</h2>
            <p class="cta-description">
              Browse through hundreds of job opportunities from top employers in Singapore
            </p>
            <router-link to="/browse-jobs" class="btn btn-primary btn-cta">
              Browse All Jobs
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </router-link>
          </div>
        </div>
      </section>
    </template>

    <!-- ── Authenticated Job Seeker Dashboard ──────────────── -->
    <template v-else-if="isJobSeeker">
      <!-- Greeting hero -->
      <section class="dash-hero">
        <div class="section-container">
          <div class="hero-greeting">
            <div class="greeting-avatar">
              <img v-if="userProfile?.photoURL" :src="userProfile.photoURL" :alt="userName" class="avatar-img" />
              <span v-else>{{ userName.charAt(0).toUpperCase() }}</span>
            </div>
            <div class="greeting-text">
              <h1 class="greeting-title">
                {{ timeBasedGreeting }}, <span class="greeting-name">{{ userName }}!</span>
              </h1>
              <p class="greeting-subtitle">{{ personalizedMessage }}</p>
            </div>
          </div>

          <!-- Quick stats -->
          <div class="stats-grid">
            <div class="stat-card" @click="$router.push('/applications')">
              <div class="stat-icon stat-blue">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div class="stat-body">
                <div class="stat-value">{{ totalApplications }}</div>
                <div class="stat-label">Total Applications</div>
              </div>
            </div>

            <div class="stat-card" @click="$router.push('/applications')">
              <div class="stat-icon stat-amber">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="stat-body">
                <div class="stat-value">{{ pendingApplications }}</div>
                <div class="stat-label">Pending</div>
              </div>
            </div>

            <div class="stat-card" @click="$router.push('/profile')">
              <div class="stat-icon stat-green">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="stat-body">
                <div class="stat-value">{{ profileCompletion }}%</div>
                <div class="stat-label">Profile Complete</div>
              </div>
            </div>

            <div class="stat-card" @click="$router.push('/browse-jobs')">
              <div class="stat-icon stat-purple">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div class="stat-body">
                <div class="stat-value">{{ recommendedJobsCount }}</div>
                <div class="stat-label">Recommended Jobs</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Recent Applications -->
      <section class="content-section" v-if="recentApplications.length > 0">
        <div class="section-container">
          <div class="section-header-row">
            <div>
              <h2 class="section-title">Recent Applications</h2>
              <p class="section-desc">Track the status of your latest job applications</p>
            </div>
            <router-link to="/applications" class="view-all">
              View All
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </router-link>
          </div>

          <div class="app-grid">
            <div
              v-for="app in recentApplications.slice(0, 3)"
              :key="app.id"
              class="app-card"
              @click="$router.push(`/applications/${app.id}`)"
            >
              <div class="app-header">
                <div class="app-info">
                  <h3 class="app-title">{{ app.jobTitle }}</h3>
                  <p class="app-company">{{ app.company }}</p>
                </div>
                <span class="app-status" :class="`status-${app.status}`">{{ formatStatus(app.status) }}</span>
              </div>
              <div class="card-footer">
                <span class="app-date">{{ formatDate(app.createdAt) }}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="app-arrow">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Quick Actions -->
      <section class="content-section alt">
        <div class="section-container">
          <h2 class="section-title">Quick Actions</h2>
          <div class="actions-grid">
            <router-link to="/browse-jobs"   class="action-card">
              <div class="action-icon icon-blue">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3>Browse Jobs</h3>
              <p>Explore new opportunities</p>
            </router-link>

            <router-link to="/profile"       class="action-card">
              <div class="action-icon icon-purple">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3>Update Profile</h3>
              <p>Keep your profile current</p>
            </router-link>

            <router-link to="/quizzes"       class="action-card">
              <div class="action-icon icon-amber">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3>Take Quiz</h3>
              <p>Improve your skills</p>
            </router-link>

            <router-link to="/achievements"  class="action-card">
              <div class="action-icon icon-green">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3>Achievements</h3>
              <p>See your progress</p>
            </router-link>
          </div>
        </div>
      </section>

      <!-- Category Chips -->
      <section class="content-section">
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
import AnimatedHeading from '../components/AnimatedHeading.vue'
import FadeIn from '../components/FadeIn.vue'
import { getCarouselImagesFromConfig } from '../config/carousel.js'

export default {
  name: 'Home',
  components: {
    CategoryChips,
    HowItWorks,
    StatsSection,
    AnimatedHeading,
    FadeIn,
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

    const heroImages = getCarouselImagesFromConfig()

    const timeBasedGreeting = computed(() => {
      const hour = new Date().getHours()
      if (hour < 12) return 'Good Morning'
      if (hour < 17) return 'Good Afternoon'
      return 'Good Evening'
    })

    const userName = computed(() => userProfile.value?.name || 'there')

    const personalizedMessage = computed(() => {
      if (!userProfile.value) return 'Welcome back!'
      const totalApps = totalApplications.value
      const pendingApps = pendingApplications.value
      if (totalApps === 0) return 'Start your job search journey today! Browse opportunities that match your skills.'
      if (pendingApps > 0) return `You have ${pendingApps} ${pendingApps === 1 ? 'application' : 'applications'} pending. Keep it up!`
      if (profileCompletion.value < 50) return 'Complete your profile to unlock better job recommendations!'
      return 'Your career journey continues. Check out new opportunities below!'
    })

    const totalApplications = computed(() => allApplications.value.length)
    const pendingApplications = computed(() => allApplications.value.filter(a => a.status === 'pending').length)
    const recentApplications = computed(() => allApplications.value.slice(0, 3))

    const profileCompletion = computed(() => {
      if (!userProfile.value) return 0
      let completed = 0
      const fields = ['name', 'email', 'phone', 'skills', 'experience']
      fields.forEach(field => {
        if (userProfile.value[field]) {
          if (field === 'skills' && Array.isArray(userProfile.value[field]) && userProfile.value[field].length > 0) completed++
          else if (field !== 'skills') completed++
        }
      })
      if (userProfile.value.photoURL) completed += 0.5
      return Math.min(100, Math.round((completed / fields.length) * 100))
    })

    const recommendedJobs = computed(() => {
      if (!userProfile.value || !allJobs.value.length) return []
      const userSkills = userProfile.value.skills || []
      if (userSkills.length === 0) return allJobs.value.slice(0, 6)
      const scoredJobs = allJobs.value.map(job => {
        let score = 0
        const jobCategory = job.category?.toLowerCase() || ''
        userSkills.forEach(skill => {
          const skillLower = skill.toLowerCase()
          if (jobCategory.includes(skillLower) || job.title?.toLowerCase().includes(skillLower)) score += 2
          if (job.description?.toLowerCase().includes(skillLower)) score += 1
        })
        return { ...job, score }
      })
      return scoredJobs.sort((a, b) => b.score - a.score).filter(j => j.score > 0 || scoredJobs.length < 6).slice(0, 6).map(({ score, ...j }) => j)
    })

    const recommendedJobsCount = computed(() => recommendedJobs.value.length)

    const heroHeadingText = 'Your skills deserve\na direct path\nforward.'

    const nextSlide = () => { currentSlide.value = (currentSlide.value + 1) % heroImages.length }
    const previousSlide = () => { currentSlide.value = (currentSlide.value - 1 + heroImages.length) % heroImages.length }
    const startAutoSlide = () => { autoSlideInterval = setInterval(nextSlide, 5000) }
    const stopAutoSlide = () => { if (autoSlideInterval) clearInterval(autoSlideInterval) }

    const onCategorySelected = (category) => { router.push(`/browse-jobs?category=${category.id}`) }

    const formatStatus = (status) => ({ pending: 'Pending', accepted: 'Accepted', rejected: 'Rejected' }[status] || status)

    const formatDate = (dateString) => {
      if (!dateString) return 'Recently'
      const date = new Date(dateString)
      const diffDays = Math.ceil(Math.abs(new Date() - date) / (1000 * 60 * 60 * 24))
      if (diffDays === 0) return 'Today'
      if (diffDays === 1) return 'Yesterday'
      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
      return date.toLocaleDateString()
    }

    onMounted(() => {
      store.dispatch('jobs/fetchJobs').catch(console.error)
      if (isAuthenticated.value && currentUser.value) {
        store.dispatch('applications/fetchUserApplications', currentUser.value.uid).catch(console.error)
      }
      if (!isAuthenticated.value) startAutoSlide()
    })

    onUnmounted(stopAutoSlide)

    return {
      isAuthenticated, isJobSeeker, userProfile, loading,
      heroImages, currentSlide, nextSlide, previousSlide,
      timeBasedGreeting, userName, personalizedMessage,
      totalApplications, pendingApplications, recentApplications,
      profileCompletion, recommendedJobs, recommendedJobsCount,
      onCategorySelected, formatStatus, formatDate,
      heroHeadingText,
    }
  }
}
</script>

<style scoped>
/* ─── Shell ─────────────────────────────────────────────────── */
.home {
  width: 100%;
  overflow-x: hidden;
  background: #0A1628;
}

/* ─── Unauthenticated Hero ──────────────────────────────────── */
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.carousel-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.carousel-slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 1s ease;
}

.carousel-slide.active { opacity: 1; }

.carousel-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-slide::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(5, 10, 22, 0.45);
  pointer-events: none;
}

/* Subtle bottom gradient so text is legible without a dark overlay */
.hero-fade-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 65%;
  background: linear-gradient(to top, rgba(5, 10, 22, 0.92) 0%, rgba(5, 10, 22, 0.6) 40%, transparent 100%);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  padding: 0 40px 80px;
  max-width: 820px;
}

.hero-title {
  font-size: clamp(2.8rem, 7vw, 5rem);
  font-weight: 300;
  color: #F0F6FF;
  line-height: 1.08;
  letter-spacing: -0.02em;
  margin-bottom: 24px;
  transform: translateX(32px);
}

.hero-sub-wrap { display: block; }

.hero-subtitle {
  font-size: clamp(1rem, 2vw, 1.15rem);
  color: rgba(200, 220, 255, 0.8);
  line-height: 1.65;
  max-width: 540px;
  margin: 0 0 32px;
}

.hero-actions-wrap { display: block; }

.hero-actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.btn-hero-primary {
  background: #fff;
  color: #0A1628;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 12px 28px;
  border-radius: 10px;
  text-decoration: none;
  transition: background 0.2s, transform 0.15s;
}

.btn-hero-primary:hover {
  background: #e8f0ff;
  transform: translateY(-1px);
}

.btn-hero-glass {
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 500;
  padding: 12px 28px;
  border-radius: 10px;
  text-decoration: none;
  transition: background 0.2s, border-color 0.2s;
}

.btn-hero-glass:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.35);
  color: #fff;
}

/* Carousel controls */
.carousel-dots {
  position: absolute;
  bottom: 28px;
  right: 40px;
  display: flex;
  gap: 8px;
  z-index: 3;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.35);
  cursor: pointer;
  transition: all 0.25s;
  padding: 0;
}

.dot:hover { background: rgba(255, 255, 255, 0.6); }
.dot.active { background: #fff; width: 22px; border-radius: 4px; }

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  z-index: 3;
  padding: 0;
}

.carousel-arrow:hover { background: rgba(255, 255, 255, 0.15); }
.carousel-arrow-prev { left: 20px; }
.carousel-arrow-next { right: 20px; }

/* ─── Content Sections ──────────────────────────────────────── */
.content-section {
  padding: 80px 0;
  background: #0A1628;
}

.content-section.alt {
  background: rgba(8, 16, 32, 0.9);
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.section-header {
  text-align: center;
  margin-bottom: 48px;
}

.section-title {
  font-size: clamp(1.75rem, 4vw, 2.4rem);
  font-weight: 600;
  color: #F0F6FF;
  margin-bottom: 12px;
}

.section-desc {
  font-size: 1rem;
  color: rgba(200, 220, 255, 0.65);
  max-width: 520px;
  margin: 0 auto;
  line-height: 1.6;
}

/* ─── CTA Section ───────────────────────────────────────────── */
.cta-section {
  padding: 80px 0;
  background: #0A1628;
}

.cta-glass {
  background: rgba(13, 27, 53, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(74, 158, 245, 0.2);
  border-radius: 20px;
  padding: 60px 40px;
  text-align: center;
  max-width: 680px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}

.cta-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(180deg, rgba(74,158,245,0.3) 0%, rgba(74,158,245,0) 60%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

.cta-title {
  font-size: clamp(1.6rem, 3.5vw, 2.2rem);
  font-weight: 600;
  color: #F0F6FF;
  margin-bottom: 12px;
}

.cta-desc {
  font-size: 1rem;
  color: rgba(200, 220, 255, 0.65);
  margin-bottom: 28px;
  line-height: 1.6;
}

.btn-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #1A6FD4;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 13px 32px;
  border-radius: 10px;
  text-decoration: none;
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
}

.btn-cta:hover {
  background: #1560BB;
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(26, 111, 212, 0.4);
}

/* ─── Authenticated: Dash Hero ──────────────────────────────── */
.dash-hero {
  padding: 56px 0 48px;
  background: linear-gradient(180deg, rgba(15,30,60,0.8) 0%, #0A1628 100%);
  border-bottom: 1px solid rgba(74, 158, 245, 0.08);
}

.hero-greeting {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 40px;
}

.greeting-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(26, 111, 212, 0.25);
  border: 2px solid rgba(74, 158, 245, 0.4);
  color: #4A9EF5;
  font-size: 2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.greeting-title {
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  font-weight: 600;
  color: #F0F6FF;
  margin: 0 0 8px;
  line-height: 1.2;
}

.greeting-name { color: #4A9EF5; }

.greeting-subtitle {
  color: rgba(200, 220, 255, 0.65);
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
}

/* ─── Quick Stats ───────────────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  background: rgba(13, 27, 53, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(74, 158, 245, 0.15);
  border-radius: 14px;
  padding: 22px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: border-color 0.2s, transform 0.2s;
}

.stat-card:hover {
  border-color: rgba(74, 158, 245, 0.35);
  transform: translateY(-2px);
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-blue   { background: rgba(74, 158, 245, 0.12); color: #4A9EF5; }
.stat-amber  { background: rgba(245, 158, 11, 0.12);  color: #FCD34D; }
.stat-green  { background: rgba(16, 185, 129, 0.12);  color: #34D399; }
.stat-purple { background: rgba(139, 92, 246, 0.12);  color: #A78BFA; }

.stat-value {
  font-size: 1.9rem;
  font-weight: 700;
  color: #F0F6FF;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.82rem;
  color: rgba(180, 210, 255, 0.6);
  font-weight: 500;
}

/* ─── Section header with action link ──────────────────────── */
.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 28px;
}

.view-all {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #4A9EF5;
  font-size: 0.88rem;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.2s;
}

.view-all:hover { color: #F0F6FF; }

/* ─── Application Cards ─────────────────────────────────────── */
.app-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.app-card {
  background: rgba(13, 27, 53, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(74, 158, 245, 0.15);
  border-radius: 14px;
  padding: 20px;
  cursor: pointer;
  transition: border-color 0.2s, transform 0.2s;
}

.app-card:hover {
  border-color: rgba(74, 158, 245, 0.35);
  transform: translateY(-2px);
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.app-title {
  font-size: 1rem;
  font-weight: 600;
  color: #F0F6FF;
  margin: 0 0 4px;
}

.app-company {
  font-size: 0.82rem;
  color: rgba(180, 210, 255, 0.6);
  margin: 0;
}

.app-status {
  padding: 4px 10px;
  border-radius: 14px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.status-pending  { background: rgba(245,158,11,0.12);  color: #FCD34D; border: 1px solid rgba(245,158,11,0.25); }
.status-accepted { background: rgba(16,185,129,0.12);  color: #34D399; border: 1px solid rgba(16,185,129,0.25); }
.status-rejected { background: rgba(239,68,68,0.12);   color: #FCA5A5; border: 1px solid rgba(239,68,68,0.25); }

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 14px;
  border-top: 1px solid rgba(74, 158, 245, 0.1);
}

.app-date {
  font-size: 0.78rem;
  color: rgba(180, 210, 255, 0.5);
}

.app-arrow {
  color: rgba(180, 210, 255, 0.4);
  transition: transform 0.2s;
}

.app-card:hover .app-arrow { transform: translateX(3px); }

/* ─── Quick Actions ─────────────────────────────────────────── */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.action-card {
  background: rgba(13, 27, 53, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(74, 158, 245, 0.15);
  border-radius: 16px;
  padding: 28px 20px;
  text-align: center;
  text-decoration: none;
  transition: border-color 0.2s, transform 0.2s;
  display: block;
}

.action-card:hover {
  border-color: rgba(74, 158, 245, 0.35);
  transform: translateY(-3px);
}

.action-icon {
  width: 58px;
  height: 58px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.icon-blue   { background: rgba(74, 158, 245, 0.12); color: #4A9EF5; }
.icon-purple { background: rgba(139, 92, 246, 0.12); color: #A78BFA; }
.icon-amber  { background: rgba(245, 158, 11, 0.12);  color: #FCD34D; }
.icon-green  { background: rgba(16, 185, 129, 0.12);  color: #34D399; }

.action-card h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #F0F6FF;
  margin: 0 0 6px;
}

.action-card p {
  font-size: 0.82rem;
  color: rgba(180, 210, 255, 0.55);
  margin: 0;
}

/* ─── Responsive ────────────────────────────────────────────── */
@media (max-width: 768px) {
  .hero-content { padding: 0 20px 60px; }
  .hero-title   { font-size: 2.4rem; }
  .carousel-dots { right: 20px; bottom: 20px; }
  .carousel-arrow-prev { left: 12px; }
  .carousel-arrow-next { right: 12px; }

  .content-section { padding: 56px 0; }
  .cta-glass { padding: 40px 24px; }

  .dash-hero { padding: 40px 0 36px; }
  .hero-greeting { flex-direction: column; text-align: center; }
  .greeting-avatar { margin: 0 auto; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .section-header-row { flex-direction: column; align-items: flex-start; }
  .app-grid { grid-template-columns: 1fr; }
  .actions-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 480px) {
  .stats-grid   { grid-template-columns: 1fr; }
  .actions-grid { grid-template-columns: 1fr; }
  .hero-actions { flex-direction: column; }
  .btn-hero-primary, .btn-hero-glass { text-align: center; }
}
</style>
