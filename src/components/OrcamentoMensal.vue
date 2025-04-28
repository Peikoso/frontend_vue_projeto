<template>
  <div class="orcamento-container">
    <NavBar />
    <div class="goals-container">
        <div class="page-header">
        <h1>Orçamento Mensal</h1>
        <p>Defina e acompanhe seus limites de gastos por categoria</p>
        </div>
        
        <!-- Loading Spinner -->
        <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Carregando orçamentos...</p>
        </div>
        
        <!-- Error Message -->
        <div v-else-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="fetchOrcamentos" class="retry-button">Tentar novamente</button>
        </div>
        
        <div v-else>
        <!-- Filter Section -->
        <div class="filter-section">
            <h3>Filtrar Orçamentos</h3>
            <div class="filter-controls">
            <div class="filter-group">
                <label for="month">Mês</label>
                <select id="month" v-model="filters.month" class="filter-input">
                <option v-for="m in 12" :key="`month-${m}`" :value="m">
                    {{ getMonthName(m) }}
                </option>
                </select>
            </div>
            
            <div class="filter-group">
                <label for="year">Ano</label>
                <select id="year" v-model="filters.year" class="filter-input">
                <option v-for="year in yearRange" :key="`year-${year}`" :value="year">
                    {{ year }}
                </option>
                </select>
            </div>
            
            <button @click="clearFilters" class="filter-button">
                <span class="filter-icon">🔄</span> Limpar
            </button>
            </div>
        </div>
        
        <!-- Add Button -->
        <div class="add-button-container">
            <button @click="showAddModal = true" class="add-button">
            <span class="plus-icon">+</span>
            Adicionar Orçamento
            </button>
        </div>
        
        <div class="orcamento-total">
          <h2>Total: R$ {{ formatCurrency(totalOrcamento()) }}</h2>
          <div class="section-line"></div>
        </div>

        <!-- Empty State -->
        <div v-if="orcamentos.length === 0" class="empty-state">
            <span class="empty-icon">📝</span>
            <h2>Nenhum orçamento encontrado</h2>
            <p>Comece a definir limites de gastos para suas categorias</p>
        </div>
        

        <!-- Orçamentos Grid -->
        <div v-else class="orcamentos-grid">
            <div v-for="orcamento in orcamentos" :key="orcamento.id_orcamento" class="orcamento-card" :class="getCardClass(orcamento.categoria)">
            <div class="orcamento-categoria">
                <span class="category-icon">{{ getCategoryIcon(orcamento.categoria) }}</span>
                <span class="category-name">{{ getCategoryName(orcamento.categoria) }}</span>
            </div>
            
            <div class="orcamento-valor">
                <p class="orcamento-valor-label">Valor limite</p>
                <p class="orcamento-valor-amount">R$ {{ formatCurrency(orcamento.valor_previsto) }}</p>
            </div>
            
            <div class="orcamento-actions">
                <button @click="editOrcamento(orcamento)" class="edit-button">
                <span class="action-icon">✏️</span> Editar
                </button>
                <button @click="confirmDelete(orcamento)" class="delete-button">
                <span class="action-icon">🗑️</span> Excluir
                </button>
            </div>
            </div>
        </div>
        </div>
        
        <!-- Add/Edit Modal -->
        <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
            <div class="modal-header">
            <h2>{{ showEditModal ? 'Editar' : 'Adicionar' }} Orçamento</h2>
            <button @click="closeModal" class="close-button">×</button>
            </div>
            
            <div class="modal-body">
            <div class="form-row">
                <label for="categoria">Categoria</label>
                <select id="categoria" v-model="formData.categoria" required class="form-input">
                <option value="alimentacao">Alimentação</option>
                <option value="moradia">Moradia</option>
                <option value="transporte">Transporte</option>
                <option value="lazer">Lazer</option>
                <option value="saude">Saúde</option>
                <option value="educacao">Educação</option>
                <option value="investimentos">Investimentos</option>
                <option value="outros">Outros</option>
                </select>
            </div>
            
            <div class="form-row">
                <div class="form-group half">
                <label for="mes">Mês</label>
                <input 
                    type="number" 
                    id="mes" 
                    v-model="formData.mes" 
                    required 
                    class="form-input" 
                    min="1" 
                    max="12" 
                    :disabled="showEditModal"
                >
                <p v-if="formErrors.mes" class="error-text">{{ formErrors.mes }}</p>
                </div>
                
                <div class="form-group half">
                <label for="ano">Ano</label>
                <input 
                    type="number" 
                    id="ano" 
                    v-model="formData.ano" 
                    required 
                    class="form-input" 
                    min="2025" 
                    max="2100" 
                    :disabled="showEditModal"
                >
                <p v-if="formErrors.ano" class="error-text">{{ formErrors.ano }}</p>
                </div>
            </div>
            
            <div class="form-row">
                <label for="valor_previsto">Valor Limite (R$)</label>
                <input 
                type="number" 
                id="valor_previsto" 
                v-model="formData.valor_previsto" 
                required 
                class="form-input" 
                min="0" 
                step="0.01"
                >
            </div>
            </div>
            
            <div class="modal-footer">
            <button class="cancel-button" @click="closeModal">Cancelar</button>
            <button class="save-button" @click="saveOrcamento" :disabled="isLoading">
                {{ isLoading ? 'Salvando...' : 'Salvar' }}
            </button>
            </div>
        </div>
        </div>
        
        <!-- Delete Confirmation Modal -->
        <div v-if="showDeleteModal" class="modal-overlay delete-modal" @click="showDeleteModal = false">
        <div class="modal-content" @click.stop>
            <div class="modal-header">
            <h2>Confirmar exclusão</h2>
            <button @click="showDeleteModal = false" class="close-button">×</button>
            </div>
            
            <div class="modal-body">
            <p class="warning-text">Tem certeza que deseja excluir o orçamento para a categoria <strong>{{ selectedOrcamento ? getCategoryName(selectedOrcamento.categoria) : '' }}</strong>?</p>
            <p class="warning-text">Esta ação não pode ser desfeita.</p>
            </div>
            
            <div class="modal-footer">
            <button class="cancel-button" @click="showDeleteModal = false">Cancelar</button>
            <button class="delete-button" @click="deleteOrcamento" :disabled="isLoading">
                {{ isLoading ? 'Excluindo...' : 'Excluir' }}
            </button>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from './NavBar.vue';
import axios from 'axios';

export default {
  name: 'OrcamentoMensal',
  components: {
    NavBar
  },
  data() {
    return {
      orcamentos: [],
      loading: false,
      error: null,
      isLoading: false,
      formErrors: {
        mes: '',
        ano: ''
      },
      orcamentoAll: [],
      yearRange: [],
      // Modals state
      showAddModal: false,
      showEditModal: false,
      showDeleteModal: false,
      
      // Currently selected orcamento
      selectedOrcamento: null,
      
      // Form data
      formData: {
        categoria: 'alimentacao',
        mes: new Date().getMonth() + 1,
        ano: new Date().getFullYear(),
        valor_previsto : 0
      },
      
      // Filters
      filters: {
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      },
      
      // Category data
      categories: [
        { value: 'alimentacao', name: 'Alimentação', icon: '🍔' },
        { value: 'moradia', name: 'Moradia', icon: '🏠' },
        { value: 'transporte', name: 'Transporte', icon: '🚗' },
        { value: 'lazer', name: 'Lazer', icon: '🎮' },
        { value: 'saude', name: 'Saúde', icon: '🏥' },
        { value: 'educacao', name: 'Educação', icon: '🎓' },
        { value: 'investimentos', name: 'Investimentos', icon: '💰' },
        { value: 'outros', name: 'Outros', icon: '📌' }
      ]
    };
  },
  watch: {
    'filters.month': function() {
      this.fetchOrcamentos();
    },
    'filters.year': function() {
      this.fetchOrcamentos();
    }
  },
  mounted() {
    this.fetchOrcamentos();
    this.fetchOrcamentoAll();
  },
  methods: {
    // API Communication

    async fetchOrcamentoAll() {
      try {
        const response = await axios.get('/OrcamentoMensal/All');
        this.orcamentoAll = response.data;
        this.yearRange = [...new Set([new Date().getFullYear(), ...this.orcamentoAll.map(orcamento => orcamento.ano)])].sort();	
      } catch (error) {
        console.error('Error fetching orcamentos:', error);
        this.error = 'Não foi possível carregar os orçamentos. Por favor, tente novamente.';
      } finally {
        this.loading = false;
      }
    },
    
    async fetchOrcamentos() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.get('/OrcamentoMensal/', {
          params: {
            mes: this.filters.month,
            ano: this.filters.year
          }
        });
        this.orcamentos = response.data;
      } catch (error) {
        console.error('Error fetching orcamentos:', error);
        this.error = 'Não foi possível carregar os orçamentos. Por favor, tente novamente.';
      } finally {
        this.loading = false;
      }
    },
    
    async saveOrcamento() {
      // Validate form
      if (!this.validateForm()) {
        return;
      }
      
      if(parseFloat(this.formData.valor_previsto) <= 0) {
        alert('O valor do orçamento não pode ser menor ou igual a 0.');
        return;
      }

      this.isLoading = true;
      
      try {
        if (this.showEditModal && this.selectedOrcamento) {
          // Update existing orcamento
          await axios.put(`/OrcamentoMensal/${this.selectedOrcamento.id_orcamento}`, this.formData);
        } else {
          // Create new orcamento
          await axios.post('/OrcamentoMensal/', this.formData);
        }
        
        // Refresh the list and close modal
        await this.fetchOrcamentoAll();
        await this.fetchOrcamentos();
        this.closeModal();
      } catch (error) {
        console.error('Error saving orcamento:', error);
        
        if (error.response && error.response.status === 400) {
          // Handle validation errors from API
          alert('Erro de validação: Verifique se já existe um orçamento para esta categoria no mês/ano selecionado.');
        } else {
          alert('Erro ao salvar orçamento. Por favor, tente novamente.');
        }
      } finally {
        this.isLoading = false;
      }
    },
    
    async deleteOrcamento() {
      if (!this.selectedOrcamento) return;
      
      this.isLoading = true;
      try {
        await axios.delete(`/OrcamentoMensal/${this.selectedOrcamento.id_orcamento}`);
        
        // Refresh the list and close modal
        await this.fetchOrcamentoAll();
        await this.fetchOrcamentos();
        this.showDeleteModal = false;
        this.selectedOrcamento = null;
      } catch (error) {
        console.error('Error deleting orcamento:', error);
        alert('Erro ao excluir orçamento. Por favor, tente novamente.');
      } finally {
        this.isLoading = false;
      }
    },
    
    // Form validation
    validateForm() {
      let isValid = true;
      this.formErrors = {
        mes: '',
        ano: ''
      };
      
      // Validate month
      if (this.formData.mes < 1 || this.formData.mes > 12) {
        this.formErrors.mes = 'O mês deve ser entre 1 e 12';
        isValid = false;
      }
      
      // Validate year
      if (this.formData.ano < 2025 || this.formData.ano > 2100) {
        this.formErrors.ano = 'O ano deve ser entre 2025 e 2100';
        isValid = false;
      }
      
      return isValid;
    },
    
    // Modal and UI Handlers
    editOrcamento(orcamento) {
      // Clone the orcamento to edit
      this.selectedOrcamento = {...orcamento};
      this.formData = {
        categoria: orcamento.categoria,
        mes: orcamento.mes,
        ano: orcamento.ano,
        valor_previsto: orcamento.valor_previsto
      };
      this.showEditModal = true;
    },
    
    confirmDelete(orcamento) {
      this.selectedOrcamento = {...orcamento};
      this.showDeleteModal = true;
    },
    
    closeModal() {
      this.showAddModal = false;
      this.showEditModal = false;
      this.showDeleteModal = false;
      this.resetForm();
    },
    
    resetForm() {
      this.formData = {
        categoria: 'alimentacao',
        mes: this.filters.month,
        ano: this.filters.year,
        valor_previsto: 0
      };
      this.formErrors = {
        mes: '',
        ano: ''
      };
      this.selectedOrcamento = null;
    },

    clearFilters() {
      this.filters.month = new Date().getMonth() + 1;
      this.filters.year = new Date().getFullYear();
    },
    
    // Utility Methods

    totalOrcamento() {
      return this.orcamentos.reduce((total, orcamento) => total + orcamento.valor_previsto, 0);
    },

    formatCurrency(value) {
      return parseFloat(value).toFixed(2).replace('.', ',');
    },
    
    getMonthName(monthNumber) {
      const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      return months[monthNumber - 1];
    },
    
    getCategoryName(categoryId) {
      const category = this.categories.find(cat => cat.value === categoryId);
      return category ? category.name : categoryId;
    },
    
    getCategoryIcon(categoryId) {
      const category = this.categories.find(cat => cat.value === categoryId);
      return category ? category.icon : '📌';
    },
    
    getCardClass(categoryId) {
      return `category-${categoryId}`;
    }
  }
};
</script>

<style scoped>
.orcamento-container {
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

.goals-container {
  padding: 20px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 40px;
}

/* Page Header */
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

/* Add Button */
.add-button-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.add-button {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 12px 24px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.2);
  transition: all 0.3s;
}

.add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(76, 175, 80, 0.3);
}

.plus-icon {
  font-size: 1.2rem;
  margin-right: 8px;
}

/* Filter Section */
.filter-section {
  margin-bottom: 30px;
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.filter-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #4CAF50;
  font-size: 1.2rem;
}

.filter-controls {
  display: flex;
  gap: 15px;
  align-items: flex-end;
}

.filter-group {
  flex: 1;
}

.filter-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #424242;
}

.filter-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.filter-input:focus {
  border-color: #4CAF50;
  outline: none;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.filter-button {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s;
  height: 42px;
}

.filter-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.2);
}

.filter-icon {
  margin-right: 5px;
}

/* Orçamentos Grid */
.orcamentos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.orcamento-card {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  border-top: 6px solid #BDBDBD;
  display: flex;
  flex-direction: column;
}

.orcamento-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.1);
}

.category-alimentacao { border-top-color: #FF9800; }
.category-moradia { border-top-color: #2196F3; }
.category-transporte { border-top-color: #673AB7; }
.category-lazer { border-top-color: #E91E63; }
.category-saude { border-top-color: #F44336; }
.category-educacao { border-top-color: #009688; }
.category-investimentos { border-top-color: #4CAF50; }
.category-outros { border-top-color: #9E9E9E; }

.orcamento-categoria {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.category-icon {
  font-size: 1.3rem;
  margin-right: 8px;
}

.category-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #757575;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.orcamento-valor {
  margin-bottom: 20px;
}

.orcamento-valor-label {
  font-size: 0.8rem;
  color: #757575;
  margin-bottom: 5px;
}

.orcamento-valor-amount {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.orcamento-actions {
  display: flex;
  gap: 10px;
  margin-top: auto;
}

.edit-button, .delete-button {
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-button {
  background-color: #FFC107;
  color: #212121;
  border: none;
}

.edit-button:hover {
  background-color: #FFB300;
  box-shadow: 0 4px 8px rgba(255, 193, 7, 0.2);
}

.delete-button {
  background-color: #F44336;
  color: white;
  border: none;
}

.delete-button:hover {
  background-color: #D32F2F;
  box-shadow: 0 4px 8px rgba(244, 67, 54, 0.2);
}

.edit-button i, .delete-button i {
  margin-right: 5px;
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
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  width: 450px;
  max-width: 90%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.8rem;
  color: #999;
  cursor: pointer;
  line-height: 1;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Form Styles */
.form-row {
  margin-bottom: 20px;
}

.form-row label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #424242;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
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

.form-group {
  margin-bottom: 15px;
}

.form-row {
  display: flex;
  gap: 15px;
}

.half {
  flex: 1;
}

.error-text {
  color: #F44336;
  font-size: 0.8rem;
  margin-top: 5px;
  margin-bottom: 0;
}

/* Button Styles */
.save-button {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: white;
  border: none;
  padding: 10px 20px;
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

.cancel-button {
  background-color: #E0E0E0;
  color: #424242;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-button:hover {
  background-color: #D5D5D5;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.empty-icon {
  font-size: 4rem;
  color: #9E9E9E;
  margin-bottom: 20px;
}

.empty-state h2 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 10px;
}

.empty-state p {
  color: #757575;
  max-width: 400px;
  margin: 0 auto;
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

/* Delete Modal */
.delete-modal .warning-text {
  color: #F44336;
  font-weight: 500;
  margin-top: 10px;
}

.orcamento-total {
  margin: 40px 0 20px;
  font-size: 1.4rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.section-line {
  height: 3px;
  width: 150px;
  background-color: #4CAF50;
  border-radius: 3px;
}


/* Responsive Styles */
@media (max-width: 768px) {
  .orcamentos-grid {
    grid-template-columns: 1fr;
  }
  

  .filter-controls {
    flex-direction: column;
    gap: 10px;
  }

  .filter-group {
    width: 100%;
  }
  
  .filter-button {
    width: 100%;
    justify-content: center;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>
