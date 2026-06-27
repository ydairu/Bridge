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
            bg: "#FBECE4",
            text: "#FF6900",
        },
        {
            id: "manufacturing",
            label: "Manufacturing",
            icon: "factory.svg",
            count: jobCounts.value.manufacturing || 0,
            bg: "#E8F0FF",
            text: "#246BFD",
        },
        {
            id: "hospitality",
            label: "Hospitality",
            icon: "utensils.svg",
            count: jobCounts.value.hospitality || 0,
            bg: "#F1E8FF",
            text: "#7A3EEA",
        },
        {
            id: "maintenance",
            label: "Maintenance",
            icon: "wrench.svg",
            count: jobCounts.value.maintenance || 0,
            bg: "#E4F7E8",
            text: "#25C55B",
        },
        {
            id: "logistics",
            label: "Logistics",
            icon: "truck.svg",
            count: jobCounts.value.logistics || 0,
            bg: "#FCE8E8",
            text: "#F44336",
        },
        {
            id: "cleaning",
            label: "Cleaning",
            icon: "sparkles.svg",
            count: jobCounts.value.cleaning || 0,
            bg: "#E8F7FB",
            text: "#2CA7C9",
        },
        {
            id: "security",
            label: "Security",
            icon: "users.svg",
            count: jobCounts.value.security || 0,
            bg: "#EDEBFF",
            text: "#4B4DED",
        },
        {
            id: "facilities",
            label: "Facilities",
            icon: "building.svg",
            count: jobCounts.value.facilities || 0,
            bg: "#FBE8F3",
            text: "#E0468B",
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
    background: var(--bg);
    padding: 48px 0;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }
  
  .text-center {
    text-align: center;
  }
  
  .mb-8 {
    margin-bottom: 32px;
  }
  
  .text-center h2 {
    font-size: 2rem;
    color: var(--text);
    margin-bottom: 8px;
  }
  
  .text-muted {
    color: var(--text-muted);
    font-size: 1.1rem;
  }
  
  .categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 12px;
  }
  
  .category-chip {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border-radius: 12px;
    border: 1px solid transparent;
    transition: all 0.3s ease;
    cursor: pointer;
    background: var(--bg-light);
    text-align: left;
    width: 100%;
    animation: slideInUp 0.6s ease-out forwards;
    opacity: 0;
    transform: translateY(20px);
  }
  
  .category-chip:hover {
    transform: translateY(-2px) scale(1.03);
    box-shadow: var(--shadow-md);
    border-color: currentColor;
  }
  
  .category-chip:active {
    transform: translateY(0) scale(0.98);
  }
  
  .icon-container {
  position: relative;
  width: 40px;
  height: 40px;
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
  opacity: 0.1; 
}

.icon-container img {
  position: relative;
  width: 20px;
  height: 20px;
  display: block;
  opacity: 1;
}

  
  .category-info {
    flex: 1;
    min-width: 0;
  }
  
  .category-label {
    font-weight: 600;
    font-size: 1rem;
    color: inherit;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .category-count {
    font-size: 0.85rem;
    color: inherit; 
    opacity: 1;    
}

  .bg-orange-500\/10 {
    background: oklch(0.9 0.02 30);
    color: oklch(0.5 0.15 30);
  }
  
  .bg-orange-500\/10:hover {
    background: oklch(0.85 0.02 30);
  }
  
  .bg-blue-500\/10 {
    background: oklch(0.9 0.02 260);
    color: oklch(0.5 0.15 260);
  }
  
  .bg-blue-500\/10:hover {
    background: oklch(0.85 0.02 260);
  }
  
  .bg-purple-500\/10 {
    background: oklch(0.9 0.02 300);
    color: oklch(0.5 0.15 300);
  }
  
  .bg-purple-500\/10:hover {
    background: oklch(0.85 0.02 300);
  }
  
  .bg-green-500\/10 {
    background: oklch(0.9 0.02 160);
    color: oklch(0.5 0.15 160);
  }
  
  .bg-green-500\/10:hover {
    background: oklch(0.85 0.02 160);
  }
  
  .bg-red-500\/10 {
    background: oklch(0.9 0.02 0);
    color: oklch(0.5 0.15 0);
  }
  
  .bg-red-500\/10:hover {
    background: oklch(0.85 0.02 0);
  }
  
  .bg-cyan-500\/10 {
    background: oklch(0.9 0.02 200);
    color: oklch(0.5 0.15 200);
  }
  
  .bg-cyan-500\/10:hover {
    background: oklch(0.85 0.02 200);
  }
  
  .bg-indigo-500\/10 {
    background: oklch(0.9 0.02 280);
    color: oklch(0.5 0.15 280);
  }
  
  .bg-indigo-500\/10:hover {
    background: oklch(0.85 0.02 280);
  }
  
  .bg-pink-500\/10 {
    background: oklch(0.9 0.02 320);
    color: oklch(0.5 0.15 320);
  }
  
  .bg-pink-500\/10:hover {
    background: oklch(0.85 0.02 320);
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
  
  @media (max-width: 768px) {
    .categories-grid {
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 8px;
    }
  
    .category-chip {
      padding: 12px;
    }
  
    .icon-container {
      width: 36px;
      height: 36px;
    }
  
    .icon-container img {
      width: 18px;
      height: 18px;
    }
  }
  
  @media (max-width: 480px) {
    .categories-grid {
      grid-template-columns: 1fr;
    }
  
    .text-center h2 {
      font-size: 1.5rem;
    }
  
    .text-muted {
      font-size: 1rem;
    }
  }
  </style>
