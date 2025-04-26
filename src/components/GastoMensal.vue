<template>
  <div class="page-container">
    <NavBar/>
    <div class="gasto-mensal-container">
      <div class="welcome-banner">
        <h1>Análise de Gastos</h1>
        <p>Visualize e compare seus gastos mensais</p>
      </div>
      
      <div class="filters">
        <h3>Filtrar por período</h3>
        <div class="filter-controls">
          <div class="filter-group">
            <label for="month">Mês:</label>
            <select id="month" v-model="selectedMonth" class="filter-input">
              <option v-for="(month, index) in months" :key="index" :value="index + 1">
                {{ month }}
              </option>
            </select>
          </div>
          <div class="filter-group">
            <label for="year">Ano:</label>
            <select id="year" v-model="selectedYear" class="filter-input">
              <option v-for="year in years" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>
          <button @click="clearFilters" class="filter-button">
            <span class="filter-icon">🔄</span> Limpar
          </button>
        </div>
      </div>

      <div class="section-title">
        <h2>Análise de Gastos por Categoria</h2>
        <div class="section-line"></div>
      </div>
      
      <div v-if="loadingGastoMensal" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Carregando dados de gastos...</p>
      </div>
      
      <div v-if="errorGastoMensal" class="error-message">
        <p>{{ errorGastoMensal }}</p>
        <button @click="fetchData" class="retry-button">Tentar novamente</button>
      </div>

      <div class="charts-container">
        <div class="chart-wrapper" v-if="!loadingGastoMensal && gastoMensalData.length > 0">
          <h3>Gastos por Categoria</h3>
          <div class="chart-container">
            <canvas ref="doughnutChart"></canvas>
          </div>
        </div>

        <div v-if="!loadingGastoMensal && gastoMensalData.length === 0 && !errorGastoMensal" class="empty-state-container">
          <div class="empty-icon">📊</div>
          <h3>Sem dados de gastos</h3>
          <p>Não há dados de gastos para o período selecionado</p>
        </div>

        <div class="section-title" v-if="!loadingGastoComparativo && gastoComparativoData.length > 0">
          <h2>Comparativo: Gastos vs. Orçamento</h2>
          <div class="section-line"></div>
        </div>
        
        <div v-if="loadingGastoComparativo" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Carregando dados comparativos...</p>
        </div>
        
        <div v-if="errorGastoComparativo" class="error-message">
          <p>{{ errorGastoComparativo }}</p>
          <button @click="fetchData" class="retry-button">Tentar novamente</button>
        </div>

        <div class="chart-wrapper wide" v-if="!loadingGastoComparativo && gastoComparativoData.length > 0">
          <h3>Comparativo: Gasto Real vs. Orçamento Previsto</h3>
          <div class="chart-container">
            <canvas ref="barChart"></canvas>
          </div>
        </div>
        
        <div v-if="!loadingGastoComparativo && gastoComparativoData.length === 0 && !errorGastoComparativo" class="empty-state-container">
          <div class="empty-icon">📈</div>
          <h3>Sem dados comparativos</h3>
          <p>Não há dados comparativos para o período selecionado</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from './NavBar.vue';
import Chart from 'chart.js/auto';
import axios from 'axios';
import { nextTick } from 'vue';


export default {
  name: 'GastoMensal',
  components: {
    NavBar
  },
  data() {
    return {
      // Data
      gastoMensalData: [],
      gastoComparativoData: [],
      loadingGastoMensal: true,
      loadingGastoComparativo: true,
      errorGastoMensal: null,
      errorGastoComparativo: null,
      
      // Charts
      doughnutChart: null,
      barChart: null,
      
      // Filter state
      selectedMonth: new Date().getMonth() + 1,
      selectedYear: new Date().getFullYear(),
      
      // Filter options
      months: [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ],
      years: [],
      
      // Category mapping
      categoryMapping: {
        'alimentacao': 'Alimentação',
        'moradia': 'Moradia',
        'transporte': 'Transporte',
        'lazer': 'Lazer',
        'saude': 'Saúde',
        'educacao': 'Educação',
        'investimentos': 'Investimentos',
        'outros': 'Outros'
      },
      
      // Colors for categories
      categoryColors: {
        'alimentacao': 'rgba(255, 99, 132, 0.8)',
        'moradia': 'rgba(54, 162, 235, 0.8)',
        'transporte': 'rgba(255, 206, 86, 0.8)',
        'lazer': 'rgba(75, 192, 192, 0.8)',
        'saude': 'rgba(153, 102, 255, 0.8)',
        'educacao': 'rgba(255, 159, 64, 0.8)',
        'investimentos': 'rgba(40, 167, 69, 0.8)',
        'outros': 'rgba(108, 117, 125, 0.8)'
      }
    };
  },
  mounted() {
    // Setup years for filter
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i <= currentYear + 1; i++) {
      this.years.push(i);
    }
    
    // Fetch initial data
    this.fetchData();
  },
  watch: {
    selectedMonth: {
      handler() {
        this.fetchData();
      },
    },
    selectedYear: {
      handler() {
        this.fetchData();
      },
    },
  },
  methods: {

    async GastoMensal(mes, ano) {
      try {
        const response = await axios.get(`/Gasto/Mensal/${mes}/${ano}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching monthly expense data', error);
      }
    },

    async GastoComparativoMensal(mes, ano) {
      try {
        const response = await axios.get(`/Gasto/Comparativo/Mensal/${mes}/${ano}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching comparative expense data', error);
      }
    },

    formatCurrency(value) {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    },
    
    async fetchGastoMensal() {
      this.loadingGastoMensal = true;
      this.errorGastoMensal = null;
      try {
        const data = await this.GastoMensal(this.selectedMonth, this.selectedYear);
        this.gastoMensalData = data;
      } catch (error) {
        console.error('Error fetching monthly expense data', error);
        this.errorGastoMensal = 'Erro ao buscar dados de gastos. Por favor, tente novamente.';
        this.gastoMensalData = [];
      } finally {
        this.loadingGastoMensal = false;
        await nextTick();
        this.renderDoughnutChart();
      }
    },

    async fetchGastoComparativo() {
      this.loadingGastoComparativo = true;
      this.errorGastoComparativo = null;
      try {
        const data = await this.GastoComparativoMensal(this.selectedMonth, this.selectedYear);
        this.gastoComparativoData = data;
        this.renderBarChart();
      } catch (error) {
        console.error('Error fetching comparative expense data', error);
        this.errorGastoComparativo = 'Erro ao buscar dados comparativos. Por favor, tente novamente.';
        this.gastoComparativoData = [];
      } finally {
        this.loadingGastoComparativo = false;
        await nextTick();
        this.renderBarChart();
      }
    },

    async fetchData() {
        this.fetchGastoMensal(),
        this.fetchGastoComparativo()
    },
    
    renderDoughnutChart() {
      if (this.doughnutChart) {
        this.doughnutChart.destroy();
      }
      
      const labels = [];
      const values = [];
      const colors = [];

      console.log(this.categoryMapping)
      Object.keys(this.categoryMapping).forEach(category => {
        const categoryData = this.gastoMensalData.find(item => item.categoria_despesa === category);
        console.log(`Categoria buscada: "${category}"`, 'Resultado:', categoryData);
        if (categoryData && categoryData.total_gasto > 0) {
          labels.push(this.categoryMapping[category]);
          values.push(categoryData.total_gasto);
          colors.push(this.categoryColors[category]);
        }
      });
      
      console.log('Dados carregados:', this.gastoMensalData);
      console.log('Labels:', labels);
      console.log('Valores:', values);

      // Exit if no data to display
      if (values.length === 0) return;
      
      // Make sure we have a reference to the canvas element
      const canvas = this.$refs.doughnutChart;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      this.doughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data: values,
            backgroundColor: colors,
            hoverBackgroundColor: colors.map(color => color.replace('0.8', '1')),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: values.length > 4 ? 'right' : 'bottom',
              labels: {
                padding: 20,
                boxWidth: 12,
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${this.formatCurrency(value)} (${percentage}%)`;
                }
              }
            }
          },
          cutout: '60%'
        }
      });
    },
    
    renderBarChart() {
      if (this.barChart) {
        this.barChart.destroy();
      }
      
      const labels = [];
      const realValues = [];
      const budgetValues = [];
      const differences = [];

      Object.keys(this.categoryMapping).forEach(category => {
        const categoryData = this.gastoComparativoData.find(item => item.categoria_despesa === category);
        if (categoryData) {
          labels.push(this.categoryMapping[category]);
          realValues.push(categoryData.gasto_real);
          budgetValues.push(categoryData.orcamento_previsto);
          // Calculate difference between real spending and budget
          differences.push(categoryData.gasto_real - categoryData.orcamento_previsto);
        }
      });
      
      // Exit if no data to display
      if (labels.length === 0) return;
      
      // Make sure we have a reference to the canvas element
      const canvas = this.$refs.barChart;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Generate background colors based on whether spending exceeds budget
      const bgColorsForDifference = differences.map(diff => 
        diff > 0 ? 'rgba(220, 53, 69, 0.7)' : 'rgba(40, 167, 69, 0.7)'
      );

      this.barChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Orçamento Previsto',
              data: budgetValues,
              backgroundColor: 'rgba(40, 167, 69, 0.7)',
              borderColor: 'rgba(40, 167, 69, 1)',
              borderWidth: 1,
              order: 2
            },
            {
              label: 'Gasto Real',
              data: realValues,
              backgroundColor: 'rgba(220, 53, 69, 0.7)',
              borderColor: 'rgba(220, 53, 69, 1)',
              borderWidth: 1,
              order: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.dataset.label || '';
                  const value = context.raw || 0;
                  return `${label}: ${this.formatCurrency(value)}`;
                },
                afterBody: (tooltipItems) => {
                  const item = tooltipItems[0];
                  const index = item.dataIndex;
                  const budget = budgetValues[index];
                  const real = realValues[index];
                  const diff = real - budget;
                  
                  if (diff > 0) {
                    return `Excedeu o orçamento em: ${this.formatCurrency(diff)}`;
                  } else if (diff < 0) {
                    return `Abaixo do orçamento em: ${this.formatCurrency(Math.abs(diff))}`;
                  } else {
                    return 'Dentro do orçamento';
                  }
                }
              }
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                callback: value => this.formatCurrency(value)
              },
              grid: {
                display: true,
                drawBorder: true,
                drawOnChartArea: true,
                drawTicks: true
              }
            },
            y: {
              grid: {
                display: false
              }
            }
          }
        }
      });
    },

    clearFilters() {
      this.selectedMonth = new Date().getMonth() + 1;
      this.selectedYear = new Date().getFullYear();
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
  overflow-x: hidden;
}

.gasto-mensal-container {
  padding: 20px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 40px;
  box-sizing: border-box;
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

.section-title {
  display: flex;
  align-items: center;
  margin: 30px 0 15px;
}

.section-title h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.section-line {
  flex: 1;
  height: 1px;
  background-color: #ddd;
  margin-left: 15px;
}

.filters {
  margin-bottom: 30px;
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.filters h3 {
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

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background-color: #fff8f8;
  border-left: 4px solid #f44336;
  padding: 15px;
  margin-bottom: 20px;
  color: #d32f2f;
  border-radius: 4px;
}

.retry-button {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  margin-top: 10px;
  cursor: pointer;
}

.charts-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}

.chart-wrapper {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-wrapper.wide {
  width: 100%;
}

.chart-wrapper h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  color: #333;
  text-align: center;
}

.chart-container {
  height: 350px;
  position: relative;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #666;
}

.empty-state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  padding: 40px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.empty-state-container h3 {
  margin: 0 0 10px 0;
  color: #555;
  font-size: 20px;
}

.empty-state-container p {
  margin: 0;
  color: #888;
  text-align: center;
}

@media (max-width: 768px) {
  .page-container {
    width: 100%;
    height: auto;
    position: relative;
    overflow-x: hidden;
  }

  .gasto-mensal-container {
    padding: 15px;
  }

  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .filter-input {
    flex: 1;
  }
  
  .chart-container {
    height: 300px;
  }

  .welcome-banner {
    padding: 15px;
  }

  .welcome-banner h1 {
    font-size: 22px;
  }
}
</style>
