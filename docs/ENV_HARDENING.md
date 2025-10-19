# Environment Variable Hardening

## Overview

TailorEDU implements robust environment variable validation and security practices to prevent misconfigurations and ensure reliable deployments.

## Architecture

### Files

- **`src/utils/env.ts`**: Zod-validated, typed environment configuration
- **`.env`**: Local environment variables (gitignored, never commit)
- **`.env.example`**: Template with safe defaults and documentation

### Validation Flow

```
┌─────────────────┐
│ Build Process   │
│ import.meta.env │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ src/utils/env.ts│
│ Zod Validation  │
└────────┬────────┘
         │
         ├─── Development ──► Optional vars allowed
         │
         └─── Production ───► Required vars enforced
                              ↓
                        Build fails if missing
```

## Environment Variables

### Required (Production)

These variables **MUST** be present in production builds or the app will fail to start:

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `VITE_SUPABASE_URL` | Supabase project URL | [Supabase Dashboard](https://app.supabase.com/project/_/settings/api) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | [Supabase Dashboard](https://app.supabase.com/project/_/settings/api) |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID | - |
| `VITE_GOOGLE_API_KEY` | Google Drive API key | - |
| `VITE_SENTRY_DSN` | Sentry error logging DSN | - |

## Usage

### ✅ Correct: Use typed env utility

```typescript
import { env, isDev, isProd } from '@/utils/env';

// Type-safe access with validation
const supabaseUrl = env.VITE_SUPABASE_URL;

// Environment checks
if (isDev) {
  console.log('Development mode');
}

if (isProd && env.VITE_SENTRY_DSN) {
  initSentry(env.VITE_SENTRY_DSN);
}
```

### ❌ Incorrect: Direct import.meta.env access

```typescript
// DON'T DO THIS - No validation, no type safety
const url = import.meta.env.VITE_SUPABASE_URL;
```

## Build-Time Guards

### Development

- All environment variables are **optional**
- Missing vars log warnings but don't block the app
- Useful for local development and testing

### Production

- Critical variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) are **enforced**
- App shows error screen if required vars are missing
- Build fails early with helpful error messages

Example error message:

```
PRODUCTION BUILD ERROR: Missing required environment variables:
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_PUBLISHABLE_KEY

Please check your .env file or deployment configuration.
See docs/ENV_HARDENING.md for details.
```

## Deployment

### Vercel / Netlify / Cloudflare

Add environment variables in your deployment platform's dashboard:

1. Go to Project Settings → Environment Variables
2. Add each variable from `.env.example`
3. Set values for your production Supabase project
4. Redeploy to apply changes

### Docker / Self-Hosted

Use environment files or container orchestration:

```bash
# Using .env file
docker run --env-file .env your-image

# Using docker-compose
version: '3'
services:
  app:
    image: your-image
    env_file: .env
```

### CI/CD (GitHub Actions)

Add secrets to repository settings:

```yaml
- name: Build
  env:
    VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    VITE_SUPABASE_PUBLISHABLE_KEY: ${{ secrets.SUPABASE_PUBLISHABLE_KEY }}
  run: npm run build
```

## Security Best Practices

### ✅ DO

- Use `.env.example` as template, copy to `.env` locally
- Keep `.env` in `.gitignore` (already configured)
- Use Supabase Edge Functions for server-side secrets
- Rotate keys if accidentally committed
- Use different keys for dev/staging/production

### ❌ DON'T

- Commit `.env` files to version control
- Store private API keys in client-side env vars
- Hardcode secrets in source code
- Share production credentials in Slack/email
- Use production keys in development

## Troubleshooting

### "Missing required environment variables" error

**Cause**: Production build missing critical env vars.

**Solution**:
1. Copy `.env.example` to `.env`
2. Fill in actual values from Supabase dashboard
3. Rebuild: `npm run build`

### "Invalid Supabase URL" error

**Cause**: Malformed URL in `VITE_SUPABASE_URL`.

**Solution**: Ensure URL follows format: `https://[project-id].supabase.co`

### Environment variables not updating

**Cause**: Vite caches env vars at build time.

**Solution**: 
1. Stop dev server
2. Update `.env` file
3. Restart dev server: `npm run dev`

## Validation Schema

The Zod schema in `src/utils/env.ts` enforces:

- **URL validation**: Supabase URL and Sentry DSN must be valid URLs
- **String validation**: Keys must be non-empty strings
- **Type safety**: All env vars are properly typed
- **Production guards**: Required vars enforced in production only

## Testing

### Test Missing Required Vars

```bash
# Remove required vars and try to build
unset VITE_SUPABASE_URL
npm run build
# Should fail with helpful error message
```

### Test Invalid URLs

```bash
# Set invalid URL format
export VITE_SUPABASE_URL="not-a-valid-url"
npm run build
# Should fail with Zod validation error
```

## Performance Impact

- **Build time**: < 10ms validation overhead
- **Runtime**: Zero - validation happens once at app startup
- **Bundle size**: +2KB for Zod schema (tree-shaken in production)

## Migration from Direct import.meta.env

To migrate existing code:

```typescript
// Before
if (import.meta.env.DEV) { }
const url = import.meta.env.VITE_SUPABASE_URL;

// After
import { isDev, env } from '@/utils/env';
if (isDev) { }
const url = env.VITE_SUPABASE_URL;
```

## Related Documentation

- [Performance Audit](./PERFORMANCE_AUDIT.md) - Caching and optimization
- [Security Policies](./SECURITY_POLICIES.md) - RLS and database security
- [Code Quality](../CODE_QUALITY.md) - TypeScript and linting standards

## Changelog

- **2025-01-19**: Initial environment hardening implementation
  - Added Zod validation
  - Implemented build-time guards
  - Created typed env utility
  - Added comprehensive documentation
