<template>
  <div class="tabs">
    <div class="tabs-list">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="tab-trigger"
        :class="{ active: activeTab === tab.value }"
        @click="selectTab(tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="tabs-content-wrapper">
      <slot />
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'Tabs',
  props: {
    modelValue: {
      type: String,
      required: true
    },
    tabs: {
      type: Array,
      required: true,
      validator: (tabs) => tabs.every(tab => tab.value && tab.label)
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const activeTab = ref(props.modelValue)
    
    watch(() => props.modelValue, (newValue) => {
      activeTab.value = newValue
    })
    
    const selectTab = (value) => {
      activeTab.value = value
      emit('update:modelValue', value)
    }
    
    return {
      activeTab,
      selectTab
    }
  }
}
</script>

<style scoped>
.tabs {
  width: 100%;
}

.tabs-list {
  display: flex;
  gap: 4px;
  background: var(--bg);
  padding: 4px;
  border-radius: 8px;
  margin-bottom: 24px;
  border: 1px solid var(--border);
}

.tab-trigger {
  flex: 1;
  padding: 10px 16px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.tab-trigger:hover {
  color: var(--text);
  background: var(--bg-light);
}

.tab-trigger.active {
  background: var(--primary);
  color: white;
}

.tabs-content-wrapper {
  width: 100%;
}

@media (max-width: 768px) {
  .tabs-list {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .tab-trigger {
    padding: 8px 12px;
    font-size: 0.8rem;
    white-space: nowrap;
    min-width: fit-content;
  }
}
</style>
