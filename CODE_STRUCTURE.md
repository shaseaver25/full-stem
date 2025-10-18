# Code Structure Documentation

This document outlines the project's file and directory structure, naming conventions, and organizational principles.

## Directory Structure

### Overview

```
src/
├── components/           # Reusable UI components organized by role/domain
│   ├── admin/           # Admin-specific components
│   │   └── dashboard/   # Admin dashboard components (if needed)
│   ├── teacher/         # Teacher-specific components
│   │   └── dashboard/   # Teacher dashboard sub-components
│   ├── student/         # Student-specific components
│   ├── parent/          # Parent-specific components
│   ├── ui/              # Shared UI components (shadcn/ui)
│   ├── auth/            # Authentication components
│   ├── navigation/      # Navigation components
│   ├── content/         # Content management components
│   ├── lesson/          # Lesson-related components
│   ├── assignments/     # Assignment components
│   ├── discussion/      # Discussion board components
│   └── ...              # Other domain-specific folders
├── pages/               # Route-level page components
│   ├── admin/           # Admin pages
│   ├── teacher/         # Teacher pages
│   ├── student/         # Student pages
│   ├── parent/          # Parent pages
│   ├── assignments/     # Assignment pages
│   ├── classes/         # Class pages
│   ├── grades/          # Grade pages
│   └── ...              # Other page groups
├── hooks/               # Custom React hooks
├── contexts/            # React contexts
├── services/            # API and external services
├── utils/               # Utility functions
├── types/               # TypeScript type definitions
├── integrations/        # Third-party integrations
│   └── supabase/        # Supabase integration
└── data/                # Static data and fixtures
```

## Naming Conventions

### Components (PascalCase)

All React components use PascalCase:
- ✅ `TeacherDashboard.tsx`
- ✅ `StudentDashboard.tsx`
- ✅ `AdminAnalyticsDashboard.tsx`
- ✅ `LoadingSpinner.tsx`
- ❌ `teacher-dashboard.tsx`
- ❌ `loading_spinner.tsx`

### Hooks (camelCase with 'use' prefix)

Custom hooks follow camelCase with a `use` prefix:
- ✅ `useStudentData.ts`
- ✅ `useClassManagement.ts`
- ✅ `useOptimizedImage.ts`
- ❌ `UseStudentData.ts`
- ❌ `use-student-data.ts`

### Utilities (camelCase)

Utility files and functions use camelCase:
- ✅ `errorLogging.ts`
- ✅ `apiService.ts`
- ✅ `timing.ts`
- ✅ `segment.ts`
- ❌ `ErrorLogging.ts`
- ❌ `error-logging.ts`

### Services (camelCase)

Service files use camelCase:
- ✅ `classService.ts`
- ✅ `assignmentService.ts`
- ✅ `messagingService.ts`
- ❌ `ClassService.ts`

### Types (PascalCase for interfaces/types, camelCase for files)

Type definition files use camelCase, but the types themselves use PascalCase:
```typescript
// File: assignmentTypes.ts
export interface Assignment { ... }
export type AssignmentStatus = 'pending' | 'completed';
```

### Documentation (UPPER_SNAKE_CASE)

Documentation and markdown files use UPPER_SNAKE_CASE:
- ✅ `CODE_STRUCTURE.md`
- ✅ `CODE_QUALITY.md`
- ✅ `DEVELOPER_DOCUMENTATION.md`
- ✅ `IMAGE_OPTIMIZATION.md`
- ❌ `code-structure.md`
- ❌ `codeStructure.md`

Exception: `README.md` (standard convention)

### Contexts (PascalCase with 'Context' suffix)

Context files use PascalCase with a Context suffix:
- ✅ `AuthContext.tsx`
- ✅ `SuperAdminContext.tsx`
- ✅ `FocusModeContext.tsx`

## Organization Principles

### 1. Group by Role

Components and pages are organized by user role:
```
components/
├── admin/        # Admin-only components
├── teacher/      # Teacher-only components
├── student/      # Student-only components
├── parent/       # Parent-only components
└── ui/           # Shared UI components
```

### 2. Group by Domain

Within roles, components are further organized by domain:
```
teacher/
├── dashboard/         # Dashboard-specific components
├── RosterManagement.tsx
├── GradingModal.tsx
└── ClassMessaging.tsx
```

### 3. Pages Mirror Routes

Page structure mirrors the URL structure:
```
pages/
├── teacher/
│   ├── TeacherAnalyticsDashboard.tsx  # /teacher/analytics
│   └── TeacherFeedbackDashboard.tsx   # /teacher/feedback
├── student/
│   ├── index.tsx                      # /student (assignments dashboard)
│   └── StudentDashboard.tsx           # /dashboard/student (profile dashboard)
└── admin/
    └── AdminAnalyticsDashboard.tsx    # /dashboard/admin/analytics
```

**Note on Student Dashboards**: There are two student dashboard pages:
- `index.tsx` (/student): Assignments-focused view
- `StudentDashboard.tsx` (/dashboard/student): Profile-focused view with edit capabilities

### 4. Shared Components in UI

Components used across multiple roles live in `components/ui/`:
```
ui/
├── LoadingSpinner.tsx
├── EmptyState.tsx
├── OptimizedImage.tsx
└── button.tsx
```

## File Organization Best Practices

### Components

1. **One component per file**: Each file should export one primary component
2. **Co-locate helpers**: Small helper components can live in the same file
3. **Separate types**: Large type definitions should be in separate files
4. **Index files**: Use `index.ts` to re-export from directories when needed

### Hooks

1. **Single responsibility**: Each hook should have one clear purpose
2. **Query keys**: Export query keys from hooks that use react-query
3. **Type safety**: Always type hook parameters and return values

Example:
```typescript
// useStudentData.ts
export const studentQueryKeys = {
  all: ['students'] as const,
  byUserId: (userId: string) => [...studentQueryKeys.all, 'byUserId', userId] as const,
};

export function useStudentByUserId(userId: string) { ... }
```

### Services

1. **API separation**: Separate API calls by domain (class, assignment, etc.)
2. **Error handling**: Include error handling in service functions
3. **Type definitions**: Define request/response types

### Utilities

1. **Pure functions**: Utilities should be side-effect free when possible
2. **Well-documented**: Include JSDoc comments for complex utilities
3. **Tested**: High-coverage unit tests for utilities

## Import Organization

Organize imports in this order:

```typescript
// 1. React and core libraries
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Third-party libraries
import { format } from 'date-fns';
import { toast } from 'sonner';

// 3. UI components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 4. Domain components
import { TeacherHeader } from '@/components/teacher/TeacherHeader';

// 5. Hooks and utilities
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

// 6. Types
import type { Student } from '@/types';

// 7. Relative imports
import { LocalComponent } from './LocalComponent';
```

## Path Aliases

The project uses TypeScript path aliases:

```json
{
  "@/*": ["./src/*"]
}
```

Always use absolute imports with `@/` prefix:
- ✅ `import { Button } from '@/components/ui/button'`
- ❌ `import { Button } from '../../components/ui/button'`

## Recent Refactoring (2025)

### Dashboard Restructuring

**Before:**
```
pages/dashboard/
├── StudentDashboard.tsx
├── teacher/
│   ├── TeacherAnalyticsDashboard.tsx
│   └── TeacherFeedbackDashboard.tsx
├── admin/
│   └── AdminAnalyticsDashboard.tsx
└── parent/
    └── ParentDashboard.tsx
```

**After:**
```
pages/
├── student/
│   └── StudentDashboard.tsx
├── teacher/
│   ├── TeacherAnalyticsDashboard.tsx
│   └── TeacherFeedbackDashboard.tsx
├── admin/
│   └── AdminAnalyticsDashboard.tsx
└── parent/
    └── ParentDashboard.tsx
```

### Component Organization

Components are now consistently organized by role:
```
components/
├── teacher/
│   └── dashboard/       # Teacher dashboard sub-components
│       ├── AnalyticsPreview.tsx
│       ├── ClassesList.tsx
│       ├── MetricsOverview.tsx
│       ├── NotificationsPanel.tsx
│       └── QuickActions.tsx
```

## Migration Guide

When moving files:

1. **Use the rename tool**: Don't copy/delete, use `lov-rename`
2. **Update imports**: Check and update all imports to the new location
3. **Update route definitions**: Update lazy imports in `App.tsx`
4. **Test thoroughly**: Run type-check and build after moving files
5. **Update documentation**: Update this file and other docs

## Verification Commands

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build check
npm run build

# Full check
npm run lint && npm run type-check && npm run build
```

## See Also

- [CODE_QUALITY.md](CODE_QUALITY.md) - Code quality standards and ESLint rules
- [DEVELOPER_DOCUMENTATION.md](DEVELOPER_DOCUMENTATION.md) - Development guide
- [IMAGE_OPTIMIZATION.md](IMAGE_OPTIMIZATION.md) - Image optimization guide
- [SENTRY_SETUP.md](SENTRY_SETUP.md) - Error monitoring setup
