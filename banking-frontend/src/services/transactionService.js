import api from '../utils/axiosInstance'

export const transactionService = {
  deposit: async (data) => {
    const response = await api.post('/transactions/deposit', data)
    return response.data
  },

  withdraw: async (data) => {
    const response = await api.post('/transactions/withdraw', data)
    return response.data
  },

  transfer: async (data) => {
    const response = await api.post('/transactions/transfer', data)
    return response.data
  },

  getHistory: async (accountNumber) => {
    const response = await api.get(`/transactions/history/${accountNumber}`)
    return response.data
  },

  getHistoryPaged: async (accountNumber, page = 0, size = 10) => {
    const response = await api.get(`/transactions/history/${accountNumber}/page`, {
      params: { page, size },
    })
    return response.data
  },

  downloadStatement: async (accountNumber) => {
    const response = await api.get(`/transactions/statement/${accountNumber}`, {
      responseType: 'blob',
    })
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `statement-${accountNumber}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },
}
