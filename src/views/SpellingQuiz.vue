 <!-- The follow code was taken and adapted from the following repository https://github.com/Snake0good/Drag-and-Drop-Spelling-Game -->

<template>
  <div class="spelling-quiz-page">
    <div class="spelling-quiz-container">
      <div v-if="loading" class="loading-state">
        <div class="loading-content">
          <div class="loading-image">
            <img :src="currentLoadingImage" alt="Loading animation" />
          </div>
          <h2>Generating Your Quiz...</h2>
          <p>Please wait while we create your personalized spelling quiz with AI</p>
          <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <template v-else>
        <div class="quiz-header">
          <h1>Spelling Challenge</h1>
          <div class="quiz-progress">
            <span>Word {{ currentWord + 1 }} of {{ words.length }}</span>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
            </div>
          </div>
        </div>

        <div v-if="!quizCompleted && currentWordData" class="spelling-game">
        <div class="word-display">
          <div class="hint-section">
            <div v-if="currentWordData.image" class="hint-image">
              <img :src="currentWordData.image" :alt="currentWordData.hint" />
            </div>
            <div v-else class="hint-text">
              <h2>{{ currentWordData.hint }}</h2>
            </div>
          </div>
        </div>

        <div class="game-area">
          <div class="drop-zones">
          <div
            v-for="(slot, index) in letterSlots"
            :key="`slot-${index}`"
            :class="['drop-zone', { filled: slot.letter }]"
            :data-slot="index"
            @click="handleSlotClick(index)"
          >
              <span v-if="slot.letter" class="letter">{{ slot.letter }}</span>
            </div>
          </div>

          <div class="letter-pool">
            <div
              v-for="(letter, index) in availableLetters"
              :key="`letter-${index}`"
              :class="['draggable-letter', { used: letter.used }]"
              :data-letter="letter.char"
              :data-index="index"
              :data-letter-id="`${letter.char}-${index}`"
              @click="handleLetterClick"
            >
              {{ letter.char }}
            </div>
          </div>
        </div>

        <div class="game-actions">
          <button @click="checkAnswer" class="btn btn-primary" :disabled="!isWordComplete">
            Check Answer
          </button>
          <button @click="resetCurrentWord" class="btn btn-secondary">
            Reset
          </button>
        </div>
      </div>

        <div v-else-if="!currentWordData" class="empty-state">
          <p>No words available. Please try again.</p>
        </div>

        <div v-else class="quiz-results">
        <div class="results-card">
          <div class="score-circle">
            <h2>{{ score }}%</h2>
            <p>Your Score</p>
          </div>

          <h3>{{ score >= 80 ? '🎉 Excellent Spelling!' : 'Keep Practicing!' }}</h3>
          <p v-if="score >= 80">
            You've mastered the spelling challenge and earned a badge!
          </p>
          <p v-else>
            You need 80% or higher to earn a badge. Keep practicing!
          </p>

          <div class="results-actions">
            <router-link to="/quizzes" class="btn btn-secondary">
              Back to Quizzes
            </router-link>
            <button @click="retakeQuiz" class="btn btn-primary">
              Retake Quiz
            </button>
          </div>
        </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useStore } from 'vuex'
import { useToast } from '../composables/useToast'
import { useRoute } from 'vue-router'
import { quizApi } from '../services/api'
import loading1 from '../assets/loading-1.png'
import loading2 from '../assets/loading-2.png'

export default {
  name: 'SpellingQuiz',
  setup() {
    const store = useStore()
    const route = useRoute()
    const { showToast } = useToast()

    const currentWord = ref(0)
    const letterSlots = ref([])
    const availableLetters = ref([])
    const quizCompleted = ref(false)
    const score = ref(0)
    const correctAnswers = ref(0)
    const words = ref([])
    const loading = ref(true)
    const currentLoadingImage = ref(loading1)
    const loadingInterval = ref(null)

    const currentWordData = computed(() => words.value[currentWord.value] || null)
    const progress = computed(() => words.value.length > 0 ? ((currentWord.value + 1) / words.value.length) * 100 : 0)
    const isWordComplete = computed(() => letterSlots.value.length > 0 && letterSlots.value.every(slot => slot.letter))

    // generate random extra letters
    const createExtraLetters = (exclude = [], count = 3) => {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
      const pool = alphabet.filter(l => !exclude.includes(l))
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[pool[i], pool[j]] = [pool[j], pool[i]]
      }
      return pool.slice(0, Math.min(count, pool.length))
    }

    const initializeWord = async () => {
      const word = currentWordData.value
      if (!word) return

      // Ensure word and letters are normalized and match
      const normalizedWord = (word.word || '').toUpperCase().trim()
      let normalizedLetters = word.letters
        ? word.letters.map(l => (l || '').toUpperCase().trim()).filter(l => l)
        : []
      
      // Validate that letters array matches word length
      if (normalizedWord.length !== normalizedLetters.length) {
        console.warn('Word length mismatch:', {
          word: normalizedWord,
          wordLength: normalizedWord.length,
          letters: normalizedLetters,
          lettersLength: normalizedLetters.length
        })
        // If mismatch, create letters array from word
        if (normalizedWord.length > 0) {
          normalizedLetters = normalizedWord.split('')
        }
      }

      letterSlots.value = normalizedLetters.map(() => ({ letter: null, letterId: null }))
      const uniqueWordLetters = [...new Set(normalizedLetters)]
      
      // Use API distractors if available, otherwise generate random ones
      const extras = word.distractors && word.distractors.length > 0 
        ? word.distractors.map(d => (d || '').toUpperCase().trim()).filter(d => d)
        : createExtraLetters(uniqueWordLetters, 3)
      
      const shuffled = [...normalizedLetters, ...extras].sort(() => Math.random() - 0.5)
      availableLetters.value = shuffled.map(char => ({ char: char.toUpperCase(), used: false }))

      await nextTick()
      setupInteract()
      resetPoolPositions()
    }

    const resetPoolPositions = () => {
      setTimeout(() => {
        document.querySelectorAll('.draggable-letter').forEach(el => {
          const letterId = el.getAttribute('data-letter-id')
          const isInSlot = letterSlots.value.some(slot => slot.letterId === letterId)
          if (!isInSlot) {
            el.style.transition = 'transform 0.2s ease'
            el.style.transform = ''
            el.setAttribute('data-x', '0')
            el.setAttribute('data-y', '0')
            setTimeout(() => (el.style.transition = ''), 200)
          }
        })
      }, 50)
    }

    // smooth follow cursor
    const dragMoveListener = (event) => {
      const target = event.target
      const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
      const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy
      target.style.transform = `translate(${x}px, ${y}px)`
      target.setAttribute('data-x', x)
      target.setAttribute('data-y', y)
    }

    const setupInteract = () => {
      if (!window.interact) return
      try {
        window.interact('.draggable-letter').unset()
        window.interact('.drop-zone').unset()
      } catch (e) {}

      // make letters draggable
      window.interact('.draggable-letter')
        .draggable({
          autoScroll: true,
          listeners: { move: dragMoveListener },
          inertia: true,
          startAxis: 'xy',
          lockAxis: 'xy',
          modifiers: [],
          start(event) {
            const letterId = event.target.getAttribute('data-letter-id')
            const letterIndex = parseInt(event.target.getAttribute('data-index'), 10)
            event.target.classList.add('is-dragging')

            // remove from any existing slot
            letterSlots.value.forEach(slot => {
              if (slot.letterId === letterId) {
                slot.letter = null
                slot.letterId = null
              }
            })

            if (!isNaN(letterIndex) && availableLetters.value[letterIndex]) {
              availableLetters.value[letterIndex].used = false
              event.target.classList.remove('used')
            }

            event.target.setAttribute('data-x', '0')
            event.target.setAttribute('data-y', '0')
            event.target.style.transform = ''
          },
          end(event) {
            event.target.classList.remove('is-dragging')
            const letterId = event.target.getAttribute('data-letter-id')
            const isInSlot = letterSlots.value.some(slot => slot.letterId === letterId)
            if (!isInSlot) {
              event.target.style.transition = 'transform 0.2s ease'
              event.target.style.transform = ''
              event.target.setAttribute('data-x', '0')
              event.target.setAttribute('data-y', '0')
              setTimeout(() => (event.target.style.transition = ''), 200)
            }
          }
        })

      // define droppable slots
      window.interact('.drop-zone').dropzone({
        accept: '.draggable-letter',
        overlap: 0.3,
        ondrop(event) {
          const dragged = event.relatedTarget
          const dropZone = event.target
          const slotIndex = parseInt(dropZone.getAttribute('data-slot'), 10)
          const letterId = dragged.getAttribute('data-letter-id')
          const letterChar = dragged.getAttribute('data-letter')
          const letterIndex = parseInt(dragged.getAttribute('data-index'), 10)

          // if slot already filled → release old one
          const existing = letterSlots.value[slotIndex]
          if (existing && existing.letterId && existing.letterId !== letterId) {
            const prevLetterId = existing.letterId
            const prev = document.querySelector(`[data-letter-id="${prevLetterId}"]`)
            if (prev) {
              prev.classList.remove('used')
              prev.style.transition = 'transform 0.2s ease'
              prev.style.transform = ''
              setTimeout(() => (prev.style.transition = ''), 200)
            }
            const prevLetter = availableLetters.value.find(l => `${l.char}-${letterIndex}` === prevLetterId)
            if (prevLetter) prevLetter.used = false
          }

          // place new letter in slot
          letterSlots.value[slotIndex].letter = letterChar
          letterSlots.value[slotIndex].letterId = letterId
          if (!isNaN(letterIndex)) availableLetters.value[letterIndex].used = true

          // center it
          const dropRect = dropZone.getBoundingClientRect()
          const dragRect = dragged.getBoundingClientRect()
          const offsetX = dropRect.left - dragRect.left + (dropRect.width - dragRect.width) / 2
          const offsetY = dropRect.top - dragRect.top + (dropRect.height - dragRect.height) / 2
          dragged.style.transition = 'transform 0.25s ease'
          dragged.style.transform = `translate(${offsetX}px, ${offsetY}px)`
          dragged.setAttribute('data-x', offsetX)
          dragged.setAttribute('data-y', offsetY)
          setTimeout(() => (dragged.style.transition = ''), 250)
          resetPoolPositions()
        }
      })
    }

    // tap pool letter → fill first empty slot
    const handleLetterClick = (event) => {
      const el = event.currentTarget
      const letter = el.getAttribute('data-letter')
      const index = parseInt(el.getAttribute('data-index'), 10)
      if (!letter || isNaN(index) || availableLetters.value[index].used) return

      const firstEmpty = letterSlots.value.findIndex(slot => !slot.letter)
      if (firstEmpty === -1) return

      letterSlots.value[firstEmpty].letter = letter
      letterSlots.value[firstEmpty].letterId = el.getAttribute('data-letter-id')
      availableLetters.value[index].used = true
      el.classList.add('used')

      const dropZone = document.querySelector(`.drop-zone[data-slot="${firstEmpty}"]`)
      if (dropZone) {
        const dropRect = dropZone.getBoundingClientRect()
        const dragRect = el.getBoundingClientRect()
        const offsetX = dropRect.left - dragRect.left + (dropRect.width - dragRect.width) / 2
        const offsetY = dropRect.top - dragRect.top + (dropRect.height - dragRect.height) / 2
        el.style.transition = 'transform 0.25s ease'
        el.style.transform = `translate(${offsetX}px, ${offsetY}px)`
        el.setAttribute('data-x', offsetX)
        el.setAttribute('data-y', offsetY)
        setTimeout(() => (el.style.transition = ''), 250)
      }
    }

    // tap slot → remove letter and restore to pool
    const handleSlotClick = (index) => {
      const slot = letterSlots.value[index]
      if (!slot.letterId) return

      const el = document.querySelector(`[data-letter-id="${slot.letterId}"]`)
      if (el) {
        el.classList.remove('used')
        el.style.transition = 'transform 0.2s ease'
        el.style.transform = ''
        el.setAttribute('data-x', '0')
        el.setAttribute('data-y', '0')
        setTimeout(() => (el.style.transition = ''), 200)
      }

      const match = availableLetters.value.find(l => `${l.char}-${availableLetters.value.indexOf(l)}` === slot.letterId)
      if (match) match.used = false

      slot.letter = null
      slot.letterId = null
    }

    const checkAnswer = () => {
      if (!currentWordData.value) return
      // Get user answer and normalize (uppercase, trim whitespace)
      const userAnswer = letterSlots.value
        .map(slot => slot.letter || '')
        .join('')
        .toUpperCase()
        .trim()
      
      // Get correct answer and normalize (uppercase, trim whitespace)
      const correctAnswer = (currentWordData.value.word || '').toUpperCase().trim()
      
      // Debug logging
      console.log('Answer check:', { 
        userAnswer, 
        correctAnswer, 
        match: userAnswer === correctAnswer 
      })
      
      if (userAnswer === correctAnswer) {
        correctAnswers.value++
        showToast('Correct!', 'success')
      } else {
        showToast(`Incorrect. The correct spelling is: ${correctAnswer}`, 'error')
      }
      if (currentWord.value < words.value.length - 1) {
        currentWord.value++
        initializeWord()
      } else {
        score.value = Math.round((correctAnswers.value / words.value.length) * 100)
        quizCompleted.value = true
        submitQuizResult()
      }
    }

    const resetCurrentWord = async () => {
      if (!currentWordData.value) return
      letterSlots.value = letterSlots.value.map(() => ({ letter: null, letterId: null }))
      availableLetters.value = availableLetters.value.map(l => ({ ...l, used: false }))
      await nextTick()
      resetPoolPositions()
      setupInteract()
    }

    const submitQuizResult = async () => {
      try {
        const user = store.getters['auth/currentUser']
        const isPerfect = score.value === 100
        await store.dispatch('quizzes/submitQuizResult', {
          userId: user.uid,
          quizId: 'spelling-quiz',
          score: score.value,
          answers: [],
          isPerfect
        })
      } catch (e) { console.error('Error submitting quiz:', e) }
    }

    const retakeQuiz = () => {
      currentWord.value = 0
      correctAnswers.value = 0
      quizCompleted.value = false
      score.value = 0
      initializeWord()
    }

    const fetchSpellingWords = async () => {
      loading.value = true
      
      try {
        // Get difficulty from query parameter, default to 'Beginner' if not provided
        const difficulty = route.query.difficulty || 'Beginner'
        
        // Generate exactly 5 words - keep trying until we have 5 valid words
        const generatedWords = []
        const maxRetries = 15 // Maximum total attempts to prevent infinite loops
        let attempts = 0
        
        while (generatedWords.length < 5 && attempts < maxRetries) {
          attempts++
          try {
            const response = await quizApi.generateConstructionSpellingWord({ difficulty })
            if (response.data.success && response.data.word) {
              const word = response.data.word
              // Normalize word to uppercase and ensure proper structure
              const normalizedWord = {
                word: (word.word || '').toUpperCase().trim(),
                hint: word.hint || '',
                letters: Array.isArray(word.letters) 
                  ? word.letters.map(l => (l || '').toUpperCase().trim()).filter(l => l)
                  : [],
                distractors: Array.isArray(word.distractors)
                  ? word.distractors.map(d => (d || '').toUpperCase().trim()).filter(d => d)
                  : [],
                image: null
              }
              
              // Validate word structure - ensure we have at least 1 distractor
              if (normalizedWord.word && normalizedWord.letters.length > 0 && normalizedWord.distractors.length >= 1) {
                generatedWords.push(normalizedWord)
                console.log(`✅ Generated word ${generatedWords.length}/5:`, normalizedWord.word)
              } else {
                console.warn(`❌ Invalid word structure (letters: ${normalizedWord.letters.length}, distractors: ${normalizedWord.distractors.length}), retrying... (attempt ${attempts})`, word)
              }
            } else {
              console.warn(`⚠️ Failed to generate word (attempt ${attempts}):`, response.data)
            }
          } catch (wordError) {
            console.error(`❌ Error generating word (attempt ${attempts}):`, wordError)
          }
        }
        
        // Ensure we have exactly 5 words
        if (generatedWords.length < 5) {
          throw new Error(`Failed to generate 5 words. Only generated ${generatedWords.length} words after ${attempts} attempts.`)
        }
        
        console.log(`🎉 Successfully generated all 5 words in ${attempts} attempts`)
        
        // Save the complete quiz to Firestore AFTER all words are generated
        // This ensures the saved quiz matches exactly what the user sees
        try {
          const response = await quizApi.generateSpellingQuiz({
            skill: 'construction',
            difficulty: difficulty,
            numberOfWords: generatedWords.length,
            words: generatedWords  // Send the exact same words array we'll use
          })
          console.log('✅ Spelling quiz saved to Firestore:', response.data.quizId)
          console.log('Saved words:', generatedWords.map(w => w.word))
        } catch (saveError) {
          // If saving fails, still use the words but log the error
          console.error('⚠️ Failed to save spelling quiz to Firestore:', saveError)
        }
        
        // Set words AFTER saving - this ensures consistency
        words.value = generatedWords
        console.log('Quiz loaded with words:', words.value.map(w => w.word))
        
        await nextTick()
        initializeWord()
      } catch (error) {
        console.error('Error fetching spelling words:', error)
        showToast('Failed to generate quiz. Please try again.', 'error')
        // Fallback to hardcoded words if API fails (all normalized)
        words.value = [
          { word: 'SAFETY', hint: 'Protection from danger', letters: ['S','A','F','E','T','Y'], distractors: ['X','Z','Q'], image: null },
          { word: 'TOOLS', hint: 'Equipment used for work', letters: ['T','O','O','L','S'], distractors: ['X','Z','Q'], image: null },
          { word: 'HELMET', hint: 'Protective headgear worn on construction sites', letters: ['H','E','L','M','E','T'], distractors: ['X','Z','Q','J'], image: null },
          { word: 'HAMMER', hint: 'Tool for hitting nails', letters: ['H','A','M','M','E','R'], distractors: ['X','Z','Q','J'], image: null }
        ]
        await nextTick()
        initializeWord()
      } finally {
        loading.value = false
      }
    }

    // Start image alternation when loading starts
    watch(loading, (newValue) => {
      if (newValue) {
        loadingInterval.value = setInterval(() => {
          currentLoadingImage.value = currentLoadingImage.value === loading1 
            ? loading2 
            : loading1
        }, 200)
      } else {
        if (loadingInterval.value) {
          clearInterval(loadingInterval.value)
          loadingInterval.value = null
        }
      }
    }, { immediate: true })

    onMounted(fetchSpellingWords)
    onUnmounted(() => {
      if (loadingInterval.value) {
        clearInterval(loadingInterval.value)
      }
      if (window.interact) {
        try {
          window.interact('.draggable-letter').unset()
          window.interact('.drop-zone').unset()
        } catch {}
      }
    })

    return {
      currentWord,
      letterSlots,
      availableLetters,
      quizCompleted,
      score,
      words,
      loading,
      currentWordData,
      progress,
      isWordComplete,
      currentLoadingImage,
      checkAnswer,
      resetCurrentWord,
      retakeQuiz,
      handleLetterClick,
      handleSlotClick
    }
  }
}
</script>


<style scoped>
.spelling-quiz-page {
  min-height: calc(100vh - 70px);
  background: var(--bg-dark);
  padding: 40px 20px;
}

.spelling-quiz-container {
  max-width: 1000px;
  margin: 0 auto;
}

.quiz-header {
  background: var(--bg);
  padding: 30px;
  border-radius: 12px 12px 0 0;
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-bottom: none;
  margin-bottom: 0;
}

.quiz-header h1 {
  font-size: 2rem;
  color: var(--text);
  margin-bottom: 20px;
}

.quiz-progress span {
  color: var(--text-muted);
  margin-bottom: 10px;
  display: block;
}

.progress-bar {
  height: 8px;
  background: var(--border);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary);
  transition: width 0.3s;
}

.loading-state {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  padding: 60px 20px;
}

.loading-content {
  background: #ffffff;
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  max-width: 400px;
  width: 90%;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.dark-mode .loading-content {
  background: #000000;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.loading-content:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
}

.dark-mode .loading-content:hover {
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.8);
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

.loading-content h2 {
  font-size: 1.5rem;
  color: var(--text);
  margin-bottom: 10px;
}

.loading-content p {
  font-size: 1rem;
  color: var(--text-muted);
  margin-bottom: 0;
}

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

.dark-mode .loading-dots span {
  opacity: 1;
  box-shadow: 0 0 10px rgba(0, 123, 255, 0.5);
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.spelling-game {
  background: var(--bg);
  padding: 40px;
  border-radius: 0 0 12px 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.word-display {
  text-align: center;
  margin-bottom: 40px;
}

.hint-section {
  margin-bottom: 20px;
}

.hint-image {
  margin-bottom: 20px;
}

.hint-image img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.hint-text h2 {
  font-size: 1.8rem;
  color: var(--primary);
  margin: 0;
  font-weight: 600;
}


.game-area {
  margin-bottom: 40px;
}

.drop-zones {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.drop-zone {
  width: 60px;
  height: 60px;
  border: 3px dashed var(--border);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-light);
  transition: all 0.2s ease;
  position: relative;
}

.drop-zone.filled {
  border-color: var(--primary);
  background: var(--primary);
  color: white;
}

.drop-zone.drop-active {
  border-color: var(--primary);
  background: var(--primary);
  opacity: 0.8;
  animation: pulse 0.5s ease-in-out;
}

.drop-zone.drop-target {
  border-color: var(--secondary);
  background: var(--secondary);
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(0, 123, 255, 0.3);
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.drop-zone .letter {
  font-size: 1.5rem;
  font-weight: bold;
}

.letter-pool {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
  gap: 10px;
  justify-items: center;
  align-items: center;
  max-width: 400px;
  margin: 20px auto;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
  position: relative;
}

.dark-mode .letter-pool {
  background: rgba(255, 255, 255, 0.05);
}

.draggable-letter {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary);
  color: white;
  border-radius: 10px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: move;
  user-select: none;
  touch-action: none;
  transition: all 0.2s ease;
  position: relative;
}

.draggable-letter.is-dragging {
  position: absolute !important;
  z-index: 999;
  pointer-events: none;
}

.draggable-letter:hover:not(.used) {
  background: var(--secondary);
  transform: scale(1.1);
}

.draggable-letter.used {
  opacity: 0.5;
  background: #e9ecef;
  color: #6c757d;
  border: 2px solid #dee2e6;
  transform: none !important; /* prevent offset transforms */
  z-index: 0;
}

.draggable-letter.can-drop {
  transform: scale(1.05);
  box-shadow: 0 0 15px var(--primary);
  background: var(--secondary);
}

.game-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.quiz-results {
  background: var(--bg);
  padding: 40px;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.results-card {
  text-align: center;
}

.score-circle {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto 30px;
}

.score-circle h2 {
  font-size: 3.5rem;
  margin-bottom: 5px;
}

.score-circle p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.results-card h3 {
  font-size: 2rem;
  color: var(--text);
  margin-bottom: 15px;
}

.results-card > p {
  color: var(--text-muted);
  font-size: 1.1rem;
  margin-bottom: 30px;
}

.results-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

@media (max-width: 768px) {
  .word-display h2 {
    font-size: 2rem;
  }
  
  .drop-zone {
    width: 50px;
    height: 50px;
  }
  
  .draggable-letter {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
}
</style>
