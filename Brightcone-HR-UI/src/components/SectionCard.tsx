import type { ReactNode } from 'react'

/** A titled panel used on module pages: heading, optional subtitle and action, then content. */
export function SectionCard({
  title,
  subtitle,
  action,
  children,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="pp-card pp-card-pad">
      <div className="pp-card-head">
        <div>
          <h2 className="pp-card-title">{title}</h2>
          {subtitle && <p className="pp-card-subtitle">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
