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

To test Sentry integration:

1. Build the app for production: `npm run build`
2. Preview the production build: `npm run preview`
3. Trigger an error in the app
4. Check your Sentry dashboard to confirm the error was captured

## Disabling Sentry

To temporarily disable Sentry, simply remove or comment out the `VITE_SENTRY_DSN` environment variable.

## Additional Resources

- [Sentry React Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Error Boundaries](https://docs.sentry.io/platforms/javascript/guides/react/features/error-boundary/)
- [Performance Monitoring](https://docs.sentry.io/platforms/javascript/guides/react/performance/)
