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
            <p class="amount">{{ formatCurrency(resumoFinanceiro.total_receitas) }}</p>
          </div>
        </div>
        
        <div class="card expense">
          <div class="card-icon">💸</div>
          <div class="card-content">
            <h3>Despesa mensal</h3>
            <p class="amount">{{ formatCurrency(resumoFinanceiro.total_despesas) }}</p>
          </div>
        </div>
        
        <div class="card financial-status">
          <div class="card-icon">⚠️</div>
          <div class="card-content">
            <h3>Situação financeira</h3>
            <p class="status">{{ situacaoFinanceira() }}</p>
          </div>
        </div>
        
        <div class="card saldo">
          <div class="card-icon">💵</div>
          <div class="card-content">
            <h3>Saldo mensal</h3>
            <p class="amount">{{ formatCurrency(resumoFinanceiro.saldo) }}</p>
          </div>
        </div>
      </div>

      <div class="section-title">
        <h2>Resumo Financeiro</h2>
        <div class="section-line"></div>
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
      resumoFinanceiro: {
        mes: 0,
        ano: 0,
        total_movimentacoes: 0,
        total_receitas: 0,
        total_despesas: 0,
        saldo: 0,
      },
    };
  },
  methods: {
    formatCurrency(value) {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    },

    async fetchResumoFinanceiroMesAno() {
      try {
        let mes = new Date().getMonth() + 1;
        let ano = new Date().getFullYear();

        const response = await axios.get(`/ResumoFinanceiro/Mensal/${mes}/${ano}`);
        this.resumoFinanceiro = response.data;
      } catch (error) {
        console.error('Error fetching financial summary:', error);
        alert('Erro ao buscar resumo financeiro. Por favor, tente novamente.');
      }
    },

    situacaoFinanceira() {
      if (this.resumoFinanceiro.saldo > 500) {
        return 'Boa';
      } else if (this.resumoFinanceiro.saldo > 0) {
        return 'Regular';
      } else if (this.resumoFinanceiro.saldo < 0) {
        return 'Crítico';
      } else {
        return 'Neutro';
      }
    }

  },
  mounted() {
    this.fetchResumoFinanceiroMesAno();
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
}

.welcome-banner p {
  font-size: 1.1rem;
  color: #666;
  margin: 0;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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

.expense {
  border-left: 4px solid #FF9800;
}

.financial-status {
  border-left: 4px solid #198b56;
}

.status {
  color: #198b56;
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
}
</style>
