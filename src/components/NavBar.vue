<template>
  <nav class="navbar">
    <div class="nav-container">
      <!-- Logo -->
      <router-link :to="getHomeRoute" class="nav-brand">
        Bridge<span class="brand-dot">.</span>
      </router-link>

      <!-- Hamburger (mobile) -->
      <button class="nav-toggle" @click="toggleMenu" :class="{ active: menuOpen }" aria-label="Menu">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <!-- Nav Menu -->
      <div class="nav-menu" :class="{ active: menuOpen }">
        <!-- Mobile close -->
        <button class="menu-close" @click="closeMenu" aria-label="Close menu">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <!-- Nav links -->
        <div class="nav-links-section">
          <template v-if="isAuthenticated">
            <router-link :to="getHomeRoute" class="nav-link" @click="closeMenu">Home</router-link>
            <template v-if="isJobSeeker">
              <router-link to="/browse-jobs"  class="nav-link" @click="closeMenu">Browse Jobs</router-link>
              <router-link to="/reviews"      class="nav-link" @click="closeMenu">Reviews</router-link>
              <router-link to="/quizzes"      class="nav-link" @click="closeMenu">AI Quiz</router-link>
            </template>
            <template v-if="isEmployer">
              <router-link to="/employer/post-job" class="nav-link" @click="closeMenu">Post Job</router-link>
              <router-link to="/candidates"        class="nav-link" @click="closeMenu">Candidates</router-link>
            </template>
          </template>
          <template v-else>
            <router-link to="/"           class="nav-link" @click="closeMenu">Home</router-link>
            <router-link to="/browse-jobs" class="nav-link" @click="closeMenu">Browse Jobs</router-link>
          </template>
        </div>

        <div class="nav-spacer"></div>

        <!-- Controls -->
        <div class="nav-controls-section">
          <template v-if="isAuthenticated">
            <!-- Chat icon -->
            <router-link to="/chat" class="nav-link chat-icon" @click="closeMenu">
              <div class="chat-icon-wrapper">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span v-if="totalUnreadCount > 0" class="unread-badge-nav">
                  {{ totalUnreadCount > 99 ? '99+' : totalUnreadCount }}
                </span>
              </div>
              <span class="control-label">Messages</span>
            </router-link>

            <!-- Mobile user section -->
            <div class="mobile-user-section">
              <div class="mobile-user-header">
                <div class="user-avatar-mobile">
                  <img v-if="userProfile?.photoURL" :src="userProfile.photoURL" :alt="userProfile.name" class="avatar-image" />
                  <span v-else>{{ userInitials }}</span>
                </div>
                <div class="user-info">
                  <span class="user-name">{{ userProfile?.name || 'User' }}</span>
                  <span class="user-type">{{ isJobSeeker ? 'Job Seeker' : 'Employer' }}</span>
                </div>
              </div>
              <div class="mobile-user-links">
                <router-link to="/profile"             class="dropdown-item" @click="closeMenu"><User :size="16" /> Profile</router-link>
                <router-link v-if="isJobSeeker" to="/achievements"  class="dropdown-item" @click="closeMenu"><Trophy :size="16" /> Achievements</router-link>
                <router-link v-if="isJobSeeker" to="/applications"  class="dropdown-item" @click="closeMenu"><Briefcase :size="16" /> Applications</router-link>
                <router-link v-if="isEmployer"  to="/employer/applications" class="dropdown-item" @click="closeMenu"><CheckSquare :size="16" /> Applications</router-link>
                <div class="dropdown-divider"></div>
                <button @click="handleLogout" class="dropdown-item danger"><LogOut :size="16" /> Logout</button>
              </div>
            </div>

            <!-- Desktop user avatar + dropdown -->
            <div class="user-menu">
              <button @click="toggleUserDropdown" class="user-avatar" :title="userProfile?.name">
                <img v-if="userProfile?.photoURL" :src="userProfile.photoURL" :alt="userProfile.name" class="avatar-image" />
                <span v-else>{{ userInitials }}</span>
              </button>
              <div
                class="user-dropdown"
                :class="{ active: userDropdownOpen }"
                @mouseenter="resetDropdownTimer"
                @mouseleave="startDropdownTimer"
              >
                <div class="dropdown-user-header">
                  <div class="user-avatar-dropdown">
                    <img v-if="userProfile?.photoURL" :src="userProfile.photoURL" :alt="userProfile.name" class="avatar-image" />
                    <span v-else>{{ userInitials }}</span>
                  </div>
                  <div class="user-info-dropdown">
                    <span class="user-name-dropdown">{{ userProfile?.name || 'User' }}</span>
                    <span class="user-type-dropdown">{{ isJobSeeker ? 'Job Seeker' : 'Employer' }}</span>
                  </div>
                </div>
                <div class="dropdown-divider"></div>
                <router-link to="/profile"             class="dropdown-item" @click="closeMenus"><User :size="16" /> Profile</router-link>
                <router-link v-if="isJobSeeker" to="/achievements"  class="dropdown-item" @click="closeMenus"><Trophy :size="16" /> Achievements</router-link>
                <router-link v-if="isJobSeeker" to="/applications"  class="dropdown-item" @click="closeMenus"><Briefcase :size="16" /> Applications</router-link>
                <router-link v-if="isEmployer"  to="/employer/applications" class="dropdown-item" @click="closeMenus"><CheckSquare :size="16" /> Applications</router-link>
                <div class="dropdown-divider"></div>
                <button @click="handleLogout" class="dropdown-item danger"><LogOut :size="16" /> Logout</button>
              </div>
            </div>
          </template>

          <template v-else>
            <router-link to="/login"    class="nav-link"        @click="closeMenu">Login</router-link>
            <router-link to="/register" class="nav-link-signup" @click="closeMenu">Sign Up</router-link>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { User, Trophy, Briefcase, LogOut, CheckSquare } from 'lucide-vue-next'

export default {
  name: 'NavBar',
  components: { User, Trophy, Briefcase, LogOut, CheckSquare },
  setup() {
    const store = useStore()
    const router = useRouter()

    const menuOpen = ref(false)
    const userDropdownOpen = ref(false)
    let dropdownTimeout = null

    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
    const isJobSeeker     = computed(() => store.getters['auth/isJobSeeker'])
    const isEmployer      = computed(() => store.getters['auth/isEmployer'])
    const userProfile     = computed(() => store.getters['auth/userProfile'])

    const userInitials = computed(() => {
      if (!userProfile.value?.name) return '?'
      return userProfile.value.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    })

    const totalUnreadCount = computed(() => {
      if (!isAuthenticated.value) return 0
      const chatRooms   = store.getters['chatAbly/chatRooms'] || []
      const unreadCounts = store.state.chatAbly.unreadCounts
      if (!unreadCounts || !(unreadCounts instanceof Map)) return 0
      let total = 0
      for (const room of chatRooms) total += unreadCounts.get(room.id) || 0
      for (const [key, value] of unreadCounts.entries()) {
        if (typeof key === 'string' && key.startsWith('chat_') && !chatRooms.some(r => r.id === key || r.roomName === key))
          total += value || 0
      }
      const _size = unreadCounts.size
      return total
    })

    const getHomeRoute = computed(() => {
      if (isAuthenticated.value && isEmployer.value) return '/employer/dashboard'
      return '/'
    })

    const toggleMenu          = () => { menuOpen.value = !menuOpen.value }
    const closeMenu           = () => { menuOpen.value = false }
    const toggleUserDropdown  = () => { userDropdownOpen.value = !userDropdownOpen.value; if (userDropdownOpen.value) startDropdownTimer() }
    const startDropdownTimer  = () => { clearDropdownTimer(); dropdownTimeout = setTimeout(() => { userDropdownOpen.value = false }, 5000) }
    const clearDropdownTimer  = () => { if (dropdownTimeout) { clearTimeout(dropdownTimeout); dropdownTimeout = null } }
    const resetDropdownTimer  = () => { if (userDropdownOpen.value) startDropdownTimer() }
    const closeMenus          = () => { menuOpen.value = false; userDropdownOpen.value = false; clearDropdownTimer() }

    const handleLogout = async () => {
      try {
        await store.dispatch('auth/logout')
        closeMenus()
        router.push('/')
      } catch (e) { console.error('Logout error:', e) }
    }

    watch(userDropdownOpen, isOpen => { isOpen ? startDropdownTimer() : clearDropdownTimer() })
    onUnmounted(clearDropdownTimer)

    return {
      menuOpen, userDropdownOpen,
      isAuthenticated, isJobSeeker, isEmployer, userProfile,
      userInitials, getHomeRoute, totalUnreadCount,
      toggleMenu, closeMenu, toggleUserDropdown,
      startDropdownTimer, resetDropdownTimer, closeMenus, handleLogout,
    }
  }
}
</script>

<style scoped>
/* ─── Navbar shell ──────────────────────────────────────────── */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 12px 24px;
  background: transparent;
}

.nav-container {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;

  background: rgba(10, 22, 40, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(74, 158, 245, 0.18);
  border-radius: 14px;
  padding: 10px 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35);
  position: relative;
}

/* Glossy top-border accent */
.nav-container::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 60%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

/* ─── Brand ─────────────────────────────────────────────────── */
.nav-brand {
  text-decoration: none;
  font-size: 1.4rem;
  font-weight: 600;
  color: #F0F6FF;
  letter-spacing: -0.02em;
  margin-right: 12px;
  white-space: nowrap;
  flex-shrink: 0;
}

.brand-dot {
  color: #4A9EF5;
}

/* ─── Nav links ─────────────────────────────────────────────── */
.nav-links-section {
  display: contents;
}

.nav-controls-section {
  display: contents;
}

.nav-spacer { flex: 1; }

.nav-menu {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.nav-link {
  text-decoration: none;
  color: rgba(200, 220, 255, 0.7);
  font-size: 0.88rem;
  font-weight: 500;
  padding: 7px 13px;
  border-radius: 8px;
  transition: color 0.2s, background 0.2s;
  white-space: nowrap;
}

.nav-link:hover {
  color: #F0F6FF;
  background: rgba(74, 158, 245, 0.1);
}

.nav-link.router-link-active {
  color: #4A9EF5;
  background: rgba(74, 158, 245, 0.12);
}

.nav-link-signup {
  text-decoration: none;
  background: #1A6FD4;
  color: #fff;
  font-size: 0.88rem;
  font-weight: 500;
  padding: 8px 18px;
  border-radius: 8px;
  transition: background 0.2s, transform 0.15s;
  white-space: nowrap;
}

.nav-link-signup:hover {
  background: #1560BB;
  color: #fff;
  transform: translateY(-1px);
}

/* ─── Chat icon ─────────────────────────────────────────────── */
.chat-icon {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  color: rgba(200, 220, 255, 0.7);
}

.chat-icon:hover {
  color: #F0F6FF;
  background: rgba(74, 158, 245, 0.1);
}

.chat-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.unread-badge-nav {
  position: absolute;
  top: -7px;
  right: -7px;
  background: #EF4444;
  color: #fff;
  border-radius: 50%;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0 4px;
  border: 2px solid #0A1628;
  animation: pulse-badge 2.5s ease infinite;
}

@keyframes pulse-badge {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.15); }
}

/* ─── User avatar ───────────────────────────────────────────── */
.user-menu { position: relative; }

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(26, 111, 212, 0.3);
  border: 1.5px solid rgba(74, 158, 245, 0.4);
  color: #4A9EF5;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
  padding: 0;
}

.user-avatar:hover {
  border-color: #4A9EF5;
  box-shadow: 0 0 0 3px rgba(74, 158, 245, 0.15);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ─── Dropdown ──────────────────────────────────────────────── */
.user-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 240px;
  background: rgba(10, 22, 40, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(74, 158, 245, 0.2);
  border-radius: 14px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-8px) scale(0.97);
  transition: opacity 0.2s, transform 0.2s, visibility 0.2s;
  overflow: hidden;
  padding: 6px;
}

.user-dropdown.active {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
}

.dropdown-user-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: rgba(74, 158, 245, 0.06);
  border-radius: 10px;
  margin-bottom: 4px;
}

.user-avatar-dropdown {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(26, 111, 212, 0.35);
  border: 1.5px solid rgba(74, 158, 245, 0.4);
  color: #4A9EF5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.85rem;
  overflow: hidden;
  flex-shrink: 0;
}

.user-info-dropdown {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.user-name-dropdown {
  font-size: 0.9rem;
  font-weight: 600;
  color: #F0F6FF;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-type-dropdown {
  font-size: 0.75rem;
  color: rgba(180, 210, 255, 0.6);
}

.dropdown-divider {
  height: 1px;
  background: rgba(74, 158, 245, 0.12);
  margin: 4px 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 12px;
  text-decoration: none;
  color: rgba(200, 220, 255, 0.8);
  background: none;
  border: none;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  text-align: left;
}

.dropdown-item:hover {
  background: rgba(74, 158, 245, 0.1);
  color: #F0F6FF;
}

.dropdown-item.danger:hover {
  background: rgba(239, 68, 68, 0.12);
  color: #FCA5A5;
}

/* ─── Hamburger (mobile) ────────────────────────────────────── */
.nav-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: rgba(74, 158, 245, 0.1);
  border: 1px solid rgba(74, 158, 245, 0.2);
  border-radius: 8px;
  cursor: pointer;
  padding: 9px;
  z-index: 102;
  margin-left: auto;
}

.nav-toggle span {
  width: 20px;
  height: 2px;
  background: rgba(200, 220, 255, 0.8);
  border-radius: 2px;
  transition: all 0.25s ease;
}

.nav-toggle.active span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
.nav-toggle.active span:nth-child(2) { opacity: 0; }
.nav-toggle.active span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }

.menu-close { display: none; }
.control-label { display: none; }
.mobile-user-section { display: none; }

/* ─── Mobile sidebar ────────────────────────────────────────── */
@media (max-width: 768px) {
  .navbar { padding: 10px 16px; }

  .nav-toggle { display: flex; }

  .nav-menu {
    position: fixed;
    top: 0;
    right: 0;
    width: 280px;
    height: 100dvh;
    background: rgba(10, 22, 40, 0.98);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-left: 1px solid rgba(74, 158, 245, 0.2);
    flex-direction: column;
    align-items: stretch;
    padding: 70px 16px 24px;
    transform: translateX(100%);
    opacity: 0;
    visibility: hidden;
    transition: transform 0.3s ease, opacity 0.3s ease, visibility 0.3s;
    overflow-y: auto;
    z-index: 101;
    gap: 0;
  }

  .nav-menu.active {
    transform: translateX(0);
    opacity: 1;
    visibility: visible;
  }

  .nav-menu::after {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 280px;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    pointer-events: auto;
  }

  .nav-links-section {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(74, 158, 245, 0.12);
  }

  .nav-controls-section {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding-top: 16px;
  }

  .nav-spacer { display: none; }

  .nav-link {
    padding: 12px 14px;
    font-size: 0.95rem;
    border-radius: 10px;
  }

  .nav-link-signup {
    display: block;
    text-align: center;
    padding: 12px;
    margin-top: 8px;
    font-size: 0.95rem;
    border-radius: 10px;
  }

  .menu-close {
    display: flex;
    position: absolute;
    top: 18px;
    right: 18px;
    background: rgba(74, 158, 245, 0.1);
    border: 1px solid rgba(74, 158, 245, 0.2);
    border-radius: 8px;
    color: rgba(200, 220, 255, 0.8);
    cursor: pointer;
    padding: 7px;
    z-index: 103;
  }

  .control-label {
    display: inline;
    font-size: 0.92rem;
    font-weight: 500;
    color: rgba(200, 220, 255, 0.75);
  }

  .chat-icon {
    padding: 12px 14px;
    font-size: 0.95rem;
    border-radius: 10px;
  }

  .mobile-user-section {
    display: flex;
    flex-direction: column;
    padding-top: 16px;
    border-top: 1px solid rgba(74, 158, 245, 0.12);
    margin-top: 16px;
  }

  .mobile-user-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px;
    background: rgba(74, 158, 245, 0.06);
    border-radius: 12px;
    margin-bottom: 10px;
  }

  .user-avatar-mobile {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(26, 111, 212, 0.3);
    border: 1.5px solid rgba(74, 158, 245, 0.4);
    color: #4A9EF5;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    overflow: hidden;
    flex-shrink: 0;
  }

  .user-info { display: flex; flex-direction: column; gap: 2px; }
  .user-name { font-size: 0.95rem; font-weight: 600; color: #F0F6FF; }
  .user-type { font-size: 0.8rem; color: rgba(180, 210, 255, 0.6); }

  .mobile-user-links { display: flex; flex-direction: column; gap: 2px; }

  .user-menu { display: none; }
}

@media (min-width: 769px) {
  .mobile-user-section { display: none !important; }
  .control-label        { display: none !important; }
  .menu-close           { display: none !important; }
}
</style>
