<template>
  <div class="profile-page">
    <div class="profile-container">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <p>Loading profile...</p>
      </div>
      
      <!-- Profile Content -->
      <div v-else-if="userProfile" class="profile-wrapper">
        <!-- Profile Header -->
        <div class="profile-header-card">
          <div class="header-main">
            <div class="avatar-section">
              <div class="avatar-wrapper">
                <div class="avatar">
                  <img 
                    v-if="photoPreviewUrl || userProfile?.photoURL" 
                    :src="photoPreviewUrl || userProfile?.photoURL" 
                    :alt="userProfile?.name"
                    class="avatar-image"
                  />
                  <span v-else class="avatar-initials">{{ getInitials }}</span>
                </div>
                <input 
                  ref="fileInput"
                  type="file" 
                  accept="image/jpeg,image/jpg,image/png"
                  @change="handleFileUpload"
                  style="display: none"
                />
              </div>
              <div v-if="!isViewingOtherProfile && editing" class="avatar-actions">
                <p v-if="uploadError" class="inline-error">{{ uploadError }}</p>
                <div class="photo-buttons">
                  <button 
                    @click="triggerFileInput"
                    class="btn-add-photo"
                    :disabled="uploadingPhoto"
                  >
                    <img src="../assets/add-profile-picture.svg" alt="" class="btn-icon" />
                    {{ userProfile?.photoURL || photoPreviewUrl ? 'Change Photo' : 'Add Photo' }}
                  </button>
                  <button 
                    v-if="userProfile?.photoURL || photoPreviewUrl"
                    @click="removePhoto"
                    class="btn-remove-photo"
                    :disabled="uploadingPhoto"
                  >
                    <img src="../assets/trash.svg" alt="" class="btn-icon" />
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <div class="header-info">
              <div class="name-section">
                <h1>{{ userProfile?.name || 'User Profile' }}</h1>
                <div class="role-badge" :class="userProfile?.role">
                  {{ userProfile?.role === 'jobseeker' ? 'Job Seeker' : 'Employer' }}
                </div>
              </div>
              <p class="subtitle">
                <span v-if="userProfile?.role === 'jobseeker'">
                  {{ userProfile?.experience || 0 }} years of experience
                </span>
                <span v-else>{{ userProfile?.company || 'No company' }}</span>
              </p>
            </div>

            <div v-if="!isViewingOtherProfile" class="header-actions">
              <button v-if="!editing" @click="startEditing" class="btn-edit">
                Edit Profile
              </button>
              <div v-else class="edit-buttons">
                <button @click="saveProfile" :disabled="savingProfile" class="btn-save">
                  {{ savingProfile ? 'Saving...' : 'Save' }}
                </button>
                <button @click="cancelEditing" class="btn-cancel">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <p v-if="editing && saveError" class="error-banner">{{ saveError }}</p>

        <!-- Stats Card (Job Seekers Only) -->
        <div v-if="userProfile?.role === 'jobseeker'" class="stats-card">
          <StatsOverview
            :badges="earnedBadges.length"
            :plays="userStats?.totalPlays || 0"
            :wins="userStats?.totalWins || 0"
            :winRate="userStats?.winPercentage || 0"
            :streak="userStats?.currentDayStreak || 0"
          />
        </div>

        <!-- Tabs Navigation -->
        <div class="tabs-container">
          <div class="tabs-nav">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              :class="['tab-button', { active: activeTab === tab.id }]"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- Tab Content -->
          <div class="tabs-content">
            <!-- Overview Tab -->
            <div v-if="activeTab === 'overview'" class="tab-panel">
              <!-- Personal Information Section -->
              <div class="section-card">
                <h2 class="section-title">Personal Information</h2>
                <div class="info-grid">
                  <div class="info-item">
                    <label>Name</label>
                    <input 
                      v-if="editing" 
                      v-model="editableFields.name"
                      type="text" 
                      class="edit-input"
                      placeholder="Enter your name"
                    />
                    <p v-else>{{ userProfile?.name }}</p>
                  </div>
                  <div class="info-item">
                    <label>Email</label>
                    <p class="readonly-field">{{ userProfile?.email }}</p>
                  </div>
                  <div class="info-item">
                    <label>{{ userProfile?.role === 'jobseeker' ? 'Phone' : 'Contact Phone' }}</label>
                    <input 
                      v-if="editing" 
                      v-model="editableFields.phone"
                      type="tel" 
                      class="edit-input"
                      placeholder="Enter phone number"
                    />
                    <p v-else>{{ userProfile?.phone || 'Not provided' }}</p>
                  </div>
                  <div v-if="userProfile?.role === 'jobseeker'" class="info-item">
                    <label>Experience (years)</label>
                    <input 
                      v-if="editing" 
                      v-model="editableFields.experience"
                      type="number" 
                      min="0"
                      class="edit-input"
                      placeholder="Years of experience"
                    />
                    <p v-else>{{ userProfile?.experience || 0 }}</p>
                  </div>
                  <div v-if="userProfile?.role === 'employer'" class="info-item">
                    <label>Company Name</label>
                    <input 
                      v-if="editing" 
                      v-model="editableFields.company"
                      type="text" 
                      class="edit-input"
                      placeholder="Enter company name"
                    />
                    <p v-else>{{ userProfile?.company }}</p>
                  </div>
                  <div v-if="userProfile?.role === 'employer'" class="info-item">
                    <label>Industry</label>
                    <input 
                      v-if="editing" 
                      v-model="editableFields.industry"
                      type="text" 
                      class="edit-input"
                      placeholder="Enter industry"
                    />
                    <p v-else>{{ userProfile?.industry || 'Not provided' }}</p>
                  </div>
                </div>
              </div>

              <!-- Skills Section (Job Seekers) -->
              <div v-if="userProfile?.role === 'jobseeker'" class="section-card">
                <h2 class="section-title">Skills</h2>
                <div v-if="editing" class="skills-edit">
                  <textarea 
                    v-model="editableFields.skills"
                    class="edit-textarea"
                    placeholder="Enter skills separated by commas"
                    rows="3"
                  ></textarea>
                  <p class="help-text">Separate skills with commas</p>
                </div>
                <div v-else class="skills-container">
                  <span v-for="skill in userProfile?.skills" :key="skill" class="skill-tag">
                    {{ skill }}
                  </span>
                  <p v-if="!userProfile?.skills || userProfile?.skills.length === 0" class="empty-text">
                    No skills added yet
                  </p>
                </div>
              </div>

              <!-- Overview Grid: Applications & Reviews Previews (Job Seekers) -->
              <div v-if="userProfile?.role === 'jobseeker'" class="overview-grid">
                <!-- Applications Preview -->
                <div v-if="!isViewingOtherProfile" class="section-card">
                  <div class="section-header">
                    <h2 class="section-title">Recent Applications</h2>
                    <router-link v-if="recentApplications.length > 0" to="/applications" class="view-all-link">
                      View All →
                    </router-link>
                  </div>
                  <div v-if="recentApplications.length === 0" class="empty-state">
                    <p>You haven't applied to any jobs yet.</p>
                    <router-link to="/" class="btn btn-primary">Browse Jobs</router-link>
                  </div>
                  <div v-else class="applications-preview">
                    <div 
                      v-for="app in recentApplications.slice(0, 3)" 
                      :key="app.id"
                      class="application-preview-item"
                    >
                      <div class="preview-main">
                        <h3>{{ app.jobTitle }}</h3>
                        <p class="preview-company">{{ app.company }}</p>
                        <span :class="['status-badge-small', app.status]">{{ app.status }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Reviews Preview (for jobseekers viewing own profile) -->
                <div v-if="!isViewingOtherProfile && currentUser?.uid" class="section-card">
                  <div class="section-header">
                    <h2 class="section-title">Reviews</h2>
                  </div>
                  <CandidateReviewList :candidate-id="currentUser.uid" />
                </div>
              </div>

              <!-- Employer Overview - Company Information -->
              <div v-if="userProfile?.role === 'employer'" class="section-card">
                <h2 class="section-title">Company Information</h2>
                
                <!-- Company Logo Section -->
                <div class="company-logo-section">
                  <div class="company-logo-wrapper">
                    <div class="company-logo">
                      <img 
                        v-if="companyLogoPreviewUrl || userProfile?.companyLogo" 
                        :src="companyLogoPreviewUrl || userProfile?.companyLogo" 
                        :alt="userProfile?.company || 'Company Logo'"
                        class="company-logo-image"
                      />
                      <span v-else class="company-logo-initials">{{ getCompanyInitials(userProfile?.company) }}</span>
                    </div>
                    <div v-if="!isViewingOtherProfile && editing" class="company-logo-actions">
                      <input 
                        ref="companyLogoInput"
                        type="file" 
                        accept="image/jpeg,image/jpg,image/png"
                        @change="handleCompanyLogoUpload"
                        style="display: none"
                      />
                      <p v-if="companyLogoUploadError" class="inline-error">{{ companyLogoUploadError }}</p>
                      <div class="logo-buttons">
                        <button 
                          @click="triggerCompanyLogoInput"
                          class="btn-add-logo"
                          :disabled="uploadingCompanyLogo"
                        >
                          <img src="../assets/add-profile-picture.svg" alt="" class="btn-icon" />
                          {{ userProfile?.companyLogo || companyLogoPreviewUrl ? 'Change Logo' : 'Upload Logo' }}
                        </button>
                        <button 
                          v-if="userProfile?.companyLogo || companyLogoPreviewUrl"
                          @click="removeCompanyLogo"
                          class="btn-remove-logo"
                          :disabled="uploadingCompanyLogo"
                        >
                          <img src="../assets/trash.svg" alt="" class="btn-icon" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Company Information Fields -->
                <div class="info-grid">
                  <div class="info-item">
                    <label>Company Name</label>
                    <input 
                      v-if="editing" 
                      v-model="editableFields.company"
                      type="text" 
                      class="edit-input"
                      placeholder="Enter company name"
                    />
                    <p v-else>{{ userProfile?.company || 'Not provided' }}</p>
                  </div>
                  <div class="info-item">
                    <label>Industry</label>
                    <input 
                      v-if="editing" 
                      v-model="editableFields.industry"
                      type="text" 
                      class="edit-input"
                      placeholder="e.g., Construction, Manufacturing"
                    />
                    <p v-else>{{ userProfile?.industry || 'Not provided' }}</p>
                  </div>
                  <div class="info-item">
                    <label>Company Website</label>
                    <input 
                      v-if="editing" 
                      v-model="editableFields.companyWebsite"
                      type="url" 
                      class="edit-input"
                      placeholder="https://www.example.com"
                    />
                    <p v-else>
                      <a v-if="userProfile?.companyWebsite" :href="userProfile.companyWebsite" target="_blank" rel="noopener noreferrer" class="website-link">
                        {{ userProfile.companyWebsite }}
                      </a>
                      <span v-else>Not provided</span>
                    </p>
                  </div>
                  <div class="info-item">
                    <label>Company Address</label>
                    <input 
                      v-if="editing" 
                      v-model="editableFields.companyAddress"
                      type="text" 
                      class="edit-input"
                      placeholder="Enter company address"
                    />
                    <p v-else>{{ userProfile?.companyAddress || 'Not provided' }}</p>
                  </div>
                  <div class="info-item">
                    <label>Company Size</label>
                    <select 
                      v-if="editing" 
                      v-model="editableFields.companySize"
                      class="edit-input"
                    >
                      <option value="">Select size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501-1000">501-1000 employees</option>
                      <option value="1000+">1000+ employees</option>
                    </select>
                    <p v-else>{{ formatCompanySize(userProfile?.companySize) || 'Not provided' }}</p>
                  </div>
                  <div class="info-item">
                    <label>UEN (Unique Entity Number)</label>
                    <input 
                      v-if="editing" 
                      v-model="editableFields.companyUEN"
                      type="text" 
                      class="edit-input"
                      placeholder="e.g., 123456789A"
                      maxlength="10"
                    />
                    <p v-else>{{ userProfile?.companyUEN || 'Not provided' }}</p>
                    <p v-if="editing" class="help-text">Government-issued identification number for businesses in Singapore</p>
                  </div>
                  <div class="info-item full-width">
                    <label>Company Description</label>
                    <textarea 
                      v-if="editing" 
                      v-model="editableFields.companyDescription"
                      class="edit-textarea"
                      placeholder="Tell us about your company..."
                      rows="4"
                    ></textarea>
                    <p v-else>{{ userProfile?.companyDescription || 'Not provided' }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Achievements Tab (Job Seekers Only) -->
            <div v-if="activeTab === 'achievements' && userProfile?.role === 'jobseeker'" class="tab-panel">
              <div class="section-card">
                <div class="section-header">
                  <h2 class="section-title">
                    <img src="../assets/trophy-star.svg" alt="" class="section-icon" />
                    Badges & Achievements
                  </h2>
                  <router-link to="/achievements" class="view-all-link">View All →</router-link>
                </div>
                
                <div v-if="badgesLoading" class="loading-state">
                  <p>Loading badges...</p>
                </div>
                
                <div v-else-if="earnedBadges.length === 0" class="empty-badges">
                  <p>No badges earned yet</p>
                  <template v-if="!isViewingOtherProfile">
                    <p class="empty-subtitle">Complete quizzes to earn your first badge!</p>
                    <router-link to="/quizzes" class="btn btn-primary">Start Learning</router-link>
                  </template>
                </div>
                
                <div v-else class="badges-grid">
                  <AchievementCard
                    v-for="(badge, index) in earnedBadgesWithIcons" 
                    :key="badge.id"
                    :icon="badge.icon"
                    :icon-type="badge.iconType"
                    :title="badge.name"
                    :description="badge.description"
                    :progress="1"
                    :requirement="1"
                    :unlocked="true"
                    :tier="badge.tier"
                    :index="index"
                  />
                </div>
              </div>
            </div>

            <!-- Applications Tab (Job Seekers Only) -->
            <div v-if="activeTab === 'applications' && !isViewingOtherProfile && userProfile?.role === 'jobseeker'" class="tab-panel">
              <div class="section-card">
                <div class="section-header">
                  <h2 class="section-title">My Applications</h2>
                  <router-link to="/applications" class="view-all-link">View All →</router-link>
                </div>
                
                <div v-if="recentApplications.length === 0" class="empty-state">
                  <p>You haven't applied to any jobs yet.</p>
                  <router-link to="/" class="btn btn-primary">Browse Jobs</router-link>
                </div>
                
                <div v-else class="applications-full-list">
                  <div 
                    v-for="application in recentApplications" 
                    :key="application.id"
                    class="application-item"
                  >
                    <div class="application-main">
                      <div class="application-info">
                        <h3>{{ application.jobTitle }}</h3>
                        <p class="company-name">{{ application.company }}</p>
                        <p class="application-date">Applied {{ formatDate(application.createdAt) }}</p>
                      </div>
                      <span :class="['status-badge', application.status]">{{ application.status }}</span>
                    </div>
                    <router-link :to="`/jobs/${application.jobId}`" class="view-job-link">
                      View Job →
                    </router-link>
                  </div>
                </div>
              </div>
            </div>

            <!-- Reviews Tab -->
            <div v-if="activeTab === 'reviews' && ((isViewingOtherProfile && currentUserProfile?.role === 'employer' && viewedProfile?.role === 'jobseeker') || (!isViewingOtherProfile && currentUserProfile?.role === 'jobseeker')) && (isViewingOtherProfile ? viewedProfile?.id : currentUser?.uid)" class="tab-panel">
              <div class="section-card">
                <div class="section-header">
                  <h2 class="section-title">Reviews</h2>
                  <span v-if="currentUserProfile?.role === 'employer'" class="employer-only-badge">Employer Only</span>
                </div>
                <CandidateReviewList :candidate-id="isViewingOtherProfile ? viewedProfile.id : (currentUser?.uid || '')" />
                <!-- Form only visible to employers viewing someone else's profile -->
                <div v-if="isViewingOtherProfile && currentUserProfile?.role === 'employer'" style="margin-top: 24px;">
                  <CandidateReviewForm :candidate-id="viewedProfile.id" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Error State -->
      <div v-else class="error-state">
        <p>Profile not found.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, reactive } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { db } from '../firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import CandidateReviewForm from '../components/reviews/CandidateReviewForm.vue'
import CandidateReviewList from '../components/reviews/CandidateReviewList.vue'
import StatsOverview from '../components/StatsOverview.vue'
import AchievementCard from '../components/AchievementCard.vue'
import { BADGE_DEFINITIONS } from '../store/modules/badges.js'

export default {
  name: 'Profile',
  components: { 
    CandidateReviewForm, 
    CandidateReviewList,
    StatsOverview,
    AchievementCard
  },
  setup() {
    const store = useStore()
    const route = useRoute()
    const editing = ref(false)
    const viewedProfile = ref(null)
    const loading = ref(false)
    const badgesLoading = ref(false)
    const uploadingPhoto = ref(false)
    const savingProfile = ref(false)
    const fileInput = ref(null)
    const recentApplications = ref([])
    const uploadError = ref('')
    const saveError = ref('')
    const selectedPhoto = ref(null)
    const photoPreviewUrl = ref(null)
    const activeTab = ref('overview')
    const companyLogoInput = ref(null)
    const selectedCompanyLogo = ref(null)
    const companyLogoPreviewUrl = ref(null)
    const uploadingCompanyLogo = ref(false)
    const companyLogoUploadError = ref('')

    const currentUser = computed(() => store.getters['auth/currentUser'])
    const currentUserProfile = computed(() => store.getters['auth/userProfile'])
    
    const isViewingOtherProfile = computed(() => {
      return route.params.id && route.params.id !== currentUser.value?.uid
    })
    
    const userProfile = computed(() => {
      return isViewingOtherProfile.value ? viewedProfile.value : currentUserProfile.value
    })

    const editableFields = reactive({
      name: '',
      phone: '',
      skills: '',
      experience: '',
      company: '',
      industry: '',
      companyWebsite: '',
      companyAddress: '',
      companySize: '',
      companyDescription: '',
      companyUEN: ''
    })

    const getInitials = computed(() => {
      if (!userProfile.value?.name) return '?'
      return userProfile.value.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    })

    const getCompanyInitials = (companyName) => {
      if (!companyName) return '??'
      return companyName
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }

    const formatCompanySize = (size) => {
      if (!size) return ''
      const sizeMap = {
        '1-10': '1-10 employees',
        '11-50': '11-50 employees',
        '51-200': '51-200 employees',
        '201-500': '201-500 employees',
        '501-1000': '501-1000 employees',
        '1000+': '1000+ employees'
      }
      return sizeMap[size] || size
    }

    const tabs = computed(() => {
      const baseTabs = [{ id: 'overview', label: 'Overview' }]
      
      if (userProfile.value?.role === 'jobseeker') {
        baseTabs.push(
          { id: 'achievements', label: 'Achievements' },
          { id: 'applications', label: 'Applications' }
        )
      }
      
      // Show reviews tab if viewing candidate as employer OR viewing own profile as jobseeker
      if ((isViewingOtherProfile.value && currentUserProfile.value?.role === 'employer' && viewedProfile.value?.role === 'jobseeker') ||
          (!isViewingOtherProfile.value && currentUserProfile.value?.role === 'jobseeker')) {
        baseTabs.push({ id: 'reviews', label: 'Reviews' })
      }
      
      return baseTabs
    })

    const fetchViewedProfile = async (userId) => {
      loading.value = true
      try {
        const userDoc = await getDoc(doc(db, 'users', userId))
        if (userDoc.exists()) {
          viewedProfile.value = { id: userDoc.id, ...userDoc.data() }
        } else {
          console.error('User profile not found')
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      } finally {
        loading.value = false
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'Unknown'
      
      let date
      if (dateString.seconds) {
        date = new Date(dateString.seconds * 1000)
      } else if (dateString.toDate) {
        date = dateString.toDate()
      } else {
        date = new Date(dateString)
      }
      
      if (isNaN(date.getTime())) {
        return 'Unknown'
      }
      
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    }

    const triggerFileInput = () => {
      if (fileInput.value) {
        fileInput.value.click()
      }
    }

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (!file) return

      uploadError.value = ''

      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        uploadError.value = 'Please upload a JPG or PNG image'
        return
      }

      if (file.size > 700 * 1024) {
        uploadError.value = 'Image size must be less than 700KB'
        return
      }

      selectedPhoto.value = file
      
      if (photoPreviewUrl.value) {
        URL.revokeObjectURL(photoPreviewUrl.value)
      }
      photoPreviewUrl.value = URL.createObjectURL(file)
    }

    const startEditing = () => {
      editing.value = true
      editableFields.name = userProfile.value?.name || ''
      editableFields.phone = userProfile.value?.phone || ''
      editableFields.experience = userProfile.value?.experience || ''
      editableFields.company = userProfile.value?.company || ''
      editableFields.industry = userProfile.value?.industry || ''
      editableFields.companyWebsite = userProfile.value?.companyWebsite || ''
      editableFields.companyAddress = userProfile.value?.companyAddress || ''
      editableFields.companySize = userProfile.value?.companySize || ''
      editableFields.companyDescription = userProfile.value?.companyDescription || ''
      editableFields.companyUEN = userProfile.value?.companyUEN || ''
      
      if (userProfile.value?.skills && Array.isArray(userProfile.value.skills)) {
        editableFields.skills = userProfile.value.skills.join(', ')
      } else {
        editableFields.skills = ''
      }
    }

    const cancelEditing = () => {
      editing.value = false
      saveError.value = ''
      uploadError.value = ''
      companyLogoUploadError.value = ''
      
      selectedPhoto.value = null
      if (photoPreviewUrl.value) {
        URL.revokeObjectURL(photoPreviewUrl.value)
        photoPreviewUrl.value = null
      }
      if (fileInput.value) {
        fileInput.value.value = ''
      }
      
      selectedCompanyLogo.value = null
      if (companyLogoPreviewUrl.value) {
        URL.revokeObjectURL(companyLogoPreviewUrl.value)
        companyLogoPreviewUrl.value = null
      }
      if (companyLogoInput.value) {
        companyLogoInput.value.value = ''
      }
    }

    const removePhoto = async () => {
      if (!confirm('Are you sure you want to remove your profile picture?')) {
        return
      }

      uploadingPhoto.value = true
      uploadError.value = ''
      
      try {
        await store.dispatch('auth/removeProfilePicture')
        
        selectedPhoto.value = null
        if (photoPreviewUrl.value) {
          URL.revokeObjectURL(photoPreviewUrl.value)
          photoPreviewUrl.value = null
        }
        if (fileInput.value) {
          fileInput.value.value = ''
        }
        
        uploadError.value = ''
      } catch (error) {
        console.error('Error removing profile picture:', error)
        uploadError.value = 'Failed to remove profile picture. Please try again.'
      } finally {
        uploadingPhoto.value = false
      }
    }

    const triggerCompanyLogoInput = () => {
      if (companyLogoInput.value) {
        companyLogoInput.value.click()
      }
    }

    const handleCompanyLogoUpload = (event) => {
      const file = event.target.files[0]
      if (!file) return

      companyLogoUploadError.value = ''

      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        companyLogoUploadError.value = 'Please upload a JPG or PNG image'
        return
      }

      if (file.size > 700 * 1024) {
        companyLogoUploadError.value = 'Image size must be less than 700KB'
        return
      }

      selectedCompanyLogo.value = file
      
      if (companyLogoPreviewUrl.value) {
        URL.revokeObjectURL(companyLogoPreviewUrl.value)
      }
      companyLogoPreviewUrl.value = URL.createObjectURL(file)
    }

    const removeCompanyLogo = async () => {
      if (!confirm('Are you sure you want to remove your company logo?')) {
        return
      }

      uploadingCompanyLogo.value = true
      companyLogoUploadError.value = ''
      
      try {
        await store.dispatch('auth/removeCompanyLogo')
        
        selectedCompanyLogo.value = null
        if (companyLogoPreviewUrl.value) {
          URL.revokeObjectURL(companyLogoPreviewUrl.value)
          companyLogoPreviewUrl.value = null
        }
        if (companyLogoInput.value) {
          companyLogoInput.value.value = ''
        }
        
        companyLogoUploadError.value = ''
      } catch (error) {
        console.error('Error removing company logo:', error)
        companyLogoUploadError.value = 'Failed to remove company logo. Please try again.'
      } finally {
        uploadingCompanyLogo.value = false
      }
    }

    const saveProfile = async () => {
      saveError.value = ''
      
      if (!editableFields.name.trim()) {
        saveError.value = 'Name is required'
        return
      }

      savingProfile.value = true
      uploadingPhoto.value = false
      uploadingCompanyLogo.value = false
      
      try {
        if (selectedPhoto.value) {
          uploadingPhoto.value = true
          try {
            await store.dispatch('auth/uploadProfilePicture', selectedPhoto.value)
            selectedPhoto.value = null
            if (photoPreviewUrl.value) {
              URL.revokeObjectURL(photoPreviewUrl.value)
              photoPreviewUrl.value = null
            }
            if (fileInput.value) {
              fileInput.value.value = ''
            }
          } catch (error) {
            console.error('Error uploading profile picture:', error)
            saveError.value = 'Failed to upload profile picture. Please try again.'
            uploadingPhoto.value = false
            savingProfile.value = false
            return
          } finally {
            uploadingPhoto.value = false
          }
        }

        if (selectedCompanyLogo.value) {
          uploadingCompanyLogo.value = true
          try {
            await store.dispatch('auth/uploadCompanyLogo', selectedCompanyLogo.value)
            selectedCompanyLogo.value = null
            if (companyLogoPreviewUrl.value) {
              URL.revokeObjectURL(companyLogoPreviewUrl.value)
              companyLogoPreviewUrl.value = null
            }
            if (companyLogoInput.value) {
              companyLogoInput.value.value = ''
            }
          } catch (error) {
            console.error('Error uploading company logo:', error)
            saveError.value = 'Failed to upload company logo. Please try again.'
            uploadingCompanyLogo.value = false
            savingProfile.value = false
            return
          } finally {
            uploadingCompanyLogo.value = false
          }
        }

        const updatedData = {
          name: editableFields.name.trim(),
          phone: editableFields.phone.trim()
        }

        if (userProfile.value?.role === 'jobseeker') {
          updatedData.experience = parseInt(editableFields.experience) || 0
          updatedData.skills = editableFields.skills
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0)
        } else if (userProfile.value?.role === 'employer') {
          updatedData.company = editableFields.company.trim()
          updatedData.industry = editableFields.industry.trim()
          updatedData.companyWebsite = editableFields.companyWebsite.trim()
          updatedData.companyAddress = editableFields.companyAddress.trim()
          updatedData.companySize = editableFields.companySize
          updatedData.companyDescription = editableFields.companyDescription.trim()
          updatedData.companyUEN = editableFields.companyUEN.trim()
        }

        await store.dispatch('auth/updateProfile', updatedData)
        
        editing.value = false
        saveError.value = ''
      } catch (error) {
        console.error('Error saving profile:', error)
        saveError.value = error.message || 'Failed to save profile. Please try again.'
      } finally {
        savingProfile.value = false
        uploadingPhoto.value = false
        uploadingCompanyLogo.value = false
      }
    }

    const fetchRecentApplications = async () => {
      if (currentUser.value && !isViewingOtherProfile.value) {
        try {
          const applications = await store.dispatch(
            'applications/fetchUserApplications',
            currentUser.value.uid
          )
          recentApplications.value = applications.slice(0, 5)
        } catch (error) {
          console.error('Error fetching applications:', error)
        }
      }
    }

    const fetchBadgesAndStats = async () => {
      const userId = isViewingOtherProfile.value ? route.params.id : currentUser.value?.uid
      
      if (!userId || userProfile.value?.role !== 'jobseeker') return
      
      badgesLoading.value = true
      try {
        await store.dispatch('badges/fetchEarnedBadges', userId)
        await store.dispatch('badges/initializeUserStats', userId)
      } catch (error) {
        console.error('Error fetching badges and stats:', error)
      } finally {
        badgesLoading.value = false
      }
    }

    onMounted(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      
      if (isViewingOtherProfile.value) {
        await fetchViewedProfile(route.params.id)
      }
      
      let attempts = 0
      while (attempts < 10 && (!userProfile.value || !userProfile.value.role)) {
        await new Promise(resolve => setTimeout(resolve, 200))
        attempts++
      }
      
      await fetchBadgesAndStats()

      if (!isViewingOtherProfile.value && userProfile.value?.role === 'jobseeker') {
        await fetchRecentApplications()
      }
    })

    const earnedBadges = computed(() => store.getters['badges/earnedBadges'] || [])
    const userStats = computed(() => store.getters['badges/userStats'])

    // Map earned badges to their current icon definitions from BADGE_DEFINITIONS
    const earnedBadgesWithIcons = computed(() => {
      // Flatten all badge definitions into a single array
      const allBadgeDefs = [
        ...BADGE_DEFINITIONS.performance,
        ...BADGE_DEFINITIONS.participation,
        ...BADGE_DEFINITIONS.streak,
        ...BADGE_DEFINITIONS.winStreak,
        ...BADGE_DEFINITIONS.perfect
      ]

      // Map earned badges to use current definitions
      return earnedBadges.value.map(earnedBadge => {
        const badgeDef = allBadgeDefs.find(def => def.id === earnedBadge.badgeId)
        
        if (badgeDef) {
          return {
            id: earnedBadge.id,
            badgeId: earnedBadge.badgeId,
            name: badgeDef.name,
            description: badgeDef.description,
            icon: badgeDef.icon,
            iconType: badgeDef.iconType || 'emoji',
            tier: badgeDef.tier,
            earnedAt: earnedBadge.earnedAt
          }
        }
        
        // Fallback to stored data if definition not found
        return {
          id: earnedBadge.id,
          badgeId: earnedBadge.badgeId,
          name: earnedBadge.badgeName,
          description: earnedBadge.badgeDescription,
          icon: earnedBadge.badgeIcon,
          iconType: earnedBadge.badgeIconType || 'emoji',
          tier: earnedBadge.badgeTier,
          earnedAt: earnedBadge.earnedAt
        }
      })
    })

    return {
      editing,
      userProfile,
      currentUserProfile,
      currentUser,
      viewedProfile,
      earnedBadges,
      earnedBadgesWithIcons,
      userStats,
      getInitials,
      isViewingOtherProfile,
      loading,
      badgesLoading,
      formatDate,
      fileInput,
      uploadingPhoto,
      uploadError,
      triggerFileInput,
      handleFileUpload,
      startEditing,
      cancelEditing,
      saveProfile,
      editableFields,
      savingProfile,
      saveError,
      recentApplications,
      selectedPhoto,
      photoPreviewUrl,
      removePhoto,
      activeTab,
      tabs,
      companyLogoInput,
      companyLogoPreviewUrl,
      uploadingCompanyLogo,
      companyLogoUploadError,
      triggerCompanyLogoInput,
      handleCompanyLogoUpload,
      removeCompanyLogo,
      getCompanyInitials,
      formatCompanySize
    }
  }
}
</script>

<style scoped>
.profile-page {
  min-height: calc(100vh - 70px);
  background: var(--bg-dark);
  padding: 24px 20px;
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
}

.profile-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
  font-size: 1.1rem;
}

.error-banner {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #dc2626;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.9rem;
}

/* Profile Header */
.profile-header-card {
  background: rgba(13, 27, 53, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(74, 158, 245, 0.15);
  border-radius: 16px;
  padding: 32px;
}

.header-main {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: flex-start;
  gap: 24px;
  width: 100%;
}

@media (max-width: 768px) {
  .header-main {
    grid-template-columns: 1fr;
  }
}

.avatar-section {
  grid-column: 1;
}

.avatar-wrapper {
  position: relative;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1A6FD4 0%, #4A9EF5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 3px solid rgba(74, 158, 245, 0.3);
  box-shadow: 0 4px 20px rgba(26, 111, 212, 0.3);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
}


.avatar-actions {
  margin-top: 12px;
  text-align: center;
}

.photo-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-add-photo,
.btn-remove-photo {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-add-photo {
  background: var(--primary);
  color: white;
}

.btn-add-photo:hover:not(:disabled) {
  background: #155dc0;
  transform: translateY(-1px);
}

.btn-add-photo:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-remove-photo {
  background: transparent;
  color: var(--danger);
  border: 2px solid var(--danger);
}

.btn-remove-photo:hover:not(:disabled) {
  background: var(--danger);
  color: white;
}

.btn-remove-photo:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.header-info {
  grid-column: 2;
  min-width: 200px;
}

.name-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.name-section h1 {
  font-size: 2rem;
  color: var(--text);
  margin: 0;
  font-weight: 700;
}

.role-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-badge.jobseeker {
  background: rgba(74, 158, 245, 0.15);
  color: #4A9EF5;
  border: 1px solid rgba(74, 158, 245, 0.25);
}

.role-badge.employer {
  background: rgba(26, 111, 212, 0.15);
  color: #4A9EF5;
  border: 1px solid rgba(26, 111, 212, 0.25);
}

.subtitle {
  color: var(--text-muted);
  font-size: 1rem;
  margin: 0;
}

.header-actions {
  grid-column: 3;
  display: flex !important;
  gap: 12px;
  align-items: flex-start;
  justify-content: flex-end;
  min-width: 140px;
}

.edit-buttons {
  display: flex;
  gap: 10px;
}

.btn-edit,
.btn-save,
.btn-cancel {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  white-space: nowrap;
}

.btn-edit,
.btn-save {
  background: var(--primary, #3498db);
  color: white;
  min-width: 120px;
}

.btn-edit:hover,
.btn-save:hover:not(:disabled) {
  background: var(--primary, #2980b9);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  background: transparent;
  color: rgba(200, 220, 255, 0.8);
  border: 1px solid rgba(74, 158, 245, 0.2);
  min-width: 100px;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(74, 158, 245, 0.4);
  color: #F0F6FF;
}

.inline-error {
  color: var(--danger);
  font-size: 0.85rem;
  margin-top: 8px;
  text-align: center;
}

/* Stats Card */
.stats-card {
  background: rgba(13, 27, 53, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(74, 158, 245, 0.15);
  border-radius: 16px;
  padding: 24px;
}

/* Tabs */
.tabs-container {
  background: rgba(13, 27, 53, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(74, 158, 245, 0.15);
  border-radius: 16px;
  overflow: hidden;
}

.tabs-nav {
  display: flex;
  gap: 0;
  border-bottom: 1px solid rgba(74, 158, 245, 0.1);
  background: rgba(10, 22, 40, 0.5);
  overflow-x: auto;
}

.tab-button {
  flex: 1;
  padding: 16px 24px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: rgba(200, 220, 255, 0.6);
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  min-width: 120px;
}

.tab-button:hover {
  color: #F0F6FF;
  background: rgba(255, 255, 255, 0.04);
}

.tab-button.active {
  color: #4A9EF5;
  border-bottom-color: #4A9EF5;
  background: rgba(255, 255, 255, 0.03);
}

.tabs-content {
  padding: 24px;
}

.tab-panel {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Section Cards */
.section-card {
  background: rgba(10, 22, 40, 0.4);
  border: 1px solid rgba(74, 158, 245, 0.1);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
}

.section-title {
  font-size: 1.5rem;
  color: var(--text);
  margin-bottom: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 12px;
  flex-wrap: wrap;
}

.section-header .section-title {
  margin-bottom: 0;
}

.section-icon {
  width: 24px;
  height: 24px;
}

.view-all-link {
  color: var(--primary);
  font-weight: 600;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s;
}

.view-all-link:hover {
  color: var(--text);
}

.employer-only-badge {
  background: var(--primary);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.info-item label {
  display: block;
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-bottom: 8px;
  font-weight: 600;
}

.info-item p {
  color: var(--text);
  font-size: 1rem;
}

.readonly-field {
  color: var(--text-muted);
  font-style: italic;
}

.edit-input,
.edit-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(74, 158, 245, 0.2);
  border-radius: 8px;
  font-size: 1rem;
  color: #F0F6FF;
  background: rgba(13, 27, 53, 0.6);
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.edit-input:focus,
.edit-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.edit-textarea {
  font-family: inherit;
  resize: vertical;
}

.help-text {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-top: 8px;
}

/* Skills */
.skills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.skill-tag {
  background: rgba(26, 111, 212, 0.1);
  color: #4A9EF5;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.95rem;
  border: 1px solid rgba(74, 158, 245, 0.2);
}

.empty-text {
  color: var(--text-muted);
  font-style: italic;
}

/* Overview Grid */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

/* Applications Preview */
.applications-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.application-preview-item {
  padding: 16px;
  background: rgba(10, 22, 40, 0.4);
  border: 1px solid rgba(74, 158, 245, 0.1);
  border-radius: 8px;
  transition: all 0.2s;
}

.application-preview-item:hover {
  border-color: rgba(74, 158, 245, 0.3);
  transform: translateY(-2px);
}

.preview-main h3 {
  font-size: 1rem;
  color: var(--text);
  margin-bottom: 4px;
}

.preview-company {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-bottom: 8px;
}

.status-badge-small {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge-small.pending {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.status-badge-small.accepted {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.status-badge-small.rejected {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

/* Applications Full List */
.applications-full-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.application-item {
  background: rgba(10, 22, 40, 0.4);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(74, 158, 245, 0.1);
  transition: all 0.2s;
}

.application-item:hover {
  border-color: rgba(74, 158, 245, 0.3);
  transform: translateY(-2px);
}

.application-main {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 12px;
  gap: 16px;
}

.application-info h3 {
  font-size: 1.2rem;
  color: var(--text);
  margin-bottom: 5px;
}

.company-name {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin-bottom: 3px;
}

.application-date {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.status-badge {
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: capitalize;
  flex-shrink: 0;
}

.status-badge.pending {
  background: var(--warning);
  color: var(--text);
}

.status-badge.accepted {
  background: var(--success);
  color: white;
}

.status-badge.rejected {
  background: var(--danger);
  color: white;
}

.view-job-link {
  color: var(--primary);
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.3s;
}

.view-job-link:hover {
  color: var(--text);
}

/* Badges */
.badges-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
}

@media (min-width: 768px) {
  .badges-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .badges-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.empty-badges {
  text-align: center;
  padding: 60px 20px;
}

.empty-badges p {
  color: var(--text);
  font-size: 1.2rem;
  margin-bottom: 10px;
}

.empty-subtitle {
  color: var(--text-muted);
  font-size: 1rem;
  margin-bottom: 20px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-state p {
  color: var(--text-muted);
  margin-bottom: 20px;
}

.info-note {
  color: var(--text-muted);
  margin-bottom: 20px;
}

/* Company Logo Section */
.company-logo-section {
  margin-bottom: 24px;
}

.company-logo-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.company-logo {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 3px solid var(--bg-light);
  box-shadow: var(--shadow-md);
}

.company-logo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.company-logo-initials {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
}

.company-logo-actions {
  text-align: center;
}

.logo-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-add-logo,
.btn-remove-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-add-logo {
  background: var(--primary);
  color: white;
}

.btn-add-logo:hover:not(:disabled) {
  background: oklch(0.35 0.1 245);
  transform: translateY(-1px);
}

.btn-add-logo:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-remove-logo {
  background: transparent;
  color: var(--danger);
  border: 2px solid var(--danger);
}

.btn-remove-logo:hover:not(:disabled) {
  background: var(--danger);
  color: white;
}

.btn-remove-logo:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.website-link {
  color: var(--primary);
  text-decoration: none;
  word-break: break-all;
}

.website-link:hover {
  text-decoration: underline;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

@media (max-width: 768px) {
  .profile-page {
    padding: 16px;
  }

  .tabs-nav {
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .tab-button {
    min-width: 100px;
    padding: 12px 16px;
    font-size: 0.85rem;
  }

  .tabs-content {
    padding: 16px;
  }

  .overview-grid {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .section-card {
    padding: 20px;
  }

}
</style>
