import { useState } from 'react'
import { Eye, EyeOff, Copy, Check } from 'lucide-react'
import { demoAccounts } from '../../data/demoAccounts'

const DemoAccountsInfo = () => {
  const [showPasswords, setShowPasswords] = useState(false)
  const [copiedAccount, setCopiedAccount] = useState(null)

  const copyToClipboard = async (text, accountType) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedAccount(accountType)
      setTimeout(() => setCopiedAccount(null), 2000)
    } catch (err) {
      console.error('Erreur lors de la copie:', err)
    }
  }

  const accounts = [
    {
      type: 'admin',
      data: demoAccounts.admin,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      icon: '👑',
      description: 'Accès complet au système'
    },
    {
      type: 'staff',
      data: demoAccounts.staff,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      icon: '👥',
      description: 'Gestion des enfants et activités'
    },
    {
      type: 'parent',
      data: demoAccounts.parent,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      icon: '👨‍👩‍👧‍👦',
      description: 'Espace parent dédié'
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            🎭 Comptes de Démonstration
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Utilisez ces comptes pour tester les différents rôles
          </p>
        </div>
        <button
          onClick={() => setShowPasswords(!showPasswords)}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
          {showPasswords ? 'Masquer' : 'Afficher'} les mots de passe
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accounts.map(({ type, data, bgColor, borderColor, textColor, icon, description }) => (
          <div
            key={type}
            className={`${bgColor} ${borderColor} border rounded-lg p-4`}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{icon}</span>
              <div>
                <h4 className={`font-semibold ${textColor} capitalize`}>
                  {type}
                </h4>
                <p className="text-xs text-gray-600">{description}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Email:</span>
                <div className="flex items-center gap-1">
                  <code className="text-xs bg-white px-2 py-1 rounded">
                    {data.email}
                  </code>
                  <button
                    onClick={() => copyToClipboard(data.email, `${type}-email`)}
                    className="p-1 hover:bg-white rounded transition-colors"
                    title="Copier l'email"
                  >
                    {copiedAccount === `${type}-email` ? (
                      <Check size={12} className="text-green-600" />
                    ) : (
                      <Copy size={12} className="text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Mot de passe:</span>
                <div className="flex items-center gap-1">
                  <code className="text-xs bg-white px-2 py-1 rounded">
                    {showPasswords ? data.password : '••••••••'}
                  </code>
                  <button
                    onClick={() => copyToClipboard(data.password, `${type}-password`)}
                    className="p-1 hover:bg-white rounded transition-colors"
                    title="Copier le mot de passe"
                  >
                    {copiedAccount === `${type}-password` ? (
                      <Check size={12} className="text-green-600" />
                    ) : (
                      <Copy size={12} className="text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-2">
          <span className="text-yellow-600">⚠️</span>
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Mode Démonstration</p>
            <p>
              Cette version fonctionne sans backend. Les données sont simulées et ne sont pas persistantes.
              Pour une version complète avec base de données, contactez-nous.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DemoAccountsInfo
