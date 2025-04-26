<template>
  <div class="admin-login-container">
    <div class="login-form-container">
      <div class="login-header">
        <h1>Admin CMS</h1>
        <p>Login para acessar o painel administrativo</p>
      </div>
      
      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">Usuário</label>
          <div class="input-wrapper">
            <input 
              type="text" 
              id="username" 
              v-model="form.username"
              placeholder="Nome de usuário"
              required
              :class="{ 'error': errors.username }"
            >
          </div>
          <div class="error-message" v-if="errors.username">{{ errors.username }}</div>
        </div>
        
        <div class="form-group">
          <label for="password">Senha</label>
          <div class="input-wrapper">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="password" 
              v-model="form.password"
              placeholder="Sua senha"
              required
              :class="{ 'error': errors.password }"
            >
          </div>
          <div class="error-message" v-if="errors.password">{{ errors.password }}</div>
        </div>
        
        <div class="login-error" v-if="loginError">
          <i class="fas fa-exclamation-circle"></i>
          {{ loginError }}
        </div>
        
        <button type="submit" class="login-button" :disabled="loading">
          <span v-if="!loading">Entrar</span>
          <div v-else class="button-loader"></div>
        </button>
        
        <div class="back-link">
          <router-link to="/"><i class="fas fa-arrow-left"></i> Voltar para o site</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AdminLogin',
  data() {
    return {
      form: {
        username: '',
        password: ''
      },
      errors: {
        username: '',
        password: ''
      },
      showPassword: false,
      loading: false,
      loginError: ''
    };
  },
  methods: {
    validateForm() {
      let isValid = true;
      this.errors = {
        username: '',
        password: ''
      };
      
      if (!this.form.username.trim()) {
        this.errors.username = 'Username é obrigatório';
        isValid = false;
      }
      
      if (!this.form.password) {
        this.errors.password = 'Senha é obrigatória';
        isValid = false;
      } else if (this.form.password.length < 6) {
        this.errors.password = 'Senha deve ter pelo menos 6 caracteres';
        isValid = false;
      }
      
      return isValid;
    },
    async handleLogin() {
      if (!this.validateForm()) return;
      
      this.loading = true;
      this.loginError = '';
      
      const formData = new FormData();
      formData.append('username', this.form.username);
      formData.append('password', this.form.password);
      
      try {
        const response = await axios.post('/Admin/token', formData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        
        // Save token to localStorage
        localStorage.setItem('adminToken', response.data.access_token);
        localStorage.setItem('adminTokenType', response.data.token_type);
        localStorage.setItem('adminInfo', JSON.stringify({ 
          username: this.form.username,
          is_admin: true
        }));
        
        // Redirect to admin dashboard
        this.$router.push('/admin');
      } catch (error) {
        console.error('Login error:', error);
        
        if (error.response) {
          // Handle specific error responses
          if (error.response.status === 400) {
            this.loginError = 'Usuário ou senha inválidos';
          } else if (error.response.status === 422) {
            this.loginError = 'Dados inválidos. Verifique os campos.';
          } else {
            this.loginError = 'Erro ao fazer login. Tente novamente.';
          }
        } else {
          this.loginError = 'Erro de conexão. Verifique sua internet.';
        }
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.admin-login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8f5e9 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.login-form-container {
  width: 100%;
  max-width: 450px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  padding: 40px;
  overflow: hidden;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  color: #333;
  font-size: 2rem;
  margin-bottom: 8px;
}

.login-header p {
  color: #666;
  font-size: 1rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.95rem;
  font-weight: 500;
  color: #555;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper i {
  position: absolute;
  left: 15px;
  color: #999;
  font-size: 1rem;
}

.input-wrapper input {
  width: 100%;
  padding: 12px 15px 12px 45px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.15);
}

.input-wrapper input.error {
  border-color: #e74c3c;
}

.toggle-password {
  position: absolute;
  right: 15px;
  color: #999;
  cursor: pointer;
  font-size: 1rem;
}

.error-message {
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 4px;
}

.login-error {
  background-color: #fdecea;
  color: #e74c3c;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.login-button {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-button:hover {
  background: linear-gradient(135deg, #43A047, #2E7D32);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.2);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.button-loader {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.back-link {
  text-align: center;
  margin-top: 20px;
}

.back-link a {
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.back-link a:hover {
  color: #4CAF50;
}

@media (max-width: 576px) {
  .login-form-container {
    max-width: 100%;
    border-radius: 0;
    padding: 30px 20px;
    box-shadow: none;
  }
}
</style>
