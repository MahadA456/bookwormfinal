<template>
  <div :class="['user-dashboard min-h-screen flex flex-col lg:flex-row', { 'dark-mode': isDarkMode }]">
    <!-- Sidebar -->
    <div :class="['w-full lg:w-64 shadow-lg p-6 sidebar-bg', { 'dark-mode-sidebar': isDarkMode }]">
      <div class="flex items-center justify-center mb-6">
        <img
          src="@/assets/newlogo.jpg"
          alt="Logo"
          class="w-16 h-16 lg:w-24 lg:h-24 rounded-full border-black border"
        />
      </div>
      <h2
        :class="[
          'text-center text-lg font-semibold mb-4',
          { 'text-white': !isDarkMode, 'text-gray-200': isDarkMode }
        ]"
      >
        Book Worm
      </h2>
      <p
        :class="[
          'text-center text-sm mb-6 tagline',
          { 'text-gray-200': !isDarkMode, 'text-gray-400': isDarkMode }
        ]"
      >
        Get Lost In a Good Book
      </p>
      <h3
        :class="[
          'text-lg font-semibold mb-4',
          { 'text-white': !isDarkMode, 'text-gray-200': isDarkMode }
        ]"
      >
        Genres
      </h3>
      <ul>
        <li class="mb-2">
          <button @click="showAllBooks" class="transparent-btn w-full">All Books</button>
        </li>
        <li v-for="genre in genres" :key="genre" class="mb-2">
          <button @click="filterByGenre(genre)" class="transparent-btn w-full">{{ genre }}</button>
        </li>
        <li class="mb-2">
          <button @click="showWishlist" class="transparent-btn w-full">Wishlist</button>
        </li>
      </ul>
    </div>

    <!-- Main Content -->
    <div :class="['flex-1 p-4 lg:p-8 bg-main-content', { 'dark-mode-main': isDarkMode }]">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row justify-between items-center mb-6">
        <div class="mb-4 lg:mb-0">
          <button @click="navigateToChatBot" class="btn transparent-btn">BookWorm Chat Bot</button>
        </div>
        <div class="w-full lg:w-1/2 flex justify-center mb-4 lg:mb-0">
          <input
            type="text"
            v-model="searchQuery"
            @input="searchByAuthor"
            placeholder="Search by Author"
            :class="[
              'w-full px-4 py-2 border rounded-lg shadow-sm',
              {
                'border-gray-300': !isDarkMode,
                'border-gray-600': isDarkMode,
                'focus:ring-indigo-500 focus:border-indigo-500': !isDarkMode,
                'focus:ring-indigo-400 focus:border-indigo-400': isDarkMode
              }
            ]"
          />
          <ul v-if="suggestions.length" class="absolute bg-white shadow-lg rounded-lg w-full mt-2 z-10">
            <li
              v-for="(suggestion, index) in suggestions"
              :key="index"
              @click="selectSuggestion(suggestion)"
              class="px-4 py-2 cursor-pointer hover:bg-gray-200"
            >
              {{ suggestion }}
            </li>
          </ul>
        </div>
        <div class="flex items-center space-x-2">
          <button @click="toggleDarkMode" class="btn transparent-btn">Toggle Dark Mode</button>
          <button @click="logout" class="btn transparent-btn">Logout</button>
        </div>
      </div>

      <!-- Sorting Options -->
      <div class="flex justify-end mb-6">
        <label for="sort" class="mr-2">Sort by:</label>
        <select v-model="sortOption" @change="sortBooks" id="sort" class="px-4 py-2 border rounded-lg shadow-sm">
          <option value="title">Title</option>
          <option value="author">Author</option>
          <option value="year">Year</option>
        </select>
      </div>

      <!-- Books List -->
      <div v-if="!showingWishlist && filteredBooks.length > 0" class="flex justify-center">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="book in filteredBooks"
            :key="book.id"
            :class="['bg-white p-4 rounded-lg shadow-lg', { 'dark-mode-book': isDarkMode }]"
          >
            <img
              :src="book.imgURL"
              alt="Book Image"
              class="h-32 w-full object-cover mb-4 rounded-lg cursor-pointer"
              @click="showImageModal(book.imgURL)"
            />
            <h3
              :class="[
                'text-lg font-semibold',
                { 'text-gray-800': !isDarkMode, 'text-gray-200': isDarkMode }
              ]"
            >
              {{ book.title }}
            </h3>
            <p :class="['text-gray-600', { 'text-gray-400': isDarkMode }]">
              Author: {{ book.author }}
            </p>
            <p :class="['text-gray-600', { 'text-gray-400': isDarkMode }]">Year: {{ book.year }}</p>
            <p :class="['text-gray-600', { 'text-gray-400': isDarkMode }]">
              Genre: {{ book.genre }}
            </p>
            <p v-if="book.bookURL" :class="['text-gray-600', { 'text-gray-400': isDarkMode }]">
              <a
                :href="book.bookURL"
                target="_blank"
                class="underline text-blue-600 dark:text-blue-400"
                >Read More</a
              >
            </p>
            <button
              @click="addToWishlist(book.id)"
              class="heart-button"
              :class="{ active: isBookInWishlist(book.id) }"
            >
              ♥
            </button>
          </div>
        </div>
      </div>

      <!-- Wishlist -->
      <div v-if="showingWishlist && wishlistBooks.length > 0" class="flex justify-center">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="book in wishlistBooks"
            :key="book.id"
            :class="['bg-white p-4 rounded-lg shadow-lg', { 'dark-mode-book': isDarkMode }]"
          >
            <img
              :src="book.imgURL"
              alt="Book Image"
              class="h-32 w-full object-cover mb-4 rounded-lg cursor-pointer"
              @click="showImageModal(book.imgURL)"
            />
            <h3
              :class="[
                'text-lg font-semibold',
                { 'text-gray-800': !isDarkMode, 'text-gray-200': isDarkMode }
              ]"
            >
              {{ book.title }}
            </h3>
            <p :class="['text-gray-600', { 'text-gray-400': isDarkMode }]">
              Author: {{ book.author }}
            </p>
            <p :class="['text-gray-600', { 'text-gray-400': isDarkMode }]">Year: {{ book.year }}</p>
            <p :class="['text-gray-600', { 'text-gray-400': isDarkMode }]">
              Genre: {{ book.genre }}
            </p>
            <p v-if="book.bookURL" :class="['text-gray-600', { 'text-gray-400': isDarkMode }]">
              <a
                :href="book.bookURL"
                target="_blank"
                class="underline text-blue-600 dark:text-blue-400"
                >Read More</a
              >
            </p>
            <button @click="confirmRemoveFromWishlist(book.id)" class="heart-button active">
              ♥
            </button>
          </div>
        </div>
      </div>

      <!-- Image Modal -->
      <div
        v-if="showImageModalFlag"
        class="fixed inset-0 z-50 flex items-center justify-center bg-smoke-light"
      >
        <div
          :class="[
            'p-4 rounded-lg shadow-lg max-w-3xl w-full relative',
            { 'bg-white': !isDarkMode, 'bg-gray-800': isDarkMode }
          ]"
        >
          <button
            @click="closeImageModal"
            :class="[
              'absolute top-2 right-2 p-1 rounded-full',
              { 'bg-red-500 text-white': !isDarkMode, 'bg-red-400 text-gray-200': isDarkMode }
            ]"
          >
            &times;
          </button>
          <img :src="currentImage" alt="Book Image" class="w-full h-auto object-cover rounded-lg" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Swal from 'sweetalert2'

export default {
  name: 'UserDashboard',
  setup() {
    const router = useRouter()
    const store = useStore()

    const searchQuery = ref('')
    const suggestions = ref([])
    const showImageModalFlag = ref(false)
    const currentImage = ref('')
    const isDarkMode = ref(false)
    const showingWishlist = ref(false)
    const sortOption = ref('title')

    // Fetch books on startup
    store.dispatch('fetchBooks')
    store.dispatch('fetchWishlist')

    const books = computed(() => store.getters.allBooks)
    const genres = computed(() => [...new Set(books.value.map((book) => book.genre))])
    const filteredBooks = ref([...books.value])
    const wishlist = computed(() => store.getters.wishlist)
    const wishlistBooks = computed(() =>
      books.value.filter((book) => wishlist.value.includes(book.id))
    )

    watch(searchQuery, (newQuery) => {
      if (newQuery.length > 1) {
        suggestions.value = books.value
          .filter((book) => book.author.toLowerCase().includes(newQuery.toLowerCase()))
          .map((book) => book.author)
          .filter((author, index, self) => self.indexOf(author) === index)
      } else {
        suggestions.value = []
      }
    })

    const filterByGenre = (genre) => {
      showingWishlist.value = false
      filteredBooks.value = books.value.filter((book) => book.genre === genre)
      if (filteredBooks.value.length === 0) {
        Swal.fire('No Books Found', 'Sorry, no books were found for the selected genre.', 'info')
      }
    }

    const searchByAuthor = () => {
      showingWishlist.value = false
      filteredBooks.value = books.value.filter((book) =>
        book?.author?.toLowerCase().includes(searchQuery?.value?.toLowerCase())
      )
      if (filteredBooks.value.length === 0 && searchQuery.value.trim() !== '') {
        Swal.fire('No Books Found', 'Sorry, no books were found for the entered author.', 'info')
      }
    }

    const selectSuggestion = (suggestion) => {
      searchQuery.value = suggestion
      suggestions.value = []
      searchByAuthor()
    }

    const showAllBooks = () => {
      showingWishlist.value = false
      filteredBooks.value = [...books.value]
    }

    const addToWishlist = (bookId) => {
      store.dispatch('addToWishlist', bookId)
      Swal.fire('Added', 'Book added to your wishlist!', 'success')
    }

    const confirmRemoveFromWishlist = (bookId) => {
      Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to remove this book from your wishlist?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, remove it!',
        cancelButtonText: 'No, keep it'
      }).then((result) => {
        if (result.isConfirmed) {
          removeFromWishlist(bookId)
          Swal.fire('Removed', 'Book removed from your wishlist!', 'success')
        }
      })
    }

    const removeFromWishlist = async (bookId) => {
      await store.dispatch('removeFromWishlist', bookId)
      store.dispatch('fetchWishlist')
    }

    const showWishlist = () => {
      showingWishlist.value = true
      filteredBooks.value = wishlistBooks.value
    }

    const isBookInWishlist = (bookId) => {
      return wishlist.value.includes(bookId)
    }

    const showImageModal = (imageUrl) => {
      currentImage.value = imageUrl
      showImageModalFlag.value = true
    }

    const closeImageModal = () => {
      showImageModalFlag.value = false
      currentImage.value = ''
    }

    const toggleDarkMode = () => {
      isDarkMode.value = !isDarkMode.value
    }

    const logout = () => {
      store.dispatch('logout')
      router.push('/login') // Redirect to login page
    }

    const navigateToChatBot = () => {
      router.push('/chatBot')
    }

    const sortBooks = () => {
      filteredBooks.value.sort((a, b) => {
        if (sortOption.value === 'year') {
          return a.year - b.year
        } else {
          return a[sortOption.value].localeCompare(b[sortOption.value])
        }
      })
    }

    return {
      genres,
      searchQuery,
      suggestions,
      filteredBooks,
      filterByGenre,
      searchByAuthor,
      selectSuggestion,
      showAllBooks,
      addToWishlist,
      confirmRemoveFromWishlist,
      isBookInWishlist,
      logout,
      showImageModal,
      closeImageModal,
      showImageModalFlag,
      currentImage,
      toggleDarkMode,
      isDarkMode,
      navigateToChatBot,
      showWishlist,
      showingWishlist,
      wishlistBooks,
      sortOption,
      sortBooks
    }
  }
}
</script>

<style scoped>
.user-dashboard {
  background-image: url('@/assets/bgimage.jpg');
  background-size: cover;
  background-position: center;
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
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  text-align: center;
  width: auto;
}

.tagline {
  font-family: 'Dancing Script', cursive;
  font-size: 1.25rem;
}

.bg-smoke-light {
  background-color: rgba(0, 0, 0, 0.5);
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

.heart-button {
  background: none;
  border: none;
  color: #d9534f;
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.3s ease;
}

.heart-button.active {
  color: #c9302c;
}

.heart-button:hover {
  color: #b52b27;
}

@media (max-width: 640px) {
  .user-dashboard {
    flex-direction: column;
  }
  .w-64 {
    width: 100%;
  }
  .flex-1 {
    width: 100%;
  }
  .btn {
    width: 100%;
  }
  .sidebar-bg {
    padding: 2rem 1rem;
  }
  .tagline {
    font-size: 1rem;
  }
  .w-24 {
    width: 5rem;
    height: 5rem;
  }
  h2 {
    font-size: 1.5rem;
  }
  .transparent-btn {
    padding: 0.75rem 1rem;
  }
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

/* Dark Mode Styles */
.dark-mode {
  background-color: #121212;
  color: #e0e0e0;
}

.dark-mode-sidebar {
  background: linear-gradient(135deg, #121212, #1f1f1f, #2b2b2b, #383838);
  color: white;
}

.dark-mode-main {
  background-color: rgba(18, 18, 18, 0.8);
  color: #e0e0e0;
}

.dark-mode-book {
  background-color: #1f1f1f;
  color: #e0e0e0;
}

.book-details {
  color: inherit; /* This ensures that the text color is inherited based on the mode */
}

.dark-mode .book-details {
  color: #e0e0e0;
}

.dark-mode .bg-main-content {
  background-color: rgba(18, 18, 18, 0.8);
  backdrop-filter: blur(5px);
}
</style>
