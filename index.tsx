import React from 'react';
import ReactDOM from 'react-dom/client';
import MainApp from './App'; // Import MainApp directly

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Set the body class for the app theme
document.body.className = 'app-body bg-brand-bg-dark text-brand-text-primary';

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <MainApp />
  </React.StrictMode>
);