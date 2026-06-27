<template>
  <div
    class="stat-card group"
    :style="cardStyle"
  >
    <div 
      class="gradient-overlay"
      :class="gradientClass"
    />

    <div 
      class="icon-container"
      :class="gradientClass"
    >
      <img :src="stat.icon" :alt="stat.label" class="icon" />
    </div>

    <div class="stat-content">
      <div class="stat-value">
        <span class="tabular-nums">{{ count.toLocaleString() }}</span>
        <span>{{ stat.suffix }}</span>
      </div>
      <p class="stat-label">{{ stat.label }}</p>
    </div>

    <div 
      class="animated-border"
      :style="borderStyle"
    />
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

export default {
  name: 'StatsCard',
  props: {
    stat: {
      type: Object,
      required: true,
      validator: (val) => {
        return val.icon && typeof val.value === 'number' && val.label
      }
    },
    index: {
      type: Number,
      default: 0
    },
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const count = ref(0)
    let timer = null

    const gradientClass = computed(() => {
      const colorMap = {
        blue: 'gradient-blue',
        purple: 'gradient-purple',
        orange: 'gradient-orange',
        green: 'gradient-green'
      }
      return colorMap[props.stat.color] || 'gradient-blue'
    })

    const cardStyle = computed(() => {
      return {
        opacity: props.isVisible ? 1 : 0,
        transform: props.isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: `all 0.6s ease-out ${props.index * 0.1}s`
      }
    })

    const borderStyle = computed(() => {
      const colorMap = {
        blue: '#3b82f6',
        purple: '#a855f7',
        orange: '#f97316',
        green: '#22c55e'
      }
      return {
        background: `linear-gradient(to right, transparent, ${colorMap[props.stat.color] || '#3b82f6'}, transparent)`
      }
    })

    const animateCount = () => {
      if (!props.isVisible) return

      const duration = 2000
      const steps = 60
      const increment = props.stat.value / steps
      let current = 0

      timer = setInterval(() => {
        current += increment
        if (current >= props.stat.value) {
          count.value = props.stat.value
          clearInterval(timer)
          timer = null
        } else {
          count.value = Math.floor(current)
        }
      }, duration / steps)
    }

    watch(() => props.isVisible, (newVal) => {
      if (newVal) {
        count.value = 0
        animateCount()
      }
    })

    onMounted(() => {
      if (props.isVisible) {
        animateCount()
      }
    })

    onUnmounted(() => {
      if (timer) {
        clearInterval(timer)
      }
    })

    return {
      count,
      gradientClass,
      cardStyle,
      borderStyle
    }
  }
}
</script>

<style scoped>
.stat-card {
  position: relative;
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.stat-card:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.dark-mode .stat-card {
  background: var(--bg);
  border-color: rgba(255, 255, 255, 0.1);
}

.gradient-overlay {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.group:hover .gradient-overlay {
  opacity: 0.05;
}

.gradient-blue {
  background: linear-gradient(to bottom right, #3b82f6, #2563eb);
}

.gradient-purple {
  background: linear-gradient(to bottom right, #a855f7, #9333ea);
}

.gradient-orange {
  background: linear-gradient(to bottom right, #f97316, #ea580c);
}

.gradient-green {
  background: linear-gradient(to bottom right, #22c55e, #16a34a);
}

.icon-container {
  position: relative;
  width: 64px;
  height: 64px;
  margin: 0 auto 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.group:hover .icon-container {
  transform: scale(1.1);
}

.icon {
  width: 32px;
  height: 32px;
  filter: brightness(0) invert(1);
}

.stat-content {
  position: relative;
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 8px;
  line-height: 1.2;
}

.tabular-nums {
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.5;
}

.animated-border {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  opacity: 0;
  transition: opacity 0.3s ease;
  height: 2px;
  bottom: 0;
  top: auto;
  pointer-events: none;
}

.group:hover .animated-border {
  opacity: 1;
}

@media (max-width: 768px) {
  .stat-card {
    padding: 24px;
  }
  
  .icon-container {
    width: 56px;
    height: 56px;
    margin-bottom: 20px;
  }
  
  .icon {
    width: 28px;
    height: 28px;
  }
  
  .stat-value {
    font-size: 1.75rem;
  }
}
</style>

