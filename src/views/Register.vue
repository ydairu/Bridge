<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <h1>{{ $t('auth.create') }}</h1>
        <p class="auth-subtitle">{{ $t('auth.join') }}</p>

        <form @submit.prevent="handleRegister">
          <!-- User Type Selection -->
          <div class="user-type-selector">
            <div
              :class="['selection-option', { selected: userType === 'jobseeker' }]"
              @click="userType = 'jobseeker'"
            >
              <div class="option-icon">
                <img src="../assets/user.svg" :alt="$t('auth.jobSeeker')" />
              </div>
              <div class="option-content">
                <h3>{{ $t('auth.jobSeeker') }}</h3>
              </div>
              <div class="selection-indicator">
                <span v-if="userType === 'jobseeker'" class="checkmark">✓</span>
              </div>
            </div>
            <div
              :class="['selection-option', { selected: userType === 'employer' }]"
              @click="userType = 'employer'"
            >
              <div class="option-icon">
                <img src="../assets/candidates.svg" :alt="$t('auth.employer')" />
              </div>
              <div class="option-content">
                <h3>{{ $t('auth.employer') }}</h3>
              </div>
              <div class="selection-indicator">
                <span v-if="userType === 'employer'" class="checkmark">✓</span>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="name">{{ $t('auth.fullName') }}</label>
            <input
              type="text"
              id="name"
              v-model="formData.name"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div class="form-group">
            <label for="email">{{ $t('auth.email') }}</label>
            <input
              type="email"
              id="email"
              v-model="formData.email"
              placeholder="Enter your email"
              required
            />
          </div>

          <div class="form-group">
            <label for="phone">{{ $t('auth.phone') }}</label>
            <input
              type="tel"
              id="phone"
              v-model="formData.phone"
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">{{ $t('auth.password') }}</label>
            <input
              type="password"
              id="password"
              v-model="formData.password"
              placeholder="Create a password"
              required
            />
          </div>

          <div class="form-group">
            <label for="confirmPassword">{{ $t('auth.confirmPassword') }}</label>
            <input
              type="password"
              id="confirmPassword"
              v-model="confirmPassword"
              placeholder="Confirm your password"
              required
            />
          </div>

          <!-- Job Seeker Specific Fields -->
          <div v-if="userType === 'jobseeker'" class="role-specific-fields">
            <div class="form-group">
              <label for="skills">Skills (comma-separated)</label>
              <input
                type="text"
                id="skills"
                v-model="formData.skills"
                placeholder="e.g., Construction, Plumbing, Electrical"
              />
            </div>

            <div class="form-group">
              <label for="experience">Years of Experience</label>
              <input
                type="number"
                id="experience"
                v-model="formData.experience"
                placeholder="Years"
                min="0"
              />
            </div>
          </div>

          <!-- Employer Specific Fields -->
          <div v-if="userType === 'employer'" class="role-specific-fields">
            <div class="form-group">
              <label for="company">Company Name</label>
              <input
                type="text"
                id="company"
                v-model="formData.company"
                placeholder="Enter company name"
                required
              />
            </div>

            <div class="form-group">
              <label for="industry">Industry</label>
              <input
                type="text"
                id="industry"
                v-model="formData.industry"
                placeholder="e.g., Construction, Hospitality"
              />
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
            {{ loading ? '...' : $t('auth.create') }}
          </button>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>
        </form>

        <p class="login-link">
          {{ $t('auth.already') }} <router-link to="/login">{{ $t('auth.signIn') }}</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'Register',
  setup() {
    const store = useStore()
    const router = useRouter()
    
    const userType = ref('jobseeker')
    const confirmPassword = ref('')
    const loading = ref(false)
    const error = ref(null)

    const formData = reactive({
      name: '',
      email: '',
      phone: '',
      password: '',
      skills: '',
      experience: '',
      company: '',
      industry: ''
    })

    const handleRegister = async () => {
      if (formData.password !== confirmPassword.value) {
        error.value = 'Passwords do not match'
        return
      }

      loading.value = true
      error.value = null

      try {
        const userData = {
          name: formData.name,
          phone: formData.phone,
          role: userType.value
        }

        if (userType.value === 'jobseeker') {
          userData.skills = formData.skills.split(',').map(s => s.trim())
          userData.experience = formData.experience
        } else {
          userData.company = formData.company
          userData.industry = formData.industry
        }

        await store.dispatch('auth/register', {
          email: formData.email,
          password: formData.password,
          userData
        })

        // Redirect based on role
        if (userType.value === 'employer') {
          router.push('/employer/dashboard')
        } else {
          router.push('/')
        }
      } catch (err) {
        error.value = err.message || 'Failed to create account. Please try again.'
      } finally {
        loading.value = false
      }
    }

    return {
      userType,
      formData,
      confirmPassword,
      loading,
      error,
      handleRegister
    }
  }
}
</script>

<style scoped>
.user-type-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 22px;
}

.selection-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: rgba(15, 31, 61, 0.6);
  border: 1px solid rgba(74, 158, 245, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.selection-option:hover {
  border-color: rgba(74, 158, 245, 0.45);
  background: rgba(15, 31, 61, 0.85);
}

.selection-option.selected {
  border-color: #1A6FD4;
  background: rgba(26, 111, 212, 0.15);
  box-shadow: 0 0 0 1px rgba(26, 111, 212, 0.3);
}

.option-icon {
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(74, 158, 245, 0.1);
  border-radius: 8px;
  transition: background 0.2s;
}

.option-icon img {
  width: 22px;
  height: 22px;
  opacity: 0.65;
  filter: invert(1);
  transition: opacity 0.2s;
}

.selection-option.selected .option-icon {
  background: rgba(26, 111, 212, 0.2);
}

.selection-option.selected .option-icon img {
  opacity: 1;
}

.option-content { flex: 1; }

.option-content h3 {
  font-size: 0.95rem;
  font-weight: 600;
  color: rgba(200, 220, 255, 0.75);
  margin: 0;
}

.selection-option.selected .option-content h3 {
  color: #F0F6FF;
}

.selection-indicator {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid rgba(74, 158, 245, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.selection-option.selected .selection-indicator {
  background: #1A6FD4;
  border-color: #1A6FD4;
}

.checkmark {
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
}

@media (max-width: 560px) {
  .user-type-selector { grid-template-columns: 1fr; }
}
</style>

