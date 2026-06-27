<template>
  <div
    class="quiz-card"
    @mouseenter="$emit('mouseenter')"
    @mouseleave="$emit('mouseleave')"
    :style="{
      animation: `float ${3 + index * 0.3}s ease-in-out infinite`,
      animationDelay: `${index * 0.2}s`
    }"
  >
    <div
      :class="[
        'quiz-card-inner',
        `gradient-${level}`,
        { 'card-hovered': isHovered }
      ]"
    >
      <div class="quiz-card-content">
        <div class="card-pattern"></div>
        <div :class="['quiz-icon-wrapper', `icon-${level}`, { 'icon-pulse': isHovered }]">
          <img :src="quiz.icon" :alt="quiz.name" class="quiz-icon-img" />
          <div v-if="isHovered" :class="['icon-glow', `glow-${level}`]"></div>
        </div>

        <div class="card-body">
          <div class="card-header">
            <h3>{{ quiz.name }}</h3>
            <div class="duration-badge">
              <svg class="duration-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ quiz.duration }} min</span>
            </div>
          </div>

          <p class="quiz-description">{{ quiz.description }}</p>

          <div class="quiz-info">
            <span class="questions-count">{{ quiz.questions }} questions</span>
            <div class="difficulty-stars">
              <span
                v-for="i in 3"
                :key="i"
                :class="['star', { 'star-filled': i <= quiz.difficulty }]"
              >
                ★
              </span>
            </div>
          </div>

          <button :class="['start-button', `button-${level}`, { 'button-hover': isHovered }]">
            <span>Start Quiz</span>
            <svg class="chevron-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div :class="['corner-accent', `accent-${level}`]"></div>
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
    index: {
      type: Number,
      default: 0
    },
    level: {
      type: String,
      required: true
    },
    isHovered: {
      type: Boolean,
      default: false
    }
  },
  emits: ['mouseenter', 'mouseleave'],
  setup(props) {
    return {}
  }
}
</script>

<style scoped>
.quiz-card {
  position: relative;
  cursor: pointer;
  will-change: transform;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.quiz-card-inner {
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  padding: 2px;
  transition: all 0.5s;
}

.gradient-beginner {
  background: linear-gradient(to bottom right, #10b981, #14b8a6);
}

.gradient-intermediate {
  background: linear-gradient(to bottom right, #f59e0b, #f97316);
}

.gradient-advanced {
  background: linear-gradient(to bottom right, #ef4444, #ec4899);
}

.card-hovered {
  transform: scale(1.05);
}

.gradient-beginner.card-hovered {
  box-shadow: 0 25px 50px -12px rgba(16, 185, 129, 0.5);
}

.gradient-intermediate.card-hovered {
  box-shadow: 0 25px 50px -12px rgba(245, 158, 11, 0.5);
}

.gradient-advanced.card-hovered {
  box-shadow: 0 25px 50px -12px rgba(239, 68, 68, 0.5);
}

.quiz-card-content {
  position: relative;
  height: 100%;
  background: #ffffff;
  border-radius: 22px;
  padding: 24px;
  backdrop-filter: blur(20px);
}

.dark-mode .quiz-card-content {
  background: #000000;
}

.card-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image: radial-gradient(circle at 2px 2px, var(--text) 1px, transparent 0);
  background-size: 40px 40px;
  animation: scroll 20s linear infinite;
}

.dark-mode .card-pattern {
  opacity: 0.05;
}

@keyframes scroll {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(40px, 40px);
  }
}

.quiz-icon-wrapper {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  transition: all 0.3s;
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

.icon-pulse {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.icon-glow {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  opacity: 0.75;
  filter: blur(16px);
}

.glow-beginner {
  background: linear-gradient(to bottom right, #10b981, #14b8a6);
}

.glow-intermediate {
  background: linear-gradient(to bottom right, #f59e0b, #f97316);
}

.glow-advanced {
  background: linear-gradient(to bottom right, #ef4444, #ec4899);
}

.quiz-icon-img {
  width: 32px;
  height: 32px;
  filter: brightness(0) invert(1);
  z-index: 1;
}

.card-body {
  position: relative;
  z-index: 10;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
}

.card-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: black;
  margin: 0;
}

.dark-mode .card-header h3 {
  color: white;
}

.duration-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-muted);
  font-size: 14px;
}

.dark-mode .duration-badge {
  color: rgba(255, 255, 255, 0.7);
}

.duration-icon {
  width: 16px;
  height: 16px;
}

.quiz-description {
  color: var(--text-muted);
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.5;
}

.dark-mode .quiz-description {
  color: rgba(255, 255, 255, 0.7);
}

.quiz-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.questions-count {
  color: var(--text-muted);
  font-size: 14px;
}

.dark-mode .questions-count {
  color: rgba(255, 255, 255, 0.7);
}

.difficulty-stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 16px;
  color: var(--border);
}


.star-filled {
  color: #fbbf24;
}

.start-button {
  width: 100%;
  padding: 12px 24px;
  border-radius: 12px;
  border: none;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
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

.button-hover {
  gap: 16px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

.chevron-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s;
}

.button-hover .chevron-icon {
  transform: translateX(4px);
}

.corner-accent {
  position: absolute;
  top: 0;
  right: 0;
  width: 128px;
  height: 128px;
  border-radius: 50%;
  opacity: 0.2;
  filter: blur(48px);
}

.accent-beginner {
  background: linear-gradient(to bottom right, #10b981, #14b8a6);
}

.accent-intermediate {
  background: linear-gradient(to bottom right, #f59e0b, #f97316);
}

.accent-advanced {
  background: linear-gradient(to bottom right, #ef4444, #ec4899);
}
</style>

