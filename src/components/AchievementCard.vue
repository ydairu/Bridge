<template>
  <div
    :class="['achievement-card', { unlocked, locked: !unlocked }]"
    :style="{ animationDelay: `${index * 0.05}s` }"
  >
    <div class="card-content">
      <div class="card-icon" :class="unlocked ? tierClass : 'locked-icon'">
        <template v-if="unlocked">
          <component 
            v-if="iconType === 'lucide' && getLucideIcon(icon)" 
            :is="getLucideIcon(icon)"
            :size="32"
            :stroke-width="2.5"
            class="badge-icon-lucide"
          />
          <span v-else class="badge-icon-emoji">{{ icon }}</span>
        </template>
        <img v-else :src="lockIcon" alt="Locked" class="lock-icon" />
      </div>
      <div class="card-details">
        <div class="card-header">
          <div>
            <h3>{{ title }}</h3>
            <p class="description">{{ description }}</p>
          </div>
        </div>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${progressPercent}%` }"></div>
          </div>
          <p class="progress-text">{{ progress }} / {{ requirement }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import medalIcon from '../assets/medal.svg'
import lockIcon from '../assets/lock.svg'
import * as LucideIcons from 'lucide-vue-next'

export default {
  name: 'AchievementCard',
  data() {
    return {
      medalIcon,
      lockIcon
    }
  },
  methods: {
    getLucideIcon(iconName) {
      if (!iconName) return null
      return LucideIcons[iconName] || null
    }
  },
  props: {
    icon: {
      type: String,
      required: true
    },
    iconType: {
      type: String,
      default: 'emoji'
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    progress: {
      type: Number,
      default: 0
    },
    requirement: {
      type: Number,
      required: true
    },
    unlocked: {
      type: Boolean,
      default: false
    },
    tier: {
      type: String,
      default: 'bronze'
    },
    index: {
      type: Number,
      default: 0
    }
  },
  computed: {
    progressPercent() {
      return Math.min((this.progress / this.requirement) * 100, 100)
    },
    tierClass() {
      return `tier-${this.tier}`
    }
  }
}
</script>

<style scoped>
.achievement-card {
  background: rgba(13, 27, 53, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(74, 158, 245, 0.15);
  border-radius: 1rem;
  padding: 1.5rem;
  transition: all 0.3s ease;
  animation: fadeIn 0.6s ease-out both;
}

.achievement-card.locked {
  opacity: 0.4;
  filter: grayscale(100%) brightness(0.7) contrast(0.8);
  border-color: rgba(74, 158, 245, 0.06);
  box-shadow: none;
}

.achievement-card:hover:not(.locked) {
  transform: translateY(-2px);
  border-color: rgba(74, 158, 245, 0.3);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.achievement-card.locked:hover {
  transform: none;
  cursor: not-allowed;
}

.card-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.card-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

.card-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 50%, rgba(255, 255, 255, 0.3) 100%);
  background-size: 200% 200%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.achievement-card:hover:not(.locked) .card-icon {
  transform: rotate(12deg) scale(1.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.achievement-card:hover:not(.locked) .card-icon::before {
  animation: shimmer 2s ease-in-out infinite;
  opacity: 1;
}

@keyframes shimmer {
  0%, 100% {
    background-position: 200% center;
  }
  50% {
    background-position: -200% center;
  }
}

.badge-icon-lucide {
  color: white;
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.3));
  transition: all 0.3s ease;
}

.achievement-card:hover:not(.locked) .badge-icon-lucide {
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
  transform: scale(1.05);
}

.badge-icon-svg {
  width: 32px;
  height: 32px;
  filter: brightness(0) invert(1) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.badge-icon-emoji {
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.medal-icon {
  width: 28px;
  height: 28px;
  filter: brightness(0) invert(1);
}

.lock-icon {
  width: 28px;
  height: 28px;
  opacity: 0.5;
  filter: brightness(1) saturate(0) invert(1);
}

.locked-icon {
  background: linear-gradient(135deg, rgba(74, 158, 245, 0.15) 0%, rgba(26, 111, 212, 0.1) 100%);
  color: rgba(180, 210, 255, 0.5);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.tier-bronze {
  background: linear-gradient(135deg, #cd7f32 0%, #d4af37 50%, #b8860b 100%);
  box-shadow: 0 4px 16px rgba(205, 127, 50, 0.4);
}

.tier-silver {
  background: linear-gradient(135deg, #e8e8e8 0%, #c0c0c0 50%, #a8a8a8 100%);
  box-shadow: 0 4px 16px rgba(192, 192, 192, 0.5);
}

.tier-gold {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffc107 100%);
  box-shadow: 0 4px 20px rgba(255, 215, 0, 0.6);
  animation: goldGlow 3s ease-in-out infinite;
}

@keyframes goldGlow {
  0%, 100% {
    box-shadow: 0 4px 20px rgba(255, 215, 0, 0.6);
  }
  50% {
    box-shadow: 0 4px 28px rgba(255, 215, 0, 0.8);
  }
}

.tier-platinum {
  background: linear-gradient(135deg, #e5e4e2 0%, #b0c4de 50%, #8b9dc3 100%);
  box-shadow: 0 4px 20px rgba(79, 70, 229, 0.5);
  animation: platinumPulse 3s ease-in-out infinite;
  position: relative;
}

@keyframes platinumPulse {
  0%, 100% {
    box-shadow: 0 4px 20px rgba(79, 70, 229, 0.5), 0 0 30px rgba(147, 51, 234, 0.3);
  }
  50% {
    box-shadow: 0 4px 28px rgba(79, 70, 229, 0.7), 0 0 40px rgba(147, 51, 234, 0.5);
  }
}

.tier-platinum::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 0.85rem;
  background: linear-gradient(135deg, rgba(147, 51, 234, 0.3), rgba(79, 70, 229, 0.3));
  z-index: -1;
  opacity: 0.6;
  animation: platinumBorder 3s ease-in-out infinite;
}

@keyframes platinumBorder {
  0%, 100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.card-details {
  flex: 1;
  min-width: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.card-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 0.25rem;
}

.achievement-card.locked .card-header h3 {
  color: var(--text-muted);
  opacity: 0.7;
}

.description {
  font-size: 0.875rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.achievement-card.locked .description {
  opacity: 0.5;
}

.achievement-card.locked .progress-bar {
  opacity: 0.5;
}

.achievement-card.locked .progress-text {
  opacity: 0.6;
}

.progress-container {
  margin-top: 0.75rem;
}

.progress-bar {
  height: 8px;
  background: rgba(74, 158, 245, 0.12);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: #1A6FD4;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  color: var(--text-muted);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>

