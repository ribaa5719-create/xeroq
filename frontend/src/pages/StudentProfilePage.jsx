import { UserRound } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { EmptyState, PageHeader } from '../components/UI'

function StudentProfilePage() {
  const { user } = useAuth()
  const details = [
    ['Full name', user?.name],
    ['Email address', user?.email],
    ['Phone number', user?.phone],
    ['Account type', user?.role === 'student' ? 'Student' : user?.role],
  ].filter(([, value]) => value)

  return (
    <div className="app-shell profile-shell">
      <div className="container profile-container">
        <PageHeader eyebrow="Account" title="My profile" description="Review the account information currently associated with your XeroQ profile." />
        {details.length ? (
          <section className="dashboard-card profile-card">
            <div className="profile-card-heading"><span className="profile-avatar large">{(user?.name || 'X').trim().charAt(0).toUpperCase()}</span><div><h2>{user?.name || 'XeroQ student'}</h2><p>{user?.email}</p></div></div>
            <dl className="profile-detail-list">{details.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
            <p className="profile-readonly-note">Profile editing is not available because there is no profile-update endpoint in the current frontend API.</p>
          </section>
        ) : <EmptyState icon={UserRound} title="Profile information unavailable" description="Sign in again to load your account details." />}
      </div>
    </div>
  )
}

export default StudentProfilePage
