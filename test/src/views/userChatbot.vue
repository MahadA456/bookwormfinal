<template>
  <div :class="['chat-container min-h-screen flex flex-col', { 'dark-mode': isDarkMode }]">
    <!-- Header -->
    <header
      :class="[
        'w-full shadow-lg p-4 flex flex-col lg:flex-row justify-between items-center sidebar-bg',
        { 'dark-mode-sidebar': isDarkMode }
      ]"
    >
      <div class="flex items-center mb-4 lg:mb-0">
        <img
          src="@/assets/newlogo.jpg"
          alt="Logo"
          class="w-16 h-16 lg:w-24 lg:h-24 rounded-full border-black border"
        />
        <h2
          :class="[
            'text-center text-lg font-semibold ml-4',
            { 'text-white': !isDarkMode, 'text-gray-200': isDarkMode }
          ]"
        >
          Book Worm Chat
        </h2>
      </div>
      <div class="flex flex-wrap justify-center lg:justify-end space-x-2">
        <select v-model="geminiOptions" class="btn transparent-btn mb-2 lg:mb-0">
          <option disabled value="">Please select one</option>
          <option value="text">Text</option>
          <option value="textImage">Text and Image</option>
          <option disabled>Chat (coming soon...)</option>
        </select>
        <button @click="toggleDarkMode" class="btn transparent-btn mb-2 lg:mb-0">Toggle Dark Mode</button>
        <button @click="goToDashboard" class="btn transparent-btn mb-2 lg:mb-0">Dashboard</button>
        <button @click="logout" class="btn transparent-btn mb-2 lg:mb-0">Logout</button>
      </div>
    </header>

    <!-- Main Chat Section -->
    <main
      :class="[
        'flex-1 w-full p-4 lg:p-6 flex flex-col items-center bg-main-content',
        { 'dark-mode-main': isDarkMode }
      ]"
    >
      <div class="chat-box w-full lg:w-3/4 flex-1">
        <div v-for="(message, index) in messages" :key="index" :class="['message', message.type]">
          <p>{{ message.text }}</p>
        </div>
        <div v-if="isTyping" class="typing-indicator">Typing...</div>
      </div>
      <div class="input-box w-full lg:w-3/4 flex mt-4 relative">
        <input
          v-model="userMessage"
          @input="onInput"
          @keyup.enter="sendMessage"
          placeholder="Type a message..."
          class="flex-1 px-4 py-2 border rounded-lg shadow-sm"
        />
        <button @click="sendMessage" class="btn btn-blue ml-2">Send</button>
        <button @click="toggleEmojiPicker" class="btn btn-blue ml-2">😊</button>
        <div v-show="showEmojiPicker" class="emoji-picker-wrapper">
          <emoji-picker @emoji-click="addEmoji"></emoji-picker>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { GoogleGenerativeAI } from '@google/generative-ai'
import store from '../store'
import 'emoji-picker-element' // Import the emoji picker element

const API_KEY = 'AIzaSyBnNGVDrqqfNoXbDz4lmOMytqMYoedcTSc' // Replace with your actual API key
const genAI = new GoogleGenerativeAI(API_KEY)

export default {
  name: 'UserChatbot',
  setup() {
    const router = useRouter()
    const geminiOptions = ref('text')
    const userMessage = ref('')
    const messages = ref([])
    const isDarkMode = ref(false)
    const isTyping = ref(false)
    const showEmojiPicker = ref(false)

    const sendMessage = async () => {
      if (userMessage.value.trim() === '') return

      const timestamp = new Date().toLocaleString()
      messages.value.push({ type: 'user', text: userMessage.value, timestamp })
      isTyping.value = true

      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-pro',
        systemInstruction: `
          Welcome to Book Worm! How can I assist you today? Here are some things I can help you with:
          View and Filter Books:
          "Show me all books."
          "Filter books by genre [Fiction, Non-fiction, Science Fiction, Fantasy, Mystery, Biography]."
          "Show books by the author [author name]."
          Book Details:
          "Show details for [book title]."
          "What are the books written by [author name]?"
          User Actions:
          "Add a new book." (Follow-up questions: title, author, year, genre, book URL, and cover image)
          "Edit details of [book title]."
          "Delete the book [book title]."
          Account Management:
          "Log out."
          "Toggle dark mode."
          Examples:
          "Show me all books in the Fiction genre."
          "What are the details for 'In the Line of Fire'?"
          "Add a new book to the collection."
          "Filter books by the author 'Lewis Carroll'."
          Feel free to ask me anything related to managing your book collection or using the Book Worm dashboard!
        `
      })

      const chatSession = model.startChat({
        generationConfig: {
          temperature: 1,
          topP: 0.95,
          topK: 64,
          maxOutputTokens: 8192,
          responseMimeType: 'text/plain'
        },
        history: messages.value.map((msg) => ({
          role: msg.type === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }))
      })

      const result = await chatSession.sendMessage(userMessage.value)
      const response = await result.response
      const text = await response.text()

      messages.value.push({ type: 'model', text, timestamp: new Date().toLocaleString() })

      userMessage.value = ''
      isTyping.value = false
    }

    const onInput = () => {
      isTyping.value = true
      clearTimeout(typingTimeout)
      typingTimeout = setTimeout(() => {
        isTyping.value = false
      }, 1000) // Stops showing "typing" after 1 second of inactivity
    }

    const addEmoji = (event) => {
      userMessage.value += event.detail.unicode
    }

    const toggleEmojiPicker = () => {
      showEmojiPicker.value = !showEmojiPicker.value
    }

    const toggleDarkMode = () => {
      isDarkMode.value = !isDarkMode.value
    }

    const goToDashboard = () => {
      router.push('/userdashboard')
    }

    const logout = () => {
      store.dispatch('logout').then(() => {
        router.push('/login')
      })
    }

    let typingTimeout

    return {
      geminiOptions,
      userMessage,
      messages,
      isDarkMode,
      isTyping,
      sendMessage,
      onInput,
      addEmoji,
      toggleDarkMode,
      goToDashboard,
      logout,
      showEmojiPicker,
      toggleEmojiPicker
    }
  }
}
</script>

<style scoped>
.chat-container {
  background-image: url('@/assets/bgimage.jpg');
  background-size: cover;
  background-position: center;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sidebar-bg {
  background: linear-gradient(135deg, #1a5319, #144213, #0275d8, #6c757d);
  background-size: 400% 400%;
  animation: gradientAnimation 10s ease infinite;
  color: white;
}

.bg-main-content {
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
  width: 100%;
  height: 100%;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  text-align: center;
  width: auto;
  transition: transform 0.2s ease;
}

.btn:hover {
  transform: scale(1.05);
}

.btn-blue {
  background-color: #0275d8;
  color: white;
}

.btn-blue:hover {
  background-color: #025aa5;
}

.transparent-btn {
  background-color: transparent;
  border: 2px solid #03c03c;
  color: #03c03c;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.transparent-btn:hover {
  background-color: #03c03c;
  color: white;
}

@media (max-width: 1024px) {
  .chat-container {
    padding: 1rem;
  }
  .chat-box {
    max-height: 300px;
  }
  .input-box {
    flex-direction: column;
  }
  input {
    width: 100%;
    margin-bottom: 10px;
  }
  button {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .chat-container {
    padding: 0.5rem;
  }
  .w-16 {
    width: 60px;
    height: 60px;
  }
  .w-24 {
    width: 80px;
    height: 80px;
  }
  .btn {
    width: 100%;
  }
}

.dark-mode {
  background-color: #1a202c;
  color: #cbd5e0;
}

.dark-mode .bg-main-content {
  background-color: rgba(18, 18, 18, 0.8);
  backdrop-filter: blur(5px);
}

.dark-mode-sidebar {
  background: linear-gradient(135deg, #2d3748, #1a202c);
  color: #cbd5e0;
}

.dark-mode .message.model {
  background-color: #2d3748; /* Dark background for messages */
  color: #e2e8f0; /* Light text color for better contrast */
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3); /* Optional: add shadow for better readability */
}

@keyframes gradientAnimation {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.chat-box {
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 10px;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
}

.message {
  margin: 10px 0;
}

.message.user {
  text-align: right;
}

.message.model {
  text-align: left;
}

.input-box {
  display: flex;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
  position: relative;
}

input {
  width: 70%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-right: 10px;
}

button {
  padding: 10px 20px;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.typing-indicator {
  color: #999;
  font-style: italic;
  text-align: left;
  padding-left: 10px;
}

.emoji-picker-wrapper {
  position: absolute;
  bottom: 50px;
  left: 0;
  right: 0;
  z-index: 1000;
}
</style>
