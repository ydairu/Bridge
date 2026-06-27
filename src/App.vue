<template>
  <div id="app">
    <NavBar />
    <main class="main-content">
      <router-view />
    </main>
    <BadgeNotification />
    <Toast />
    <footer class="app-footer">
      <div class="footer-content">
        <div class="footer-section footer-brand">
          <div class="footer-brand-header">
            <span class="footer-logo-text">Bridge<span class="footer-dot">.</span></span>
          </div>
          <p>Connecting employers with skilled migrant workers in Singapore</p>
        </div>
        <div class="footer-section" v-if="!isAuthenticated || isJobSeeker">
          <h4>For Job Seekers</h4>
          <ul>
            <li><router-link to="/browse-jobs">Browse Jobs</router-link></li>
            <li><router-link to="/quizzes">Take Quizzes</router-link></li>
            <li><router-link to="/applications">My Applications</router-link></li>
          </ul>
        </div>
        <div class="footer-section" v-if="!isAuthenticated || isEmployer">
          <h4>For Employers</h4>
          <ul>
            <li><router-link to="/employer/post-job">Post a Job</router-link></li>
            <li><router-link to="/candidates">Find Candidates</router-link></li>
            <li><router-link to="/employer/dashboard">Dashboard</router-link></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025 Bridge. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import NavBar from './components/NavBar.vue'
import BadgeNotification from './components/BadgeNotification.vue'
import Toast from './components/Toast.vue'

export default {
  name: 'App',
  components: {
    NavBar,
    BadgeNotification,
    Toast
  },
  setup() {
    const store = useStore()

    onMounted(() => {
      // Initialize auth state listener
      store.dispatch('auth/initAuthListener')
    })

    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
    const isEmployer = computed(() => store.getters['auth/isEmployer'])
    const isJobSeeker = computed(() => store.getters['auth/isJobSeeker'])
    const isDarkMode = computed(() => store.getters['theme/isDarkMode'])

    // Watch for authentication changes to initialize chat
    watch(isAuthenticated, async (authenticated) => {
      if (authenticated) {
        const user = store.getters['auth/user']
        if (user) {
          try {
            // Initialize chat connection and load rooms when user logs in
            // This ensures unread badge works on all pages
            await store.dispatch('chatAbly/initializeConnection', { clientId: user.uid })
            await store.dispatch('chatAbly/loadChatRooms', { userId: user.uid })
            await store.dispatch('chatAbly/listenToChatRoomUpdates', { userId: user.uid })
          } catch (error) {
            console.error('Error initializing chat in App.vue:', error)
          }
        }
      } else {
        // Close chat connection when user logs out
        try {
          store.dispatch('chatAbly/closeConnection')
        } catch (error) {
          console.error('Error closing chat connection in App.vue:', error)
        }
      }
    }, { immediate: true })

    return {
      isAuthenticated,
      isEmployer,
      isJobSeeker,
      isDarkMode
    }
  }
}
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0A1628;
}

.main-content { flex: 1; }

/* ─── Footer ─────────────────────────────────────────────────── */
.app-footer {
  background: rgba(8, 16, 32, 0.95);
  border-top: 1px solid rgba(74, 158, 245, 0.12);
  margin-top: 60px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 56px 24px 40px;
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr;
  gap: 56px;
}

.footer-brand { max-width: 280px; }

.footer-brand-header { margin-bottom: 16px; }

.footer-logo-text {
  font-size: 1.6rem;
  font-weight: 600;
  color: #F0F6FF;
  letter-spacing: -0.02em;
}

.footer-dot { color: #4A9EF5; }

.footer-brand p {
  color: rgba(180, 210, 255, 0.55);
  line-height: 1.6;
  font-size: 0.9rem;
  margin: 0;
}

.footer-section h4 {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(180, 210, 255, 0.5);
  margin: 0 0 18px;
}

.footer-section ul  { list-style: none; margin: 0; padding: 0; }
.footer-section li  { margin-bottom: 10px; }
.footer-section li:last-child { margin-bottom: 0; }

.footer-section a {
  color: rgba(200, 220, 255, 0.6);
  font-size: 0.9rem;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-section a:hover { color: #F0F6FF; }

.footer-bottom {
  border-top: 1px solid rgba(74, 158, 245, 0.1);
  padding: 20px 24px;
  max-width: 1200px;
  margin: 0 auto;
  color: rgba(180, 210, 255, 0.4);
  font-size: 0.82rem;
}

.footer-bottom p { margin: 0; }

@media (max-width: 992px) {
  .footer-content { grid-template-columns: 1fr 1fr; gap: 40px; }
  .footer-brand   { max-width: 100%; grid-column: 1 / -1; }
}

@media (max-width: 768px) {
  .footer-content { grid-template-columns: 1fr; gap: 36px; padding: 44px 20px 32px; }
  .footer-brand   { grid-column: 1; }
}
</style>
