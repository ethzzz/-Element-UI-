import Vue from 'vue'
import App from './App.vue'
import router from './router'
// import './plugins/element.js'
// 引用全局css文件
import './assets/css/global.css'
import TreeTable from 'vue-table-with-tree-grid'

// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'


// 导入Nprogress所需要的js包和css包
import Nprogress from 'nprogress'


// 引用axios
import axios from 'axios'
// 配置请求的根路径
axios.defaults.baseURL = 'http://timemeetyou.com:8889/api/private/v1/'
// 在request拦截器中，展示进度条 Nprogress.start()
axios.interceptors.request.use(config => {
  Nprogress.start()
  // console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token');
  // 最后必须 return config
  return config
})
// 在response拦截器中，隐藏进度条 Nprogress.done()
axios.interceptors.response.use(config=>{
  Nprogress.done()
  return config
})
Vue.prototype.$http = axios

Vue.component('tree-table', TreeTable)

Vue.use(VueQuillEditor)

Vue.config.productionTip = false

Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal * 1000);

  const y = dt.getFullYear();
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')


  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')