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
}