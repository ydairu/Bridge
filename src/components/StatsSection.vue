<template>
  <div ref="sectionRef" class="stats-section">
    <div class="stats-container">
      <div class="section-header">
        <h2 class="section-title">{{ t('home.trustedTitle') }}</h2>
        <p class="section-description">
          {{ t('home.trustedDescription') }}
        </p>
      </div>
      
      <div class="stats-grid">
        <StatsCard
          v-for="(stat, index) in stats"
          :key="index"
          :stat="stat"
          :index="index"
          :isVisible="isVisible"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import StatsCard from './StatsCard.vue'
import usersIcon from '../assets/user.svg'
import buildingIcon from '../assets/corporate.svg'
import briefcaseIcon from '../assets/briefcase.svg'

export default {
  name: 'StatsSection',
  components: {
    StatsCard
  },
  setup() {
    const { t } = useI18n()
    const sectionRef = ref(null)
    const isVisible = ref(false)

    const stats = computed(() => [
      {
        icon: usersIcon,
        value: 10000,
        suffix: '+',
        label: t('home.activeSeekers'),
        color: 'blue'
      },
      {
        icon: buildingIcon,
        value: 5000,
        suffix: '+',
        label: t('home.registeredEmployers'),
        color: 'purple'
      },
      {
        icon: '/icons/file-text.svg',
        value: 15000,
        suffix: '+',
        label: t('home.jobsPosted'),
        color: 'orange'
      },
      {
        icon: briefcaseIcon,
        value: 8000,
        suffix: '+',
        label: t('home.successfulHires'),
        color: 'green'
      }
    ])

    onMounted(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            isVisible.value = true
          }
        },
        { threshold: 0.2 }
      )

      if (sectionRef.value) {
        observer.observe(sectionRef.value)
      }

      return () => {
        if (sectionRef.value) {
          observer.unobserve(sectionRef.value)
        }
      }
    })

    return {
      sectionRef,
      isVisible,
      stats,
      t
    }
  }
}
</script>

<style scoped>
.stats-section {
  width: 100%;
  padding: 80px 0;
}

.stats-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .stats-container {
    padding: 0 1.5rem;
  }
}

@media (min-width: 1024px) {
  .stats-container {
    padding: 0 2rem;
  }
}

.section-header {
  text-align: center;
  margin-bottom: 64px;
}

.section-title {
  font-size: clamp(1.875rem, 4vw, 2.25rem);
  font-weight: 700;
  color: var(--text);
  margin-bottom: 16px;
  line-height: 1.2;
}

.section-description {
  font-size: clamp(1rem, 2vw, 1.125rem);
  color: var(--text-muted);
  max-width: 42rem;
  margin: 0 auto;
  line-height: 1.6;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 767px) {
  .stats-section {
    padding: 48px 0;
  }
  
  .section-header {
    margin-bottom: 40px;
  }
}
</style>
