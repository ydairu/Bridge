<template>
  <nav class="navbar">
    <div class="nav-container">
      <router-link :to="getHomeRoute" class="nav-brand">
        <img v-if="isDarkMode" src="../assets/logo-black.png" alt="Bridge" class="nav-logo" />
        <img v-else src="../assets/bridgeLogo.png" alt="Bridge" class="nav-logo" />
      </router-link>

      <button class="nav-toggle" @click="toggleMenu" :class="{ active: menuOpen }">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div class="nav-menu" :class="{ active: menuOpen }">
        <button class="menu-close" @click="closeMenu">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div class="nav-links-section">
          <template v-if="isAuthenticated">
            <router-link :to="getHomeRoute" class="nav-link" @click="closeMenu">
              Home
            </router-link>

            <template v-if="isJobSeeker">
              <router-link to="/browse-jobs" class="nav-link" @click="closeMenu">
                Browse Jobs
              </router-link>
              <router-link to="/reviews" class="nav-link" @click="closeMenu">
                Company Reviews
              </router-link>
              <router-link to="/quizzes" class="nav-link" @click="closeMenu">
                AI Quiz
              </router-link>
            </template>

            <template v-if="isEmployer">
              <router-link to="/employer/post-job" class="nav-link" @click="closeMenu">
                Post Job
              </router-link>
              <router-link to="/candidates" class="nav-link" @click="closeMenu">
                Browse Candidates
              </router-link>
            </template>
          </template>

          <template v-else>
            <router-link to="/" class="nav-link" @click="closeMenu">
              Home
            </router-link>
            <router-link to="/browse-jobs" class="nav-link" @click="closeMenu">
              Browse Jobs
            </router-link>
          </template>
        </div>

        <div class="nav-spacer"></div>

        <div class="nav-controls-section">
          <template v-if="isAuthenticated">
            <router-link to="/chat" class="nav-link chat-icon mobile-control-item" @click="closeMenu">
              <div class="chat-icon-wrapper">
                <img v-if="isDarkMode" src="../assets/darkModeMessages.png" alt="Messages" class="envelope-icon" />
                <img v-else src="../assets/messages-light.svg" alt="Messages" class="envelope-icon" />
                <span v-if="totalUnreadCount > 0" class="unread-badge-nav">{{ totalUnreadCount > 99 ? '99+' : totalUnreadCount }}</span>
              </div>
              <span class="control-label">Messages</span>
            </router-link>

            <div class="mobile-user-section">
              <div class="mobile-user-header">
                <div class="user-avatar-mobile">
                  <img 
                    v-if="userProfile?.photoURL" 
                    :src="userProfile.photoURL" 
                    :alt="userProfile.name"
                    class="avatar-image"
                  />
                  <span v-else>{{ userInitials }}</span>
                </div>
                <div class="user-info">
                  <span class="user-name">{{ userProfile?.name || 'User' }}</span>
                  <span class="user-type">{{ isJobSeeker ? 'Job Seeker' : 'Employer' }}</span>
                </div>
              </div>
              
              <div class="mobile-user-links">
                <router-link to="/profile" class="dropdown-item" @click="closeMenu">
                  <User :size="18" :stroke-width="2" class="dropdown-icon-lucide" />
                  Profile
                </router-link>
                <router-link v-if="isJobSeeker" to="/achievements" class="dropdown-item" @click="closeMenu">
                  <Trophy :size="18" :stroke-width="2" class="dropdown-icon-lucide" />
                  Achievements
                </router-link>
                <router-link v-if="isJobSeeker" to="/applications" class="dropdown-item" @click="closeMenu">
                  <Briefcase :size="18" :stroke-width="2" class="dropdown-icon-lucide" />
                  Applications
                </router-link>
                <router-link v-if="isEmployer" to="/employer/applications" class="dropdown-item" @click="closeMenu">
                  <CheckSquare :size="18" :stroke-width="2" class="dropdown-icon-lucide" />
                  Applications
                </router-link>
                
                <div class="dropdown-divider"></div>
                
                <button @click="toggleDarkMode" class="dropdown-item">
                  <Moon v-if="!isDarkMode" :size="18" :stroke-width="2" class="dropdown-icon-lucide" />
                  <Sun v-else :size="18" :stroke-width="2" class="dropdown-icon-lucide" />
                  {{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}
                </button>
                <button @click="handleLogout" class="dropdown-item">
                  <LogOut :size="18" :stroke-width="2" class="dropdown-icon-lucide" />
                  Logout
                </button>
              </div>
            </div>

            <div class="user-menu">
              <button @click="toggleUserDropdown" class="user-avatar">
                <img 
                  v-if="userProfile?.photoURL" 
                  :src="userProfile.photoURL" 
                  :alt="userProfile.name"
                  class="avatar-image"
                />
                <span v-else>{{ userInitials }}</span>
              </button>
              <div 
                class="user-dropdown" 
                :class="{ active: userDropdownOpen }"
                @mouseenter="resetDropdownTimer"
                @mouseleave="startDropdownTimer"
                @click="resetDropdownTimer"
              >

                <div class="dropdown-user-header">
                  <div class="user-avatar-dropdown">
                    <img 
                      v-if="userProfile?.photoURL" 
                      :src="userProfile.photoURL" 
                      :alt="userProfile.name"
                      class="avatar-image"
                    />
                    <span v-else>{{ userInitials }}</span>
                  </div>
                  <div class="user-info-dropdown">
                    <span class="user-name-dropdown">{{ userProfile?.name || 'User' }}</span>
                    <span class="user-type-dropdown">{{ isJobSeeker ? 'Job Seeker' : 'Employer' }}</span>
                  </div>
                </div>
                
                <div class="dropdown-divider"></div>
                
                <router-link to="/profile" class="dropdown-item" @click="closeMenus">
                  <User :size="18" :stroke-width="2" class="dropdown-icon-lucide" />
                  Profile
                </router-link>
                <router-link v-if="isJobSeeker" to="/achievements" class="dropdown-item" @click="closeMenus">
                  <Trophy :size="18" :stroke-width="2" class="dropdown-icon-lucide" />
                  Achievements
                </router-link>
                <router-link v-if="isJobSeeker" to="/applications" class="dropdown-item" @click="closeMenus">
                  <Briefcase :size="18" :stroke-width="2" class="dropdown-icon-lucide" />
                  Applications
                </router-link>
                <router-link v-if="isEmployer" to="/employer/applications" class="dropdown-item" @click="closeMenus">
                  <CheckSquare :size="18" :stroke-width="2" class="dropdown-icon-lucide" />
                  Applications
                </router-link>
                
                <div class="dropdown-divider"></div>
                
                <button @click="toggleDarkMode" class="dropdown-item">
                  <Moon v-if="!isDarkMode" :size="18" :stroke-width="2" class="dropdown-icon-lucide" />
                  <Sun v-else :size="18" :stroke-width="2" class="dropdown-icon-lucide" />
                  {{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}
                </button>
                <button @click="handleLogout" class="dropdown-item">
                  <LogOut :size="18" :stroke-width="2" class="dropdown-icon-lucide" />
                  Logout
                </button>
              </div>
            </div>
          </template>

          <template v-else>
            <button @click="toggleDarkMode" class="dark-mode-toggle mobile-control-item" title="Toggle Dark Mode">
              <img v-if="isDarkMode" src="../assets/sun-white.svg" alt="Light Mode" class="toggle-icon" />
              <img v-else src="../assets/moon-black.svg" alt="Dark Mode" class="toggle-icon" />
              <span class="control-label">{{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}</span>
            </button>
            
            <router-link to="/login" class="nav-link" @click="closeMenu">
              Login
            </router-link>
            <router-link to="/register" class="nav-link nav-link-signup" @click="closeMenu">
              Sign Up
            </router-link>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { User, Trophy, Briefcase, LogOut, CheckSquare, Moon, Sun } from 'lucide-vue-next'

export default {
  name: 'NavBar',
  components: {
    User,
    Trophy,
    Briefcase,
    LogOut,
    CheckSquare,
    Moon,
    Sun
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    
    const menuOpen = ref(false)
    const userDropdownOpen = ref(false)
    const navDropdownOpen = ref(false)
    const isDarkMode = ref(false)
    let dropdownTimeout = null

    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
    const isJobSeeker = computed(() => store.getters['auth/isJobSeeker'])
    const isEmployer = computed(() => store.getters['auth/isEmployer'])
    const userProfile = computed(() => store.getters['auth/userProfile'])

    const userInitials = computed(() => {
      if (!userProfile.value?.name) return '?'
      return userProfile.value.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    })

    const totalUnreadCount = computed(() => {
      if (!isAuthenticated.value) return 0
      
      const chatRooms = store.getters['chatAbly/chatRooms'] || []
      
      const unreadCounts = store.state.chatAbly.unreadCounts
      if (!unreadCounts || !(unreadCounts instanceof Map)) {
        return 0
      }

      let total = 0
      for (const room of chatRooms) {
        const count = unreadCounts.get(room.id) || 0
        total += count
      }

      // Include temporary unread counts for rooms not yet in chatRooms
      for (const [key, value] of unreadCounts.entries()) {
        if (typeof key === 'string' && key.startsWith('chat_') && !chatRooms.some(r => r.id === key || r.roomName === key)) {
          total += value || 0
        }
      }

      // Force reactivity by accessing the Map size
      // This ensures Vue tracks changes when the Map reference changes
      const mapSize = unreadCounts.size
      
      return total
    })

    const getHomeRoute = computed(() => {
      if (isAuthenticated.value) {
        if (isEmployer.value) {
          return '/employer/dashboard'
        } else if (isJobSeeker.value) {
          return '/'
        }
      }
      return '/'
    })

    const toggleMenu = () => {
      menuOpen.value = !menuOpen.value
    }

    const closeMenu = () => {
      menuOpen.value = false
    }

    const toggleUserDropdown = () => {
      userDropdownOpen.value = !userDropdownOpen.value
      if (userDropdownOpen.value) {
        startDropdownTimer()
      } else {
        clearDropdownTimer()
      }
    }
    
    const startDropdownTimer = () => {
      clearDropdownTimer()
      dropdownTimeout = setTimeout(() => {
        if (userDropdownOpen.value) {
          userDropdownOpen.value = false
        }
      }, 5000)
    }
    
    const clearDropdownTimer = () => {
      if (dropdownTimeout) {
        clearTimeout(dropdownTimeout)
        dropdownTimeout = null
      }
    }
    
    const resetDropdownTimer = () => {
      if (userDropdownOpen.value) {
        startDropdownTimer()
      }
    }

    const toggleNavDropdown = () => {
      navDropdownOpen.value = !navDropdownOpen.value
    }

    const closeMenus = () => {
      menuOpen.value = false
      userDropdownOpen.value = false
      navDropdownOpen.value = false
      clearDropdownTimer()
    }

    const handleLogout = async () => {
      try {
        await store.dispatch('auth/logout')
        closeMenus()
        router.push('/')
      } catch (error) {
        console.error('Logout error:', error)
      }
    }

    const toggleDarkMode = () => {
      isDarkMode.value = !isDarkMode.value
      if (isDarkMode.value) {
        document.documentElement.classList.add('dark-mode')
        localStorage.setItem('darkMode', 'true')
      } else {
        document.documentElement.classList.remove('dark-mode')
        localStorage.setItem('darkMode', 'false')
      }
    }

    watch(userDropdownOpen, (isOpen) => {
      if (isOpen) {
        startDropdownTimer()
      } else {
        clearDropdownTimer()
      }
    })
    
    onMounted(() => {
      const savedDarkMode = localStorage.getItem('darkMode')
      if (savedDarkMode === 'true') {
        isDarkMode.value = true
        document.documentElement.classList.add('dark-mode')
      }
    })
    
    onUnmounted(() => {
      clearDropdownTimer()
    })

    return {
      menuOpen,
      userDropdownOpen,
      navDropdownOpen,
      isDarkMode,
      isAuthenticated,
      isJobSeeker,
      isEmployer,
      userProfile,
      userInitials,
      getHomeRoute,
      totalUnreadCount,
      toggleMenu,
      closeMenu,
      toggleUserDropdown,
      toggleNavDropdown,
      closeMenus,
      handleLogout,
      toggleDarkMode
    }
  }
}
</script>

<style scoped>
.navbar {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.03),
              0 4px 24px -4px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dark-mode .navbar {
  background: rgba(10, 10, 15, 0.85);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.05),
              0 4px 24px -4px rgba(0, 0, 0, 0.4);
}

.nav-container {
  width: 100%;
  padding: 0 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 72px;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: var(--text);
  font-size: 1.5rem;
  font-weight: 700;
  transition: color 0.3s;
}

.nav-logo {
  height: 56px;
  width: auto;
  margin-right: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.05));
}

.nav-brand:hover .nav-logo {
  transform: scale(1.03);
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.nav-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: rgba(0, 123, 255, 0.08);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  padding: 10px;
  z-index: 102;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-toggle:hover {
  background: rgba(0, 123, 255, 0.15);
  transform: scale(1.05);
}

.dark-mode .nav-toggle {
  background: rgba(255, 255, 255, 0.08);
}

.dark-mode .nav-toggle:hover {
  background: rgba(255, 255, 255, 0.12);
}

.nav-toggle span {
  width: 24px;
  height: 2.5px;
  background: #333333;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 2px;
}

.dark-mode .nav-toggle span {
  background: #ffffff;
}

.nav-toggle.active span:nth-child(1) {
  transform: rotate(45deg) translate(7px, 7px);
}

.nav-toggle.active span:nth-child(2) {
  opacity: 0;
  transform: scale(0);
}

.nav-toggle.active span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -7px);
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 25px;
  flex: 1;
}

.nav-links-section {
  display: contents;
}

.nav-controls-section {
  display: contents;
}

.nav-link {
  text-decoration: none;
  color: var(--text);
  font-weight: 500;
  font-size: 0.95rem;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.nav-link:hover {
  color: var(--primary);
  background: rgba(0, 123, 255, 0.08);
}

.dark-mode .nav-link:hover {
  background: rgba(0, 123, 255, 0.15);
}

.nav-link.router-link-active {
  color: var(--primary);
  background: rgba(0, 123, 255, 0.1);
  font-weight: 600;
}

.dark-mode .nav-link.router-link-active {
  background: rgba(0, 123, 255, 0.2);
}

.nav-link-signup {
  background: linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%) !important;
  color: white !important;
  font-weight: 600;
  padding: 10px 24px !important;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.25);
}

.nav-link-signup:hover {
  background: linear-gradient(135deg, #0056b3 0%, #7c3aed 100%) !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 123, 255, 0.35);
}

.chat-icon {
  display: flex;
  align-items: center;
  position: relative;
}

.chat-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.envelope-icon {
  width: 24px;
  height: 24px;
  fill: currentColor;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.chat-icon:hover .envelope-icon {
  transform: scale(1.15) translateY(-2px);
}

.unread-badge-nav {
  position: absolute;
  top: -6px;
  right: -6px;
  background: linear-gradient(135deg, #ff4757 0%, #ff6348 100%);
  color: white;
  border-radius: 50%;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0 5px;
  box-shadow: 0 3px 12px rgba(255, 71, 87, 0.4),
              0 0 0 3px rgba(255, 255, 255, 0.3);
  border: 2px solid white;
  z-index: 10;
  animation: pulse-badge-nav 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.dark-mode .unread-badge-nav {
  border-color: rgba(10, 10, 15, 1);
  box-shadow: 0 3px 12px rgba(255, 71, 87, 0.5),
              0 0 0 3px rgba(10, 10, 15, 0.8);
}

@keyframes pulse-badge-nav {
  0%, 100% { 
    transform: scale(1); 
  }
  50% { 
    transform: scale(1.12); 
  }
}

.dark-mode-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px 10px;
  transition: transform 0.3s;
  display: flex;
  align-items: center;
}

.dark-mode-toggle:hover {
  transform: scale(1.1);
}

.toggle-icon {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.nav-spacer {
  flex: 1;
}

.user-menu {
  position: relative;
}

.user-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: transparent;
  color: var(--text);
  border: 2px solid rgba(0, 123, 255, 0.2);
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  position: relative;
}

.user-avatar::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  padding: 2px;
  background: linear-gradient(135deg, var(--primary), #8b5cf6);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-avatar .avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar:not(:has(.avatar-image)) {
  background: linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%);
  color: white;
  border: none;
}

.user-avatar:hover {
  transform: scale(1.08);
  box-shadow: 0 8px 24px rgba(0, 123, 255, 0.2);
  border-color: var(--primary);
}

.user-avatar:hover::before {
  opacity: 1;
}

.dark-mode .user-avatar {
  border-color: rgba(0, 123, 255, 0.3);
}

.dark-mode .user-avatar:hover {
  box-shadow: 0 8px 24px rgba(0, 123, 255, 0.3);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 12px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  box-shadow: 0 12px 48px -8px rgba(0, 0, 0, 0.12),
              0 4px 16px -4px rgba(0, 0, 0, 0.08);
  min-width: 260px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-12px) scale(0.96);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.dark-mode .user-dropdown {
  background: rgba(20, 20, 25, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 12px 48px -8px rgba(0, 0, 0, 0.5),
              0 4px 16px -4px rgba(0, 0, 0, 0.3);
}

.user-dropdown.active {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
}

.dropdown-user-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 16px;
  background: linear-gradient(135deg, rgba(0, 123, 255, 0.06) 0%, rgba(139, 92, 246, 0.06) 100%);
  border-radius: 12px;
  margin: 12px 12px 8px 12px;
  border: 1px solid rgba(0, 123, 255, 0.1);
}

.dark-mode .dropdown-user-header {
  background: linear-gradient(135deg, rgba(0, 123, 255, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  border-color: rgba(0, 123, 255, 0.15);
}

.user-avatar-dropdown {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar-dropdown .avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info-dropdown {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.user-name-dropdown {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-type-dropdown {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.dropdown-divider {
  height: 1px;
  background: var(--border);
  margin: 8px 0;
}

.dark-mode .dropdown-divider {
  background: rgba(255, 255, 255, 0.1);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  margin: 0 8px;
  width: calc(100% - 16px);
  text-decoration: none;
  color: var(--text);
  background: none;
  border: none;
  border-radius: 10px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.95rem;
  font-weight: 500;
}

.dropdown-item:hover {
  background: rgba(0, 123, 255, 0.08);
  color: var(--primary);
  transform: translateX(2px);
}

.dark-mode .dropdown-item:hover {
  background: rgba(0, 123, 255, 0.15);
}

.dropdown-icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.dropdown-icon-lucide {
  flex-shrink: 0;
  color: rgba(0, 0, 0, 0.5);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-item:hover .dropdown-icon-lucide {
  color: var(--primary);
  transform: scale(1.1);
}

.dark-mode .dropdown-icon-lucide {
  color: rgba(255, 255, 255, 0.5);
}

.dark-mode .dropdown-item:hover .dropdown-icon-lucide {
  color: var(--primary);
}

.nav-hamburger-menu {
  position: relative;
}

.hamburger-button {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  transition: transform 0.3s;
}

.hamburger-button:hover {
  transform: scale(1.1);
}

.hamburger-button span {
  width: 22px;
  height: 2.5px;
  background: var(--text);
  transition: all 0.3s;
  border-radius: 2px;
}

.nav-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 10px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  min-width: 200px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s;
  overflow: hidden;
}

.dark-mode .nav-dropdown {
  background: #1a1a1a;
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.nav-dropdown.active {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

@media (max-width: 768px) {
  .nav-container {
    padding: 0 20px;
  }

  .nav-toggle {
    display: flex;
    z-index: 102;
  }

  .nav-toggle.active {
    opacity: 0;
    pointer-events: none;
  }

  .nav-menu {
    position: fixed;
    top: 0;
    right: 0;
    width: 280px;
    height: 100vh;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-left: 1px solid var(--border);
    flex-direction: column;
    align-items: stretch;
    padding: 80px 20px 20px 20px;
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
    transform: translateX(100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow-y: auto;
    z-index: 101;
  }

  .dark-mode .nav-menu {
    background: rgba(0, 0, 0, 0.98);
    border-left-color: rgba(255, 255, 255, 0.1);
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.4);
  }

  .nav-menu.active {
    transform: translateX(0);
    opacity: 1;
    visibility: visible;
  }

  .nav-links-section {
    display: flex;
    flex-direction: column;
    gap: 0;
    width: 100%;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border);
  }

  .nav-controls-section {
    display: flex;
    flex-direction: column;
    gap: 0;
    width: 100%;
    padding-top: 20px;
  }

  .nav-link {
    padding: 14px 16px;
    text-align: left;
    border-radius: 8px;
    margin-bottom: 4px;
    transition: background 0.2s;
  }

  .nav-link:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .dark-mode .nav-link:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .nav-link-signup {
    margin-top: 8px;
    text-align: center;
  }

  .dark-mode-toggle {
    width: 100%;
    justify-content: flex-start;
    padding: 14px 16px;
    border-radius: 8px;
    margin-bottom: 4px;
  }

  .dark-mode-toggle:hover {
    background: rgba(0, 0, 0, 0.05);
    transform: none;
  }

  .dark-mode .dark-mode-toggle:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .chat-icon {
    padding: 14px 16px;
    border-radius: 8px;
    margin-bottom: 4px;
    justify-content: flex-start;
  }

  .chat-icon:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .dark-mode .chat-icon:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .user-menu {
    width: 100%;
  }

  .user-avatar {
    width: 100%;
    height: 50px;
    border-radius: 8px;
    justify-content: flex-start;
    gap: 12px;
    padding-left: 16px;
    margin-bottom: 4px;
  }

  .user-avatar .avatar-image {
    width: 36px;
    height: 36px;
    border-radius: 50%;
  }

  .user-avatar::after {
    content: 'Account';
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--text);
  }

  .user-avatar:not(:has(.avatar-image)) {
    background: transparent;
    border: 1px solid var(--border);
  }

  .user-avatar:not(:has(.avatar-image))::before {
    content: '';
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
  }

  .user-dropdown {
    position: static;
    margin-top: 8px;
    box-shadow: none;
    border: 1px solid var(--border);
    transform: none;
  }

  .user-dropdown.active {
    transform: none;
  }

  .nav-spacer {
    display: none;
  }

  .nav-menu::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 280px;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s;
    pointer-events: none;
  }

  .nav-menu.active::before {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }
}

@media (max-width: 1024px) and (min-width: 769px) {
  .nav-menu {
    gap: 15px;
  }

  .nav-container {
    padding: 0 30px;
  }
}

.menu-close {
  display: none;
}

.control-label {
  display: none;
}

.mobile-user-section {
  display: none;
}

@media (max-width: 768px) {
  .menu-close {
    display: flex;
    position: absolute;
    top: 20px;
    right: 20px;
    background: none;
    border: none;
    color: var(--text);
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: background 0.2s;
    z-index: 103;
  }

  .menu-close:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .dark-mode .menu-close:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .menu-close svg {
    width: 24px;
    height: 24px;
  }

  .mobile-control-item {
    display: flex !important;
    align-items: center;
    gap: 12px;
  }

  .control-label {
    display: inline;
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--text);
  }

  .dark-mode-toggle {
    width: 100%;
    justify-content: flex-start;
    padding: 14px 16px;
    border-radius: 8px;
    margin-bottom: 4px;
  }

  .chat-icon {
    padding: 14px 16px;
    border-radius: 8px;
    margin-bottom: 4px;
    justify-content: flex-start;
  }

  .chat-icon-wrapper {
    display: flex;
    align-items: center;
  }

  .mobile-user-section {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding-top: 20px;
    border-top: 1px solid var(--border);
    margin-top: 20px;
  }

  .mobile-user-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: rgba(0, 0, 0, 0.02);
    border-radius: 12px;
    margin-bottom: 12px;
  }

  .dark-mode .mobile-user-header {
    background: rgba(255, 255, 255, 0.05);
  }

  .user-avatar-mobile {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.2rem;
    overflow: hidden;
    flex-shrink: 0;
  }

  .user-avatar-mobile .avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .user-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 0;
  }

  .user-name {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-type {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .mobile-user-links {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .mobile-user-links .dropdown-item {
    padding: 14px 16px;
    border-radius: 8px;
    transition: background 0.2s;
  }

  .mobile-user-links .dropdown-item:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .dark-mode .mobile-user-links .dropdown-item:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .user-menu {
    display: none;
  }

  .user-avatar::after {
    display: none;
  }
}

@media (min-width: 769px) {
  .mobile-user-section {
    display: none !important;
  }

  .control-label {
    display: none !important;
  }

  .menu-close {
    display: none !important;
  }
}
</style>
