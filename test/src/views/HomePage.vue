<template>
  <div class="home-page min-h-screen flex flex-col justify-center items-center bg-main-content">
    <h1 class="welcome-text text-5xl font-bold mb-8 animate-bounce-in">
      Welcome to <span class="highlight">Book Worm</span>
    </h1>
    <div class="button-container flex space-x-4 animate-slide-in-up">
      <router-link to="/login" :state="{ isAdmin: true }" class="btn btn-blue">
        <i class="fas fa-user-shield mr-2"></i> Login as Admin
      </router-link>
      <router-link to="/login" :state="{ isAdmin: false }" class="btn btn-gray">
        <i class="fas fa-user mr-2"></i> Login as User
      </router-link>
      <router-link to="/signup" class="btn btn-green">
        <i class="fas fa-user-plus mr-2"></i> Sign Up
      </router-link>
    </div>
    <div class="decorative-elements">
      <div class="book-animation animate-book"></div>
      <div class="worm-animation animate-worm"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomePage'
}
</script>

<style scoped>
.home-page {
  background-image: url('@/assets/bgimage.jpg');
  background-size: cover;
  background-position: center;
  color: #fff;
  text-align: center;
  overflow: hidden; /* Prevent scrollbars caused by animations */
}

.welcome-text {
  font-family: 'Dancing Script', cursive;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7); /* Darker shadow for better contrast */
  color: white; /* Change text color to white for better visibility */
}

.highlight {
  color: #ffd700;
  animation: text-glow 1.5s ease-in-out infinite alternate;
}

@keyframes text-glow {
  from {
    text-shadow:
      0 0 10px #ffd700,
      0 0 20px #ffd700,
      0 0 30px #ffd700,
      0 0 40px #ffd700,
      0 0 50px #ffd700,
      0 0 60px #ffd700,
      0 0 70px #ffd700;
  }
  to {
    text-shadow:
      0 0 20px #ffd700,
      0 0 30px #ffd700,
      0 0 40px #ffd700,
      0 0 50px #ffd700,
      0 0 60px #ffd700,
      0 0 70px #ffd700,
      0 0 80px #ffd700;
  }
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  text-align: center;
  width: auto;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  display: flex;
  align-items: center;
}
.btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}
.btn-blue {
  background-color: #0275d8;
  color: white;
}
.btn-blue:hover {
  background-color: #025aa5;
}
.btn-gray {
  background-color: #6c757d;
  color: white;
}
.btn-gray:hover {
  background-color: #5a6268;
}
.btn-green {
  background-color: #5cb85c;
  color: white;
}
.btn-green:hover {
  background-color: #4cae4c;
}

.decorative-elements {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Ensure they don't block interactions */
}

.book-animation,
.worm-animation {
  position: absolute;
  width: 100px;
  height: 100px;
  background-size: contain;
  background-repeat: no-repeat;
  opacity: 0.7;
}

.book-animation {
  top: 20%;
  left: 10%;
  background-image: url('@/assets/bookworm.png'); /* Ensure you have a bookworm.png */
  animation: float 6s ease-in-out infinite;
}

.worm-animation {
  bottom: 20%;
  right: 10%;
  background-image: url('@/assets/bookworm.png'); /* Ensure you have a worm.png */
  animation: float 8s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes bounceIn {
  from {
    opacity: 0;
    transform: scale(0.3) translateY(-2000px);
  }
  60% {
    opacity: 1;
    transform: scale(1.1) translateY(30px);
  }
  80% {
    transform: scale(0.9) translateY(-10px);
  }
  100% {
    transform: scale(1) translateY(0);
  }
}

.animate-bounce-in {
  animation: bounceIn 2s ease-in-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-in-up {
  animation: slideInUp 1s ease-in-out;
}
</style>
