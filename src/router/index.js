import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../firebase/config'

import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import CompanyReviews from '../views/CompanyReviews.vue'
import JobDetails from '../views/JobDetails.vue'
import EmployerDashboard from '../views/EmployerDashboard.vue'
import Profile from '../views/Profile.vue'
import PostJob from '../views/PostJob.vue'
import ChatAbly from '../views/ChatAbly.vue'
import Quizzes from '../views/Quizzes.vue'
import QuizTake from '../views/QuizTake.vue'
import SpellingQuiz from '../views/SpellingQuiz.vue'
import Applications from '../views/Applications.vue'
import Candidates from '../views/Candidates.vue'
import Achievements from '../views/Achievements.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: false }
  },
  {
    path: '/browse-jobs',
    name: 'BrowseJobs',
    component: () => import('../views/BrowseJobs.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false }
  },
  {
    path: '/reviews',
    name: 'CompanyReviews',
    component: CompanyReviews,
    meta: { requiresAuth: false }
  },
  {
    path: '/jobs/:id',
    name: 'JobDetails',
    component: JobDetails,
    meta: { requiresAuth: false }
  },
  {
    path: '/employer/dashboard',
    name: 'EmployerDashboard',
    component: EmployerDashboard,
    meta: { requiresAuth: true, role: 'employer' }
  },
  {
    path: '/profile/:id?',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/employer/post-job',
    name: 'PostJob',
    component: PostJob,
    meta: { requiresAuth: true, role: 'employer' }
  },
  {
    path: '/chat/:chatId?',
    name: 'Chat',
    component: ChatAbly,
    meta: { requiresAuth: true }
  },
  {
    path: '/quizzes',
    name: 'Quizzes',
    component: Quizzes,
    meta: { requiresAuth: true, role: 'jobseeker' }
  },
  {
    path: '/quiz-take/:id',
    name: 'QuizTake',
    component: QuizTake,
    meta: { requiresAuth: true, role: 'jobseeker' }
  },
  {
    path: '/spelling-quiz',
    name: 'SpellingQuiz',
    component: SpellingQuiz,
    meta: { requiresAuth: true, role: 'jobseeker' }
  },
  {
    path: '/applications',
    name: 'Applications',
    component: Applications,
    meta: { requiresAuth: true, role: 'jobseeker' }
  },
  {
    path: '/applications/:id',
    name: 'ApplicationDetails',
    component: () => import('../views/ApplicationDetails.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/employer/applications',
    name: 'AllApplications',
    component: () => import('../views/AllApplications.vue'),
    meta: { requiresAuth: true, role: 'employer' }
  },
  {
    path: '/candidates',
    name: 'Candidates',
    component: Candidates,
    meta: { requiresAuth: true, role: 'employer' }
  },
  {
    path: '/achievements',
    name: 'Achievements',
    component: Achievements,
    meta: { requiresAuth: true, role: 'jobseeker' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      unsubscribe()
      
      if (requiresAuth && !user) {
        next('/login')
        resolve()
      } else if (to.path === '/' && user) {
       
        try {
          const userDoc = await user.getIdTokenResult()
          const role = userDoc.claims.role
          
          if (role === 'employer') {
            next('/employer/dashboard')
          } else if (role === 'jobseeker') {
            next('/')
          } else {
            next()
          }
        } catch (error) {
          console.error('Error getting user role:', error)
          next()
        }
        resolve()
      } else {
        next()
        resolve()
      }
    })
  })
})

export default router

