import { AlertCircle, LoaderCircle, ShieldCheck, Users, UserRoundCheck, Store, UserCog, ShoppingBag, Clock3 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../services/adminApi'
import { adminShopApi } from '../services/adminShopApi'
import { PageHeader, StatCard } from '../components/UI'

function AdminDashboardPage() {
  const [summary, setSummary] = useState(null)
  const [shops, setShops] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const loadSummary = useCallback(async () => {
    setIsLoading(true)
    try {
      const [usersResponse, shopsResponse] = await Promise.all([
        adminApi.getUsers({ limit: 1 }),
        adminShopApi.getAllShops(),
      ])
      setSummary(usersResponse.data.data.summary)
      setShops(shopsResponse.data.shops || [])
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(error.response?.status === 403 ? 'You do not have permission to view the admin dashboard.' : 'Unable to load dashboard data.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const request = window.setTimeout(loadSummary, 0)
    return () => window.clearTimeout(request)
  }, [loadSummary])

  return (
    <div className="app-shell admin-shell">
      <div className="container admin-container">
        <PageHeader
          eyebrow="Administration"
          title="Platform overview"
          description="Manage the people and shops that keep XeroQ moving."
          actions={<><Link to="/admin/users" className="secondary-button"><Users size={17} /> User management</Link><Link to="/admin/shops" className="primary-button"><Store size={17} /> Shop management</Link></>}
        />
        {errorMessage && <div className="auth-error admin-message"><AlertCircle size={18} /> {errorMessage} <button type="button" className="text-button" onClick={loadSummary}>Retry</button></div>}
        {isLoading ? <div className="admin-empty dashboard-card"><LoaderCircle size={28} className="spin-icon" /><p>Loading dashboard...</p></div> : <>
          <div className="admin-metric-grid">
            <AdminMetric icon={Users} label="Total users" value={summary?.totalUsers ?? 0} />
            <AdminMetric icon={UserRoundCheck} label="Students" value={summary?.students ?? 0} />
            <AdminMetric icon={Store} label="Registered shops" value={shops.length} />
            <AdminMetric icon={Clock3} label="Pending approvals" value={shops.filter((shop) => shop.approvalStatus === 'pending').length} />
            <AdminMetric icon={UserCog} label="Shop owners" value={summary?.shopOwners ?? 0} />
            <AdminMetric icon={ShoppingBag} label="Platform orders" value="Unavailable" />
          </div>
          <section className="admin-dashboard-note dashboard-card">
            <ShieldCheck size={22} />
            <div><strong>Activity and order reporting need an admin API</strong><p>User and shop totals above come from existing endpoints. The backend currently provides no platform-wide order, recent activity, report, or analytics endpoint, so those sections are intentionally not populated with estimates.</p></div>
          </section>
        </>}
      </div>
    </div>
  )
}

function AdminMetric({ icon: Icon, label, value }) {
  return <StatCard icon={Icon} label={label} value={value} />
}

export default AdminDashboardPage
