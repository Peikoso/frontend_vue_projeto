<template>
  <div class="admin-section">
    <div class="section-header">
      <button class="btn-primary" @click="showAddModal">
        <i class="fas fa-plus"></i> Nova Categoria
      </button>
    </div>

    <!-- Loading and Error states -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Carregando categorias...</p>
    </div>

    <div v-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button class="btn-retry" @click="fetchCategorias">Tentar novamente</button>
    </div>

    <!-- Empty state -->
    <div v-if="!loading && !error && categorias.length === 0" class="empty-state">
      <i class="fas fa-tags"></i>
      <p>Nenhuma categoria cadastrada</p>
      <button class="btn-primary" @click="showAddModal">Adicionar agora</button>
    </div>

    <!-- Card grid layout -->
    <div v-if="!loading && !error && categorias.length > 0" class="category-grid">
      <div 
        v-for="categoria in categorias" 
        :key="categoria.id" 
        class="category-card"
      >
        <div class="category-icon">
          <i class="fas fa-tag"></i>
        </div>
        
        <div class="category-content">
          <h3 class="category-name">{{ categoria.nome }}</h3>
          
          <div class="category-meta">
            <span class="category-id">ID: {{ categoria.id }}</span>
          </div>
        </div>
        
        <div class="category-actions">
          <button class="btn-edit-small" @click="editCategoria(categoria)" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button 
            class="btn-delete-small" 
            @click="confirmDelete(categoria)"
            :disabled="categoria.noticia_count > 0"
            :title="categoria.noticia_count > 0 ? 'Não é possível excluir categorias com notícias associadas' : 'Excluir'"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditMode ? 'Editar Categoria' : 'Nova Categoria' }}</h3>
          <button class="btn-close" @click="closeModal">&times;</button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="saveCategoria">
            <div class="form-group">
              <label for="nome">Nome da Categoria *</label>
              <input 
                type="text" 
                id="nome" 
                v-model="formData.nome" 
                required
                class="form-control"
                placeholder="Nome da categoria"
              >
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
                <span v-if="!formSubmitting">Salvar</span>
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
            <p>Tem certeza que deseja excluir a categoria <strong>"{{ selectedCategoria?.nome }}"</strong>?</p>
            <p class="delete-warning">Esta ação não pode ser desfeita!</p>
          </div>

          <div class="form-actions">
            <button class="btn-secondary" @click="cancelDelete">Cancelar</button>
            <button 
              class="btn-danger" 
              @click="deleteCategoria"
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
  name: 'AdminCategorias',
  data() {
    return {
      categorias: [],
      loading: false,
      error: null,
      showModal: false,
      showDeleteModal: false,
      isEditMode: false,
      formData: {
        nome: ''
      },
      formError: null,
      formSubmitting: false,
      deleteSubmitting: false,
      selectedCategoria: null
    };
  },
  mounted() {
    this.fetchCategorias();
  },
  methods: {
    async fetchCategorias() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.get('/Admin/Categoria');
        this.categorias = response.data;
      } catch (err) {
        console.error('Erro ao buscar categorias:', err);
        this.error = 'Não foi possível carregar as categorias. Tente novamente.';
      } finally {
        this.loading = false;
      }
    },
    showAddModal() {
      this.isEditMode = false;
      this.formData = {
        nome: ''
      };
      this.formError = null;
      this.showModal = true;
    },
    editCategoria(categoria) {
      this.isEditMode = true;
      this.selectedCategoria = categoria;
      this.formData = {
        nome: categoria.nome
      };
      this.formError = null;
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    async saveCategoria() {
      this.formError = null;
      this.formSubmitting = true;
      
      try {
        const token = localStorage.getItem('adminToken');
        const tokenType = localStorage.getItem('adminTokenType') || 'Bearer';
        
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `${tokenType} ${token}`
        };
        
        if (this.isEditMode) {
          // Update existing categoria
          await axios.put(`/Admin/Categoria/${this.selectedCategoria.id}`, this.formData, { headers });
        } else {
          // Create new categoria
          await axios.post('/Admin/Categoria', this.formData, { headers });
        }
        
        await this.fetchCategorias();
        this.closeModal();
      } catch (err) {
        console.error('Erro ao salvar categoria:', err);
        
        if (err.response && err.response.status === 422) {
          this.formError = 'Dados inválidos. Verifique os campos e tente novamente.';
        } else if (err.response && err.response.status === 401) {
          this.formError = 'Não autorizado. Faça login novamente.';
        } else {
          this.formError = 'Erro ao salvar. Tente novamente.';
        }
      } finally {
        this.formSubmitting = false;
      }
    },
    confirmDelete(categoria) {
      // Não permitir exclusão de categorias com notícias associadas
      if (categoria.noticia_count > 0) {
        return;
      }
      
      this.selectedCategoria = categoria;
      this.showDeleteModal = true;
    },
    cancelDelete() {
      this.showDeleteModal = false;
      this.selectedCategoria = null;
    },
    async deleteCategoria() {
      this.deleteSubmitting = true;
      
      try {
        const token = localStorage.getItem('adminToken');
        const tokenType = localStorage.getItem('adminTokenType') || 'Bearer';
        
        await axios.delete(`/Admin/Categoria/${this.selectedCategoria.id}`, {
          headers: {
            'Authorization': `${tokenType} ${token}`
          }
        });
        
        await this.fetchCategorias();
        this.cancelDelete();
      } catch (err) {
        console.error('Erro ao excluir categoria:', err);
        
        if (err.response && err.response.status === 409) {
          alert('Esta categoria possui notícias associadas e não pode ser excluída.');
        } else {
          alert('Erro ao excluir categoria. Tente novamente.');
        }
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

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.category-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  padding: 16px;
  transition: all 0.3s;
}

.category-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.category-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #e8f5e9;
  color: #4caf50;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: 16px;
  flex-shrink: 0;
}

.category-content {
  flex-grow: 1;
}

.category-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.category-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #757575;
}

.category-count {
  display: flex;
  align-items: center;
  gap: 4px;
}

.category-actions {
  display: flex;
  gap: 8px;
}

.form-group {
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
  max-width: 500px;
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

@media (max-width: 480px) {
  .category-card {
    flex-direction: column;
    text-align: center;
  }
  
  .category-icon {
    margin-right: 0;
    margin-bottom: 12px;
  }
  
  .category-meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .category-actions {
    margin-top: 16px;
  }
}
</style> 