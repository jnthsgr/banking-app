import api from '../utils/axiosInstance'

export const cardService = {
  getMyCards: async () => {
    const response = await api.get('/cards')
    return response.data
  },

  issueCard: async (accountNumber, cardType) => {
    const response = await api.post('/cards', { accountNumber, cardType })
    return response.data
  },

  lockCard: async (cardId) => {
    const response = await api.patch(`/cards/${cardId}/lock`)
    return response.data
  },

  unlockCard: async (cardId) => {
    const response = await api.patch(`/cards/${cardId}/unlock`)
    return response.data
  },
}
