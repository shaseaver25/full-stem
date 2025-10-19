# Code Quality Standards

This document outlines code quality standards and practices for the project.

## ESLint Configuration

The project uses ESLint with the following plugins and rules:

### Plugins
- `@eslint/js` - Core JavaScript rules
- `typescript-eslint` - TypeScript-specific rules
- `eslint-plugin-react-hooks` - React Hooks rules
- `eslint-plugin-react-refresh` - React Refresh rules
- `eslint-plugin-unused-imports` - Detects and removes unused imports

### Key Rules

```javascript
{
  // React Hooks rules (recommended)
  ...reactHooks.configs.recommended.rules,
  
  // React Refresh - warn on non-component exports
  "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
  
  // Unused imports - error on unused imports
  "unused-imports/no-unused-imports": "error",
  
  // Unused variables - warn with exceptions
  "unused-imports/no-unused-vars": [
    "warn",
    {
      vars: "all",
      varsIgnorePattern: "^_",
      args: "after-used",
      argsIgnorePattern: "^_",
    },
  ],
  
  // TypeScript unused vars disabled (handled by unused-imports)
  "@typescript-eslint/no-unused-vars": "off",
}
```

## Code Cleanup Completed

### Removed Unnecessary React Imports

With React 17+ JSX Transform, explicit `import React from 'react'` is no longer required in most files. The following files have been cleaned up:

- `src/components/course/EmptyLessonsState.tsx`
- `src/components/ui/LoadingSpinner.tsx`
- `src/components/ui/EmptyState.tsx`
- `src/components/ui/OptimizedImage.tsx`
- `src/components/ProtectedRoute.tsx`

### When React Import IS Required

Keep `import React from 'react'` only when:
1. Using `React.FC` type annotations
2. Using `React.useState`, `React.useEffect`, etc.
3. Using `React.ReactNode`, `React.ComponentType`, or other React types
4. Using `React.createElement` or other React APIs directly

### Removed React.FC Type Annotations

Changed from:
```typescript
const Component: React.FC<Props> = ({ prop }) => { ... }
```

To:
```typescript
const Component = ({ prop }: Props) => { ... }
```

Benefits:
- Cleaner code
- No need to import React when not using React APIs
- Better TypeScript inference
- Explicit prop typing at parameter level

## Running ESLint

To check for code quality issues:

```bash
npm run lint
```

To automatically fix issues:

```bash
npm run lint -- --fix
```

## Pre-commit Checks

The project includes pre-commit hooks that run:
1. ESLint checks
2. TypeScript type checking
3. Prettier formatting

## Best Practices

### Import Organization

Organize imports in this order:
1. React and core libraries
2. Third-party libraries
3. UI components
4. Hooks and utilities
5. Types and interfaces
6. Relative imports

Example:
```typescript
// React and core
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Third-party libraries
import { format } from 'date-fns';
import { toast } from 'sonner';

// UI components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Hooks and utilities
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

// Types
import type { User } from '@/types';

// Relative imports
import { MyLocalComponent } from './MyLocalComponent';
```

### Avoiding Unused Code

1. **Remove unused imports immediately** - Don't commit code with unused imports
2. **Delete commented code** - Use version control instead
3. **Remove dead code paths** - If code is unreachable, delete it
4. **Simplify conditionals** - Remove unnecessary checks

### Type Safety

1. **Avoid `any` type** - Use specific types or `unknown`
2. **Use type inference** - Let TypeScript infer when obvious
3. **Export types separately** - Use `export type` for type-only exports
4. **Use const assertions** - For literal types: `as const`

### Performance

1. **Lazy load components** - Use `React.lazy()` for route components
2. **Memoize expensive computations** - Use `useMemo` appropriately
3. **Optimize re-renders** - Use `useCallback` for event handlers
4. **Avoid inline object creation** - Extract to constants when possible

## Continuous Improvement

This is a living document. As we identify new patterns or issues:
1. Update this document
2. Update ESLint rules if needed
3. Run automated fixes across codebase
4. Document exceptions clearly

## Resources

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [React Hooks Rules](https://react.dev/reference/rules)
- [Unused Imports Plugin](https://www.npmjs.com/package/eslint-plugin-unused-imports)
- [Accessibility Audit Report](docs/ACCESSIBILITY_AUDIT.md) - WCAG 2.1 compliance testing
- [Accessibility Implementation Notes](docs/ACCESSIBILITY_NOTES.md) - Patterns and best practices
- [Accessibility Compliance Summary](docs/ACCESSIBILITY_COMPLIANCE_SUMMARY.md) - Quick reference card
- [Security Policies Audit](docs/SECURITY_POLICIES.md) - RLS policies and database security
- [Environment Hardening](docs/ENV_HARDENING.md) - Environment variable validation and security
- [Performance Audit](docs/PERFORMANCE_AUDIT.md) - Database indexes, caching, and optimization strategies
