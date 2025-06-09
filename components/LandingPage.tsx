
import React, { useState } from 'react';

interface LandingPageProps {
  onLogin: (formData: { email?: string; password?: string }) => void;
  onSignup: (formData: { email?: string; password?: string; confirmPassword?: string }) => void;
  onDirectAccess: () => void; // New prop
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onSignup, onDirectAccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({ email: loginEmail, password: loginPassword });
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword !== signupConfirmPassword) {
      alert("Passwords don't match!"); 
      return;
    }
    onSignup({ email: signupEmail, password: signupPassword });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-brand-text-primary font-sans">
      <header className="text-center mb-10 md:mb-12">
        <h1 className="text-5xl md:text-6xl font-extrabold text-brand-accent mb-4 landing-title-animate">
          Solidity & Blockchain DevPath
        </h1>
        <p className="text-lg md:text-xl text-brand-text-secondary max-w-2xl mx-auto landing-title-animate" style={{ animationDelay: '0.2s' }}>
          Master smart contract development with our interactive learning platform, powered by Gemini AI. Track your progress and prepare for the future of Web3.
        </p>
      </header>

      <main className="w-full max-w-md p-8 md:p-10 glass-card">
        <div className="mb-6 flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('login')}
            className={`landing-tab-button flex-1 py-3 text-center font-medium ${activeTab === 'login' ? 'text-brand-accent active-tab' : 'text-brand-text-muted hover:text-brand-text-primary'}`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`landing-tab-button flex-1 py-3 text-center font-medium ${activeTab === 'signup' ? 'text-brand-accent active-tab' : 'text-brand-text-muted hover:text-brand-text-primary'}`}
          >
            Sign Up
          </button>
        </div>

        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div className="relative">
              <input 
                type="email" 
                id="login-email" 
                value={loginEmail} 
                onChange={(e) => setLoginEmail(e.target.value)} 
                className="landing-input peer w-full px-4 py-3 rounded-lg" 
                placeholder=" " 
                autoComplete="email" 
              />
              <label 
                htmlFor="login-email" 
                className="landing-label absolute text-sm left-4 top-3.5 origin-top-left"
              >
                Email Address (mock)
              </label>
            </div>
            <div className="relative">
              <input 
                type="password" 
                id="login-password" 
                value={loginPassword} 
                onChange={(e) => setLoginPassword(e.target.value)} 
                className="landing-input peer w-full px-4 py-3 rounded-lg" 
                placeholder=" " 
                autoComplete="current-password" 
              />
              <label 
                htmlFor="login-password" 
                className="landing-label absolute text-sm left-4 top-3.5 origin-top-left"
              >
                Password (mock)
              </label>
            </div>
            <button type="submit" className="landing-button w-full">
              Login
            </button>
          </form>
        )}

        {activeTab === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-6">
            <div className="relative">
              <input 
                type="email" 
                id="signup-email" 
                value={signupEmail} 
                onChange={(e) => setSignupEmail(e.target.value)} 
                className="landing-input peer w-full px-4 py-3 rounded-lg" 
                placeholder=" " 
                autoComplete="email" 
              />
              <label 
                htmlFor="signup-email" 
                className="landing-label absolute text-sm left-4 top-3.5 origin-top-left"
              >
                Email Address (mock)
              </label>
            </div>
            <div className="relative">
              <input 
                type="password" 
                id="signup-password" 
                value={signupPassword} 
                onChange={(e) => setSignupPassword(e.target.value)} 
                className="landing-input peer w-full px-4 py-3 rounded-lg" 
                placeholder=" " 
                autoComplete="new-password"
              />
              <label 
                htmlFor="signup-password" 
                className="landing-label absolute text-sm left-4 top-3.5 origin-top-left"
              >
                Password (mock)
              </label>
            </div>
            <div className="relative">
              <input 
                type="password" 
                id="signup-confirm-password" 
                value={signupConfirmPassword} 
                onChange={(e) => setSignupConfirmPassword(e.target.value)} 
                className="landing-input peer w-full px-4 py-3 rounded-lg" 
                placeholder=" " 
                autoComplete="new-password"
              />
               <label 
                htmlFor="signup-confirm-password" 
                className="landing-label absolute text-sm left-4 top-3.5 origin-top-left"
              >
                Confirm Password (mock)
              </label>
            </div>
            <button type="submit" className="landing-button w-full">
              Create Account
            </button>
          </form>
        )}
        
        <div className="mt-8 text-center">
           <button 
            onClick={onDirectAccess}
            className="landing-button w-full bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500 hover:from-emerald-600 hover:via-green-600 hover:to-emerald-600"
            style={{
                 backgroundImage: 'linear-gradient(to right, var(--brand-colors-aurora-3, #10B981) 0%, #22C55E 50%, var(--brand-colors-aurora-3, #10B981) 100%)'
            }}
            >
            Access Course Directly
          </button>
        </div>

         <p className="text-xs text-brand-text-muted/70 mt-6 text-center">
          Login and Sign Up are simulated. No data is persistently stored beyond your browser's local storage for progress.
        </p>
      </main>
      
      <footer className="mt-10 md:mt-12 text-center">
        <p className="text-sm text-brand-text-muted/80 landing-title-animate" style={{ animationDelay: '0.4s' }}>
          &copy; {new Date().getFullYear()} Solidity DevPath. Learn, Build, Innovate.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
