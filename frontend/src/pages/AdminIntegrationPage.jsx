import { BarChart3, FileText, ShoppingBag } from 'lucide-react'
import { EmptyState, PageHeader } from '../components/UI'

const pageDetails = {
  orders: {
    title: 'Order monitoring',
    description: 'Review marketplace orders and fulfillment activity.',
    message: 'Order monitoring is not available yet. The current backend exposes student and shop-scoped order endpoints, but no administrator order-list endpoint.',
    icon: ShoppingBag,
  },
  reports: {
    title: 'Reports',
    description: 'Review customer complaints and platform reports.',
    message: 'Complaint and report management needs a backend report data model and administrative endpoints before this view can display or process reports.',
    icon: FileText,
  },
  analytics: {
    title: 'Platform analytics',
    description: 'Understand activity across the XeroQ marketplace.',
    message: 'Platform-wide analytics are not exposed by the current backend. Shop analytics are scoped to shop owners; no platform analytics endpoint is available.',
    icon: BarChart3,
  },
}

function AdminIntegrationPage({ page }) {
  const content = pageDetails[page]
  return (
    <div className="app-shell admin-shell">
      <div className="container admin-container">
        <PageHeader eyebrow="Administration" title={content.title} description={content.description} />
        <EmptyState icon={content.icon} title="Backend integration required" description={content.message} />
      </div>
    </div>
  )
}

export default AdminIntegrationPage
