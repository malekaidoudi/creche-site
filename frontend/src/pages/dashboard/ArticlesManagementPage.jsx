import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FileText, Plus, Search, Filter, Edit, Trash2, Eye, Calendar } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const ArticlesManagementPage = () => {
  const { t } = useTranslation()
  const { isRTL } = useLanguage()
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState(null)

  // Données simulées pour la démonstration
  const mockArticles = [
    {
      id: 1,
      title: isRTL ? 'أهمية اللعب في تطوير الطفل' : 'L\'importance du jeu dans le développement de l\'enfant',
      excerpt: isRTL ? 'اللعب هو وسيلة أساسية لتعلم الأطفال وتطوير مهاراتهم...' : 'Le jeu est un moyen essentiel pour l\'apprentissage et le développement des compétences...',
      status: 'published',
      author: 'Admin',
      created_at: '2024-01-15',
      views: 245
    },
    {
      id: 2,
      title: isRTL ? 'نصائح للتكيف مع الحضانة' : 'Conseils pour s\'adapter à la crèche',
      excerpt: isRTL ? 'كيف يمكن للأهل مساعدة أطفالهم على التكيف مع البيئة الجديدة...' : 'Comment les parents peuvent aider leurs enfants à s\'adapter au nouveau environnement...',
      status: 'draft',
      author: 'Staff',
      created_at: '2024-01-10',
      views: 0
    },
    {
      id: 3,
      title: isRTL ? 'التغذية الصحية للأطفال' : 'Alimentation saine pour les enfants',
      excerpt: isRTL ? 'دليل شامل للتغذية المتوازنة والصحية للأطفال في سن الحضانة...' : 'Guide complet pour une alimentation équilibrée et saine pour les enfants en crèche...',
      status: 'published',
      author: 'Admin',
      created_at: '2024-01-05',
      views: 189
    }
  ]

  useEffect(() => {
    loadArticles()
  }, [])

  const loadArticles = async () => {
    try {
      setLoading(true)
      // Simulation d'un appel API
      setTimeout(() => {
        setArticles(mockArticles)
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Erreur lors du chargement des articles:', error)
      toast.error('Erreur lors du chargement des articles')
      setLoading(false)
    }
  }

  const handleDeleteArticle = async (articleId) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذا المقال؟' : 'Êtes-vous sûr de vouloir supprimer cet article ?')) {
      return
    }

    try {
      // Simulation de suppression
      setArticles(articles.filter(article => article.id !== articleId))
      toast.success(isRTL ? 'تم حذف المقال بنجاح' : 'Article supprimé avec succès')
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status) => {
    const statusConfig = {
      published: { 
        color: 'bg-green-100 text-green-800', 
        text: isRTL ? 'منشور' : 'Publié' 
      },
      draft: { 
        color: 'bg-yellow-100 text-yellow-800', 
        text: isRTL ? 'مسودة' : 'Brouillon' 
      },
      archived: { 
        color: 'bg-gray-100 text-gray-800', 
        text: isRTL ? 'مؤرشف' : 'Archivé' 
      }
    }
    
    const config = statusConfig[status] || statusConfig.draft
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isRTL ? 'إدارة المقالات' : 'Gestion des articles'}
          </h1>
          <p className="mt-1 text-gray-600">
            {isRTL ? 'إنشاء وإدارة المقالات والمحتوى التعليمي' : 'Créer et gérer les articles et le contenu éducatif'}
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary mt-4 sm:mt-0"
        >
          <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {isRTL ? 'إضافة مقال' : 'Nouvel article'}
        </button>
      </div>

      {/* Filtres */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={isRTL ? 'البحث في المقالات...' : 'Rechercher des articles...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 rtl:pl-3 rtl:pr-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input w-full sm:w-auto"
            >
              <option value="all">{isRTL ? 'جميع الحالات' : 'Tous les statuts'}</option>
              <option value="published">{isRTL ? 'منشور' : 'Publié'}</option>
              <option value="draft">{isRTL ? 'مسودة' : 'Brouillon'}</option>
              <option value="archived">{isRTL ? 'مؤرشف' : 'Archivé'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des articles */}
      <div className="card">
        <div className="card-body p-0">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isRTL ? 'لا توجد مقالات' : 'Aucun article'}
              </h3>
              <p className="text-gray-500">
                {isRTL ? 'ابدأ بإنشاء مقالك الأول' : 'Commencez par créer votre premier article'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isRTL ? 'العنوان' : 'Titre'}
                    </th>
                    <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isRTL ? 'الحالة' : 'Statut'}
                    </th>
                    <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isRTL ? 'المؤلف' : 'Auteur'}
                    </th>
                    <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isRTL ? 'المشاهدات' : 'Vues'}
                    </th>
                    <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isRTL ? 'التاريخ' : 'Date'}
                    </th>
                    <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isRTL ? 'الإجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredArticles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {article.title}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {article.excerpt.substring(0, 100)}...
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(article.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {article.author}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 text-gray-400 mr-1" />
                          {article.views}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                          {new Date(article.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <button
                            onClick={() => setSelectedArticle(article)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteArticle(article.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ArticlesManagementPage
