<template>
  <div class="quizzes-page">
    <div class="quizzes-container">
      <!-- Header -->
      <div ref="headerRef" class="page-header">
        <div class="header-content">
          <h1>Skill Development Quiz Hub</h1>
        </div>
        <p class="header-description">
          Take AI-generated quizzes to test your skills and knowledge. Choose your difficulty level and start learning today.
        </p>
      </div>

      <!-- Level filter -->
      <div ref="filterRef" class="level-filter">
        <button
          v-for="category in categories"
          :key="category.id"
          @click="setActiveCategory(category.id)"
          :class="['level-btn', { active: activeCategory === category.id }]"
        >
          {{ category.name }}
        </button>
        </div>

      <!-- Quiz grid -->
        <div class="quiz-grid">
          <div 
          v-for="quiz in filteredQuizzes"
          :key="quiz.uniqueId"
          class="quiz-card-wrapper"
          @click="startQuiz(quiz.title, quiz.level)"
        >
          <QuizCard
            :quiz="quiz"
            :level="quiz.level"
          />
        </div>
        </div>
      </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import QuizCard from '../components/QuizCard.vue'

export default {
  name: 'Quizzes',
  components: {
    QuizCard
  },
  setup() {
    const router = useRouter()

    const activeCategory = ref('all')

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

    const categories = [
      { id: 'all', name: 'All Quizzes' },
      { id: 'safety', name: 'Safety' },
      { id: 'construction', name: 'Construction' },
      { id: 'spelling', name: 'Spelling' }
    ]

    const filteredQuizzes = computed(() => {
      const allQuizzes = Object.entries(quizzes).flatMap(([level, levelQuizzes]) =>
        levelQuizzes.map(quiz => ({
          ...quiz,
          level,
          title: quiz.name,
          category: quiz.name.includes('Spelling')
            ? 'spelling'
            : quiz.name.includes('Construction')
              || quiz.name.includes('Communication')
              ? 'construction'
              : 'safety',
          icon: iconMap[quiz.name] || '/icons/file-text.svg',
          uniqueId: `${level}-${quiz.name}`
        }))
      )

      return activeCategory.value === 'all'
        ? allQuizzes
        : allQuizzes.filter(quiz => quiz.category === activeCategory.value)
    })

    const setActiveCategory = (category) => {
      activeCategory.value = category
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

    return {
      activeCategory,
      categories,
      filteredQuizzes,
      setActiveCategory,
      startQuiz
    }
  }
}
</script>

<style scoped>
.quizzes-page {
  min-height: calc(100vh - 70px);
  background: #0A1628;
  color: #F0F6FF;
  padding: 32px 24px 56px;
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
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
}

/* Header */
.page-header {
  text-align: center;
  margin-bottom: 40px;
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
  font-weight: 900;
  margin-bottom: 16px;
  line-height: 1.2;
}

.header-gradient h2 {
  font-weight: 700;
}

.header-description {
  color: var(--text-muted);
  max-width: 672px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Level filter */
.level-filter {
  display: flex;
  gap: 0;
  margin-bottom: 38px;
  padding: 4px;
  border: none;
  border-radius: 10px;
  background: #0D1B35;
}

.level-btn {
  flex: 1;
  min-height: 52px;
  padding: 12px 18px;
  border-radius: 7px;
  font-weight: 600;
  cursor: pointer;
  border: none;
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
  background: #1A6FD4;
  border-color: #1A6FD4;
}

/* Quiz grid */
.quiz-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.quiz-card-wrapper {
  cursor: pointer;
}

/* Responsive */
@media (max-width: 768px) {
  .quiz-grid {
    gap: 12px;
  }

  .level-filter {
    overflow-x: auto;
  }

  .level-btn {
    padding: 10px 20px;
    font-size: 14px;
    min-width: 120px;
  }
}
</style>
