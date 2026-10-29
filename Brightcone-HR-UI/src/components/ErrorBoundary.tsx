import { Component, type ErrorInfo, type ReactNode } from 'react'
import { reportError } from '@/lib/report-error'
import { Alert, Button } from './ui'

type Props = {
  children: ReactNode
  /** When this value changes (for example the URL path) the boundary clears its error. */
  resetKey?: string
  /** Short name used in the error report, for example "route /leave". */
  scope?: string
}

type State = { error: Error | null; resetKey?: string }

/**
 * Stops one broken page from blanking the whole app. Wrap each route and the app root.
 * (A class component: React only supports error boundaries as classes.)
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, resetKey: this.props.resetKey }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error }
  }

  // Clears a stored error when the reset key (usually the URL) changes, without a second render.
  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    if (props.resetKey === state.resetKey) return null
    return { error: null, resetKey: props.resetKey }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    reportError(error, {
      scope: this.props.scope ?? 'app',
      componentStack: info.componentStack ?? '',
    })
  }

  render(): ReactNode {
    if (!this.state.error) return this.props.children
    return (
      <div className="center-screen" style={{ padding: 24 }}>
        <div style={{ maxWidth: 460 }}>
          <h1>Something went wrong</h1>
          <Alert>
            This page hit an unexpected problem. Your work in other pages is not affected.
          </Alert>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="primary" onClick={() => this.setState({ error: null })}>
              Try again
            </Button>
            <Button onClick={() => window.location.assign('/')}>Go to home</Button>
          </div>
        </div>
      </div>
    )
  }
}
