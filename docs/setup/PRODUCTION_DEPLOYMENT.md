# Production Deployment Guide

This guide covers deploying the Solidity Learning Platform to production with performance, security, and scalability considerations.

## 🎯 Deployment Overview

The platform is optimized for deployment on modern cloud platforms with the following architecture:

- **Frontend**: Next.js application with SSR/SSG
- **Database**: PostgreSQL with connection pooling
- **Caching**: Redis for session storage and API caching
- **File Storage**: Cloudinary or AWS S3
- **Monitoring**: Sentry, Analytics, Performance monitoring
- **CDN**: Vercel Edge Network or CloudFlare

## 🚀 Recommended Platforms

### Vercel (Recommended)

**Pros**: 
- Optimized for Next.js
- Built-in CDN and edge functions
- Automatic deployments
- Excellent performance

**Cons**: 
- Function execution limits
- Higher costs for large scale

### Railway

**Pros**: 
- Full-stack deployment
- Built-in PostgreSQL and Redis
- Docker support
- Cost-effective

**Cons**: 
- Smaller CDN network
- Less mature platform

### AWS/Google Cloud/Azure

**Pros**: 
- Full control and scalability
- Enterprise features
- Global infrastructure

**Cons**: 
- Complex setup
- Higher operational overhead

## 🔧 Vercel Deployment

### 1. Prerequisites

- Vercel account
- GitHub repository
- External database (Supabase, PlanetScale, or Neon)
- Redis instance (Upstash recommended)

### 2. Database Setup

#### Option A: Supabase (Recommended)

```bash
# 1. Create Supabase project at https://supabase.com/
# 2. Get connection string from Settings > Database
# 3. Format: postgresql://postgres:[password]@[host]:5432/postgres
```

#### Option B: PlanetScale

```bash
# 1. Create PlanetScale database at https://planetscale.com/
# 2. Create production branch
# 3. Get connection string
# 4. Format: mysql://[username]:[password]@[host]/[database]?sslaccept=strict
```

#### Option C: Neon

```bash
# 1. Create Neon project at https://neon.tech/
# 2. Get connection string
# 3. Format: postgresql://[user]:[password]@[host]/[dbname]?sslmode=require
```

### 3. Redis Setup (Upstash)

```bash
# 1. Create Upstash Redis at https://upstash.com/
# 2. Get Redis URL
# 3. Format: redis://:[password]@[host]:[port]
```

### 4. Environment Variables

Create production environment variables in Vercel dashboard:

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
DIRECT_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# Authentication
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-production-secret-64-chars-long"

# OAuth (production URLs)
GOOGLE_CLIENT_ID="your-production-google-client-id"
GOOGLE_CLIENT_SECRET="your-production-google-client-secret"
GITHUB_CLIENT_ID="your-production-github-client-id"
GITHUB_CLIENT_SECRET="your-production-github-client-secret"

# AI Integration
GOOGLE_GENERATIVE_AI_API_KEY="your-production-gemini-key"

# Caching
REDIS_URL="redis://:[password]@host:port"

# File Storage
CLOUDINARY_CLOUD_NAME="your-production-cloud"
CLOUDINARY_API_KEY="your-production-api-key"
CLOUDINARY_API_SECRET="your-production-api-secret"

# Monitoring
SENTRY_DSN="https://your-production-dsn@sentry.io/project"
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-PRODUCTION-ID"

# Performance
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
NEXT_PUBLIC_PERFORMANCE_SAMPLE_RATE=0.1

# Feature Flags
FEATURE_AI_TUTORING=true
FEATURE_COLLABORATION=true
FEATURE_GAMIFICATION=true
NEXT_PUBLIC_PWA_ENABLED=true
```

### 5. Deployment Steps

```bash
# 1. Connect GitHub repository to Vercel
# 2. Configure build settings:
#    - Framework Preset: Next.js
#    - Build Command: npm run build
#    - Output Directory: .next
#    - Install Command: npm install

# 3. Add environment variables
# 4. Deploy
```

### 6. Post-Deployment Setup

```bash
# Run database migrations
npx prisma db push --accept-data-loss

# Verify deployment
curl https://your-domain.vercel.app/api/health
```

## 🐳 Docker Deployment

### 1. Dockerfile

```dockerfile
# Production Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### 2. Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: solidity_learning
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app

volumes:
  postgres_data:
  redis_data:
```

## ⚡ Performance Optimization

### 1. Next.js Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### 2. CDN Configuration

```javascript
// Configure CDN for static assets
const CDN_URL = process.env.CDN_URL || '';

module.exports = {
  assetPrefix: CDN_URL,
  
  // Optimize images
  images: {
    loader: 'custom',
    loaderFile: './lib/imageLoader.js',
  },
};
```

### 3. Database Optimization

```javascript
// prisma/schema.prisma - Production optimizations
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["jsonProtocol"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// Connection pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query'] : [],
});
```

## 🔒 Security Configuration

### 1. Environment Security

```bash
# Use strong secrets (64+ characters)
NEXTAUTH_SECRET=$(openssl rand -base64 64)

# Secure database connections
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# API rate limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=900000  # 15 minutes
```

### 2. Security Headers

```javascript
// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // CSP header
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  );
  
  return response;
}
```

### 3. API Security

```javascript
// lib/rateLimit.js
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '15 m'),
  analytics: true,
});
```

## 📊 Monitoring Setup

### 1. Health Checks

```javascript
// pages/api/health.js
export default async function handler(req, res) {
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;
    
    // Check Redis
    await redis.ping();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
}
```

### 2. Performance Monitoring

```javascript
// lib/monitoring.js
import { captureException } from '@sentry/nextjs';

export const trackPerformance = (metric) => {
  // Send to analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'web_vitals', {
      name: metric.name,
      value: metric.value,
      event_category: 'performance',
    });
  }
  
  // Send to Sentry
  if (metric.value > thresholds[metric.name]) {
    captureException(new Error(`Performance threshold exceeded: ${metric.name}`));
  }
};
```

## 🚨 Troubleshooting

### Common Production Issues

#### 1. Build Failures

```bash
# Check build logs
vercel logs [deployment-url]

# Common fixes
npm run type-check  # Fix TypeScript errors
npm run lint:fix    # Fix linting issues
npm run build       # Test build locally
```

#### 2. Database Connection Issues

```bash
# Test connection
npx prisma db pull

# Check SSL requirements
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

#### 3. Performance Issues

```bash
# Analyze bundle
npm run build:analyze

# Check Core Web Vitals
npm run lighthouse

# Monitor in production
# Check Vercel Analytics or Sentry Performance
```

## 📈 Scaling Considerations

### 1. Database Scaling

- Use read replicas for read-heavy workloads
- Implement connection pooling (PgBouncer)
- Consider database sharding for large datasets

### 2. Caching Strategy

- Implement Redis clustering
- Use CDN for static assets
- Add application-level caching

### 3. Load Balancing

- Use multiple Vercel regions
- Implement API rate limiting
- Consider microservices architecture

## ✅ Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates configured
- [ ] Domain DNS configured
- [ ] Monitoring setup (Sentry, Analytics)
- [ ] Performance testing completed
- [ ] Security headers configured
- [ ] Backup strategy implemented
- [ ] Health checks working
- [ ] Error tracking functional

---

**Your production deployment is ready! 🚀**
