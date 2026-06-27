<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <h1>{{ $t('auth.welcome') }}</h1>
        <p class="auth-subtitle">{{ $t('auth.continue') }}</p>

        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="email">{{ $t('auth.email') }}</label>
            <input
              type="email"
              id="email"
              v-model="email"
              :placeholder="$t('auth.email')"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">{{ $t('auth.password') }}</label>
            <input
              type="password"
              id="password"
              v-model="password"
              :placeholder="$t('auth.password')"
              required
            />
            <div v-if="error" class="field-error field-error-below">{{ error }}</div>
          </div>

          

          <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
            {{ loading ? $t('auth.signingIn') : $t('auth.signIn') }}
          </button>

          
        </form>

        <div class="divider">
          <span>or</span>
        </div>

        <p class="signup-link">
          {{ $t('auth.noAccount') }} <router-link to="/register">{{ $t('auth.signUp') }}</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'Login',
  setup() {
    const store = useStore()
    const router = useRouter()
    
    const email = ref('')
    const password = ref('')
    const loading = ref(false)
    const error = ref(null)

    const handleLogin = async () => {
      loading.value = true
      error.value = null

      try {
        await store.dispatch('auth/login', {
          email: email.value,
          password: password.value
        })

        // Get user profile to determine redirect
        const userProfile = store.getters['auth/userProfile']
        
        if (userProfile.role === 'employer') {
          router.push('/employer/dashboard')
        } else {
          router.push('/')
        }
      } catch (err) {
        // Map Firebase Auth error codes to user-friendly messages
        const code = err?.code || ''
        if (code === 'auth/wrong-password' || code === 'auth/invalid-credential' || code === 'auth/invalid-password') {
          error.value = 'Incorrect email or password.'
        } else if (code === 'auth/user-not-found') {
          error.value = 'No account found with this email.'
        } else if (code === 'auth/too-many-requests') {
          error.value = 'Too many attempts. Please try again later.'
        } else if (code === 'auth/invalid-email') {
          error.value = 'Please enter a valid email address.'
        } else if (code === 'auth/network-request-failed') {
          error.value = 'Network error. Check your connection and try again.'
        } else {
          error.value = 'Failed to sign in. Please check your credentials.'
        }
      } finally {
        loading.value = false
      }
    }

    return {
      email,
      password,
      loading,
      error,
      handleLogin
    }
  }
}
</script>

<style scoped>
.field-error {
  color: #FCA5A5;
  font-size: 0.85rem;
  margin-top: 6px;
  display: block;
}
</style>

