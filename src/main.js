// 忽略這個

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import moment from 'moment'

Vue.config.productionTip = false;

const service = axios.create({
});

Vue.prototype.$moment = moment;
Vue.prototype.$axios = service;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
