<template>
  <div class="login-container">
    <div class="login-header">
      <h1 class="brand">FinTrack</h1>
    </div>
    
    <div class="login-form-container">
      <div class="login-form">
        <h2 class="form-title">Bem-vindo ao FinTrack</h2>
        <p class="form-subtitle">Faça login para acessar seu painel financeiro</p>
        
        <div v-if="error" class="error-message">
          <div class="error-icon">⚠️</div>
          <p>{{ error }}</p>
        </div>
        
        <div class="form-group">
          <label for="username">Usuário</label>
          <div class="input-wrapper">
            <span class="input-icon">👤</span>
            <input 
              id="username"
              type="text" 
              v-model="username" 
              placeholder="Digite seu nome de usuário"
              class="form-input"
            >
          </div>
        </div>
        
        <div class="form-group">
          <label for="password">Senha</label>
          <div class="input-wrapper">
            <span class="input-icon">🔒</span>
            <input 
              id="password"
              type="password" 
              v-model="password" 
              placeholder="Digite sua senha"
              class="form-input"
            >
          </div>
        </div>
        
        <button 
          @click="handleLogin" 
          class="login-button"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Processando...' : 'Entrar' }}
        </button>
        
        <p class="register-text">
          Não tem conta? 
          <router-link to="/register" class="register-link">Cadastre-se agora</router-link>
        </p>
      </div>
    </div>
    
    <div class="login-footer">
      <p>&copy; 2025 FinTrack - Todos os direitos reservados</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: '',
      error: '',
      isLoading: false
    }
  },
  mounted() {
    // Check if user is already logged in
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Optional: Validate token with backend
      this.$router.push('/home');
    }
  },
  methods: {
    handleLogin() {
      // Clear previous errors
      this.isLoading = true;
      this.error = '';
      
      // Form validation
      if (!this.username || !this.password) {
        this.error = 'Preencha todos os campos.';
        this.isLoading = false;
        return;
      }
      
      // Format data as URLSearchParams for OAuth2PasswordRequestForm
      const formData = new URLSearchParams();
      formData.append('username', this.username);
      formData.append('password', this.password);
      
      console.log('Sending login request with data:', {
        username: this.username,
        formData: formData.toString()
      });
      
      const response = axios.post('/Usuario/token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        withCredentials: true // Helps with CORS if cookies are needed
      })
      .then(response => {
        console.log('Login successful:', response.data);
        
        console.log('Usuário logado, token de admin removido');
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminTokenType')
        localStorage.removeItem('adminInfo')

        // Store the token and user info in localStorage
        localStorage.setItem('accessToken', response.data.access_token);
        localStorage.setItem('tokenType', response.data.token_type);
        localStorage.setItem('userInfo', JSON.stringify({
          username: this.username,
          lastLogin: new Date().toISOString()
        }));
        
        // Redirect to home page after a short delay
        setTimeout(() => {
          this.$router.push('/home');
        }, 1000);
      })
      .catch(error => {
        console.error('Login failed:', error);
        
        // More detailed error logging
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error response:', {
            data: error.response.data,
            status: error.response.status,
            headers: error.response.headers
          });
          this.error = error.response.data.detail || 'Login falhou. Por favor, tente novamente.';
        } else if (error.request) {
          // The request was made but no response was received
          console.error('Error request:', error.request);
          this.error = 'Sem resposta do servidor. Verifique sua conexão.';
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error message:', error.message);
          this.error = 'Erro de rede. Verifique sua conexão.';
        }
      })
      .finally(() => {
        this.isLoading = false;
      });
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #ffffff, #e8f5e9);
  padding: 0;
  margin: 0;
  position: absolute;
  top: 0;
  left: 0;
  overflow-x: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.login-header {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  padding: 1rem 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.brand {
  color: #fff;
  font-size: 2rem;
  margin: 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

.login-form-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.login-form {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 450px;
  transition: transform 0.3s;
}

.login-form:hover {
  transform: translateY(-5px);
}

.form-title {
  color: #333;
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0 0 10px 0;
  text-align: center;
}

.form-subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
  font-size: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #555;
  font-weight: 500;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  font-size: 1.2rem;
  color: #666;
}

.form-input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
  font-size: 1rem;
  transition: all 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #4CAF50;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.login-button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1.5rem;
  transition: all 0.3s;
}

.login-button:hover {
  background: linear-gradient(135deg, #43A047, #2E7D32);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
}

.login-button:disabled {
  background: linear-gradient(135deg, #A5D6A7, #81C784);
  cursor: not-allowed;
  box-shadow: none;
}

.register-text {
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
  font-size: 0.9rem;
}

.register-link {
  color: #4CAF50;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
}

.register-link:hover {
  color: #2E7D32;
  text-decoration: underline;
}

.error-message {
  background-color: #ffebee;
  color: #d32f2f;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  border: 1px solid #ffcdd2;
}

.error-icon {
  margin-right: 10px;
  font-size: 1.2rem;
}

.error-message p {
  margin: 0;
}

.login-footer {
  text-align: center;
  padding: 1.5rem;
  color: #666;
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .login-form-container {
    padding: 1rem;
  }
  
  .login-form {
    padding: 1.5rem;
  }
  
  .form-title {
    font-size: 1.5rem;
  }
  
  .form-subtitle {
    font-size: 0.9rem;
  }
}
</style>
