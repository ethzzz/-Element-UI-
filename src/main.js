import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 引用全局css文件
import './assets/css/global.css'
import TreeTable from  'vue-table-with-tree-grid'

// 引用axios
import axios from 'axios'
// 配置请求的根路径
axios.defaults.baseURL='http://timemeetyou.com:8889/api/private/v1/'
axios.interceptors.request.use(config=>{
  console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token');
  // 最后必须 return config
  return config
})
Vue.prototype.$http=axios

Vue.component('tree-table',TreeTable)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
