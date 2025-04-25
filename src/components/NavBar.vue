<template>
  <div class="navbar">
    <div class="brand">FinTrack</div>
    <div class="nav-links">
      <router-link to="/home" class="nav-link">HOME</router-link>
      <router-link to="/Movimentacoes" class="nav-link">MOVIMENTAÇÕES</router-link>
      <router-link to="/orcamento" class="nav-link">ORÇAMENTO</router-link>
      <router-link to="/metas" class="nav-link">METAS</router-link>
      <router-link to="/patrimonio" class="nav-link">PATRIMÔNIO</router-link>
      <router-link to="/" class="nav-link landing-button">INÍCIO</router-link>
      <div class="user-menu">
        <div class="user-icon" @click="toggleUserMenu">
          👤
          <span v-if="username" class="username">{{ username }}</span>
          <div class="user-dropdown" v-if="userMenuActive">
            <div class="dropdown-item" @click="goToPerfil">Perfil</div>
            <div class="dropdown-item logout" @click="logout">Sair</div>
          </div>
        </div>
      </div>
    </div>
    <div class="menu-toggle" @click="toggleMenu">
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
    </div>
  </div>
  <div class="mobile-menu" :class="{ 'active': menuActive }">
    <router-link to="/home" class="mobile-link" @click="closeMenu">HOME</router-link>
    <router-link to="/Movimentacoes" class="mobile-link" @click="closeMenu">MOVIMENTAÇÕES</router-link>
    <router-link to="/orcamento" class="mobile-link" @click="closeMenu">ORÇAMENTO</router-link>
    <router-link to="/metas" class="mobile-link" @click="closeMenu">METAS</router-link>
    <router-link to="/patrimonio" class="mobile-link" @click="closeMenu">PATRIMÔNIO</router-link>
    <router-link to="/" class="mobile-link landing-link" @click="closeMenu">INÍCIO</router-link>
    <router-link to="/perfil" class="mobile-link" @click="closeMenu">
      <span>PERFIL</span> 👤
    </router-link>
    <router-link to="/" class="mobile-link logout" @click="logout">
      <span>SAIR</span> 🚪
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'NavBar',
  data() {
    return {
      menuActive: false,
      userMenuActive: false,
      username: ''
    }
  },
  mounted() {
    // Get username from localStorage
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        this.username = parsed.username;
      } catch (error) {
        console.error('Error parsing user info:', error);
      }
    }
  },
  methods: {
    goToPerfil() {
      this.$router.push('/perfil');
    },
    toggleMenu() {
      this.menuActive = !this.menuActive;
    },
    closeMenu() {
      this.menuActive = false;
    },
    toggleUserMenu() {
      this.userMenuActive = !this.userMenuActive;
    },
    logout() {
      // Clear all authentication data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('tokenType');
      localStorage.removeItem('userInfo');
      
      // Close any open menus
      this.menuActive = false;
      this.userMenuActive = false;
      
      // Redirect to landing page
      this.$router.push('/');
    }
  }
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #4CAF50;
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: white;
  padding: 0 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1000;
}

.brand {
  font-size: 1.8rem;
  font-weight: bold;
  padding: 15px 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

.nav-links {
  display: flex;
  align-items: center;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 25px 20px;
  font-weight: 500;
  transition: all 0.3s;
  position: relative;
}

.nav-link:after {
  content: '';
  position: absolute;
  width: 0;
  height: 3px;
  bottom: 15px;
  left: 50%;
  background-color: white;
  transform: translateX(-50%);
  transition: width 0.3s;
}

.nav-link:hover:after,
.router-link-active:after {
  width: 60%;
}

.user-menu {
  margin-left: 20px;
  position: relative;
}

.user-icon {
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 20px;
  padding: 0 10px;
}

.username {
  margin-left: 8px;
  font-size: 14px;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 4px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 150px;
  z-index: 1000;
}

.dropdown-item {
  padding: 12px 15px;
  color: #333;
  transition: background 0.3s;
  cursor: pointer;
  font-size: 14px;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.dropdown-item.logout {
  border-top: 1px solid #eee;
  color: #F44336;
}

.menu-toggle {
  display: none;
  flex-direction: column;
  cursor: pointer;
}

.bar {
  width: 25px;
  height: 3px;
  background-color: white;
  margin: 3px 0;
  transition: 0.4s;
  border-radius: 3px;
}

.mobile-menu {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #333;
  flex-direction: column;
  padding: 80px 0 20px;
  z-index: 999;
  transform: translateY(-100%);
  transition: transform 0.3s ease-in-out;
}

.mobile-menu.active {
  transform: translateY(0);
}

.mobile-link {
  color: white;
  text-decoration: none;
  padding: 15px 20px;
  text-align: center;
  font-weight: 500;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: background-color 0.3s;
}

.mobile-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.mobile-link.logout {
  color: white;
  text-decoration: none;
  padding: 15px 20px;
  text-align: center;
  font-weight: 500;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: background-color 0.3s;
}

.mobile-link.logout:hover {
  background-color: rgba(244, 67, 54, 0.3);
}


.landing-button {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  margin-left: 15px;
  padding: 6px 15px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.landing-button:after {
  display: none;
}

.landing-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.landing-button:before {
  content: '🏠';
  margin-right: 5px;
  font-size: 14px;
}

.landing-link {
  background-color: rgba(255, 255, 255, 0.15);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.landing-link:before {
  content: '🏠';
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  
  .menu-toggle {
    display: flex;
  }
  
  .mobile-menu {
    display: flex;
  }
}
</style> 