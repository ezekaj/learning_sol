import React from 'react';
import ReactDOM from 'react-dom/client';

// Minimal test component to verify React is working
const TestApp: React.FC = () => {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#1A202C', 
      color: '#F7FAFC', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>🎉 React App is Working!</h1>
      <p>If you can see this, React is loading properly.</p>
      <p>API Key status: {process.env.API_KEY ? 'Available' : 'Missing'}</p>
      <p>Environment: {process.env.NODE_ENV || 'unknown'}</p>
      <button 
        onClick={() => alert('Button clicked!')}
        style={{
          padding: '10px 20px',
          backgroundColor: '#8B5CF6',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Test Button
      </button>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>
);
