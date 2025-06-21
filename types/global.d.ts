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
  }
}

// Prisma UserRole enum
declare module '@prisma/client' {
  export enum UserRole {
    STUDENT = 'STUDENT',
    MENTOR = 'MENTOR',
    INSTRUCTOR = 'INSTRUCTOR',
    ADMIN = 'ADMIN'
  }
}
