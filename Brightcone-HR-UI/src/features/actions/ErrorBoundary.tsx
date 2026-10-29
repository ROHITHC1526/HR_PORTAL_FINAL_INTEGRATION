import React from 'react'

interface Props { children: React.ReactNode }
interface State { error: Error | null }

export class ActionsErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <section className="glass" style={{ maxWidth: 720, margin: '48px auto', padding: 32 }}>
          <h2>Actions unavailable</h2>
          <p className="muted">Something went wrong. Please try refreshing.</p>
          <pre style={{ fontSize: 12, opacity: 0.6 }}>{this.state.error.message}</pre>
          <button
            className="btn primary"
            style={{ marginTop: 16 }}
            onClick={() => this.setState({ error: null })}
          >
            Retry
          </button>
        </section>
      )
    }
    return this.props.children
  }
}
