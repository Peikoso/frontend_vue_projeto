<template>
  <div class="page-container">
    <NavBar />
    <div class="content-container">
      <div class="header">
        <div class="add-button" @click="showModal = true">
          Adicionar <i class="fa-solid fa-plus"></i>
        </div>
        <div class="month-selector">
          <button class="nav-button" @click="previousMonth">
            ◄
          </button>
          <input 
            type="month" 
            class="month-input"
            :value="currentDate.toISOString().slice(0, 7)"
            @change="handleMonthChange($event)"
          >
          <button class="nav-button" @click="nextMonth">
            ►
          </button>
        </div>
      </div>

      <div class="table-header">
        <div class="th categoria">Categoria</div>
        <div class="th descricao">Descrição</div>
        <div class="th classificacao">Classificação</div>
        <div class="th valor">Valor</div>
        <div class="th data">Data</div>
        <div class="th status">Status</div>
      </div>

      <div class="transactions-list">
        <div v-for="transaction in filteredTransactions" :key="transaction.id" class="transaction-item">
          <div class="td categoria">
            <div class="icon-wrapper" :class="transaction.categoria">
              {{ getCategoryIcon(transaction.categoria) }}
            </div>
          </div>
          <div class="td descricao">{{ transaction.descricao }}</div>
          <div class="td classificacao">{{ transaction.classificacao }}</div>
          <div class="td valor" :class="{ negative: transaction.valor < 0 }">
            {{ formatCurrency(transaction.valor) }}
          </div>
          <div class="td data">{{ formatDate(transaction.data) }}</div>
          <div class="td status" :class="transaction.status.toLowerCase().replace(' ', '-')">
            {{ transaction.status }}
          </div>
        </div>
      </div>

      <div class="total-section">
        <div class="total-label">Receitas {{ formatMonthYear }}</div>
        <div class="total-value" :class="{ negative: totalValue < 0 }">
          {{ formatCurrency(totalValue) }}
        </div>
      </div>

      <!-- Modal de Adição -->
      <div v-if="showModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Nova Transação</h2>
            <span class="close" @click="showModal = false">&times;</span>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class="form-group">
                <label>Categoria</label>
                <select v-model="newTransaction.categoria" required>
                  <option value="moradia">Moradia</option>
                  <option value="alimentacao">Alimentação</option>
                  <option value="transporte">Transporte</option>
                  <option value="saude">Saúde</option>
                  <option value="educacao">Educação</option>
                  <option value="lazer">Lazer/Entretenimento</option>
                  <option value="compras">Compras/Pessoal</option>
                  <option value="servicos">Serviços</option>
                  <option value="dividas">Dívidas/Empréstimos</option>
                  <option value="imprevistos">Imprevistos</option>
                  <option value="salario">Salário</option>
                </select>
              </div>

              <div class="form-group">
                <label>Descrição</label>
                <input type="text" v-model="newTransaction.descricao" required>
              </div>

              <div class="form-group">
                <label>Classificação</label>
                <select v-model="newTransaction.classificacao" required>
                  <option value="Fixa">Fixa</option>
                  <option value="Variável">Variável</option>
                </select>
              </div>

              <div class="form-group">
                <label>Valor</label>
                <input type="number" v-model="newTransaction.valor" step="0.01" required>
              </div>

              <div class="form-group">
                <label>Data</label>
                <input type="date" v-model="newTransaction.data" required>
              </div>

              <div class="form-group">
                <label>Status</label>
                <select v-model="newTransaction.status" required>
                  <option value="A pagar">A pagar</option>
                  <option value="Pago">Pago</option>
                  <option value="Pendente">Pendente</option>
                </select>
              </div>

              <div class="form-actions">
                <button type="button" class="btn-cancel" @click="showModal = false">Cancelar</button>
                <button type="submit" class="btn-save">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from './NavBar.vue';
import { TransactionService } from '../services/TransactionService';
import { computed } from 'vue';

export default {
  name: 'Receitas',
  components: {
    NavBar
  },
  data() {
    return {
      showModal: false,
      currentDate: new Date(),
      newTransaction: {
        categoria: '',
        descricao: '',
        classificacao: '',
        valor: '',
        data: '',
        status: ''
      }
    }
  },
  computed: {
    transactions() {
      return TransactionService.getTransactionsByMonth(this.currentDate).value
    },
    totalValue() {
      return TransactionService.getMonthlyBalance(this.currentDate).value
    },
    formatMonthYear() {
      const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 
        'Maio', 'Junho', 'Julho', 'Agosto',
        'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      return `${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    },
    filteredTransactions() {
      return this.transactions.filter(transaction => {
        const transactionDate = new Date(transaction.data);
        return transactionDate.getMonth() === this.currentDate.getMonth() &&
               transactionDate.getFullYear() === this.currentDate.getFullYear();
      });
    }
  },
  methods: {
    previousMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1);
    },
    nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1);
    },
    handleMonthChange(event) {
      const [year, month] = event.target.value.split('-');
      this.currentDate = new Date(year, month - 1);
    },
    getCategoryIcon(category) {
      const icons = {
        moradia: '⌂',
        alimentacao: '☕',
        transporte: '⚐',
        saude: '+',
        educacao: '✎',
        lazer: '♪',
        compras: '$',
        servicos: '⚙',
        dividas: '¢',
        imprevistos: '!',
        salario: '★'
      };
      return icons[category] || '?';
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    },
    formatDate(date) {
      if (date === 'Hoje') return date;
      const [year, month, day] = date.split('-');
      return `${day}/${month}`;
    },
    handleSubmit() {
      try {
        const transaction = {
          ...this.newTransaction,
          valor: parseFloat(this.newTransaction.valor)
        };
        
        TransactionService.addTransaction(transaction);
        
        this.showModal = false;
        this.newTransaction = {
          categoria: '',
          descricao: '',
          classificacao: '',
          valor: '',
          data: '',
          status: ''
        };
      } catch (error) {
        console.error('Erro ao salvar transação:', error);
        alert('Erro ao salvar transação. Tente novamente.');
      }
    }
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(to bottom, #ffffff, #e8f5e9);
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
}

.content-container {
  padding: 20px;
  width: 100%;
  max-width: 1200px;
  margin: 60px auto 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-button {
  background: #4CAF50;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  transition: background-color 0.3s;
}

.add-button:hover {
  background: #45a049;
}

.month-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  background: #fff;
  padding: 8px 16px;
  border-radius: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-size: 0.8rem;
}

.nav-button:hover {
  color: #333;
}

.month-input {
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  padding: 0;
  text-align: center;
  font-family: inherit;
  width: 160px;
}

.month-input::-webkit-calendar-picker-indicator {
  cursor: pointer;
}

.table-header {
  display: grid;
  grid-template-columns: 80px 2fr 1fr 1fr 1fr 1fr;
  gap: 10px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 8px 8px 0 0;
  margin-top: 20px;
}

.th {
  font-weight: 600;
  color: #666;
  font-size: 0.9rem;
}

.transactions-list {
  background: white;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
}

.transaction-item {
  display: grid;
  grid-template-columns: 80px 2fr 1fr 1fr 1fr 1fr;
  gap: 10px;
  padding: 15px 10px;
  align-items: center;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;
}

.transaction-item:hover {
  background-color: #f9f9f9;
}

.icon-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: bold;
}

.icon-wrapper.moradia { background: #E3F2FD; color: #1976D2; }
.icon-wrapper.alimentacao { background: #E8F5E9; color: #388E3C; }
.icon-wrapper.transporte { background: #F3E5F5; color: #7B1FA2; }
.icon-wrapper.saude { background: #E1F5FE; color: #0288D1; }
.icon-wrapper.educacao { background: #FFF3E0; color: #F57C00; }
.icon-wrapper.lazer { background: #FCE4EC; color: #C2185B; }
.icon-wrapper.compras { background: #F3E5F5; color: #7B1FA2; }
.icon-wrapper.servicos { background: #E8EAF6; color: #3F51B5; }
.icon-wrapper.dividas { background: #FFEBEE; color: #D32F2F; }
.icon-wrapper.imprevistos { background: #FFF3E0; color: #F57C00; }
.icon-wrapper.salario { background: #E8F5E9; color: #388E3C; }

.td {
  font-size: 0.95rem;
  color: #333;
}

.td.valor {
  font-weight: 500;
}

.td.valor.negative {
  color: #f44336;
}

.td.status {
  padding: 4px 12px;
  border-radius: 12px;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 500;
}

.td.status.pago {
  background: #E8F5E9;
  color: #388E3C;
}

.td.status.pendente {
  background: #FFF3E0;
  color: #F57C00;
}

.td.status.a-pagar {
  background: #FFEBEE;
  color: #D32F2F;
}

.total-section {
  margin-top: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-label {
  font-size: 1.1rem;
  font-weight: 500;
  color: #333;
}

.total-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: #4CAF50;
}

.total-value.negative {
  color: #f44336;
}

/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.2rem;
}

.close {
  font-size: 24px;
  color: #666;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #666;
  font-size: 0.9rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-cancel,
.btn-save {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  font-weight: 500;
  cursor: pointer;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-save {
  background: #4CAF50;
  color: white;
}

.btn-save:hover {
  background: #45a049;
}

@media (max-width: 768px) {
  .table-header,
  .transaction-item {
    grid-template-columns: 60px 2fr 1fr 1fr;
  }

  .th.classificacao,
  .td.classificacao,
  .th.data,
  .td.data {
    display: none;
  }

  .content-container {
    padding: 10px;
  }

  .td {
    font-size: 0.9rem;
  }
}
</style> 