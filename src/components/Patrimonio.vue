<template>
  <div class="page-container">
    <NavBar />
    <div class="content-container">
      <div class="page-header">
        <h1>Gerenciamento de Patrimônio</h1>
        <p class="subtitle">Cadastre e gerencie seus bens e propriedades</p>
      </div>

      <!-- Loading Spinner -->
      <div v-if="loading" class="loading-spinner-container">
        <div class="loading-spinner"></div>
      </div>

      <!-- Main Content -->
      <div v-else class="main-content">
        <!-- Add/Edit Form -->
        <div class="form-container">
          <h2>{{ isEditing ? 'Editar Bem' : 'Adicionar Novo Bem' }}</h2>
          <form @submit.prevent="saveBem">
            <div class="form-group">
              <label for="nome">Nome do Bem</label>
              <input 
                type="text" 
                id="nome" 
                v-model="formData.nome" 
                required 
                placeholder="Ex: Apartamento, Carro, etc."
                class="form-input"
              >
            </div>

            <div class="form-group">
              <label for="classe">Tipo de Bem</label>
              <select 
                id="classe" 
                v-model="formData.classe" 
                required
                class="form-input"
              >
                <option value="bem_imovel">Bem Imóvel</option>
                <option value="bem_movel">Bem Móvel</option>
                <option value="investimento">Investimento</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="direito_a_receber">Direito a Receber</option>
                <option value="participacao_societaria">Participação Societária</option>
                <option value="propriedade_intelectual">Propriedade Intelectual</option>
                <option value="outros">Outros</option>
              </select>
            </div>

            <div class="form-group">
              <label for="valor">Valor do Bem (R$)</label>
              <input 
                type="number" 
                id="valor" 
                v-model.number="formData.valor" 
                min="0" 
                step="0.01" 
                required
                placeholder="Valor em reais"
                class="form-input"
              >
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-save">
                {{ isEditing ? 'Atualizar' : 'Adicionar' }}
              </button>
              <button 
                v-if="isEditing" 
                type="button" 
                class="btn-cancel" 
                @click="cancelEdit"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>

        <!-- Assets List -->
        <div class="assets-list-container">
          <h2>Seus Bens Cadastrados</h2>
          
          <div v-if="patrimonio.length === 0" class="no-assets">
            <p>Você ainda não possui bens cadastrados.</p>
            <p>Utilize o formulário para adicionar seu primeiro bem.</p>
          </div>

          <div v-else class="assets-list">
            <div v-for="bem in patrimonio" :key="bem.idbem" class="asset-card">
              <div class="asset-icon">
                <span v-if="bem.classe === 'bem_imovel'">🏠</span>
                <span v-else-if="bem.classe === 'bem_movel'">🚗</span>
                <span v-else-if="bem.classe === 'investimento'">📈</span>
                <span v-else-if="bem.classe === 'dinheiro'">💰</span>
                <span v-else-if="bem.classe === 'direito_a_receber'">📝</span>
                <span v-else-if="bem.classe === 'participacao_societaria'">🏢</span>
                <span v-else-if="bem.classe === 'propriedade_intelectual'">💡</span>
                <span v-else>📦</span>
              </div>
              <div class="asset-details">
                <h3>{{ bem.nome }}</h3>
                <p class="asset-class">
                  {{ getClasseDisplay(bem.classe) }}
                </p>
                <p class="asset-value">
                  R$ {{ bem.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
                </p>
              </div>
              <div class="asset-actions">
                <button @click="editBem(bem)" class="btn-edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="confirmDelete(bem)" class="btn-delete">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Patrimônio Summary -->
      <div v-if="!loading && patrimonio.length > 0" class="patrimonio-summary">
        <div class="summary-card">
          <h3>Patrimônio Total</h3>
          <p class="total-value">
            R$ {{ calcularPatrimonioTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
          </p>
          <div class="summary-chart">
            <div 
              v-for="(porcentagem, classe) in porcentagemPorClasse" 
              :key="classe"
              class="chart-segment"
              :class="`bg-${classe}`"
              :style="{ width: `${porcentagem}%` }"
              :title="`${getClasseDisplay(classe)}: ${porcentagem.toFixed(1)}%`"
            ></div>
          </div>
          <div class="chart-legend">
            <div v-for="(porcentagem, classe) in porcentagemPorClasse" :key="classe" class="legend-item">
              <div class="legend-color" :class="`bg-${classe}`"></div>
              <div class="legend-text">
                {{ getClasseDisplay(classe) }}: {{ porcentagem.toFixed(1) }}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal" v-if="showDeleteModal">
      <div class="modal-content delete-modal">
        <div class="modal-header">
          <h3>Confirmar Exclusão</h3>
          <span class="close-btn" @click="showDeleteModal = false">&times;</span>
        </div>
        <div class="modal-body">
          <p>Tem certeza que deseja excluir o bem <strong>{{ bemToDelete?.nome }}</strong>?</p>
          <p>Esta ação não pode ser desfeita.</p>
        </div>
        <div class="modal-footer">
          <button @click="showDeleteModal = false" class="btn-cancel">Cancelar</button>
          <button @click="deleteBem" class="btn-confirm-delete">Excluir</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from './NavBar.vue';
import axios from 'axios';

export default {
  name: 'Patrimonio',
  components: {
    NavBar
  },
  data() {
    return {
      loading: true,
      patrimonio: [],
      isEditing: false,
      formData: {
        nome: '',
        classe: 'bem_imovel',
        valor: 0
      },
      currentBemId: null,
      showDeleteModal: false,
      bemToDelete: null
    };
  },
  computed: {
    calcularPatrimonioTotal() {
      return this.patrimonio.reduce((total, bem) => total + bem.valor, 0);
    },
    porcentagemPorClasse() {
      const total = this.calcularPatrimonioTotal;
      if (total === 0) return {};
      
      const porcentagens = {};
      
      // Agrupar valores por classe
      const valoresPorClasse = this.patrimonio.reduce((acc, bem) => {
        acc[bem.classe] = (acc[bem.classe] || 0) + bem.valor;
        return acc;
      }, {});
      
      // Calcular porcentagens
      Object.keys(valoresPorClasse).forEach(classe => {
        porcentagens[classe] = (valoresPorClasse[classe] / total) * 100;
      });
      
      return porcentagens;
    }
  },
  mounted() {
    this.fetchPatrimonio();
  },
  methods: {
    async fetchPatrimonio() {
      this.loading = true;
      try {
        const response = await axios.get('/Patrimonio/');
        this.patrimonio = response.data;
      } catch (error) {
        console.error('Erro ao buscar dados de patrimônio:', error);
        alert('Não foi possível carregar seu patrimônio. Por favor, tente novamente.');
      } finally {
        this.loading = false;
      }
    },
    
    resetForm() {
      this.formData = {
        nome: '',
        classe: 'bem_imovel',
        valor: 0
      };
      this.isEditing = false;
      this.currentBemId = null;
    },
    
    editBem(bem) {
      this.isEditing = true;
      this.currentBemId = bem.idbem;
      this.formData = {
        nome: bem.nome,
        classe: bem.classe,
        valor: bem.valor
      };
      
      // Scroll to form
      document.querySelector('.form-container').scrollIntoView({ 
        behavior: 'smooth' 
      });
    },
    
    cancelEdit() {
      this.resetForm();
    },
    
    async saveBem() {
      try {
        if (this.isEditing) {
          // Update existing bem
          await axios.put(`/Patrimonio/${this.currentBemId}`, this.formData);
          alert('Bem atualizado com sucesso!');
        } else {
          // Create new bem
          await axios.post('/Patrimonio/', this.formData);
          alert('Bem adicionado com sucesso!');
        }
        
        // Refresh data and reset form
        await this.fetchPatrimonio();
        this.resetForm();
      } catch (error) {
        console.error('Erro ao salvar bem:', error);
        if (error.response && error.response.data && error.response.data.detail) {
          alert(`Erro: ${error.response.data.detail}`);
        } else {
          alert('Ocorreu um erro ao salvar. Por favor, tente novamente.');
        }
      }
    },
    
    confirmDelete(bem) {
      this.bemToDelete = bem;
      this.showDeleteModal = true;
    },
    
    async deleteBem() {
      if (!this.bemToDelete) return;
      
      try {
        await axios.delete(`/Patrimonio/${this.bemToDelete.idbem}`);
        
        // Close modal and refresh data
        this.showDeleteModal = false;
        this.bemToDelete = null;
        await this.fetchPatrimonio();
        
        alert('Bem removido com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir bem:', error);
        if (error.response && error.response.data && error.response.data.detail) {
          alert(`Erro: ${error.response.data.detail}`);
        } else {
          alert('Ocorreu um erro ao excluir. Por favor, tente novamente.');
        }
      }
    },
    
    getClasseDisplay(classe) {
      const classes = {
        'bem_imovel': 'Bem Imóvel',
        'bem_movel': 'Bem Móvel',
        'investimento': 'Investimento',
        'dinheiro': 'Dinheiro',
        'direito_a_receber': 'Direito a Receber',
        'participacao_societaria': 'Participação Societária',
        'propriedade_intelectual': 'Propriedade Intelectual',
        'outros': 'Outros'
      };
      
      return classes[classe] || classe;
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

.content-container {
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

/* Loading Spinner */
.loading-spinner-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(76, 175, 80, 0.3);
  border-radius: 50%;
  border-top-color: #4CAF50;
  animation: spin 1s infinite linear;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Main Content Layout */
.main-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;
}

/* Form Styles */
.form-container {
  background-color: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.form-container h2 {
  color: #4CAF50;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  transition: border 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 25px;
}

.btn-save,
.btn-cancel {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-save {
  background-color: #4CAF50;
  color: white;
}

.btn-save:hover {
  background-color: #45a049;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-cancel {
  background-color: #f5f5f5;
  color: #333;
}

.btn-cancel:hover {
  background-color: #e0e0e0;
}

/* Assets List Styles */
.assets-list-container {
  background-color: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.assets-list-container h2 {
  color: #4CAF50;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.no-assets {
  text-align: center;
  color: #757575;
  padding: 30px 0;
  line-height: 1.6;
}

.assets-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.asset-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  transition: all 0.3s;
  border: 1px solid #eee;
}

.asset-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.asset-icon {
  font-size: 2rem;
  margin-right: 15px;
  background-color: rgba(76, 175, 80, 0.1);
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.asset-details {
  flex-grow: 1;
}

.asset-details h3 {
  margin: 0 0 5px 0;
  font-size: 1.1rem;
  color: #333;
}

.asset-class {
  color: #757575;
  margin: 0 0 5px 0;
  font-size: 0.9rem;
}

.asset-value {
  color: #4CAF50;
  font-weight: 600;
  margin: 0;
  font-size: 1.1rem;
}

.asset-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-edit,
.btn-delete {
  border: none;
  background: none;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s;
  font-size: 1.1rem;
}

.btn-edit {
  color: #2196F3;
}

.btn-edit:hover {
  background-color: rgba(33, 150, 243, 0.1);
  transform: scale(1.05);
}

.btn-delete {
  color: #F44336;
}

.btn-delete:hover {
  background-color: rgba(244, 67, 54, 0.1);
  transform: scale(1.05);
}

/* Summary Card */
.patrimonio-summary {
  margin-top: 30px;
}

.summary-card {
  background-color: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.summary-card h3 {
  color: #4CAF50;
  margin-bottom: 10px;
  text-align: center;
}

.total-value {
  font-size: 2rem;
  color: #333;
  font-weight: 600;
  text-align: center;
  margin-bottom: 20px;
}

.summary-chart {
  height: 30px;
  display: flex;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 15px;
}

.chart-segment {
  height: 100%;
  transition: width 0.5s;
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.legend-color {
  width: 15px;
  height: 15px;
  border-radius: 3px;
}

.legend-text {
  font-size: 0.9rem;
  color: #757575;
}

/* Class colors */
.bg-bem_imovel {
  background-color: #4CAF50; /* Green */
}

.bg-bem_movel {
  background-color: #2196F3; /* Blue */
}

.bg-investimento {
  background-color: #FFC107; /* Amber */
}

.bg-dinheiro {
  background-color: #00BCD4; /* Cyan */
}

.bg-direito_a_receber {
  background-color: #673AB7; /* Deep Purple */
}

.bg-participacao_societaria {
  background-color: #FF5722; /* Deep Orange */
}

.bg-propriedade_intelectual {
  background-color: #E91E63; /* Pink */
}

.bg-outros {
  background-color: #9E9E9E; /* Grey */
}

/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
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
  border-radius: 10px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.delete-modal .modal-header {
  background-color: #ffebee;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.delete-modal .modal-header h3 {
  color: #d32f2f;
  margin: 0;
}

.close-btn {
  font-size: 1.5rem;
  cursor: pointer;
  color: #757575;
}

.delete-modal .modal-body {
  padding: 20px;
  color: #333;
}

.delete-modal p {
  font-size: 1.1rem;
  margin-bottom: 10px;
}

.delete-modal .modal-footer {
  padding: 15px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background-color: #f9f9f9;
}

.btn-confirm-delete {
  background-color: #d32f2f;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-confirm-delete:hover {
  background-color: #c62828;
}

.btn-confirm-delete::before {
  content: "🗑️";
  font-size: 1.2rem;
}

/* Responsive Design */
@media (max-width: 900px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .content-container {
    padding: 15px;
  }
}
</style> 