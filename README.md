Triggering audit registration.
# Welcome to your Lovable project

[![CI](https://github.com/shaseaver25/full-stem/actions/workflows/ci.yml/badge.svg)](https://github.com/shaseaver25/full-stem/actions/workflows/ci.yml)
[![Security](https://github.com/shaseaver25/full-stem/actions/workflows/security.yml/badge.svg)](https://github.com/shaseaver25/full-stem/actions/workflows/security.yml)
[![Accessibility & Performance](https://github.com/shaseaver25/full-stem/actions/workflows/accessibility.yml/badge.svg)](https://github.com/shaseaver25/full-stem/actions/workflows/accessibility.yml)
[![GEO Optimization](https://github.com/shaseaver25/full-stem/actions/workflows/geo-audit.yml/badge.svg)](https://github.com/shaseaver25/full-stem/actions/workflows/geo-audit.yml)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9-orange.svg)](https://pnpm.io/)

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

### Security

- **Rate Limiting**: Client-side rate limiting with intelligent backoff
  - See [RATE_LIMITING.md](docs/RATE_LIMITING.md) for complete guide
  - Token bucket + sliding window algorithms
  - Automatic backoff with jitter on retries
  - Protection against brute force and abuse
  - Per-endpoint configurable limits

- **Security Headers**: Comprehensive HTTP security headers protection
  - See [SECURITY_HEADERS.md](docs/SECURITY_HEADERS.md) for complete guide
  - Content Security Policy (CSP) in report-only mode
  - HSTS with preload support for HTTPS enforcement
  - Protection against XSS, clickjacking, and MIME-sniffing attacks
  - Multi-platform deployment configs (Vercel, Netlify, Cloudflare)

- **Environment Variable Hardening**: Type-safe environment configuration with Zod validation
  - See [ENV_HARDENING.md](docs/ENV_HARDENING.md) for complete guide
  - Build-time guards prevent production deployments with missing critical vars
  - Typed environment variables with automatic validation
  - Protection against misconfiguration and injection attacks

### Performance Optimizations

- **Database Performance**: Strategic indexes and query optimization
  - See [PERFORMANCE_AUDIT.md](docs/PERFORMANCE_AUDIT.md) for complete audit
  - 50+ optimized indexes for critical queries
  - N+1 query prevention with optimized query builders

- **Image Optimization**: Responsive image loading with automatic srcSet generation
  - See [IMAGE_OPTIMIZATION.md](IMAGE_OPTIMIZATION.md) for detailed usage guide
  - Components: `OptimizedImage`, `useOptimizedImage` hook
  - Automatic viewport-based image sizing for better performance

- **Error Monitoring**: Sentry integration for production error tracking
  - See [SENTRY_SETUP.md](SENTRY_SETUP.md) for configuration

- **React Query**: Optimized data fetching with caching strategies
  - Stale time: 5 minutes for list queries, 2 minutes for detail queries
  - Query key factories for consistent cache management
  - Automatic cache invalidation on mutations

- **Web Vitals Monitoring**: Real user monitoring in production
  - Tracks LCP, FID, CLS, TTFB, and INP metrics
  - Automatic logging to console and analytics
  - Performance budgets enforced in CI/CD

### AI & Search Optimization

- **Hybrid AI Architecture**: Multi-provider AI system with cost tracking
  - See [AI_PROVIDER_ARCHITECTURE.md](docs/AI_PROVIDER_ARCHITECTURE.md) for complete guide
  - Unified provider interface supporting OpenAI, Mixtral, Llama 3, Command R+
  - Automatic token usage and cost tracking in `ai_lesson_history` table
  - Admin dashboard with real-time usage analytics
  - Future-ready for intelligent routing (auto-switch to cheaper models)
  - Currently active: OpenAI GPT-4o-mini for lesson generation

- **GEO (Generative Engine Optimization)**: AI-friendly metadata and structure
  - See [GEO_OPTIMIZATION.md](docs/GEO_OPTIMIZATION.md) for complete guide
  - Schema.org JSON-LD markup for Organization, Course, and Person types
  - OpenGraph and Twitter Card metadata for social sharing
  - Automated GEO scoring in CI/CD (target: ≥85/100)
  - Entity verification and provenance tracking
  - Optimized for ChatGPT, Perplexity, and Google AI Overviews

- **Content Provenance**: Cryptographically verifiable authorship
  - See [PROVENANCE_AND_AI_READABILITY.md](docs/PROVENANCE_AND_AI_READABILITY.md) for details
  - See [ANTI_THEFT.md](docs/ANTI_THEFT.md) for content protection strategies
  - SHA-256 hash verification with JWS signatures for all pages
  - Automated provenance manifest generation at build time
  - AI-readable metadata tags for trust signals
  - Build-time hash generation and CI/CD verification
  - Provenance scoring in GEO audit (target: ≥90/100)
  
  **Verification Methods:**
  ```bash
  # Generate signed provenance manifest
  node scripts/hash-provenance-signed.js
  
  # Verify a specific page hash
  node scripts/hash-provenance-signed.js --verify dist/index.html
  ```
  
  **In-Browser Verification:**
  - Click the "Verify Page" badge (bottom-right corner on public pages)
  - Verification endpoint: `/functions/v1/provenance-verify?url={path}`
  - Uses JWS compact signature format with HMAC-SHA256
  - Public key validation via `TAILOREDU_SIGNING_PUB` secret

- **Schema.org Structured Data**: Automated JSON-LD injection system
  - See [SCHEMA_IMPLEMENTATION.md](docs/SCHEMA_IMPLEMENTATION.md) for quick start
  - Dynamic schema generation with Supabase integration (`useClassSchema`)
  - Auto-generated breadcrumbs based on URL (`useBreadcrumbSchema`)
  - Reusable SchemaMarkup component with react-helmet
  - CI validation via `scripts/schema-validate.js`
  - Support for Organization, Course, Person, LearningResource, and BreadcrumbList schemas

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
- [docs/CI_CHEATSHEET.md](docs/CI_CHEATSHEET.md) - CI/CD pipeline and troubleshooting guide
- [docs/RATE_LIMITING.md](docs/RATE_LIMITING.md) - Client-side rate limiting and backoff strategies
- [docs/SECURITY_HEADERS.md](docs/SECURITY_HEADERS.md) - HTTP security headers and CSP configuration
- [docs/ENV_HARDENING.md](docs/ENV_HARDENING.md) - Environment variable validation and security
- [docs/ACCESSIBILITY_AUDIT.md](docs/ACCESSIBILITY_AUDIT.md) - WCAG 2.1 AA compliance audit
- [docs/SECURITY_POLICIES.md](docs/SECURITY_POLICIES.md) - RLS policies and database security audit
- [docs/PERFORMANCE_AUDIT.md](docs/PERFORMANCE_AUDIT.md) - Performance optimization audit and benchmarks
- [docs/GEO_OPTIMIZATION.md](docs/GEO_OPTIMIZATION.md) - Generative Engine Optimization guide
- [docs/SCHEMA_IMPLEMENTATION.md](docs/SCHEMA_IMPLEMENTATION.md) - Schema.org JSON-LD implementation
- [IMAGE_OPTIMIZATION.md](IMAGE_OPTIMIZATION.md) - Image optimization utilities
- [SENTRY_SETUP.md](SENTRY_SETUP.md) - Error monitoring setup
- [REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md) - Recent refactoring changes

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/6ba0ffd1-9a8e-49f9-9f63-94f86000b68b) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
