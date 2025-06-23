import { NextRequest, NextResponse } from 'next/server';
import { env, securityConfig, isProduction } from '@/lib/config/environment';

/**
 * Security Headers and CORS Configuration
 * Implements comprehensive security headers for production deployment
 */

interface SecurityHeadersConfig {
  contentSecurityPolicy?: string;
  strictTransportSecurity?: string;
  xFrameOptions?: string;
  xContentTypeOptions?: string;
  referrerPolicy?: string;
  permissionsPolicy?: string;
  crossOriginEmbedderPolicy?: string;
  crossOriginOpenerPolicy?: string;
  crossOriginResourcePolicy?: string;
}

interface CORSConfig {
  origin: string | string[] | boolean;
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  credentials: boolean;
  maxAge: number;
  preflightContinue: boolean;
  optionsSuccessStatus: number;
}

/**
 * Generate Content Security Policy
 */
function generateCSP(): string {
  const nonce = generateNonce();
  
  const cspDirectives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'", // Required for Next.js in development
      "'unsafe-eval'", // Required for Monaco Editor
      `'nonce-${nonce}'`,
      'https://cdn.jsdelivr.net', // For CDN resources
      'https://unpkg.com', // For package CDN
      'https://www.googletagmanager.com', // Google Analytics
      'https://www.google-analytics.com',
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for styled-components and CSS-in-JS
      'https://fonts.googleapis.com',
      'https://cdn.jsdelivr.net',
    ],
    'img-src': [
      "'self'",
      'data:', // For base64 images
      'blob:', // For generated images
      'https:', // Allow HTTPS images
      'https://avatars.githubusercontent.com', // GitHub avatars
      'https://lh3.googleusercontent.com', // Google avatars
      'https://cdn.discordapp.com', // Discord avatars
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com',
      'https://cdn.jsdelivr.net',
    ],
    'connect-src': [
      "'self'",
      'https://api.openai.com', // OpenAI API
      'https://generativelanguage.googleapis.com', // Google AI API
      'wss:', // WebSocket connections
      'https:', // HTTPS connections
      ...(isProduction ? [] : ['ws://localhost:*', 'http://localhost:*']), // Development
    ],
    'media-src': [
      "'self'",
      'blob:', // For media blobs
      'data:', // For data URLs
    ],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': isProduction ? [] : undefined,
    'block-all-mixed-content': isProduction ? [] : undefined,
  };

  // Add report URI if configured
  if (securityConfig.csp.reportUri) {
    (cspDirectives as any)['report-uri'] = [securityConfig.csp.reportUri];
  }

  // Convert to CSP string
  return Object.entries(cspDirectives)
    .filter(([_, value]) => value !== undefined)
    .map(([directive, sources]) => {
      if (Array.isArray(sources) && sources.length > 0) {
        return `${directive} ${sources.join(' ')}`;
      } else if (sources.length === 0) {
        return directive; // For directives without sources
      }
      return '';
    })
    .filter(Boolean)
    .join('; ');
}

/**
 * Generate cryptographic nonce for CSP
 */
function generateNonce(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64');
}

/**
 * Default security headers configuration
 */
const defaultSecurityHeaders: SecurityHeadersConfig = {
  // Content Security Policy
  contentSecurityPolicy: generateCSP(),

  // HTTP Strict Transport Security
  strictTransportSecurity: isProduction 
    ? `max-age=${securityConfig.hsts.maxAge}; includeSubDomains; preload`
    : undefined,

  // X-Frame-Options (prevent clickjacking)
  xFrameOptions: 'DENY',

  // X-Content-Type-Options (prevent MIME sniffing)
  xContentTypeOptions: 'nosniff',

  // Referrer Policy
  referrerPolicy: 'strict-origin-when-cross-origin',

  // Permissions Policy (formerly Feature Policy)
  permissionsPolicy: [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
    'ambient-light-sensor=()',
  ].join(', '),

  // Cross-Origin Embedder Policy
  crossOriginEmbedderPolicy: 'require-corp',

  // Cross-Origin Opener Policy
  crossOriginOpenerPolicy: 'same-origin',

  // Cross-Origin Resource Policy
  crossOriginResourcePolicy: 'same-origin',
};

/**
 * CORS configuration
 */
const corsConfig: CORSConfig = {
  origin: isProduction 
    ? [env.NEXT_PUBLIC_APP_URL, 'https://soliditylearn.com']
    : true, // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-File-Name',
    'X-User-ID',
    'X-Session-ID',
  ],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'X-Total-Count',
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(
  response: NextResponse,
  config: Partial<SecurityHeadersConfig> = {}
): NextResponse {
  const headers = { ...defaultSecurityHeaders, ...config };

  // Apply each header if defined
  Object.entries(headers).forEach(([key, value]) => {
    if (value) {
      const headerName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      response.headers.set(headerName, value);
    }
  });

  // Additional security headers
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

/**
 * Handle CORS for API routes
 */
export function handleCORS(
  request: NextRequest,
  config: Partial<CORSConfig> = {}
): NextResponse | null {
  const corsSettings = { ...corsConfig, ...config };
  const origin = request.headers.get('origin');
  const method = request.method;

  // Check if origin is allowed
  let allowedOrigin = '';
  if (corsSettings.origin === true) {
    allowedOrigin = origin || '*';
  } else if (typeof corsSettings.origin === 'string') {
    allowedOrigin = corsSettings.origin;
  } else if (Array.isArray(corsSettings.origin)) {
    if (origin && corsSettings.origin.includes(origin)) {
      allowedOrigin = origin;
    }
  }

  // Handle preflight requests
  if (method === 'OPTIONS') {
    const response = new NextResponse(null, { status: corsSettings.optionsSuccessStatus });
    
    if (allowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    }
    
    response.headers.set('Access-Control-Allow-Methods', corsSettings.methods.join(', '));
    response.headers.set('Access-Control-Allow-Headers', corsSettings.allowedHeaders.join(', '));
    response.headers.set('Access-Control-Max-Age', corsSettings.maxAge.toString());
    
    if (corsSettings.credentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    return applySecurityHeaders(response);
  }

  // For non-preflight requests, return null to continue processing
  return null;
}

/**
 * Apply CORS headers to response
 */
export function applyCORSHeaders(
  response: NextResponse,
  request: NextRequest,
  config: Partial<CORSConfig> = {}
): NextResponse {
  const corsSettings = { ...corsConfig, ...config };
  const origin = request.headers.get('origin');

  // Set allowed origin
  let allowedOrigin = '';
  if (corsSettings.origin === true) {
    allowedOrigin = origin || '*';
  } else if (typeof corsSettings.origin === 'string') {
    allowedOrigin = corsSettings.origin;
  } else if (Array.isArray(corsSettings.origin)) {
    if (origin && corsSettings.origin.includes(origin)) {
      allowedOrigin = origin;
    }
  }

  if (allowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  }

  if (corsSettings.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  if (corsSettings.exposedHeaders.length > 0) {
    response.headers.set('Access-Control-Expose-Headers', corsSettings.exposedHeaders.join(', '));
  }

  return response;
}

/**
 * Create security middleware for API routes
 */
export function createSecurityMiddleware(
  securityConfig: Partial<SecurityHeadersConfig> = {},
  corsConfig: Partial<CORSConfig> = {}
) {
  return (request: NextRequest): NextResponse | null => {
    // Handle CORS preflight
    const corsResponse = handleCORS(request, corsConfig);
    if (corsResponse) {
      return corsResponse;
    }

    // Continue to next middleware/handler
    return null;
  };
}

/**
 * Wrap API handler with security middleware
 */
export function withSecurity<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
  securityConfig: Partial<SecurityHeadersConfig> = {},
  corsConfigOverride: Partial<CORSConfig> = {}
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    // Handle CORS preflight
    const corsResponse = handleCORS(request, corsConfigOverride);
    if (corsResponse) {
      return corsResponse;
    }

    try {
      // Execute the handler
      const response = await handler(request, ...args);

      // Apply security headers
      const secureResponse = applySecurityHeaders(response, securityConfig);
      
      // Apply CORS headers
      return applyCORSHeaders(secureResponse, request, corsConfigOverride);
    } catch (error) {
      console.error('Security middleware error:', error);
      
      // Return secure error response
      const errorResponse = NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
      
      const secureErrorResponse = applySecurityHeaders(errorResponse, securityConfig);
      return applyCORSHeaders(secureErrorResponse, request, corsConfigOverride);
    }
  };
}

/**
 * Socket.io CORS configuration
 */
export const socketCORSConfig = {
  origin: isProduction 
    ? [env.NEXT_PUBLIC_APP_URL]
    : true,
  methods: ['GET', 'POST'],
  credentials: true,
  allowEIO3: true, // Allow Engine.IO v3 clients
};

/**
 * Validate request origin
 */
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  if (!origin && !referer) {
    return !isProduction; // Allow in development only
  }

  const allowedOrigins = isProduction 
    ? [env.NEXT_PUBLIC_APP_URL, 'https://soliditylearn.com']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

  const requestOrigin = origin || (referer ? new URL(referer).origin : '');
  
  return allowedOrigins.some(allowed => 
    requestOrigin === allowed || requestOrigin.endsWith(allowed)
  );
}

/**
 * Generate security report
 */
export function generateSecurityReport(): {
  headers: Record<string, string>;
  cors: CORSConfig;
  csp: string;
  environment: string;
} {
  return {
    headers: Object.fromEntries(
      Object.entries(defaultSecurityHeaders)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [
          key.replace(/([A-Z])/g, '-$1').toLowerCase(),
          value as string
        ])
    ),
    cors: corsConfig,
    csp: generateCSP(),
    environment: env.NODE_ENV,
  };
}
