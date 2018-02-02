import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: null,
    token: null,
    isLoggedIn: false
  },
  getters: {
    isLoggedIn (store) {
      return store.isLoggedIn
    },
    user (store) {
      return store.user
    },
    token (store) {
      return store.token
    }
  },
  mutations: {
    saveCurrentUser (state, user) {
      state.user = user
      state.isLoggedIn = true
    },
    saveToken (state, token) {
      state.token = token
    },
    logout (state) {
      state.user = null
      state.token = null
      state.isLoggedIn = false
    }
  }
})
