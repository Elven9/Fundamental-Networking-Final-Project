import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import moment from 'moment'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
const lodash = require('lodash');

Vue.config.productionTip = false;

Vue.prototype.$moment = moment;
Vue.prototype.$axios = axios;
Vue.prototype._ = lodash;

Vue.use(ElementUI);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
