import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import LoginPage from '../views/LoginPage.vue';
import SignupPage from '../views/SignupPage.vue';
import AdminDashboard from '../views/AdminDashboard.vue';
import UserDashboard from '../views/UserDashboard.vue'; // Import UserDashboard
import ChatBot from '../views/userChatbot.vue'; // Import ChatBot
import store from '../store'; // Import Vuex store for checking authentication

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresUnauth: true } // Only accessible if not authenticated
  },
  {
    path: '/signup',
    name: 'Signup',
    component: SignupPage,
    meta: { requiresUnauth: true } // Only accessible if not authenticated
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, isAdmin: true } // Requires user to be authenticated and admin
  },
  {
    path: '/userdashboard',
    name: 'UserDashboard',
    component: UserDashboard,
    meta: { requiresAuth: true, isAdmin: false } // Requires user to be authenticated and not admin
  },
  {
    path: '/chatBot',
    name: 'ChatBot',
    component: ChatBot,
    meta: { requiresAuth: true } // Requires user to be authenticated
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guards to check authentication and authorization
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters.isAuthenticated;
  const currentUser = store.getters.currentUser;

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next({ name: 'Login' });
    } else if (to.matched.some(record => record.meta.isAdmin) && !currentUser.isAdmin) {
      next({ name: 'UserDashboard' });
    } else {
      next();
    }
  } else if (to.matched.some(record => record.meta.requiresUnauth) && isAuthenticated) {
    next({ name: currentUser.isAdmin ? 'AdminDashboard' : 'UserDashboard' });
  } else {
    next();
  }
});

export default router;
