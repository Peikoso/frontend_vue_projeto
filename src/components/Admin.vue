<template>
  <div class="admin-container">
    <div class="admin-sidebar">
      <div class="sidebar-header">
        <h2>Admin CMS</h2>
      </div>
      <div class="sidebar-menu">
        <button 
          @click="activeTab = 'noticias'" 
          :class="{'active': activeTab === 'noticias'}"
        >
          <i class="fas fa-newspaper"></i>
          <span>Notícias</span>
        </button>
        <button 
          @click="activeTab = 'categorias'" 
          :class="{'active': activeTab === 'categorias'}"
        >
          <i class="fas fa-tags"></i>
          <span>Categorias</span>
        </button>
        <button 
          @click="activeTab = 'administradores'" 
          :class="{'active': activeTab === 'administradores'}"
        >
          <i class="fas fa-users-cog"></i>
          <span>Administradores</span>
        </button>
        <button @click="logout" class="logout-btn">
          <i class="fas fa-sign-out-alt"></i>
          <span>Sair</span>
        </button>
      </div>
    </div>
    
    <div class="admin-content">
      <div class="content-header">
        <h1>{{ pageTitle }}</h1>
        <div class="user-info">
          <span>{{ adminName }}</span>
          <div class="avatar">{{ adminInitials }}</div>
        </div>
      </div>
      
      <div class="content-body">
        <div v-if="activeTab === 'noticias'">
          <AdminNoticias />
        </div>
        
        <div v-if="activeTab === 'categorias'">
          <AdminCategorias />
        </div>
        
        <div v-if="activeTab === 'administradores'">
          <AdminAdministradores />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AdminNoticias from './AdminNoticias.vue';
import AdminCategorias from './AdminCategorias.vue';
import AdminAdministradores from './AdminAdministradores.vue';

export default {
  name: 'Admin',
  components: {
    AdminNoticias,
    AdminCategorias,
    AdminAdministradores
  },
  data() {
    return {
      activeTab: 'noticias',
      adminInfo: null
    };
  },
  computed: {
    pageTitle() {
      switch(this.activeTab) {
        case 'noticias': return 'Gerenciamento de Notícias';
        case 'categorias': return 'Gerenciamento de Categorias';
        case 'administradores': return 'Gerenciamento de Administradores';
        default: return 'Painel Administrativo';
      }
    },
    adminName() {
      return this.adminInfo?.username || 'Admin';
    },
    adminInitials() {
      if (!this.adminInfo?.username) return 'A';
      
      return this.adminInfo.username
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
  },
  mounted() {
    this.checkAuth();
    this.loadAdminInfo();
  },
  methods: {
    loadAdminInfo() {
      try {
        const adminInfo = localStorage.getItem('adminInfo');
        if (adminInfo) {
          this.adminInfo = JSON.parse(adminInfo);
        }
      } catch (error) {
        console.error('Erro ao carregar informações do administrador:', error);
      }
    },
    checkAuth() {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        this.$router.push('/admin/login');
      }
    },
    logout() {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminTokenType');
      localStorage.removeItem('adminInfo');
      this.$router.push('/admin/login');
    }
  }
};
</script>

<style scoped>
.admin-container {
  display: flex;
  min-height: 100vh;
  height: 100vh;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f8f9fa;
}

.admin-sidebar {
  width: 250px;
  background-color: #2c3e50;
  color: white;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  height: 100%;
  overflow-y: auto;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  flex-grow: 1;
}

.sidebar-menu button {
  background: none;
  border: none;
  color: #ecf0f1;
  padding: 12px 20px;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;
}

.sidebar-menu button i {
  width: 20px;
  text-align: center;
  font-size: 1rem;
}

.sidebar-menu button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.sidebar-menu button.active {
  background-color: #4CAF50;
  color: white;
  border-right: 3px solid #2E7D32;
}

.sidebar-menu button.logout-btn {
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.admin-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  height: 100%;
}

.content-header {
  background-color: white;
  padding: 16px 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
}

.content-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-info span {
  color: #666;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #4CAF50;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.content-body {
  padding: 24px;
  flex-grow: 1;
  overflow-y: auto;
  height: calc(100vh - 68px); /* 68px is the content-header height */
}

@media (max-width: 768px) {
  .admin-container {
    flex-direction: column;
  }
  
  .admin-sidebar {
    width: 100%;
    height: auto;
    z-index: 10;
  }
  
  .sidebar-header {
    padding: 15px;
  }
  
  .sidebar-menu {
    flex-direction: row;
    flex-wrap: nowrap;
    overflow-x: auto;
    padding: 10px;
    justify-content: space-between;
  }
  
  .sidebar-menu button {
    flex-direction: column;
    padding: 10px;
    gap: 5px;
    min-width: 80px;
  }
  
  .sidebar-menu button.logout-btn {
    margin-top: 0;
    border-top: none;
  }
  
  .content-header {
    padding: 12px 16px;
  }
  
  .content-header h1 {
    font-size: 1.2rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
  }
  
  .user-info span {
    display: none;
  }
  
  .content-body {
    padding: 16px;
    height: calc(100vh - 125px); /* Adjusted for mobile header sizes */
  }
}

@media (max-width: 480px) {
  .content-header h1 {
    font-size: 1rem;
    max-width: 160px;
  }
  
  .sidebar-menu button span {
    font-size: 0.8rem;
  }
  
  .sidebar-menu button i {
    font-size: 1.1rem;
  }
  
  .avatar {
    width: 30px;
    height: 30px;
    font-size: 0.9rem;
  }
  
  .sidebar-header h2 {
    font-size: 1.2rem;
  }
}
</style>
