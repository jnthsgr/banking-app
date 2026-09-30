import api from '../utils/axiosInstance'

export const loanService = {
  getProducts: async () => {
    const response = await api.get('/loans/products')
    return response.data
  },

  getMyLoans: async () => {
    const response = await api.get('/loans/mine')
    return response.data
  },

  apply: async (data) => {
    const response = await api.post('/loans/apply', data)
    return response.data
  },
}
