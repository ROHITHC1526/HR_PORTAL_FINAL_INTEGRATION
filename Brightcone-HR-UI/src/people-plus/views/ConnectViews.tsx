import React from 'react'
import { useEmployees } from '@/features/people/api'
import { useAuth } from '@/auth/useAuth'
import { Icon } from '../Icon'
import { avatarColor, initials } from '../helpers'

export const ConnectViews: React.FC = () => {
  const { can } = useAuth()
  const allowed = can('people:manage') || can('users:manage')
  const employees = useEmployees(allowed)

  const empList = employees.data ?? []

  return (
    <div className="view">
      <div className="head">
        <div>
          <div className="eyebrow">Connect & Community</div>
          <h1>Company Feed & Kudos</h1>
          <p>Peer appreciation, milestones, and company announcements.</p>
        </div>
      </div>

      <div className="grid g-dash mt">
        <div className="card">
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Icon name="chat" size={32} />
            <h3 style={{ marginTop: 12 }}>Social feed coming soon</h3>
            <p className="muted" style={{ marginTop: 8 }}>
              Posts, kudos, and announcements require a dedicated social API.
              The company directory is available via the People app.
            </p>
          </div>
        </div>

        <div className="card">
          <h3>People Directory</h3>
          <div className="list">
            {empList.slice(0, 8).map((emp) => {
              const name = `${emp.first_name} ${emp.last_name}`
              return (
                <div key={emp.id} className="row">
                  <div className="av" style={{ background: avatarColor(name) }}>
                    {initials(name)}
                  </div>
                  <div className="grow">
                    <b>{name}</b>
                    <div className="sub">{emp.work_email}</div>
                  </div>
                  <span className={`pill ${emp.status === 'active' ? 'p-ok' : 'p-warn'}`}>
                    {emp.status}
                  </span>
                </div>
              )
            })}
            {empList.length === 0 && (
              <div className="empty">No employees in the directory yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
