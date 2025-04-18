<template>
  <div class="page-container">
    <NavBar />
    <div class="home-container">
      <div class="welcome-banner">
        <h1>Painel Financeiro</h1>
        <p>Acompanhe seus dados financeiros</p>
      </div>
      
      <div class="summary-cards">
        <div class="card income">
          <div class="card-icon">💰</div>
          <div class="card-content">
            <h3>Entrada mensal</h3>
            <p class="amount">R$: 1.242,24</p>
          </div>
        </div>
        
        <div class="card expense">
          <div class="card-icon">💸</div>
          <div class="card-content">
            <h3>Despesa mensal</h3>
            <p class="amount">R$: 1.153,23</p>
          </div>
        </div>
        
        <div class="card financial-status">
          <div class="card-icon">⚠️</div>
          <div class="card-content">
            <h3>Situação financeira</h3>
            <p class="status">Crítico</p>
          </div>
        </div>
        
        <div class="card report">
          <div class="card-icon">📊</div>
          <div class="card-content">
            <h3>Relatório</h3>
            <router-link to="/relatorio" class="view-link">Ver detalhes</router-link>
          </div>
        </div>
      </div>

      <div class="section-title">
        <h2>Resumo Financeiro</h2>
        <div class="section-line"></div>
      </div>

      <div class="detail-grid">
        <div class="detail-card bills-to-pay">
          <div class="card-header">
            <div class="header-icon">📝</div>
            <h3>Contas a pagar</h3>
          </div>
          <p class="amount">R$: 748,54</p>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress" style="width: 75%"></div>
            </div>
            <p class="progress-text">75% do limite</p>
          </div>
        </div>
        
        <div class="detail-card available-balance">
          <div class="card-header">
            <div class="header-icon">💵</div>
            <h3>Saldo disponível</h3>
          </div>
          <p class="amount">R$: 89,01</p>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress success" style="width: 8%"></div>
            </div>
            <p class="progress-text">8% do total</p>
          </div>
        </div>
      
        <div class="detail-card receivables">
          <div class="card-header">
            <div class="header-icon">📋</div>
            <h3>Patrimônio</h3>
          </div>
          <p class="no-data">Dados não disponíveis</p>
        </div>
        
        <div class="detail-card spending-limit">
          <div class="card-header">
            <div class="header-icon">🎯</div>
            <h3>Limite de gastos do mês</h3>
          </div>
          <p class="amount">R$: 900</p>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress warning" style="width: 89%"></div>
            </div>
            <p class="progress-text">89% utilizado</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from './NavBar.vue';

export default {
  name: 'Home',
  components: {
    NavBar
  },
  data() {
    return {
      // Data can be added here if needed
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
  border-left: 4px solid #F44336;
}

.status {
  color: #F44336;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.report {
  border-left: 4px solid #2196F3;
}

.view-link {
  color: #2196F3;
  font-size: 0.9rem;
  margin-top: 5px;
  text-decoration: none;
  display: inline-block;
  transition: color 0.3s;
}

.view-link:hover {
  color: #0D47A1;
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

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.detail-card {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.detail-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.header-icon {
  font-size: 1.6rem;
  margin-right: 12px;
}

.detail-card h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.detail-card .amount {
  font-size: 2rem;
  margin-bottom: 15px;
}

.progress-container {
  margin-top: 15px;
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
  background-color: #FF9800;
  border-radius: 4px;
}

.progress.success {
  background-color: #4CAF50;
}

.progress.warning {
  background-color: #FF5722;
}

.progress-text {
  font-size: 0.8rem;
  color: #757575;
  text-align: right;
  margin: 0;
}

.bills-to-pay {
  border-bottom: 4px solid #FF9800;
}

.available-balance {
  border-bottom: 4px solid #4CAF50;
}

.receivables {
  border-bottom: 4px solid #2196F3;
}

.spending-limit {
  border-bottom: 4px solid #9C27B0;
}

.no-data {
  color: #757575;
  font-style: italic;
  font-size: 0.9rem;
  margin: 20px 0;
}

.action-button {
  display: none;
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
