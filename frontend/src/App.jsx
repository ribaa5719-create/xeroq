import {
  ArrowRight,
  Clock3,
  FileText,
  Menu,
  MapPin,
  Printer,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  TimerReset,
  Upload,
  X,
} from 'lucide-react'
import { lazy, Suspense, useState } from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import NotificationBell from './components/NotificationBell'
import DashboardLayout from './components/DashboardLayout'
import { useAuth } from './context/useAuth'
const LoginPage = lazy(() => import('./pages/LoginPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const PlaceholderPage = lazy(() => import('./pages/PlaceholderPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const ShopDashboardPage = lazy(() => import('./pages/ShopDashboardPage'))
const ShopDetailsPage = lazy(() => import('./pages/ShopDetailsPage'))
const ShopsPage = lazy(() => import('./pages/ShopsPage'))
const OrderSummaryPage = lazy(() => import('./pages/OrderSummaryPage'))
const UploadPrintPage = lazy(() => import('./pages/UploadPrintPage'))
const LiveQueuePage = lazy(() => import('./pages/LiveQueuePage'))
const ShopQueuePage = lazy(() => import('./pages/ShopQueuePage'))
const ShopOrdersPage = lazy(() => import('./pages/ShopOrdersPage'))
const ShopAnalyticsPage = lazy(() => import('./pages/ShopAnalyticsPage'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'))
const OrdersPage = lazy(() => import('./pages/OrdersPage'))
const OrderDetailsPage = lazy(() => import('./pages/OrderDetailsPage'))
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'))
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'))
const AdminShopsPage = lazy(() => import('./pages/AdminShopsPage'))
const StudentProfilePage = lazy(() => import('./pages/StudentProfilePage'))
const AdminIntegrationPage = lazy(() => import('./pages/AdminIntegrationPage'))
import './App.css'
import './redesign.css'

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Find Shops', path: '/shops' },
  { label: 'Login', path: '/login' },
  { label: 'Register', path: '/register' },
]

const flowSteps = [
  {
    icon: Upload,
    title: 'Upload Print File',
    description: 'Drop in your assignment, notes, or print-ready files.',
  },
  {
    icon: Search,
    title: 'Compare Shops',
    description: 'Check nearby stores, pricing, quality, and queue lengths.',
  },
  {
    icon: Printer,
    title: 'Place Order',
    description: 'Pick paper, finish, and delivery options in seconds.',
  },
  {
    icon: Clock3,
    title: 'Track Queue',
    description: 'Follow your job live and know exactly when it is ready.',
  },
  {
    icon: QrCode,
    title: 'Collect',
    description: 'Use your QR token to pick up prints without waiting in line.',
  },
]

const featureCards = [
  {
    icon: MapPin,
    title: 'Nearby Xerox Shops',
    description: 'Discover trusted printing shops close to campus, home, or office.',
  },
  {
    icon: Search,
    title: 'Compare Prices',
    description: 'View transparent rates for black-and-white, color, and binding.',
  },
  {
    icon: Clock3,
    title: 'Live Queue Tracking',
    description: 'See which shop is fastest and estimate when your job will be ready.',
  },
  {
    icon: Printer,
    title: 'Fast Printing',
    description: 'Get reliable document printing without the usual back-and-forth hassle.',
  },
  {
    icon: TimerReset,
    title: 'Urgent Print Mode',
    description: 'Need it fast? Prioritize express jobs for same-day or urgent deadlines.',
  },
  {
    icon: QrCode,
    title: 'QR/Token Collection',
    description: 'Collect your order with a quick scan and minimal waiting at pickup.',
  },
]

const trustStats = [
  { value: '300+', label: 'Xerox shops' },
  { value: '4.8/5', label: 'student rating' },
  { value: '15 min', label: 'average queue' },
]

function HomePage() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const accountHome = user?.role === 'shop_owner' ? '/shop/dashboard' : user?.role === 'admin' ? '/admin/dashboard' : '/orders'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container navbar">
          <Link to="/" className="brand" aria-label="XeroQ home">
            <div className="brand-mark">X</div>
            <span>XeroQ</span>
          </Link>

          <button type="button" className="mobile-nav-toggle" aria-label={isMobileMenuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen((open) => !open)}>
            {isMobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>

          <nav className={`main-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`} aria-label="Main navigation">
            {(isAuthenticated
              ? [{ label: 'Home', path: '/' }, { label: 'Find Shops', path: '/shops' }, { label: user?.role === 'shop_owner' ? 'Shop Dashboard' : user?.role === 'admin' ? 'Admin Dashboard' : 'My Orders', path: accountHome }]
              : navItems).map((item) => (
              <Link key={item.label} to={item.path} className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className={`nav-actions ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            {isAuthenticated ? (
              <>
                {user?.role === 'student' && <NotificationBell />}
                {user?.role === 'shop_owner' && <Link to="/shop/orders" className="ghost-button">Orders</Link>}
                <span className="user-badge">{user?.name || 'User'}</span>
                <button type="button" className="ghost-button" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="ghost-button">
                  Login
                </Link>
                <Link to="/register" className="primary-button small-button">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">
                <Sparkles size={16} />
                Print smarter, faster, easier
              </div>

              <h1>Print Smarter with XeroQ</h1>

              <p className="hero-text">
                Find nearby Xerox shops, compare prices and queues, upload print files, and track
                your order from submission to collection—all in one simple student-friendly
                experience.
              </p>

              <div className="hero-actions">
                <Link to="/shops" className="primary-button">
                  <Search size={18} /> Find Xerox Shops
                  <ArrowRight size={18} />
                </Link>
                <Link to={isAuthenticated ? '/shops' : '/register'} className="secondary-button">
                  <FileText size={18} /> Get Started
                </Link>
              </div>

              <div className="trust-row" aria-label="Key benefits">
                {trustStats.map((stat) => (
                  <div key={stat.label} className="trust-item">
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="hero-visual" aria-label="How XeroQ works preview">
              <div className="visual-card main-panel">
                <div className="panel-header">
                  <span className="dot green" />
                  <span className="dot amber" />
                  <span className="dot blue" />
                </div>

                <div className="print-preview">
                  <div className="file-pill">
                    <FileText size={16} />
                    <span>assignment-final.pdf</span>
                  </div>

                  <div className="shop-list">
                    <div className="shop-row active-row">
                      <div>
                        <strong>PrintHub Campus</strong>
                        <small>₹35 / page</small>
                      </div>
                      <span className="queue-tag">Queue: 4</span>
                    </div>
                    <div className="shop-row">
                      <div>
                        <strong>BluePrint Studio</strong>
                        <small>₹42 / page</small>
                      </div>
                      <span className="queue-tag muted">Queue: 8</span>
                    </div>
                  </div>

                  <div className="mini-progress">
                    <div className="progress-topline">
                      <span>Order status</span>
                      <span>Ready in 12 min</span>
                    </div>
                    <div className="progress-bar">
                      <span className="progress-fill" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="floating-card booking-card">
                <ShieldCheck size={18} />
                <div>
                  <strong>Verified shop</strong>
                  <small>Rated 4.9 by students</small>
                </div>
              </div>

              <div className="floating-card queue-card">
                <Clock3 size={18} />
                <div>
                  <strong>Live queue</strong>
                  <small>Updated 2 mins ago</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flow-section">
          <div className="container">
            <div className="section-heading">
              <span className="section-tag">How it works</span>
              <h2>Simple printing in five easy steps</h2>
            </div>

            <div className="flow-grid" aria-label="XeroQ process steps">
              {flowSteps.map((step, index) => {
                const Icon = step.icon

                return (
                  <div key={step.title} className="flow-step">
                    <div className="step-number">0{index + 1}</div>
                    <div className="step-icon">
                      <Icon size={22} />
                    </div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="features-section">
          <div className="container">
            <div className="section-heading center-heading">
              <span className="section-tag">Why students choose XeroQ</span>
              <h2>Everything you need to print without the stress</h2>
            </div>

            <div className="feature-grid">
              {featureCards.map((feature) => {
                const Icon = feature.icon

                return (
                  <article key={feature.title} className="feature-card">
                    <div className="feature-icon">
                      <Icon size={22} />
                    </div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="benefits-section">
          <div className="container benefits-grid">
            <article className="benefit-panel student-benefit">
              <span className="section-tag">For students</span>
              <h2>More time for what matters.</h2>
              <p>Compare nearby print shops, choose clear print options, and follow order progress without waiting at the counter.</p>
              <Link to="/shops" className="text-link">Explore nearby shops <ArrowRight size={16} /></Link>
            </article>
            <article className="benefit-panel owner-benefit">
              <span className="section-tag">For shop owners</span>
              <h2>A calmer way to manage print work.</h2>
              <p>Receive digital orders, move accepted work through a queue, and keep customers informed as jobs progress.</p>
              <Link to="/register" className="text-link">Create a shop account <ArrowRight size={16} /></Link>
            </article>
          </div>
        </section>

        <section className="technology-section">
          <div className="container technology-card">
            <div><span className="section-tag">Built for reliable print workflows</span><h2>Useful tools, connected in one place.</h2></div>
            <div className="technology-points">
              <span><ShieldCheck size={18} /> Role-based workspaces</span>
              <span><MapPin size={18} /> Location-aware discovery</span>
              <span><QrCode size={18} /> Token-based collection</span>
              <span><Clock3 size={18} /> Order status updates</span>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="container cta-box">
            <div>
              <span className="section-tag">Ready to print?</span>
              <h2>Find the best Xerox shop near you in minutes.</h2>
            </div>

            <Link to="/shops" className="primary-button">
              Start Printing
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <Link to="/" className="brand footer-brand" aria-label="XeroQ home">
            <div className="brand-mark">X</div>
            <span>XeroQ</span>
          </Link>

          <div className="footer-links">
            <Link to="/">Home</Link>
            <Link to="/shops">Find Shops</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>

          <p className="footer-copy">© 2026 XeroQ. Student-first printing made simple.</p>
        </div>
      </footer>
    </div>
  )
}

function App() {
  const dashboardRoute = (role, element) => (
    <ProtectedRoute allowedRoles={[role]}>
      <DashboardLayout role={role}>{element}</DashboardLayout>
    </ProtectedRoute>
  )

  return (
    <Suspense fallback={<div className="app-shell route-loading" role="status">Loading your XeroQ workspace…</div>}>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/shops" element={<ShopsPage />} />
      <Route path="/shops/:id" element={<ShopDetailsPage />} />

      <Route
        path="/upload-print"
        element={dashboardRoute('student', <UploadPrintPage />)}
      />
      <Route
        path="/order-summary"
        element={dashboardRoute('student', <OrderSummaryPage />)}
      />
      <Route
        path="/live-queue"
        element={dashboardRoute('student', <LiveQueuePage />)}
      />
      <Route
        path="/notifications"
        element={dashboardRoute('student', <NotificationsPage />)}
      />
      <Route
        path="/orders"
        element={dashboardRoute('student', <OrdersPage />)}
      />
      <Route path="/orders/:id" element={dashboardRoute('student', <OrderDetailsPage />)} />
      <Route
        path="/profile"
        element={dashboardRoute('student', <StudentProfilePage />)}
      />

      <Route
        path="/shop/dashboard"
        element={dashboardRoute('shop_owner', <ShopDashboardPage />)}
      />
      <Route
        path="/shop/orders"
        element={dashboardRoute('shop_owner', <ShopOrdersPage />)}
      />
      <Route
        path="/shop/queue"
        element={dashboardRoute('shop_owner', <ShopQueuePage />)}
      />
      <Route
        path="/shop/profile"
        element={dashboardRoute('shop_owner', <ShopDashboardPage />)}
      />
      <Route
        path="/shop/analytics"
        element={dashboardRoute('shop_owner', <ShopAnalyticsPage />)}
      />

      <Route
        path="/admin/dashboard"
        element={dashboardRoute('admin', <AdminDashboardPage />)}
      />
      <Route
        path="/admin/users"
        element={dashboardRoute('admin', <AdminUsersPage />)}
      />
      <Route
        path="/admin/shops"
        element={dashboardRoute('admin', <AdminShopsPage />)}
      />
      <Route
        path="/admin/orders"
        element={dashboardRoute('admin', <AdminIntegrationPage page="orders" />)}
      />
      <Route
        path="/admin/reports"
        element={dashboardRoute('admin', <AdminIntegrationPage page="reports" />)}
      />
      <Route
        path="/admin/analytics"
        element={dashboardRoute('admin', <AdminIntegrationPage page="analytics" />)}
      />
      <Route path="*" element={<PlaceholderPage badge="404" title="Page Not Found" description="The page you are looking for does not exist yet in the XeroQ frontend structure." />} />
    </Routes>
    </Suspense>
  )
}

export default App
