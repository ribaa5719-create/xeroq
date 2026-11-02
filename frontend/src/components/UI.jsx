import { AlertCircle, CheckCircle2, Info, LoaderCircle, Search } from 'lucide-react'

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="page-header">
      <div>
        {eyebrow && <span className="page-eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </header>
  )
}

export function StatCard({ label, value, icon: Icon, detail }) {
  return (
    <article className="stat-card">
      <div className="stat-card-heading"><span>{label}</span>{Icon && <span className="stat-card-icon"><Icon size={19} /></span>}</div>
      <strong>{value ?? '—'}</strong>
      {detail && <small>{detail}</small>}
    </article>
  )
}

export function StatusBadge({ status, children }) {
  const value = status || 'unknown'
  return <span className={`status-badge status-${value}`}>{children || value.replaceAll('_', ' ')}</span>
}

export function SearchBar({ value, onChange, placeholder = 'Search', label = 'Search' }) {
  return (
    <label className="ui-search">
      <Search size={17} />
      <span className="sr-only">{label}</span>
      <input value={value} onChange={onChange} placeholder={placeholder} />
    </label>
  )
}

export function FilterBar({ children }) {
  return <div className="ui-filter-bar">{children}</div>
}

export function EmptyState({ icon: Icon = Info, title, description, action }) {
  return <section className="ui-state-card"><span className="ui-state-icon"><Icon size={23} /></span><h2>{title}</h2><p>{description}</p>{action}</section>
}

export function LoadingState({ label = 'Loading…' }) {
  return <div className="ui-loading" role="status"><LoaderCircle size={21} className="spin-icon" />{label}</div>
}

export function ErrorState({ children }) {
  return <div className="ui-error" role="alert"><AlertCircle size={18} />{children}</div>
}

export function SuccessState({ children }) {
  return <div className="ui-success" role="status"><CheckCircle2 size={18} />{children}</div>
}

export function FormField({ label, htmlFor, error, hint, children }) {
  return <div className={`field-group ui-form-field${error ? ' has-error' : ''}`}><label htmlFor={htmlFor}>{label}</label>{children}{hint && <small className="field-hint">{hint}</small>}{error && <span className="field-error">{error}</span>}</div>
}

export function PrimaryButton({ children, ...props }) {
  return <button className="primary-button" {...props}>{children}</button>
}

export function SecondaryButton({ children, ...props }) {
  return <button className="secondary-button" {...props}>{children}</button>
}

export function DataTable({ columns, rows, getRowKey = (row) => row.id }) {
  return (
    <div className="ui-data-table-wrap">
      <table className="ui-data-table">
        <thead><tr>{columns.map((column) => <th key={column.key} scope="col">{column.label}</th>)}</tr></thead>
        <tbody>{rows.map((row) => <tr key={getRowKey(row)}>{columns.map((column) => <td key={column.key} data-label={column.label}>{column.render ? column.render(row) : row[column.key]}</td>)}</tr>)}</tbody>
      </table>
    </div>
  )
}

export function ConfirmDialog({ title, description, confirmLabel = 'Confirm', onConfirm, onCancel, isWorking = false }) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onCancel}>
      <section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title" onClick={(event) => event.stopPropagation()}>
        <h2 id="confirm-dialog-title">{title}</h2><p>{description}</p>
        <div className="confirm-dialog-actions"><button type="button" className="secondary-button" onClick={onCancel} disabled={isWorking}>Cancel</button><button type="button" className="primary-button" onClick={onConfirm} disabled={isWorking}>{isWorking ? 'Please wait…' : confirmLabel}</button></div>
      </section>
    </div>
  )
}

export function NotificationItem({ title, message, date, isRead, onClick }) {
  return <button type="button" className={`notification-item ${isRead ? '' : 'unread'}`} onClick={onClick}><span className="notification-item-content"><strong>{title}</strong><span>{message}</span><small>{date}</small></span>{!isRead && <span className="unread-dot" aria-label="Unread" />}</button>
}
