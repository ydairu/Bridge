<template>
  <div class="stat-card">
    <div class="stat-icon" :class="iconBg">
      <slot name="icon"></slot>
    </div>
    <div class="stat-content">
      <div class="stat-label">{{ label }}</div>
      <div class="stat-value">{{ formattedValue }}</div>
      <div v-if="change !== undefined" class="stat-change" :class="changeClass">
        <span class="change-indicator">{{ changePrefix }}</span>
        {{ Math.abs(change) }}% {{ changeLabel }}
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'StatCard',
  props: {
    label: {
      type: String,
      required: true
    },
    value: {
      type: [Number, String],
      required: true
    },
    change: {
      type: Number,
      default: undefined
    },
    changeLabel: {
      type: String,
      default: 'from last month'
    },
    icon: {
      type: [Object, String],
      default: null
    },
    iconBg: {
      type: String,
      default: 'bg-blue-50'
    }
  },
  setup(props) {
    const formattedValue = computed(() => {
      if (typeof props.value === 'number') {
        return props.value.toLocaleString()
      }
      return props.value
    })

    const changeClass = computed(() => {
      if (props.change === undefined) return ''
      return props.change >= 0 ? 'positive' : 'negative'
    })

    const changePrefix = computed(() => {
      if (props.change === undefined) return ''
      return props.change >= 0 ? '+' : '-'
    })

    return {
      formattedValue,
      changeClass,
      changePrefix
    }
  }
}
</script>

<style scoped>
.stat-card {
  background: var(--bg);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: flex-start;
  gap: 16px;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.stat-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-color: rgba(0, 0, 0, 0.12);
}

.dark-mode .stat-card {
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.dark-mode .stat-card:hover {
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon svg {
  width: 20px;
  height: 20px;
  transition: color 0.3s ease, stroke 0.3s ease;
}

.stat-icon.bg-blue-50 svg {
  color: #3b82f6;
  stroke: #3b82f6;
}

.dark-mode .stat-icon.bg-blue-50 svg {
  color: #60a5fa;
  stroke: #60a5fa;
}

.stat-icon.bg-green-50 svg {
  color: #10b981;
  stroke: #10b981;
}

.dark-mode .stat-icon.bg-green-50 svg {
  color: #34d399;
  stroke: #34d399;
}

.stat-icon.bg-purple-50 svg {
  color: #8b5cf6;
  stroke: #8b5cf6;
}

.dark-mode .stat-icon.bg-purple-50 svg {
  color: #a78bfa;
  stroke: #a78bfa;
}

.stat-icon.bg-orange-50 svg {
  color: #f97316;
  stroke: #f97316;
}

.dark-mode .stat-icon.bg-orange-50 svg {
  color: #fb923c;
  stroke: #fb923c;
}

.bg-blue-50 {
  background: oklch(0.9 0.02 245);
}

.bg-green-50 {
  background: oklch(0.9 0.02 160);
}

.bg-purple-50 {
  background: oklch(0.9 0.02 280);
}

.bg-orange-50 {
  background: oklch(0.9 0.02 50);
}

.dark-mode .bg-blue-50 {
  background: oklch(0.25 0.08 245);
}

.dark-mode .bg-green-50 {
  background: oklch(0.25 0.08 160);
}

.dark-mode .bg-purple-50 {
  background: oklch(0.25 0.08 280);
}

.dark-mode .bg-orange-50 {
  background: oklch(0.25 0.08 50);
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 4px;
  line-height: 1.2;
}

.stat-change {
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-change.positive {
  color: var(--success);
}

.stat-change.negative {
  color: var(--danger);
}

.change-indicator {
  font-weight: 600;
}

@media (max-width: 768px) {
  .stat-card {
    padding: 16px;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
  }
}
</style>
