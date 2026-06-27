import { createStore } from 'vuex'
import auth from './modules/auth'
import jobs from './modules/jobs'
import chat from './modules/chat'
import chatAbly from './modules/chatAbly'
import quizzes from './modules/quizzes'
import applications from './modules/applications'
import badges from './modules/badges'
import reviews from './modules/reviews'

export default createStore({
  modules: {
    auth,
    jobs,
    chat,
    chatAbly,
    quizzes,
    applications,
    badges,
    reviews
  }
})

