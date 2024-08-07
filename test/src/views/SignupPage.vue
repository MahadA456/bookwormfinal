<template>
  <div :class="['signup-page min-h-screen flex items-center justify-center p-4 md:p-8 lg:p-12', { 'dark-mode': isDarkMode }]">
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
          Sign Up
        </h1>
        <form @submit.prevent="performSignup" class="space-y-4 animate__animated animate__fadeInUp">
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
              @input="checkPasswordStrength"
              required
              class="input-animated w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
            />
            <p v-if="isCapsLockOn" class="text-red-500 text-sm mt-2">Caps Lock is on</p>
            <p :class="passwordStrengthClass">{{ passwordStrengthMessage }}</p>
          </div>
          <div class="mb-4">
            <label for="confirmPassword" class="block text-gray-700 font-medium mb-2">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              v-model="confirmPassword"
              @keyup="checkCapsLock"
              required
              class="input-animated w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
            />
            <p v-if="isCapsLockOn" class="text-red-500 text-sm mt-2">Caps Lock is on</p>
          </div>
          <div v-if="errorShow" class="error">{{ errorMsg }}</div>
          <button
            type="submit"
            class="w-full bg-signup-button text-white py-2 rounded-lg hover:bg-signup-button-hover transition duration-200 transform hover:scale-105"
          >
            Sign Up
          </button>
          <p class="mt-4 text-center text-gray-600">
            Already have an account?
            <router-link to="/login" class="text-signup-link hover:underline">
              Login Here
            </router-link>
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
import Swal from 'sweetalert2'
import { useStore } from 'vuex'

export default {
  name: 'SignupPage',
  setup() {
    const router = useRouter()
    const store = useStore()
    const email = ref('')
    const password = ref('')
    const confirmPassword = ref('')
    const isCapsLockOn = ref(false)
    const errorMsg = ref('')
    const errorShow = ref(false)
    const isLoading = ref(false)
    const isDarkMode = ref(false)
    const passwordStrengthMessage = ref('')
    const passwordStrengthClass = ref('')

    const performSignup = async () => {
      if (password.value !== confirmPassword.value) {
        errorMsg.value = 'Passwords do not match'
        errorShow.value = true
        return
      }

      try {
        isLoading.value = true
        await store.dispatch('registerUser', { email: email.value, password: password.value })
        isLoading.value = false
        Swal.fire('Success', 'Signup successful. Please login.', 'success')
        router.push('/login')
      } catch (error) {
        isLoading.value = false
        errorMsg.value = error.message
        errorShow.value = true
        Swal.fire('Error', error.message, 'error')
      }
    }

    const checkCapsLock = (event) => {
      isCapsLockOn.value = event.getModifierState('CapsLock')
    }

    const checkPasswordStrength = () => {
      const strength = getPasswordStrength(password.value)
      passwordStrengthMessage.value = strength.message
      passwordStrengthClass.value = strength.class
    }

    const getPasswordStrength = (password) => {
      let strength = { message: 'Weak', class: 'text-red-500' }
      if (password.length >= 8) {
        strength = { message: 'Medium', class: 'text-yellow-500' }
      }
      if (password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
        strength = { message: 'Strong', class: 'text-green-500' }
      }
      return strength
    }

    const toggleDarkMode = () => {
      isDarkMode.value = !isDarkMode.value
    }

    return {
      email,
      password,
      confirmPassword,
      isCapsLockOn,
      errorMsg,
      errorShow,
      isLoading,
      performSignup,
      checkCapsLock,
      passwordStrengthMessage,
      passwordStrengthClass,
      toggleDarkMode,
      isDarkMode
    }
  }
}
</script>

<style scoped>
.signup-page {
  background-image: url('@/assets/bgimage.jpg');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  color: #fff; /* Ensure text is visible on dark backgrounds */
}

.bg-custom {
  background-color: #f2f1eb;
}

.bg-signup-button {
  background-color: #1a5319;
}

.bg-signup-button-hover {
  background-color: #144213;
}

.text-signup-link {
  color: #1a5319;
}

.tagline {
  font-family: 'Dancing Script', cursive;
  font-size: 1.25rem;
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

@media (max-width: 640px) {
  .signup-page {
    padding: 1rem;
  }
  .bg-custom {
    padding: 2rem 1rem;
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
    padding: 0.75rem 1rem;
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

.dark-mode .text-signup-link {
  color: #63b3ed;
}

.dark-mode .bg-signup-button {
  background-color: #2d3748;
}

.dark-mode .bg-signup-button-hover {
  background-color: #4a5568;
}
</style>
