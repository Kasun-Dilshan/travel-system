import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily: 'system-ui, sans-serif',
          color: '#14532d',
          background: '#f0fdf4',
          textAlign: 'center',
          gap: '0.75rem',
        }}>
          <strong>Something went wrong loading the site.</strong>
          <p style={{ color: '#666', maxWidth: '480px' }}>{String(this.state.error?.message || this.state.error)}</p>
          <button type="button" onClick={() => window.location.reload()} style={{
            marginTop: '0.5rem',
            padding: '0.6rem 1.2rem',
            borderRadius: '999px',
            border: 'none',
            background: '#14532d',
            color: '#fff',
            cursor: 'pointer',
          }}>
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)

