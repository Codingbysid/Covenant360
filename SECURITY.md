# Security Implementation Guide

## 🔒 Security Features Implemented

### 1. Environment Variable Management
- **File**: `lib/env.ts`
- Validates all required environment variables
- Throws errors if critical variables are missing in production
- Ensures `NEXTAUTH_SECRET` is at least 32 characters in production

### 2. Security Headers
- **File**: `middleware.ts`, `next.config.js`
- **Headers Implemented**:
  - `Strict-Transport-Security` (HSTS)
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `X-XSS-Protection`
  - `Referrer-Policy`
  - `Permissions-Policy`
  - `Content-Security-Policy` (CSP)

### 3. CORS Configuration
- **File**: `middleware.ts`
- Configured for API routes
- Allows only specified origins
- Supports credentials
- Handles preflight OPTIONS requests

### 4. Rate Limiting
- **File**: `lib/security.ts`
- In-memory rate limiter (use Redis in production)
- Applied to:
  - Login: 5 attempts per 15 minutes per email
  - Registration: 3 attempts per hour per IP
  - API endpoints: Configurable limits

### 5. Input Sanitization
- **File**: `lib/security.ts`
- Removes dangerous characters (`<`, `>`, `javascript:`, event handlers)
- Limits input length (1000 characters)
- Email sanitization (lowercase, trim)
- Applied to all user inputs in API routes

### 6. Authentication & Authorization
- **File**: `app/api/auth/[...nextauth]/route.ts`
- NextAuth.js v5 with JWT sessions
- Password hashing with bcryptjs
- Role-based access control (ADMIN, CREDIT_OFFICER, BORROWER)
- Session max age: 30 days

### 7. API Route Protection
- All API routes check authentication
- Role-based authorization for sensitive operations
- Rate limiting on all endpoints
- Input validation with Zod schemas

## 🚀 Deployment Checklist for Vercel

### Required Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

```bash
# Required
DATABASE_URL="postgresql://user:password@host:5432/dbname"  # Use Vercel Postgres or external DB
NEXTAUTH_SECRET="your-32-character-secret-here"  # Generate: openssl rand -base64 32
NEXTAUTH_URL="https://yourdomain.vercel.app"

# Optional (for email notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@yourdomain.com"

# Backend API (if separate)
API_BASE_URL="https://api.yourdomain.com"
```

### Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use strong secrets** - Generate with `openssl rand -base64 32`
3. **Enable HTTPS** - Vercel does this automatically
4. **Use Vercel Postgres** - For production database
5. **Monitor rate limits** - Consider upgrading to Redis for production
6. **Regular security audits** - Use `npm audit` and update dependencies

### Production Recommendations

1. **Replace in-memory rate limiter** with Redis:
   ```typescript
   // Use @upstash/ratelimit or similar
   import { Ratelimit } from "@upstash/ratelimit";
   ```

2. **Add CSRF protection** - Implement proper CSRF tokens
3. **Enable logging** - Use Vercel Analytics or Sentry
4. **Database connection pooling** - Configure Prisma for production
5. **Backup strategy** - Regular database backups

## 🔍 Security Testing

### Manual Testing Checklist

- [ ] Test rate limiting (try 6 login attempts quickly)
- [ ] Verify CORS headers in browser DevTools
- [ ] Check security headers with: `curl -I https://yourdomain.com`
- [ ] Test input sanitization (try XSS payloads)
- [ ] Verify authentication redirects
- [ ] Test role-based access control

### Tools

- **Security Headers Check**: https://securityheaders.com
- **SSL Test**: https://www.ssllabs.com/ssltest/
- **OWASP ZAP**: For penetration testing

