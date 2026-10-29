import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatusPill } from './status-pill'

describe('StatusPill', () => {
  it('colours the account states consistently', () => {
    const { rerender } = render(<StatusPill status="active" />)
    expect(screen.getByText('Active')).toHaveClass('pill', 'ok')

    rerender(<StatusPill status="locked" />)
    expect(screen.getByText('Locked')).toHaveClass('bad')

    rerender(<StatusPill status="disabled" />)
    expect(screen.getByText('Disabled')).toHaveClass('warn')
  })

  it('lets a caller choose the tone and wording', () => {
    render(<StatusPill status="auth.login_failed" tone="bad" label="Failed sign-in" />)
    expect(screen.getByText('Failed sign-in')).toHaveClass('bad')
  })
})
