import Vue from 'vue'

export default {
  '/': {
    component: Vue.component('index', require('./components/index')),
    name: 'index'
  },
  '/drop': {
    component: Vue.component('drop', require('./components/drop')),
    name: 'drop'
  }
}
