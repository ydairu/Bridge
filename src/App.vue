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
            <!-- REPLACE lines 13–14 -->
            <img :src="bridgeLogo" alt="Bridge Logo" class="footer-logo footer-logo-light" />
            <img :src="logoBlack" alt="Bridge Logo" class="footer-logo footer-logo-dark" />
            <h3>Bridge</h3>
          </div>
          <p>{{ $t('footer.mission') }}</p>
        </div>
        <div class="footer-section" v-if="!isAuthenticated || isJobSeeker">
          <h4>{{ $t('footer.workers') }}</h4>
          <ul>
            <li v-if="!isAuthenticated || isJobSeeker">
              <router-link to="/browse-jobs">{{ $t('nav.browseJobs') }}</router-link>
            </li>
            <li v-if="!isAuthenticated || isJobSeeker">
              <router-link to="/quizzes">{{ $t('nav.quiz') }}</router-link>
            </li>
            <li v-if="!isAuthenticated || isJobSeeker">
              <router-link to="/applications">{{ $t('nav.applications') }}</router-link>
            </li>
          </ul>
        </div>
        <div class="footer-section" v-if="!isAuthenticated || isEmployer">
          <h4>{{ $t('footer.employers') }}</h4>
          <ul>
            <li v-if="!isAuthenticated || isEmployer">
              <router-link to="/employer/post-job">{{ $t('nav.postJob') }}</router-link>
            </li>
            <li v-if="!isAuthenticated || isEmployer">
              <router-link to="/candidates">{{ $t('nav.candidates') }}</router-link>
            </li>
            <li v-if="!isAuthenticated || isEmployer">
              <router-link to="/employer/dashboard">{{ $t('nav.home') }}</router-link>
            </li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025 Bridge. {{ $t('footer.rights') }}</p>
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
import bridgeLogo from './assets/bridgeLogo.png'
import logoBlack from './assets/logo-black.png'

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
      bridgeLogo,
      logoBlack, 
      isAuthenticated,
      isEmployer,
      isJobSeeker,
      isDarkMode
    }
  }
}
</script>

<style>
/* App-specific styles that need to override global styles */
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}

/* Footer Styles */
.app-footer {
  background: #ffffff;
  color: #333333;
  margin-top: 60px;
}

.dark-mode .app-footer {
  background: var(--bg);
  color: var(--text);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr;
  gap: 60px;
}

.footer-brand {
  max-width: 280px;
}

.footer-brand-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.footer-logo {
  height: 40px;
  width: auto;
  flex-shrink: 0;
  display: block;
}

/* Show/hide based on global .dark-mode class set by NavBar */
.footer-logo-dark { display: none; }
.dark-mode .footer-logo-dark { display: block; }
.dark-mode .footer-logo-light { display: none; }

.footer-brand h3 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  color: #1a1a1a;
}

.dark-mode .footer-brand h3 {
  color: var(--text);
}

.footer-brand p {
  color: #666666;
  line-height: 1.6;
  font-size: 0.95rem;
  margin: 0;
}

.dark-mode .footer-brand p {
  color: var(--text-muted);
}

.footer-section h4 {
  font-size: 1.05rem;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: #1a1a1a;
}

.dark-mode .footer-section h4 {
  color: var(--text);
}

.footer-section p {
  color: #666666;
  line-height: 1.6;
  font-size: 0.95rem;
}

.dark-mode .footer-section p {
  color: var(--text-muted);
}

.footer-section ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.footer-section li {
  margin-bottom: 12px;
}

.footer-section li:last-child {
  margin-bottom: 0;
}

.footer-section a {
  color: #666666;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.dark-mode .footer-section a {
  color: var(--text-muted);
}

.footer-section a:hover {
  color: #1a1a1a;
}

.dark-mode .footer-section a:hover {
  color: var(--primary);
}

.footer-bottom {
  border-top: 1px solid #e0e0e0;
  padding: 24px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  color: #666666;
  font-size: 0.875rem;
}

.dark-mode .footer-bottom {
  border-top: 1px solid var(--border);
  color: var(--text-muted);
}

.footer-bottom p {
  margin: 0;
}

/* Responsive */
@media (max-width: 992px) {
  .footer-content {
    grid-template-columns: 1fr 1fr;
    gap: 40px;
  }

  .footer-brand {
    max-width: 100%;
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 40px;
    padding: 50px 20px;
  }

  .footer-brand {
    grid-column: 1;
  }

  .footer-bottom {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
}
</style>
