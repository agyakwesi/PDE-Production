import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    // You could also log the error to an error reporting service here
    console.group('Vault Error Caught');
    console.error(error);
    console.error(errorInfo);
    console.groupEnd();
  }

  handleRestart = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-surface)',
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--color-on-surface)'
        }}>
          <div style={{
            maxWidth: '500px',
            border: '1px solid var(--color-outline-variant)',
            padding: '4rem 3rem',
            background: 'var(--color-surface-container-low)',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '-15px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--color-error)',
              color: 'white',
              padding: '0.25rem 1rem',
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              fontWeight: 600
            }}>
              System Alert
            </div>

            <h1 style={{ 
              fontFamily: 'var(--font-display)', 
              fontSize: '2.5rem', 
              marginBottom: '1.5rem',
              lineHeight: 1.1 
            }}>
              Reference <br />
              <span style={{ color: 'var(--color-error)' }}>Access Failure</span>
            </h1>

            <p style={{ 
              color: 'var(--color-on-surface-variant)', 
              fontSize: '0.875rem', 
              lineHeight: 1.6,
              marginBottom: '3rem'
            }}>
              The curator has encountered an unexpected architectural instability. This sector of the Vault has been temporarily sealed to protect the collection's integrity.
            </p>

            <div style={{ 
              padding: '1rem', 
              background: 'black', 
              borderRadius: '4px', 
              textAlign: 'left', 
              marginBottom: '3rem',
              borderLeft: '4px solid var(--color-error)',
              overflow: 'hidden'
            }}>
              <p style={{ 
                fontFamily: 'monospace', 
                fontSize: '0.75rem', 
                color: '#ff5555',
                margin: 0,
                wordBreak: 'break-all' 
              }}>
                [CRITICAL_EXCEPTION]: {this.state.error && this.state.error.toString()}
              </p>
            </div>

            <button 
              onClick={this.handleRestart}
              style={{
                background: 'var(--color-primary)',
                color: 'var(--color-background)',
                border: 'none',
                padding: '1rem 2.5rem',
                fontFamily: 'var(--font-body)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.opacity = 0.8}
              onMouseLeave={(e) => e.target.style.opacity = 1}
            >
              Restart Portal
            </button>
          </div>
          
          <p style={{ 
            marginTop: '2rem', 
            fontSize: '0.65rem', 
            textTransform: 'uppercase', 
            letterSpacing: '0.1em', 
            color: 'var(--color-on-surface-variant)' 
          }}>
            Parfum d'Élite • Security Protocol v2.4
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
