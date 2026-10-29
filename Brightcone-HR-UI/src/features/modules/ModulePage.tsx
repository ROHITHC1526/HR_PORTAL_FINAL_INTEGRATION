import { useParams } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { ModuleHeader } from '@/components/ModuleHeader'
import { SectionCard } from '@/components/SectionCard'
import { findModule, titleFromSlug } from './modules'

/**
 * "Coming soon" page for a module whose backend is not built yet. It never shows invented data:
 * only what the project plan says about when the module arrives.
 */
export function ModulePage({ path, slug }: { path?: string; slug?: string }) {
  const { user } = useAuth()
  const stub = path ? findModule(path) : undefined
  const isEmployee = user?.role !== 'hr_admin'

  const title = stub
    ? (isEmployee && stub.employeeTitle) || stub.title
    : titleFromSlug(slug ?? 'This module')
  const subtitle = stub
    ? (isEmployee && stub.employeeSubtitle) || stub.subtitle
    : 'This module will be available when its live backend service is connected'

  return (
    <div className="pp-page-stack">
      <ModuleHeader title={title} subtitle={subtitle} />
      <SectionCard title="Coming soon" subtitle="Live data is not available for this module">
        <div className="pp-integration-panel">
          <div>
            <strong>{title} is not connected to a backend data service yet.</strong>
            <p>
              {subtitle}. This page will become available when its live API and persistence are
              implemented
              {stub ? ` (${stub.phase}, ticket ${stub.ticket}).` : '.'}
            </p>
          </div>
          <span className="pp-pill">Coming soon</span>
        </div>
      </SectionCard>
    </div>
  )
}

/** Route element for `/coming-soon/:module`: any module named only by its URL slug. */
export function ComingSoonRoute() {
  const { module = 'This module' } = useParams()
  return <ModulePage slug={module} />
}
