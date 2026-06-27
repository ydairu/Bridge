<template>
  <transition name="badge-slide">
    <div v-if="show && badges.length > 0" class="badge-notification-overlay">
      <div class="badge-notification-card">
        <div class="confetti">
          <div class="confetti-piece" v-for="i in 30" :key="i" 
            :style="{ '--i': i, '--x': Math.random(), '--y': Math.random() }"></div>
        </div>
        
        <div class="badge-header">
          <h2>🎉 New Badge{{ badges.length > 1 ? 's' : '' }} Unlocked!</h2>
          <p>Congratulations on your achievement!</p>
        </div>
        
        <div class="badges-list">
          <div v-for="(badge, index) in badges" :key="badge.id" 
            class="badge-item" 
            :style="{ animationDelay: `${index * 0.2}s` }">
            <div class="badge-icon" :class="`tier-${badge.tier}`">
              {{ badge.icon }}
            </div>
            <div class="badge-info">
              <h3>{{ badge.name }}</h3>
              <p>{{ badge.description }}</p>
              <span class="badge-tier">{{ badge.tier.toUpperCase() }}</span>
            </div>
          </div>
        </div>
        
        <div class="notification-actions">
          <button @click="viewAchievements" class="btn btn-primary">
            View All Achievements
          </button>
          <button @click="close" class="btn btn-secondary">
            Continue
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { ref, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'BadgeNotification',
  setup() {
    const store = useStore()
    const router = useRouter()
    const show = ref(false)
    const badges = ref([])

    watch(
      () => store.getters['badges/newlyEarnedBadges'],
      (newBadges) => {
        if (newBadges && newBadges.length > 0) {
          badges.value = [...newBadges]
          show.value = true
        }
      },
      { deep: true }
    )

    const close = () => {
      show.value = false
      setTimeout(() => {
        store.dispatch('badges/clearNewlyEarnedBadges')
        badges.value = []
      }, 300)
    }

    const viewAchievements = () => {
      close()
      router.push('/achievements')
    }

    return {
      show,
      badges,
      close,
      viewAchievements
    }
  }
}
</script>

<style scoped>
.badge-notification-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.badge-notification-card {
  background: rgba(10, 22, 40, 0.96);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(74, 158, 245, 0.2);
  border-radius: 20px;
  padding: 40px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
  position: relative;
  overflow: hidden;
  animation: scaleIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes scaleIn {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.confetti {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.confetti-piece {
  position: absolute;
  width: 10px;
  height: 10px;
  background: linear-gradient(
    45deg,
    #f3d849,
    #f39c12,
    #e74c3c,
    #9b59b6,
    #3498db,
    #2ecc71
  );
  top: -10%;
  left: calc(var(--x) * 100%);
  animation: confettiFall 3s ease-out forwards;
  animation-delay: calc(var(--i) * 0.05s);
  opacity: 0;
  border-radius: 2px;
  transform: rotate(calc(var(--x) * 360deg));
}

@keyframes confettiFall {
  0% {
    opacity: 1;
    top: -10%;
  }
  100% {
    opacity: 0;
    top: 100%;
    transform: translateY(0) rotate(calc(var(--x) * 720deg));
  }
}

.badge-header {
  text-align: center;
  margin-bottom: 30px;
}

.badge-header h2 {
  font-size: 2rem;
  color: #F0F6FF;
  margin-bottom: 10px;
  font-weight: 700;
}

.badge-header p {
  color: rgba(200, 220, 255, 0.7);
  font-size: 1.1rem;
}

.badges-list {
  margin-bottom: 30px;
  max-height: 400px;
  overflow-y: auto;
}

.badge-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: rgba(13, 27, 53, 0.7);
  border-radius: 12px;
  margin-bottom: 15px;
  border: 1px solid rgba(74, 158, 245, 0.15);
  animation: slideInRight 0.5s ease-out forwards;
  opacity: 0;
}

@keyframes slideInRight {
  0% {
    transform: translateX(50px);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

.badge-icon {
  font-size: 4rem;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.badge-icon.tier-bronze {
  background: linear-gradient(135deg, #cd7f32 0%, #b8860b 100%);
  box-shadow: 0 4px 15px rgba(205, 127, 50, 0.3);
}

.badge-icon.tier-silver {
  background: linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%);
  box-shadow: 0 4px 15px rgba(192, 192, 192, 0.3);
}

.badge-icon.tier-gold {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.5);
}

.badge-icon.tier-platinum {
  background: linear-gradient(135deg, #e5e4e2 0%, #b0c4de 100%);
  box-shadow: 0 4px 15px rgba(176, 196, 222, 0.5);
}

.badge-info {
  flex: 1;
}

.badge-info h3 {
  font-size: 1.5rem;
  color: #F0F6FF;
  margin-bottom: 5px;
  font-weight: 600;
}

.badge-info p {
  color: rgba(200, 220, 255, 0.7);
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.badge-tier {
  display: inline-block;
  padding: 4px 12px;
  background: var(--primary);
  color: white;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.notification-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.btn {
  padding: 12px 30px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(200, 220, 255, 0.8);
  border: 1px solid rgba(74, 158, 245, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.14);
  color: #F0F6FF;
}

.badge-slide-enter-active {
  animation: fadeIn 0.3s;
}

.badge-slide-leave-active {
  animation: fadeOut 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@media (max-width: 768px) {
  .badge-notification-card {
    padding: 30px 20px;
  }
  
  .badge-header h2 {
    font-size: 1.5rem;
  }
  
  .badge-item {
    flex-direction: column;
    text-align: center;
  }
  
  .notification-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>

