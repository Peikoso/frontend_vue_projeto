<template>
  <div class="page-container">
    <NavBar/>
    <div class="home-container">
      <div class="welcome-banner">
        <h1>Painel Financeiro</h1>
        <p>Acompanhe seus dados financeiros</p>
      </div>
      
      <div class="summary-cards">
        <div class="card income">
          <div class="card-icon">💰</div>
          <div class="card-content">
            <h3>Receita mensal</h3>
            <p class="amount">{{ formatCurrency(resumoFinanceiroAtual.total_receitas) }}</p>
          </div>
        </div>
        
        <div class="card despesa">
          <div class="card-icon">💸</div>
          <div class="card-content">
            <h3>Despesa mensal</h3>
            <p class="amount">{{ formatCurrency(resumoFinanceiroAtual.total_despesas) }}</p>
          </div>
        </div>
        
        <div class="card" :class="getSituacaoFinanceiraClass()">
          <div class="card-icon">⚠️</div>
          <div class="card-content">
            <h3>Situação financeira</h3>
            <p :class="getSituacaoFinanceiraColor()">{{ situacaoFinanceira() }}</p>
          </div>
        </div>
        
        <div class="card saldo">
          <div class="card-icon">💵</div>
          <div class="card-content">
            <h3>Saldo mensal</h3>
            <p class="amount">{{ formatCurrency(resumoFinanceiroAtual.saldo) }}</p>
          </div>
        </div>
        
        <div class="card metas">
          <div class="card-icon">🎯</div>
          <div class="card-content">
            <h3>Progresso médio das metas</h3>
            <p class="amount">{{ resumoFinanceiroOutros.progresso_medio_metas }}%</p>
          </div>
        </div>
        
        
        <div class="card patrimonio">
          <div class="card-icon">🏠</div>
          <div class="card-content">
            <h3>Total de patrimônio</h3>
            <p class="amount">{{ formatCurrency(resumoFinanceiroOutros.total_patrimonio) }}</p>
          </div>
        </div>
        
        <div class="card investimentos">
          <div class="card-icon">📈</div>
          <div class="card-content">
            <h3>Total de investimentos</h3>
            <p class="amount">{{ formatCurrency(resumoFinanceiroOutros.total_investido_final) }}</p>
          </div>
        </div>
        
        <div class="card proventos">
          <div class="card-icon">💶</div>
          <div class="card-content">
            <h3>Total de proventos</h3>
            <p class="amount">{{ formatCurrency(resumoFinanceiroOutros.total_proventos) }}</p>
          </div>
        </div>
        
        <div class="card dividas">
          <div class="card-icon">💳</div>
          <div class="card-content">
            <h3>Total de dividas</h3>
            <p class="amount">{{ formatCurrency(resumoFinanceiroOutros.total_dividas) }}</p>
          </div>
        </div>

      </div>
      
        <!-- Filter Section-->
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
      </div>

      <div class="section-title">
        <h2>Resumo Financeiro</h2>
        <div class="section-line"></div>
      </div>
      

      <!-- Loading and Error Messages -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Carregando resumo financeiro...</p>
      </div>

      <div v-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="fetchMovimentacoes" class="retry-button">Tentar novamente</button>
      </div>

      <!-- Resumo Financeiro List -->
      <div v-if="!loading && !error && filteredResumoFinanceiro.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <h2>Nenhum Resumo Financeiro encontrado</h2>
        <p>Não há resumo financeiro para o período selecionado</p>
      </div>
      <div v-if="!loading && !error && filteredResumoFinanceiro.length > 0" class="finance-list">
        <div v-for="resumo in filteredResumoFinanceiro" 
             :key="resumo.id" 
             class="finance-item"
             :class="{'positive-balance': resumo.saldo > 0, 'negative-balance': resumo.saldo < 0}"
             :style="getFinanceItemStyle(resumo)">
          <div class="finance-date">
            <span class="month">{{ resumo.mes }}</span>
            <span class="year">{{ resumo.ano }}</span>
          </div>
          <div class="finance-details">
            <div class="detail-item">
              <span class="detail-label"><i class="detail-icon">📅</i> Mês</span>
              <span class="detail-value">{{ resumo.mes }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label"><i class="detail-icon">📆</i> Ano</span>
              <span class="detail-value">{{ resumo.ano }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label"><i class="detail-icon">🔄</i> Movimentações</span>
              <span class="detail-value">{{ resumo.total_movimentacoes }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label"><i class="detail-icon">💰</i> Saldo</span>
              <span class="detail-value" :class="{'positive': resumo.saldo > 0, 'negative': resumo.saldo < 0}">
                {{ formatCurrency(resumo.saldo) }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label"><i class="detail-icon">💹</i> Receita</span>
              <span class="detail-value positive">{{ formatCurrency(resumo.total_receitas) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label"><i class="detail-icon">📉</i> Despesa</span>
              <span class="detail-value expense">{{ formatCurrency(resumo.total_despesas) }}</span>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  </div>
</template>

<script>
import NavBar from './NavBar.vue';
import { TransactionService } from '../services/TransactionService';
import { computed, ref, onMounted } from 'vue';
import axios from 'axios';
export default {
  name: 'Home',
  components: {
    NavBar
  },
  data() {
    return {
      resumoFinanceiro: [],
      loading: false,
      error: null,
      resumoFinanceiroAtual: {
        mes: 0,
        ano: 0,
        total_movimentacoes: 0,
        total_receitas: 0,
        total_despesas: 0,
        saldo: 0,
      },
      resumoFinanceiroOutros: {
        progresso_medio_metas: 0,
        total_patrimonio: 0,
        total_investido_final: 0,
        total_proventos: 0,
        total_dividas: 0,
      },
      filters: {
        month: 'all',
        year: 'all',
      },
      availableYears: [],
    };
  },
  methods: {
    formatCurrency(value) {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    },

    async fetchResumoFinanceiro() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get('/ResumoFinanceiro/');
        this.resumoFinanceiro = response.data;
        this.availableYears = [...new Set(this.resumoFinanceiro.map(resumo => resumo.ano))].sort();
        console.log(this.resumoFinanceiro);
      } catch (error) {
        console.error('Error fetching financial summary:', error);
        alert('Erro ao buscar resumo financeiro. Por favor, tente novamente.');
      } finally {
        this.loading = false;
      }
    },

    async fetchResumoFinanceiroMesAno() {
      try {
        let mes = new Date().getMonth() + 1;
        let ano = new Date().getFullYear();

        const response = await axios.get(`/ResumoFinanceiro/Mensal/${mes}/${ano}`);
        this.resumoFinanceiroAtual = response.data;
      } catch (error) {
        console.error('Error fetching financial summary:', error);
      }
    },

    async fetchResumoFinanceiroOutros(){
      try {
        const response = await axios.get('/ResumoFinanceiro/Outros');
        this.resumoFinanceiroOutros = response.data;
      } catch (error) {
        console.error('Error fetching financial summary:', error);
      }
    },

    situacaoFinanceira() {
      if (this.resumoFinanceiroAtual.saldo > 500) {
        return 'Boa';
      }
      if (this.resumoFinanceiroAtual.saldo > 0) {
        return 'Regular';
      }
      if (this.resumoFinanceiroAtual.saldo <= 0) {
        return 'Crítico';
      } 
    },

    getSituacaoFinanceiraClass() {
      if (this.resumoFinanceiroAtual.saldo > 500) {
        return 'financial-status-boa';
      }
      if (this.resumoFinanceiroAtual.saldo > 0) {
        return 'financial-status-regular';  
      }
      if (this.resumoFinanceiroAtual.saldo <= 0) {
        return 'financial-status-crítico';
      }
    },

    getSituacaoFinanceiraColor() {
      if (this.resumoFinanceiroAtual.saldo > 500) {
        return 'status-boa';
      }
      if (this.resumoFinanceiroAtual.saldo > 0) {
        return 'status-regular';
      }
      if (this.resumoFinanceiroAtual.saldo <= 0) {
        return 'status-crítico';
      }
    },

    resetFilters() {
      this.filters.month = 'all';
      this.filters.year = 'all';
      this.fetchResumoFinanceiro();
    },
    
    getFinanceItemStyle(resumo) {
      const maxValue = Math.max(resumo.total_receitas, resumo.total_despesas);
      const receitasPercent = maxValue > 0 ? (resumo.total_receitas / maxValue) * 100 : 0;
      const despesasPercent = maxValue > 0 ? (resumo.total_despesas / maxValue) * 100 : 0;
      
      return {
        '--receitas-percent': `${receitasPercent}%`,
        '--despesas-percent': `${despesasPercent}%`
      };
    }
  },
  mounted() {
    this.fetchResumoFinanceiroMesAno();
    this.fetchResumoFinanceiro();
    this.fetchResumoFinanceiroOutros();
  },

  computed:{
    filteredResumoFinanceiro() {
      if(!this.resumoFinanceiro[0]?.mes  && !this.resumoFinanceiro[0]?.ano) {
        return [];
      }

      if(this.filters.month === 'all' && this.filters.year === 'all') {
        return this.resumoFinanceiro;
      }
      return this.resumoFinanceiro.filter(item => {
        const matchesMonth = this.filters.month === 'all' || item.mes === parseInt(this.filters.month);
        const matchesYear = this.filters.year === 'all' || item.ano === parseInt(this.filters.year);
        return matchesMonth && matchesYear;
      });
    },
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

.home-container {
  padding: 20px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 40px;
}

.welcome-banner {
  text-align: center;
  margin: 20px 0 30px;
  color: #333;
}

.welcome-banner h1 {
  font-size: 2rem;
  margin-bottom: 8px;
  font-weight: 600;
  color: #4CAF50;
}

.welcome-banner p {
  font-size: 1.1rem;
  color: #666;
  margin: 0;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.card {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  transition: transform 0.3s, box-shadow 0.3s;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

.card-icon {
  font-size: 2.2rem;
  margin-right: 15px;
}

.card-content {
  flex-grow: 1;
}

.card h3 {
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0 0 6px 0;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.amount {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
  color: #333;
}

.income {
  border-left: 4px solid #4CAF50;
}

.despesa {
  border-left: 4px solid #FF9800;
}


.financial-status-crítico {
  border-left: 4px solid #FF0000;
}

.financial-status-regular {
  border-left: 4px solid #FF9800;
}

.financial-status-boa {
  border-left: 4px solid #4CAF50;
}

.metas {
  border-left: 4px solid #2196F3;
}

.patrimonio {
  border-left: 4px solid #e009ce;
}

.investimentos {
  border-left: 4px solid #47788f;
}

.proventos {
  border-left: 4px solid #6f6b75;
}

.dividas {
  border-left: 4px solid #FF0000;
}


.status-boa {
  color: #4CAF50;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.status-regular {
  color: #FF9800;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.status-crítico {
  color: #FF0000;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.saldo {
  border-left: 4px solid #2196F3;
}


.section-title {
  margin: 40px 0 20px;
}

.section-title h2 {
  font-size: 1.4rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.section-line {
  height: 3px;
  width: 60px;
  background-color: #4CAF50;
  border-radius: 3px;
}


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
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 0;
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

/* Finance List Styles */
.finance-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.finance-item {
  background: white;
  border-radius: 14px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  padding: 28px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border-left: 5px solid #9E9E9E;
}

.finance-item:hover {
  transform: translateY(-6px);
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.12);
}

.finance-item.positive-balance {
  border-left-color: #4CAF50;
}

.finance-item.negative-balance {
  border-left-color: #F44336;
}

.finance-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(to right, 
    #4CAF50 var(--receitas-percent, 50%), 
    #FF9800 var(--receitas-percent, 50%), 
    #FF9800 100%);
  opacity: 0.8;
}

.finance-date {
  position: absolute;
  top: 0;
  right: 0;
  background: #e8f5e9;
  padding: 12px 20px;
  border-bottom-left-radius: 14px;
  box-shadow: -2px 2px 10px rgba(0, 0, 0, 0.05);
  z-index: 2;
}

.finance-date .month {
  font-weight: bold;
  font-size: 1.1rem;
  color: #4CAF50;
  margin-right: 5px;
}

.finance-date .year {
  color: #616161;
  font-weight: 500;
}

.finance-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding-top: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  background-color: #f9f9f9;
  border-radius: 10px;
  transition: all 0.2s ease;
  border: 1px solid #f0f0f0;
}

.detail-item:hover {
  background-color: #f0f0f0;
  transform: translateY(-3px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.05);
}

.detail-icon {
  margin-right: 5px;
  font-style: normal;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.detail-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #757575;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.detail-value {
  font-size: 1.2rem;
  color: #333;
  font-weight: 500;
}

/* Special treatment for important values */
.detail-item:nth-child(4), /* Saldo */
.detail-item:nth-child(5), /* Receita */
.detail-item:nth-child(6) { /* Despesa */
  background-color: #f5f5f5;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.07);
  border-top: 3px solid transparent;
}

.detail-item:nth-child(4) { /* Saldo */
  border-top-color: #2196F3;
}

.detail-item:nth-child(5) { /* Receita */
  border-top-color: #4CAF50;
}

.detail-item:nth-child(6) { /* Despesa */
  border-top-color: #FF9800;
}

.detail-item:nth-child(4) .detail-value, /* Saldo */
.detail-item:nth-child(5) .detail-value, /* Receita */
.detail-item:nth-child(6) .detail-value { /* Despesa */
  font-size: 1.4rem;
  font-weight: 700;
}

/* Chart visualization */
.detail-item:nth-child(5), /* Receita */
.detail-item:nth-child(6) { /* Despesa */
  position: relative;
  overflow: hidden;
}

.detail-item:nth-child(5)::after, /* Receita visual bar */
.detail-item:nth-child(6)::after { /* Despesa visual bar */
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  background-color: currentColor;
  opacity: 0.3;
  border-radius: 0 2px 2px 0;
  transition: width 0.5s ease;
}

.detail-item:nth-child(5)::after {
  width: var(--receitas-percent, 50%);
  background-color: #4CAF50;
}

.detail-item:nth-child(6)::after {
  width: var(--despesas-percent, 50%);
  background-color: #FF9800;
}

/* Color coding for different values */
.detail-value.positive {
  color: #4CAF50;
}

.detail-value.negative {
  color: #F44336;
}

.detail-value.expense {
  color: #FF9800;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .home-container {
    padding: 15px;
  }
  
  .welcome-banner h1 {
    font-size: 1.6rem;
  }
  
  .welcome-banner p {
    font-size: 0.9rem;
  }
  
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
  .card {
    padding: 15px;
  }
  
  .section-title h2 {
    font-size: 1.2rem;
  }
  
  .detail-card .amount {
    font-size: 1.6rem;
  }
  
  .finance-list {
    grid-template-columns: 1fr;
  }
  
  .finance-details {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .detail-item {
    margin-bottom: 10px;
    padding: 12px;
  }
  
  .finance-date {
    position: static;
    margin-bottom: 15px;
    display: inline-block;
    border-radius: 10px;
  }

  .finance-item {
    padding: 20px;
  }
}
</style>
