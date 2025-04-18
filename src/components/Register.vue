<template>
  <div class="register-container">
    <div class="register-header">
      <h1 class="brand">FinTrack</h1>
    </div>
    
    <div class="register-form-container">
      <div class="register-form">
        <h2 class="form-title">Crie sua conta</h2>
        <p class="form-subtitle">Preencha o formulário abaixo para se cadastrar</p>
        
        <div v-if="error" class="error-message">
          <div class="error-icon">⚠️</div>
          <p>{{ error }}</p>
        </div>
        
        <div v-if="success" class="success-message">
          <div class="success-icon">✅</div>
          <p>{{ success }}</p>
        </div>
        
        <div class="form-group">
          <label for="nome">Nome</label>
          <div class="input-wrapper">
            <span class="input-icon">👤</span>
            <input 
              id="nome"
              type="text" 
              v-model="formData.nome" 
              placeholder="Digite seu nome completo"
              class="form-input"
            >
          </div>
        </div>
        
        <div class="form-group">
          <label for="email">E-mail</label>
          <div class="input-wrapper">
            <span class="input-icon">📧</span>
            <input 
              id="email"
              type="email" 
              v-model="formData.email" 
              placeholder="Digite seu e-mail"
              class="form-input"
            >
          </div>
        </div>
        
        <div class="form-group">
          <label for="login">Login</label>
          <div class="input-wrapper">
            <span class="input-icon">🔑</span>
            <input 
              id="login"
              type="text" 
              v-model="formData.login" 
              placeholder="Escolha um nome de usuário"
              class="form-input"
            >
          </div>
        </div>
        
        <div class="form-group">
          <label for="senha">Senha</label>
          <div class="input-wrapper">
            <span class="input-icon">🔒</span>
            <input 
              id="senha"
              type="password" 
              v-model="formData.senha" 
              placeholder="Escolha uma senha segura"
              class="form-input"
            >
          </div>
        </div>
        
        <div class="form-group">
          <label for="confirmSenha">Confirmar Senha</label>
          <div class="input-wrapper">
            <span class="input-icon">🔒</span>
            <input 
              id="confirmSenha"
              type="password" 
              v-model="confirmSenha" 
              placeholder="Confirme sua senha"
              class="form-input"
            >
          </div>
        </div>
        
        <button 
          @click="handleRegister" 
          class="register-button"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Processando...' : 'Cadastrar' }}
        </button>
        
        <p class="login-text">
          Já tem conta? 
          <router-link to="/login" class="login-link">Fazer login</router-link>
        </p>
      </div>
    </div>
    
    <div class="register-footer">
      <p>&copy; 2025 FinTrack - Todos os direitos reservados</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Register',
  data() {
    return {
      formData: {
        nome: '',
        email: '',
        login: '',
        senha: ''
      },
      confirmSenha: '',
      error: '',
      success: '',
      isLoading: false
    }
  },
  methods: {
    validateForm() {
      if (!this.formData.nome || !this.formData.email || !this.formData.login || !this.formData.senha || !this.confirmSenha) {
        this.error = 'Preencha todos os campos.';
        return false;
      }
      
      if (!this.validateEmail(this.formData.email)) {
        this.error = 'E-mail inválido.';
        return false;
      }
      
      if (this.formData.senha.length < 6) {
        this.error = 'A senha deve ter pelo menos 6 caracteres.';
        return false;
      }
      
      if (this.formData.senha !== this.confirmSenha) {
        this.error = 'As senhas não coincidem.';
        return false;
      }
      
      return true;
    },
    
    validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },
    
    handleRegister() {
      // Clear previous messages
      this.error = '';
      this.success = '';
      this.isLoading = true;
      
      // Form validation
      if (!this.validateForm()) {
        this.isLoading = false;
        return;
      }
      
      // Send registration request
      axios.post('http://localhost:8000/Usuario/Cadastro', this.formData)
        .then(response => {
          console.log('Registration successful:', response.data);
          this.success = 'Cadastro realizado com sucesso! Redirecionando para o login...';
          
          // Reset form
          this.formData = {
            nome: '',
            email: '',
            login: '',
            senha: ''
          };
          this.confirmSenha = '';
          
          // Redirect to login page after a short delay
          setTimeout(() => {
            this.$router.push('/');
          }, 2000);
        })
        .catch(error => {
          console.error('Registration failed:', error);
          
          if (error.response) {
            console.error('Error response:', {
              data: error.response.data,
              status: error.response.status
            });
            this.error = error.response.data.detail || 'Erro ao realizar cadastro. Por favor, tente novamente.';
          } else if (error.request) {
            console.error('Error request:', error.request);
            this.error = 'Sem resposta do servidor. Verifique sua conexão.';
          } else {
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
.register-container {
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

.register-header {
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

.register-form-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.register-form {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 550px;
  transition: transform 0.3s;
}

.register-form:hover {
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

.register-button {
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

.register-button:hover {
  background: linear-gradient(135deg, #43A047, #2E7D32);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
}

.register-button:disabled {
  background: linear-gradient(135deg, #A5D6A7, #81C784);
  cursor: not-allowed;
  box-shadow: none;
}

.login-text {
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
  font-size: 0.9rem;
}

.login-link {
  color: #4CAF50;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
}

.login-link:hover {
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

.success-message {
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  border: 1px solid #a5d6a7;
}

.error-icon,
.success-icon {
  margin-right: 10px;
  font-size: 1.2rem;
}

.error-message p,
.success-message p {
  margin: 0;
}

.register-footer {
  text-align: center;
  padding: 1.5rem;
  color: #666;
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .register-form-container {
    padding: 1rem;
  }
  
  .register-form {
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