# Sentry Error Logging Setup

This project is configured to use Sentry for production error logging and monitoring.

## Setup Instructions

### 1. Create a Sentry Account

1. Go to [sentry.io](https://sentry.io) and create an account
2. Create a new project for your application
3. Select "React" as your platform

### 2. Get Your DSN

1. In your Sentry project settings, navigate to **Settings > Projects > [Your Project] > Client Keys (DSN)**
2. Copy your DSN (it will look like: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`)

### 3. Add DSN to Environment Variables

Add your Sentry DSN to your `.env` file:

```bash
VITE_SENTRY_DSN="your-sentry-dsn-here"
```

**Important:** The DSN is only used in production builds. Development errors are logged to the console.

## Features

### Automatic Error Capture

- All unhandled errors are automatically captured by the global `Sentry.ErrorBoundary`
- API errors in hooks and services are logged via `logError()` utility
- User context is automatically set when users sign in

### Error Logging Utility

Use the `logError()` utility function in catch blocks:

```typescript
import { logError } from '@/utils/errorLogging';

try {
  // Your code
} catch (error) {
  logError(error, 'ComponentName: action description');
  // Handle error
}
```

### User Context

User information is automatically tracked:
- User ID is set when they sign in
- Email is included for easier debugging
- Context is cleared on sign out

### Breadcrumbs

Add breadcrumbs for better debugging context:

```typescript
import { addBreadcrumb } from '@/utils/errorLogging';

addBreadcrumb('User clicked submit button', 'user-action');
```

## Configuration

### Performance Monitoring

- **Traces Sample Rate:** 10% of transactions are captured
- **Replays on Error:** 100% of sessions with errors are recorded
- **Replays Sample Rate:** 10% of all sessions are recorded

You can adjust these in `src/main.tsx`:

```typescript
Sentry.init({
  tracesSampleRate: 0.1,  // Adjust between 0.0 and 1.0
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

## Best Practices

1. **Always use logError() in catch blocks** - This ensures errors are captured consistently
2. **Provide context strings** - Use descriptive context like "ComponentName: action"
3. **Don't log sensitive data** - Avoid including passwords, tokens, or PII in error messages
4. **Test in production** - Sentry only activates in production builds

## Testing

### Development Testing

To test Sentry integration in development:

1. Temporarily set `isProd` to `true` in `src/config/sentry.ts` or add your DSN to `.env`
2. Add a test error in any component:
   ```typescript
   throw new Error("Test Sentry integration");
   ```
3. Check your Sentry dashboard to confirm the error was captured
4. Remember to revert the `isProd` change after testing

### Production Testing

To test Sentry integration in production:

1. Build the app for production: `npm run build`
2. Preview the production build: `npm run preview`
3. Trigger an error in the app (e.g., click a button that throws an error)
4. Check your Sentry dashboard to confirm the error was captured

### Source Maps Upload

To upload source maps for better error debugging:

1. Add Sentry project configuration to your environment:
   ```bash
   SENTRY_ORG="your-org-name"
   SENTRY_PROJECT="your-project-name"
   SENTRY_AUTH_TOKEN="your-auth-token"
   ```
2. Get your auth token from: https://sentry.io/settings/account/api/auth-tokens/
3. Source maps will be automatically uploaded during production builds

### Verification Checklist

- [ ] Errors appear in Sentry dashboard with full stack traces
- [ ] Source maps are uploaded and stack traces show original code
- [ ] User context is set correctly (user ID and email)
- [ ] Breadcrumbs are captured for debugging context
- [ ] Session replays are captured for errors
- [ ] Performance metrics are visible in Sentry

## Disabling Sentry

To temporarily disable Sentry, simply remove or comment out the `VITE_SENTRY_DSN` environment variable.

## Additional Resources

- [Sentry React Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Error Boundaries](https://docs.sentry.io/platforms/javascript/guides/react/features/error-boundary/)
- [Performance Monitoring](https://docs.sentry.io/platforms/javascript/guides/react/performance/)
