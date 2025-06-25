# Environment Setup Guide

This comprehensive guide covers setting up the Solidity Learning Platform for local development and production deployment.

## 📋 Prerequisites

### System Requirements

- **Node.js**: 20.0.0 or higher (LTS recommended)
- **npm**: 9.0.0 or higher (comes with Node.js)
- **Git**: Latest version
- **PostgreSQL**: 14.0 or higher
- **Redis**: 6.0 or higher (optional for development, required for production)

### Development Tools (Recommended)

- **VS Code**: With recommended extensions
- **Docker**: For containerized services (optional)
- **Postman**: For API testing
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## 🚀 Local Development Setup

### 1. Repository Setup

```bash
# Clone the repository
git clone https://github.com/ezekaj/learning_sol.git
cd learning_sol

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

### 2. Database Setup

#### Option A: Local PostgreSQL Installation

**macOS (using Homebrew):**
```bash
# Install PostgreSQL
brew install postgresql@14
brew services start postgresql@14

# Create database and user
createdb solidity_learning_dev
createuser -s solidity_user
```

**Ubuntu/Debian:**
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres createdb solidity_learning_dev
sudo -u postgres createuser -s solidity_user
sudo -u postgres psql -c "ALTER USER solidity_user PASSWORD 'your_password';"
```

**Windows:**
1. Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Install with default settings
3. Use pgAdmin to create database `solidity_learning_dev`

#### Option B: Docker PostgreSQL

```bash
# Run PostgreSQL in Docker
docker run --name postgres-dev \
  -e POSTGRES_DB=solidity_learning_dev \
  -e POSTGRES_USER=solidity_user \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:14

# Verify connection
docker exec -it postgres-dev psql -U solidity_user -d solidity_learning_dev
```

### 3. Redis Setup (Optional for Development)

#### Local Redis Installation

**macOS:**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt install redis-server
sudo systemctl start redis-server
```

#### Docker Redis

```bash
docker run --name redis-dev -p 6379:6379 -d redis:7-alpine
```

### 4. Environment Configuration

Edit `.env.local` with your configuration:

```bash
# Database Configuration
DATABASE_URL="postgresql://solidity_user:your_password@localhost:5432/solidity_learning_dev"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-min-32-characters-long"

# OAuth Providers (see OAuth Setup section below)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# AI Integration
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"

# Redis (if using)
REDIS_URL="redis://localhost:6379"

# Development Features
NODE_ENV="development"
DEBUG=true
VERBOSE_LOGGING=true
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
```

### 5. Database Migration

```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed database with sample data (optional)
npm run db:seed
```

### 6. Start Development Server

```bash
# Start the development server
npm run dev

# The application will be available at:
# http://localhost:3000
```

## 🔐 OAuth Provider Setup

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure OAuth consent screen
6. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-domain.com/api/auth/callback/google`
7. Copy Client ID and Client Secret to `.env.local`

### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in application details:
   - Application name: "Solidity Learning Platform"
   - Homepage URL: `http://localhost:3000` (development)
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret to `.env.local`

### Discord OAuth Setup (Optional)

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create "New Application"
3. Go to "OAuth2" section
4. Add redirect URI: `http://localhost:3000/api/auth/callback/discord`
5. Copy Client ID and Client Secret to `.env.local`

## 🤖 AI Integration Setup

### Google Gemini API

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to `.env.local` as `GOOGLE_GENERATIVE_AI_API_KEY`

### OpenAI API (Alternative)

1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new secret key
3. Add to `.env.local` as `OPENAI_API_KEY`

## 📁 File Storage Setup

### Cloudinary Setup

1. Create account at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard
3. Copy Cloud Name, API Key, and API Secret
4. Add to `.env.local`:
   ```
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   ```

### AWS S3 Setup (Alternative)

1. Create AWS account and S3 bucket
2. Create IAM user with S3 permissions
3. Add to `.env.local`:
   ```
   AWS_ACCESS_KEY_ID="your-access-key"
   AWS_SECRET_ACCESS_KEY="your-secret-key"
   AWS_REGION="us-east-1"
   AWS_S3_BUCKET="your-bucket-name"
   ```

## 🔧 Development Tools Setup

### VS Code Extensions

Install recommended extensions:

```bash
# Install VS Code extensions
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension Prisma.prisma
code --install-extension ms-playwright.playwright
```

### Git Hooks Setup

```bash
# Install Husky for Git hooks
npm run prepare

# This sets up:
# - Pre-commit: Linting and type checking
# - Pre-push: Tests and build verification
```

## 🧪 Testing Setup

### Install Testing Dependencies

```bash
# Testing dependencies are included in package.json
# Verify installation
npm run test:unit
npm run test:e2e:install  # Install Playwright browsers
```

### Environment Variables for Testing

Add to `.env.local`:

```bash
# Testing Configuration
TEST_DATABASE_URL="postgresql://solidity_user:your_password@localhost:5432/solidity_learning_test"
TEST_REDIS_URL="redis://localhost:6379/1"
ENABLE_A11Y_TESTING=true
ENABLE_PERFORMANCE_TESTING=true
```

## 📊 Monitoring Setup (Optional)

### Sentry Error Tracking

1. Create account at [Sentry](https://sentry.io/)
2. Create new project
3. Add to `.env.local`:
   ```
   SENTRY_DSN="https://your-dsn@sentry.io/project-id"
   ```

### Analytics Setup

#### Google Analytics

1. Create GA4 property
2. Add Measurement ID to `.env.local`:
   ```
   NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
   ```

#### Plausible Analytics (Privacy-focused)

1. Create account at [Plausible](https://plausible.io/)
2. Add domain
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_PLAUSIBLE_DOMAIN="localhost"
   ```

## ✅ Verification Checklist

After setup, verify everything works:

```bash
# 1. Check database connection
npm run db:studio

# 2. Run type checking
npm run type-check

# 3. Run linting
npm run lint

# 4. Run unit tests
npm run test:unit

# 5. Run accessibility tests
npm run test:accessibility

# 6. Run performance tests
npm run test:performance

# 7. Build for production
npm run build

# 8. Start production server
npm run start
```

## 🚨 Common Issues & Solutions

### Database Connection Issues

**Error**: `ECONNREFUSED` or `database does not exist`

**Solutions**:
```bash
# Check PostgreSQL is running
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql      # Linux

# Verify database exists
psql -U solidity_user -d solidity_learning_dev -c "\l"

# Reset database
npm run db:reset
```

### OAuth Redirect Issues

**Error**: `redirect_uri_mismatch`

**Solutions**:
- Verify redirect URIs in OAuth provider settings
- Check `NEXTAUTH_URL` matches your domain
- Ensure no trailing slashes in URLs

### Node.js Version Issues

**Error**: `Unsupported engine`

**Solutions**:
```bash
# Check Node.js version
node --version

# Install correct version using nvm
nvm install 20
nvm use 20
```

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3000`

**Solutions**:
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or use different port
PORT=3001 npm run dev
```

### Environment Variable Issues

**Error**: Variables not loading

**Solutions**:
- Ensure `.env.local` exists (not `.env.example`)
- Check variable names (no spaces around `=`)
- Restart development server after changes
- Use `NEXT_PUBLIC_` prefix for client-side variables

## 📞 Getting Help

If you encounter issues:

1. Check this documentation first
2. Search existing [GitHub Issues](https://github.com/ezekaj/learning_sol/issues)
3. Check the [Troubleshooting Guide](./TROUBLESHOOTING.md)
4. Create a new issue with:
   - Environment details (OS, Node.js version, etc.)
   - Error messages
   - Steps to reproduce
   - Screenshots if applicable

## 🔄 Next Steps

After successful setup:

1. Read the [Contributing Guide](../CONTRIBUTING.md)
2. Explore the [Component Documentation](../components/README.md)
3. Review [Performance Guidelines](../performance/ARCHITECTURE.md)
4. Check [Accessibility Standards](../accessibility/GUIDELINES.md)

---

**Happy coding! 🚀**
