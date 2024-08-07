<template>
  <div :class="['login-page min-h-screen flex items-center justify-center p-4 md:p-8 lg:p-12', { 'dark-mode': isDarkMode }]">
    <div class="w-full max-w-md p-5">
      <div class="bg-custom rounded-lg shadow-lg p-6 animate__animated animate__fadeInDown">
        <img
          src="@/assets/newlogo.jpg"
          alt="Logo"
          class="w-24 h-24 mx-auto mb-2 rounded-full border-black border animate__animated animate__bounceIn"
        />
        <p class="tagline text-center mb-6 text-gray-700 animate__animated animate__fadeIn">
          Get Lost In a Good Book
        </p>
        <h1
          class="text-2xl text-center font-semibold mb-6 text-gray-800 animate__animated animate__fadeIn"
        >
          Login
        </h1>
        <p class="text-center mb-6 text-gray-500">Welcome onboard with us!</p>
        <form @submit.prevent="performLogin" class="space-y-4 animate__animated animate__fadeInUp">
          <div class="mb-4">
            <label for="email" class="block text-gray-700 font-medium mb-2">Email address</label>
            <input
              type="email"
              id="email"
              v-model="email"
              required
              class="input-animated w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
            />
          </div>
          <div class="mb-4">
            <label for="password" class="block text-gray-700 font-medium mb-2">Password</label>
            <input
              type="password"
              id="password"
              v-model="password"
              @keyup="checkCapsLock"
              required
              class="input-animated w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
            />
            <p v-if="isCapsLockOn" class="text-red-500 text-sm mt-2">Caps Lock is on</p>
          </div>
          <div class="flex items-center justify-between">
            <label class="flex items-center">
              <input type="checkbox" v-model="rememberMe" class="form-checkbox">
              <span class="ml-2 text-gray-700">Remember Me</span>
            </label>
            <a href="#" class="text-sm text-gray-500 hover:underline">Forgot Password?</a>
          </div>
          <button
            type="submit"
            class="w-full bg-signup-button text-white py-2 rounded-lg hover:bg-signup-button-hover transition duration-200 transform hover:scale-105"
          >
            Login
          </button>
          <div class="social-login-buttons flex flex-col space-y-2 mt-4">
            <button @click="socialLogin('google')" class="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition duration-200">
              Login with Google
            </button>
            <button @click="socialLogin('facebook')" class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200">
              Login with Facebook
            </button>
          </div>
          <p class="mt-4 text-center text-gray-600">
            New to Bookworm?
            <router-link to="/signup" class="text-login-link hover:underline">Register Here</router-link>
          </p>
        </form>
        <div v-if="isLoading" class="loading-overlay">
          <div class="spinner"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Swal from 'sweetalert2'
import '../assets/tailwind.css'
import 'animate.css'

export default {
  name: 'LoginPage',
  setup() {
    const email = ref('')
    const password = ref('')
    const rememberMe = ref(false)
    const isCapsLockOn = ref(false)
    const isLoading = ref(false)
    const isDarkMode = ref(false)
    const router = useRouter()
    const store = useStore()

    const performLogin = async () => {
      isLoading.value = true
      const success = await store.dispatch('login', {
        email: email.value,
        password: password.value,
        rememberMe: rememberMe.value
      })
      isLoading.value = false
      if (success) {
        Swal.fire('Success', 'Login successful', 'success')
        const currentUser = store.getters.currentUser
        if (currentUser.isAdmin) {
          router.push('/admin')
        } else {
          router.push('/userdashboard')
        }
      } else {
        Swal.fire('Error', store.state.error || 'Login failed', 'error')
      }
    }

    const checkCapsLock = (event) => {
      isCapsLockOn.value = event.getModifierState('CapsLock')
    }

    const socialLogin = (provider) => {
      // Implement social login logic here
      Swal.fire('Coming Soon', `Social login with ${provider} is coming soon!`, 'info')
    }

    const toggleDarkMode = () => {
      isDarkMode.value = !isDarkMode.value
    }

    return {
      email,
      password,
      rememberMe,
      isCapsLockOn,
      isLoading,
      performLogin,
      checkCapsLock,
      socialLogin,
      toggleDarkMode,
      isDarkMode
    }
  }
}
</script>

<style scoped>
.login-page {
  background-image: url('@/assets/bgimage.jpg');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-custom {
  background-color: #f2f1eb;
  padding: 1.5rem;
}

.bg-signup-button {
  background-color: #1a5319;
}

.bg-signup-button-hover {
  background-color: #144213;
}

.text-login-link {
  color: #1a5319;
}

.tagline {
  font-family: 'Dancing Script', cursive;
  font-size: 1.5rem;
}

img {
  border: 2px solid black;
}

.input-animated {
  transition: all 0.3s ease-in-out;
}

.input-animated:focus {
  transform: scale(1.05);
  border-color: #007bff;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.spinner {
  border: 8px solid rgba(255, 255, 255, 0.3);
  border-left-color: #ffffff;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 1024px) {
  .login-page {
    padding: 2rem;
  }
  .bg-custom {
    padding: 2rem;
  }
  .tagline {
    font-size: 1.25rem;
  }
  .w-24 {
    width: 6rem;
    height: 6rem;
  }
  h1 {
    font-size: 1.75rem;
  }
  button {
    padding: 1rem 1.5rem;
  }
}

@media (max-width: 640px) {
  .login-page {
    padding: 1rem;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
  }
  .bg-custom {
    padding: 1rem;
  }
  .tagline {
    font-size: 1rem;
  }
  .w-24 {
    width: 5rem;
    height: 5rem;
  }
  h1 {
    font-size: 1.5rem;
  }
  button {
    padding: 0.75rem 1.25rem;
  }
  .input-animated {
    font-size: 0.875rem;
  }
}

/* Dark Mode Styles */
.dark-mode {
  background-color: #1a202c;
  color: #cbd5e0;
}

.dark-mode .bg-custom {
  background-color: #2d3748;
  color: #e2e8f0;
}

.dark-mode input {
  background-color: #2d3748;
  border-color: #4a5568;
  color: #e2e8f0;
}

.dark-mode input:focus {
  border-color: #63b3ed;
}

.dark-mode .text-login-link {
  color: #63b3ed;
}

.dark-mode .bg-signup-button {
  background-color: #2b6cb0;
}

.dark-mode .bg-signup-button-hover {
  background-color: #2c5282;
}

.dark-mode .tagline {
  color: #e2e8f0;
}

.dark-mode img {
  border-color: #e2e8f0;
}
</style>
