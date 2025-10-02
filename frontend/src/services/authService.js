import { apiRequest } from './api'
import { authenticateDemo, demoAccounts } from '../data/demoAccounts'
import { forceDemo, debugAuth } from '../utils/debugAuth'

export const authService = {
  // Connexion
  login: async (credentials) => {
    // Détection du mode démo avec debug
    debugAuth()
    const isDemo = forceDemo()
    
    if (isDemo) {
      console.log('🎭 Mode démo activé - Utilisation des comptes de démonstration')
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const result = authenticateDemo(credentials.email, credentials.password)
          if (result.success) {
            resolve({ data: result.data })
          } else {
            reject(new Error(result.error))
          }
        }, 1000) // Simuler un délai réseau
      })
    }
    
    return await apiRequest.post('/auth/login', credentials)
  },

  // Inscription
  register: async (userData) => {
    return await apiRequest.post('/auth/register', userData)
  },

  // Obtenir l'utilisateur actuel
  getCurrentUser: async () => {
    // En mode démo, retourner l'utilisateur depuis le localStorage
    const isDemo = forceDemo()
    
    if (isDemo) {
      const token = localStorage.getItem('token')
      if (token === 'demo-jwt-token-for-github-pages') {
        const userStr = localStorage.getItem('demoUser')
        if (userStr) {
          return { data: { user: JSON.parse(userStr) } }
        }
      }
      throw new Error('Non authentifié')
    }
    
    return await apiRequest.get('/auth/me')
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
    localStorage.removeItem('demoUser')
  },
}
