import { Component } from 'react'
import type { ReactNode } from 'react'
import { logger } from '@/utils/logger'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logger.error('React Error Boundary caught an error', {
      context: 'ErrorBoundary',
      data: {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      },
    })
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              maxWidth: '600px',
              padding: '2rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h1
              style={{
                fontSize: '2rem',
                marginBottom: '1rem',
                color: 'var(--color-error)',
              }}
            >
              Oops! Something went wrong
            </h1>
            <p
              style={{
                fontSize: '1rem',
                marginBottom: '1.5rem',
                color: 'var(--text-secondary)',
              }}
            >
              We encountered an unexpected error. Please try again or contact support if the
              problem persists.
            </p>
            {this.state.error && (
              <details
                style={{
                  marginBottom: '1.5rem',
                  textAlign: 'left',
                  backgroundColor: 'var(--bg-tertiary)',
                  padding: '1rem',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                }}
              >
                <summary style={{ cursor: 'pointer', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Error Details
                </summary>
                <pre
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleReset}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                color: '#fff',
                backgroundColor: 'var(--color-primary)',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary)'
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
