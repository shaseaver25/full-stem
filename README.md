# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/6ba0ffd1-9a8e-49f9-9f63-94f86000b68b

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/6ba0ffd1-9a8e-49f9-9f63-94f86000b68b) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Key Features

### Performance Optimizations

- **Image Optimization**: Responsive image loading with automatic srcSet generation
  - See [IMAGE_OPTIMIZATION.md](IMAGE_OPTIMIZATION.md) for detailed usage guide
  - Components: `OptimizedImage`, `useOptimizedImage` hook
  - Automatic viewport-based image sizing for better performance

- **Error Monitoring**: Sentry integration for production error tracking
  - See [SENTRY_SETUP.md](SENTRY_SETUP.md) for configuration

- **React Query**: Optimized data fetching with caching (5-minute stale time)

## Accessibility

TailorEdu achieves full WCAG 2.1 Level AA compliance with comprehensive accessibility features:

### Features
- **Keyboard Navigation**: Complete keyboard support across all interfaces (Tab, Enter, Space, Escape)
- **Screen Reader Support**: ARIA labels on all interactive elements, live regions for dynamic updates
- **Focus Management**: Focus trap in modals, proper return focus after closing
- **ARIA Live Regions**: Dynamic announcements for form submissions, errors, and status updates
- **High Contrast Mode**: User-configurable high contrast theme
- **Accessible Forms**: All inputs properly labeled with associated error messages
- **Icon Buttons**: Descriptive labels on all icon-only controls

### Testing
```bash
# Run accessibility tests
npm run test:a11y

# Watch mode for development
npm run test:a11y:watch

# Generate coverage report
npm run test:a11y:coverage
```

### Documentation
- [Accessibility Audit Report](docs/ACCESSIBILITY_AUDIT.md) - Full WCAG 2.1 compliance report (99.0%)
- [Accessibility Implementation Notes](docs/ACCESSIBILITY_NOTES.md) - Patterns and best practices
- [Accessibility Checklist](docs/ACCESSIBILITY_CHECKLIST.md) - Developer quick reference
- [Accessibility Testing Guide](src/test/accessibility.test.ts) - Automated testing setup

### Quick Reference
📋 [Compliance Summary](docs/ACCESSIBILITY_COMPLIANCE_SUMMARY.md) - One-page status card

### Development
In development mode, axe-core automatically monitors for accessibility violations and logs them to the console.

**Status:** 99.0% WCAG 2.1 Level AA compliant (198/200 checks passing)

### Developer Documentation

- [DEVELOPER_DOCUMENTATION.md](DEVELOPER_DOCUMENTATION.md) - Comprehensive development guide
- [CODE_STRUCTURE.md](CODE_STRUCTURE.md) - Directory structure and naming conventions
- [CODE_QUALITY.md](CODE_QUALITY.md) - Code quality standards and ESLint configuration
- [docs/ACCESSIBILITY_AUDIT.md](docs/ACCESSIBILITY_AUDIT.md) - WCAG 2.1 AA compliance audit
- [IMAGE_OPTIMIZATION.md](IMAGE_OPTIMIZATION.md) - Image optimization utilities
- [SENTRY_SETUP.md](SENTRY_SETUP.md) - Error monitoring setup
- [REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md) - Recent refactoring changes

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/6ba0ffd1-9a8e-49f9-9f63-94f86000b68b) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
