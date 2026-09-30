import api from '../utils/axiosInstance'

export const adminService = {
  getUsers: async () => {
    const response = await api.get('/admin/users')
    return response.data
  },

  getAccounts: async () => {
    const response = await api.get('/admin/accounts')
    return response.data
  },

  freezeAccount: async (accountNumber) => {
    const response = await api.patch(`/admin/accounts/${accountNumber}/freeze`)
    return response.data
  },

  unfreezeAccount: async (accountNumber) => {
    const response = await api.patch(`/admin/accounts/${accountNumber}/unfreeze`)
    return response.data
  },
}
