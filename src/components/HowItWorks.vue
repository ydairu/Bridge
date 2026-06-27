<template>
  <div class="how-it-works">
    <div class="container">
      <div class="text-center mb-12">
        <h2 class="section-title">{{ t('home.howTitle') }}</h2>
        <p class="section-description">
          {{ t('home.howDescription') }}
        </p>
      </div>

      <div class="steps-grid">
        <div class="connection-line"></div>

        <div
          v-for="(step, index) in steps"
          :key="index"
          class="step-item"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="step-content">
            <div class="step-icon-container">
              <div class="step-icon-wrapper" :class="step.colorClass">
                <div class="step-icon-inner">
                  <img
                    :src="iconSrc(step.icon)"
                    :alt="step.title"
                    class="step-icon"
                  />
                </div>
              </div>
            </div>

            <h3 class="step-title">{{ step.title }}</h3>
            <p class="step-description">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export default {
  name: "HowItWorks",
  setup() {
    const { t } = useI18n()
    const base = import.meta.env.BASE_URL
    const iconSrc = (file) => base + "icons/" + file

    const steps = computed(() => [
      {
        icon: "search.svg",
        title: t('home.browseTitle'),
        description: t('home.browseDescription'),
        colorClass: "gradient-blue",
      },
      {
        icon: "file-text.svg",
        title: t('home.applyTitle'),
        description: t('home.applyDescription'),
        colorClass: "gradient-purple",
      },
      {
        icon: "check-circle.svg",
        title: t('home.matchTitle'),
        description: t('home.matchDescription'),
        colorClass: "gradient-orange",
      },
      {
        icon: "rocket.svg",
        title: t('home.startTitle'),
        description: t('home.startDescription'),
        colorClass: "gradient-green",
      },
    ])

    return { steps, iconSrc, t }
  },
}
</script>

<style scoped>
.how-it-works {
  background: var(--bg);
  padding: 80px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.text-center {
  text-align: center;
}

.mb-12 {
  margin-bottom: 48px;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 16px;
  line-height: 1.2;
}

.section-description {
  font-size: 1.1rem;
  color: var(--text-muted);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
  position: relative;
}

.connection-line {
  display: none;
  position: absolute;
  top: 64px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(to right, transparent, var(--border), transparent);
  z-index: 1;
}

.step-item {
  position: relative;
  opacity: 0;
  transform: translateY(20px);
  animation: slideInUp 0.6s ease-out forwards;
}

.step-content {
  text-align: center;
  position: relative;
}


.step-icon-container {
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
}

.step-icon-wrapper {
  height: 64px;
  width: 64px;
  border-radius: 16px;
  padding: 2px;
  position: relative;
}

.step-icon-inner {
  height: 100%;
  width: 100%;
  border-radius: 16px;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.step-icon-inner::before {
  content: "";
  position: absolute;
  inset: 2px;
  border-radius: 14px;
  z-index: 1;
}

.step-icon {
  width: 28px;
  height: 28px;
  position: relative;
  z-index: 2;
  filter: brightness(0) invert(1);
}

.step-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 8px;
  line-height: 1.3;
}

.step-description {
  font-size: 0.875rem;
  color: var(--text-muted);
  line-height: 1.5;
  max-width: 280px;
  margin: 0 auto;
}

.gradient-blue .step-icon-inner::before {
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
}

.gradient-purple .step-icon-inner::before {
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
}

.gradient-orange .step-icon-inner::before {
  background: linear-gradient(135deg, #f97316, #ef4444);
}

.gradient-green .step-icon-inner::before {
  background: linear-gradient(135deg, #10b981, #059669);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (min-width: 1024px) {  
  .steps-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .how-it-works {
    padding: 60px 0;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .steps-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .step-description {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 1.75rem;
  }
  
  .section-description {
    font-size: 1rem;
  }
}
</style>
