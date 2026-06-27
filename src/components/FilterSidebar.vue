<template>
  <div class="filter-sidebar">
    <div class="sidebar-desktop">
      <div class="filter-header">
        <div class="filter-title">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"/>
          </svg>
          <span>{{ $t('filters.title') }}</span>
        </div>
        <div v-if="activeFilterCount > 0" class="filter-badge">
          {{ activeFilterCount }}
        </div>
      </div>

      <div class="filter-content">
        <div v-if="activeFilterCount > 0" class="active-filters">
          <div class="active-filters-header">
            <h4>{{ $t('filters.active') }}</h4>
            <button @click="clearAllFilters" class="clear-all-btn">{{ $t('filters.clear') }}</button>
          </div>
          <div class="active-filter-tags">
            <span 
              v-for="cat in selectedCategories" 
              :key="`cat-${cat}`" 
              class="filter-tag"
            >
              {{ getCategoryLabel(cat) }}
              <button @click="toggleCategory(cat)" class="remove-btn">×</button>
            </span>
            <span 
              v-for="loc in selectedLocations" 
              :key="`loc-${loc}`" 
              class="filter-tag"
            >
              {{ getLocationLabel(loc) }}
              <button @click="toggleLocation(loc)" class="remove-btn">×</button>
            </span>
            <span 
              v-for="type in selectedJobTypes" 
              :key="`type-${type}`" 
              class="filter-tag"
            >
              {{ getJobTypeLabel(type) }}
              <button @click="toggleJobType(type)" class="remove-btn">×</button>
            </span>
          </div>
        </div>

        <div class="filter-section">
          <h4 class="filter-section-title">{{ $t('filters.salary') }}</h4>
          <div class="salary-range-display">
            <span>${{ salaryRange[0] }}</span>
            <span>${{ salaryRange[1] }}</span>
          </div>
          <div class="salary-range-wrapper">
            <div class="salary-range-container">
              <div class="salary-range-track"></div>
              <div 
                class="salary-range-active"
                :style="{
                  left: (salaryRange[0] / maxSalary) * 100 + '%',
                  width: ((salaryRange[1] - salaryRange[0]) / maxSalary) * 100 + '%'
                }"
              ></div>
              <input
                type="range"
                :min="minSalary"
                :max="maxSalary"
                :step="100"
                :value="salaryRange[0]"
                @input="onMinSalaryChange"
                class="salary-slider min-slider"
              />
              <input
                type="range"
                :min="minSalary"
                :max="maxSalary"
                :step="100"
                :value="salaryRange[1]"
                @input="onMaxSalaryChange"
                class="salary-slider max-slider"
              />
            </div>
          </div>
        </div>

        <div class="filter-section">
          <h4 class="filter-section-title">{{ $t('filters.categories') }}</h4>
          <div class="filter-options">
            <div 
              v-for="category in categories" 
              :key="category.id" 
              class="filter-option"
            >
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  :value="category.id"
                  :checked="selectedCategories.includes(category.id)"
                  @change="toggleCategory(category.id)"
                />
                <span>{{ $t(`categories.${category.id}`) }}</span>
              </label>
              <span class="filter-count">{{ category.count }}</span>
            </div>
          </div>
        </div>

        <div class="filter-section">
          <h4 class="filter-section-title">{{ $t('filters.location') }}</h4>
          <div class="filter-options">
            <div 
              v-for="location in locations" 
              :key="location.id" 
              class="filter-option"
            >
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  :value="location.id"
                  :checked="selectedLocations.includes(location.id)"
                  @change="toggleLocation(location.id)"
                />
                <span>{{ location.label }}</span>
              </label>
            </div>
          </div>
        </div>

        <div class="filter-section">
          <h4 class="filter-section-title">{{ $t('filters.type') }}</h4>
          <div class="filter-options">
            <div 
              v-for="type in jobTypes" 
              :key="type.id" 
              class="filter-option"
            >
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  :value="type.id"
                  :checked="selectedJobTypes.includes(type.id)"
                  @change="toggleJobType(type.id)"
                />
                <span>{{ type.label }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'

export default {
  name: 'FilterSidebar',
  props: {
    jobCounts: {
      type: Object,
      default: () => ({})
    },
    initialCategory: {
      type: String,
      default: ''
    }
  },
  emits: ['filter-change'],
  setup(props, { emit }) {
    const salaryRange = ref([0, 5000])
    const selectedCategories = ref([])
    const selectedLocations = ref([])
    const selectedJobTypes = ref([])

    const minSalary = 0
    const maxSalary = 5000

    const categories = ref([
      { id: 'construction', label: 'Construction', count: 0 },
      { id: 'manufacturing', label: 'Manufacturing', count: 0 },
      { id: 'hospitality', label: 'Hospitality', count: 0 },
      { id: 'cleaning', label: 'Cleaning', count: 0 },
      { id: 'logistics', label: 'Logistics', count: 0 },
      { id: 'maintenance', label: 'Maintenance', count: 0 },
      { id: 'security', label: 'Security', count: 0 },
      { id: 'facilities', label: 'Facilities', count: 0 },
    ])

    const locations = ref([
      { id: 'central', label: 'Central' },
      { id: 'north', label: 'North' },
      { id: 'south', label: 'South' },
      { id: 'east', label: 'East' },
      { id: 'west', label: 'West' },
    ])

    const jobTypes = ref([
      { id: 'full-time', label: 'Full-time' },
      { id: 'part-time', label: 'Part-time' },
      { id: 'contract', label: 'Contract' },
    ])

    const activeFilterCount = computed(() => {
      return selectedCategories.value.length + 
             selectedLocations.value.length + 
             selectedJobTypes.value.length
    })

    const toggleCategory = (id) => {
      const index = selectedCategories.value.indexOf(id)
      if (index > -1) {
        selectedCategories.value.splice(index, 1)
      } else {
        selectedCategories.value.push(id)
      }
      emitFilters()
    }

    const toggleLocation = (id) => {
      const index = selectedLocations.value.indexOf(id)
      if (index > -1) {
        selectedLocations.value.splice(index, 1)
      } else {
        selectedLocations.value.push(id)
      }
      emitFilters()
    }

    const toggleJobType = (id) => {
      const index = selectedJobTypes.value.indexOf(id)
      if (index > -1) {
        selectedJobTypes.value.splice(index, 1)
      } else {
        selectedJobTypes.value.push(id)
      }
      emitFilters()
    }

    const clearAllFilters = () => {
      selectedCategories.value = []
      selectedLocations.value = []
      selectedJobTypes.value = []
      salaryRange.value = [0, 5000]
      emitFilters()
    }

    const onMinSalaryChange = (event) => {
      const newMin = parseInt(event.target.value)
      salaryRange.value[0] = newMin
      if (newMin > salaryRange.value[1]) {
        salaryRange.value[1] = newMin
      }
      emitFilters()
    }

    const onMaxSalaryChange = (event) => {
      const newMax = parseInt(event.target.value)
      salaryRange.value[1] = newMax
      if (newMax < salaryRange.value[0]) {
        salaryRange.value[0] = newMax
      }
      emitFilters()
    }

    const emitFilters = () => {
      emit('filter-change', {
        categories: selectedCategories.value,
        locations: selectedLocations.value,
        jobTypes: selectedJobTypes.value,
        salaryRange: salaryRange.value
      })
    }

    const getCategoryLabel = (id) => {
      const category = categories.value.find(c => c.id === id)
      return category ? category.label : id
    }

    const getLocationLabel = (id) => {
      const location = locations.value.find(l => l.id === id)
      return location ? location.label : id
    }

    const getJobTypeLabel = (id) => {
      const type = jobTypes.value.find(t => t.id === id)
      return type ? type.label : id
    }

    const updateCategoryCounts = (counts) => {
      categories.value.forEach(category => {
        category.count = counts[category.id] || 0
      })
    }

    watch(() => props.jobCounts, (newCounts) => {
      updateCategoryCounts(newCounts)
    }, { immediate: true })

    watch(() => props.initialCategory, (newCategory) => {
      if (newCategory && !selectedCategories.value.includes(newCategory)) {
        selectedCategories.value.push(newCategory)
        emitFilters()
      }
    }, { immediate: true })

    onMounted(() => {
      if (props.initialCategory && !selectedCategories.value.includes(props.initialCategory)) {
        selectedCategories.value.push(props.initialCategory)
        emitFilters()
      }
    })

    return {
      salaryRange,
      selectedCategories,
      selectedLocations,
      selectedJobTypes,
      minSalary,
      maxSalary,
      categories,
      locations,
      jobTypes,
      activeFilterCount,
      toggleCategory,
      toggleLocation,
      toggleJobType,
      clearAllFilters,
      onMinSalaryChange,
      onMaxSalaryChange,
      getCategoryLabel,
      getLocationLabel,
      getJobTypeLabel,
      updateCategoryCounts
    }
  }
}
</script>

<style scoped>
.filter-sidebar { width: 100%; }

.sidebar-desktop {
  position: sticky;
  top: 90px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: #F0F6FF;
}

.icon { width: 18px; height: 18px; color: #4A9EF5; }

.filter-badge {
  background: rgba(26, 111, 212, 0.25);
  color: #4A9EF5;
  border: 1px solid rgba(74, 158, 245, 0.3);
  border-radius: 10px;
  padding: 2px 10px;
  font-size: 0.72rem;
  font-weight: 600;
}

.filter-content { display: flex; flex-direction: column; gap: 10px; }

.active-filters {
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(74, 158, 245, 0.12);
}

.active-filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.active-filters-header h4 {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(200, 220, 255, 0.7);
}

.clear-all-btn {
  font-size: 0.75rem;
  color: #4A9EF5;
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  font-family: 'Inter', sans-serif;
}

.active-filter-tags { display: flex; flex-wrap: wrap; gap: 6px; }

.filter-tag {
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(74, 158, 245, 0.1);
  color: #4A9EF5;
  border: 1px solid rgba(74, 158, 245, 0.2);
  padding: 3px 10px;
  border-radius: 10px;
  font-size: 0.72rem;
}

.remove-btn {
  background: none;
  border: none;
  color: rgba(180, 210, 255, 0.5);
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
  font-family: 'Inter', sans-serif;
}

.filter-section {
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(74, 158, 245, 0.1);
}

.filter-section:last-child { border-bottom: none; }

.filter-section-title {
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: rgba(180, 210, 255, 0.5);
  margin-bottom: 8px;
}

.salary-range-display {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  color: rgba(200, 220, 255, 0.7);
  margin-bottom: 10px;
}

.salary-range-wrapper { margin: 14px 0; }

.salary-range-container {
  position: relative;
  width: 100%;
  height: 20px;
  display: flex;
  align-items: center;
}

.salary-range-track {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  width: 100%;
  height: 4px;
  background: rgba(74, 158, 245, 0.15);
  border-radius: 2px;
}

.salary-range-active {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 4px;
  background: #1A6FD4;
  border-radius: 2px;
  pointer-events: none;
  z-index: 0;
}

.salary-slider {
  position: absolute;
  width: 100%;
  height: 20px;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  outline: none;
  margin: 0;
  pointer-events: none;
  touch-action: none;
}

.salary-slider:focus { z-index: 3; }

.salary-slider::-webkit-slider-runnable-track {
  width: 100%;
  height: 20px;
  background: transparent;
  cursor: pointer;
  pointer-events: none;
}

.salary-slider::-moz-range-track {
  width: 100%;
  height: 20px;
  background: transparent;
  cursor: pointer;
  pointer-events: none;
}

.min-slider, .max-slider { z-index: 1; }

.salary-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #0A1628;
  cursor: pointer;
  border: 2px solid #1A6FD4;
  box-shadow: 0 0 0 3px rgba(26, 111, 212, 0.2);
  pointer-events: all;
  transition: box-shadow 0.2s;
}

.salary-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #0A1628;
  cursor: pointer;
  border: 2px solid #1A6FD4;
  box-shadow: 0 0 0 3px rgba(26, 111, 212, 0.2);
  pointer-events: all;
}

.filter-options { display: flex; flex-direction: column; gap: 4px; }

.filter-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 24px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;
  font-size: 0.82rem;
  color: rgba(200, 220, 255, 0.7);
}

.checkbox-label input[type="checkbox"] {
  width: 14px;
  height: 14px;
  cursor: pointer;
  accent-color: #1A6FD4;
  width: 13px;
  height: 13px;
}

.filter-count {
  font-size: 0.72rem;
  color: rgba(180, 210, 255, 0.4);
}

@media (max-width: 1024px) {
  .sidebar-desktop { display: none; }
}
</style>

