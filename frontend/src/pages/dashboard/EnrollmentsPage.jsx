import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { UserPlus, Search, Filter, CheckCircle, XCircle, Clock, Eye, Calendar, Utensils, Heart } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'
import { enrollmentService } from '../../services/enrollmentService'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import PageHeader from '../../components/ui/PageHeader'
import toast from 'react-hot-toast'

const EnrollmentsPage = () => {
  const { t } = useTranslation()
  const { isRTL } = useLanguage()
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedEnrollment, setSelectedEnrollment] = useState(null)

  useEffect(() => {
    loadEnrollments()
  }, [])

  const loadEnrollments = async () => {
    try {
      setLoading(true)
      const response = await enrollmentService.getAllEnrollments()
      setEnrollments(response.enrollments || [])
    } catch (error) {
      console.error('Erreur lors du chargement des inscriptions:', error)
      toast.error('Erreur lors du chargement des inscriptions')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (enrollmentId, newStatus) => {
    try {
      await enrollmentService.updateEnrollmentStatus(enrollmentId, newStatus)
      toast.success(isRTL ? 'تم تحديث حالة التسجيل' : 'Statut de l\'inscription mis à jour')
      loadEnrollments()
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour')
    }
  }

  const handleApprove = async (enrollmentId) => {
    try {
      await enrollmentService.approveEnrollment(enrollmentId)
      toast.success(isRTL ? 'تم قبول التسجيل' : 'Inscription approuvée')
      loadEnrollments()
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error)
      toast.error(error.response?.data?.error || 'Erreur lors de l\'approbation')
    }
  }

  const handleReject = async (enrollmentId) => {
    try {
      await enrollmentService.rejectEnrollment(enrollmentId)
      toast.success(isRTL ? 'تم رفض التسجيل' : 'Inscription rejetée')
      loadEnrollments()
    } catch (error) {
      console.error('Erreur lors du rejet:', error)
      toast.error(error.response?.data?.error || 'Erreur lors du rejet')
    }
  }

  const handleView = async (enrollmentId) => {
    try {
      const response = await enrollmentService.viewEnrollment(enrollmentId)
      setSelectedEnrollment(response.enrollment)
      // Ici vous pouvez ouvrir un modal ou naviguer vers une page de détails
      console.log('Détails de l\'inscription:', response.enrollment)
    } catch (error) {
      console.error('Erreur lors de la consultation:', error)
      toast.error(error.response?.data?.error || 'Erreur lors de la consultation')
    }
  }

  const filteredEnrollments = enrollments.filter(enrollment => {
    const childName = `${enrollment.child?.first_name || ''} ${enrollment.child?.last_name || ''}`.toLowerCase()
    const matchesSearch = childName.includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: Clock,
        text: isRTL ? 'في الانتظار' : 'En attente'
      },
      approved: { 
        color: 'bg-green-100 text-green-800', 
        icon: CheckCircle,
        text: isRTL ? 'مقبول' : 'Approuvé'
      },
      rejected: { 
        color: 'bg-red-100 text-red-800', 
        icon: XCircle,
        text: isRTL ? 'مرفوض' : 'Rejeté'
      }
    }
    return statusConfig[status] || statusConfig.pending
  }

  const getGenderIcon = (gender) => {
    return gender === 'M' ? '👦' : '👧'
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('nav.enrollments')}
        subtitle={isRTL ? 'إدارة طلبات التسجيل وموافقتها' : 'Gérer et approuver les demandes d\'inscription'}
      />

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { 
            label: isRTL ? 'إجمالي الطلبات' : 'Total des demandes', 
            value: enrollments.length, 
            color: 'bg-blue-500',
            icon: UserPlus
          },
          { 
            label: isRTL ? 'في الانتظار' : 'En attente', 
            value: enrollments.filter(e => e.status === 'pending').length, 
            color: 'bg-yellow-500',
            icon: Clock
          },
          { 
            label: isRTL ? 'مقبولة' : 'Approuvées', 
            value: enrollments.filter(e => e.status === 'approved').length, 
            color: 'bg-green-500',
            icon: CheckCircle
          },
          { 
            label: isRTL ? 'مرفوضة' : 'Rejetées', 
            value: enrollments.filter(e => e.status === 'rejected').length, 
            color: 'bg-red-500',
            icon: XCircle
          }
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4 rtl:ml-0 rtl:mr-4">
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filtres */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={isRTL ? 'البحث عن الأطفال...' : 'Rechercher des enfants...'}
                className="form-input pl-10 rtl:pl-4 rtl:pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="form-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">{isRTL ? 'جميع الحالات' : 'Tous les statuts'}</option>
              <option value="pending">{isRTL ? 'في الانتظار' : 'En attente'}</option>
              <option value="approved">{isRTL ? 'مقبولة' : 'Approuvées'}</option>
              <option value="rejected">{isRTL ? 'مرفوضة' : 'Rejetées'}</option>
            </select>

            <div className="text-sm text-gray-600 flex items-center">
              <UserPlus className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
              {filteredEnrollments.length} {isRTL ? 'طلب' : 'demande(s)'}
            </div>
          </div>
        </div>
      </div>

      {/* Liste des inscriptions */}
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isRTL ? 'لا توجد طلبات تسجيل' : 'Aucune demande d\'inscription'}
              </h3>
              <p className="text-gray-500">
                {isRTL ? 'لم يتم العثور على طلبات مطابقة لمعايير البحث' : 'Aucune demande ne correspond aux critères de recherche'}
              </p>
            </div>
          ) : (
            <>
              {/* Vue mobile - Cartes */}
              <div className="sm:hidden space-y-4 p-4">
                {filteredEnrollments.map((enrollment) => {
                  const statusConfig = getStatusBadge(enrollment.status)
                  const StatusIcon = statusConfig.icon
                  
                  return (
                    <div key={enrollment.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-lg">
                              {getGenderIcon(enrollment.child?.gender)}
                            </div>
                          </div>
                          <div className="ml-3 rtl:ml-0 rtl:mr-3">
                            <div className="text-sm font-medium text-gray-900">
                              {enrollment.child?.first_name} {enrollment.child?.last_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {enrollment.child?.birth_date && new Date(enrollment.child.birth_date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <StatusIcon className="w-4 h-4 mr-1 rtl:mr-0 rtl:ml-1" />
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusConfig.color}`}>
                            {statusConfig.text}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex items-center text-xs text-gray-500 mb-1">
                          <Calendar className="w-3 h-3 mr-1 rtl:mr-0 rtl:ml-1" />
                          {new Date(enrollment.enrollment_date).toLocaleDateString()}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {enrollment.lunch_assistance && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              <Utensils className="w-3 h-3 mr-1 rtl:mr-0 rtl:ml-1" />
                              {isRTL ? 'غداء' : 'Repas'}
                            </span>
                          )}
                          {enrollment.regulation_accepted && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1 rtl:mr-0 rtl:ml-1" />
                              {isRTL ? 'قوانين' : 'Règlement'}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(enrollment.id)}
                          className="flex-1 bg-indigo-50 text-indigo-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-100 transition-colors"
                        >
                          <Eye className="w-4 h-4 inline mr-1 rtl:mr-0 rtl:ml-1" />
                          {isRTL ? 'عرض' : 'Voir'}
                        </button>
                        {enrollment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(enrollment.id)}
                              className="flex-1 bg-green-50 text-green-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-green-100 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4 inline mr-1 rtl:mr-0 rtl:ml-1" />
                              {isRTL ? 'قبول' : 'Approuver'}
                            </button>
                            <button
                              onClick={() => handleReject(enrollment.id)}
                              className="flex-1 bg-red-50 text-red-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-100 transition-colors"
                            >
                              <XCircle className="w-4 h-4 inline mr-1 rtl:mr-0 rtl:ml-1" />
                              {isRTL ? 'رفض' : 'Rejeter'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Vue desktop - Tableau */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isRTL ? 'الطفل' : 'Enfant'}
                    </th>
                    <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isRTL ? 'تاريخ التسجيل' : 'Date d\'inscription'}
                    </th>
                    <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isRTL ? 'الخيارات' : 'Options'}
                    </th>
                    <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isRTL ? 'الحالة' : 'Statut'}
                    </th>
                    <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isRTL ? 'الإجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEnrollments.map((enrollment) => {
                    const statusConfig = getStatusBadge(enrollment.status)
                    const StatusIcon = statusConfig.icon
                    
                    return (
                      <tr key={enrollment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-lg">
                                {getGenderIcon(enrollment.child?.gender)}
                              </div>
                            </div>
                            <div className="ml-4 rtl:ml-0 rtl:mr-4">
                              <div className="text-sm font-medium text-gray-900">
                                {enrollment.child?.first_name} {enrollment.child?.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {enrollment.child?.birth_date && new Date(enrollment.child.birth_date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Calendar className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2 text-gray-400" />
                            {new Date(enrollment.enrollment_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {enrollment.lunch_assistance && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                <Utensils className="w-3 h-3 mr-1 rtl:mr-0 rtl:ml-1" />
                                {isRTL ? 'غداء' : 'Repas'}
                              </span>
                            )}
                            {enrollment.regulation_accepted && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1 rtl:mr-0 rtl:ml-1" />
                                {isRTL ? 'قوانين' : 'Règlement'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <StatusIcon className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusConfig.color}`}>
                              {statusConfig.text}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2 rtl:space-x-reverse">
                            <button
                              onClick={() => handleView(enrollment.id)}
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                              title={isRTL ? 'عرض' : 'Voir'}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {enrollment.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(enrollment.id)}
                                  className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                                  title={isRTL ? 'قبول' : 'Approuver'}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleReject(enrollment.id)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                  title={isRTL ? 'رفض' : 'Rejeter'}
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default EnrollmentsPage
