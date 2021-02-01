import Vue from 'vue'
import VueScrollTo from 'vue-scrollto'
import { BootstrapVue } from 'bootstrap-vue'
import App from './App.vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.config.productionTip = false

Vue.use(VueScrollTo)
Vue.use(BootstrapVue)

new Vue({
  render: h => h(App),
}).$mount('#app')
