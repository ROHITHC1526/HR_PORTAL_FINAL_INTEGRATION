import React, { useState } from 'react'
import { useAdminUsers, useDisableUser, useResetPassword, useSetRole, useUnlockUser } from './api'
import { AccessErrorBoundary } from './ErrorBoundary'
import { useAuth } from '@/auth/useAuth'
import { Icon } from '@/people-plus/Icon'
import { avatarColor, initials } from '@/people-plus/helpers'

function AccessContent({ settings }: { settings: boolean }) {
  const { can } = useAuth()
  const allowed = can('users:manage')
  const users = useAdminUsers(allowed)
  const disable = useDisableUser()
  const unlock = useUnlockUser()
  const setRole = useSetRole()
  const reset = useResetPassword()
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')

  if (!allowed) return <section className="card" role="alert">Your account does not have permission to manage user access.</section>
  if (users.isLoading) {
    return <div className="loader">Loading users…</div>
  }

  if (users.error) {
    return (
      <section className="glass" style={{ maxWidth: 720, margin: '48px auto', padding: 32 }}>
        <h2>Could not load user accounts</h2>
        <p className="muted">The admin API is not reachable.</p>
      </section>
    )
  }

  const list = (Array.isArray(users.data?.results) ? users.data.results : []).filter((u) =>
    !search || u.name.toLowerCase().includes(search.toLowerCase())
    || u.email.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="view">
      <div className="head">
        <div>
          <div className="eyebrow">{settings ? 'Administration' : 'Access Control'}</div>
          <h1>{settings ? 'Settings & Access' : 'User Accounts & Permissions'}</h1>
          <p>Manage portal accounts, roles, password recovery, and access status.</p>
        </div>
      </div>

      <div className="card mt">
        <div className="toolbar">
          <div className="search">
            <Icon name="search" size={16} />
            <input
              className="input"
              type="search"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((u) => (
                <tr key={u.pid}>
                  <td>
                    <div className="who">
                      <div className="av" style={{ background: avatarColor(u.name) }}>
                        {initials(u.name)}
                      </div>
                      <div>
                        <b>{u.name}</b>
                        <span>{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <select aria-label={`Role for ${u.name}`} value={u.role} onChange={(event) => setRole.mutate({ pid: u.pid, role: event.target.value })}>
                      {['employee', 'manager', 'finance', 'hr_admin', 'recruiter', 'payroll_admin'].map((role) => <option key={role} value={role}>{role.replace('_', ' ')}</option>)}
                    </select>
                  </td>
                  <td>
                    <span className={`pill ${u.status === 'active' ? 'p-ok' : 'p-bad'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="muted">{u.last_login_at?.slice(0, 10) ?? 'Never'}</td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button className="btn sm" onClick={() => reset.mutate(u.pid, { onSuccess: (result) => setNotice(`Temporary password for ${u.email}: ${result.temporary_password}`) })}>Reset password</button>
                    {u.status === 'active' && (
                      <button
                        className="btn sm ib"
                        title="Disable account"
                        onClick={() => disable.mutate(u.pid)}
                      >
                        <Icon name="lock" size={15} />
                      </button>
                    )}
                    {u.status !== 'active' && (
                      <button
                        className="btn sm ib"
                        title="Unlock account"
                        onClick={() => unlock.mutate(u.pid)}
                      >
                        <Icon name="unlock" size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
              <td colSpan={5} className="muted" style={{ textAlign: 'center' }}>
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {notice && <p className="card mt" role="status">{notice} — shown once; copy it to the user through an approved secure channel.</p>}
      {(disable.error || unlock.error || setRole.error || reset.error) && <p className="card mt" role="alert">The account change failed. Refresh the list and check your permissions.</p>}
    </div>
  )
}

export const AccessPage: React.FC<{ settings?: boolean }> = ({ settings = false }) => (
  <AccessErrorBoundary>
    <AccessContent settings={settings} />
  </AccessErrorBoundary>
)
