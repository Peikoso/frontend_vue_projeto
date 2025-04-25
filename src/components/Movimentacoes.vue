<template>
  <div class="page-container">
    <NavBar />
    <div class="goals-container">
      <div class="page-header">
        <h1>Movimentações</h1>
        <p>Gerencie suas movimentações e acompanhe seu progresso financeiro</p>
      </div>

      <!-- Add movimentacao Button and Modal -->
      <div class="add-button-container">
        <button class="add-button" @click="showAddModal = true">
          <span class="plus-icon">+</span> Nova Movimentação
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="stats-container">
        <div class="stat-card total-goals">
          <div class="stat-icon">💵</div>
          <div class="stat-content">
            <h3>Total de Receitas</h3>
            <p class="stat-number">{{ filteredMovimentacoes.filter(mov => mov.tipo_mov == 'receita').length }}</p>
          </div>
        </div>
        <div class="stat-card completed-goals">
          <div class="stat-icon">💸</div>
          <div class="stat-content">
            <h3>Total de Despesas</h3>
            <p class="stat-number">{{ filteredMovimentacoes.filter(mov => mov.tipo_mov == 'despesa').length }}</p>
          </div>
        </div>
        <div class="stat-card in-progress">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <h3>Total de Movimentações</h3>
            <p class="stat-number">{{ filteredMovimentacoes.length }}</p>
          </div>
        </div>
      </div>

      <!-- Filter Section -->
      <div class="filter-section">
        <h3>Filtrar por período</h3>
        <div class="filter-controls">       
          <div class="filter-group">
            <label for="filter-month">Mês</label>
            <select id="filter-month" v-model="filters.month" class="filter-input">
              <option value="all">Todos</option>
              <option v-for="n in 12" :key="`month-${n}`" :value="n">{{ n }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label for="filter-year">Ano</label>
            <select id="filter-year" v-model="filters.year" class="filter-input">
              <option value="all">Todos</option>
              <option v-for="year in availableYears" :key="`year-${year}`" :value="year">{{ year }}</option>
            </select>
          </div>
          <button class="filter-button" @click="resetFilters">
            <span class="filter-icon">🔄</span> Limpar
          </button>
        </div>
        <h3>Filtrar por tipo e categoria</h3>
        <div class="filter-controls">
          <div class="filter-group">
            <label for="filter-tipo_mov">Tipo de Movimentação</label>
            <select id="filter-tipo_mov" v-model="filters.tipo_mov" class="filter-input">
              <option value="all">Todos</option>
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </select>
          </div>
          <div class="filter-group">
            <label for="filter-categoria">Categoria</label>
            <select id="filter-categoria" v-model="filters.categoria" class="filter-input">
              <option value="all">Todos</option>
              <option v-for="categoria in availableCategories" :key="`categoria-${categoria}`" :value="categoria.value">{{ categoria.name }}</option>
            </select>
          </div>
          <button class="filter-button" @click="resetFiltersTipoMov">
            <span class="filter-icon">🔄</span> Limpar
          </button>
        </div>
      </div>

      <!-- Loading and Error Messages -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Carregando movimentações...</p>
      </div>

      <div v-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="fetchMovimentacoes" class="retry-button">Tentar novamente</button>
      </div>

      <!-- Movimentações List -->
      <div v-if="!loading && !error && filteredMovimentacoes.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <h2>Nenhuma movimentação encontrada</h2>
        <p>Não há movimentações para o período selecionado ou clique em "Nova Movimentação" para adicionar.</p>
      </div>

      <div v-if="!loading && !error && filteredMovimentacoes.length > 0" class="goals-grid">
        <div v-for="movimentacao in filteredMovimentacoes" :key="movimentacao.idmov" class="goal-card" :class="getCategoryClass(movimentacao.categoria_receita || movimentacao.categoria_despesa)">
          <div class="goal-category">
            <span class="category-icon">{{ getCategoryIcon(movimentacao.categoria_receita || movimentacao.categoria_despesa) }}</span>
            <span class="category-name">{{ getCategoryName(movimentacao.categoria_receita || movimentacao.categoria_despesa) }}</span>
          </div>
          <h3 class="goal-title">{{ movimentacao.descricao }}</h3>
          
          <div class="goal-details">
            <div class="detail-item">
              <span class="detail-label">Tipo:</span>
              <span class="detail-value">{{ movimentacao.tipo_mov == 'receita' ? 'Receita' : 'Despesa' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Valor:</span>
              <span class="detail-value">R$ {{ formatCurrency(movimentacao.valor) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Descrição:</span>
              <span class="detail-value">{{ movimentacao.descricao }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Mês:</span>
              <span class="detail-value">{{ movimentacao.mes }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Ano:</span>
              <span class="detail-value">{{ movimentacao.ano }}</span>
            </div>
          </div>
          
          <div class="goal-actions">
            <button class="action-button edit" @click="editMovimentacaoFile(movimentacao)">
              <span class="action-icon">📄</span>
            </button>
            <button class="action-button edit" @click="editMovimentacao(movimentacao)">
              <span class="action-icon">✏️</span>
            </button>
            <button class="action-button view" @click="viewDetails(movimentacao)">
              <span class="action-icon">👁️</span>
            </button>
            <button class="action-button delete" @click="confirmDelete(movimentacao)">
              <span class="action-icon">🗑️</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div class="modal" v-if="showAddModal || showEditModal" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>{{ showEditModal ? 'Editar Movimentação' : 'Nova Movimentação' }}</h2>
            <button class="close-button" @click="closeModal">×</button>
          </div>
          
          <div class="modal-body">
            <div class="form-group">
              <label for="tipo_mov">Tipo de Movimentação</label>
              <select id="tipo_mov" v-model="formData.tipo_mov" required class="form-input">
                <option value="receita">Receita</option>
                <option value="despesa">Despesa</option>
              </select>
            </div>
            
            <div class="form-group" v-if="formData.tipo_mov == 'receita'">
              <label for="categoria">Categoria</label>
              <select id="categoria" v-model="formData.categoria_receita" required class="form-input">
                <option v-for="categoria in Object.values(categoria_receita)" :key="categoria.name" :value="categoria.value">
                  {{ categoria.name }}
                </option>
              </select>
            </div>

            <div class="form-group" v-if="formData.tipo_mov == 'despesa'">
              <label for="categoria">Categoria</label>
              <select id="categoria" v-model="formData.categoria_despesa" required class="form-input">
                <option v-for="categoria in Object.values(categoria_despesa)" :key="categoria.name" :value="categoria.value">
                  {{ categoria.name }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="descricao">Descrição</label>
              <input type="text" id="descricao" v-model="formData.descricao" required class="form-input" placeholder="Ex: Viagem para a Europa">
            </div>
            
            <div class="form-row">
              <div class="form-group half">
                <label for="mes">Mês</label>
                <input type="number" id="mes" v-model="formData.mes" required class="form-input" min="1" step="1" max="12">
              </div>
              
              <div class="form-group half">
                <label for="ano">Ano</label>
                <input type="number" id="ano" v-model="formData.ano" required class="form-input" min="2025" step="1">
              </div>
            </div>
            
            <div class="form-row">
              <label for="valor">Valor (R$)</label>
              <input type="number" id="valor" v-model="formData.valor" required class="form-input" min="0.01" step="0.01">
            </div>

            <div v-if="!showEditModal" class="form-file">
              <label for="comprovante">Comprovante</label>
              <input type="file" id="comprovante" @change="handleFileUpload" required class="form-input" accept="application/pdf">
            </div>

          </div>
          
          <div class="modal-footer">
            <button class="cancel-button" @click="closeModal">Cancelar</button>
            <button class="save-button" @click="saveMovimentacao" :disabled="isLoading">
              {{ isLoading ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </div>
      </div>

      <div class="modal" v-if="showEditModalFile" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>Editar Movimentação Comprovante</h2>
            <button class="close-button" @click="closeModal">×</button>
          </div>

          <div class="form-file">
            <label for="comprovante">Comprovante</label>
            <input type="file" id="comprovante" @change="handleFileUpload" required class="form-input" accept="application/pdf">
          </div>
          
          <div class="modal-footer">
            <button class="cancel-button" @click="closeModal">Cancelar</button>
            <button class="save-button" @click="saveMovimentacao" :disabled="isLoading">
              {{ isLoading ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div class="modal" v-if="showDeleteModal" @click="closeModal">
        <div class="modal-content delete-modal" @click.stop>
          <div class="modal-header">
            <h2>Excluir Movimentação</h2>
            <button class="close-button" @click="closeModal">×</button>
          </div>
          
          <div class="modal-body">
            <p>Tem certeza que deseja excluir a movimentação <strong>{{ selectedMovimentacao?.descricao }}</strong>?</p>
            <p class="warning-text">Esta ação não pode ser desfeita.</p>
          </div>
          
          <div class="modal-footer">
            <button class="cancel-button" @click="showDeleteModal = false">Cancelar</button>
            <button class="delete-button" @click="deleteMovimentacao" :disabled="isLoading">
              {{ isLoading ? 'Excluindo...' : 'Excluir' }}
            </button>
          </div>
        </div>
      </div>

      <!-- View Details Modal -->
      <div class="modal" v-if="showDetailsModal && selectedMovimentacao" @click="closeModal">
        <div class="modal-content details-modal" @click.stop>
          <div class="modal-header">
            <h2>Detalhes da Movimentação</h2>
            <button class="close-button" @click="closeModal">×</button>
          </div>
          
          <div class="modal-body">
            <div class="details-category">
              <span class="category-icon">{{ getCategoryIcon(selectedMovimentacao.categoria_receita || selectedMovimentacao.categoria_despesa) }}</span>
              <span class="category-name">{{ getCategoryName(selectedMovimentacao.categoria_receita || selectedMovimentacao.categoria_despesa) }}</span>
            </div>
            
            <h3 class="details-title">{{ selectedMovimentacao.tipo_mov == 'receita' ? 'Receita' : 'Despesa' }}</h3>
            
            
            <div class="details-grid">
              <div class="detail-item-inside">
                <div class="detail-icon">📝</div>
                <div class="detail-info">
                  <span class="detail-label">Descrição</span>
                  <span class="detail-value">{{ selectedMovimentacao.descricao }}</span>
                </div>
              </div>
              
              <div class="detail-item-inside">
                <div class="detail-icon">📅</div>
                <div class="detail-info">
                  <span class="detail-label">Mês e Ano</span>
                  <span class="detail-value">{{ selectedMovimentacao.mes }}/{{ selectedMovimentacao.ano }}</span>
                </div>
              </div>
              
              <div class="detail-item-inside">
                <div class="detail-icon">💰</div>
                <div class="detail-info">
                  <span class="detail-label">Valor</span>
                  <span class="detail-value">R$ {{ formatCurrency(selectedMovimentacao.valor) }}</span>
                </div>
              </div>
              
              <div class="detail-item-inside">
                <div class="detail-icon"></div>
                <div class="detail-info">
                  <span class="detail-label">Comprovante</span>
                  <button class="button-comprovante" @click="downloadComprovante(selectedMovimentacao.idmov)">Baixar</button>
                </div>
              </div>
              
              
              
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="cancel-button" @click="closeModal">Fechar</button>
            <button class="edit-button" @click="editFromDetails">Editar</button>
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
  name: 'Movimentacoes',
  components: {
    NavBar
  },
  data() {
    return {  
      movimentacoes: [],
      loading: true,
      error: null,
      isLoading: false,
      showAddModal: false,
      showEditModal: false,
      showEditModalFile: false,
      showDeleteModal: false,
      showDetailsModal: false,
      selectedMovimentacao: null,
      reservedValueError: '',
      formData: {
        tipo_mov: 'receita',
        categoria_receita: 'salario',
        categoria_despesa: 'alimentacao',
        descricao: '',
        mes: new Date().getMonth() + 1,
        ano: new Date().getFullYear(),
        valor: 0,
        comprovante_pdf: null
      },
      tipo_mov: {
        receita: { name: 'Receita', icon: '💵' },
        despesa: { name: 'Despesa', icon: '💸' }
      },
      categoria_receita: {
        salario: { value: 'salario', name: 'Salário', icon: '💵' },
        rendimento: { value: 'rendimento', name: 'Rendimento', icon: '💰' },
        presente: { value: 'presente', name: 'Presente', icon: '🎁' },
        venda: { value: 'venda', name: 'Venda', icon: '🛍️' },
        reembolso: { value: 'reembolso', name: 'Reembolso', icon: '💰' },
        outros: { value: 'outros', name: 'Outros', icon: '📌' },
      },
      categoria_despesa: {
        alimentacao: { value: 'alimentacao', name: 'Alimentação', icon: '🍔' },
        moradia: { value: 'moradia', name: 'Moradia', icon: '🏠' },
        transporte: { value: 'transporte', name: 'Transporte', icon: '🚗' },
        lazer: { value: 'lazer', name: 'Lazer', icon: '🎮' },
        saude: { value: 'saude', name: 'Saúde', icon: '🏥' },
        educacao: { value: 'educacao', name: 'Educação', icon: '🎓' },
        investimentos: { value: 'investimentos', name: 'Investimentos', icon: '💰' },
        outros: { value: 'outros', name: 'Outros', icon: '📌' },
      },
      filters: {
        month: 'all',
        year: 'all',
        tipo_mov: 'all',
        categoria: 'all'
      },
      availableYears: [],
    }
  },
  mounted() {
    this.fetchMovimentacoes();
  },
  computed: {
    availableCategories() {
      if (this.filters.tipo_mov === 'receita') {
        return Object.values(this.categoria_receita);
      } else if (this.filters.tipo_mov === 'despesa') {
        return Object.values(this.categoria_despesa);
      }
      return [];
    },
    filteredMovimentacoes() {
      if (this.filters.month === 'all' && this.filters.year === 'all' && this.filters.categoria === 'all' && this.filters.tipo_mov === 'all') {
        return this.movimentacoes;
      }

      return this.movimentacoes.filter(mov => {
        const matchesMonth = this.filters.month === 'all' || mov.mes === parseInt(this.filters.month);
        const matchesYear = this.filters.year === 'all' || mov.ano === parseInt(this.filters.year);
        const matchesTipoMov = this.filters.tipo_mov === 'all' || mov.tipo_mov === this.filters.tipo_mov;
        const matchesCategoria = this.filters.categoria === 'all' || mov.categoria_receita === this.filters.categoria || mov.categoria_despesa === this.filters.categoria;
        return matchesMonth && matchesYear && matchesTipoMov && matchesCategoria;
      });
    }
  },
  methods: {
    // API Communication
    async fetchMovimentacoes() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get('/Movimentacao');
        this.movimentacoes = response.data;
        this.availableYears = [...new Set(this.movimentacoes.map(mov => mov.ano))].sort();
        console.log(this.movimentacoes)
      } catch (error) {
        console.error('Error fetching movimentacoes:', error);
        this.error = 'Não foi possível carregar as movimentacoes. Por favor, tente novamente.';
      } finally {
        this.loading = false;
      }
    },
    
    async getMovimentacaoById(id) {
      try {
        const response = await axios.get(`/Movimentacao/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching movimentacao with id ${id}:`, error);
        throw error;
      }
    },
    
    async saveMovimentacao() {
      this.isLoading = true;
      
      try {

        if (parseFloat(this.formData.valor) <= 0) {
          alert('O valor não pode ser menor ou igual a 0.');
          this.isLoading = false;
          return;
        }

        if(parseInt(this.formData.mes) < 1 || parseInt(this.formData.mes) > 12) {
          alert('Mês inválido.');
          this.isLoading = false;
          return;
        }

        if(parseInt(this.formData.ano) < 0 || parseInt(this.formData.ano) > 2099) {
          alert('Ano inválido.');
          this.isLoading = false;
          return;
        }
        

        let payload = this.formData

        if (this.formData.tipo_mov == 'receita') {
          payload.categoria_despesa = null;
        } 
         
        if (this.formData.tipo_mov == 'despesa') {
          payload.categoria_receita = null;
        }

        const formDataToSend = new FormData();


        const movimentacaoObj = {
          valor: payload.valor,
          descricao: payload.descricao,
          mes: payload.mes,
          ano: payload.ano,
          tipo_mov: payload.tipo_mov,
          categoria_receita: payload.categoria_receita,
          categoria_despesa: payload.categoria_despesa
        }

        formDataToSend.append('movimentacao', JSON.stringify(movimentacaoObj));


        if (payload.comprovante_pdf) {
          formDataToSend.append('comprovante_pdf', payload.comprovante_pdf);
        } 


        if (this.formData.comprovante_pdf) {
          payload.comprovante_pdf = this.formData.comprovante_pdf;
        }

        if (this.showEditModal && this.selectedMovimentacao) {
          // Update existing movimentacao
          await axios.put(`/Movimentacao/${this.selectedMovimentacao.idmov}`, payload);
        }  
        
        if (this.showEditModalFile && this.selectedMovimentacao) {
          // Update existing movimentacao
          const formData = new FormData();
          if (payload.comprovante_pdf) {
            formData.append('comprovante_pdf', payload.comprovante_pdf);
          }
          await axios.put(`/Movimentacao/update_comprovante/${this.selectedMovimentacao.idmov}`, formData);
        } 
        
        if (!this.showEditModal && !this.showEditModalFile) {
          // Create new movimentacao
          await axios.post('/Movimentacao', formDataToSend);
        }
        
        // Refresh the list and close modal
        await this.fetchMovimentacoes();
        this.closeModal();
        
      } catch (error) {
        console.error('Error saving movimentacao:', error);
        alert('Erro ao salvar movimentacao. Por favor, tente novamente.');
      } finally {
        this.isLoading = false;
      }
    },
    
    async deleteMovimentacao() {
      if (!this.selectedMovimentacao) return;
      
      this.isLoading = true;
      try {
        await axios.delete(`/Movimentacao/${this.selectedMovimentacao.idmov}`);
        
        // Refresh the list and close modal
        await this.fetchMovimentacoes();
        this.showDeleteModal = false;
        this.selectedMovimentacao = null;
        
      } catch (error) {
        console.error('Error deleting movimentacao:', error);
        alert('Erro ao excluir movimentacao. Por favor, tente novamente.');
      } finally {
        this.isLoading = false;
      }
    },
    
    // Modal and UI Handlers
    editMovimentacao(movimentacao) {
      // Deep copy of the movimentacao to edit
      this.selectedMovimentacao = {...movimentacao};
      this.formData = {
        tipo_mov: movimentacao.tipo_mov,
        categoria_receita: movimentacao.categoria_receita,
        categoria_despesa: movimentacao.categoria_despesa,
        descricao: movimentacao.descricao,
        mes: movimentacao.mes,
        ano: movimentacao.ano,
        valor: movimentacao.valor,
      };
      this.showEditModal = true;
    },

    editMovimentacaoFile(movimentacao) {
      this.selectedMovimentacao = {...movimentacao};
      this.formData = {
        tipo_mov: movimentacao.tipo_mov,
        categoria_receita: movimentacao.categoria_receita,
        categoria_despesa: movimentacao.categoria_despesa,
        descricao: movimentacao.descricao,
        mes: movimentacao.mes,
        ano: movimentacao.ano,
        valor: movimentacao.valor,
        comprovante_pdf: movimentacao.comprovante_pdf
      };
      this.showEditModalFile = true;
    },

    downloadComprovante(idmov) {
      axios.get(`/Movimentacao/download_comprovante/${idmov}`, { responseType: 'blob' })
        .then(response => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const a = document.createElement('a');
          a.href = url;
          a.download = 'comprovante.pdf';
          a.click();
        })
        .catch(error => {
          console.error('Error downloading comprovante:', error);
          alert('Não há comprovante para este movimento.');
        });
    },
    
    viewDetails(movimentacao) {
      this.selectedMovimentacao = {...movimentacao};
      this.showDetailsModal = true;
    },
    
    confirmDelete(movimentacao) {
      this.selectedMovimentacao = {...movimentacao};
      this.showDeleteModal = true;
    },
    
    editFromDetails() {
      this.showDetailsModal = false;
      this.editMovimentacao(this.selectedMovimentacao);
    },
    
    closeModal() {
      this.showAddModal = false;
      this.showEditModal = false;
      this.showEditModalFile = false;
      this.showDeleteModal = false;
      this.showDetailsModal = false;
      this.resetForm();
    },
    
    resetForm() {
      this.formData = {
        tipo_mov: 'receita',
        categoria_receita: 'salario',
        categoria_despesa: 'alimentacao',
        descricao: '',
        mes: new Date().getMonth() + 1,
        ano: new Date().getFullYear(),
        valor: 0,
        comprovante: null
      };
      this.selectedMovimentacao = null;
    },
    
    // Utility Methods
    formatCurrency(value) {
      return parseFloat(value).toFixed(2).replace('.', ',');
    },

    getCategoryName(categoryKey) {
      return this.categoria_receita[categoryKey]?.name || this.categoria_despesa[categoryKey]?.name || 'Categoria';
    },
  
    getCategoryIcon(categoryKey) {
      return this.categoria_receita[categoryKey]?.icon || this.categoria_despesa[categoryKey]?.icon || '📌';
    },
  
    getCategoryClass(categoryKey) {
      return `category-${categoryKey}`;
    },

    handleFileUpload(event) {
        this.formData.comprovante_pdf = event.target.files[0];
    },

    resetFilters() {
      this.filters.month = 'all';
      this.filters.year = 'all';
      this.fetchMovimentacoes();
    },

    resetFiltersTipoMov() {
      this.filters.tipo_mov = 'all';
      this.filters.categoria = 'all';
      this.fetchMovimentacoes();
    }

  },
  
  watch: {
    'filters.tipo_mov'(newVal) {
      this.filters.categoria = 'all';
    }
  }

}
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

.goals-container {
  padding: 20px;
  width: 100%;
  max-width: 1200px;
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

.button-comprovante {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.2);
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

/* Stats Cards */
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  font-size: 2.5rem;
  margin-right: 20px;
}

.stat-content {
  flex-grow: 1;
}

.stat-card h3 {
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0 0 8px 0;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
  color: #333;
}

.total-goals {
  border-left: 5px solid #4CAF50;
}

.total-goals .stat-icon {
  color: #4CAF50;
}

.completed-goals {
  border-left: 5px solid #f32121;
}

.completed-goals .stat-icon {
  color: #2196F3;
}

.in-progress {
  border-left: 5px solid #FF9800;
}

.in-progress .stat-icon {
  color: #FF9800;
}

/* Loading and Error */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 40px 0;
  height: 100vh;
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

/* Goals Grid */
.goals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.goal-card {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  border-top: 6px solid #BDBDBD;
  display: flex;
  flex-direction: column;
}

.goal-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.1);
}

.goal-category {
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

.goal-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 15px 0;
  color: #333;
}

.goal-progress {
  margin-bottom: 15px;
}

.progress-bar {
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress {
  height: 100%;
  background-color: #4CAF50;
  border-radius: 4px;
}

.progress-text {
  font-size: 0.8rem;
  color: #757575;
  text-align: right;
  margin: 0;
}

.progress-amount {
  font-size: 0.9rem;
  margin-top: 5px;
  color: #424242;
}

.goal-details {
  margin-bottom: 15px;
  flex-grow: 1;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.detail-item-inside {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.detail-label {
  color: #757575;
  font-size: 0.9rem;
}

.detail-value {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.goal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.action-button {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
}

.action-button.edit {
  background-color: #FFF9C4;
}

.action-button.edit:hover {
  background-color: #FFF176;
}

.action-button.view {
  background-color: #E3F2FD;
}

.action-button.view:hover {
  background-color: #BBDEFB;
}

.action-button.delete {
  background-color: #FFEBEE;
}

.action-button.delete:hover {
  background-color: #FFCDD2;
}

.action-icon {
  font-size: 1.1rem;
}

/* Category Classes for Card Borders */
.category-salario {
  border-color: #4CAF50; /* verde */
}

.category-rendimento {
  border-color: #8BC34A; /* verde claro */
}

.category-presente {
  border-color: #E91E63; /* rosa */
}

.category-venda {
  border-color: #FFC107; /* amarelo */
}

.category-reembolso {
  border-color: #00BCD4; /* ciano */
}

.category-outros {
  border-color: #607D8B; /* cinza azulado */
}

.category-alimentacao {
  border-color: #FF5722; /* laranja forte */
}

.category-moradia {
  border-color: #9C27B0; /* roxo */
}

.category-transporte {
  border-color: #3F51B5; /* azul escuro */
}

.category-lazer {
  border-color: #03A9F4; /* azul claro */
}

.category-saude {
  border-color: #F44336; /* vermelho */
}

.category-educacao {
  border-color: #673AB7; /* roxo escuro */
}

.category-investimentos {
  border-color: #009688; /* teal */
}

.category-outros {
  border-color: #607D8B; /* cinza azulado */
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

/* Form Styles */
.form-group {
  margin-bottom: 20px;
}

.form-file {
  color: #424242;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.form-row {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.form-group.half {
  flex: 1;
}

label {
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

.cancel-button {
  background-color: #F5F5F5;
  color: #424242;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.cancel-button:hover {
  background-color: #E0E0E0;
}

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

.delete-button {
  background-color: #F44336;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.delete-button:hover {
  background-color: #D32F2F;
  box-shadow: 0 4px 8px rgba(244, 67, 54, 0.2);
}

.delete-button:disabled {
  background-color: #FFCDD2;
  color: #424242;
  cursor: not-allowed;
  box-shadow: none;
}

.edit-button {
  background-color: #FFC107;
  color: #212121;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.edit-button:hover {
  background-color: #FFB300;
  box-shadow: 0 4px 8px rgba(255, 193, 7, 0.2);
}

.delete-modal .warning-text {
  color: #F44336;
  font-weight: 500;
  margin-top: 10px;
}

.warning-text {
  color: #F44336;
  font-weight: 500;
}

/* Details Modal Styles */
.details-modal .modal-body {
  padding: 0;
}

.details-category {
  padding: 20px;
  background-color: #e8f5e9;
  display: flex;
  align-items: center;
  gap: 10px;
}

.details-title {
  font-size: 1.8rem;
  margin: 20px;
  color: #333;
}

.details-progress {
  padding: 0 20px 20px;
  border-bottom: 1px solid #eee;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  padding: 20px;
}

.details-grid .detail-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 0;
}

.detail-icon {
  font-size: 1.6rem;
  margin-right: 10px;
  color: #4CAF50;
}

.detail-info {
  display: flex;
  flex-direction: column;
}

.detail-info .detail-label {
  font-size: 0.8rem;
  margin-bottom: 5px;
}

.detail-info .detail-value {
  font-size: 1.1rem;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .goals-container {
    padding: 15px;
  }
  
  .goals-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .modal-content {
    width: 95%;
  }
  
  .page-header h1 {
    font-size: 1.6rem;
  }
  
  .page-header p {
    font-size: 0.9rem;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
}

/* Add error text styling */
.error-text {
  color: #F44336;
  font-size: 0.8rem;
  margin-top: 5px;
  margin-bottom: 0;
}

.delete-modal .modal-body {
  padding: 20px;
  color: #333;
}

.delete-modal p {
  font-size: 1.1rem;
  margin-bottom: 10px;
  color: #333;
}

/* Filter Section Styles */
.filter-section {
  margin-bottom: 30px;
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.filter-section h3 {
  margin-top: 15px;
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
  flex: 1
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
</style> 