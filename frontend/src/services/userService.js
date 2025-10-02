import { apiRequest, getPaginatedData } from './api'

export const userService = {
  // Obtenir tous les utilisateurs
  getUsers: async (params = {}) => {
    return await getPaginatedData('/users', params)
  },

  // Obtenir tous les utilisateurs (alias pour compatibilité)
  getAllUsers: async (params = {}) => {
    return await getPaginatedData('/users', params)
  },

  // Obtenir un utilisateur par ID
  getUserById: async (id) => {
    const response = await apiRequest.get(`/users/${id}`)
    return response.data
  },

  // Créer un utilisateur
  createUser: async (userData) => {
    const response = await apiRequest.post('/users', userData)
    return response.data
  },

  // Mettre à jour un utilisateur
  updateUser: async (id, userData) => {
    const response = await apiRequest.put(`/users/${id}`, userData)
    return response.data
  },

  // Supprimer un utilisateur
  deleteUser: async (id) => {
    const response = await apiRequest.delete(`/users/${id}`)
    return response.data
  },
}
