import { Component } from 'react';

/**
 * React 错误边界组件
 * 捕获子组件的渲染错误，防止整个应用白屏
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 以便下次渲染显示错误 UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // 记录错误信息
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#1a1a2e',
          color: '#fff',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
          padding: '40px',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '20px',
          }}>
            😵
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 600,
            marginBottom: '16px',
            color: '#fff',
          }}>
            Something went wrong
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#a1a1a6',
            marginBottom: '24px',
            maxWidth: '400px',
          }}>
            The application encountered an unexpected error. Please try reloading the page.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              padding: '12px 32px',
              fontSize: '16px',
              fontWeight: 500,
              backgroundColor: '#0d84ff',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0a6ecc'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#0d84ff'}
          >
            Reload
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{
              marginTop: '32px',
              padding: '16px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '8px',
              textAlign: 'left',
              maxWidth: '600px',
              width: '100%',
            }}>
              <summary style={{ cursor: 'pointer', color: '#a1a1a6' }}>
                Error Details
              </summary>
              <pre style={{
                marginTop: '12px',
                fontSize: '12px',
                color: '#ff6b6b',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
