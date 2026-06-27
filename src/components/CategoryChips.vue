<template>
    <div class="category-chips">
      <div class="container">
        <div class="text-center mb-8">
          <h2>{{ $t('marketplace.browseCategory') }}</h2>
          <h4 class="">
            {{ $t('marketplace.categoryHelp') }}
          </h4>
        </div>
  
        <div class="categories-grid">
            <button
            v-for="(category, index) in categories"
            :key="category.id"
            class="category-chip"
            @click="selectCategory(category)"
            :style="{
                backgroundColor: category.bg,
                color: category.text,
                animationDelay: `${index * 0.05}s`
            }"
            >

            <div class="icon-container">
              <img
                :src="iconSrc(category.icon)"
                :alt="$t(`categories.${category.id}`)"
                class="category-icon"
                loading="lazy"
              />
            </div>
            <div class="category-info">
              <div class="category-label">{{ $t(`categories.${category.id}`) }}</div>
              <div class="category-count">{{ category.count }} {{ $t('marketplace.jobs') }}</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed } from "vue"
  import { useStore } from "vuex"
  
  export default {
    name: "CategoryChips",
    emits: ["category-selected"],
    setup(_, { emit }) {
      const store = useStore()
      const base = import.meta.env.BASE_URL
      const iconSrc = (file) => base + "icons/" + file

      const jobs = computed(() => store.getters['jobs/allJobs'])

      const jobCounts = computed(() => {
        const counts = {}
        jobs.value.forEach(job => {
          if (job.category) {
            counts[job.category] = (counts[job.category] || 0) + 1
          }
        })
        return counts
      })

      const categories = computed(() => [
        {
            id: "construction",
            label: "Construction",
            icon: "hammer.svg",
            count: jobCounts.value.construction || 0,
            bg: "rgba(255, 105, 0, 0.08)",
            text: "#FF8C42",
        },
        {
            id: "manufacturing",
            label: "Manufacturing",
            icon: "factory.svg",
            count: jobCounts.value.manufacturing || 0,
            bg: "rgba(74, 158, 245, 0.08)",
            text: "#4A9EF5",
        },
        {
            id: "hospitality",
            label: "Hospitality",
            icon: "utensils.svg",
            count: jobCounts.value.hospitality || 0,
            bg: "rgba(167, 139, 250, 0.08)",
            text: "#A78BFA",
        },
        {
            id: "maintenance",
            label: "Maintenance",
            icon: "wrench.svg",
            count: jobCounts.value.maintenance || 0,
            bg: "rgba(52, 211, 153, 0.08)",
            text: "#34D399",
        },
        {
            id: "logistics",
            label: "Logistics",
            icon: "truck.svg",
            count: jobCounts.value.logistics || 0,
            bg: "rgba(252, 165, 165, 0.08)",
            text: "#FCA5A5",
        },
        {
            id: "cleaning",
            label: "Cleaning",
            icon: "sparkles.svg",
            count: jobCounts.value.cleaning || 0,
            bg: "rgba(103, 232, 249, 0.08)",
            text: "#67E8F9",
        },
        {
            id: "security",
            label: "Security",
            icon: "users.svg",
            count: jobCounts.value.security || 0,
            bg: "rgba(129, 140, 248, 0.08)",
            text: "#818CF8",
        },
        {
            id: "facilities",
            label: "Facilities",
            icon: "building.svg",
            count: jobCounts.value.facilities || 0,
            bg: "rgba(244, 114, 182, 0.08)",
            text: "#F472B6",
        },
        ])

  
      const selectCategory = (category) => {
        emit("category-selected", category)
      }
  
      return { categories, selectCategory, iconSrc }
    },
  }
  </script>
  
<style scoped>
.category-chips {
  background: #0A1628;
  padding: 48px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.text-center { text-align: center; }
.mb-8       { margin-bottom: 32px; }

.text-center h2 {
  font-size: 1.8rem;
  color: #F0F6FF;
  margin-bottom: 8px;
}

.text-center h4 {
  color: rgba(180, 210, 255, 0.55);
  font-size: 1rem;
  font-weight: 400;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 10px;
}

.category-chip {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: border-color 0.2s, transform 0.2s;
  cursor: pointer;
  text-align: left;
  width: 100%;
  animation: slideInUp 0.5s ease-out forwards;
  opacity: 0;
  transform: translateY(16px);
}

.category-chip:hover {
  border-color: currentColor;
  transform: translateY(-2px);
}

.category-chip:active { transform: translateY(0); }

.icon-container {
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-container::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 8px;
  background: currentColor;
  opacity: 0.12;
}

.icon-container img {
  position: relative;
  width: 20px;
  height: 20px;
  display: block;
  filter: invert(1);
  opacity: 0.9;
}

.category-info { flex: 1; min-width: 0; }

.category-label {
  font-weight: 600;
  font-size: 0.95rem;
  color: inherit;
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.category-count {
  font-size: 0.78rem;
  color: inherit;
  opacity: 0.65;
}

@keyframes slideInUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .categories-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 8px;
  }
  .category-chip { padding: 12px; }
}

@media (max-width: 480px) {
  .categories-grid { grid-template-columns: 1fr; }
  .text-center h2  { font-size: 1.5rem; }
}
</style>
  