<template>
  <div class="quizzes-page">
    <!-- Animated background -->
    <div class="animated-background">
      <div class="bg-blur bg-blur-1"></div>
      <div class="bg-blur bg-blur-2"></div>
      <div class="bg-blur bg-blur-3"></div>
    </div>

    <!-- Grid pattern overlay -->
    <div class="grid-pattern"></div>

    <div class="quizzes-container">
      <!-- Header -->
      <div ref="headerRef" class="page-header">
        <div class="header-gradient">
          <h1>Skill Development</h1>
          <h2>Quiz Hub</h2>
        </div>
        <p class="header-description">
          Take AI-generated quizzes to test your skills and knowledge. Choose your difficulty level and start learning today.
        </p>
      </div>

      <!-- Level filter -->
      <div ref="filterRef" class="level-filter">
        <button
          v-for="(level, index) in levels"
          :key="level.id"
          @click="setActiveLevel(level.id)"
          :class="['level-btn', { active: activeLevel === level.id }]"
          :data-color="level.color"
        >
          {{ level.name }}
        </button>
        </div>

      <!-- Quiz grid -->
        <div class="quiz-grid">
          <div 
          v-for="(quiz, index) in filteredQuizzes"
          :key="quiz.uniqueId"
          :ref="el => setQuizCardRef(el, index)"
          :data-index="index"
          class="quiz-card-wrapper"
          @click="startQuiz(quiz.title, quiz.level)"
        >
          <QuizCard
            :quiz="quiz"
            :index="index"
            :level="quiz.level"
            :is-hovered="hoveredCard === quiz.uniqueId"
            @mouseenter="hoveredCard = quiz.uniqueId"
            @mouseleave="hoveredCard = null"
          />
        </div>
        </div>
      </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import ScrollReveal from 'scrollreveal'
import QuizCard from '../components/QuizCard.vue'

export default {
  name: 'Quizzes',
  components: {
    QuizCard
  },
  setup() {
    const router = useRouter()

    const activeLevel = ref('all')
    const hoveredCard = ref(null)
    const headerRef = ref(null)
    const filterRef = ref(null)
    const quizCardRefs = ref([])
    const mounted = ref(false)

    const setQuizCardRef = (el, index) => {
      if (el) {
        quizCardRefs.value[index] = el
      }
    }

    const iconMap = {
      'Spelling Quiz': '/icons/file-text.svg',
      'Basic Safety': '/icons/check-circle.svg',
      'Construction Basics': '/icons/hammer.svg',
      'Workplace Safety': '/icons/check-circle.svg',
      'Communication Skills': '/icons/users.svg',
      'Safety Management': '/icons/check-circle.svg',
      'Advanced Construction': '/icons/hammer.svg'
    }

    const quizzes = {
      beginner: [
        { name: 'Spelling Quiz', description: 'Improve your English spelling skills', questions: 5, duration: 10, difficulty: 1 },
        { name: 'Basic Safety', description: 'Introduction to workplace safety', questions: 5, duration: 10, difficulty: 1 },
        { name: 'Construction Basics', description: 'Learn fundamental construction concepts', questions: 5, duration: 10, difficulty: 1 }
      ],
      intermediate: [
        { name: 'Spelling Quiz', description: 'Improve your English spelling skills', questions: 5, duration: 10, difficulty: 2 },
        { name: 'Workplace Safety', description: 'Essential safety protocols and procedures', questions: 5, duration: 10, difficulty: 2 },
        { name: 'Communication Skills', description: 'Effective workplace communication', questions: 5, duration: 10, difficulty: 2 }
      ],
      advanced: [
        { name: 'Spelling Quiz', description: 'Improve your English spelling skills', questions: 5, duration: 10, difficulty: 3 },
        { name: 'Safety Management', description: 'Advanced safety protocols and leadership', questions: 5, duration: 10, difficulty: 3 },
        { name: 'Advanced Construction', description: 'Master complex construction techniques', questions: 5, duration: 10, difficulty: 3 }
      ]
    }

    const levels = [
      { id: 'all', name: 'All Levels', color: 'from-purple-500 to-indigo-500' },
      { id: 'beginner', name: 'Beginner', color: 'from-emerald-500 to-teal-500' },
      { id: 'intermediate', name: 'Intermediate', color: 'from-amber-500 to-orange-500' },
      { id: 'advanced', name: 'Advanced', color: 'from-rose-500 to-pink-500' }
    ]

    const filteredQuizzes = computed(() => {
      let allQuizzes = []
      
      if (activeLevel.value === 'all') {
        allQuizzes = [
          ...quizzes.beginner.map(q => ({ ...q, level: 'beginner', title: q.name, icon: iconMap[q.name] || '/icons/file-text.svg', uniqueId: `beginner-${q.name}` })),
          ...quizzes.intermediate.map(q => ({ ...q, level: 'intermediate', title: q.name, icon: iconMap[q.name] || '/icons/file-text.svg', uniqueId: `intermediate-${q.name}` })),
          ...quizzes.advanced.map(q => ({ ...q, level: 'advanced', title: q.name, icon: iconMap[q.name] || '/icons/file-text.svg', uniqueId: `advanced-${q.name}` }))
        ]
      } else {
        allQuizzes = quizzes[activeLevel.value].map(q => ({
          ...q,
          level: activeLevel.value,
          title: q.name,
          icon: iconMap[q.name] || '/icons/file-text.svg',
          uniqueId: `${activeLevel.value}-${q.name}`
        }))
      }
      
      return allQuizzes
    })

    const setActiveLevel = (level) => {
      activeLevel.value = level
    }

    const startQuiz = async (category, difficulty) => {
      // Handle spelling quiz routing
      if (category === 'Spelling Quiz') {
        router.push({ 
          path: '/spelling-quiz', 
          query: { difficulty: difficulty } 
        })
        return
      }
      
      // Create a URL-safe identifier for the quiz
      const quizId = `${category.toLowerCase().replace(/\s+/g, '-')}-${difficulty.toLowerCase()}`
      
      // Navigate to quiz take page with the quiz identifier
      router.push(`/quiz-take/${quizId}`)
    }

    onMounted(async () => {
      mounted.value = true
      
      // Wait for next tick to ensure DOM is ready
      await nextTick()
      
      // Initialize ScrollReveal
      if (typeof window !== 'undefined' && ScrollReveal) {
        const sr = ScrollReveal({
          origin: 'bottom',
          distance: '50px',
          duration: 1000,
          easing: 'ease-out',
          reset: false
        })

        // Animate header
        if (headerRef.value) {
          sr.reveal(headerRef.value, {
            delay: 0,
            opacity: 0
          })
        }

        // Animate filter buttons
        if (filterRef.value) {
          const buttons = filterRef.value.querySelectorAll('.level-btn')
          buttons.forEach((btn, index) => {
            sr.reveal(btn, {
              delay: 300 + (index * 100),
              opacity: 0
            })
          })
        }

        // Animate quiz cards with stagger - wait longer for refs to populate
        setTimeout(() => {
          if (quizCardRefs.value && quizCardRefs.value.length > 0) {
            quizCardRefs.value.forEach((card, index) => {
              if (card) {
                sr.reveal(card, {
                  delay: 500 + (index * 100),
                  opacity: 0
                })
              }
            })
          }
        }, 300)
      }
    })

    onUnmounted(() => {
      // Clean up if needed
    })

    return {
      activeLevel,
      levels,
      filteredQuizzes,
      setActiveLevel,
      startQuiz,
      hoveredCard,
      headerRef,
      filterRef,
      quizCardRefs,
      mounted,
      setQuizCardRef
    }
  }
}
</script>

<style scoped>
.quizzes-page {
  min-height: calc(100vh - 70px);
  background: #0A1628;
  color: #F0F6FF;
  padding: 32px 20px;
  overflow: hidden;
  position: relative;
}

/* Animated background - removed for white background */
.animated-background {
  display: none;
}

/* Grid pattern overlay - removed for white background */
.grid-pattern {
  display: none;
}

.quizzes-container {
  position: relative;
  z-index: 10;
  max-width: 1280px;
  margin: 0 auto;
}

/* Header */
.page-header {
  text-align: center;
  margin-bottom: 64px;
}

.header-gradient {
  display: inline-block;
  margin-bottom: 24px;
  position: relative;
}

.header-gradient::before {
  display: none;
}

.header-gradient h1,
.header-gradient h2 {
  position: relative;
  color: var(--text);
  margin: 0;
}

.header-gradient h1 {
  font-size: 60px;
  font-weight: 900;
  margin-bottom: 16px;
  line-height: 1.2;
}

.header-gradient h2 {
  font-size: 40px;
  font-weight: 700;
}

.header-description {
  color: var(--text-muted);
  font-size: 18px;
  max-width: 672px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Level filter */
.level-filter {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 48px;
  flex-wrap: wrap;
}

.level-btn {
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s;
  cursor: pointer;
  border: 1px solid rgba(74, 158, 245, 0.15);
  font-size: 16px;
  color: rgba(200, 220, 255, 0.65);
  background: rgba(13, 27, 53, 0.6);
}

.level-btn:hover {
  border-color: rgba(74, 158, 245, 0.35);
  color: #F0F6FF;
}

.level-btn.active {
  color: white;
  transform: scale(1.05);
  background: #1A6FD4;
  border-color: #1A6FD4;
}

.level-btn.active[data-color*="purple"] {
  background: linear-gradient(to right, #a855f7, #6366f1);
  box-shadow: 0 10px 20px rgba(168, 85, 247, 0.3);
}

.level-btn.active[data-color*="emerald"] {
  background: linear-gradient(to right, #10b981, #14b8a6);
  box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
}

.level-btn.active[data-color*="amber"] {
  background: linear-gradient(to right, #f59e0b, #f97316);
  box-shadow: 0 10px 20px rgba(245, 158, 11, 0.3);
}

.level-btn.active[data-color*="rose"] {
  background: linear-gradient(to right, #ef4444, #ec4899);
  box-shadow: 0 10px 20px rgba(239, 68, 68, 0.3);
}

/* Quiz grid */
.quiz-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 32px;
}

.quiz-card-wrapper {
  cursor: pointer;
}

/* Responsive */
@media (max-width: 768px) {
  .header-gradient h1 {
    font-size: 40px;
  }

  .header-gradient h2 {
    font-size: 28px;
  }

  .header-description {
    font-size: 16px;
  }

  .quiz-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .level-filter {
    gap: 12px;
  }

  .level-btn {
    padding: 10px 20px;
    font-size: 14px;
  }
}
</style>
