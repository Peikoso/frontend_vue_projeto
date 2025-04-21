<template>
  <div class="page-container">
    <NavBar />
    <div class="content-container">
      <div class="report-tabs">
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'detalhado' }"
          @click="activeTab = 'detalhado'"
        >
          DETALHADO MENSAL
        </button>
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'dashboard' }"
          @click="activeTab = 'dashboard'"
        >
          DASHBOARD MENSAL
        </button>
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'analitico' }"
          @click="activeTab = 'analitico'"
        >
          ANALITICO MENSAL
        </button>
      </div>
      
      <!-- Conteúdo da aba Detalhado Mensal -->
      <div v-if="activeTab === 'detalhado'" class="tab-content">
        <div class="filters-container">
          <div class="filter-group">
            <label>Período:</label>
            <input 
              type="month" 
              v-model="filtros.periodo" 
              class="filter-input"
            >
          </div>
          <div class="filter-group">
            <label>Tipo:</label>
            <select v-model="filtros.tipo" class="filter-input">
              <option value="">Todos</option>
              <option value="receita">Receitas</option>
              <option value="despesa">Despesas</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Categoria:</label>
            <select v-model="filtros.categoria" class="filter-input">
              <option value="">Todas</option>
              <option value="alimentacao">Alimentação</option>
              <option value="transporte">Transporte</option>
              <option value="lazer">Lazer</option>
              <option value="contas">Contas</option>
              <option value="salario">Salário</option>
              <option value="investimentos">Investimentos</option>
            </select>
          </div>
        </div>

        <div class="summary-cards">
          <div class="summary-card receitas">
            <h3>Receitas</h3>
            <p>{{ formatCurrency(totalizadores.receitas) }}</p>
          </div>
          <div class="summary-card despesas">
            <h3>Despesas</h3>
            <p>{{ formatCurrency(totalizadores.despesas) }}</p>
          </div>
          <div class="summary-card saldo">
            <h3>Saldo</h3>
            <p>{{ formatCurrency(totalizadores.saldo) }}</p>
          </div>
        </div>

        <div class="table-container">
          <table class="transactions-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Valor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="transacao in transacoesFiltradas" :key="transacao.id" :class="transacao.tipo">
                <td>{{ formatarData(transacao.data) }}</td>
                <td>{{ transacao.descricao }}</td>
                <td>
                  <span class="categoria-tag" :class="transacao.categoria">
                    {{ transacao.categoria }}
                  </span>
                </td>
                <td :class="{ 'receita': transacao.tipo === 'receita', 'despesa': transacao.tipo === 'despesa' }">
                  {{ formatCurrency(transacao.valor) }}
                </td>
                <td>
                  <span class="status-badge" :class="transacao.status">
                    {{ transacao.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Conteúdo da aba Dashboard Mensal -->
      <div v-if="activeTab === 'dashboard'" class="tab-content">
        <div class="chart-container">
          <div class="chart-wrapper">
            <canvas ref="donutChart"></canvas>
          </div>
          <div class="chart-legend">
            <div class="legend-items">
              <div class="legend-item">
                <span class="color-box" style="background-color: #FFA500"></span>
                <div class="legend-info">
                  <span class="legend-label">Lazer</span>
                  <span class="legend-value">{{ formatPercentage(despesas.lazer) }}%</span>
                </div>
              </div>
              <div class="legend-item">
                <span class="color-box" style="background-color: #FFD700"></span>
                <div class="legend-info">
                  <span class="legend-label">Transporte</span>
                  <span class="legend-value">{{ formatPercentage(despesas.transporte) }}%</span>
                </div>
              </div>
              <div class="legend-item">
                <span class="color-box" style="background-color: #2F4F4F"></span>
                <div class="legend-info">
                  <span class="legend-label">Contas</span>
                  <span class="legend-value">{{ formatPercentage(despesas.contas) }}%</span>
                </div>
              </div>
              <div class="legend-item">
                <span class="color-box" style="background-color: #DC143C"></span>
                <div class="legend-info">
                  <span class="legend-label">Alimentação</span>
                  <span class="legend-value">{{ formatPercentage(despesas.alimentacao) }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Conteúdo da aba Analítico Mensal -->
      <div v-if="activeTab === 'analitico'" class="tab-content analitico-content">
        <div class="filters-container">
          <div class="filter-group">
            <label>Período de Análise:</label>
            <select v-model="analiseConfig.periodo" class="filter-input">
              <option value="3">Últimos 3 meses</option>
              <option value="6">Últimos 6 meses</option>
              <option value="12">Último ano</option>
            </select>
          </div>
        </div>

        <!-- Proporção Renda/Despesa -->
        <div class="analise-section">
          <h3>Proporção Renda/Despesa</h3>
          <div class="proporcao-container">
            <div class="proporcao-bar">
              <div 
                class="proporcao-receita"
                :style="{ width: `${proporcaoRendaDespesa.porcentagemReceita}%` }"
              >
                {{ proporcaoRendaDespesa.porcentagemReceita.toFixed(1) }}%
              </div>
              <div 
                class="proporcao-despesa"
                :style="{ width: `${proporcaoRendaDespesa.porcentagemDespesa}%` }"
              >
                {{ proporcaoRendaDespesa.porcentagemDespesa.toFixed(1) }}%
              </div>
            </div>
            <div class="proporcao-legenda">
              <div class="legenda-item">
                <span class="cor-receita"></span>
                <span>Receitas: {{ formatCurrency(proporcaoRendaDespesa.totalReceitas) }}</span>
              </div>
              <div class="legenda-item">
                <span class="cor-despesa"></span>
                <span>Despesas: {{ formatCurrency(proporcaoRendaDespesa.totalDespesas) }}</span>
              </div>
            </div>
            <div class="indicadores">
              <div class="indicador" :class="getIndicadorClass(proporcaoRendaDespesa.saudefinanceira)">
                <i class="fas" :class="getIndicadorIcone(proporcaoRendaDespesa.saudefinanceira)"></i>
                <span>Saúde Financeira: {{ proporcaoRendaDespesa.saudefinanceira }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tendências de Gastos -->
        <div class="analise-section">
          <h3>Tendências de Gastos</h3>
          <div class="tendencias-container">
            <div v-for="(tendencia, categoria) in tendenciasGastos" 
                 :key="categoria" 
                 class="tendencia-card"
                 :class="getTendenciaClass(tendencia.variacao)"
            >
              <div class="tendencia-header">
                <span class="categoria-nome">{{ categoria }}</span>
                <span class="variacao-valor">
                  <span class="tendencia-icone">{{ getTendenciaIcone(tendencia.variacao) }}</span>
                  {{ tendencia.variacao }}%
                </span>
              </div>
              <div class="tendencia-detalhes">
                <p>Média atual: {{ formatCurrency(tendencia.mediaAtual) }}</p>
                <p>Média anterior: {{ formatCurrency(tendencia.mediaAnterior) }}</p>
              </div>
              <div class="tendencia-grafico">
                <div class="grafico-barra">
                  <div 
                    class="barra-valor"
                    :style="{ width: `${getTendenciaBarraWidth(tendencia.variacao)}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Botão de envio por email -->
      <button class="download-button" @click="enviarRelatorio" :disabled="enviandoRelatorio">
        <i class="fas fa-envelope"></i>
        {{ enviandoRelatorio ? 'Enviando...' : 'Enviar Relatório por Email' }}
      </button>

      <!-- Modal de confirmação -->
      <div v-if="showModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ modalTitle }}</h3>
            <span class="close-btn" @click="showModal = false">&times;</span>
          </div>
          <div class="modal-body">
            <p>{{ modalMessage }}</p>
          </div>
          <div class="modal-footer" v-if="!enviandoRelatorio">
            <button @click="showModal = false" class="btn-ok">OK</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from './NavBar.vue';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'vue-chartjs';
import axios from 'axios';
import { TransactionService } from '../services/TransactionService';
import { computed } from 'vue';

ChartJS.register(ArcElement, Tooltip, Legend);

export default {
  name: 'Relatorio',
  components: {
    NavBar,
    Doughnut
  },
  data() {
    return {
      currentDate: new Date(),
      activeTab: 'dashboard',
      chart: null,
      chartData: {
        labels: ['Lazer', 'Transporte', 'Contas', 'Alimentação'],
        datasets: [{
          data: [0, 0, 0, 0],
          backgroundColor: ['#FFA500', '#FFD700', '#2F4F4F', '#DC143C'],
          borderWidth: 0,
          hoverBackgroundColor: ['#FFA500', '#FFD700', '#2F4F4F', '#DC143C'],
          hoverBorderWidth: 4,
          hoverBorderColor: 'white',
          spacing: 5
        }]
      },
      despesas: {
        lazer: 500,
        transporte: 300,
        contas: 1200,
        alimentacao: 800
      },
      filtros: {
        periodo: new Date().toISOString().slice(0, 7), // formato YYYY-MM
        tipo: '',
        categoria: ''
      },
      transacoes: [], // Será preenchido com dados da API
      totalizadores: {
        receitas: 0,
        despesas: 0,
        saldo: 0
      },
      analiseConfig: {
        periodo: '3'
      },
      proporcaoRendaDespesa: {
        totalReceitas: 0,
        totalDespesas: 0,
        porcentagemReceita: 0,
        porcentagemDespesa: 0,
        saudefinanceira: 'Boa'
      },
      tendenciasGastos: {
        Alimentação: { variacao: 0, mediaAtual: 0, mediaAnterior: 0 },
        Transporte: { variacao: 0, mediaAtual: 0, mediaAnterior: 0 },
        Lazer: { variacao: 0, mediaAtual: 0, mediaAnterior: 0 },
        Contas: { variacao: 0, mediaAtual: 0, mediaAnterior: 0 }
      },
      enviandoRelatorio: false,
      showModal: false,
      modalTitle: '',
      modalMessage: ''
    }
  },
  computed: {
    transactions() {
      return TransactionService.getTransactionsByMonth(this.currentDate).value
    },
    monthlyBalance() {
      return TransactionService.getMonthlyBalance(this.currentDate).value
    },
    incomeVsExpenses() {
      return TransactionService.getIncomeVsExpenses(this.currentDate).value
    },
    categoryTotals() {
      return TransactionService.getTotalsByCategory(this.currentDate).value
    },
    formatMonthYear() {
      const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 
        'Maio', 'Junho', 'Julho', 'Agosto',
        'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      return `${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    },
    transacoesFiltradas() {
      return this.transacoes.filter(transacao => {
        // Melhoria na lógica de filtragem por período
        const transacaoData = new Date(transacao.data);
        const periodoSelecionado = new Date(this.filtros.periodo);
        const periodoMatch = 
          transacaoData.getFullYear() === periodoSelecionado.getFullYear() && 
          transacaoData.getMonth() === periodoSelecionado.getMonth();
        
        const tipoMatch = !this.filtros.tipo || transacao.tipo === this.filtros.tipo;
        const categoriaMatch = !this.filtros.categoria || transacao.categoria === this.filtros.categoria;
        return periodoMatch && tipoMatch && categoriaMatch;
      });
    },
    despesas() {
      const totals = TransactionService.getTotalsByCategory(this.currentDate).value;
      return {
        lazer: totals.lazer || 0,
        transporte: totals.transporte || 0,
        contas: totals.contas || 0,
        alimentacao: totals.alimentacao || 0
      };
    },
    totalDespesas() {
      return Object.values(this.despesas).reduce((acc, curr) => acc + curr, 0);
    }
  },
  methods: {
    previousMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1);
    },
    nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1);
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
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
    formatPercentage(value) {
      const total = Object.values(this.despesas).reduce((sum, val) => sum + val, 0);
      if (total === 0) return '0.0';
      return ((value / total) * 100).toFixed(1);
    },
    async carregarDespesas() {
      try {
        // Preparado para buscar dados reais da API
        // Ajuste a URL conforme a estrutura do seu backend
        // const response = await axios.get('http://localhost:8000/Movimentacao/despesas-por-categoria');
        // const despesas = response.data;
        // 
        // this.despesas = {
        //   lazer: this.somarDespesasCategoria(despesas, 'lazer'),
        //   transporte: this.somarDespesasCategoria(despesas, 'transporte'),
        //   contas: this.somarDespesasCategoria(despesas, 'contas'),
        //   alimentacao: this.somarDespesasCategoria(despesas, 'alimentacao')
        // };
        
        // Temporariamente usando dados de exemplo
        // Em produção, descomentar o código acima e remover este bloco
        this.usarDadosExemplo();
        
        this.atualizarGrafico();
      } catch (error) {
        console.error('Erro ao carregar despesas:', error);
        this.usarDadosExemplo();
      }
    },
    
    somarDespesasCategoria(despesas, categoria) {
      return despesas
        .filter(d => d.categoria === categoria)
        .reduce((sum, d) => sum + d.valor, 0);
    },
    
    calcularPorcentagens() {
      const total = Object.values(this.despesas).reduce((sum, valor) => sum + valor, 0);
      if (total === 0) return [0, 0, 0, 0];
      
      return [
        this.despesas.lazer,
        this.despesas.transporte,
        this.despesas.contas,
        this.despesas.alimentacao
      ];
    },
    
    usarDadosExemplo() {
      // DADOS DE EXEMPLO - Remover quando conectar à API real
      this.despesas = {
        lazer: 500,
        transporte: 120,
        contas: 250,
        alimentacao: 130
      };
      this.atualizarGrafico();
    },
    
    atualizarGrafico() {
      const valores = this.calcularPorcentagens();
      
      if (this.chart) {
        this.chart.destroy();
      }
      
      const ctx = this.$refs.donutChart.getContext('2d');
      this.chart = new ChartJS(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Lazer', 'Transporte', 'Contas', 'Alimentação'],
          datasets: [{
            data: valores,
            backgroundColor: ['#FFA500', '#FFD700', '#2F4F4F', '#DC143C'],
            borderWidth: 0,
            hoverOffset: 4,
            hoverBorderWidth: 2,
            hoverBorderColor: 'white'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              enabled: true,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              titleColor: '#333',
              bodyColor: '#666',
              titleFont: {
                size: 14,
                weight: 'bold'
              },
              bodyFont: {
                size: 13
              },
              padding: 12,
              displayColors: true,
              callbacks: {
                label: function(context) {
                  const value = context.raw;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((value * 100) / total).toFixed(1);
                  const formattedValue = new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(value);
                  return `${context.label}: ${formattedValue} (${percentage}%)`;
                }
              }
            }
          },
          onHover: (event, elements) => {
            event.native.target.style.cursor = elements.length ? 'pointer' : 'default';
          },
          hover: {
            mode: 'nearest',
            intersect: true
          }
        }
      });
    },
    
    async carregarTransacoes() {
      try {
        // Preparado para buscar dados reais da API
        // Exemplo de como seria com axios:
        // const response = await axios.get(`http://localhost:8000/Movimentacao/periodo/${this.filtros.periodo}`);
        // this.transacoes = response.data;
        
        // Temporariamente usando dados de exemplo
        // Em produção, descomentar o código acima e remover este bloco
        this.transacoes = [
          {
            id: 1,
            data: '2024-03-15',
            descricao: 'Salário',
            categoria: 'salario',
            valor: 5000,
            tipo: 'receita',
            status: 'pago'
          },
          {
            id: 2,
            data: '2024-03-16',
            descricao: 'Supermercado',
            categoria: 'alimentacao',
            valor: 350.50,
            tipo: 'despesa',
            status: 'pago'
          },
          {
            id: 3,
            data: '2024-03-17',
            descricao: 'Cinema',
            categoria: 'lazer',
            valor: 60,
            tipo: 'despesa',
            status: 'pendente'
          }
        ];
        
        this.calcularTotalizadores();
      } catch (error) {
        console.error('Erro ao carregar transações:', error);
      }
    },

    calcularTotalizadores() {
      const transacoesFiltradas = this.transacoesFiltradas;
      this.totalizadores.receitas = transacoesFiltradas
        .filter(t => t.tipo === 'receita')
        .reduce((sum, t) => sum + t.valor, 0);
      
      this.totalizadores.despesas = transacoesFiltradas
        .filter(t => t.tipo === 'despesa')
        .reduce((sum, t) => sum + t.valor, 0);
      
      this.totalizadores.saldo = this.totalizadores.receitas - this.totalizadores.despesas;
    },

    formatarData(data) {
      return new Date(data).toLocaleDateString('pt-BR');
    },

    async carregarDadosAnaliticos() {
      try {
        // Simulando dados - Substitua por chamadas reais à API
        this.proporcaoRendaDespesa = {
          totalReceitas: 5000,
          totalDespesas: 3500,
          porcentagemReceita: 58.8,
          porcentagemDespesa: 41.2,
          saudefinanceira: this.calcularSaudeFinanceira(5000, 3500)
        };

        this.tendenciasGastos = {
          Alimentação: { variacao: 15, mediaAtual: 800, mediaAnterior: 696 },
          Transporte: { variacao: -5, mediaAtual: 300, mediaAnterior: 316 },
          Lazer: { variacao: 25, mediaAtual: 500, mediaAnterior: 400 },
          Contas: { variacao: 0, mediaAtual: 1200, mediaAnterior: 1200 }
        };
      } catch (error) {
        console.error('Erro ao carregar dados analíticos:', error);
      }
    },

    calcularSaudeFinanceira(receitas, despesas) {
      const proporcao = (despesas / receitas) * 100;
      if (proporcao <= 60) return 'Ótima';
      if (proporcao <= 80) return 'Boa';
      if (proporcao <= 90) return 'Regular';
      return 'Atenção';
    },

    getIndicadorClass(saude) {
      return {
        'otima': saude === 'Ótima',
        'boa': saude === 'Boa',
        'regular': saude === 'Regular',
        'atencao': saude === 'Atenção'
      };
    },

    getIndicadorIcone(saude) {
      switch (saude) {
        case 'Ótima': return 'fa-laugh-beam';
        case 'Boa': return 'fa-smile';
        case 'Regular': return 'fa-meh';
        default: return 'fa-frown';
      }
    },

    getTendenciaClass(variacao) {
      if (variacao > 10) return 'tendencia-alta';
      if (variacao < -10) return 'tendencia-baixa';
      return 'tendencia-estavel';
    },

    getTendenciaIcone(variacao) {
      if (variacao > 0) return '▲';
      if (variacao < 0) return '▼';
      return '−';
    },

    getTendenciaBarraWidth(variacao) {
      return Math.min(Math.abs(variacao) * 2, 100);
    },

    getCategoryIndex(category) {
      const categoryMap = {
        'lazer': 0,
        'transporte': 1,
        'contas': 2,
        'alimentacao': 3
      };
      return categoryMap[category] || 0;
    },

    getCategoryColor(category) {
      const colorMap = {
        'lazer': '#FFA500',
        'transporte': '#FFD700',
        'contas': '#2F4F4F',
        'alimentacao': '#DC143C'
      };
      return colorMap[category] || '#000000';
    },

    formatCategoryName(category) {
      const nameMap = {
        'lazer': 'Lazer',
        'transporte': 'Transporte',
        'contas': 'Contas',
        'alimentacao': 'Alimentação'
      };
      return nameMap[category] || category;
    },

    async enviarRelatorio() {
      this.enviandoRelatorio = true;
      
      try {
        // Primeiro, atualiza todos os dados
        await Promise.all([
          this.carregarTransacoes(),
          this.carregarDespesas(),
          this.carregarDadosAnaliticos()
        ]);

        // Prepara os dados para enviar
        const dadosRelatorio = {
          detalhado: {
            transacoes: this.transacoesFiltradas,
            totalizadores: this.totalizadores
          },
          dashboard: {
            despesas: this.despesas,
            distribuicao: Object.entries(this.despesas).map(([categoria, valor]) => ({
              categoria,
              valor,
              percentual: this.formatPercentage(valor)
            }))
          },
          analitico: {
            proporcaoRendaDespesa: this.proporcaoRendaDespesa,
            tendenciasGastos: this.tendenciasGastos
          },
          periodo: this.filtros.periodo
        };

        // Envia para o backend
        const response = await axios.post('/relatorio/enviar-email', dadosRelatorio);
        
        this.showModal = true;
        this.modalTitle = 'Sucesso!';
        this.modalMessage = 'O relatório foi enviado para seu email cadastrado. Por favor, verifique sua caixa de entrada.';
        
      } catch (error) {
        console.error('Erro ao enviar relatório:', error);
        
        this.showModal = true;
        this.modalTitle = 'Erro';
        this.modalMessage = 'Não foi possível enviar o relatório. Por favor, tente novamente mais tarde.';
        
      } finally {
        this.enviandoRelatorio = false;
      }
    }
  },
  watch: {
    'filtros': {
      deep: true,
      handler() {
        this.calcularTotalizadores();
      }
    },
    activeTab: {
      immediate: true,
      handler(newTab, oldTab) {
        if (newTab === 'dashboard') {
          this.$nextTick(() => {
            this.carregarDespesas();
          });
        }
        if (newTab === 'analitico') {
          this.$nextTick(() => {
            this.carregarDadosAnaliticos();
          });
        }
        if (newTab === 'detalhado') {
          this.$nextTick(() => {
            this.carregarTransacoes();
          });
        }
      }
    },
    'analiseConfig.periodo'() {
      if (this.activeTab === 'analitico') {
        this.carregarDadosAnaliticos();
      }
    },
    despesas: {
      handler() {
        this.atualizarGrafico();
      },
      deep: true
    }
  },
  mounted() {
    this.$nextTick(() => {
      // Carrega os dados iniciais com base na aba ativa
      if (this.activeTab === 'dashboard') {
        this.carregarDespesas();
      } else if (this.activeTab === 'analitico') {
        this.carregarDadosAnaliticos();
      } else if (this.activeTab === 'detalhado') {
        this.carregarTransacoes();
      }
    });
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.page-container {
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(to bottom, #ffffff, #e8f5e9);
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  position: relative;
  overflow-x: hidden;
}

.content-container {
  flex: 1;
  padding: 10px;
  margin-top: 60px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: visible;
  position: relative;
}

.report-tabs {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 40px;
  width: 100%;
  max-width: 1000px;
}

.tab-button {
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.tab-button.active {
  color: #4CAF50;
  border-bottom: 2px solid #4CAF50;
}

.chart-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  padding: 15px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.chart-wrapper {
  width: 350px;
  height: 350px;
  flex-shrink: 0;
}

.chart-legend {
  min-width: 200px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  flex-grow: 1;
  max-width: 300px;
  align-self: center;
  margin-top: 0;
}

.legend-items {
  margin: 0;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.legend-item:last-child {
  margin-bottom: 0;
}

.color-box {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  margin-right: 12px;
}

.legend-info {
  display: flex;
  justify-content: space-between;
  flex: 1;
  align-items: center;
}

.legend-label {
  font-weight: 500;
  color: #333;
  font-size: 0.95rem;
}

.legend-value {
  color: #666;
  font-size: 0.95rem;
  font-weight: 500;
}

.download-button {
  margin: 20px auto;
  padding: 12px 24px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.download-button:disabled {
  background: #cccccc;
  cursor: not-allowed;
  opacity: 0.8;
}

.download-button:hover:not(:disabled) {
  background: #45a049;
  transform: translateY(-1px);
}

.download-button:active:not(:disabled) {
  transform: translateY(0);
}

.download-button i {
  font-size: 1.2rem;
}

.tab-content {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 1000px;
  display: flex;
  flex-direction: column;
  overflow: visible;
  margin-bottom: 40px;
  position: relative;
  z-index: 0;
}

.filters-container {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-group label {
  font-size: 0.9rem;
  color: #666;
}

.filter-input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  min-width: 150px;
}

.summary-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.summary-card {
  flex: 1;
  min-width: 200px;
  padding: 15px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.summary-card h3 {
  font-size: 1rem;
  color: #666;
  margin-bottom: 5px;
}

.summary-card p {
  font-size: 1.2rem;
  font-weight: bold;
}

.summary-card.receitas p { color: #4CAF50; }
.summary-card.despesas p { color: #f44336; }
.summary-card.saldo p { color: #2196F3; }

.table-container {
  overflow-x: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.transactions-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.transactions-table th,
.transactions-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.transactions-table th {
  background: #f5f5f5;
  font-weight: 600;
  color: #333;
}

.categoria-tag {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  background: #e0e0e0;
}

.categoria-tag.alimentacao { background: #FFE0E0; color: #D32F2F; }
.categoria-tag.transporte { background: #E3F2FD; color: #1976D2; }
.categoria-tag.lazer { background: #E8F5E9; color: #388E3C; }
.categoria-tag.contas { background: #FFF3E0; color: #F57C00; }
.categoria-tag.salario { background: #E8F5E9; color: #388E3C; }
.categoria-tag.investimentos { background: #E1F5FE; color: #0288D1; }

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.status-badge.pago {
  background: #E8F5E9;
  color: #388E3C;
}

.status-badge.pendente {
  background: #FFF3E0;
  color: #F57C00;
}

td.receita { color: #4CAF50; }
td.despesa { color: #f44336; }

@media (max-width: 768px) {
  .filters-container {
    flex-direction: column;
    gap: 10px;
  }

  .filter-input {
    width: 100%;
  }

  .summary-cards {
    flex-direction: column;
  }

  .summary-card {
    width: 100%;
  }

  .transactions-table {
    font-size: 0.8rem;
  }

  .transactions-table th,
  .transactions-table td {
    padding: 8px;
  }

  .chart-container {
    flex-direction: column;
    align-items: center;
  }

  .chart-wrapper {
    width: 300px;
    height: 300px;
  }

  .chart-legend {
    width: 100%;
    max-width: none;
  }

  .report-tabs {
    margin-bottom: 25px;
  }

  .tab-content {
    padding: 15px;
    margin-bottom: 25px;
  }
}

.analitico-content {
  padding: 20px;
}

.analise-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.analise-section h3 {
  color: #333;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.proporcao-container {
  margin-top: 15px;
}

.proporcao-bar {
  display: flex;
  height: 40px;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.proporcao-receita {
  background: #4CAF50;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: width 0.3s ease;
  font-size: 1rem;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
  min-width: 60px;
  padding: 0 10px;
}

.proporcao-despesa {
  background: #f44336;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: width 0.3s ease;
  font-size: 1rem;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
  min-width: 60px;
  padding: 0 10px;
}

.proporcao-legenda {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin: 20px 0;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.legenda-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.1rem;
  color: #333;
  padding: 8px 16px;
  border-radius: 6px;
  background: #f8f9fa;
}

.legenda-item span:last-child {
  font-weight: 600;
}

.legenda-item:first-child {
  border-left: 4px solid #4CAF50;
}

.legenda-item:last-child {
  border-left: 4px solid #f44336;
}

.cor-receita {
  background: #4CAF50;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  display: inline-block;
  box-shadow: 0 2px 4px rgba(76, 175, 80, 0.2);
}

.cor-despesa {
  background: #f44336;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  display: inline-block;
  box-shadow: 0 2px 4px rgba(244, 67, 54, 0.2);
}

.indicadores {
  margin-top: 15px;
  display: flex;
  justify-content: center;
}

.indicador {
  padding: 8px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.indicador.otima { background: #E8F5E9; color: #2E7D32; }
.indicador.boa { background: #F1F8E9; color: #558B2F; }
.indicador.regular { background: #FFF3E0; color: #F57C00; }
.indicador.atencao { background: #FFEBEE; color: #C62828; }

.tendencias-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
  width: 100%;
}

.tendencia-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid #eee;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.tendencia-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.tendencia-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.categoria-nome {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.variacao-valor {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 1rem;
  padding: 4px 12px;
  border-radius: 16px;
}

.tendencia-icone {
  display: inline-block;
  margin-right: 4px;
  font-size: 1rem;
  line-height: 1;
}

.tendencia-alta .variacao-valor { 
  color: #C62828;
  background: #FFEBEE;
}

.tendencia-baixa .variacao-valor { 
  color: #2E7D32;
  background: #E8F5E9;
}

.tendencia-estavel .variacao-valor { 
  color: #F57C00;
  background: #FFF3E0;
}

.tendencia-detalhes {
  margin: 15px 0;
  font-size: 1rem;
  color: #333;
}

.tendencia-detalhes p {
  margin: 8px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tendencia-detalhes p:first-child {
  color: #2E7D32;
  font-weight: 500;
}

.tendencia-detalhes p:last-child {
  color: #666;
}

.grafico-barra {
  height: 8px;
  background: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 15px;
}

.barra-valor {
  height: 100%;
  transition: width 0.3s ease;
}

.tendencia-alta .barra-valor { 
  background: linear-gradient(to right, #FFCDD2, #C62828);
}

.tendencia-baixa .barra-valor { 
  background: linear-gradient(to right, #C8E6C9, #2E7D32);
}

.tendencia-estavel .barra-valor { 
  background: linear-gradient(to right, #FFE0B2, #F57C00);
}

/* Remove PDF-specific styles */
#pdf-content, .pdf-section, .pdf-subsection, .pdf-table, .pdf-chart-info,
.pdf-chart-item, .pdf-proporcao, .pdf-tendencias, .pdf-tendencia-item {
  display: none;
}

/* Modal styles */
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
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  font-size: 24px;
  color: #666;
  cursor: pointer;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
  color: #666;
  font-size: 1rem;
  line-height: 1.5;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

.btn-ok {
  padding: 8px 16px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s ease;
}

.btn-ok:hover {
  background: #45a049;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 10px;
  }
}
</style> 