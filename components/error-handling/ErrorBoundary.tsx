'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, Mail, Shield, BookOpen, Settings } from 'lucide-react';
import { GlassContainer } from '@/components/ui/Glassmorphism';
import { errorTracker } from '@/lib/monitoring/error-tracking';
import { useSettings } from '@/lib/hooks/useSettings';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  level?: 'page' | 'section' | 'component';
  userRole?: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  maxRetries?: number;
  retryDelay?: number;
  contextualHelp?: {
    title: string;
    description: string;
    actions?: Array<{
      label: string;
      href: string;
      icon?: React.ComponentType<{ className?: string }>;
    }>;
  };
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
  isRetrying: boolean;
  lastRetryTime: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
      isRetrying: false,
      lastRetryTime: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.setState({
      error,
      errorInfo,
      errorId
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Track error with monitoring system
    errorTracker.captureError(error, {
      component: 'ErrorBoundary',
      action: 'component_error',
      metadata: {
        errorId,
        level: this.props.level || 'component',
        userRole: this.props.userRole,
        componentStack: errorInfo.componentStack,
        retryCount: this.state.retryCount,
        errorBoundaryProps: {
          showDetails: this.props.showDetails,
          level: this.props.level
        }
      }
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Send error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  private handleRetry = async () => {
    const { maxRetries = 3, retryDelay = 1000 } = this.props;
    const { retryCount } = this.state;

    if (retryCount >= maxRetries) {
      return;
    }

    this.setState({
      isRetrying: true,
      retryCount: retryCount + 1,
      lastRetryTime: Date.now()
    });

    // Exponential backoff
    const delay = retryDelay * Math.pow(2, retryCount);

    try {
      await new Promise(resolve => setTimeout(resolve, delay));

      // Reset error state to retry rendering
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isRetrying: false
      });
    } catch (retryError) {
      console.error('Retry failed:', retryError);
      this.setState({ isRetrying: false });
    }
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
      isRetrying: false,
      lastRetryTime: 0
    });
  };

  private getRoleSpecificMessage = () => {
    const { userRole } = this.props;
    const { error } = this.state;

    switch (userRole) {
      case 'ADMIN':
        return {
          title: 'System Error Detected',
          description: 'An error occurred in the application. As an administrator, you can view detailed error information and take corrective action.',
          actions: [
            { label: 'View Error Logs', href: '/admin/logs', icon: Bug },
            { label: 'System Status', href: '/admin/status', icon: Shield },
            { label: 'Contact Support', href: '/admin/support', icon: Mail }
          ]
        };
      case 'INSTRUCTOR':
        return {
          title: 'Course Content Error',
          description: 'There was an issue loading the course content. This might be a temporary problem with the lesson materials or editor.',
          actions: [
            { label: 'Course Dashboard', href: '/instructor/dashboard', icon: BookOpen },
            { label: 'Report Issue', href: '/instructor/support', icon: Bug },
            { label: 'Settings', href: '/instructor/settings', icon: Settings }
          ]
        };
      case 'STUDENT':
      default:
        return {
          title: 'Something went wrong',
          description: 'We encountered an unexpected error while loading this content. Don\'t worry - your progress has been saved.',
          actions: [
            { label: 'Continue Learning', href: '/dashboard', icon: BookOpen },
            { label: 'Get Help', href: '/support', icon: Mail },
            { label: 'Home', href: '/', icon: Home }
          ]
        };
    }
  };

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Replace with your error monitoring service (e.g., Sentry, LogRocket, etc.)
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
      level: this.props.level || 'component'
    };

    // Example: Send to your error tracking service
    // errorTrackingService.captureException(error, { extra: errorData });
    
    console.error('Error logged:', errorData);
  };



  private handleReportError = () => {
    const { error, errorInfo, errorId } = this.state;
    const errorDetails = {
      errorId,
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace',
      componentStack: errorInfo?.componentStack || 'No component stack',
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    const subject = encodeURIComponent(`Error Report: ${errorId}`);
    const body = encodeURIComponent(`Error Details:\n\n${JSON.stringify(errorDetails, null, 2)}`);
    
    window.open(`mailto:support@soliditylearning.com?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Different UI based on error level
      const { level = 'component', maxRetries = 3 } = this.props;
      const { retryCount, isRetrying } = this.state;
      const roleMessage = this.getRoleSpecificMessage();
      const contextualHelp = this.props.contextualHelp || roleMessage;

      if (level === 'page') {
        return <PageErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorId={this.state.errorId}
          onRetry={this.handleRetry}
          onReset={this.handleReset}
          onReport={this.handleReportError}
          showDetails={this.props.showDetails}
          retryCount={retryCount}
          maxRetries={maxRetries}
          isRetrying={isRetrying}
          contextualHelp={contextualHelp}
          userRole={this.props.userRole}
        />;
      }

      if (level === 'section') {
        return <SectionErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorId={this.state.errorId}
          onRetry={this.handleRetry}
          onReset={this.handleReset}
          onReport={this.handleReportError}
          showDetails={this.props.showDetails}
          retryCount={retryCount}
          maxRetries={maxRetries}
          isRetrying={isRetrying}
          contextualHelp={contextualHelp}
          userRole={this.props.userRole}
        />;
      }

      // Component level error
      return <ComponentErrorFallback
        error={this.state.error}
        errorInfo={this.state.errorInfo}
        errorId={this.state.errorId}
        onRetry={this.handleRetry}
        onReset={this.handleReset}
        onReport={this.handleReportError}
        showDetails={this.props.showDetails}
        retryCount={retryCount}
        maxRetries={maxRetries}
        isRetrying={isRetrying}
        contextualHelp={contextualHelp}
        userRole={this.props.userRole}
      />;
    }

    return this.props.children;
  }
}

// Page-level error fallback
function PageErrorFallback({
  error,
  errorInfo,
  errorId,
  onRetry,
  onReset,
  onReport,
  showDetails = false,
  retryCount = 0,
  maxRetries = 3,
  isRetrying = false,
  contextualHelp,
  userRole
}: {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  onRetry: () => void;
  onReset: () => void;
  onReport: () => void;
  showDetails?: boolean;
  retryCount?: number;
  maxRetries?: number;
  isRetrying?: boolean;
  contextualHelp?: {
    title: string;
    description: string;
    actions?: Array<{
      label: string;
      href: string;
      icon?: React.ComponentType<{ className?: string }>;
    }>;
  };
  userRole?: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <GlassContainer intensity="medium" className="max-w-2xl w-full p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {contextualHelp?.title || "Something went wrong"}
          </h1>
          <p className="text-gray-300">
            {contextualHelp?.description || "We encountered an unexpected error. Our team has been notified and is working on a fix."}
          </p>

          {retryCount > 0 && (
            <div className="mt-3 text-sm text-yellow-400">
              Retry attempt {retryCount} of {maxRetries}
            </div>
          )}
        </div>

        {showDetails && error && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-gray-400 hover:text-white mb-2">
              Error Details (ID: {errorId})
            </summary>
            <div className="bg-gray-900/50 rounded-lg p-4 text-sm font-mono text-gray-300 overflow-auto max-h-40">
              <div className="mb-2">
                <strong>Message:</strong> {error.message}
              </div>
              {error.stack && (
                <div>
                  <strong>Stack:</strong>
                  <pre className="whitespace-pre-wrap text-xs mt-1">{error.stack}</pre>
                </div>
              )}
            </div>
          </details>
        )}

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {retryCount < maxRetries && (
              <button
                onClick={onRetry}
                disabled={isRetrying}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                <span>{isRetrying ? 'Retrying...' : 'Try Again'}</span>
              </button>
            )}

            {retryCount >= maxRetries && (
              <button
                onClick={onReset}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            )}

            <button
              onClick={onReport}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>Report Issue</span>
            </button>
          </div>

          {contextualHelp?.actions && (
            <div className="pt-4 border-t border-white/10">
              <div className="text-sm text-gray-400 mb-3">Helpful actions:</div>
              <div className="flex flex-wrap gap-2 justify-center">
                {contextualHelp.actions.map((action, index) => {
                  const Icon = action.icon || Home;
                  return (
                    <a
                      key={index}
                      href={action.href}
                      className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{action.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </GlassContainer>
    </div>
  );
}

// Section-level error fallback
function SectionErrorFallback({
  error,
  onRetry,
  onReport
}: {
  error: Error | null;
  onRetry: () => void;
  onReport: () => void;
}) {
  return (
    <GlassContainer intensity="medium" className="p-6 text-center">
      <div className="mb-4">
        <div className="w-12 h-12 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-3">
          <AlertTriangle className="w-6 h-6 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Section Error</h3>
        <p className="text-gray-300 text-sm">
          This section couldn't load properly. You can try refreshing or continue using other parts of the page.
        </p>
      </div>

      <div className="flex gap-3 justify-center">
        <button
          onClick={onRetry}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </button>
        
        <button
          onClick={onReport}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
        >
          <Bug className="w-4 h-4" />
          <span>Report</span>
        </button>
      </div>
    </GlassContainer>
  );
}

// Component-level error fallback
function ComponentErrorFallback({
  error,
  onRetry
}: {
  error: Error | null;
  onRetry: () => void;
}) {
  return (
    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
      <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
      <p className="text-red-300 text-sm mb-3">Component failed to load</p>
      <button
        onClick={onRetry}
        className="text-red-400 hover:text-red-300 text-sm underline"
      >
        Try again
      </button>
    </div>
  );
}

// Convenience wrapper components
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary level="page" showDetails={process.env.NODE_ENV === 'development'}>
      {children}
    </ErrorBoundary>
  );
}

export function SectionErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary level="section">
      {children}
    </ErrorBoundary>
  );
}

export function ComponentErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary level="component">
      {children}
    </ErrorBoundary>
  );
}
