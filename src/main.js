import './assets/main.css'
import '@fortawesome/fontawesome-free/css/all.min.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import axios from 'axios'
import Home from './components/Home.vue'
import Login from './components/Login.vue'
import Relatorio from './components/Relatorio.vue'
import Receitas from './components/Receitas.vue'
import Metas from './components/Metas.vue'
import Register from './components/Register.vue'
import LandingPage from './components/LandingPage.vue'
import Perfil from './components/Perfil.vue'
import Patrimonio from './components/Patrimonio.vue'

// Configure Axios
axios.defaults.baseURL = 'http://localhost:8000'

// Add a request interceptor to include auth token in all requests
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken')
    const tokenType = localStorage.getItem('tokenType') || 'Bearer'
    
    if (token) {
      config.headers.Authorization = `${tokenType} ${token}`
    }
    
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

const routes = [
  { path: '/', component: LandingPage },
  { path: '/login', component: Login },
  { 
    path: '/home', 
    component: Home,
    meta: { requiresAuth: true }
  },
  { 
    path: '/relatorio', 
    component: Relatorio,
    meta: { requiresAuth: true }
  },
  { 
    path: '/receitas', 
    component: Receitas,
    meta: { requiresAuth: true }
  },
  { 
    path: '/metas', 
    component: Metas,
    meta: { requiresAuth: true }
  },
  { 
    path: '/perfil', 
    component: Perfil,
    meta: { requiresAuth: true }
  },
  { path: '/register', component: Register },
  {
    path: '/patrimonio',
    component: Patrimonio,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Add a response interceptor to handle token expiration
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('accessToken')
      localStorage.removeItem('tokenType')
      localStorage.removeItem('userInfo')
      
      // Redirect to login page
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

// Navigation guard to check authentication
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('accessToken')
  
  // If route requires auth and user is not authenticated
  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next('/login')
  } else {
    // If user is authenticated and going to login page, redirect to home
    if (isAuthenticated && (to.path === '/login' || to.path === '/register')) {
      next('/home')
    } else {
      next()
    }
  }
})

const app = createApp(App)
app.use(router)
app.mount('#app')
