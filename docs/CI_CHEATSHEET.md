# CI/CD Cheatsheet

## Overview

TailorEDU uses GitHub Actions for continuous integration on every push and pull request. The CI pipeline ensures code quality, type safety, and build integrity before deployment.

## Workflow Triggers

- **Push**: Runs on every push to any branch
- **Pull Request**: Runs on PRs targeting the `main` branch

## Pipeline Steps

### 1. Environment Setup
- **Node.js**: 20.x (required for Storybook 9)
- **Package Manager**: pnpm 9
- **Lock File**: Uses `--frozen-lockfile` to ensure reproducible builds

### 2. Code Quality Checks

#### Linting (`pnpm lint`)
Checks code for style violations and potential errors.

**Common Failures:**
- Unused imports or variables
- Missing dependencies in useEffect hooks
- Incorrect hook usage
- Accessibility violations (missing alt text, ARIA attributes)

**How to Fix:**
```bash
# Run linter locally
pnpm lint

# Auto-fix issues
pnpm lint --fix
```

#### Type Checking (`pnpm type-check`)
Validates TypeScript types across the entire codebase.

**Common Failures:**
- Type mismatches (e.g., `string` assigned to `number`)
- Missing or incorrect interface properties
- Improper use of `any` type
- Import path errors

**How to Fix:**
```bash
# Run type check locally
pnpm type-check

# Show detailed errors
pnpm type-check --verbose
```

### 3. Testing (`pnpm test -- --ci`)

Runs unit tests, integration tests, and accessibility tests.

**Common Failures:**
- Test assertions failing
- Component rendering errors
- Mock setup issues
- Accessibility violations caught by jest-axe

**How to Fix:**
```bash
# Run tests locally
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test -- --coverage

# Run specific test file
pnpm test src/components/Button.test.tsx
```

### 4. Build (`pnpm build`)

Compiles the application for production.

**Common Failures:**
- TypeScript compilation errors
- Missing environment variables (required: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- Import resolution errors
- Bundle size limits exceeded

**How to Fix:**
```bash
# Run build locally
pnpm build

# Build with dev mode to see more details
pnpm build:dev

# Check environment variables
cp .env.example .env
# Fill in required values in .env
```

## Required Scripts in package.json

The CI workflow requires these npm scripts to be present:

```json
{
  "scripts": {
    "lint": "eslint .",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "build": "vite build"
  }
}
```

**Note**: If `type-check` or `test` scripts are missing, add them to `package.json`:

```bash
# For type-check (if missing)
# Add to scripts: "type-check": "tsc --noEmit"

# For test (if missing)  
# Add to scripts: "test": "vitest"
```

## Reading CI Failures

### Workflow Status

View workflow runs at: `https://github.com/{owner}/{repo}/actions`

**Status Indicators:**
- ✅ **Green checkmark**: All steps passed
- ❌ **Red X**: One or more steps failed
- 🟡 **Yellow circle**: Workflow in progress
- ⚪ **Gray circle**: Workflow skipped or cancelled

### Drilling Down

1. **Click on the failed workflow run** to see all jobs
2. **Click on the "Build & Test" job** to see individual steps
3. **Click on the failed step** to see detailed logs
4. **Look for the first error** (subsequent errors often cascade)

### Common Error Patterns

#### Lint Errors
```
error  'useState' is defined but never used  @typescript-eslint/no-unused-vars
```
**Fix**: Remove unused imports or use the variable.

#### Type Errors
```
error TS2322: Type 'string' is not assignable to type 'number'.
```
**Fix**: Correct the type or add proper type casting.

#### Test Failures
```
FAIL  src/components/Button.test.tsx
  ✕ renders with correct text (25 ms)
    Expected: "Click me"
    Received: "Submit"
```
**Fix**: Update test expectations or fix component logic.

#### Build Errors
```
Build failed: Missing required environment variable: VITE_SUPABASE_URL
```
**Fix**: Add missing environment variables to GitHub Secrets.

## Local Pre-Commit Workflow

Run these commands before pushing to catch CI failures early:

```bash
# 1. Lint
pnpm lint

# 2. Type check
pnpm type-check

# 3. Test
pnpm test -- --run

# 4. Build
pnpm build

# If all pass, commit and push
git add .
git commit -m "your message"
git push
```

## GitHub Secrets Configuration

For production builds, configure these secrets in GitHub:
`Settings > Secrets and variables > Actions > New repository secret`

**Required Secrets:**
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_SENTRY_DSN`: (Optional) Sentry error tracking DSN

## Build Artifacts

Successful builds upload the `dist/` directory as a build artifact:

- **Name**: `web-dist`
- **Retention**: 7 days
- **Location**: Workflow run summary page > Artifacts section

**Use Cases:**
- Download and preview the exact production build
- Deploy manually to custom hosting
- Debug production-specific issues

## Performance Considerations

**Typical CI Runtime:**
- Lint: ~10-20 seconds
- Type Check: ~15-30 seconds
- Tests: ~30-60 seconds
- Build: ~30-60 seconds
- **Total**: ~2-3 minutes

**Optimization Tips:**
- Use `pnpm` with caching (already configured)
- Keep dependencies up to date
- Split large test files into smaller ones
- Use `--maxWorkers=2` flag for tests in CI if needed

## Troubleshooting Checklist

- [ ] Does the workflow run locally? (`pnpm lint && pnpm type-check && pnpm test -- --run && pnpm build`)
- [ ] Are all required scripts present in package.json?
- [ ] Are GitHub Secrets configured correctly?
- [ ] Is the `.env.example` file up to date?
- [ ] Are all dependencies installed? (`pnpm i`)
- [ ] Is the lock file committed? (`pnpm-lock.yaml` or `bun.lockb`)
- [ ] Are there merge conflicts in package files?

## Getting Help

If CI continues to fail after trying these fixes:

1. **Check Recent Changes**: Review what changed between the last passing and failing runs
2. **Review Full Logs**: Download and search the complete workflow logs
3. **Test Locally**: Replicate the exact CI environment using Docker
4. **Ask for Help**: Include the workflow run URL and error messages

## Related Documentation

- [CODE_QUALITY.md](../CODE_QUALITY.md) - Linting and code standards
- [ENV_HARDENING.md](./ENV_HARDENING.md) - Environment variable setup
- [ACCESSIBILITY_CHECKLIST.md](./ACCESSIBILITY_CHECKLIST.md) - Accessibility testing
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
