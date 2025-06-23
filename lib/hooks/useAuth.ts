'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: 'STUDENT' | 'MENTOR' | 'INSTRUCTOR' | 'ADMIN';
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (provider?: string, credentials?: { email: string; password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<boolean>;
  clearError: () => void;
  refreshSession: () => Promise<void>;
}

export function useAuth(): AuthState & AuthActions {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Derived state
  const user: AuthUser | null = session?.user ? {
    id: session.user.id || '',
    name: session.user.name || '',
    email: session.user.email || '',
    image: session.user.image || undefined,
    role: (session.user as any).role || 'STUDENT',
  } : null;

  const isAuthenticated = !!session && !!user;
  const isSessionLoading = status === 'loading';

  // Login function
  const login = useCallback(async (
    provider: string = 'credentials',
    credentials?: { email: string; password: string }
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      let result;

      if (provider === 'credentials' && credentials) {
        result = await signIn('credentials', {
          email: credentials.email,
          password: credentials.password,
          redirect: false,
        });
      } else {
        result = await signIn(provider, {
          redirect: false,
          callbackUrl: '/',
        });
      }

      if (result?.error) {
        setError(result.error === 'CredentialsSignin' 
          ? 'Invalid email or password' 
          : 'Authentication failed'
        );
        return false;
      }

      if (result?.ok) {
        // Refresh the session to get updated user data
        await update();
        return true;
      }

      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [update]);

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await signOut({ 
        redirect: false,
        callbackUrl: '/' 
      });
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Register function
  const register = useCallback(async (data: {
    name: string;
    email: string;
    password: string;
  }): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Registration failed');
        return false;
      }

      // Auto-login after successful registration
      const loginSuccess = await login('credentials', {
        email: data.email,
        password: data.password,
      });

      return loginSuccess;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh session function
  const refreshSession = useCallback(async (): Promise<void> => {
    await update();
  }, [update]);

  return {
    // State
    user,
    isLoading: isLoading || isSessionLoading,
    isAuthenticated,
    error,
    
    // Actions
    login,
    logout,
    register,
    clearError,
    refreshSession,
  };
}

// Permission checking hook
export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;

    const permissions = {
      STUDENT: [
        'read:lessons',
        'write:progress',
        'read:profile',
        'write:submissions',
        'read:achievements',
        'write:feedback',
      ],
      MENTOR: [
        'read:lessons',
        'write:progress',
        'read:profile',
        'write:submissions',
        'read:achievements',
        'write:feedback',
        'read:students',
        'write:mentorship',
        'read:collaboration',
      ],
      INSTRUCTOR: [
        'read:lessons',
        'write:lessons',
        'read:students',
        'write:feedback',
        'write:courses',
        'read:analytics',
        'write:mentorship',
        'read:collaboration',
        'write:collaboration',
        'read:submissions',
        'write:grades',
      ],
      ADMIN: ['*'], // All permissions
    };

    const userPermissions = permissions[user.role] || [];
    return userPermissions.includes('*') || userPermissions.includes(permission);
  }, [user]);

  const hasRole = useCallback((role: string | string[]): boolean => {
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  }, [user]);

  const hasMinimumRole = useCallback((minimumRole: string): boolean => {
    if (!user) return false;

    const roleHierarchy = {
      STUDENT: 0,
      MENTOR: 1,
      INSTRUCTOR: 2,
      ADMIN: 3,
    };

    const userRoleLevel = roleHierarchy[user.role] ?? 0;
    const minimumRoleLevel = roleHierarchy[minimumRole as keyof typeof roleHierarchy] ?? 0;

    return userRoleLevel >= minimumRoleLevel;
  }, [user]);

  return {
    hasPermission,
    hasRole,
    hasMinimumRole,
  };
}

// Authentication status hook
export function useAuthStatus() {
  const { status } = useSession();
  
  return {
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isUnauthenticated: status === 'unauthenticated',
  };
}
