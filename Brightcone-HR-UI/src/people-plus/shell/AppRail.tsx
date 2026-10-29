import React from 'react'
import { usePeoplePlus } from '../people-plus-context'
import { APPS, type AppKey } from '../data'
import { Icon } from '../Icon'

export const AppRail: React.FC<{ mobileOpen?: boolean; onNavigate?: () => void }> = ({
  mobileOpen = false,
  onNavigate,
}) => {
  const { activeApp, setActiveApp, setActiveView, state } = usePeoplePlus()

  const pendingLeaves = state.leaves.filter((l) => l.status === 'Pending').length
  const pendingExpenses = state.expenses.filter((e) => e.status === 'Pending').length
  const totalApprovals = pendingLeaves + pendingExpenses

  const getBadge = (key: AppKey) => {
    if (key === 'plus' && totalApprovals > 0) return totalApprovals
    if (key === 'expense' && pendingExpenses > 0) return pendingExpenses
    if (key === 'people' && pendingLeaves > 0) return pendingLeaves
    return 0
  }

  const handleAppSelect = (key: AppKey) => {
    setActiveApp(key)
    if (key === 'shift') {
      setActiveView('shiftRoster')
    } else {
      setActiveView(key === 'plus' ? 'suiteDash' : `${key}Dash`)
    }
    onNavigate?.()
  }

  return (
    <aside className={`rail ${mobileOpen ? 'on' : ''}`} aria-label="Brightcone Suite Apps">
      <button
        type="button"
        className="rlogo"
        aria-label="Brightcone Home"
        title="Brightcone Home"
        onClick={() => handleAppSelect('plus')}
      >
        <img src="/brightcone-mark.png" alt="Brightcone" />
      </button>

      <div className="rapps">
        {APPS.map((app) => {
          const isSelected = activeApp === app.key
          const badge = getBadge(app.key)
          return (
            <button
              type="button"
              key={app.key}
              className={`rapp ${isSelected ? 'on' : ''}`}
              style={{ '--ac': app.color } as React.CSSProperties}
              aria-label={app.name}
              title={app.name}
              onClick={() => handleAppSelect(app.key)}
            >
              <i>
                <Icon name={app.icon} size={19} />
              </i>
              <span>{app.name}</span>
              {badge > 0 && <span className="bdg">{badge}</span>}
            </button>
          )
        })}
      </div>
    </aside>
  )
}
