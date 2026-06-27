<template>
  <div class="quiz-take-page">
    <div class="quiz-container">
      <div v-if="loading" class="loading-state">
        <div class="loading-content">
          <div class="loading-image">
            <img :src="currentLoadingImage" alt="Loading animation" />
          </div>
          <h2>Generating Your Quiz...</h2>
          <p>Please wait while we create your personalized quiz with AI</p>
          <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <div v-else-if="questions.length === 0" class="error-state">
        <h2>No Quiz Data</h2>
        <p>Unable to load quiz data. Please try again.</p>
        <div style="margin: 20px 0;">
          <p><strong>Debug Info:</strong></p>
          <p>Current Quiz: {{ currentQuiz }}</p>
          <p>Questions Length: {{ questions.length }}</p>
          <p>Loading: {{ loading }}</p>
        </div>
        <div style="margin: 20px 0;">
          <button @click="testStore" class="btn btn-secondary" style="margin-right: 10px;">Test Store</button>
          <button @click="reloadQuiz" class="btn btn-primary">Reload Quiz</button>
        </div>
        <router-link to="/quizzes" class="btn btn-primary">Back to Quizzes</router-link>
      </div>

      <div v-else>
        <!-- Quiz In Progress -->
        <template v-if="!quizCompleted">
          <div class="quiz-content-modern">
            <div class="question-card-modern">
              <!-- Combined Header -->
              <div class="quiz-header-compact">
                <div class="quiz-header-left">
                  <div class="quiz-badges-row">
                    <div class="question-badge-pill">Q{{ currentQuestion + 1 }}</div>
                    <div class="difficulty-badge-pill">{{ capitalizeFirst(currentQuiz?.difficulty) || 'Quiz' }}</div>
                  </div>
                  <h1 class="quiz-title-text">{{ formatQuizTitle(currentQuiz?.skill) || 'Quiz' }}</h1>
                </div>
                <div class="quiz-header-right">
                  <span class="progress-counter">{{ currentQuestion + 1 }}/{{ questions.length }}</span>
                  <div class="progress-bar-slim">
                    <div class="progress-fill-slim" :style="{ width: `${progress}%` }"></div>
                  </div>
                </div>
              </div>
              
              <h2 class="question-text">{{ questions[currentQuestion].question }}</h2>
              
              <div class="options-grid">
                <div
                  v-for="(option, index) in questions[currentQuestion].options"
                  :key="index"
                  :class="['option-modern', { 
                    selected: selectedAnswer === index,
                    correct: showFeedback && index === questions[currentQuestion].correctAnswer,
                    incorrect: showFeedback && selectedAnswer === index && index !== questions[currentQuestion].correctAnswer
                  }]"
                  @click="selectAnswer(index)"
                >
                  <div class="option-content">
                    <div class="option-letter-modern">{{ String.fromCharCode(65 + index) }}</div>
                    <div class="option-text-modern">{{ option }}</div>
                  </div>
                  <div v-if="showFeedback && index === questions[currentQuestion].correctAnswer" class="feedback-checkmark">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <div v-if="showFeedback && selectedAnswer === index && index !== questions[currentQuestion].correctAnswer" class="feedback-cross">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Feedback Message -->
              <transition name="feedback-slide">
                <div v-if="showFeedback" class="feedback-message-modern" :class="{ correct: isAnswerCorrect, incorrect: !isAnswerCorrect }">
                  <div class="feedback-icon-modern">
                    <svg v-if="isAnswerCorrect" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke-linecap="round" stroke-linejoin="round"/>
                      <polyline points="22 4 12 14.01 9 11.01" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M15 9l-6 6M9 9l6 6" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <div class="feedback-text-modern">
                    <h3>{{ isAnswerCorrect ? 'Correct!' : 'Incorrect' }}</h3>
                    <p v-if="!isAnswerCorrect">
                      The correct answer is: <strong>{{ questions[currentQuestion].options[questions[currentQuestion].correctAnswer] }}</strong>
                    </p>
                    <p v-else>Well done! You got it right.</p>
                  </div>
                </div>
              </transition>

              <div class="quiz-actions-modern">
                <button
                  v-if="currentQuestion < questions.length - 1"
                  @click="nextQuestion"
                  :disabled="selectedAnswer === null"
                  class="btn-next"
                >
                  <span>Next Question</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <button
                  v-else
                  @click="submitQuiz"
                  :disabled="selectedAnswer === null"
                  class="btn-submit"
                >
                  <span>Submit Quiz</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke-linecap="round" stroke-linejoin="round"/>
                    <polyline points="22 4 12 14.01 9 11.01" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </template>

        <!-- Quiz Results -->
        <div v-else class="quiz-results-modern">
          <div class="results-card-modern">
            <!-- Score Header -->
            <div class="results-header">
              <div class="score-display">
                <div class="score-circle-modern">
                  <span class="score-value">{{ score }}%</span>
                </div>
                <div class="score-info">
                  <h2 class="results-title">{{ score >= 80 ? '🎉 Congratulations!' : 'Keep Learning!' }}</h2>
                  <p class="results-message" v-if="score >= 80">
                    You've passed the quiz and earned a badge!
                  </p>
                  <p class="results-message" v-else>
                    You need 80% or higher to earn a badge. Keep practicing!
                  </p>
                </div>
              </div>
            </div>

            <!-- Compact Summary Section -->
            <div class="quiz-summary-modern">
              <h3 class="summary-title">Quiz Summary</h3>
              <div class="summary-list">
                <div v-for="(question, index) in questions" :key="index" class="summary-item-modern">
                  <div class="summary-header-compact">
                    <span class="summary-question-badge">Q{{index + 1}}</span>
                    <span class="summary-status-icon" :class="{ correct: answers[index] === question.correctAnswer }">
                      <svg v-if="answers[index] === question.correctAnswer" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </span>
                  </div>
                  <p class="summary-question-text">{{ question.question }}</p>
                  <div class="summary-answers-compact">
                    <div class="answer-row" :class="{ correct: answers[index] === question.correctAnswer }">
                      <span class="answer-label">Your Answer:</span>
                      <span class="answer-value">{{ question.options[answers[index]] }}</span>
                    </div>
                    <div v-if="answers[index] !== question.correctAnswer" class="answer-row correct-answer-row">
                      <span class="answer-label">Correct Answer:</span>
                      <span class="answer-value">{{ question.options[question.correctAnswer] }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="results-actions-modern">
              <router-link to="/quizzes" class="btn-secondary-modern">
                Back to Quizzes
              </router-link>
              <button @click="retakeQuiz" class="btn-primary-modern">
                Retake Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { db } from '../firebase/config'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { quizApi } from '../services/api'
import loading1 from '../assets/loading-1.png'
import loading2 from '../assets/loading-2.png'

export default {
  name: 'QuizTake',
  setup() {
    const store = useStore()
    const route = useRoute()

    const currentQuestion = ref(0)
    const selectedAnswer = ref(null)
    const answers = ref([])
    const quizCompleted = ref(false)
    const score = ref(0)
    const loading = ref(true)
    const showFeedback = ref(false)
    const isAnswerCorrect = ref(false)
    const currentLoadingImage = ref(loading1)
    const loadingInterval = ref(null)

    // New: track timeout so we can clear it when navigating
    const feedbackTimeout = ref(null)

    // Get quiz data from store
    const currentQuiz = computed(() => store.getters['quizzes/currentQuiz'])
    const questions = computed(() => currentQuiz.value?.questions || [])

    const progress = computed(() => {
      return ((currentQuestion.value + 1) / questions.value.length) * 100
    })

    const clearFeedback = () => {
      // clear reactive flags
      showFeedback.value = false
      isAnswerCorrect.value = false

      // clear any pending timeout
      if (feedbackTimeout.value) {
        clearTimeout(feedbackTimeout.value)
        feedbackTimeout.value = null
      }

      // remove visual classes from any option elements
      document.querySelectorAll('.option').forEach(el => {
        el.classList.remove('correct-answer', 'incorrect-answer', 'show-correct')
      })
    }

    const selectAnswer = (index) => {
      // Prevent multiple selections
      if (selectedAnswer.value !== null) return;

      // clear any previous feedback state/timeout before applying new
      clearFeedback();

      selectedAnswer.value = index;
      showFeedback.value = true;
      isAnswerCorrect.value = index === questions.value[currentQuestion.value].correctAnswer;

      // No need to manually add classes - they will be handled by Vue's class bindings
    }

    const nextQuestion = () => {
      if (selectedAnswer.value !== null) {
        answers.value[currentQuestion.value] = selectedAnswer.value
        clearFeedback()
        currentQuestion.value++
        selectedAnswer.value = answers.value[currentQuestion.value] ?? null
      }
    }

    const submitQuiz = async () => {
      console.log('Submit quiz triggered')
      // Save the last answer before submitting
      if (selectedAnswer.value !== null) {
        answers.value[currentQuestion.value] = selectedAnswer.value
      }
      
      clearFeedback()
      
      // Calculate score
      let correct = 0
      answers.value.forEach((answer, index) => {
        if (answer === questions.value[index].correctAnswer) {
          correct++
        }
      })
      
      // Set the score and mark quiz as completed
      score.value = Math.round((correct / questions.value.length) * 100)
      quizCompleted.value = true // This triggers the results view

      console.log('Answers:', answers.value)
      console.log('Score:', score.value)
      console.log('Quiz completed:', quizCompleted.value)
  
      try {
        const user = store.getters['auth/currentUser']
        
        if (!user) {
          console.error('No user logged in')
          return
        }
        
        // Submit quiz results to backend
        await store.dispatch('quizzes/submitQuizResult', {
          userId: user.uid,
          quizId: currentQuiz.value?.id || 'quiz-1',
          score: score.value,
          answers: answers.value,
          isPerfect: score.value === 100
        })
        
        console.log('Quiz submitted successfully')
      } catch (error) {
        console.error('Error submitting quiz:', error)
      }
    }

    const retakeQuiz = () => {
      clearFeedback()
      currentQuestion.value = 0
      selectedAnswer.value = null
      answers.value = []
      quizCompleted.value = false
      score.value = 0
    }

    // Debug functions
    const testStore = () => {
      console.log('Testing store...')
      const testQuiz = {
        id: 'test-quiz-id',
        skill: 'Test Skill',
        difficulty: 'easy',
        questions: [
          {
            question: 'What is 2 + 2?',
            options: ['3', '4', '5', '6'],
            correctAnswer: 1
          },
          {
            question: 'What is the capital of France?',
            options: ['London', 'Paris', 'Berlin', 'Madrid'],
            correctAnswer: 1
          }
        ]
      }
      store.dispatch('quizzes/setCurrentQuiz', testQuiz)
      console.log('Test quiz stored:', store.getters['quizzes/currentQuiz'])
    }

    const reloadQuiz = async () => {
      console.log('Reloading quiz...')
      loading.value = true
      clearFeedback()
      
      const routeParam = route.params.id
      if (routeParam) {
        const [skill, difficulty] = routeParam.split('-')
        if (skill && difficulty) {
          await pollForQuiz(skill, difficulty)
        }
      }
    }

    // Function to poll Firestore for quiz data
    const pollForQuiz = async (skill, difficulty, maxAttempts = 30) => {
      let attempts = 0
      
      while (attempts < maxAttempts) {
      try {
        console.log(`Polling attempt ${attempts + 1} for quiz: ${skill} - ${difficulty}`)
        
        // First, let's check what quizzes exist in the collection
        const allQuizzesRef = collection(db, 'quizzes')
        const allQuizzesSnapshot = await getDocs(allQuizzesRef)
        console.log('All quizzes in collection:')
        allQuizzesSnapshot.forEach((doc) => {
          const data = doc.data()
          console.log(`Quiz ID: ${doc.id}, Skill: "${data.skill}", Difficulty: "${data.difficulty}", Questions: ${data.questions?.length || 0}`)
        })
        
        // Query Firestore for the latest quiz with matching skill and difficulty
        const quizzesRef = collection(db, 'quizzes')
        const q = query(
          quizzesRef,
          where('skill', '==', skill),
          where('difficulty', '==', difficulty),
          orderBy('createdAt', 'desc'),
          limit(1)
        )
          
          const querySnapshot = await getDocs(q)
          
          console.log('Query snapshot size:', querySnapshot.size)
          console.log('Query snapshot empty:', querySnapshot.empty)
          
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0]
            const quizData = { id: doc.id, ...doc.data() }
            
            console.log('Raw quiz data from Firestore:', quizData)
            console.log('Quiz data questions:', quizData.questions)
            console.log('Questions length:', quizData.questions?.length)
            
            // Check if quiz has questions
            if (quizData.questions && quizData.questions.length > 0) {
              console.log('Quiz found with questions:', quizData.questions.length)
              console.log('First question:', quizData.questions[0])
              
              // Store in Vuex store
              await store.dispatch('quizzes/setCurrentQuiz', quizData)
              
              console.log('Quiz stored in store, setting loading to false')
              console.log('Store current quiz after dispatch:', store.getters['quizzes/currentQuiz'])
              loading.value = false
              return true
            } else {
              console.log('Quiz found but no questions or empty questions array')
            }
          } else {
            console.log('No quiz found in Firestore for:', { skill, difficulty })
            
            // Try to get any recent quiz as fallback
            const fallbackQuery = query(
              collection(db, 'quizzes'),
              orderBy('createdAt', 'desc'),
              limit(1)
            )
            const fallbackSnapshot = await getDocs(fallbackQuery)
            
            if (!fallbackSnapshot.empty) {
              const fallbackDoc = fallbackSnapshot.docs[0]
              const fallbackData = { id: fallbackDoc.id, ...fallbackDoc.data() }
              console.log('Found fallback quiz:', fallbackData)
              
              if (fallbackData.questions && fallbackData.questions.length > 0) {
                console.log('Using fallback quiz with questions:', fallbackData.questions.length)
                await store.dispatch('quizzes/setCurrentQuiz', fallbackData)
                loading.value = false
                return true
              }
            }
          }
          
          // Wait 2 seconds before next attempt
          await new Promise(resolve => setTimeout(resolve, 2000))
          attempts++
          
        } catch (error) {
          console.error('Error polling for quiz:', error)
          attempts++
        }
      }
      
      console.error('Quiz not found after maximum attempts')
      loading.value = false
      return false
    }

    // Function to get existing quiz data from Firestore
    const getExistingQuiz = async (skill, difficulty) => {
      try {
        // Query Firestore for existing quiz
        const quizzesRef = collection(db, 'quizzes')
        const q = query(
          quizzesRef,
          where('skill', '==', skill),
          where('difficulty', '==', difficulty),
          orderBy('createdAt', 'desc'),
          limit(1)
        )
        
        const querySnapshot = await getDocs(q)
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0]
          const quizData = { id: doc.id, ...doc.data() }
          
          // Check if quiz has questions
          if (quizData.questions && quizData.questions.length > 0) {
            return quizData
          }
        }
        
        return null
      } catch (error) {
        console.error('Error getting existing quiz:', error)
        return null
      }
    }

    // Function to generate new quiz via backend API
    const generateNewQuiz = async (skill, difficulty) => {
      try {
        console.log('Generating new quiz:', { skill, difficulty, numberOfQuestions: 5 })
        
        // Call the backend API to generate quiz
        const response = await quizApi.generateQuiz({
          skill: skill,
          difficulty: difficulty,
          numberOfQuestions: 5
        })
        
        console.log('Quiz generation completed:', response.data)
        
        if (response.data.success && response.data.quiz) {
          // Store the generated quiz in the store
          await store.dispatch('quizzes/setCurrentQuiz', response.data.quiz)
          loading.value = false
        } else {
          console.error('Quiz generation failed:', response.data)
          loading.value = false
        }
        
      } catch (error) {
        console.error('Error generating new quiz:', error)
        loading.value = false
      }
    }

    // Function to generate new quiz in background (non-blocking)
    const generateQuizInBackground = async (skill, difficulty) => {
      try {
        console.log('Starting background quiz generation:', { skill, difficulty, numberOfQuestions: 5 })
        
        // Call the backend API to generate quiz (don't await)
        quizApi.generateQuiz({
          skill: skill,
          difficulty: difficulty,
          numberOfQuestions: 5
        }).then(response => {
          console.log('Background quiz generation completed:', response.data)
        }).catch(error => {
          console.error('Background quiz generation failed:', error)
        })
        
      } catch (error) {
        console.error('Error starting background quiz generation:', error)
      }
    }

    onMounted(async () => {
      // Parse the route parameter to get skill and difficulty
      const routeParam = route.params.id
      if (!routeParam) {
        loading.value = false
        return
      }
      
      // Parse skill and difficulty from route (format: "skill-difficulty")
      const [skill, difficulty] = routeParam.split('-')
      if (!skill || !difficulty) {
        loading.value = false
        return
      }
      
      try {
        console.log(`Loading quiz for: ${skill} - ${difficulty}`)
        
        // First, try to get existing quiz data from Firestore
        const existingQuiz = await getExistingQuiz(skill, difficulty)
        
        if (existingQuiz) {
          console.log('Found existing quiz:', existingQuiz)
          // Store quiz data and display
          await store.dispatch('quizzes/setCurrentQuiz', existingQuiz)
          loading.value = false
        } else {
          console.log('No existing quiz found, generating new quiz...')
          // Generate new quiz via backend API
          await generateNewQuiz(skill, difficulty)
        }
        
      } catch (error) {
        console.error('Error loading quiz:', error)
        loading.value = false
      }
    })

    // Start image alternation when loading starts
    watch(loading, (newValue) => {
      console.log('Loading state changed:', newValue) // Debug log
      if (newValue) {
        loadingInterval.value = setInterval(() => {
          currentLoadingImage.value = currentLoadingImage.value === loading1 
            ? loading2 
            : loading1
          console.log('Switched to:', currentLoadingImage.value) // Debug log
        }, 200) // Switch every second
      } else {
        // Clear interval when loading stops
        if (loadingInterval.value) {
          clearInterval(loadingInterval.value)
          loadingInterval.value = null
        }
      }
    }, { immediate: true }) // Add immediate: true to trigger on initial load

    // Clean up interval on component unmount
    onUnmounted(() => {
      if (loadingInterval.value) {
        clearInterval(loadingInterval.value)
      }
    })

    // Format quiz title: "basic-safety" -> "Basic Safety"
    const formatQuizTitle = (title) => {
      if (!title) return ''
      // Split by hyphens and capitalize first letter of each word
      return title
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }

    // Capitalize first letter: "beginner" -> "Beginner"
    const capitalizeFirst = (str) => {
      if (!str) return ''
      return str.charAt(0).toUpperCase() + str.slice(1)
    }

    return {
      currentQuestion,
      selectedAnswer,
      answers,
      questions,
      progress,
      quizCompleted,
      score,
      loading,
      currentQuiz,
      showFeedback,
      isAnswerCorrect,
      currentLoadingImage,
      selectAnswer,
      nextQuestion,
      submitQuiz,
      retakeQuiz,
      testStore,
      reloadQuiz,
      formatQuizTitle,
      capitalizeFirst
    }
  }
}
</script>

<style scoped>
.quiz-take-page {
  min-height: calc(100vh - 70px);
  background: var(--bg-light);
  padding: 40px 20px;
}

.quiz-container {
  max-width: 900px;
  margin: 0 auto;
}

/* Compact Combined Header */
.quiz-header-compact {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(74, 158, 245, 0.15);
}

.quiz-header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.quiz-badges-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.question-badge-pill,
.difficulty-badge-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.8125rem;
  font-weight: 600;
  white-space: nowrap;
}

.question-badge-pill {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(64, 123, 255, 0.3);
}

.difficulty-badge-pill {
  background: rgba(13, 27, 53, 0.7);
  color: var(--text);
  border: 1px solid rgba(74, 158, 245, 0.2);
}

.quiz-title-text {
  font-size: 1.375rem;
  color: var(--text);
  margin: 0;
  font-weight: 700;
  line-height: 1.3;
}

.quiz-header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
  justify-content: flex-end;
  padding-top: 4px;
}

.progress-counter {
  color: var(--text-muted);
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
  line-height: 1.2;
}

.progress-bar-slim {
  height: 4px;
  width: 120px;
  background: rgba(74, 158, 245, 0.12);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}


.progress-fill-slim {
  height: 100%;
  background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%);
  border-radius: 4px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.progress-fill-slim::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Modern Quiz Content */
.quiz-content-modern {
  background: rgba(13, 27, 53, 0.7);
  padding: 24px 32px;
  border-radius: 16px;
  border: 1px solid rgba(74, 158, 245, 0.15);
  backdrop-filter: blur(12px);
}

.question-card-modern {
  position: relative;
}

.question-text {
  font-size: 1.25rem;
  color: var(--text);
  margin-bottom: 24px;
  font-weight: 600;
  line-height: 1.4;
}

/* Modern Options Grid */
.options-grid {
  display: grid;
  gap: 12px;
  margin-bottom: 24px;
}

.option-modern {
  position: relative;
  background: rgba(10, 22, 40, 0.5);
  border: 1px solid rgba(74, 158, 245, 0.15);
  border-radius: 12px;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.option-modern::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.option-modern:hover {
  border-color: var(--primary);
  border-width: 1px;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(64, 123, 255, 0.15);
}

.option-modern.selected {
  border-color: var(--primary);
  border-width: 1px;
  background: linear-gradient(135deg, rgba(64, 123, 255, 0.05) 0%, rgba(64, 123, 255, 0.02) 100%);
  box-shadow: 0 4px 16px rgba(64, 123, 255, 0.2);
}

.option-modern.correct {
  border-color: #10b981 !important;
  border-width: 1px !important;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%) !important;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4) !important;
  animation: correctPulse 0.6s ease-out;
}

.option-modern.incorrect {
  border-color: #ef4444 !important;
  border-width: 1px !important;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.15) 100%) !important;
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.4) !important;
  animation: incorrectShake 0.6s ease-out;
}

@keyframes correctPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

@keyframes incorrectShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}

.option-content {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.option-letter-modern {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(74, 158, 245, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  color: var(--text);
  transition: all 0.3s;
  flex-shrink: 0;
}

.option-modern.selected .option-letter-modern {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(64, 123, 255, 0.4);
}

.option-modern.correct .option-letter-modern {
  background: #10b981 !important;
  color: white !important;
}

.option-modern.incorrect .option-letter-modern {
  background: #ef4444 !important;
  color: white !important;
}

.option-text-modern {
  flex: 1;
  color: var(--text);
  font-size: 1rem;
  line-height: 1.5;
  font-weight: 500;
}

.feedback-checkmark,
.feedback-cross {
  position: absolute;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  animation: fadeInScale 0.3s ease-out;
}

.feedback-checkmark {
  color: #10b981;
}

.feedback-cross {
  color: #ef4444;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: translateY(-50%) scale(0);
  }
  to {
    opacity: 1;
    transform: translateY(-50%) scale(1);
  }
}

/* Modern Feedback Message */
.feedback-slide-enter-active,
.feedback-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.feedback-slide-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.feedback-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.feedback-message-modern {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  animation: slideInFeedback 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideInFeedback {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feedback-message-modern.correct {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%);
  border: 1px solid #10b981;
}

.feedback-message-modern.incorrect {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%);
  border: 1px solid #ef4444;
}

.feedback-icon-modern {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.feedback-message-modern.correct .feedback-icon-modern {
  color: #10b981;
}

.feedback-message-modern.incorrect .feedback-icon-modern {
  color: #ef4444;
}

.feedback-text-modern h3 {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0 0 6px 0;
}

.feedback-message-modern.correct .feedback-text-modern h3 {
  color: #34d399;
}

.feedback-message-modern.incorrect .feedback-text-modern h3 {
  color: #f87171;
}

.feedback-text-modern p {
  margin: 0;
  color: var(--text);
  line-height: 1.5;
}

/* Modern Quiz Actions */
.quiz-actions-modern {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-next,
.btn-submit {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(64, 123, 255, 0.3);
  letter-spacing: -0.01em;
}

.btn-next:hover:not(:disabled),
.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(64, 123, 255, 0.4);
}

.btn-next:active:not(:disabled),
.btn-submit:active:not(:disabled) {
  transform: translateY(0);
}

.btn-next:disabled,
.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-next svg,
.btn-submit svg {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
}

.btn-next:hover:not(:disabled) svg,
.btn-submit:hover:not(:disabled) svg {
  transform: translateX(4px);
}


/* Responsive adjustments */
@media (max-width: 768px) {
  .quiz-content-modern {
    padding: 20px;
  }

  .quiz-header-compact {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .quiz-header-right {
    width: 100%;
    align-items: flex-start;
  }

  .progress-bar-slim {
    width: 100%;
  }

  .quiz-title-text {
    font-size: 1.125rem;
  }

  .question-text {
    font-size: 1.125rem;
  }

  .option-modern {
    padding: 14px 16px;
  }

  .option-letter-modern {
    width: 32px;
    height: 32px;
    font-size: 0.9375rem;
  }
}

/* Modern Quiz Results */
.quiz-results-modern {
  background: rgba(13, 27, 53, 0.7);
  padding: 24px 32px;
  border-radius: 16px;
  border: 1px solid rgba(74, 158, 245, 0.15);
  backdrop-filter: blur(12px);
}

.results-card-modern {
  display: flex;
  flex-direction: column;
}

.results-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1.5px solid rgba(74, 158, 245, 0.12);
}

.score-display {
  display: flex;
  align-items: center;
  gap: 24px;
}

.score-circle-modern {
  width: 96px;
  height: 96px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(64, 123, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.15);
  position: relative;
  transition: all 0.3s ease;
}

.score-circle-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(64, 123, 255, 0.25);
}

.score-value {
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.02em;
}

.score-info {
  flex: 1;
}

.results-title {
  font-size: 1.625rem;
  color: var(--text);
  margin: 0 0 8px 0;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.results-message {
  color: var(--text-muted);
  font-size: 0.9375rem;
  margin: 0;
  line-height: 1.6;
  letter-spacing: -0.01em;
}

/* Compact Summary - Professional & Minimalistic */
.quiz-summary-modern {
  margin-bottom: 24px;
}

.summary-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 20px 0;
  padding-bottom: 0;
  border-bottom: none;
  letter-spacing: -0.01em;
}

.summary-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-item-modern {
  padding: 18px 20px;
  background: transparent;
  border-radius: 12px;
  border: 1px solid rgba(74, 158, 245, 0.12);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.summary-item-modern:hover {
  border-color: rgba(74, 158, 245, 0.25);
  background: rgba(74, 158, 245, 0.04);
  transform: translateX(4px);
}

.summary-header-compact {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.summary-question-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 8px;
  background: transparent;
  color: var(--text-muted);
  border: 1px solid rgba(74, 158, 245, 0.2);
  border-radius: 6px;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.summary-status-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
}

.summary-status-icon.correct {
  color: #10b981;
  background: transparent;
}

.summary-status-icon:not(.correct) {
  color: #ef4444;
  background: transparent;
}

.summary-question-text {
  font-size: 0.9375rem;
  color: var(--text);
  font-weight: 500;
  margin: 0 0 14px 0;
  line-height: 1.5;
  letter-spacing: -0.01em;
}

.summary-answers-compact {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-left: 0;
}

.answer-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 0.875rem;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

/* User got it CORRECT - GREEN */
.answer-row.correct {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.35);
}

.answer-row.correct .answer-label {
  color: #34d399;
}

.answer-row.correct .answer-value {
  color: #34d399;
  font-weight: 600;
}

/* User got it WRONG - RED */
.answer-row:not(.correct) {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.35);
}

.answer-row:not(.correct) .answer-label {
  color: #f87171;
}

.answer-row:not(.correct) .answer-value {
  color: #f87171;
  font-weight: 600;
}

/* CORRECT ANSWER (when user was wrong) - BOLD GREEN */
.correct-answer-row {
  background: rgba(16, 185, 129, 0.2) !important;
  color: #34d399 !important;
  border-color: rgba(16, 185, 129, 0.4) !important;
}

.answer-label {
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  line-height: 1.5;
}

.answer-value {
  flex: 1;
  font-weight: 500;
  line-height: 1.5;
}

/* CORRECT ANSWER row styling (shown when user was wrong) */
.correct-answer-row .answer-label {
  color: #34d399 !important;
  font-weight: 700;
}

.correct-answer-row .answer-value {
  font-weight: 700 !important;
  color: #34d399 !important;
}

.results-actions-modern {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding-top: 24px;
  border-top: 1px solid rgba(74, 158, 245, 0.12);
}

.btn-secondary-modern,
.btn-primary-modern {
  padding: 13px 28px;
  border-radius: 11px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  letter-spacing: -0.01em;
}

.btn-secondary-modern {
  background: rgba(74, 158, 245, 0.08);
  color: var(--text);
  border: 1.5px solid rgba(74, 158, 245, 0.2);
}

.btn-secondary-modern:hover {
  background: rgba(74, 158, 245, 0.15);
  border-color: rgba(74, 158, 245, 0.35);
  transform: translateY(-1px);
}

.btn-primary-modern {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 16px rgba(64, 123, 255, 0.25);
  font-weight: 600;
}

.btn-primary-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(64, 123, 255, 0.35);
}

.btn-primary-modern:active {
  transform: translateY(0);
}


/* Loading State Styles */
.loading-state {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  background: rgba(13, 27, 53, 0.85);
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  max-width: 400px;
  width: 90%;
  border: 1px solid rgba(74, 158, 245, 0.2);
  backdrop-filter: blur(20px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.loading-content:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4);
}

/* Update spinner to be more prominent */
.loading-spinner {
  width: 70px;
  height: 70px;
  border: 5px solid rgba(74, 158, 245, 0.15);
  border-top: 5px solid var(--primary);
  border-radius: 50%;
  animation: spin 1.2s cubic-bezier(0.45, 0, 0.55, 1) infinite;
  margin: 0 auto 25px;
}

/* Enhance loading dots */
.loading-dots {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 25px;
}

.loading-dots span {
  width: 10px;
  height: 10px;
  background: var(--primary);
  border-radius: 50%;
  opacity: 0.7;
  animation: bounce 1.4s cubic-bezier(0.45, 0, 0.55, 1) infinite both;
}

.loading-dots span {
  box-shadow: 0 0 10px rgba(74, 158, 245, 0.5);
}

/* Enhanced Visual Effects */
.option.correct-answer {
  border-color: #10b981;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.15));
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
  transform: scale(1.02);
  animation: correctPulse 0.8s ease-in-out;
}

.option.incorrect-answer {
  border-color: #ef4444;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.15));
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
  animation: incorrectShake 0.8s ease-in-out;
}

.option.show-correct {
  border-color: #10b981;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(16, 185, 129, 0.18));
  box-shadow: 0 0 25px rgba(16, 185, 129, 0.5);
  animation: correctGlow 1s ease-in-out;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

@keyframes correctPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1.02); }
}

@keyframes incorrectShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@keyframes correctGlow {
  0% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.3); }
  50% { box-shadow: 0 0 25px rgba(16, 185, 129, 0.6); }
  100% { box-shadow: 0 0 15px rgba(16, 185, 129, 0.4); }
}

/* Feedback Message Styles */
.feedback-message {
  margin: 20px 0;
  padding: 20px;
  border-radius: 12px;
  animation: slideIn 0.3s ease-out;
}

.feedback-message.correct {
  background: rgba(16, 185, 129, 0.15);
  border: 2px solid #10b981;
}

.feedback-message.incorrect {
  background: rgba(239, 68, 68, 0.15);
  border: 2px solid #ef4444;
}

.feedback-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.feedback-icon-large {
  font-size: 2rem;
}

.feedback-text h3 {
  margin: 0 0 8px 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.feedback-text p {
  margin: 0;
  color: var(--text-muted);
}

.feedback-message.correct .feedback-text h3 {
  color: #10b981;
}

.feedback-message.incorrect .feedback-text h3 {
  color: #ef4444;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loading-content h2 {
  font-size: 1.5rem;
  color: var(--text);
  margin-bottom: 10px;
  font-weight: 700;
}

.loading-content p {
  font-size: 1rem;
  color: var(--text-muted);
  margin-bottom: 0;
}

.loading-image {
  width: 120px;
  height: 120px;
  margin: 0 auto 25px;
}

.loading-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: opacity 0.3s ease;
}


/* Update option styles for better feedback */
.option.selected.correct {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.15);
}

.option.selected.incorrect {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.15);
}

.feedback-icon {
  margin-left: auto;
  font-weight: bold;
  font-size: 1.2rem;
}

.feedback-icon.correct {
  color: #10b981;
}

.feedback-icon.incorrect {
  color: #ef4444;
}
</style>

