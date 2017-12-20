import Vue from 'vue'
import Router from 'vue-router'
import Categories from '@/components/Categories'
import Domenu from '@/components/domenu'

Vue.use(Router)


export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/categories',
      name: 'Categories',
      component: Categories
    },
    {
      path: '/categories/:site_id',
      name: 'Domenu',
      component: Domenu
    }
  ]
})
