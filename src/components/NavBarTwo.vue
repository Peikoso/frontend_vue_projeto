<template>
  <div class="navbar-two" :class="{ 'scrolled': scrolled }">
    <div class="container">
      <div class="navbar-logo">
          <h1>FinTrack</h1>
      </div>
      <nav class="navbar-links">
        <ul>
          <li><a href="/#home" class="nav-link">Home</a></li>
          <li><a href="/#about" class="nav-link">Sobre</a></li>
          <li><a href="/#services" class="nav-link">Serviços</a></li>
          <li><a href="/#contact" class="nav-link">Contato</a></li>
          <li><router-link to="/noticias" class="nav-link">Notícias</router-link></li>
        </ul>
      </nav>
      <div class="navbar-actions">
        <router-link to="/login" class="login-btn">
          <span>Entrar</span>
        </router-link>
      </div>
      <div class="menu-toggle" @click="toggleMenu">
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
      </div>
    </div>
  </div>
  
  <!-- Mobile Menu -->
  <div class="mobile-menu" :class="{ 'active': menuActive }">
    <div class="mobile-menu-header">
      <div class="mobile-logo">FinTrack</div>
      <div class="close-menu" @click="closeMenu">&times;</div>
    </div>
    <div class="mobile-menu-body">
      <a href="/#home" class="mobile-link" @click="closeMenu">Home</a>
      <a href="/#about" class="mobile-link" @click="closeMenu">Sobre</a>
      <a href="/#services" class="mobile-link" @click="closeMenu">Serviços</a>
      <a href="/#contact" class="mobile-link" @click="closeMenu">Contato</a>
      <router-link to="/noticias" class="mobile-link" @click="closeMenu">Notícias</router-link>
      <router-link to="/login" class="mobile-link login" @click="closeMenu">
        <span>Entrar</span>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NavBarTwo',
  data() {
    return {
      menuActive: false,
      scrolled: false
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
    toggleMenu() {
      this.menuActive = !this.menuActive;
      if (this.menuActive) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    },
    closeMenu() {
      this.menuActive = false;
      document.body.style.overflow = '';
    },
    handleScroll() {
      this.scrolled = window.scrollY > 50;
    }
  }
}
</script>

<style scoped>
.navbar-two {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  transition: all 0.3s ease;
  padding: 15px 0;
  background-color: transparent;
}

.navbar-two.scrolled {
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 5px 0;
}

.navbar-two.scrolled .navbar-logo h1,
.navbar-two.scrolled .nav-link {
  color: #333;
}

.navbar-two.scrolled .bar {
  background-color: #333;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-logo a {
  text-decoration: none;
}

.navbar-logo h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin: 0;
  transition: color 0.3s ease;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.navbar-links ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 10px;
}

.nav-link {
  color: #333;
  text-decoration: none;
  padding: 8px 15px;
  font-weight: 500;
  font-size: 1.05rem;
  transition: all 0.3s;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.nav-link::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background-color: #4CAF50;
  transform: translateX(-50%);
  transition: width 0.3s ease;
}

.nav-link:hover::before,
.router-link-active::before {
  width: 70%;
}

.navbar-actions {
  display: flex;
  align-items: center;
}

.login-btn {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: white;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 50px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(76, 175, 80, 0.2);
}

.login-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(76, 175, 80, 0.3);
}

.login-btn i {
  font-size: 0.9rem;
}

.menu-toggle {
  display: none;
  flex-direction: column;
  cursor: pointer;
  z-index: 1001;
}

.bar {
  width: 25px;
  height: 3px;
  background-color: white;
  margin: 3px 0;
  transition: 0.4s;
  border-radius: 3px;
}

/* Mobile Menu Styles */
.mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: white;
  z-index: 2000;
  transform: translateX(-100%);
  transition: transform 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.mobile-menu.active {
  transform: translateX(0);
}

.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.mobile-logo {
  font-size: 1.8rem;
  font-weight: 700;
  color: #4CAF50;
}

.close-menu {
  font-size: 2rem;
  cursor: pointer;
  color: #333;
}

.mobile-menu-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.mobile-link {
  color: #333;
  text-decoration: none;
  padding: 12px;
  font-weight: 500;
  font-size: 1.1rem;
  border-radius: 8px;
  transition: all 0.3s;
}

.mobile-link:hover {
  background-color: #f5f5f5;
}

.mobile-link.login {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 10px;
}

.mobile-link.login:hover {
  background: linear-gradient(135deg, #43A047, #2E7D32);
}

@media (max-width: 768px) {
  .navbar-links, 
  .navbar-actions {
    display: none;
  }
  
  .menu-toggle {
    display: flex;
  }
}
</style> 