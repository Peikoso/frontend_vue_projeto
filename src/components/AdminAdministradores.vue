<template>
  <div class="admin-section">
    <div class="section-header">
      <button class="btn-primary" @click="showAddModal">
        <i class="fas fa-plus"></i> Novo Administrador
      </button>
    </div>

    <!-- Loading and Error states -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Carregando administradores...</p>
    </div>

    <div v-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button class="btn-retry" @click="fetchAdministradores">Tentar novamente</button>
    </div>

    <!-- Empty state -->
    <div v-if="!loading && !error && administradores.length === 0" class="empty-state">
      <i class="fas fa-users-slash"></i>
      <p>Nenhum administrador cadastrado</p>
      <button class="btn-primary" @click="showAddModal">Adicionar agora</button>
    </div>

    <!-- Search bar -->
    <div v-if="!loading && !error && administradores.length > 0" class="search-container">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Buscar por nome de usuário..."
          class="search-input"
        >
      </div>
    </div>

    <!-- Card grid view -->
    <div v-if="!loading && !error && administradores.length > 0" class="card-grid">
      <div 
        v-for="admin in filteredAdministradores" 
        :key="admin.id" 
        class="admin-card"
        :class="{ 'admin-card-self': admin.id === currentAdminId }"
      >
        <div class="card-header">
          <div class="admin-avatar">
            <span>{{ getInitials(admin.admin_login) }}</span>
          </div>
        </div>
        
        <div class="card-body">
          <div class="admin-details">
            <div class="detail-item">
              <i class="fas fa-key"></i>
              <span>Usuário: <strong>{{ admin.admin_login }}</strong></span>
            </div>
          </div>
        </div>
        
        <div class="card-footer">
          <button 
            class="btn-delete-small" 
            @click="confirmDelete(admin)"
            :disabled="admin.id_admin === currentAdminId"
            :title="admin.id_admin === currentAdminId ? 'Você não pode excluir seu próprio usuário' : 'Excluir administrador'"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Add Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Novo Administrador</h3>
          <button class="btn-close" @click="closeModal">&times;</button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="saveAdmin">
            <div class="form-row">
              <div class="form-group">
                <label for="username">Nome de usuário *</label>
                <input 
                  type="text" 
                  id="username" 
                  v-model="form.admin_login" 
                  required
                  class="form-control"
                >
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="senha">Senha *</label>
                <div class="password-input">
                  <input 
                    :type="showPassword ? 'text' : 'password'" 
                    id="senha" 
                    v-model="form.senha" 
                    :required="true"
                    class="form-control"
                  >
                  <button 
                    type="button" 
                    class="btn-toggle-password" 
                    @click="showPassword = !showPassword"
                  >
                    <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                </div>
              </div>
            </div>

            <div v-if="formError" class="form-error">
              <i class="fas fa-exclamation-circle"></i>
              {{ formError }}
            </div>

            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="closeModal">Cancelar</button>
              <button 
                type="submit" 
                class="btn-primary" 
                :disabled="formSubmitting"
              >
                <span v-if="!formSubmitting">Cadastrar</span>
                <div v-else class="btn-spinner"></div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <h3>Confirmar Exclusão</h3>
          <button class="btn-close" @click="cancelDelete">&times;</button>
        </div>

        <div class="modal-body">
          <div class="delete-confirmation">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Tem certeza que deseja excluir o administrador <strong>"{{ selectedAdmin?.admin_login }}"</strong>?</p>
            <p class="delete-warning">Esta ação não pode ser desfeita!</p>
          </div>

          <div class="form-actions">
            <button class="btn-secondary" @click="cancelDelete">Cancelar</button>
            <button 
              class="btn-danger" 
              @click="deleteAdmin"
              :disabled="deleteSubmitting"
            >
              <span v-if="!deleteSubmitting">Confirmar Exclusão</span>
              <div v-else class="btn-spinner"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AdminAdministradores',
  data() {
    return {
      administradores: [],
      loading: false,
      error: null,
      searchQuery: '',
      showModal: false,
      showDeleteModal: false,
      selectedAdmin: null,
      formSubmitting: false,
      deleteSubmitting: false,
      formError: null,
      showPassword: false,
      currentAdminId: null,
      form: this.getEmptyForm()
    };
  },
  computed: {
    filteredAdministradores() {
      if (!this.searchQuery.trim()) return this.administradores;
      const query = this.searchQuery.toLowerCase();
      return this.administradores.filter(admin => admin.admin_login.toLowerCase().includes(query));
    }
  },
  mounted() {
    this.fetchCurrentAdminInfo();
    this.fetchAdministradores();
  },
  methods: {
    getEmptyForm() {
      return {
        admin_login: '',
        senha: '',
      };
    },
    async fetchCurrentAdminInfo() {
      try {
        const adminInfo = localStorage.getItem('adminInfo');
        if (adminInfo) {
          const info = JSON.parse(adminInfo);
          
          // Get admin details including ID
          const token = localStorage.getItem('adminToken');
          const tokenType = localStorage.getItem('adminTokenType') || 'Bearer';
          
          const response = await axios.get('/Admin/me', {
            headers: {
              'Authorization': `${tokenType} ${token}`
            }
          });
          
          this.currentAdminId = response.data.id_admin;
        }
      } catch (err) {
        console.error('Erro ao obter informações do admin atual:', err);
      }
    },
    async fetchAdministradores() {
      this.loading = true;
      this.error = null;
      
      try {
        const token = localStorage.getItem('adminToken');
        const tokenType = localStorage.getItem('adminTokenType') || 'Bearer';
        
        const response = await axios.get('/Admin/', {
          headers: {
            'Authorization': `${tokenType} ${token}`
          }
        });
        
        this.administradores = response.data;
      } catch (err) {
        console.error('Erro ao buscar administradores:', err);
        this.error = 'Não foi possível carregar os administradores. Tente novamente.';
      } finally {
        this.loading = false;
      }
    },
    getInitials(name) {
      if (!name) return '?';
      return name
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
    },
    showAddModal() {
      this.form = this.getEmptyForm();
      this.showModal = true;
      this.formError = null;
    },
    closeModal() {
      this.showModal = false;
      this.form = this.getEmptyForm();
      this.formError = null;
    },
    async saveAdmin() {
      this.formSubmitting = true;
      this.formError = null;
      
      try {
        const token = localStorage.getItem('adminToken');
        const tokenType = localStorage.getItem('adminTokenType') || 'Bearer';
        
        let response;
        
        response = await axios.post('/Admin/Cadastro', this.form, {
        headers: {
            'Authorization': `${tokenType} ${token}`
        }
        });
        
        await this.fetchAdministradores();
        
        this.closeModal();
      } catch (err) {
        console.error('Erro ao salvar administrador:', err);
        
        if (err.response && err.response.status === 409) {
          this.formError = 'Este nome de usuário já está em uso.';
        } else if (err.response && err.response.status === 422) {
          this.formError = 'Dados inválidos. Verifique os campos e tente novamente.';
        } else if (err.response && err.response.status === 401) {
          this.formError = 'Não autorizado. Faça login novamente.';
        } else {
          this.formError = 'Erro ao salvar administrador. Tente novamente.';
        }
      } finally {
        this.formSubmitting = false;
      }
    },
    confirmDelete(admin) {
      if (admin.id_admin === this.currentAdminId) {
        return; // Não permitir excluir o próprio usuário
      }
      
      this.selectedAdmin = admin;
      this.showDeleteModal = true;
    },
    cancelDelete() {
      this.showDeleteModal = false;
      this.selectedAdmin = null;
    },
    async deleteAdmin() {
      this.deleteSubmitting = true;
      
      try {
        const token = localStorage.getItem('adminToken');
        const tokenType = localStorage.getItem('adminTokenType') || 'Bearer';
        
        await axios.delete(`/Admin/${this.selectedAdmin.id_admin}`, {
          headers: {
            'Authorization': `${tokenType} ${token}`
          }
        });
        
        await this.fetchAdministradores();

        this.cancelDelete();
      } catch (err) {
        console.error('Erro ao excluir administrador:', err);
        alert('Erro ao excluir administrador. Tente novamente.');
      } finally {
        this.deleteSubmitting = false;
      }
    }
  }
};
</script>

<style scoped>
.admin-section {
  padding: 0;
  width: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  gap: 16px;
  margin-bottom: 24px;
}

.empty-state i, .error-state i {
  font-size: 48px;
  color: #9e9e9e;
}

.error-state i {
  color: #f44336;
}

.empty-state p, .error-state p {
  margin: 0;
  color: #616161;
  font-size: 16px;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #4CAF50;
  width: 36px;
  height: 36px;
  animation: spin 1s linear infinite;
}

.search-container {
  margin-bottom: 24px;
}

.search-box {
  position: relative;
  max-width: 500px;
}

.search-box i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9e9e9e;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 42px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.admin-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.admin-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.admin-card-self {
  border: 2px solid #4CAF50;
}

.card-header {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #f5f5f5;
}

.admin-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #4CAF50;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 18px;
}

.admin-info h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #333;
}

.admin-email {
  margin: 0;
  font-size: 14px;
  color: #757575;
}

.card-body {
  padding: 16px;
  flex-grow: 1;
}

.admin-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #616161;
  font-size: 14px;
}

.detail-item i {
  color: #9e9e9e;
  width: 16px;
}

.card-footer {
  padding: 16px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  border-top: 1px solid #f5f5f5;
}

.form-group {
  margin-bottom: 16px;
  flex: 1;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #424242;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: #4CAF50;
}

.password-input {
  position: relative;
}

.btn-toggle-password {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9e9e9e;
  cursor: pointer;
  padding: 4px;
}

.form-error {
  background-color: #ffebee;
  color: #d32f2f;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.delete-confirmation {
  color: #f44336;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
  margin-bottom: 24px;
}

.delete-confirmation i {
  font-size: 48px;
  color: #f44336;
}

.delete-warning {
  color: #f44336;
  font-weight: 500;
  margin: 8px 0 0 0;
}

.delete-modal {
  max-width: 450px;
}

/* Buttons */
.btn-primary, .btn-secondary, .btn-danger, .btn-retry {
  padding: 10px 16px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
  border: none;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-primary:hover {
  background-color: #388E3C;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #e0e0e0;
}

.btn-secondary:hover {
  background-color: #eeeeee;
}

.btn-danger {
  background-color: #f44336;
  color: white;
}

.btn-danger:hover {
  background-color: #d32f2f;
}

.btn-retry {
  background-color: #f44336;
  color: white;
}

.btn-edit-small, .btn-delete-small {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-edit-small {
  background-color: #2196F3;
  color: white;
}

.btn-edit-small:hover {
  background-color: #1976D2;
}

.btn-delete-small {
  background-color: #F44336;
  color: white;
}

.btn-delete-small:hover {
  background-color: #D32F2F;
}

.btn-delete-small:disabled {
  background-color: #bdbdbd;
  cursor: not-allowed;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #616161;
  cursor: pointer;
}

.btn-spinner {
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 3px solid white;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 550px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f5f5f5;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.modal-body {
  padding: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
}
</style> 