import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../hooks/useLanguage'
import PublicHeader from '../components/layout/PublicHeader'
import DashboardSidebar from '../components/layout/DashboardSidebar'

const DashboardLayout = () => {
  const { t } = useTranslation()
  const { isRTL } = useLanguage()

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'font-arabic' : 'font-sans'}`}>
      <PublicHeader />
      
      <div className="flex">
        <DashboardSidebar />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
