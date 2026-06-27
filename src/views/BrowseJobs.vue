<template>
  <div class="browse-jobs-page">
    <!-- Category Chips Section -->
    <CategoryChips @category-selected="onCategorySelected" />

    <!-- Job Listings -->
    <section class="jobs-section">
      <div class="container">
        <div class="jobs-layout">
          <!-- Filter Sidebar -->
          <aside class="filter-sidebar-wrapper">
            <FilterSidebar 
              :job-counts="jobCounts" 
              :initial-category="selectedCategory"
              @filter-change="handleFilterChange" 
            />
          </aside>

          <!-- Main Content -->
          <div class="jobs-main-content">
            <!-- Header with Sort -->
            <div class="jobs-header-section">
              <div class="jobs-header-left">
                <h2>Browse Jobs</h2>
                <p class="jobs-count">{{ filteredJobs.length }} opportunities available</p>
              </div>
              <div class="header-middle">
                <div class="search-bar-wrapper">
                  <img src="/icons/search.svg" alt="Search" class="search-icon" />
                  <input
                    type="text"
                    v-model="searchQuery"
                    placeholder="Search"
                    class="search-input"
                    @input="applyFilters"
                  />
                </div>
              </div>
              <div class="sort-select-wrapper">
                <select v-model="sortBy" class="sort-select">
                  <option value="recent">Most Recent</option>
                  <option value="salary-high">Salary: High to Low</option>
                  <option value="salary-low">Salary: Low to High</option>
                  <option value="relevant">Most Relevant</option>
                </select>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="jobs-grid">
              <JobCardSkeleton v-for="n in 6" :key="n" />
            </div>

            <!-- No Results -->
            <div v-else-if="filteredJobs.length === 0" class="no-results">
              <p>No jobs found. Try adjusting your search.</p>
            </div>

            <!-- Jobs Grid -->
            <div v-else class="jobs-grid">
              <JobCard
                v-for="(job, index) in processedJobs"
                :key="job.id"
                :job="job"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import JobCard from '../components/JobCard.vue'
import JobCardSkeleton from '../components/JobCardSkeleton.vue'
import FilterSidebar from '../components/FilterSidebar.vue'
import CategoryChips from '../components/CategoryChips.vue'

export default {
  name: 'BrowseJobs',
  components: {
    JobCard,
    JobCardSkeleton,
    FilterSidebar,
    CategoryChips
  },
  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    
    const searchQuery = ref('')
    const selectedCategory = ref('')
    const loading = ref(false)
    const sortBy = ref('recent')
    
    // Filter state for sidebar
    const sidebarFilters = ref({
      categories: [],
      locations: [],
      jobTypes: [],
      salaryRange: [0, 5000]
    })

    const jobs = computed(() => store.getters['jobs/allJobs'])

    const filteredJobs = computed(() => {
      let result = jobs.value

      // Search query filter
      if (searchQuery.value) {
        result = result.filter(job =>
          job.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          job.company.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      }

      // Selected category filter (for top category chips)
      if (selectedCategory.value) {
        result = result.filter(job => 
          job.category === selectedCategory.value
        )
      }

      // Sidebar filter: Categories
      if (sidebarFilters.value.categories.length > 0) {
        result = result.filter(job =>
          sidebarFilters.value.categories.includes(job.category)
        )
        // Clear the selectedCategory when sidebar categories are selected
        if (selectedCategory.value) {
          selectedCategory.value = ''
        }
      }

      // Sidebar filter: Job Types
      if (sidebarFilters.value.jobTypes.length > 0) {
        result = result.filter(job =>
          sidebarFilters.value.jobTypes.includes(job.type)
        )
      }

      // Sidebar filter: Locations
      if (sidebarFilters.value.locations.length > 0) {
        result = result.filter(job =>
          sidebarFilters.value.locations.includes(job.location)
        )
      }

      // Sidebar filter: Salary Range
      if (sidebarFilters.value.salaryRange) {
        const [minSalary, maxSalary] = sidebarFilters.value.salaryRange
        result = result.filter(job => {
          const jobSalary = parseInt(job.salary) || 0
          return jobSalary >= minSalary && jobSalary <= maxSalary
        })
      }

      return result
    })

    // Process jobs with featured flag and sorting
    const processedJobs = computed(() => {
      let processed = filteredJobs.value.map((job, index) => ({
        ...job,
        featured: index < 2
      }))

      // Apply sorting
      if (sortBy.value === 'salary-high') {
        processed.sort((a, b) => {
          const salaryA = parseInt(a.salary) || 0
          const salaryB = parseInt(b.salary) || 0
          return salaryB - salaryA
        })
      } else if (sortBy.value === 'salary-low') {
        processed.sort((a, b) => {
          const salaryA = parseInt(a.salary) || 0
          const salaryB = parseInt(b.salary) || 0
          return salaryA - salaryB
        })
      } else if (sortBy.value === 'recent') {
        // Already sorted by creation date from store
        processed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      }

      return processed
    })

    // Compute job counts by category for the filter sidebar
    const jobCounts = computed(() => {
      const counts = {}
      jobs.value.forEach(job => {
        if (job.category) {
          counts[job.category] = (counts[job.category] || 0) + 1
        }
      })
      return counts
    })

    const applyFilters = async () => {
      loading.value = true
      try {
        // Fetch all jobs, not filtered by category
        await store.dispatch('jobs/fetchJobs')
      } catch (error) {
        console.error('Error fetching jobs:', error)
      } finally {
        loading.value = false
      }
    }

    const onCategorySelected = (category) => {
      selectedCategory.value = category.id
      applyFilters()
    }

    const handleFilterChange = (filters) => {
      sidebarFilters.value = filters
      
      // If categories are cleared, also clear selectedCategory and URL param
      if (filters.categories.length === 0 && selectedCategory.value) {
        selectedCategory.value = ''
        // Update URL to remove category parameter
        router.push({ query: { ...route.query, category: undefined } })
      }
    }

    // Watch for selectedCategory changes and update URL
    watch(selectedCategory, (newCategory) => {
      if (newCategory) {
        router.push({ query: { ...route.query, category: newCategory } })
      } else {
        const { category, ...restQuery } = route.query
        router.push({ query: restQuery })
      }
    })

    onMounted(() => {
      // Check for category parameter in URL
      if (route.query.category) {
        selectedCategory.value = route.query.category
      }
      applyFilters()
    })

      return {
      searchQuery,
      selectedCategory,
      loading,
      sortBy,
      filteredJobs,
      processedJobs,
      jobCounts,
      applyFilters,
      onCategorySelected,
      handleFilterChange
    }
  }
}
</script>

<style scoped>
.browse-jobs-page {
  min-height: 100vh;
  background: var(--bg);
  overflow-x: hidden;
  width: 100%;
  max-width: 100vw;
}

.filters-section {
  padding: 32px 0;
  background: var(--bg-light);
}

.filters-container {
  display: flex;
  justify-content: center;
  padding: 0;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
}

.search-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(13, 27, 53, 0.7);
  border: 1px solid rgba(74, 158, 245, 0.2);
  border-radius: 8px;
  padding: 10px 16px;
  width: 100%;
  max-width: 500px;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
}

.search-bar-wrapper:focus-within {
  border-color: #1A6FD4;
  box-shadow: 0 0 0 3px rgba(26, 111, 212, 0.15);
}

.search-icon {
  width: 18px;
  height: 18px;
  opacity: 0.55;
  flex-shrink: 0;
  filter: invert(1);
}

.search-input,
.filter-select {
  flex: 1;
  min-width: 0;
  padding: 0;
  border: none;
  border-radius: 0;
  font-size: 1rem;
  background: transparent;
  color: #F0F6FF;
  outline: none;
}

.search-input::placeholder {
  color: rgba(180, 210, 255, 0.45);
}


.jobs-section {
  padding: 60px 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  overflow-x: hidden;
}

/* Layout with Sidebar */
.jobs-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 32px;
  align-items: start;
  max-width: 100%;
}

.filter-sidebar-wrapper {
  width: 100%;
  max-width: 280px;
}

.jobs-main-content {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow-x: hidden;
}

/* Header Section */
.jobs-header-section {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.header-middle {
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 500px;
  margin: 0 auto;
}

.jobs-header-left h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 4px 0;
}

.jobs-count {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
}

.sort-select-wrapper {
  flex-shrink: 0;
}

.sort-select {
  width: 100%;
  max-width: 180px;
  padding: 10px 12px;
  border: 1px solid rgba(74, 158, 245, 0.2);
  border-radius: 8px;
  font-size: 0.875rem;
  background: rgba(13, 27, 53, 0.7);
  color: #F0F6FF;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sort-select:focus {
  outline: none;
  border-color: #1A6FD4;
}

.jobs-container {
  min-height: 400px;
}

.loading,
.no-results {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
  font-size: 1.1rem;
}

.jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  gap: 24px;
  width: 100%;
  max-width: 100%;
}

/* Ensure consistent card widths at different breakpoints */
@media (min-width: 1280px) {
  .jobs-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) and (max-width: 1279px) {
  .jobs-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1024px) {
  .jobs-layout {
    grid-template-columns: 1fr;
  }
  
  .filter-sidebar-wrapper {
    display: none;
  }
  
  .jobs-grid {
    grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .jobs-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .jobs-header-section {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .sort-select {
    max-width: 100%;
  }

  .filters-container {
    flex-direction: column;
  }

  .search-input,
  .filter-select {
    width: 100%;
  }

  .jobs-grid {
    grid-template-columns: 1fr;
  }
}
</style>
