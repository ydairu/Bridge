<template>
  <div class="quiz-card">
    <div :class="['quiz-card-inner', `gradient-${level}`]">
      <div class="quiz-card-content">
        <div class="quiz-identity">
          <div :class="['quiz-icon-wrapper', `icon-${level}`]">
            <img :src="quiz.icon" :alt="quiz.name" class="quiz-icon-img" />
          </div>
          <div class="card-body">
            <h3>{{ quiz.name }}</h3>
            <p class="quiz-description">{{ quiz.description }}</p>
          </div>
        </div>

        <div class="quiz-stat">
          <span class="questions-count">{{ quiz.questions }} questions</span>
        </div>

        <div class="quiz-stat">
          <span class="duration-badge">{{ quiz.duration }} min</span>
        </div>

        <div class="quiz-stat">
          <div class="difficulty-stars" :aria-label="`${quiz.difficulty} out of 3 difficulty`">
            <span
              v-for="i in 3"
              :key="i"
              :class="['star', { 'star-filled': i <= quiz.difficulty }]"
            >
              ★
            </span>
          </div>
        </div>

        <div class="quiz-action">
          <button :class="['start-button', `button-${level}`]">
            <span>Start Quiz</span>
            <svg class="chevron-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuizCard',
  props: {
    quiz: {
      type: Object,
      required: true
    },
    level: {
      type: String,
      required: true
    }
  },
  setup() {
    return {}
  }
}
</script>

<style scoped>
.quiz-card {
  position: relative;
  cursor: pointer;
}

.quiz-card-inner {
  border: 1px solid rgba(74, 158, 245, 0.22);
  border-left: 3px solid;
  border-radius: 8px;
}

.gradient-beginner { border-left-color: #10b981; }

.gradient-intermediate { border-left-color: #f59e0b; }

.gradient-advanced { border-left-color: #ef4444; }

.quiz-card-content {
  min-height: 104px;
  display: grid;
  grid-template-columns: minmax(320px, 1.6fr) repeat(3, minmax(110px, 1fr)) minmax(170px, 1fr);
  align-items: center;
  gap: 20px;
  padding: 16px 24px;
  background: #0D1B35;
}

.quiz-identity {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 16px;
}

.quiz-icon-wrapper {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  flex: 0 0 64px;
}

.icon-beginner {
  background: linear-gradient(to bottom right, #10b981, #14b8a6);
}

.icon-intermediate {
  background: linear-gradient(to bottom right, #f59e0b, #f97316);
}

.icon-advanced {
  background: linear-gradient(to bottom right, #ef4444, #ec4899);
}

.quiz-icon-img {
  width: 32px;
  height: 32px;
  filter: brightness(0) invert(1);
  z-index: 1;
}

.card-body {
  min-width: 0;
}

.card-body h3 {
  font-size: 18px;
  font-weight: 700;
  color: #F0F6FF;
  margin: 0;
  white-space: normal;
  overflow-wrap: anywhere;
}

.duration-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  color: rgba(200, 220, 255, 0.65);
  font-size: 14px;
}

.duration-icon {
  width: 16px;
  height: 16px;
}

.quiz-description {
  color: rgba(200, 220, 255, 0.65);
  font-size: 14px;
  margin-bottom: 0;
  line-height: 1.5;
}

.quiz-stat,
.quiz-action {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  min-width: 0;
}

.quiz-action {
  justify-content: flex-end;
}

.questions-count {
  color: rgba(200, 220, 255, 0.65);
  font-size: 14px;
}

.difficulty-stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 16px;
  color: rgba(74, 158, 245, 0.25);
}


.star-filled {
  color: #fbbf24;
}

.start-button {
  width: min(100%, 160px);
  padding: 12px 18px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  font-size: 16px;
}

.button-beginner {
  background: linear-gradient(to right, #10b981, #14b8a6);
}

.button-intermediate {
  background: linear-gradient(to right, #f59e0b, #f97316);
}

.button-advanced {
  background: linear-gradient(to right, #ef4444, #ec4899);
}

.chevron-icon {
  width: 20px;
  height: 20px;
}

@media (max-width: 768px) {
  .quiz-card-content {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 14px;
  }

  .quiz-identity {
    grid-column: 1 / -1;
  }

  .quiz-icon-wrapper {
    width: 56px;
    height: 56px;
    flex-basis: 56px;
  }

  .quiz-stat {
    justify-content: flex-start;
    justify-content: flex-start;
    gap: 12px;
    flex-wrap: wrap;
  }

  .quiz-action {
    grid-column: 1 / -1;
    justify-content: stretch;
  }

  .start-button {
    width: 100%;
  }
}
</style>

