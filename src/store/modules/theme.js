const state = {
  isDarkMode: false
}

const getters = {
  isDarkMode: (state) => state.isDarkMode
}

const mutations = {
  SET_DARK_MODE(state, value) {
    state.isDarkMode = value
    if (value) {
      document.documentElement.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
    }
  }
}

const actions = {
  setDarkMode({ commit }, value) {
    commit('SET_DARK_MODE', value)
    localStorage.setItem('darkMode', value.toString())
  },
  
  toggleDarkMode({ commit, state }) {
    const newValue = !state.isDarkMode
    commit('SET_DARK_MODE', newValue)
    localStorage.setItem('darkMode', newValue.toString())
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}