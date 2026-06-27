import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error('Unauthorized access')
          break
        case 403:
          console.error('Access forbidden')
          break
        case 404:
          console.error('Resource not found')
          break
        case 500:
          console.error('Server error')
          break
        default:
          console.error('An error occurred:', error.response.data)
      }
    } else if (error.request) {
      console.error('No response from server')
    } else {
      console.error('Error:', error.message)
    }
    return Promise.reject(error)
  }
)

export const quizApi = {
  generateQuiz: (data) => api.post('/api/quizzes/generate', data),
  getQuizzes: () => api.get('/api/quizzes'),
  getQuizById: (id) => api.get(`/api/quizzes/${id}`),
  submitQuizResult: (data) => api.post('/api/quizzes/results', data),
  generateConstructionSpellingWord: (data) => api.post('/api/construction-spelling/generate', data),
  generateSpellingQuiz: (data) => api.post('/api/spelling-quiz/generate', data),
  getSpellingQuizzes: () => api.get('/api/spelling-quizzes'),
  getSpellingQuizById: (id) => api.get(`/api/spelling-quizzes/${id}`)
}

export const jobApi = {
  getJobs: (params) => api.get('/api/jobs', { params }),
  getJobById: (id) => api.get(`/api/jobs/${id}`),
  createJob: (data) => api.post('/api/jobs', data),
  updateJob: (id, data) => api.put(`/api/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/api/jobs/${id}`)
}

export const userApi = {
  getProfile: (id) => api.get(`/api/users/${id}`),
  updateProfile: (id, data) => api.put(`/api/users/${id}`, data),
  searchUsers: (params) => api.get('/api/users/search', { params })
}

export default api

