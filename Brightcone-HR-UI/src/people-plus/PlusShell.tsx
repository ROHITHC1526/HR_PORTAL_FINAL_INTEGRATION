import React, { useState } from 'react'
import { usePeoplePlus } from './people-plus-context'
import { AppRail } from './shell/AppRail'
import { SuiteSidebar } from './shell/SuiteSidebar'
import { TopBar } from './shell/TopBar'
import { ViewRouter } from './views/ViewRouter'
import { SuiteModals } from './views/SuiteModals'
import { SuiteOverlays } from './views/SuiteOverlays'
import { APPS } from './data'

export const PlusShell: React.FC = () => {
  const { activeApp } = usePeoplePlus()
  const [mobileOpen, setMobileOpen] = useState(false)

  const currentApp = APPS.find((a) => a.key === activeApp) || APPS[0]

  return (
    <div className="app" data-app={activeApp} style={{ '--ac': currentApp.color } as React.CSSProperties}>
      {/* 78px Suite Rail */}
      <AppRail mobileOpen={mobileOpen} onNavigate={() => setMobileOpen(false)} />

      {/* 236px App Sidebar */}
      <SuiteSidebar mobileOpen={mobileOpen} close={() => setMobileOpen(false)} />

      {/* Mobile backdrop scrim */}
      {mobileOpen && (
        <div
          className="scrim on"
          style={{ zIndex: 44 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="main">
        <TopBar onMenu={() => setMobileOpen(true)} />
        <main className="content">
          <ViewRouter />
        </main>
      </div>

      {/* Modals, Drawers & Overlays */}
      <SuiteModals />
      <SuiteOverlays />
    </div>
  )
}
