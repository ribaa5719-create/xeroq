import { ChevronDown, LogOut, Menu, UserRound, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import NotificationBell from './NotificationBell'

const navigation = {
  student: [
    { label: 'Overview', path: '/', end: true },
    { label: 'Find shops', path: '/shops' },
    { label: 'My orders', path: '/orders' },
    { label: 'Notifications', path: '/notifications' },
    { label: 'My profile', path: '/profile' },
  ],
  shop_owner: [
    { label: 'Dashboard', path: '/shop/dashboard' },
    { label: 'Incoming orders', path: '/shop/orders' },
    { label: 'Active queue', path: '/shop/queue' },
    { label: 'Shop profile', path: '/shop/profile' },
    { label: 'Analytics', path: '/shop/analytics' },
  ],
  admin: [
    { label: 'Overview', path: '/admin/dashboard' },
    { label: 'Users', path: '/admin/users' },
    { label: 'Shops', path: '/admin/shops' },
    { label: 'Orders', path: '/admin/orders' },
    { label: 'Reports', path: '/admin/reports' },
    { label: 'Analytics', path: '/admin/analytics' },
  ],
}

const roleTitles = {
  student: 'Student workspace',
  shop_owner: 'Shop workspace',
  admin: 'Administration',
}

function DashboardLayout({ role, children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const roleNavigation = navigation[role] || []
  const profilePath = role === 'shop_owner' ? '/shop/profile' : role === 'student' ? '/profile' : '/admin/dashboard'

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className={`dashboard-layout dashboard-layout-${role}`}>
      {isDrawerOpen && <button type="button" className="drawer-scrim" onClick={() => setIsDrawerOpen(false)} aria-label="Close navigation" />}
      <aside className={`dashboard-sidebar ${isDrawerOpen ? 'drawer-open' : ''}`}>
        <div className="sidebar-brand-row">
          <Link to="/" className="brand" onClick={() => setIsDrawerOpen(false)}>
            <span className="brand-mark">X</span><span>XeroQ</span>
          </Link>
          <button type="button" className="icon-button sidebar-close" onClick={() => setIsDrawerOpen(false)} aria-label="Close menu"><X size={19} /></button>
        </div>
        <span className="sidebar-section-label">{roleTitles[role]}</span>
        <nav className="sidebar-navigation" aria-label={`${roleTitles[role]} navigation`}>
          {roleNavigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setIsDrawerOpen(false)}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-account">
          <div className="profile-avatar">{(user?.name || 'X').trim().charAt(0).toUpperCase()}</div>
          <div className="sidebar-account-copy"><strong>{user?.name || 'XeroQ user'}</strong><span>{user?.email || roleTitles[role]}</span></div>
          <button type="button" className="icon-button sidebar-logout" onClick={handleLogout} aria-label="Log out" title="Log out"><LogOut size={17} /></button>
        </div>
      </aside>
      <div className="dashboard-workspace">
        <header className="dashboard-topbar">
          <button type="button" className="icon-button dashboard-menu-button" onClick={() => setIsDrawerOpen(true)} aria-label="Open navigation"><Menu size={21} /></button>
          <div className="dashboard-topbar-title"><span>{roleTitles[role]}</span><strong>Welcome, {(user?.name || 'there').split(' ')[0]}</strong></div>
          <div className="dashboard-topbar-actions">
            {role === 'student' && <NotificationBell />}
            {role === 'shop_owner' && <span className="owner-status-indicator">Shop workspace</span>}
            <div className="topbar-profile-wrap">
              <button type="button" className="topbar-profile" aria-label="Open profile menu" aria-expanded={isProfileMenuOpen} onClick={() => setIsProfileMenuOpen((open) => !open)}><span className="profile-avatar">{(user?.name || 'X').trim().charAt(0).toUpperCase()}</span><ChevronDown size={15} /></button>
              {isProfileMenuOpen && <div className="profile-menu"><div className="profile-menu-user"><strong>{user?.name || 'XeroQ user'}</strong><span>{user?.email}</span></div><Link to={profilePath} onClick={() => setIsProfileMenuOpen(false)}><UserRound size={16} /> {role === 'shop_owner' ? 'Shop profile' : role === 'student' ? 'My profile' : 'Admin overview'}</Link><button type="button" onClick={handleLogout}><LogOut size={16} /> Log out</button></div>}
            </div>
          </div>
        </header>
        <main className="dashboard-main">{children}</main>
      </div>
    </div>
  )
}

export default DashboardLayout
