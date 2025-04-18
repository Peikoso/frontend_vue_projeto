<template>
  <div class="page-container">
    <NavBar />
    <div class="goals-container">
      <div class="page-header">
        <h1>Metas Financeiras</h1>
        <p>Gerencie suas metas e acompanhe seu progresso financeiro</p>
      </div>

      <!-- Add Meta Button and Modal -->
      <div class="add-button-container">
        <button class="add-button" @click="showAddModal = true">
          <span class="plus-icon">+</span> Nova Meta
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="stats-container">
        <div class="stat-card total-goals">
          <div class="stat-icon">🎯</div>
          <div class="stat-content">
            <h3>Total de Metas</h3>
            <p class="stat-number">{{ metas.length }}</p>
          </div>
        </div>
        <div class="stat-card completed-goals">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <h3>Metas Completas</h3>
            <p class="stat-number">{{ completedGoals }}</p>
          </div>
        </div>
        <div class="stat-card in-progress">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <h3>Em Progresso</h3>
            <p class="stat-number">{{ metas.length - completedGoals }}</p>
          </div>
        </div>
      </div>

      <!-- Loading and Error Messages -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Carregando metas...</p>
      </div>

      <div v-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="fetchMetas" class="retry-button">Tentar novamente</button>
      </div>

      <!-- Goals List -->
      <div v-if="!loading && !error && metas.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <h2>Nenhuma meta cadastrada</h2>
        <p>Clique em "Nova Meta" para começar a planejar seu futuro financeiro.</p>
      </div>

      <div v-if="!loading && !error && metas.length > 0" class="goals-grid">
        <div v-for="meta in metas" :key="meta.id_meta" class="goal-card" :class="getCategoryClass(meta.categ)">
          <div class="goal-category">
            <span class="category-icon">{{ getCategoryIcon(meta.categ) }}</span>
            <span class="category-name">{{ getCategoryName(meta.categ) }}</span>
          </div>
          <h3 class="goal-title">{{ meta.descri }}</h3>
          
          <div class="goal-progress">
            <div class="progress-bar">
              <div class="progress" :style="{ width: getProgressPercentage(meta) + '%' }"></div>
            </div>
            <p class="progress-text">{{ getProgressPercentage(meta) }}% completo</p>
          </div>
          
          <div class="goal-details">
            <div class="detail-item">
              <span class="detail-label">Meta:</span>
              <span class="detail-value">R$ {{ formatCurrency(meta.valor) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Reservado:</span>
              <span class="detail-value">R$ {{ formatCurrency(meta.valor_reservado) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Prazo:</span>
              <span class="detail-value">{{ formatDate(meta.data_fim) }}</span>
            </div>
          </div>
          
          <div class="goal-actions">
            <button class="action-button edit" @click="editMeta(meta)">
              <span class="action-icon">✏️</span>
            </button>
            <button class="action-button view" @click="viewDetails(meta)">
              <span class="action-icon">👁️</span>
            </button>
            <button class="action-button delete" @click="confirmDelete(meta)">
              <span class="action-icon">🗑️</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div class="modal" v-if="showAddModal || showEditModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>{{ showEditModal ? 'Editar Meta' : 'Nova Meta' }}</h2>
            <button class="close-button" @click="closeModal">×</button>
          </div>
          
          <div class="modal-body">
            <div class="form-group">
              <label for="categoria">Categoria</label>
              <select id="categoria" v-model="formData.categ" required class="form-input">
                <option value="viagem">Viagem</option>
                <option value="casa">Casa</option>
                <option value="carro">Carro</option>
                <option value="educacao">Educação</option>
                <option value="aposentadoria">Aposentadoria</option>
                <option value="fundo_de_emergencia">Fundo de Emergência</option>
                <option value="eletronico">Eletrônico</option>
                <option value="reforma">Reforma</option>
                <option value="abrir_negocio">Abrir Negócio</option>
                <option value="outros">Outros</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="descricao">Descrição</label>
              <input type="text" id="descricao" v-model="formData.descri" required class="form-input" placeholder="Ex: Viagem para a Europa">
            </div>
            
            <div class="form-row">
              <div class="form-group half">
                <label for="data_inicio">Data de Início</label>
                <input type="date" id="data_inicio" v-model="formData.data_inicio" required class="form-input">
              </div>
              
              <div class="form-group half">
                <label for="data_fim">Data Final</label>
                <input type="date" id="data_fim" v-model="formData.data_fim" required class="form-input">
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group half">
                <label for="valor">Valor Total (R$)</label>
                <input type="number" id="valor" v-model="formData.valor" required class="form-input" min="0" step="0.01">
              </div>
              
              <div class="form-group half">
                <label for="valor_reservado">Valor Reservado (R$)</label>
                <input 
                  type="number" 
                  id="valor_reservado" 
                  v-model="formData.valor_reservado" 
                  required 
                  class="form-input" 
                  min="0" 
                  :max="formData.valor"
                  step="0.01"
                  @input="validateReservedValue"
                >
                <p v-if="reservedValueError" class="error-text">{{ reservedValueError }}</p>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="cancel-button" @click="closeModal">Cancelar</button>
            <button class="save-button" @click="saveMeta" :disabled="isLoading">
              {{ isLoading ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div class="modal" v-if="showDeleteModal">
        <div class="modal-content delete-modal">
          <div class="modal-header">
            <h2>Excluir Meta</h2>
            <button class="close-button" @click="showDeleteModal = false">×</button>
          </div>
          
          <div class="modal-body">
            <p>Tem certeza que deseja excluir a meta <strong>{{ selectedMeta?.descri }}</strong>?</p>
            <p class="warning-text">Esta ação não pode ser desfeita.</p>
          </div>
          
          <div class="modal-footer">
            <button class="cancel-button" @click="showDeleteModal = false">Cancelar</button>
            <button class="delete-button" @click="deleteMeta" :disabled="isLoading">
              {{ isLoading ? 'Excluindo...' : 'Excluir' }}
            </button>
          </div>
        </div>
      </div>

      <!-- View Details Modal -->
      <div class="modal" v-if="showDetailsModal && selectedMeta">
        <div class="modal-content details-modal">
          <div class="modal-header">
            <h2>Detalhes da Meta</h2>
            <button class="close-button" @click="showDetailsModal = false">×</button>
          </div>
          
          <div class="modal-body">
            <div class="details-category" :class="getCategoryClass(selectedMeta.categ)">
              <span class="category-icon">{{ getCategoryIcon(selectedMeta.categ) }}</span>
              <span class="category-name">{{ getCategoryName(selectedMeta.categ) }}</span>
            </div>
            
            <h3 class="details-title">{{ selectedMeta.descri }}</h3>
            
            <div class="details-progress">
              <div class="progress-bar">
                <div class="progress" :style="{ width: getProgressPercentage(selectedMeta) + '%' }"></div>
              </div>
              <p class="progress-text">{{ getProgressPercentage(selectedMeta) }}% completo</p>
              <p class="progress-amount">R$ {{ formatCurrency(selectedMeta.valor_reservado) }} de R$ {{ formatCurrency(selectedMeta.valor) }}</p>
            </div>
            
            <div class="details-grid">
              <div class="detail-item">
                <div class="detail-icon">🗓️</div>
                <div class="detail-info">
                  <span class="detail-label">Data de Início</span>
                  <span class="detail-value">{{ formatDate(selectedMeta.data_inicio) }}</span>
                </div>
              </div>
              
              <div class="detail-item">
                <div class="detail-icon">⏰</div>
                <div class="detail-info">
                  <span class="detail-label">Data Final</span>
                  <span class="detail-value">{{ formatDate(selectedMeta.data_fim) }}</span>
                </div>
              </div>
              
              <div class="detail-item">
                <div class="detail-icon">💰</div>
                <div class="detail-info">
                  <span class="detail-label">Valor Total</span>
                  <span class="detail-value">R$ {{ formatCurrency(selectedMeta.valor) }}</span>
                </div>
              </div>
              
              <div class="detail-item">
                <div class="detail-icon">💹</div>
                <div class="detail-info">
                  <span class="detail-label">Valor Reservado</span>
                  <span class="detail-value">R$ {{ formatCurrency(selectedMeta.valor_reservado) }}</span>
                </div>
              </div>
              
              <div class="detail-item">
                <div class="detail-icon">📊</div>
                <div class="detail-info">
                  <span class="detail-label">Falta Reservar</span>
                  <span class="detail-value">R$ {{ formatCurrency(selectedMeta.valor - selectedMeta.valor_reservado) }}</span>
                </div>
              </div>
              
              <div class="detail-item">
                <div class="detail-icon">📅</div>
                <div class="detail-info">
                  <span class="detail-label">Dias Restantes</span>
                  <span class="detail-value">{{ getDaysRemaining(selectedMeta.data_fim) }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="cancel-button" @click="showDetailsModal = false">Fechar</button>
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
  name: 'Metas',
  components: {
    NavBar
  },
  data() {
    return {
      metas: [],
      loading: true,
      error: null,
      isLoading: false,
      showAddModal: false,
      showEditModal: false,
      showDeleteModal: false,
      showDetailsModal: false,
      selectedMeta: null,
      reservedValueError: '',
      formData: {
        categ: 'viagem',
        descri: '',
        data_inicio: this.getCurrentDate(),
        data_fim: this.getDefaultEndDate(),
        valor: 0,
        valor_reservado: 0
      },
      categories: {
        viagem: { name: 'Viagem', icon: '✈️' },
        casa: { name: 'Casa', icon: '🏠' },
        carro: { name: 'Carro', icon: '🚗' },
        educacao: { name: 'Educação', icon: '🎓' },
        aposentadoria: { name: 'Aposentadoria', icon: '👴' },
        fundo_de_emergencia: { name: 'Fundo de Emergência', icon: '🧰' },
        eletronico: { name: 'Eletrônico', icon: '📱' },
        reforma: { name: 'Reforma', icon: '🔨' },
        abrir_negocio: { name: 'Abrir Negócio', icon: '🏪' },
        outros: { name: 'Outros', icon: '📌' }
      }
    }
  },
  computed: {
    completedGoals() {
      return this.metas.filter(meta => 
        meta.valor_reservado >= meta.valor
      ).length;
    }
  },
  mounted() {
    this.fetchMetas();
  },
  methods: {
    // API Communication
    async fetchMetas() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get('/Meta');
        this.metas = response.data;
      } catch (error) {
        console.error('Error fetching metas:', error);
        this.error = 'Não foi possível carregar as metas. Por favor, tente novamente.';
      } finally {
        this.loading = false;
      }
    },
    
    async getMetaById(id) {
      try {
        const response = await axios.get(`/Meta/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching meta with id ${id}:`, error);
        throw error;
      }
    },
    
    async saveMeta() {
      this.isLoading = true;
      
      // Validate that valor_reservado doesn't exceed valor
      if (parseFloat(this.formData.valor_reservado) > parseFloat(this.formData.valor)) {
        alert('O valor reservado não pode ser maior que o valor total da meta.');
        this.isLoading = false;
        return;
      }
      
      if(this.formData.data_inicio > this.formData.data_fim){
        alert('A data de início não pode ser maior que a data de fim.');
        this.isLoading = false;
        return;
      }

      try {
        if (this.showEditModal && this.selectedMeta) {
          // Update existing meta
          await axios.put(`/Meta/${this.selectedMeta.id_meta}`, this.formData);
        } else {
          // Create new meta
          await axios.post('/Meta', this.formData);
        }
        
        // Refresh the list and close modal
        await this.fetchMetas();
        this.closeModal();
        
      } catch (error) {
        console.error('Error saving meta:', error);
        alert('Erro ao salvar meta. Por favor, tente novamente.');
      } finally {
        this.isLoading = false;
      }
    },
    
    async deleteMeta() {
      if (!this.selectedMeta) return;
      
      this.isLoading = true;
      try {
        await axios.delete(`/Meta/${this.selectedMeta.id_meta}`);
        
        // Refresh the list and close modal
        await this.fetchMetas();
        this.showDeleteModal = false;
        this.selectedMeta = null;
        
      } catch (error) {
        console.error('Error deleting meta:', error);
        alert('Erro ao excluir meta. Por favor, tente novamente.');
      } finally {
        this.isLoading = false;
      }
    },
    
    // Modal and UI Handlers
    editMeta(meta) {
      // Deep copy of the meta to edit
      this.selectedMeta = {...meta};
      this.formData = {
        categ: meta.categ,
        descri: meta.descri,
        data_inicio: meta.data_inicio,
        data_fim: meta.data_fim,
        valor: meta.valor,
        valor_reservado: meta.valor_reservado
      };
      this.showEditModal = true;
    },
    
    viewDetails(meta) {
      this.selectedMeta = {...meta};
      this.showDetailsModal = true;
    },
    
    confirmDelete(meta) {
      this.selectedMeta = {...meta};
      this.showDeleteModal = true;
    },
    
    editFromDetails() {
      this.showDetailsModal = false;
      this.editMeta(this.selectedMeta);
    },
    
    closeModal() {
      this.showAddModal = false;
      this.showEditModal = false;
      this.resetForm();
    },
    
    resetForm() {
      this.formData = {
        categ: 'viagem',
        descri: '',
        data_inicio: this.getCurrentDate(),
        data_fim: this.getDefaultEndDate(),
        valor: 0,
        valor_reservado: 0
      };
      this.selectedMeta = null;
    },
    
    // Utility Methods
    getCurrentDate() {
      const date = new Date();
      return date.toISOString().split('T')[0];
    },
    
    getDefaultEndDate() {
      const date = new Date();
      date.setMonth(date.getMonth() + 6); // Default to 6 months from now
      return date.toISOString().split('T')[0];
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      return new Date(dateString).toLocaleDateString('pt-BR', options);
    },
    
    formatCurrency(value) {
      return parseFloat(value).toFixed(2).replace('.', ',');
    },
    
    getProgressPercentage(meta) {
      if (!meta || meta.valor <= 0) return 0;
      const percentage = (meta.valor_reservado / meta.valor) * 100;
      return Math.min(100, Math.round(percentage));
    },
    
    getDaysRemaining(targetDate) {
      if (!targetDate) return 'N/A';
      
      const target = new Date(targetDate);
      const today = new Date();
      
      // Reset hours to compare just dates
      target.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      const timeDiff = target.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      if (daysDiff < 0) return 'Expirado';
      if (daysDiff === 0) return 'Hoje';
      return daysDiff + ' dias';
    },
    
    // Category Methods
    getCategoryName(categoryKey) {
      return this.categories[categoryKey]?.name || 'Categoria';
    },
    
    getCategoryIcon(categoryKey) {
      return this.categories[categoryKey]?.icon || '📌';
    },
    
    getCategoryClass(categoryKey) {
      return `category-${categoryKey}`;
    },

    // Add method to validate valor_reservado in real-time
    validateReservedValue() {
      if (parseFloat(this.formData.valor_reservado) > parseFloat(this.formData.valor)) {
        this.reservedValueError = 'O valor reservado não pode exceder o valor total';
      } else {
        this.reservedValueError = '';
      }
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
  border-left: 5px solid #2196F3;
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
.category-viagem {
  border-color: #2196F3;
}

.category-casa {
  border-color: #9C27B0;
}

.category-carro {
  border-color: #F44336;
}

.category-educacao {
  border-color: #4CAF50;
}

.category-aposentadoria {
  border-color: #FF9800;
}

.category-fundo_de_emergencia {
  border-color: #673AB7;
}

.category-eletronico {
  border-color: #00BCD4;
}

.category-reforma {
  border-color: #795548;
}

.category-abrir_negocio {
  border-color: #FF5722;
}

.category-outros {
  border-color: #607D8B;
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
  background-color: #f5f5f5;
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
</style> 