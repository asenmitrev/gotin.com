// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import VueToastr from '@deveodk/vue-toastr'
import router from './router'

import '@deveodk/vue-toastr/dist/@deveodk/vue-toastr.css'
import './assets/styles/main.scss'

import store from './store'
import localStorageMixin from './components/mixins/local-storage'
import apiService from './components/mixins/api-service'

Vue.use(VueToastr, {
  defaultPosition: 'toast-top-right',
  defaultType: 'success',
  defaultTimeout: 2000
})
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  mixins: [localStorageMixin],
  components: { App },
  created () {
    if (this.getJson('currentUser')) {
      var token = this.getData('authToken')
      apiService.defaults.headers.common['x-access-token'] = token
      apiService.get('verifytoken')
        .then((response) => {
          this.$store.commit('saveCurrentUser', response.data.user)
          this.setJson('currentUser', response.data.user)
          this.$store.commit('saveToken', token)
        })
        .catch(() => {
          this.removeFromStorage('currentUser')
          this.removeFromStorage('authToken')
          this.$store.commit('logout')
        })
    }
  },
  template: '<App/>'
})
