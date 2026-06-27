<template>
  <div class="achievements-page">
    <!-- Header Section -->
    <div class="achievements-header">
      <div class="header-content">
        <div class="header-icon">
          <Trophy :size="40" :stroke-width="1.5" class="trophy-icon" />
        </div>
        <div class="header-text">
          <h1>Achievements</h1>
          <p class="header-subtitle">
            Track your progress and unlock new badges
          </p>
        </div>
      </div>
      <div class="progress-section">
        <div class="progress-header">
          <span class="progress-label">Overall Progress</span>
          <span class="progress-count">{{ earnedBadgeCount }} / {{ totalBadgeCount }} unlocked</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${badgeProgress}%` }"></div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="achievements-container">
      <!-- Stats Overview -->
      <StatsOverview
        :plays="userStats?.totalPlays || 0"
        :wins="userStats?.totalWins || 0"
        :winRate="userStats?.winPercentage || 0"
        :streak="userStats?.currentDayStreak || 0"
      />

      <!-- Tabs Section -->
      <div class="tabs-section">
        <div class="tabs-list" role="tablist">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            :class="['tab-trigger', { active: activeTab === tab.value }]"
            @click="activeTab = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content-wrapper">
          <!-- Performance Tab -->
          <div v-show="activeTab === 'performance'" class="tab-content">
            <div class="tab-header">
              <h2>Performance Achievements</h2>
              <p class="tab-description">Unlock achievements by winning games</p>
            </div>
            <div class="achievements-grid">
              <AchievementCard
                v-for="(badge, index) in allBadges.performance"
                :key="badge.id"
                :icon="badge.icon"
                :icon-type="badge.iconType || 'emoji'"
                :title="badge.name"
                :description="badge.description"
                :progress="getCurrentValue(badge)"
                :requirement="badge.requirement"
                :unlocked="badge.earned"
                :tier="badge.tier"
                :index="index"
              />
            </div>
          </div>

          <!-- Participation Tab -->
          <div v-show="activeTab === 'participation'" class="tab-content">
            <div class="tab-header">
              <h2>Participation Achievements</h2>
              <p class="tab-description">Unlock achievements by playing games</p>
            </div>
            <div class="achievements-grid">
              <AchievementCard
                v-for="(badge, index) in allBadges.participation"
                :key="badge.id"
                :icon="badge.icon"
                :icon-type="badge.iconType || 'emoji'"
                :title="badge.name"
                :description="badge.description"
                :progress="getCurrentValue(badge)"
                :requirement="badge.requirement"
                :unlocked="badge.earned"
                :tier="badge.tier"
                :index="index"
              />
            </div>
          </div>

          <!-- Daily Streaks Tab -->
          <div v-show="activeTab === 'daily'" class="tab-content">
            <div class="tab-header">
              <h2>Daily Streak Achievements</h2>
              <p class="tab-description">Unlock achievements by playing daily</p>
            </div>
            <div class="achievements-grid">
              <AchievementCard
                v-for="(badge, index) in allBadges.streak"
                :key="badge.id"
                :icon="badge.icon"
                :icon-type="badge.iconType || 'emoji'"
                :title="badge.name"
                :description="badge.description"
                :progress="getCurrentValue(badge)"
                :requirement="badge.requirement"
                :unlocked="badge.earned"
                :tier="badge.tier"
                :index="index"
              />
            </div>
          </div>

          <!-- Win Streaks Tab -->
          <div v-show="activeTab === 'win'" class="tab-content">
            <div class="tab-header">
              <h2>Win Streak Achievements</h2>
              <p class="tab-description">Unlock achievements by winning consecutively</p>
            </div>
            <div class="achievements-grid">
              <AchievementCard
                v-for="(badge, index) in allBadges.winStreak"
                :key="badge.id"
                :icon="badge.icon"
                :icon-type="badge.iconType || 'emoji'"
                :title="badge.name"
                :description="badge.description"
                :progress="getCurrentValue(badge)"
                :requirement="badge.requirement"
                :unlocked="badge.earned"
                :tier="badge.tier"
                :index="index"
              />
            </div>
          </div>

          <!-- Perfect Scores Tab -->
          <div v-show="activeTab === 'perfect'" class="tab-content">
            <div class="tab-header">
              <h2>Perfect Score Achievements</h2>
              <p class="tab-description">Unlock achievements by getting perfect scores</p>
            </div>
            <div class="achievements-grid">
              <AchievementCard
                v-for="(badge, index) in allBadges.perfect"
                :key="badge.id"
                :icon="badge.icon"
                :icon-type="badge.iconType || 'emoji'"
                :title="badge.name"
                :description="badge.description"
                :progress="getCurrentValue(badge)"
                :requirement="badge.requirement"
                :unlocked="badge.earned"
                :tier="badge.tier"
                :index="index"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { Trophy } from 'lucide-vue-next'
import StatsOverview from '../components/StatsOverview.vue'
import AchievementCard from '../components/AchievementCard.vue'

export default {
  name: 'Achievements',
  components: {
    StatsOverview,
    AchievementCard,
    Trophy
  },
  setup() {
    const store = useStore()
    const activeTab = ref('performance')
    
    const tabs = [
      { label: 'Performance', value: 'performance' },
      { label: 'Participation', value: 'participation' },
      { label: 'Daily Streaks', value: 'daily' },
      { label: 'Win Streaks', value: 'win' },
      { label: 'Perfect Scores', value: 'perfect' }
    ]
    
    const allBadges = computed(() => store.getters['badges/allBadges'] || {
      performance: [],
      participation: [],
      streak: [],
      winStreak: [],
      perfect: []
    })
    
    const userStats = computed(() => store.getters['badges/userStats'])
    const earnedBadgeCount = computed(() => store.getters['badges/earnedBadgeCount'])
    const totalBadgeCount = computed(() => store.getters['badges/totalBadgeCount'])
    const badgeProgress = computed(() => store.getters['badges/badgeProgress'])
    
    const getCurrentValue = (badge) => {
      if (!userStats.value) return 0
      
      switch (badge.type) {
        case 'wins':
          return userStats.value.totalWins || 0
        case 'plays':
          return userStats.value.totalPlays || 0
        case 'day_streak':
          return userStats.value.maxDayStreak || 0
        case 'win_streak':
          return userStats.value.maxWinStreak || 0
        case 'perfect_scores':
          return userStats.value.perfectScores || 0
        default:
          return 0
      }
    }
    
    const getProgress = (badge) => {
      const current = getCurrentValue(badge)
      return Math.min((current / badge.requirement) * 100, 100)
    }
    
    onMounted(async () => {
      const user = store.getters['auth/currentUser']
      if (user) {
        try {
          await Promise.all([
            store.dispatch('badges/initializeUserStats', user.uid),
            store.dispatch('badges/getAllBadgesWithStatus', user.uid)
          ])
        } catch (error) {
          console.error('Error loading achievements:', error)
        }
      }
    })
    
    return {
      activeTab,
      tabs,
      allBadges,
      userStats,
      earnedBadgeCount,
      totalBadgeCount,
      badgeProgress,
      getCurrentValue,
      getProgress
    }
  }
}
</script>

<style scoped>
.achievements-page {
  min-height: calc(100vh - 70px);
  background: var(--bg);
}

/* Header Section */
.achievements-header {
  background: var(--bg-light);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding: 2rem 1rem;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.header-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 0.25rem;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
  transition: all 0.3s ease;
}

.header-icon:hover {
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
  transform: translateY(-2px);
}

.dark-mode .header-icon {
  background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%);
  box-shadow: 0 4px 12px rgba(167, 139, 250, 0.3);
}

.dark-mode .header-icon:hover {
  box-shadow: 0 6px 20px rgba(167, 139, 250, 0.45);
}

.trophy-icon {
  color: white;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  transition: transform 0.3s ease;
}

.header-icon:hover .trophy-icon {
  transform: scale(1.1) rotate(5deg);
}

.dark-mode .trophy-icon {
  color: white;
  filter: drop-shadow(0 2px 6px rgba(255, 255, 255, 0.2));
}

.header-text {
  flex: 1;
  margin-top: 0.25rem;
}

.header-text h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 0.25rem;
  margin-top: 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.header-subtitle {
  color: var(--text-muted);
  font-size: 0.875rem;
}

/* Progress Section */
.progress-section {
  max-width: 1200px;
  margin: 0 auto;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.progress-label {
  color: var(--text-muted);
}

.progress-count {
  color: var(--text);
  font-weight: 600;
}

.progress-bar {
  height: 12px;
  background: var(--border);
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary);
  border-radius: 6px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Main Container */
.achievements-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* Tabs Section */
.tabs-section {
  margin-top: 3rem;
}

.tabs-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.5rem;
  margin-bottom: 2rem;
  background: var(--bg-light);
  padding: 0.5rem;
  border-radius: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.tab-trigger {
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-trigger:hover {
  color: var(--text);
  background: var(--bg);
}

.tab-trigger.active {
  background: var(--primary);
  color: white;
}

.tab-content-wrapper {
  min-height: 400px;
}

.tab-content {
  animation: fadeIn 0.3s ease-in-out;
}

.tab-header {
  margin-bottom: 1.5rem;
}

.tab-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 0.5rem;
}

.tab-description {
  color: var(--text-muted);
  font-size: 0.875rem;
}

/* Achievements Grid */
.achievements-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
}

@media (min-width: 768px) {
  .achievements-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .achievements-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  /* Win Streaks use 3 columns on larger screens */
  .tab-content:nth-child(4) .achievements-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .achievements-page {
    padding: 0;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-icon {
    width: 3rem;
    height: 3rem;
  }

  .header-text h1 {
    font-size: 1.5rem;
  }

  .tabs-list {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }

  .tab-trigger {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
  }

  .achievements-container {
    padding: 1rem;
  }
}

@media (max-width: 640px) {
  .header-icon {
    width: 2.5rem;
    height: 2.5rem;
  }

  .header-text h1 {
    font-size: 1.25rem;
  }
}
</style>
