
import React, { useState, useEffect, useCallback } from 'react';
import MainApp from './App';
import LandingPage from './components/LandingPage';
import ConfirmationModal from './components/ConfirmationModal';

type CurrentView = 'landing' | 'mainApp';

const AppWrapper: React.FC = () => {
  const [currentView, setCurrentView] = useState<CurrentView>('landing');
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  useEffect(() => {
    if (currentView === 'landing') {
      document.body.className = 'landing-page-body';
    } else {
      document.body.className = 'app-body bg-brand-bg-dark text-brand-text-primary';
    }
    // Cleanup function to remove class when component unmounts or view changes
    return () => {
      document.body.className = ''; // Clear classes or set to a default if needed
    };
  }, [currentView]);

  const handleLogin = useCallback((formData: any) => {
    console.log('Login attempt (mock):', formData);
    // In a real app, you'd authenticate here
    setCurrentView('mainApp');
  }, []);

  const handleSignup = useCallback((formData: any) => {
    console.log('Signup attempt (mock):', formData);
    // In a real app, you'd register the user here
    setCurrentView('mainApp');
  }, []);

  const handleDirectAccess = useCallback(() => {
    setCurrentView('mainApp');
  }, []);

  const handleLogout = useCallback(() => {
    setShowLogoutConfirmation(true);
  }, []);

  const confirmLogout = useCallback(() => {
    setCurrentView('landing');
    setShowLogoutConfirmation(false);
    // Clear any app-specific state if necessary (e.g., selected module)
    // For this app, progress is in localStorage, so it persists unless reset.
  }, []);

  const cancelLogout = useCallback(() => {
    setShowLogoutConfirmation(false);
  }, []);


  if (currentView === 'landing') {
    return (
      <LandingPage 
        onLogin={handleLogin} 
        onSignup={handleSignup} 
        onDirectAccess={handleDirectAccess} 
      />
    );
  }

  return (
    <>
      <MainApp onLogout={handleLogout} />
      <ConfirmationModal
        isOpen={showLogoutConfirmation}
        onClose={cancelLogout}
        onConfirm={confirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout? Your learning progress will be saved."
        confirmText="Logout"
        cancelText="Cancel"
      />
    </>
  );
};

export default AppWrapper;
