import { createStore } from 'vuex'
import bcrypt from 'bcryptjs'
import persistState from './persist'
import { auth, db } from '../main' // Import the auth and Firestore instances
import { signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import {
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  query,
  where
} from 'firebase/firestore'

const ADMIN_EMAIL = 'admin@example.com' // Admin email
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('admin123', 10) // Hashed admin password

export default createStore({
  plugins: [persistState(500)], // Applying the persistState plugin with 500ms debounce
  state: {
    user: null,
    books: [],
    genres: [
      'Fiction',
      'Non-Fiction',
      'Science Fiction',
      'Fantasy',
      'Mystery',
      'Thriller',
      'Biography',
      'Other'
    ],
    messages: [], // Store for chat messages
    wishlist: [] // Store for wishlist items
  },
  mutations: {
    setUser(state, user) {
      state.user = user
    },
    setBooks(state, books) {
      state.books = books
    },
    addBook(state, book) {
      state.books.push(book)
    },
    updateBook(state, updatedBook) {
      const index = state.books.findIndex((book) => book.id === updatedBook.id)
      if (index !== -1) {
        state.books.splice(index, 1, updatedBook)
      }
    },
    deleteBook(state, bookId) {
      state.books = state.books.filter((book) => book.id !== bookId)
    },
    addMessage(state, message) {
      state.messages.push(message) // Add a new message to the store
    },
    setWishlist(state, wishlist) {
      state.wishlist = wishlist
    },
    addToWishlist(state, bookId) {
      state.wishlist.push(bookId)
    },
    removeFromWishlist(state, bookId) {
      state.wishlist = state.wishlist.filter((id) => id !== bookId)
    }
  },
  actions: {
    async login({ commit }, { email, password }) {
      if (email === ADMIN_EMAIL && bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
        commit('setUser', { email, isAdmin: true })
        return true
      } else {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password)
          commit('setUser', { email: userCredential.user.email, uid: userCredential.user.uid })
          return true
        } catch (error) {
          console.error('Login error:', error)
          return false
        }
      }
    },
    async registerUser({ commit }, { email, password }) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = { email: userCredential.user.email, uid: userCredential.user.uid }
        commit('setUser', user)

        // Store user info in Firestore
        await addDoc(collection(db, 'users'), user)

        return true
      } catch (error) {
        console.error('Signup error:', error)
        throw error // Throw the error to be caught in the component
      }
    },
    async logout({ commit }) {
      try {
        await signOut(auth)
        commit('setUser', null)
        sessionStorage.removeItem('vuex-state') // Clear Vuex state from session storage
        return true
      } catch (error) {
        console.error('Logout error:', error)
        return false
      }
    },
    async fetchBooks({ commit }) {
      try {
        const querySnapshot = await getDocs(collection(db, 'books'))
        const books = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        commit('setBooks', books)
      } catch (error) {
        console.error('Failed to fetch books:', error)
      }
    },
    async createBook({ commit }, book) {
      const bookdata = {
        author: book.author,
        genre: book.genre,
        title: book.title,
        imgURL: book.imgURL,
        year: book.year,
        bookURL: book.bookURL
      }
      try {
        const docRef = await addDoc(collection(db, 'books'), bookdata)
        const newBook = { id: docRef.id, ...bookdata }
        commit('addBook', newBook)
      } catch (error) {
        console.error('Failed to create book:', error)
      }
    },
    async updateBook({ commit }, book) {
      try {
        const bookRef = doc(db, 'books', book.id)
        await updateDoc(bookRef, book)
        commit('updateBook', book)
      } catch (error) {
        console.error('Failed to update book:', error)
      }
    },
    async deleteBook({ commit }, bookId) {
      try {
        await deleteDoc(doc(db, 'books', bookId))
        commit('deleteBook', bookId)
      } catch (error) {
        console.error('Failed to delete book:', error)
      }
    },
    async fetchWishlist({ commit, state }) {
      try {
        const wishlistQuery = query(collection(db, `users/${state.user.uid}/wishlist`))
        const querySnapshot = await getDocs(wishlistQuery)
        const wishlist = querySnapshot.docs.map((doc) => doc.data().bookId)
        commit('setWishlist', wishlist)
      } catch (error) {
        console.error('Failed to fetch wishlist:', error)
      }
    },
    async addToWishlist({ commit, state }, bookId) {
      try {
        await addDoc(collection(db, `users/${state.user.uid}/wishlist`), { bookId })
        commit('addToWishlist', bookId)
      } catch (error) {
        console.error('Failed to add to wishlist:', error)
      }
    },
    async removeFromWishlist({ commit, state }, bookId) {
      try {
        const wishlistQuery = query(
          collection(db, `users/${state.user.uid}/wishlist`),
          where('bookId', '==', bookId)
        )
        const querySnapshot = await getDocs(wishlistQuery)
        querySnapshot.forEach(async (docSnapshot) => {
          await deleteDoc(doc(db, `users/${state.user.uid}/wishlist`, docSnapshot.id))
        })
        commit('removeFromWishlist', bookId)
      } catch (error) {
        console.error('Failed to remove from wishlist:', error)
      }
    },
    sendMessage({ commit }, { message }) {
      commit('addMessage', {
        text: message,
        timestamp: new Date(),
        user: 'user' // or dynamically from state.user
      })
    }
  },
  getters: {
    isAuthenticated(state) {
      return !!state.user
    },
    currentUser(state) {
      return state.user
    },
    allBooks(state) {
      return state.books
    },
    allGenres(state) {
      return state.genres
    },
    messages(state) {
      return state.messages
    },
    wishlist(state) {
      return state.wishlist
    }
  }
})
