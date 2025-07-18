// Global type declarations

interface Window {
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (event: string, handler: (...args: any[]) => void) => void;
    removeListener: (event: string, handler: (...args: any[]) => void) => void;
    isMetaMask?: boolean;
    chainId?: string;
    selectedAddress?: string;
  };

  /**
   * Sentry error monitoring service
   */
  Sentry?: {
    captureException: (error: Error) => void;
    withScope: (callback: (scope: SentryScope) => void) => void;
    addBreadcrumb: (breadcrumb: SentryBreadcrumb) => void;
    setUser: (user: SentryUser) => void;
    setTag: (key: string, value: string) => void;
    setContext: (key: string, context: Record<string, unknown>) => void;
  };

  /**
   * Google Analytics 4 (gtag)
   */
  gtag?: (
    command: 'config' | 'event' | 'set',
    targetId: string | 'page_title' | 'page_location' | 'send_page_view',
    config?: Record<string, unknown>
  ) => void;

  /**
   * LogRocket session recording
   */
  LogRocket?: {
    identify: (uid: string, traits?: Record<string, unknown>) => void;
    track: (event: string, properties?: Record<string, unknown>) => void;
    captureException: (error: Error) => void;
  };

  /**
   * PostHog analytics
   */
  posthog?: {
    capture: (event: string, properties?: Record<string, unknown>) => void;
    identify: (uid: string, properties?: Record<string, unknown>) => void;
    reset: () => void;
  };

  /**
   * Mixpanel analytics
   */
  mixpanel?: {
    track: (event: string, properties?: Record<string, unknown>) => void;
    identify: (uid: string) => void;
    people: {
      set: (properties: Record<string, unknown>) => void;
    };
  };

  /**
   * Hotjar heatmaps and session recordings
   */
  hj?: (command: string, ...args: unknown[]) => void;

  /**
   * Intercom customer messaging
   */
  Intercom?: (command: string, data?: Record<string, unknown>) => void;
}

/**
 * Sentry scope interface
 */
interface SentryScope {
  setTag: (key: string, value: string | number) => void;
  setContext: (key: string, context: Record<string, unknown>) => void;
  setUser: (user: SentryUser) => void;
  setLevel: (level: 'fatal' | 'error' | 'warning' | 'info' | 'debug') => void;
}

/**
 * Sentry breadcrumb interface
 */
interface SentryBreadcrumb {
  message?: string;
  category?: string;
  level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
  data?: Record<string, unknown>;
  timestamp?: number;
}

/**
 * Sentry user interface
 */
interface SentryUser {
  id?: string;
  email?: string;
  username?: string;
  ip_address?: string;
  [key: string]: unknown;
}

// Google Generative AI types
declare module '@google/genai' {
  export class GoogleGenerativeAI {
    constructor(apiKey: string);
    getGenerativeModel(config: { model: string }): any;
  }
}

// Environment variables for Next.js
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'test' | 'production';
    NEXTAUTH_SECRET: string;
    NEXTAUTH_URL: string;
    DATABASE_URL: string;
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    GEMINI_API_KEY: string;
    REDIS_URL: string;
    SOCKET_SERVER_URL: string;
    // Monitoring and Analytics
    NEXT_PUBLIC_APP_VERSION?: string;
    NEXT_PUBLIC_SENTRY_DSN?: string;
    NEXT_PUBLIC_GA_MEASUREMENT_ID?: string;
    NEXT_PUBLIC_POSTHOG_KEY?: string;
    NEXT_PUBLIC_MIXPANEL_TOKEN?: string;
    NEXT_PUBLIC_HOTJAR_ID?: string;
    NEXT_PUBLIC_INTERCOM_APP_ID?: string;
    NEXT_PUBLIC_LOGROCKET_ID?: string;
    BUILD_TIMESTAMP?: string;
    VERCEL_ENV?: 'development' | 'preview' | 'production';
    VERCEL_URL?: string;
    VERCEL_GIT_COMMIT_SHA?: string;
  }
}

// Prisma UserRole enum and PrismaClient
declare module '@prisma/client' {
  export enum UserRole {
    STUDENT = 'STUDENT',
    MENTOR = 'MENTOR',
    INSTRUCTOR = 'INSTRUCTOR',
    ADMIN = 'ADMIN'
  }

  export class PrismaClient {
    constructor(options?: any);
    user: any;
    userProfile: any;
    userProgress: any;
    userAchievement: any;
    codeSubmission: any;
    collaboration: any;
    mentorship: any;
    chatMessage: any;
    course: any;
    module: any;
    lesson: any;
    achievement: any;
    deployment: any;
    aiInteraction: any;
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
  }
}
