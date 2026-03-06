import api from '../utils/axiosInstance'

export const accountService = {
  createAccount: async (accountType) => {
    const response = await api.post('/accounts', { accountType })
    return response.data
  },

  getMyAccounts: async () => {
    const response = await api.get('/accounts')
    return response.data
  },
}