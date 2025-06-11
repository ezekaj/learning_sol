import React from 'react';
import ReactDOM from 'react-dom/client';

// Minimal test component
const TestApp: React.FC = () => {
  console.log('TestApp rendered successfully!');
  
  return (
    <div style={{ 
      padding: '20px', 
      background: '#2d3748', 
      color: 'white', 
      borderRadius: '8px',
      margin: '20px'
    }}>
      <h1>✅ React App Loaded Successfully!</h1>
      <p>Timestamp: {new Date().toISOString()}</p>
      <p>Environment: {process.env.NODE_ENV || 'unknown'}</p>
      <p>API Key status: {process.env.API_KEY ? 'Present' : 'Missing'}</p>
    </div>
  );
};

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          background: '#e53e3e', 
          color: 'white', 
          borderRadius: '8px',
          margin: '20px'
        }}>
          <h1>❌ React Error</h1>
          <p>Something went wrong: {this.state.error?.message}</p>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

// Initialize React
console.log('Starting React initialization...');

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("Could not find root element to mount to");
  }

  console.log('Root element found, creating React root...');
  const root = ReactDOM.createRoot(rootElement);
  
  console.log('Rendering React app...');
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <TestApp />
      </ErrorBoundary>
    </React.StrictMode>
  );
  
  console.log('React app render called successfully');
} catch (error) {
  console.error('Failed to initialize React:', error);
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; background: #e53e3e; color: white; border-radius: 8px; margin: 20px;">
        <h1>❌ React Initialization Failed</h1>
        <p>Error: ${error instanceof Error ? error.message : String(error)}</p>
      </div>
    `;
  }
}
