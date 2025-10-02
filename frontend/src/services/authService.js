import { apiRequest } from './api'

export const authService = {
  // Connexion
  login: async (credentials) => {
    return await apiRequest.post('/auth/login', credentials)
  },

  // Inscription
  register: async (userData) => {
    return await apiRequest.post('/auth/register', userData)
  },

  // Obtenir l'utilisateur actuel
  getCurrentUser: async () => {
    const response = await apiRequest.get('/auth/me')
    return response.data.user
  },

  // Mettre à jour le profil
  updateProfile: async (profileData) => {
    return await apiRequest.put('/auth/profile', profileData)
  },

  // Changer le mot de passe
  changePassword: async (passwordData) => {
    return await apiRequest.put('/auth/change-password', passwordData)
  },

  // Rafraîchir le token
  refreshToken: async () => {
    return await apiRequest.post('/auth/refresh')
  },

  // Déconnexion (côté client)
  logout: () => {
    localStorage.removeItem('token')
  },
}
