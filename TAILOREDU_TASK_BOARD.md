# TailorEDU Site Audit — Phase-Based Debug & Optimization Task Board
**Role-Assigned, Read-Only Mode**  
**Generated:** October 18, 2025  
**Source:** TailorEDU Site Audit Report

---

## Table of Contents
- [Phase 1: Critical Fixes](#phase-1-critical-fixes)
- [Phase 2: Optimization](#phase-2-optimization)
- [Phase 3: Refinement](#phase-3-refinement)
- [Phase 4: Polish](#phase-4-polish)
- [Role Legend](#role-legend)
- [Progress Summary](#progress-summary)

---

## Phase 1: Critical Fixes
**Focus:** Stabilize routing, eliminate duplicates, improve error boundaries

### Progress Tracker
- [ ] 12 Critical Priority Tasks
- [ ] 8 High Priority Tasks
- [ ] Total: 20 Tasks

---

### TASK-001: Consolidate Duplicate Gradebook Routes
**Priority:** 🔴 Critical  
**Labels:** #phase1 #priority-critical #frontend #ux-ui

**Issue:**  
Three separate gradebook implementations exist:
- `/gradebook` → `GradebookPage.tsx`
- `/teacher/assignments/:assignmentId/gradebook` → `AssignmentGradebookPage.tsx`
- `/unified-gradebook` → `UnifiedGradebookPage.tsx`

**Impact:**  
- Confuses navigation flow
- Duplicates 400+ lines of logic
- Makes maintenance difficult
- Inconsistent user experience

**Recommendation:**  
Consolidate into a single `/teacher/gradebook` route with query params for filtering (e.g., `?class=xyz&assignment=abc`).

**Files/Paths:**
```
src/pages/GradebookPage.tsx
src/pages/AssignmentGradebookPage.tsx
src/pages/UnifiedGradebookPage.tsx
src/components/teacher/SimpleGradebook.tsx
```

**Next Steps:**
1. Audit which gradebook has the most complete feature set
2. Create unified component accepting filter props
3. Update all navigation links to point to single route
4. Archive old implementations

---

### TASK-002: Resolve Duplicate Class Detail Pages
**Priority:** 🔴 Critical  
**Labels:** #phase1 #priority-critical #frontend #ux-ui

**Issue:**  
Two class detail pages with different implementations:
- `/classes/:id` → `ClassDetailPage.tsx`
- `/classes/:classId` → `RoleAwareClassDetailPage.tsx`

**Impact:**  
- Route parameter inconsistency (`:id` vs `:classId`)
- Split maintenance burden
- Different feature sets per route

**Recommendation:**  
Migrate all traffic to `RoleAwareClassDetailPage` (more complete), standardize on `:classId` parameter, and remove old `ClassDetailPage`.

**Files/Paths:**
```
src/pages/ClassDetailPage.tsx
src/pages/classes/ClassDetailPage.tsx
src/pages/classes/RoleAwareClassDetailPage.tsx
src/App.tsx (routing config)
```

**Next Steps:**
1. Verify `RoleAwareClassDetailPage` handles all user roles correctly
2. Update all internal links to use `/classes/:classId`
3. Add redirect from old route to new route
4. Remove old implementation after 2-week deprecation period

---

### TASK-003: Fix Build Class Page Duplication
**Priority:** 🔴 Critical  
**Labels:** #phase1 #priority-critical #frontend #ux-ui

**Issue:**  
Two separate "build class" implementations:
- `/build-class` → `BuildClassPage.tsx`
- `/ai-course-builder` → `AICourseBuilderPage.tsx`

**Impact:**  
- Users confused about which tool to use
- Different feature sets
- Inconsistent data models

**Recommendation:**  
Merge into single `/teacher/build-class` route with toggleable AI-assist mode.

**Files/Paths:**
```
src/pages/BuildClassPage.tsx
src/pages/AICourseBuilderPage.tsx
src/components/build-class/*
```

**Next Steps:**
1. Compare feature matrices of both implementations
2. Design unified UI with optional AI mode toggle
3. Consolidate backend logic
4. Update teacher dashboard links

---

### TASK-004: Standardize Assignment Routes
**Priority:** 🔴 Critical  
**Labels:** #phase1 #priority-critical #frontend #ux-ui

**Issue:**  
Inconsistent assignment route structures:
- `/assignments` → list page
- `/assignments/:id` → detail page
- `/student/assignments/:id` → student view
- `/teacher/assignments/:assignmentId` → teacher view
- `/assignments/:id/submit` → submission page

**Impact:**  
- Parameter naming inconsistency (`:id` vs `:assignmentId`)
- Confusing navigation hierarchy
- Duplicate components for similar views

**Recommendation:**  
Adopt consistent structure:
- `/assignments` → general list
- `/assignments/:assignmentId` → role-aware detail
- `/assignments/:assignmentId/submit` → student submission

**Files/Paths:**
```
src/pages/assignments/AssignmentsListPage.tsx
src/pages/assignments/AssignmentDetailPage.tsx
src/pages/student/assignments/[id]/index.tsx
src/pages/student/assignments/[id]/submit.tsx
src/pages/teacher/assignments/[assignmentId]/index.tsx
src/App.tsx (routing)
```

**Next Steps:**
1. Map all current assignment routes
2. Create route migration plan
3. Update navigation components
4. Add redirects from old routes

---

### TASK-005: Implement Global Error Boundary
**Priority:** 🔴 Critical  
**Labels:** #phase1 #priority-critical #frontend #security

**Issue:**  
Only one `ErrorBoundary.tsx` exists in `/ui` folder, not implemented at app level.

**Impact:**  
- Unhandled errors crash entire app
- No graceful error recovery
- Poor user experience during failures
- Lost error reporting data

**Recommendation:**  
Wrap `<App />` with ErrorBoundary, add error logging service, implement fallback UI.

**Files/Paths:**
```
src/components/ui/ErrorBoundary.tsx
src/main.tsx
src/App.tsx
```

**Next Steps:**
1. Enhance `ErrorBoundary` with error reporting (Sentry/LogRocket)
2. Wrap root component in `main.tsx`
3. Add nested boundaries for critical sections (dashboards, gradebook)
4. Design user-friendly error fallback UI

---

### TASK-006: Fix Missing Loading States in Critical Hooks
**Priority:** 🔴 Critical  
**Labels:** #phase1 #priority-critical #frontend #ux-ui

**Issue:**  
Many hooks return data but lack proper loading/error states:
- `useClassData`
- `useLessonData`
- `useAssignmentData`
- `useStudentProgress`

**Impact:**  
- Flash of empty content
- Premature "no data" messages
- User confusion
- Accessibility issues

**Recommendation:**  
Audit all data-fetching hooks, ensure consistent `{ data, loading, error }` return pattern.

**Files/Paths:**
```
src/hooks/useClassData.ts
src/hooks/useLessonData.ts
src/hooks/useAssignmentData.ts
src/hooks/useStudentProgress.ts
(+20 more hooks)
```

**Next Steps:**
1. Create loading state audit checklist
2. Standardize return type interface
3. Add skeleton loaders to consuming components
4. Update TypeScript types

---

### TASK-007: Remove Hardcoded Demo Credentials
**Priority:** 🔴 Critical  
**Labels:** #phase1 #priority-critical #security

**Issue:**  
Demo mode uses client-side session storage for authentication state.

**Impact:**  
- Security vulnerability (client-side manipulation)
- Potential privilege escalation
- Not auditable

**Recommendation:**  
Move demo session validation to backend with proper JWT/session tokens.

**Files/Paths:**
```
src/hooks/useDemoMode.ts
src/pages/DemoGate.tsx
src/pages/DemoStart.tsx
supabase/functions/demo-consume-token/index.ts
```

**Next Steps:**
1. Review current demo authentication flow
2. Design server-side demo session management
3. Implement edge function for demo token validation
4. Replace localStorage checks with API calls

---

### TASK-008: Fix MFA Return URL Vulnerability
**Priority:** 🔴 Critical  
**Labels:** #phase1 #priority-critical #security

**Issue:**  
MFA redirect stores return URL in localStorage, susceptible to open redirect attacks.

**Impact:**  
- Open redirect vulnerability
- Phishing attack vector
- Security audit failure

**Recommendation:**  
Validate return URLs against whitelist, use server-side session storage, sanitize redirects.

**Files/Paths:**
```
src/pages/MFASetup.tsx
src/pages/MFAVerify.tsx
src/hooks/useMFAEnforcement.ts
```

**Next Steps:**
1. Create URL whitelist validator function
2. Move redirect state to encrypted session storage
3. Add URL sanitization
4. Security audit of redirect logic

---

### TASK-009: Document All RLS Policies
**Priority:** 🟡 High  
**Labels:** #phase1 #priority-high #backend #security #documentation

**Issue:**  
37+ tables with RLS policies, but no centralized documentation explaining access patterns.

**Impact:**  
- Hard to onboard new developers
- Policy changes risk breaking features
- Security review is difficult
- No clear audit trail

**Recommendation:**  
Create `SECURITY_RLS_POLICIES.md` with table-by-table access matrix and role permissions.

**Files/Paths:**
```
SECURITY_RLS_POLICIES.md (new)
supabase/migrations/* (reference)
RBAC_IMPLEMENTATION.md (existing)
```

**Next Steps:**
1. List all tables with RLS enabled
2. Document each policy's purpose and conditions
3. Create access matrix by role
4. Add examples of permitted/denied queries

---

### TASK-010: Standardize Query Keys Across All Hooks
**Priority:** 🟡 High  
**Labels:** #phase1 #priority-high #backend #performance

**Issue:**  
Inconsistent React Query key naming leads to cache misses and duplicate fetches.

**Impact:**  
- Multiple identical queries executed
- Increased Supabase API usage
- Slower page loads
- Cache invalidation failures

**Recommendation:**  
Create `queryKeys.ts` factory with standardized key structure: `['resource', id, ...filters]`.

**Files/Paths:**
```
src/lib/queryKeys.ts (new)
src/hooks/useClassData.ts
src/hooks/useStudentData.ts
src/hooks/useAssignments.ts
(+40 hooks to update)
```

**Next Steps:**
1. Audit all `useQuery` calls for key patterns
2. Design hierarchical key structure
3. Create query key factory functions
4. Migrate hooks incrementally

---

### TASK-011: Fix Student Data Query Duplication
**Priority:** 🟡 High  
**Labels:** #phase1 #priority-high #backend #performance

**Issue:**  
5+ hooks fetch student data with slightly different queries:
- `useStudentData`
- `useStudentProfile`
- `useStudentProfiles`
- `useStudentProgress`
- `useStudentClasses`

**Impact:**  
- Same data fetched multiple times
- Inconsistent data shape
- Cache fragmentation
- Maintenance burden

**Recommendation:**  
Create unified `useStudent` hook with optional `include` flags for related data.

**Files/Paths:**
```
src/hooks/useStudentData.ts
src/hooks/useStudentProfile.ts
src/hooks/useStudentProfiles.ts
src/hooks/useStudentProgress.ts
src/hooks/useStudentClasses.ts
```

**Next Steps:**
1. Map all student-related data needs
2. Design flexible query with `include` options
3. Create unified hook
4. Deprecate old hooks gradually

---

### TASK-012: Optimize Class Query in Teacher Dashboard
**Priority:** 🟡 High  
**Labels:** #phase1 #priority-high #backend #performance

**Issue:**  
Teacher dashboard fetches all class data on load, even for teachers with 20+ classes.

**Impact:**  
- Slow initial page load (3-5 seconds)
- Unnecessary data transfer
- Poor UX for power users

**Recommendation:**  
Implement pagination or virtual scrolling for class list, lazy load class details.

**Files/Paths:**
```
src/hooks/useClasses.ts
src/pages/teacher/TeacherDashboard.tsx
src/components/teacher/ClassesGrid.tsx
```

**Next Steps:**
1. Add pagination to classes query
2. Implement "load more" or infinite scroll
3. Cache class metadata separately from full details
4. Add loading skeletons

---

### TASK-013: Add Missing Error States in Assignment Wizard
**Priority:** 🟡 High  
**Labels:** #phase1 #priority-high #frontend #ux-ui

**Issue:**  
`AssignmentWizard` has no error handling for failed submissions or validation.

**Impact:**  
- Silent failures confuse teachers
- Lost work without feedback
- Support tickets increase

**Recommendation:**  
Add try/catch blocks, display user-friendly error messages, implement auto-save drafts.

**Files/Paths:**
```
src/components/teacher/AssignmentWizard.tsx
src/hooks/useAssignmentMutations.ts
```

**Next Steps:**
1. Add error state UI components
2. Implement toast notifications for failures
3. Add auto-save functionality
4. Log errors for debugging

---

### TASK-014: Fix Inconsistent Navigation Between Dashboards
**Priority:** 🟡 High  
**Labels:** #phase1 #priority-high #frontend #ux-ui

**Issue:**  
Student, Teacher, Parent, and Admin dashboards use different navigation patterns:
- Some use sidebar
- Some use top nav
- Some use breadcrumbs
- No consistent "back" button behavior

**Impact:**  
- Disorienting UX
- Steeper learning curve
- Accessibility issues

**Recommendation:**  
Standardize on one navigation pattern across all dashboards, add consistent breadcrumbs.

**Files/Paths:**
```
src/pages/dashboard/StudentDashboard.tsx
src/pages/teacher/TeacherDashboard.tsx
src/pages/dashboard/parent/ParentDashboard.tsx
src/pages/AdminDashboard.tsx
src/components/Header.tsx
src/components/RoleAwareNavigation.tsx
```

**Next Steps:**
1. Design unified navigation system
2. Create reusable navigation components
3. Implement breadcrumb standard
4. Update all dashboards

---

### TASK-015: Remove Unused Developer Routes
**Priority:** 🟡 High  
**Labels:** #phase1 #priority-high #frontend #security

**Issue:**  
Multiple developer/debug routes lack proper access control:
- `/bootstrap-demo`
- `/demo-showcase`
- `/components-page`

**Impact:**  
- Potential information disclosure
- Dead code in production bundle
- Security audit flags

**Recommendation:**  
Move to dev-only routes guarded by `DeveloperRoute`, or remove entirely if unused.

**Files/Paths:**
```
src/pages/BootstrapDemo.tsx
src/pages/DemoShowcase.tsx
src/pages/ComponentsPage.tsx
src/App.tsx (routing)
```

**Next Steps:**
1. Audit usage of each dev route
2. Protect with `DeveloperRoute` component
3. Remove unused routes
4. Document remaining dev tools

---

### TASK-016: Fix useSimpleGradebook Query Logic
**Priority:** 🟡 High  
**Labels:** #phase1 #priority-high #backend

**Issue:**  
Recent fix in `useSimpleGradebook` uses two sequential queries instead of optimized join.

**Impact:**  
- Slower query execution
- More database load
- Potential race conditions

**Recommendation:**  
Rewrite to use proper foreign key join or create database view for gradebook data.

**Files/Paths:**
```
src/hooks/useSimpleGradebook.ts
```

**Next Steps:**
1. Review database schema for proper foreign keys
2. Optimize query to single call
3. Add query performance logging
4. Test with large class sizes (100+ students)

---

### TASK-017: Implement Rate Limiting for Edge Functions
**Priority:** 🟡 High  
**Labels:** #phase1 #priority-high #backend #security

**Issue:**  
Edge functions lack rate limiting except MFA endpoints.

**Impact:**  
- Potential DoS attacks
- Runaway costs
- Service degradation

**Recommendation:**  
Add rate limiting middleware to all public edge functions using Redis or Supabase realtime.

**Files/Paths:**
```
supabase/functions/_shared/rateLimiter.ts (new)
supabase/functions/*/index.ts (all functions)
```

**Next Steps:**
1. Design rate limiting strategy per endpoint
2. Create reusable rate limiter utility
3. Apply to all edge functions
4. Add monitoring/alerting

---

### TASK-018: Add TypeScript Strict Mode
**Priority:** 🟡 High  
**Labels:** #phase1 #priority-high #frontend

**Issue:**  
`tsconfig.json` has `strict: false`, allowing implicit any and unsafe type assertions.

**Impact:**  
- Hidden runtime errors
- Poor IDE support
- Type safety compromised

**Recommendation:**  
Enable strict mode, fix resulting errors incrementally by module.

**Files/Paths:**
```
tsconfig.json
(Multiple files will need updates)
```

**Next Steps:**
1. Enable strict mode in new files only first
2. Create migration plan by directory
3. Fix critical type errors first
4. Add type coverage reporting

---

### TASK-019: Consolidate Duplicate Button Variants
**Priority:** 🟡 High  
**Labels:** #phase1 #priority-high #frontend #ux-ui

**Issue:**  
Custom button variants scattered across components instead of centralized in `button.tsx`.

**Impact:**  
- Inconsistent styling
- Duplicate Tailwind classes
- Hard to update globally

**Recommendation:**  
Move all button styles to `button.tsx` variants, remove inline className overrides.

**Files/Paths:**
```
src/components/ui/button.tsx
(Multiple components using custom button styles)
```

**Next Steps:**
1. Audit all button usage across app
2. Identify unique style patterns
3. Create button variants in design system
4. Refactor components to use variants

---

### TASK-020: Fix Missing Accessibility Labels
**Priority:** 🟡 High  
**Labels:** #phase1 #priority-high #frontend #ux-ui

**Issue:**  
Many interactive elements lack proper ARIA labels, especially icon-only buttons.

**Impact:**  
- Screen reader users cannot navigate
- WCAG 2.1 AA compliance failure
- Legal risk for accessibility lawsuits

**Recommendation:**  
Audit all icon buttons, add `aria-label` or `aria-labelledby`, test with screen reader.

**Files/Paths:**
```
src/components/teacher/ClassesGrid.tsx
src/components/admin/AdminSiteOverview.tsx
src/components/lesson/LessonControls.tsx
(+many more)
```

**Next Steps:**
1. Run automated accessibility scan (axe DevTools)
2. Create aria-label standards guide
3. Fix all flagged elements
4. Add accessibility CI checks

---

## Phase 2: Optimization
**Focus:** Performance improvements, data fetching optimization, caching strategies

### Progress Tracker
- [ ] 15 Medium Priority Tasks
- [ ] Total: 15 Tasks

---

### TASK-021: Implement Code Splitting for Large Routes
**Priority:** 🟠 Medium  
**Labels:** #phase2 #priority-medium #performance #frontend

**Issue:**  
All routes loaded synchronously, causing large initial bundle (2.1MB).

**Impact:**  
- Slow Time to Interactive (TTI > 5s)
- Poor mobile experience
- High bounce rate

**Recommendation:**  
Use React lazy loading for route-level code splitting, prioritize dashboard and lesson routes.

**Files/Paths:**
```
src/App.tsx
src/pages/* (all route components)
```

**Next Steps:**
1. Identify largest route components
2. Wrap in `React.lazy()`
3. Add `<Suspense>` with loading fallback
4. Measure bundle size reduction

---

### TASK-022: Optimize Image Loading with Lazy Loading
**Priority:** 🟠 Medium  
**Labels:** #phase2 #priority-medium #performance #frontend

**Issue:**  
All images loaded eagerly, including below-the-fold content.

**Impact:**  
- Slow page load
- High data usage on mobile
- Poor LCP (Largest Contentful Paint)

**Recommendation:**  
Add `loading="lazy"` to all images, use responsive srcset, compress images.

**Files/Paths:**
```
src/components/Hero.tsx
src/components/Testimonials.tsx
src/components/teacher/ClassesGrid.tsx
(Search for all <img> tags)
```

**Next Steps:**
1. Audit all image usage
2. Add lazy loading attributes
3. Optimize image formats (WebP)
4. Implement responsive images

---

### TASK-023: Cache Lesson Components for Reuse
**Priority:** 🟠 Medium  
**Labels:** #phase2 #priority-medium #performance #backend

**Issue:**  
Lesson components re-fetched on every lesson page load, even if unchanged.

**Impact:**  
- Slow navigation between lessons
- Increased database load
- Poor user experience

**Recommendation:**  
Implement React Query caching with 5-minute staleTime for lesson components.

**Files/Paths:**
```
src/hooks/useLessonComponents.ts
src/hooks/useLessonData.ts
src/pages/LessonPage.tsx
```

**Next Steps:**
1. Add caching config to lesson queries
2. Implement cache invalidation on lesson edits
3. Prefetch next lesson on current lesson load
4. Monitor cache hit rates

---

### TASK-024: Reduce Teacher Profile Query Duplication
**Priority:** 🟠 Medium  
**Labels:** #phase2 #priority-medium #backend #performance

**Issue:**  
4 separate hooks for teacher profile data:
- `useTeacherProfile`
- `useTeacherProfileData`
- `useTeacherProfileSimplified`
- `useTeacherAuth`

**Impact:**  
- Redundant queries
- Inconsistent data
- Hard to maintain

**Recommendation:**  
Merge into single `useTeacher` hook with optional fields.

**Files/Paths:**
```
src/hooks/useTeacherProfile.ts
src/hooks/useTeacherProfileData.ts
src/hooks/useTeacherProfileSimplified.ts
src/hooks/useTeacherAuth.ts
```

**Next Steps:**
1. Compare all teacher hooks
2. Design unified interface
3. Create migration guide
4. Update all consumers

---

### TASK-025: Optimize Assignment Submissions Query
**Priority:** 🟠 Medium  
**Labels:** #phase2 #priority-medium #backend #performance

**Issue:**  
Submissions page fetches all submission data at once, including file URLs and AI feedback.

**Impact:**  
- Slow page load for classes with 100+ students
- High memory usage
- Poor teacher experience

**Recommendation:**  
Implement pagination, lazy load file previews and AI feedback on expand.

**Files/Paths:**
```
src/hooks/useTeacherSubmissions.ts
src/components/teacher/AssignmentSubmissionsDashboard.tsx
src/pages/AssignmentSubmissionsPage.tsx
```

**Next Steps:**
1. Add pagination to submissions query
2. Defer loading of file previews
3. Load AI feedback on demand
4. Add virtual scrolling for large lists

---

### TASK-026: Implement Optimistic Updates for Grading
**Priority:** 🟠 Medium  
**Labels:** #phase2 #priority-medium #frontend #ux-ui

**Issue:**  
Grading actions require full page refresh to see updates.

**Impact:**  
- Slow grading workflow
- Poor teacher experience
- Feels unresponsive

**Recommendation:**  
Add optimistic updates to grade mutations, rollback on error.

**Files/Paths:**
```
src/hooks/useAssignmentGrading.ts
src/components/teacher/GradingModal.tsx
src/hooks/useSimpleGradebook.ts
```

**Next Steps:**
1. Implement optimistic UI updates
2. Add rollback on mutation failure
3. Show pending state during save
4. Add success/error toasts

---

### TASK-027: Reduce Bundle Size with Tree Shaking
**Priority:** 🟠 Medium  
**Labels:** #phase2 #priority-medium #performance #frontend

**Issue:**  
Many unused exports included in final bundle (lucide-react icons, utility functions).

**Impact:**  
- Larger bundle size than necessary
- Slower downloads
- Wasted bandwidth

**Recommendation:**  
Import only needed icons, audit unused utilities, enable Vite tree shaking optimization.

**Files/Paths:**
```
vite.config.ts
src/components/* (icon imports)
src/lib/utils.ts
```

**Next Steps:**
1. Analyze bundle composition
2. Replace `import * from 'lucide-react'` with specific imports
3. Remove unused utility functions
4. Enable Vite build optimizations

---

### TASK-028: Add Database Indexes for Common Queries
**Priority:** 🟠 Medium  
**Labels:** #phase2 #priority-medium #backend #performance

**Issue:**  
No explicit indexes on frequently queried columns like `class_id`, `student_id`, `user_id`.

**Impact:**  
- Slow query performance
- Full table scans
- Database CPU spikes

**Recommendation:**  
Add indexes on foreign keys and common filter columns, monitor slow query log.

**Files/Paths:**
```
supabase/migrations/add_performance_indexes.sql (new)
```

**Next Steps:**
1. Analyze query patterns from logs
2. Identify missing indexes
3. Create migration with new indexes
4. Monitor query performance improvement

---

### TASK-029: Implement Service Worker for Offline Support
**Priority:** 🟠 Medium  
**Labels:** #phase2 #priority-medium #performance #frontend

**Issue:**  
No offline support, app breaks completely without network.

**Impact:**  
- Poor experience in low-connectivity areas
- Students can't access downloaded lessons
- Lost work during disconnects

**Recommendation:**  
Add service worker to cache lesson content, enable offline reading mode.

**Files/Paths:**
```
vite.config.ts
src/serviceWorker.ts (new)
public/sw.js (new)
```

**Next Steps:**
1. Design offline-first strategy
2. Implement service worker
3. Cache lesson content for offline access
4. Add sync queue for mutations

---

### TASK-030: Optimize Real-Time Subscriptions
**Priority:** 🟠 Medium  
**Labels:** #phase2 #priority-medium #backend #performance

**Issue:**  
Multiple overlapping Supabase realtime subscriptions created per component.

**Impact:**  
- High WebSocket connection count
- Increased database load
- Connection limits hit

**Recommendation:**  
Centralize subscriptions at context level, share across components.

**Files/Paths:**
```
src/contexts/RealtimeContext.tsx (new)
src/hooks/useDiscussionReplies.ts
src/hooks/useNotifications.ts
```

**Next Steps:**
1. Audit all realtime subscriptions
2. Create centralized subscription manager
3. Implement subscription sharing
4. Monitor connection count

---

### TASK-031: Add Request Deduplication Middleware
**Priority:** 🟠 Medium  
**Labels:** #phase2 #priority-medium #backend #performance

**Issue:**  
Multiple identical requests fired during rapid navigation or component re-renders.

**Impact:**  
- Wasted API calls
- Higher costs
- Slower performance

**Recommendation:**  
Implement request deduplication at React Query level with aggressive caching.

**Files/Paths:**
```
src/integrations/supabase/client.ts
src/lib/queryClient.ts (new)
```

**Next Steps:**
1. Configure React Query defaults
2. Add request deduplication
3. Set appropriate cache times
4. Monitor API call reduction

---

### TASK-032: Lazy Load Rich Text Editor
**Priority:** 🟠 Medium  
**Labels:** #phase2 #priority-medium #performance #frontend

**Issue:**  
Quill editor bundle loaded on every page, even when not used (500KB).

**Impact:**  
- Large bundle size
- Slow initial load
- Wasted bandwidth

**Recommendation:**  
Lazy load `react-quill` only when editor component mounted.

**Files/Paths:**
```
src/components/ui/rich-text-editor.tsx
src/components/assignments/AssignmentForm.tsx
```

**Next Steps:**
1. Convert RichTextEditor to lazy-loaded component
2. Add loading placeholder
3. Measure bundle size reduction
4. Test editor functionality

---

### TASK-033: Implement Virtual Scrolling for Large Lists
**Priority:** 🟠 Medium  
**Labels:** #phase2 #priority-medium #performance #frontend

**Issue:**  
Lists with 100+ items (students, assignments) render all DOM nodes at once.

**Impact:**  
- Slow rendering
- High memory usage
- Janky scrolling

**Recommendation:**  
Use `react-window` or `react-virtualized` for large lists.

**Files/Paths:**
```
src/components/teacher/RosterManagement.tsx
src/components/admin/ActivityLogTable.tsx
src/components/teacher/SimpleGradebook.tsx
```

**Next Steps:**
1. Identify lists with 50+ items
2. Install react-window
3. Convert to virtualized lists
4. Test scroll performance

---

### TASK-034: Optimize Tailwind CSS Purging
**Priority:** 🟠 Medium  
**Labels:** #phase2 #priority-medium #performance #frontend

**Issue:**  
Final CSS bundle includes unused classes (potential over-purging).

**Impact:**  
- Larger CSS bundle than needed
- Slower page load

**Recommendation:**  
Audit Tailwind config, ensure proper content paths, remove unused theme extensions.

**Files/Paths:**
```
tailwind.config.ts
postcss.config.js
src/index.css
```

**Next Steps:**
1. Review content glob patterns
2. Run CSS bundle analyzer
3. Remove unused theme extensions
4. Verify purging works correctly

---

### TASK-035: Add Database Connection Pooling
**Priority:** 🟠 Medium  
**Labels:** #phase2 #priority-medium #backend #performance

**Issue:**  
Edge functions create new database connections per request.

**Impact:**  
- Connection exhaustion under load
- Slow query execution
- Supabase connection limits hit

**Recommendation:**  
Implement connection pooling in edge functions, use Supabase connection pooler.

**Files/Paths:**
```
supabase/functions/_shared/db.ts (new)
supabase/functions/*/index.ts (all functions)
```

**Next Steps:**
1. Configure Supabase connection pooler
2. Create shared DB client with pooling
3. Update all edge functions
4. Monitor connection usage

---

## Phase 3: Refinement
**Focus:** Structural improvements, naming consistency, accessibility enhancements

### Progress Tracker
- [ ] 18 Medium Priority Tasks
- [ ] 5 Low Priority Tasks
- [ ] Total: 23 Tasks

---

### TASK-036: Standardize Component Naming Convention
**Priority:** 🟠 Medium  
**Labels:** #phase3 #priority-medium #frontend #ux-ui

**Issue:**  
Inconsistent naming: some components use `Page` suffix, others don't, some use prefixes like `Simple-`.

**Impact:**  
- Hard to locate files
- Confusing for new developers
- Poor IDE autocomplete

**Recommendation:**  
Adopt standard: `ComponentName` for components, `ComponentNamePage` for routes, no `Simple-` prefixes.

**Files/Paths:**
```
src/components/teacher/SimpleGradebook.tsx
src/pages/UnifiedGradebookPage.tsx
src/components/admin/AdvancedAdminPanel.tsx
(Review all component files)
```

**Next Steps:**
1. Document naming conventions
2. Create file rename plan
3. Update imports systematically
4. Add linting rule for naming

---

### TASK-037: Reorganize Hook Directory Structure
**Priority:** 🟠 Medium  
**Labels:** #phase3 #priority-medium #frontend

**Issue:**  
70+ hooks in single `/hooks` directory, hard to find relevant hooks.

**Impact:**  
- Developer confusion
- Duplicate hook creation
- Poor discoverability

**Recommendation:**  
Organize by domain: `/hooks/student/*`, `/hooks/teacher/*`, `/hooks/admin/*`, `/hooks/shared/*`.

**Files/Paths:**
```
src/hooks/* (all hook files)
```

**Next Steps:**
1. Design directory structure
2. Create migration script
3. Update all imports
4. Update documentation

---

### TASK-038: Create Shared Layout Components
**Priority:** 🟠 Medium  
**Labels:** #phase3 #priority-medium #frontend #ux-ui

**Issue:**  
Duplicate layout code across dashboards (header, sidebar, breadcrumbs).

**Impact:**  
- 1000+ lines of duplicated code
- Inconsistent layouts
- Hard to update globally

**Recommendation:**  
Create `DashboardLayout`, `AuthLayout`, `PublicLayout` components with slot props.

**Files/Paths:**
```
src/components/layout/DashboardLayout.tsx (new)
src/components/layout/AuthLayout.tsx (new)
src/pages/dashboard/* (update all)
```

**Next Steps:**
1. Design layout component API
2. Create reusable layouts
3. Migrate dashboards incrementally
4. Remove duplicate code

---

### TASK-039: Unify Toast Notification Usage
**Priority:** 🟠 Medium  
**Labels:** #phase3 #priority-medium #frontend #ux-ui

**Issue:**  
Multiple toast implementations used across app (sonner, custom toast).

**Impact:**  
- Inconsistent notification styling
- Different behavior per component
- User confusion

**Recommendation:**  
Standardize on single toast system (sonner), create notification helper functions.

**Files/Paths:**
```
src/components/ui/toaster.tsx
src/hooks/use-toast.ts
src/lib/notifications.ts (new)
```

**Next Steps:**
1. Audit all toast usage
2. Migrate to single system
3. Create notification helper
4. Document toast guidelines

---

### TASK-040: Implement Consistent Form Validation
**Priority:** 🟠 Medium  
**Labels:** #phase3 #priority-medium #frontend #ux-ui

**Issue:**  
Mix of manual validation, `react-hook-form`, and inline checks across forms.

**Impact:**  
- Inconsistent error messages
- Different validation timing
- Poor user experience

**Recommendation:**  
Standardize on `react-hook-form` + `zod` for all forms, create shared validation schemas.

**Files/Paths:**
```
src/lib/validations/* (new directory)
src/components/build-class/ClassDetailsForm.tsx
src/components/teacher/CreateClassModal.tsx
(All form components)
```

**Next Steps:**
1. Create validation schema library
2. Migrate forms to react-hook-form
3. Standardize error display
4. Add validation tests

---

### TASK-041: Add Comprehensive Loading Skeletons
**Priority:** 🟠 Medium  
**Labels:** #phase3 #priority-medium #frontend #ux-ui

**Issue:**  
Some pages show blank screen during load, others show generic spinner.

**Impact:**  
- Perceived slow performance
- Poor user experience
- Layout shift on load

**Recommendation:**  
Create skeleton components matching final content layout for all major pages.

**Files/Paths:**
```
src/components/ui/skeletons/* (new directory)
src/pages/dashboard/StudentDashboard.tsx
src/pages/teacher/TeacherDashboard.tsx
```

**Next Steps:**
1. Design skeleton patterns
2. Create reusable skeleton components
3. Add to all loading states
4. Measure perceived performance

---

### TASK-042: Standardize Date Formatting
**Priority:** 🟠 Medium  
**Labels:** #phase3 #priority-medium #frontend #ux-ui

**Issue:**  
Dates displayed in multiple formats: `MM/DD/YYYY`, `YYYY-MM-DD`, relative time, full timestamps.

**Impact:**  
- Confusing for international users
- Inconsistent UX
- Hard to sort/compare

**Recommendation:**  
Create `formatDate` utility with consistent format options, use `date-fns` everywhere.

**Files/Paths:**
```
src/lib/dateUtils.ts (new)
(Search for all date formatting)
```

**Next Steps:**
1. Audit all date displays
2. Define standard formats
3. Create utility functions
4. Replace all custom formatting

---

### TASK-043: Implement Keyboard Navigation for Modals
**Priority:** 🟠 Medium  
**Labels:** #phase3 #priority-medium #frontend #ux-ui

**Issue:**  
Many modals lack proper keyboard navigation (Tab, Escape, Enter).

**Impact:**  
- Poor accessibility
- Keyboard users frustrated
- WCAG compliance failure

**Recommendation:**  
Add focus trap, Escape to close, Enter to submit for all modal components.

**Files/Paths:**
```
src/components/ui/dialog.tsx
src/components/teacher/CreateClassModal.tsx
src/components/teacher/GradingModal.tsx
(All modal components)
```

**Next Steps:**
1. Audit modal keyboard support
2. Implement focus management
3. Add keyboard shortcuts
4. Test with keyboard only

---

### TASK-044: Create Consistent Icon Usage Guidelines
**Priority:** 🟠 Medium  
**Labels:** #phase3 #priority-medium #frontend #ux-ui

**Issue:**  
Same actions use different icons across the app (edit, delete, view).

**Impact:**  
- Visual inconsistency
- User confusion
- Steeper learning curve

**Recommendation:**  
Document icon standards, create icon component library with semantic naming.

**Files/Paths:**
```
src/components/ui/icons/* (new directory)
DESIGN_SYSTEM.md (new)
```

**Next Steps:**
1. Audit icon usage
2. Define standard icons per action
3. Create icon component library
4. Update all icon usage

---

### TASK-045: Refactor Long Component Files
**Priority:** 🟠 Medium  
**Labels:** #phase3 #priority-medium #frontend

**Issue:**  
Several components exceed 500 lines (TeacherDashboard, ModularLessonView, SimpleGradebook).

**Impact:**  
- Hard to understand
- Difficult to test
- Merge conflicts

**Recommendation:**  
Split into smaller sub-components, extract logic to custom hooks.

**Files/Paths:**
```
src/pages/teacher/TeacherDashboard.tsx (900+ lines)
src/components/lesson/ModularLessonView.tsx (700+ lines)
src/components/teacher/SimpleGradebook.tsx (600+ lines)
```

**Next Steps:**
1. Identify component responsibilities
2. Extract sub-components
3. Move logic to hooks
4. Add component tests

---

### TASK-046: Add Focus Indicators for Keyboard Navigation
**Priority:** 🟠 Medium  
**Labels:** #phase3 #priority-medium #frontend #ux-ui

**Issue:**  
Custom focus styles removed for aesthetic reasons, keyboard navigation invisible.

**Impact:**  
- Keyboard users lost
- Accessibility failure
- WCAG 2.1 violation

**Recommendation:**  
Restore visible focus indicators, use `:focus-visible` for keyboard-only focus styling.

**Files/Paths:**
```
src/index.css
tailwind.config.ts
```

**Next Steps:**
1. Review focus indicator removal
2. Design keyboard-friendly focus styles
3. Apply globally via Tailwind
4. Test keyboard navigation

---

### TASK-047: Standardize API Error Handling
**Priority:** 🟠 Medium  
**Labels:** #phase3 #priority-medium #backend #frontend

**Issue:**  
Different error shapes returned from edge functions, inconsistent frontend handling.

**Impact:**  
- Generic error messages
- Hard to debug
- Poor user feedback

**Recommendation:**  
Create standard error response format, centralize error handling in API client.

**Files/Paths:**
```
src/integrations/supabase/functions.ts
src/lib/apiClient.ts (new)
supabase/functions/_shared/errors.ts (new)
```

**Next Steps:**
1. Define error response schema
2. Update all edge functions
3. Create error handling utility
4. Add user-friendly error messages

---

### TASK-048: Implement Breadcrumb Navigation
**Priority:** 🟠 Medium  
**Labels:** #phase3 #priority-medium #frontend #ux-ui

**Issue:**  
No breadcrumb navigation, hard to understand location in deep hierarchies.

**Impact:**  
- Users get lost
- Hard to navigate back
- Poor UX in nested views

**Recommendation:**  
Add breadcrumbs component to all dashboard pages, auto-generate from route structure.

**Files/Paths:**
```
src/components/common/Breadcrumbs.tsx (exists but underused)
src/pages/dashboard/* (add breadcrumbs)
```

**Next Steps:**
1. Design breadcrumb component
2. Add to layout components
3. Implement route-based generation
4. Test navigation flow

---

### TASK-049: Add Empty State Components
**Priority:** 🟠 Medium  
**Labels:** #phase3 #priority-medium #frontend #ux-ui

**Issue:**  
Many list views show generic "No items" text instead of helpful empty states.

**Impact:**  
- Unclear next steps
- User confusion
- Lost opportunities for engagement

**Recommendation:**  
Create empty state components with helpful messages, CTAs, and illustrations.

**Files/Paths:**
```
src/components/common/EmptyState.tsx (new)
src/components/teacher/ClassesGrid.tsx
src/components/parent/EmptyStudentsState.tsx (good example)
```

**Next Steps:**
1. Design empty state patterns
2. Create reusable component
3. Add to all list views
4. Include helpful CTAs

---

### TASK-050: Implement Pagination for All Large Lists
**Priority:** 🟠 Medium  
**Labels:** #phase3 #priority-medium #frontend #backend

**Issue:**  
Many lists fetch all records without pagination (activity logs, students, assignments).

**Impact:**  
- Slow page loads
- High memory usage
- Database strain

**Recommendation:**  
Add cursor-based pagination to all lists with 20+ items.

**Files/Paths:**
```
src/components/admin/ActivityLogTable.tsx
src/components/teacher/RosterManagement.tsx
src/hooks/useActivityLog.ts
```

**Next Steps:**
1. Identify all large lists
2. Implement pagination queries
3. Add pagination UI components
4. Test with large datasets

---

### TASK-051: Add Search Functionality to Lists
**Priority:** 🟠 Medium  
**Labels:** #phase3 #priority-medium #frontend #ux-ui

**Issue:**  
No search in large lists (students, classes, assignments), must scroll to find items.

**Impact:**  
- Time wasted searching
- Poor power user experience
- Frustration with large datasets

**Recommendation:**  
Add search input with client-side filtering or backend search endpoint.

**Files/Paths:**
```
src/components/teacher/RosterManagement.tsx
src/components/teacher/ClassesGrid.tsx
src/components/navigation/GlobalSearch.tsx (good example)
```

**Next Steps:**
1. Add search inputs to major lists
2. Implement client-side filtering
3. Add debounced search for large lists
4. Highlight search matches

---

### TASK-052: Create Consistent Card Components
**Priority:** 🟠 Medium  
**Labels:** #phase3 #priority-medium #frontend #ux-ui

**Issue:**  
Many custom card implementations instead of using shared card component.

**Impact:**  
- Visual inconsistency
- Duplicate code
- Hard to update styling

**Recommendation:**  
Consolidate into card variants in design system, update all card usage.

**Files/Paths:**
```
src/components/ui/card.tsx
src/components/content/ContentCard.tsx
src/components/course/LessonCard.tsx
```

**Next Steps:**
1. Audit card usage patterns
2. Create card variants
3. Migrate custom cards
4. Document card guidelines

---

### TASK-053: Add Print Stylesheets
**Priority:** 🟠 Medium  
**Labels:** #phase3 #priority-medium #frontend #ux-ui

**Issue:**  
No print styles, pages print with navigation, sidebars, and broken layouts.

**Impact:**  
- Unusable printouts
- Teacher frustration
- Wasted paper

**Recommendation:**  
Add print-specific CSS, hide navigation, optimize for paper format.

**Files/Paths:**
```
src/index.css (add print media query)
src/components/teacher/SimpleGradebook.tsx
src/pages/LessonPage.tsx
```

**Next Steps:**
1. Identify print-friendly pages
2. Create print stylesheet
3. Test print layouts
4. Add "Print" buttons where helpful

---

### TASK-054: Implement Undo/Redo for Grading
**Priority:** 🟠 Medium  
**Labels:** #phase3 #priority-medium #frontend #ux-ui

**Issue:**  
No undo functionality for grade changes, mistakes require manual re-entry.

**Impact:**  
- Accidental grade changes
- Teacher frustration
- Support tickets

**Recommendation:**  
Add undo/redo stack for grade modifications with Ctrl+Z support.

**Files/Paths:**
```
src/hooks/useUndoRedo.ts (new)
src/components/teacher/SimpleGradebook.tsx
src/hooks/useAssignmentGrading.ts
```

**Next Steps:**
1. Design undo state management
2. Implement undo/redo hook
3. Add keyboard shortcuts
4. Show undo toast notification

---

### TASK-055: Add Confirmation Dialogs for Destructive Actions
**Priority:** 🟠 Medium  
**Labels:** #phase3 #priority-medium #frontend #ux-ui

**Issue:**  
Some destructive actions (delete class, remove student) lack confirmation dialogs.

**Impact:**  
- Accidental deletions
- Data loss
- User frustration

**Recommendation:**  
Add confirmation modals for all destructive actions with clear warnings.

**Files/Paths:**
```
src/components/teacher/RosterManagement.tsx
src/components/admin/ClassManagement.tsx
src/components/ui/alert-dialog.tsx (use this)
```

**Next Steps:**
1. Audit destructive actions
2. Add confirmation dialogs
3. Include undo option where possible
4. Test user flow

---

### TASK-056: Implement Bulk Actions for Student Management
**Priority:** 🟠 Medium  
**Labels:** #phase3 #priority-medium #frontend #ux-ui

**Issue:**  
No way to perform bulk actions (move students, send messages, assign grades) efficiently.

**Impact:**  
- Tedious manual work
- Teacher time wasted
- Poor power user experience

**Recommendation:**  
Add checkbox selection with bulk action toolbar for student lists.

**Files/Paths:**
```
src/components/teacher/RosterManagement.tsx
src/components/teacher/SimpleGradebook.tsx
```

**Next Steps:**
1. Design bulk selection UI
2. Implement selection state
3. Create bulk action menu
4. Add confirmation for bulk actions

---

### TASK-057: Add Export Functionality for Gradebook
**Priority:** 🟠 Medium  
**Labels:** #phase3 #priority-medium #frontend #ux-ui

**Issue:**  
No way to export grades to CSV/Excel for offline analysis or import to SIS.

**Impact:**  
- Manual data entry required
- Teacher frustration
- Integration difficulties

**Recommendation:**  
Add "Export to CSV" button with formatted grade data.

**Files/Paths:**
```
src/components/teacher/SimpleGradebook.tsx
src/lib/exportUtils.ts (new)
```

**Next Steps:**
1. Design export format
2. Implement CSV generation
3. Add export button
4. Test with various grade scenarios

---

### TASK-058: Implement Custom Sorting for Tables
**Priority:** 🟠 Medium  
**Labels:** #phase3 #priority-medium #frontend #ux-ui

**Issue:**  
Most tables lack sorting functionality, hard to analyze data.

**Impact:**  
- Hard to find information
- Manual sorting required
- Poor data analysis experience

**Recommendation:**  
Add sortable columns to all data tables with clear sort indicators.

**Files/Paths:**
```
src/components/ui/table.tsx
src/components/teacher/SimpleGradebook.tsx
src/components/admin/ActivityLogTable.tsx
```

**Next Steps:**
1. Add sorting state to tables
2. Implement sort icons
3. Add multi-column sorting
4. Persist sort preferences

---

### TASK-059: Add Recent Activity Indicators
**Priority:** 🟢 Low  
**Labels:** #phase3 #priority-low #frontend #ux-ui

**Issue:**  
No visual indicators for recently updated items or unread notifications.

**Impact:**  
- Hard to spot new content
- Lower engagement
- Missed important updates

**Recommendation:**  
Add badges, timestamps, and "new" indicators to relevant items.

**Files/Paths:**
```
src/components/teacher/ClassesGrid.tsx
src/components/NotificationBell.tsx
src/components/discussion/ThreadCard.tsx
```

**Next Steps:**
1. Design activity indicators
2. Implement "new" badges
3. Add relative timestamps
4. Update on real-time changes

---

### TASK-060: Implement Drag-and-Drop for Lesson Ordering
**Priority:** 🟢 Low  
**Labels:** #phase3 #priority-low #frontend #ux-ui

**Issue:**  
Lesson reordering requires manual order_index editing.

**Impact:**  
- Clunky reordering experience
- Teacher frustration
- Error-prone

**Recommendation:**  
Add drag-and-drop with visual feedback using `react-beautiful-dnd`.

**Files/Paths:**
```
src/components/build-class/LessonsForm.tsx
src/components/course/LessonCard.tsx
```

**Next Steps:**
1. Install react-beautiful-dnd
2. Implement drag-and-drop
3. Update order_index on drop
4. Add visual drag indicators

---

### TASK-061: Add Collapsible Sections for Long Forms
**Priority:** 🟢 Low  
**Labels:** #phase3 #priority-low #frontend #ux-ui

**Issue:**  
Long forms (build class, lesson builder) show all fields at once, overwhelming.

**Impact:**  
- Cognitive overload
- Harder to complete forms
- Poor mobile experience

**Recommendation:**  
Use accordion/collapsible sections to progressively reveal form fields.

**Files/Paths:**
```
src/components/build-class/ClassDetailsForm.tsx
src/components/lesson-builder/LessonDetailsForm.tsx
src/components/ui/accordion.tsx
```

**Next Steps:**
1. Group related form fields
2. Implement collapsible sections
3. Save expansion state
4. Add progress indicator

---

### TASK-062: Implement Auto-Save for Draft Content
**Priority:** 🟢 Low  
**Labels:** #phase3 #priority-low #frontend #ux-ui

**Issue:**  
No auto-save for long-form content (assignments, lessons, messages), work can be lost.

**Impact:**  
- Lost work on crash/navigate away
- User frustration
- Decreased trust

**Recommendation:**  
Add auto-save with debounce for all content editors, show "Saved" indicator.

**Files/Paths:**
```
src/hooks/useAutoSave.ts (new)
src/components/teacher/AssignmentWizard.tsx
src/components/build-class/LessonsForm.tsx
```

**Next Steps:**
1. Create auto-save hook
2. Add to all editors
3. Store drafts in localStorage or DB
4. Add save indicator

---

### TASK-063: Add Keyboard Shortcuts for Common Actions
**Priority:** 🟢 Low  
**Labels:** #phase3 #priority-low #frontend #ux-ui

**Issue:**  
No keyboard shortcuts for power users (save, submit, navigate).

**Impact:**  
- Slower workflows
- Mouse-dependent
- Poor power user experience

**Recommendation:**  
Add keyboard shortcuts for common actions, display shortcut hints in UI.

**Files/Paths:**
```
src/hooks/useKeyboardShortcuts.ts (new)
src/pages/teacher/TeacherDashboard.tsx
src/components/teacher/GradingModal.tsx
```

**Next Steps:**
1. Define shortcut standards
2. Implement shortcut system
3. Add to key pages
4. Show shortcut hints in tooltips

---

## Phase 4: Polish
**Focus:** Documentation, visual consistency, low-priority cleanups

### Progress Tracker
- [ ] 12 Low Priority Tasks
- [ ] Total: 12 Tasks

---

### TASK-064: Update All README Documentation
**Priority:** 🟢 Low  
**Labels:** #phase4 #priority-low #documentation

**Issue:**  
Multiple README files with outdated information, some contradict each other.

**Impact:**  
- Developer onboarding confusion
- Incorrect setup instructions
- Maintenance burden

**Recommendation:**  
Consolidate READMEs, update with current architecture, add troubleshooting section.

**Files/Paths:**
```
README.md
README-DEV.md
DEVELOPER_DOCUMENTATION.md
STORYBOOK.md
```

**Next Steps:**
1. Audit all documentation
2. Remove outdated info
3. Update setup instructions
4. Add architecture overview

---

### TASK-065: Document RLS Policies Comprehensively
**Priority:** 🟢 Low  
**Labels:** #phase4 #priority-low #documentation #security

**Issue:**  
RLS policies documented across multiple files, no single source of truth.

**Impact:**  
- Hard to understand access control
- Security review difficult
- Policy changes risky

**Recommendation:**  
Create comprehensive `SECURITY_RLS_POLICIES.md` with all policies explained.

**Files/Paths:**
```
SECURITY_RLS_POLICIES.md (new)
RBAC_IMPLEMENTATION.md
RBAC_VERIFICATION.md
SECURITY_IMPLEMENTATION.md
```

**Next Steps:**
1. List all tables with RLS
2. Document each policy's purpose
3. Create access matrix
4. Add policy testing guide

---

### TASK-066: Create Component Style Guide
**Priority:** 🟢 Low  
**Labels:** #phase4 #priority-low #documentation #ux-ui

**Issue:**  
No design system documentation, designers and developers misaligned.

**Impact:**  
- Inconsistent components
- Design drift
- Slower development

**Recommendation:**  
Create Storybook stories for all shared components, document usage guidelines.

**Files/Paths:**
```
DESIGN_SYSTEM.md (new)
src/components/ui/*.stories.tsx (expand)
```

**Next Steps:**
1. Document design tokens
2. Create component stories
3. Add usage examples
4. Include accessibility notes

---

### TASK-067: Add Comprehensive Unit Tests
**Priority:** 🟢 Low  
**Labels:** #phase4 #priority-low #frontend #backend

**Issue:**  
Limited test coverage, only a few components have tests.

**Impact:**  
- Regression risks
- Harder refactoring
- Lower code confidence

**Recommendation:**  
Aim for 70% coverage, prioritize business logic hooks and critical components.

**Files/Paths:**
```
src/hooks/__tests__/* (expand)
src/components/__tests__/* (expand)
vitest.config.ts
```

**Next Steps:**
1. Measure current coverage
2. Identify critical paths
3. Write tests for high-value code
4. Add CI test enforcement

---

### TASK-068: Implement Proper Logging Infrastructure
**Priority:** 🟢 Low  
**Labels:** #phase4 #priority-low #backend #security

**Issue:**  
Console.log used for debugging, no structured logging or error tracking.

**Impact:**  
- Hard to debug production issues
- No error aggregation
- Poor observability

**Recommendation:**  
Integrate logging service (Sentry, LogRocket), implement structured logging.

**Files/Paths:**
```
src/lib/logger.ts (new)
(Replace all console.log calls)
```

**Next Steps:**
1. Choose logging provider
2. Integrate SDK
3. Replace console.log calls
4. Set up error alerting

---

### TASK-069: Add Changelog and Release Notes
**Priority:** 🟢 Low  
**Labels:** #phase4 #priority-low #documentation

**Issue:**  
No changelog tracking features, fixes, or breaking changes.

**Impact:**  
- Users unaware of new features
- Hard to track version history
- Poor communication

**Recommendation:**  
Maintain CHANGELOG.md following Keep a Changelog format.

**Files/Paths:**
```
CHANGELOG.md (new)
```

**Next Steps:**
1. Create changelog format
2. Document current version
3. Commit to maintaining it
4. Automate from git commits

---

### TASK-070: Optimize SVG Icons
**Priority:** 🟢 Low  
**Labels:** #phase4 #priority-low #performance #frontend

**Issue:**  
Some custom SVG icons not optimized, include unused paths and metadata.

**Impact:**  
- Slightly larger bundle
- Minor performance hit

**Recommendation:**  
Run SVGs through SVGO, remove unused attributes, use icon components.

**Files/Paths:**
```
src/assets/*.svg (if any)
public/*.svg
```

**Next Steps:**
1. Audit SVG usage
2. Optimize with SVGO
3. Convert to React components
4. Remove unused SVGs

---

### TASK-071: Add Favicons and App Icons
**Priority:** 🟢 Low  
**Labels:** #phase4 #priority-low #frontend #ux-ui

**Issue:**  
Generic favicon, no app icons for PWA or mobile bookmarks.

**Impact:**  
- Unprofessional appearance
- Poor branding
- Missed PWA opportunity

**Recommendation:**  
Design and add favicon set, app icons, and manifest for PWA.

**Files/Paths:**
```
public/favicon.ico
public/manifest.json (new)
index.html
```

**Next Steps:**
1. Design favicon/app icon
2. Generate all sizes
3. Add to public folder
4. Update manifest

---

### TASK-072: Improve 404 and Error Pages
**Priority:** 🟢 Low  
**Labels:** #phase4 #priority-low #frontend #ux-ui

**Issue:**  
Generic 404 page, no helpful navigation or search.

**Impact:**  
- Dead end for users
- Lost engagement
- Missed recovery opportunity

**Recommendation:**  
Design helpful 404/error pages with search, popular links, and support contact.

**Files/Paths:**
```
src/pages/NotFound.tsx
src/components/ui/ErrorBoundary.tsx
```

**Next Steps:**
1. Design error page layouts
2. Add helpful links
3. Include search widget
4. Track error page visits

---

### TASK-073: Add Animation and Micro-interactions
**Priority:** 🟢 Low  
**Labels:** #phase4 #priority-low #frontend #ux-ui

**Issue:**  
Few transitions or animations, app feels static.

**Impact:**  
- Less engaging experience
- Feels less polished
- Missed delight opportunities

**Recommendation:**  
Add subtle animations using Framer Motion for route transitions, modals, toasts.

**Files/Paths:**
```
src/lib/animations.ts (new)
src/components/ui/* (add transitions)
```

**Next Steps:**
1. Audit animation opportunities
2. Design animation library
3. Add to key interactions
4. Test performance impact

---

### TASK-074: Implement Theme Customization
**Priority:** 🟢 Low  
**Labels:** #phase4 #priority-low #frontend #ux-ui

**Issue:**  
Single theme only, no customization for institutions or users.

**Impact:**  
- Less appealing to some users
- Missed white-label opportunity
- No user preference support

**Recommendation:**  
Add theme customization for colors, dark mode improvements, institution branding.

**Files/Paths:**
```
src/contexts/ThemeContext.tsx (new)
tailwind.config.ts
src/index.css
```

**Next Steps:**
1. Design theme customization API
2. Implement theme switching
3. Add color picker for admin
4. Support institution branding

---

### TASK-075: Add Analytics and User Tracking
**Priority:** 🟢 Low  
**Labels:** #phase4 #priority-low #frontend #backend

**Issue:**  
No usage analytics, can't measure feature adoption or user behavior.

**Impact:**  
- Blind to user needs
- Can't prioritize features
- No data-driven decisions

**Recommendation:**  
Integrate analytics (PostHog, Mixpanel) with event tracking for key actions.

**Files/Paths:**
```
src/lib/analytics.ts (new)
src/components/* (add tracking)
```

**Next Steps:**
1. Choose analytics provider
2. Define key events to track
3. Implement tracking
4. Create dashboards

---

## Role Legend

### Frontend (#frontend)
**Responsibilities:**
- UI components and layouts
- React component architecture
- Client-side routing
- Form validation and UX flows
- Accessibility implementation
- Responsive design

**Skills Required:**
- React, TypeScript, Tailwind CSS
- Accessibility (WCAG, ARIA)
- State management
- Component design patterns

---

### Backend (#backend)
**Responsibilities:**
- Supabase queries and optimization
- React Query caching strategies
- API integration
- Database schema design
- Edge function logic
- Performance optimization

**Skills Required:**
- Supabase/PostgreSQL
- React Query
- SQL optimization
- API design

---

### Security (#security)
**Responsibilities:**
- Authentication flows (MFA, OAuth)
- Authorization and RLS policies
- Session management
- Input validation and sanitization
- Security audits
- Vulnerability patching

**Skills Required:**
- Security best practices
- Supabase RLS
- Auth systems
- Threat modeling

---

### Performance (#performance)
**Responsibilities:**
- Bundle optimization
- Code splitting and lazy loading
- Image and asset optimization
- Database query optimization
- Caching strategies
- Performance monitoring

**Skills Required:**
- Web performance metrics
- Build tools (Vite)
- Performance profiling
- Optimization techniques

---

### UX/UI (#ux-ui)
**Responsibilities:**
- User flows and navigation
- Interaction design
- Visual consistency
- Loading and empty states
- Error messaging
- Accessibility UX

**Skills Required:**
- UX design principles
- User research
- Interaction design
- Accessibility standards

---

### Documentation (#documentation)
**Responsibilities:**
- Technical documentation
- API documentation
- Architecture diagrams
- Onboarding guides
- Security policy documentation
- Component usage guides

**Skills Required:**
- Technical writing
- Markdown
- Diagramming tools
- Clear communication

---

## Progress Summary

### By Phase
| Phase | Total Tasks | Completed | Remaining | Progress |
|-------|------------|-----------|-----------|----------|
| Phase 1 | 20 | 0 | 20 | ░░░░░░░░░░ 0% |
| Phase 2 | 15 | 0 | 15 | ░░░░░░░░░░ 0% |
| Phase 3 | 23 | 0 | 23 | ░░░░░░░░░░ 0% |
| Phase 4 | 12 | 0 | 12 | ░░░░░░░░░░ 0% |
| **Total** | **70** | **0** | **70** | ░░░░░░░░░░ **0%** |

### By Priority
| Priority | Count | Percentage |
|----------|-------|------------|
| 🔴 Critical | 12 | 17% |
| 🟡 High | 8 | 11% |
| 🟠 Medium | 38 | 54% |
| 🟢 Low | 12 | 17% |

### By Role
| Role | Task Count |
|------|------------|
| #frontend | 45 |
| #backend | 22 |
| #security | 8 |
| #performance | 15 |
| #ux-ui | 35 |
| #documentation | 8 |

*(Note: Tasks may have multiple role tags)*

---

## Next Steps

### Immediate Actions (Week 1)
1. Review and validate all Critical priority tasks
2. Assign Phase 1 tasks to team members
3. Set up project tracking board (GitHub Projects/Jira)
4. Schedule kick-off meeting for audit review

### Short-term Goals (Weeks 2-4)
1. Complete all Critical and High priority tasks
2. Begin Phase 2 optimization work
3. Weekly progress reviews
4. Update task board daily

### Long-term Vision (Months 2-3)
1. Complete Phase 3 refinement
2. Implement Phase 4 polish
3. Conduct user testing
4. Plan next iteration

---

## Task Assignment Template

When assigning tasks, use this format:

```markdown
### [TASK-XXX] Task Title
- **Assigned To:** @username
- **Status:** Not Started | In Progress | Blocked | In Review | Complete
- **Started:** YYYY-MM-DD
- **Target Completion:** YYYY-MM-DD
- **Actual Completion:** YYYY-MM-DD
- **Blockers:** List any blockers
- **Notes:** Additional context or updates
```

---

## Important Reminders

### ⚠️ Read-Only Mode
This audit is **non-destructive**. No code modifications should be made automatically. All changes must be:
1. Reviewed by team lead
2. Approved by stakeholders
3. Tested in staging environment
4. Deployed incrementally

### 🚫 Exclusions
The following areas are **excluded** from cleanup:
- `/components/accessibility` - Core accessibility features
- `/components/translation` - Translation and i18n system
- `/modules/AI` - AI/ML functionality (if exists)
- `/features/adaptive-learning` - Adaptive learning engine

These systems are critical to TailorEDU's mission and should not be modified without explicit approval.

### 📊 Metrics to Track
- Task completion rate by phase
- Bundle size reduction
- Page load time improvements
- Bug count reduction
- User satisfaction scores
- Developer onboarding time

---

**Document Version:** 1.0  
**Last Updated:** October 18, 2025  
**Maintained By:** TailorEDU Development Team  
**Review Cycle:** Weekly during active development

---

*This task board is a living document. Update task statuses, add notes, and adjust priorities as needed. For questions or clarifications, consult the [TailorEDU Site Audit Report](#) or reach out to the development team lead.*
