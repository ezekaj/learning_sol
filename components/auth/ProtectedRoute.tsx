'use client';

import React, { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Shield, Lock, User, Crown } from 'lucide-react';
import { GlassCard } from '@/components/ui/Glassmorphism';
import { AuthModal } from './AuthModal';
import { useState } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRole?: 'STUDENT' | 'MENTOR' | 'INSTRUCTOR' | 'ADMIN';
  fallback?: ReactNode;
  showLoginPrompt?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requiredRole,
  fallback,
  showLoginPrompt = true,
}) => {
  const { data: session, status } = useSession();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Not authenticated
  if (requireAuth && !session) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showLoginPrompt) {
      return (
        <>
          <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md w-full"
            >
              <GlassCard className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-blue-400" />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">
                  Authentication Required
                </h2>
                
                <p className="text-gray-400 mb-6">
                  You need to sign in to access this page. Join thousands of developers learning Solidity!
                </p>
                
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Sign In / Sign Up
                </button>
                
                <div className="mt-4 text-sm text-gray-500">
                  <p>✨ Free forever • 🚀 Start learning immediately</p>
                </div>
              </GlassCard>
            </motion.div>
          </div>
          
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
          />
        </>
      );
    }

    return null;
  }

  // Check role permissions
  if (requiredRole && session?.user) {
    const userRole = (session.user as any).role;
    
    // Role hierarchy: ADMIN > INSTRUCTOR > MENTOR > STUDENT
    const roleHierarchy = {
      STUDENT: 0,
      MENTOR: 1,
      INSTRUCTOR: 2,
      ADMIN: 3,
    };

    const userRoleLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] ?? 0;
    const requiredRoleLevel = roleHierarchy[requiredRole];

    if (userRoleLevel < requiredRoleLevel) {
      if (fallback) {
        return <>{fallback}</>;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full"
          >
            <GlassCard className="p-8 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-red-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">
                Access Denied
              </h2>
              
              <p className="text-gray-400 mb-4">
                You don't have permission to access this page.
              </p>
              
              <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Your Role:</span>
                  <RoleBadge role={userRole} />
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-400">Required:</span>
                  <RoleBadge role={requiredRole} />
                </div>
              </div>
              
              <button
                onClick={() => window.history.back()}
                className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
              >
                Go Back
              </button>
            </GlassCard>
          </motion.div>
        </div>
      );
    }
  }

  // Authenticated and authorized
  return <>{children}</>;
};

// Role Badge Component
interface RoleBadgeProps {
  role: string;
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const roleConfig = {
    STUDENT: { color: 'bg-blue-500/20 text-blue-300', icon: User },
    MENTOR: { color: 'bg-cyan-500/20 text-cyan-300', icon: User },
    INSTRUCTOR: { color: 'bg-green-500/20 text-green-300', icon: Shield },
    ADMIN: { color: 'bg-purple-500/20 text-purple-300', icon: Crown },
  };

  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.STUDENT;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${config.color}`}>
      <Icon className="w-3 h-3" />
      <span className="capitalize">{role.toLowerCase()}</span>
    </span>
  );
};

// Higher-order component for protecting pages
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Hook for checking authentication status
export function useAuthGuard(requiredRole?: string) {
  const { data: session, status } = useSession();
  
  const isAuthenticated = !!session;
  const isLoading = status === 'loading';
  const userRole = (session?.user as any)?.role;
  
  const hasRequiredRole = !requiredRole || userRole === requiredRole || 
    (requiredRole === 'STUDENT' && ['MENTOR', 'INSTRUCTOR', 'ADMIN'].includes(userRole)) ||
    (requiredRole === 'MENTOR' && ['INSTRUCTOR', 'ADMIN'].includes(userRole)) ||
    (requiredRole === 'INSTRUCTOR' && userRole === 'ADMIN');

  return {
    isAuthenticated,
    isLoading,
    hasRequiredRole,
    userRole,
    session,
  };
}
