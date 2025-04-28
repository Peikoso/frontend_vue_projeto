<template>
  <div class="page-container">
    <NavBar />
    <div class="profile-container">
      <div class="page-header">
        <h1>Perfil do Usuário</h1>
        <p>Gerencie suas informações pessoais e configurações da conta</p>
      </div>

      <!-- Loading and Error Messages -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Carregando informações do perfil...</p>
      </div>

      <div v-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="fetchUserData" class="retry-button">Tentar novamente</button>
      </div>

      <!-- Profile Content -->
      <div v-if="!loading && !error" class="profile-content">
        <!-- User Summary Card -->
        <div class="profile-summary">
          <div class="avatar-container">
            <div class="avatar">{{ getUserInitials() }}</div>
          </div>
          <div class="user-info">
            <h2>{{ userData.nome || userData.login }}</h2>
            <p class="login">@{{ userData.login }}</p>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tabs">
          <button 
            class="tab-button" 
            :class="{ 'active': activeTab === 'info' }" 
            @click="activeTab = 'info'"
          >
            Informações Pessoais
          </button>
          <button 
            class="tab-button" 
            :class="{ 'active': activeTab === 'edit' }" 
            @click="activeTab = 'edit'"
          >
            Editar Perfil
          </button>
          <button 
            class="tab-button" 
            :class="{ 'active': activeTab === 'danger' }" 
            @click="activeTab = 'danger'"
          >
            Zona de Perigo
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Personal Information Tab (Read-only) -->
          <div v-if="activeTab === 'info'" class="tab-pane">
            <div class="info-container">
              <div class="info-group">
                <div class="info-label">Nome de Usuário</div>
                <div class="info-value">{{ userData.login }}</div>
              </div>
              
              <div class="info-group">
                <div class="info-label">Nome Completo</div>
                <div class="info-value">{{ userData.nome || 'Não informado' }}</div>
              </div>
              
              <div class="info-group">
                <div class="info-label">Email</div>
                <div class="info-value">{{ userData.email || 'Não informado' }}</div>
              </div>
              
              <div class="edit-info-button-container">
                <button class="edit-info-button" @click="activeTab = 'edit'">
                  Editar Informações
                </button>
              </div>
            </div>
          </div>

          <!-- Edit Profile Tab -->
          <div v-if="activeTab === 'edit'" class="tab-pane">
            <!-- Combined Edit Form -->
            <form @submit.prevent="updateProfile" class="profile-form">
              <h3 class="form-section-title">Editar Informações</h3>
              
              <div class="form-group">
                <label for="login">Nome de Usuário</label>
                <input 
                  type="text" 
                  id="login" 
                  v-model="form.login" 
                  class="form-input" 
                  placeholder="Digite seu nome de usuário"
                >
              </div>

              <div class="form-group">
                <label for="nome">Nome Completo</label>
                <input 
                  type="text" 
                  id="nome" 
                  v-model="form.nome" 
                  class="form-input" 
                  placeholder="Seu nome completo"
                >
              </div>

              <div class="form-group">
                <label for="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  v-model="form.email" 
                  class="form-input" 
                  placeholder="seu.email@exemplo.com"
                >
                <p v-if="emailError" class="error-text">{{ emailError }}</p>
              </div>
              <div class="form-group">
                <label for="new_password">Senha ou Nova Senha</label>
                <div class="password-input">
                  <input 
                    :type="showNewPassword ? 'text' : 'password'" 
                    id="new_password" 
                    v-model="form.new_password" 
                    class="form-input" 
                    placeholder="Digite sua nova senha"
                  >
                  <button 
                    type="button" 
                    class="toggle-password" 
                    @click="showNewPassword = !showNewPassword"
                  >
                    {{ showNewPassword ? '🙈' : '👁️' }}
                  </button>
                </div>
                <p class="field-hint">A senha deve ter pelo menos 8 caracteres</p>
              </div>

              <div class="form-group">
                <label for="confirm_password">Confirme a Senha</label>
                <div class="password-input">
                  <input 
                    :type="showConfirmPassword ? 'text' : 'password'" 
                    id="confirm_password" 
                    v-model="form.confirm_password" 
                    class="form-input" 
                    placeholder="Confirme sua nova senha"
                  >
                  <button 
                    type="button" 
                    class="toggle-password" 
                    @click="showConfirmPassword = !showConfirmPassword"
                  >
                    {{ showConfirmPassword ? '🙈' : '👁️' }}
                  </button>
                </div>
                <p v-if="passwordError" class="error-text">{{ passwordError }}</p>
              </div>

              <div class="form-actions">
                <button 
                  type="submit" 
                  class="save-button" 
                  :disabled="updating"
                >
                  {{ updating ? 'Salvando Alterações...' : 'Salvar Alterações' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Danger Zone Tab -->
          <div v-if="activeTab === 'danger'" class="tab-pane danger-zone">
            <div class="danger-card">
              <div class="danger-header">
                <div class="danger-icon">⚠️</div>
                <h3>Excluir Conta</h3>
              </div>
              <p class="danger-text">
                Esta ação irá excluir permanentemente sua conta e todos os dados associados a ela.
                Essa operação não pode ser desfeita.
              </p>
              <button class="delete-account-button" @click="showDeleteModal = true">
                Excluir minha conta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Account Confirmation Modal -->
    <div class="modal" v-if="showDeleteModal">
      <div class="modal-content delete-modal">
        <div class="modal-header">
          <h2>Excluir Conta</h2>
          <button class="close-button" @click="showDeleteModal = false">×</button>
        </div>
        
        <div class="modal-body">
          <p>Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.</p>
          <p class="warning-text">Todos os seus dados serão removidos permanentemente.</p>
          
          <div class="form-group">
            <label for="delete_confirmation">Por favor, digite "<strong>excluir minha conta</strong>" para confirmar:</label>
            <input 
              type="text" 
              id="delete_confirmation" 
              v-model="deleteConfirmation" 
              class="form-input"
              placeholder="excluir minha conta"
            >
          </div>
          
        </div>
        
        <div class="modal-footer">
          <button class="cancel-button" @click="showDeleteModal = false">Cancelar</button>
          <button 
            class="delete-button" 
            @click="deleteAccount" 
            :disabled="
              deleteConfirmation !== 'excluir minha conta' || 
              deleting
            "
          >
            {{ deleting ? 'Excluindo...' : 'Excluir Permanentemente' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from './NavBar.vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

export default {
  name: 'Perfil',
  components: {
    NavBar
  },
  setup() {
    const router = useRouter();
    return { router };
  },
  data() {
    return {
      userData: {},
      loading: true,
      error: null,
      activeTab: 'info',
      updating: false,
      deleting: false,
      showDeleteModal: false,
      deleteConfirmation: '',
      deletePassword: '',
      emailError: '',
      passwordError: '',
      showNewPassword: false,
      showConfirmPassword: false,
      form: {
        login: '',
        nome: '',
        email: '',
        new_password: '',
        confirm_password: ''
      }
    };
  },
  mounted() {
    this.fetchUserData();
  },
  methods: {
    async fetchUserData() {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.get('/Usuario/');
        this.userData = response.data;
        
        // Initialize form with user data
        this.form.login = this.userData.login || '';
        this.form.nome = this.userData.nome || '';
        this.form.email = this.userData.email || '';
      } catch (error) {
        console.error('Error fetching user data:', error);
        this.error = 'Não foi possível carregar os dados do usuário. Por favor, tente novamente.';
      } finally {
        this.loading = false;
      }
    },

    getUserInitials() {
      const name = this.userData.nome || this.userData.login || '';
      return name
        .split(' ')
        .map(part => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      return new Date(dateString).toLocaleDateString('pt-BR', options);
    },

    validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },

    validateLogin(login) {
      const re = /^\d/;
      return re.test(login);
    },

    validateName(name) {
      const re = /^[A-Za-zÀ-ÿ\s]+$/;
      return re.test(name);
    },

    async updateProfile() {
      // Reset error messages
      this.emailError = '';
      this.passwordError = '';
      
      if (!this.form.email) {
        this.emailError = 'O email é obrigatório';
        return;
      }

      if (!this.validateEmail(this.form.email)) {
        this.emailError = 'Por favor, forneça um email válido';
        return;
      }

      if(this.form.login.length < 3) {
        this.error = 'O login deve conter pelo menos 3 caracteres.';
        return;
      }

      if(this.validateLogin(this.form.login)) {
        this.error = 'Login inválido! Não pode começar com um número.';
        return;
      }

      if(this.form.nome.length < 3) {
        this.error = 'O nome deve conter pelo menos 3 caracteres.';
        return;
      }

      if(!this.validateName(this.form.nome)) {  
        this.error = 'O nome deve conter apenas letras.';
        return;
      }
      
      
      // Validate password if the user is trying to change it
      if (this.form.new_password) {
        if (this.form.new_password && this.form.new_password.length < 8) {
          this.passwordError = 'A nova senha deve ter pelo menos 8 caracteres';
          return;
        }
        
        if (this.form.new_password !== this.form.confirm_password) {
          this.passwordError = 'As senhas não coincidem';
          return;
        }
      }
      
      this.updating = true;
      
      try {
        const updateData = {
          login: this.form.login,
          nome: this.form.nome,
          email: this.form.email,
          senha: this.form.new_password
        };
        
        await axios.put('/Usuario/', updateData);
        
        // Update local storage with new login if it was changed
        if (this.userData.login !== this.form.login) {
          const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
          userInfo.login = this.form.login;
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
        }
        
        // Refresh user data
        await this.fetchUserData();
        
        // Clear password fields
        this.form.new_password = '';
        this.form.confirm_password = '';
        
        alert('Perfil atualizado com sucesso!');
      } catch (error) {
        console.error('Error updating profile:', error);
        
        if (error.response && error.response.status === 409) {
          alert('Já existe um usuário com este login ou email.');
        }
        if(error.response && error.response.status === 422) {
          alert('Dados inválidos. Por favor, tente novamente.');
        }
        else {
          alert('Ocorreu um erro ao atualizar seu perfil. Por favor, tente novamente.');
        }
      } finally {
        this.updating = false;
      }
    },

    async deleteAccount() {
      if (this.deleteConfirmation !== 'excluir minha conta') {
        return;
      }

      this.deleting = true;

      try {
        await axios.delete('/Usuario/', {
          data: { password: this.deletePassword }
        });
        
        // Clear all authentication data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('tokenType');
        localStorage.removeItem('userInfo');
        
        alert('Sua conta foi excluída com sucesso.');
        
        // Redirect to landing page
        this.router.push('/');
      } catch (error) {
        console.error('Error deleting account:', error);
        
        if (error.response && error.response.data && error.response.data.detail) {
          alert(`Erro: ${error.response.data.detail}`);
        } else {
          alert('Ocorreu um erro ao excluir sua conta. Por favor, tente novamente.');
        }
      } finally {
        this.deleting = false;
        this.showDeleteModal = false;
      }
    }
  }
};
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(to bottom, #ffffff, #e8f5e9);
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  position: absolute;
  left: 0;
  top: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.profile-container {
  padding: 20px;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding-bottom: 40px;
}

.page-header {
  text-align: center;
  margin: 20px 0 30px;
  color: #333;
}

.page-header h1 {
  font-size: 2rem;
  margin-bottom: 8px;
  font-weight: 600;
  color: #4CAF50;
}

.page-header p {
  font-size: 1.1rem;
  color: #666;
  margin: 0;
}

/* Loading and Error */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 40px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background-color: #FFEBEE;
  color: #D32F2F;
  padding: 20px;
  border-radius: 8px;
  margin: 30px 0;
  text-align: center;
}

.retry-button {
  background-color: #D32F2F;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  margin-top: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.retry-button:hover {
  background-color: #C62828;
}

/* Profile Content */
.profile-content {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* User Summary */
.profile-summary {
  padding: 30px;
  background: linear-gradient(135deg, #f5f5f5, #e0f2f1);
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-container {
  flex-shrink: 0;
}

.avatar {
  width: 80px;
  height: 80px;
  background-color: #4CAF50;
  color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  font-weight: 600;
}

.user-info {
  flex-grow: 1;
}

.user-info h2 {
  font-size: 1.6rem;
  margin: 0 0 5px 0;
  color: #333;
}

.login {
  color: #757575;
  margin: 0 0 5px 0;
  font-size: 1rem;
}

.joined-date {
  color: #9e9e9e;
  margin: 0;
  font-size: 0.9rem;
}

/* Tabs */
.tabs {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
}

.tab-button {
  padding: 15px 20px;
  background: none;
  border: none;
  font-size: 1rem;
  color: #757575;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  flex-grow: 1;
  text-align: center;
}

.tab-button.active {
  color: #4CAF50;
  font-weight: 600;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #4CAF50;
}

.tab-button:hover {
  background-color: #f5f5f5;
}

/* Tab Content */
.tab-content {
  padding: 30px;
}

.tab-pane {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Form Styles */
.profile-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 25px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #424242;
}

.form-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-input:focus {
  border-color: #4CAF50;
  outline: none;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.form-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.field-hint {
  font-size: 0.8rem;
  color: #757575;
  margin-top: 5px;
  margin-bottom: 0;
}

.error-text {
  color: #F44336;
  font-size: 0.9rem;
  margin-top: 5px;
  margin-bottom: 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 30px;
}

.save-button {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.save-button:hover {
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.2);
}

.save-button:disabled {
  background: linear-gradient(135deg, #A5D6A7, #81C784);
  cursor: not-allowed;
  box-shadow: none;
}

/* Password Input */
.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #757575;
  padding: 5px;
}

/* Danger Zone */
.danger-zone {
  max-width: 600px;
  margin: 0 auto;
}

.danger-card {
  border: 1px solid #ffcdd2;
  border-radius: 8px;
  padding: 20px;
  background-color: #fff8f8;
}

.danger-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  gap: 10px;
}

.danger-icon {
  font-size: 1.5rem;
}

.danger-header h3 {
  margin: 0;
  color: #d32f2f;
  font-size: 1.2rem;
}

.danger-text {
  color: #616161;
  margin-bottom: 20px;
}

.delete-account-button {
  background-color: #d32f2f;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.delete-account-button:hover {
  background-color: #c62828;
  box-shadow: 0 4px 8px rgba(211, 47, 47, 0.2);
}

/* Modal Styles */
.modal {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  max-width: 550px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: modalFadeIn 0.3s;
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: translateY(-30px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  font-size: 1.6rem;
  margin: 0;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: #757575;
  transition: color 0.2s;
}

.close-button:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 15px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid #eee;
}

/* Delete Modal */
.delete-modal .modal-header h2 {
  color: #d32f2f;
}

.delete-modal .modal-body {
  color: #333;
}

.delete-modal p {
  font-size: 1.1rem;
  margin-bottom: 15px;
}

.warning-text {
  color: #d32f2f;
  font-weight: 500;
}

.cancel-button {
  background-color: #f5f5f5;
  color: #424242;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-button:hover {
  background-color: #e0e0e0;
}

.delete-button {
  background-color: #d32f2f;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.delete-button:hover {
  background-color: #c62828;
  box-shadow: 0 4px 8px rgba(211, 47, 47, 0.2);
}

.delete-button:disabled {
  background-color: #ffcdd2;
  color: #616161;
  cursor: not-allowed;
  box-shadow: none;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-container {
    padding: 15px;
  }
  
  .profile-summary {
    flex-direction: column;
    text-align: center;
  }
  
  .tabs {
    flex-direction: column;
  }
  
  .tab-button {
    padding: 12px;
  }
  
  .tab-button.active::after {
    display: none;
  }
  
  .tab-button.active {
    background-color: #e8f5e9;
  }
  
  .tab-content {
    padding: 20px 15px;
  }
  
  .modal-content {
    width: 90%;
    max-height: 80vh;
  }
}

/* Add Read-only Info Styles */
.info-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.info-group {
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.info-group:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 0.9rem;
  color: #757575;
  margin-bottom: 5px;
  font-weight: 500;
}

.info-value {
  font-size: 1.2rem;
  color: #333;
}

.edit-info-button-container {
  margin-top: 30px;
  text-align: center;
}

.edit-info-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.edit-info-button:hover {
  background-color: #45a049;
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.2);
}

.form-divider {
  height: 1px;
  background-color: #e0e0e0;
  margin: 40px 0;
}

.form-section-title {
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #4CAF50;
}

.password-hint {
  font-size: 0.9rem;
  color: #757575;
  margin-top: -10px;
  margin-bottom: 15px;
}
</style>
