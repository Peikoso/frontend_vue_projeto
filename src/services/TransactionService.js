import { ref, computed } from 'vue'

const transactions = ref([])

export const TransactionService = {
  transactions,

  addTransaction(transaction) {
    transactions.value.push({
      ...transaction,
      id: transactions.value.length + 1,
      data: transaction.data || new Date().toISOString().split('T')[0]
    })
  },

  getTransactionsByMonth(date) {
    return computed(() => {
      return transactions.value.filter(transaction => {
        const transactionDate = new Date(transaction.data)
        return transactionDate.getMonth() === date.getMonth() &&
               transactionDate.getFullYear() === date.getFullYear()
      })
    })
  },

  getTotalsByCategory(date) {
    return computed(() => {
      const monthTransactions = this.getTransactionsByMonth(date).value
      return monthTransactions.reduce((acc, transaction) => {
        const category = transaction.categoria
        if (!acc[category]) {
          acc[category] = 0
        }
        acc[category] += transaction.valor
        return acc
      }, {})
    })
  },

  getMonthlyBalance(date) {
    return computed(() => {
      const monthTransactions = this.getTransactionsByMonth(date).value
      return monthTransactions.reduce((total, transaction) => total + transaction.valor, 0)
    })
  },

  getIncomeVsExpenses(date) {
    return computed(() => {
      const monthTransactions = this.getTransactionsByMonth(date).value
      return monthTransactions.reduce((acc, transaction) => {
        if (transaction.valor > 0) {
          acc.income += transaction.valor
        } else {
          acc.expenses += Math.abs(transaction.valor)
        }
        return acc
      }, { income: 0, expenses: 0 })
    })
  }
} 