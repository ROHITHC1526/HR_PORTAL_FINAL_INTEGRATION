import type { ReactNode } from 'react'
import { Icon } from '@/people-plus/Icon'

/** One headline number on the suite dashboard. `value` may be text such as "Coming soon". */
export function MetricTile({
  label,
  value,
  note,
  icon,
  color,
}: {
  label: string
  value: ReactNode
  note: string
  icon: string
  color: string
}) {
  return (
    <div className="pp-dash-metric">
      <span className="pp-dash-metric-icon" style={{ color, background: `${color}16` }}>
        <Icon name={icon} />
      </span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <span>{note}</span>
      </div>
    </div>
  )
}

/** A panel for an area whose backend is not built yet. Shows no invented numbers. */
export function ComingSoonPanel({ title, icon }: { title: string; icon: string }) {
  return (
    <section className="pp-card pp-dash-panel pp-coming-card">
      <div className="pp-dash-section-title">
        <span>
          <Icon name={icon} size={16} />
          {title}
        </span>
        <small>Coming soon</small>
      </div>
      <div className="pp-coming-state">
        <span>
          <Icon name="clock" size={20} />
        </span>
        <strong>Coming soon</strong>
        <p>This area will appear when its live data service is available.</p>
      </div>
    </section>
  )
}
