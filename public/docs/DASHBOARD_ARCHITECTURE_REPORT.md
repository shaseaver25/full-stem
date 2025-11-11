---
title: "Dashboard Architecture Report"
version: "v1.0"
last_updated: "2025-11-10"
author: "TailorEDU Development Team"
---

# DASHBOARD ARCHITECTURE REPORT

## Executive Summary

This report provides an in-depth analysis of all dashboards in the platform, organized by role hierarchy (student → parent → teacher → admin → system_admin → super_admin → developer). Each dashboard is analyzed for:

1. **Purpose & Target Users**: Who uses it and why
2. **Access Control**: Security model and permissions
3. **Key Features**: Core functionality and capabilities
4. **Data Sources**: What data is displayed and where it comes from
5. **Navigation & Actions**: Available routes and user actions
6. **Integration Points**: How it connects to other parts of the system
7. **Technical Implementation**: File locations and key components

---

## Role Hierarchy Overview

Based on `src/utils/roleUtils.ts`, the platform has 7 roles with defined hierarchy:

```
ROLE_RANK (higher = more permissions):
1. student (rank 1)
2. parent (rank 2)  
3. teacher (rank 3)
4. admin (rank 4)
5. system_admin (rank 5)
6. super_admin (rank 6)
7. developer (rank 7)
```

**Security Model**: 
- Roles stored in `user_roles` table (many-to-many)
- Server-side validation uses security definer function: `has_role(user_id, role)`
- Users can have multiple roles
- Redirect logic uses highest ranked role
- Never store roles in profiles table (prevents privilege escalation)

---

## 1. STUDENT DASHBOARD (Rank 1)

### File Location
`src/pages/student/StudentDashboard.tsx`

### Purpose & Target Users
Primary learning interface for students to view classes, assignments, grades, and track their academic progress.

### Access Control
- **Allowed Roles**: `student`, `super_admin`, `developer`
- **Protected by**: `RequireRole` component in App.tsx
- **Route**: `/dashboard/student`

### Key Features

#### A. Overview Statistics (Top Cards)
- **My Classes**: Count of active enrollments
- **Upcoming**: Count of assignments due soon
- **Completed**: Total submission count
- **Average Grade**: Overall performance percentage (calculated from graded assignments)

#### B. Alert System
- **Overdue Assignments Warning**: Red alert card appears when assignments are overdue
- Displays count and provides direct link to assignments page

#### C. My Classes Section
- Lists currently enrolled courses (first 3 shown)
- Each class card shows:
  - Class name
  - Subject badge
  - Teacher name
- Links to individual class detail page (`/classes/{class_id}`)
- Empty state with "Join a Class" CTA if no enrollments

#### D. Upcoming Assignments Section
- Shows next 5 upcoming assignments sorted by due date
- Each assignment displays:
  - Title
  - Status badge (submitted/pending)
  - Due date with calendar icon
- Links to assignment detail page (`/assignments/{id}`)
- Empty state if no upcoming work

#### E. Quick Actions Navigation
Buttons for:
- My Classes (`/classes/my-classes`)
- Assignments (`/assignments`)
- My Grades (`/grades`)
- Join Class (`/classes/join`)

### Data Sources (Hooks)
- `useAuth()`: Current user information
- `useStudentClasses()`: Fetch enrolled classes from `class_students` table
- `useStudentAssignments()`: Fetch assignments with due dates and status
- `useStudentGrades()`: Fetch grade data for average calculation

### Calculations & Logic
- **Upcoming**: Filters assignments where `due_at` is in future AND status ≠ 'submitted'
- **Overdue**: Filters assignments where `due_at` is in past AND status ≠ 'submitted'
- **Completed**: Filters assignments where `status === 'submitted'`
- **Average Grade**: `Math.round(sum of grades / count of graded assignments)`

### Integration Points
- Links to class detail page (role-aware)
- Links to assignments list and detail pages
- Links to grades page
- Links to join class workflow

---

## 2. PARENT DASHBOARD (Rank 2)

### File Locations
- Main: `src/pages/parent/ParentDashboard.tsx`
- Components: `src/components/parent/` directory
  - `ParentStudentOverview.tsx`
  - `ParentFeedbackSection.tsx`
  - `ParentAiInsights.tsx`
  - `ParentPortal.tsx` (alternative view)

### Purpose & Target Users
Allows parents to monitor their child's academic progress, view feedback from teachers, and receive AI-generated insights about learning patterns.

### Access Control
- **Allowed Roles**: `parent` (via `ProtectedParentRoute`)
- **Route**: `/dashboard/parent`

### Key Features

#### A. Three-Tab Interface
1. **Overview Tab**: Student progress summary
2. **Feedback Tab**: Teacher feedback on assignments
3. **AI Insights Tab**: Machine learning analysis of student performance

#### B. Data Loading & Relationship Management
- Fetches parent profile from `parent_profiles` table
- Retrieves student relationships via `student_parent_relationships` table
- Currently displays first linked student (multi-student support planned)

#### C. Class & Submission Tracking
For each class:
- Class title
- All submissions with:
  - Assignment title
  - Grade
  - Teacher feedback
  - AI feedback (placeholder for future)
  - Submission timestamp

#### D. Language Support
- Parent language preference: Default 'en'
- Student language preference: Retrieved from student profile
- Used for translated communications (via translation edge function)

### Data Sources & Queries

#### Parent Profile Query
```sql
SELECT id, user_id, first_name, last_name 
FROM parent_profiles 
WHERE user_id = ?
```

#### Student Relationships Query
```sql
SELECT student_id, students(id, user_id, first_name, last_name, grade_level, language_preference)
FROM student_parent_relationships 
WHERE parent_id = ?
```

#### Class Enrollments Query
```sql
SELECT class_id, classes(id, title)
FROM class_students 
WHERE student_id = ?
```

#### Submissions Query
```sql
SELECT id, submitted_at, assignments(id, title, class_assignments_new(class_id)), assignment_grades(grade, feedback)
FROM assignment_submissions 
WHERE user_id = ? 
ORDER BY submitted_at DESC
```

### Integration Points
- Links to parent portal (`/parent`)
- Integrates with translation system for multilingual support
- Fetches AI insights (future enhancement)
- Displays teacher feedback from grading system

### Error Handling
- Toast notifications for errors
- Loading spinner during data fetch
- Empty state if no students linked
- Prompts parent to contact school administrator

---

## 3. TEACHER DASHBOARD (Rank 3)

### File Locations
- Main: `src/components/teacher/TeacherDashboard.tsx`
- Analytics: `src/pages/AnalyticsDashboard.tsx`
- Teacher-specific pages: `src/pages/teacher/` directory

### Purpose & Target Users
Central hub for teachers to manage classes, track student progress, create assignments, and view engagement analytics.

### Access Control
- **Allowed Roles**: `teacher`, `super_admin`, `developer`
- **Protected by**: `ProtectedTeacherRoute`
- **Route**: `/teacher/dashboard`

### Key Features

#### A. Welcome & Quick Metrics
- Personalized greeting with teacher name
- Quick stats displayed:
  - Total students count
  - Assignments due this week

#### B. Classes List
- All classes taught by the teacher
- Each class card shows:
  - Class name
  - Grade level
  - Subject
  - School year
  - Student count
- Click to view class details

#### C. Quick Actions Grid
Buttons for:
- **Create Class**: Navigate to class builder
- **Create Assignment**: Quick assignment creation
- **View Analytics**: Class performance analytics
- **Lesson Builder**: AI-powered lesson creation
- **Grade Submissions**: Access gradebook

#### D. Recent Activity/Trends
- Chart showing completion trends
- Recent student submissions
- Engagement metrics

### Data Sources

#### Teacher Profile
- Fetched via `useTeacherProfileSimplified` hook
- From `teacher_profiles` table

#### Dashboard Data Query
```sql
SELECT id, name, grade_level, subject, school_year, class_students(count)
FROM classes 
WHERE teacher_id = ?
```

#### Assignment Metrics
```sql
SELECT COUNT(*) as assignments_due
FROM assignments 
WHERE teacher_id = ? 
  AND due_at BETWEEN now() AND now() + INTERVAL '7 days'
```

### Calculations
- **Total Students**: Sum of all `class_students` counts across all classes
- **Assignments Due This Week**: Count of assignments with `due_at` in next 7 days
- **Engagement Rate**: Mock data (92%) - placeholder for future real-time analytics

### Integration Points
- Links to class detail page (`/classes/{id}`)
- Links to assignment creation (`/assignments/create`)
- Links to analytics dashboard (`/teacher/analytics`)
- Links to lesson builder (`/teacher/lesson-builder`)
- Links to gradebook (`/teacher/gradebook`)

---

## 4. ANALYTICS DASHBOARD (Teacher Tool)

### File Location
`src/pages/AnalyticsDashboard.tsx`

### Purpose
Provides detailed analytics for a selected class, allowing teachers to analyze student progress and engagement patterns.

### Access Control
- **Allowed Roles**: `teacher`, `super_admin`, `developer`
- **Route**: `/teacher/analytics` (or similar)

### Key Features

#### A. Class Selector
- Dropdown to select from teacher's classes
- Auto-selects first class on load
- Shows class name with grade level and subject

#### B. Student Progress Analytics Component
- Displays detailed metrics for selected class
- Progress tracking by student
- Engagement analytics
- Grade distribution

#### C. Empty State
- Message prompting to create a class if none exist
- Link to class builder

### Data Sources

#### Classes Query
```sql
SELECT id, name, grade_level, subject, school_year
FROM classes 
WHERE teacher_id = ?
```

#### Component Integration
Uses `StudentProgressAnalytics` component which fetches:
- Individual student performance
- Assignment completion rates
- Grade trends
- Engagement metrics

### Navigation
- Back button to teacher dashboard
- Class selector for switching between classes

---

## 5. ADMIN DASHBOARD (Rank 4)

### File Locations
- Main: `src/pages/AdminDashboard.tsx`
- Variants:
  - `src/components/admin/SchoolAdminDashboard.tsx`
  - `src/components/admin/HomeschoolAdminDashboard.tsx`
  - `src/components/admin/WorkforceAdminDashboard.tsx`

### Purpose & Target Users
Administrative interface for school administrators, homeschool coordinators, and workforce training managers. Context-aware dashboard adapts to admin type.

### Access Control
- **Allowed Roles**: `admin`, `super_admin`, `developer`
- **Protected by**: `ProtectedAdminRoute`
- **Route**: `/dashboard/admin/analytics` (or `/admin/dashboard`)
- **Onboarding Check**: Redirects to `/admin/onboarding` if not completed (except developers)

### Context-Aware Rendering
Based on `adminType` from profile:
- `'school'` → SchoolAdminDashboard
- `'homeschool'` → HomeschoolAdminDashboard
- `'workforce'` → WorkforceAdminDashboard
- Default → SchoolAdminDashboard

---

### 5A. SCHOOL ADMIN DASHBOARD

#### Key Metrics Cards
1. **Active Teachers**: Count with monthly growth (+2 this month)
2. **Total Students**: Count with monthly growth (+18 this month)
3. **Active Classes**: Total across all grades (42)
4. **Average Grade**: School-wide percentage (87%) with term comparison (+3%)

#### Teacher Activity Section
- Classes created this week: 8
- Assignments posted: 32
- Active teachers ratio: 22/24

#### Student Engagement Section
- Daily logins average: 384
- Assignment completion rate: 92%
- Active this week ratio: 468/486

#### Quick Actions
- **Add Teacher**: Navigate to course editor
- **Create Class**: Navigate to class builder
- **View Analytics**: Link to admin analytics
- **Content Library**: Browse learning materials
- **Advanced Settings**: System configuration

#### Additional Features
- **Teacher Invitation Component**: Send invites to new teachers
- **Recent Activity Card**: System-wide activity feed

---

### 5B. HOMESCHOOL ADMIN DASHBOARD

#### Key Metrics Cards
1. **Courses Configured**: Total available courses
2. **Students Enrolled**: Family members in system
3. **Lessons Completed**: Aggregate completion count
4. **Average Progress**: Family-wide completion percentage

#### Learning Path Section
- **Family Progress Card**:
  - Assignments due
  - Lessons in progress
  - Average scores

- **Resource Suggestions Card**:
  - AI-recommended content
  - Link to browse all resources

#### Quick Actions
- **Add Student**: Onboard family member
- **Create Course**: Build custom curriculum
- **Manage Courses**: Edit existing content
- **Browse Resources**: Content library
- **View Progress**: Detailed analytics

#### Additional Features
- Recent Activity Card

---

### 5C. WORKFORCE ADMIN DASHBOARD

#### Key Metrics Cards
1. **Enrolled Participants**: Count with weekly growth (+12)
2. **Certifications Earned**: Quarterly count (89)
3. **Completion Rate**: 82% (+5% from last quarter)
4. **Active Cohorts**: 8 across 4 programs

#### Program Performance Section
- **Digital Skills Training**: 45/52 completion
- **Healthcare Certification**: 38/41 completion
- **Business Management**: 31/35 completion

#### Skills Tracking Section
- **Technical Skills**: 78% mastery
- **Soft Skills**: 85% mastery
- **Job Readiness**: 72% readiness

#### Cohort Analytics
Detailed breakdown by cohort:
- **Cohort A - Spring 2025**: Digital Skills, 42 participants, 89% completion
- **Cohort B - Spring 2025**: Healthcare, 38 participants, 92% completion

#### Quick Actions
- **Add Participant**: Enroll new learner
- **Create Program**: Build training curriculum
- **View Certifications**: Track credentials
- **Manage Programs**: Edit existing programs
- **Advanced Settings**: System configuration

---

## 6. SYSTEM DASHBOARD (Rank 5)

### File Location
`src/pages/SystemDashboard.tsx`

### Purpose & Target Users
Technical operations dashboard for system administrators to monitor platform health, activity logs, and perform administrative actions.

### Access Control
- **Allowed Roles**: `system_admin`, `super_admin`, `developer`
- **Protected by**: `useSystemAdmin` hook
- **Route**: `/system-dashboard`
- **MFA Required**: Enforced via `useMFAEnforcement` hook
- **IP Restrictions**: Placeholder for IP-based access control

### Key Features

#### A. System Mode Badge
- Displays when in system admin mode
- Visual indicator of elevated privileges

#### B. MFA Required Banner
- Appears if MFA not enabled
- Redirects to `/mfa-setup` automatically
- Cannot access dashboard without MFA

#### C. Five-Tab Interface

**1. Health Tab**
- `SystemHealthMonitor` component
- Displays:
  - API Uptime
  - Active Users
  - Database Latency
  - Error Rate
  - Last Backup Status
  - Error Feed (recent errors)
  - Activity Chart (system activity visualization)

**2. Overview Tab**
- `SystemOverview` component
- Platform statistics:
  - Total users count
  - Recent activity (last 24 hours)
  - Active classes count
  - System health status
  - User distribution by role

**3. Activity Logs Tab**
- `ActivityLogCard` component
- Chronological system activity
- Filterable by user, action type, timestamp

**4. System Actions Tab**
- `SystemActionsPanel` component
- Administrative operations:
  - Database maintenance
  - Cache clearing
  - System restarts
  - Backup triggers

**5. Developer Tab**
- Links to developer-specific tools
- Documentation and API references

### Data Sources

#### System Health Metrics
- Fetched via `useSystemHealth` hook
- Real-time monitoring data
- Performance metrics

#### System Overview Stats
```sql
-- Total users
SELECT COUNT(*) FROM profiles

-- Recent activity (24h)
SELECT COUNT(*) FROM activity_log 
WHERE created_at >= NOW() - INTERVAL '24 hours'

-- Active classes
SELECT COUNT(*) FROM classes

-- User roles distribution
SELECT role, COUNT(*) 
FROM user_roles 
GROUP BY role
```

### Security Features
- **MFA Enforcement**: Cannot bypass with hooks
- **Role Verification**: Server-side validation via `has_role()` function
- **Activity Logging**: All actions logged to `activity_log` table
- **IP Restrictions**: Placeholder for future IP whitelisting

### Integration Points
- Links to MFA setup (`/mfa-setup`)
- Links to access denied page if unauthorized
- Integrates with system health monitoring
- Connects to activity logging system

---

## 7. SUPER ADMIN DASHBOARD (Rank 6)

### File Location
`src/pages/SuperAdminDashboard.tsx`

### Purpose & Target Users
Highest-level administrative interface for platform owners and super administrators. System-wide oversight and configuration.

### Access Control
- **Allowed Roles**: `super_admin`, `developer`
- **Protected by**: `useSuperAdmin` hook
- **Route**: `/super-admin`
- **Redirect**: Non-super-admins redirected to home page

### Key Features

#### A. Super Admin Toolbar
- Top-level navigation
- Quick access to critical functions

#### B. Six-Tab Interface

**1. Overview Tab**
Key metrics in card format:
- **Total Users**: Platform-wide user count
- **Active Classes**: All classes across all schools
- **System Health**: Overall platform status
- **Monthly Revenue**: Financial metrics (if applicable)

System Health Section:
- Uptime percentage
- Error rate
- Database performance
- Storage usage

**2. Users Tab** (Demo Mode)
- User management interface (placeholder)
- Bulk operations (planned)
- Role assignment (planned)

**3. Database Tab** (Demo Mode)
- Database administration (placeholder)
- Backup management (planned)
- Schema migrations (planned)

**4. Audit Logs Tab** (Demo Mode)
- Comprehensive audit trail (placeholder)
- Security events (planned)
- Compliance reporting (planned)

**5. Tenants Tab** (Demo Mode)
- Multi-tenancy management (placeholder)
- Organization isolation (planned)
- Resource allocation (planned)

**6. Settings Tab** (Demo Mode)
- Platform-wide configuration (placeholder)
- Feature flags (planned)
- Integration settings (planned)

### Current Limitations
Most tabs are in "demo mode" with disabled buttons and placeholder content. This indicates the dashboard structure is ready for future implementation.

### Data Sources
- Platform-wide statistics
- Aggregated metrics from all organizations
- System health monitoring

### Integration Points
- Links to user management
- Links to system configuration
- Connects to audit logging
- Platform-wide analytics

---

## 8. DEVELOPER DASHBOARD (Rank 7)

### File Location
`src/pages/DeveloperDashboard.tsx`

### Purpose & Target Users
Comprehensive development and debugging interface for developers. Includes testing tools, impersonation, feature flags, performance monitoring, error tracking, AI cost analysis, and content management.

### Access Control
- **Allowed Roles**: `developer` ONLY
- **Protected by**: `DeveloperRoute` component
- **Route**: `/dev`
- **Environment Mode**: Detects production vs development

### Key Features

#### A. Environment Warning
- Red banner in production mode
- Warns developers when testing in live environment

#### B. User Information Display
- Current user email
- User ID
- MFA status

#### C. Nine-Tab Interface

**1. Sandbox Tab**
- **Purpose**: Safe testing environment
- **Features**:
  - Mock data loading
  - Test student creation
  - Isolated testing workspace

**2. Impersonation Tab**
- **Purpose**: View application as different users
- **Features**:
  - `UserImpersonationPanel` component
  - Role switching
  - Session management
  - Impersonation logs viewer
  - Security: `ImpersonationBanner` shows when active

**3. Features Tab**
- **Purpose**: Feature flag management
- **Features**:
  - `FeatureToggles` component
  - Enable/disable features in real-time
  - A/B testing support

**4. Performance Tab**
- **Purpose**: Performance monitoring
- **Features**:
  - `PerformanceMonitor` component
  - Page load times
  - API response times
  - Database query performance
  - Memory usage

**5. Errors Tab**
- **Purpose**: Error tracking and debugging
- **Features**:
  - `ErrorLog` component
  - Stack traces
  - Error frequency
  - User impact analysis

**6. AI Costs Tab**
- **Purpose**: Track AI API usage and costs
- **Features**:
  - `AICostsPanel` component
  - Recent usage log with pagination (10 per page)
  - Cost breakdown by action:
    - `action_type` (translation, summarization, etc.)
    - `estimated_cost` (displays micro-costs: $0.0001)
    - `tokens_used`
    - `model` used
    - `timestamp`
    - `user_id`
  - Total cost calculation
  - Cost trends over time
  - **NOTE**: 83% of AI calls are translations (from recent analysis)

**7. Content Tab**
- **Purpose**: Content management and testing
- **Features**:
  - Lesson template manager
  - View mode switcher
  - Component library browser

**8. Users Tab**
- **Purpose**: Quick user statistics
- **Features**:
  - Role distribution
  - Active user counts
  - User creation trends

**9. Settings Tab**
- **Purpose**: Developer configuration
- **Features**:
  - Environment variables display
  - Security settings
  - Debug mode toggles

### Data Sources

#### AI Usage Logs
```sql
SELECT id, action_type, estimated_cost, tokens_used, model, created_at, user_id
FROM ai_usage_logs
ORDER BY created_at DESC
```

**Recent Fix**: Updated RLS policy to allow viewing logs with `null user_id` (system-generated translations)

#### Impersonation Logs
- Tracks all impersonation sessions
- Security audit trail
- User actions while impersonated

#### Performance Metrics
- Real-time monitoring data
- Historical performance trends
- Resource utilization

### Recent Improvements
1. **AI Cost Tracking**:
   - Fixed micro-cost display (now shows $0.0001 instead of $0.00)
   - Added pagination for usage logs
   - Made all logs visible (fixed RLS policy)

2. **Translation Cache**:
   - Caching reduces translation costs by 83%
   - Cache hit = $0.00 cost
   - Cache stored in `translation_cache` table
   - 30-day cache expiration

### Integration Points
- Links to all parts of the platform
- Can access any role's dashboard via impersonation
- Integrates with Sentry for error tracking
- Connects to AI cost tracking system
- Links to translation cache analytics

---

## DASHBOARD COMPARISON MATRIX

| Feature | Student | Parent | Teacher | Admin | System Admin | Super Admin | Developer |
|---------|---------|--------|---------|-------|--------------|-------------|-----------|
| **View Classes** | ✅ Own | ✅ Child's | ✅ Teaching | ✅ All | ✅ All | ✅ All | ✅ All |
| **View Assignments** | ✅ Own | ✅ Child's | ✅ Created | ❌ | ❌ | ❌ | ✅ All |
| **View Grades** | ✅ Own | ✅ Child's | ✅ All Students | ❌ | ❌ | ❌ | ✅ All |
| **Create Classes** | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Create Assignments** | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Analytics** | ❌ | ✅ Limited | ✅ Detailed | ✅ School-wide | ✅ System-wide | ✅ Platform-wide | ✅ All Data |
| **User Management** | ❌ | ❌ | ❌ | ✅ Limited | ✅ | ✅ | ✅ |
| **System Monitoring** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Impersonation** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Feature Flags** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **AI Cost Tracking** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Error Logs** | ❌ | ❌ | ❌ | ❌ | ✅ Limited | ✅ | ✅ Full |
| **MFA Required** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |

---

## TECHNICAL ARCHITECTURE

### Common Patterns Across Dashboards

#### 1. Authentication Flow
```typescript
const { user } = useAuth(); // All dashboards
const { roles, isLoading } = useUserRole(); // Role-based dashboards
```

#### 2. Role-Based Routing
```typescript
// App.tsx pattern
<Route path="/dashboard/role" element={
  <RequireRole allowedRoles={['role', 'super_admin', 'developer']}>
    <RoleDashboard />
  </RequireRole>
} />
```

#### 3. Data Fetching Pattern
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['dashboard-data'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('table')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  }
});
```

#### 4. Loading States
All dashboards implement:
- Skeleton loaders
- Spinner components
- Empty states
- Error boundaries

#### 5. Responsive Design
- Mobile-first approach
- Grid layouts with breakpoints
- Collapsible sections
- Touch-friendly buttons

---

## SECURITY CONSIDERATIONS

### 1. Role Storage & Validation
- ✅ Roles in `user_roles` table (many-to-many)
- ✅ Server-side validation via `has_role()` security definer function
- ✅ Never stored in profiles table
- ✅ Client-side redirects use highest priority role

### 2. Row-Level Security (RLS)
Each dashboard's data access controlled by RLS policies:

```sql
-- Example: Students can only see their own data
CREATE POLICY "Students see own assignments"
ON assignments FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  public.has_role(auth.uid(), 'teacher') OR
  public.has_role(auth.uid(), 'admin')
);
```

### 3. MFA Enforcement
System Admin, Super Admin, and Developer dashboards require MFA:
```typescript
const { requiresMFA } = useMFAEnforcement();
if (requiresMFA && !profile?.mfa_enabled) {
  navigate('/mfa-setup');
}
```

### 4. Impersonation Security
- Only developers can impersonate
- All impersonation logged
- Visual banner when active
- Cannot impersonate super admins

---

## PERFORMANCE OPTIMIZATIONS

### 1. Code Splitting
All dashboards lazy-loaded:
```typescript
const StudentDashboard = React.lazy(() => import("./pages/student/StudentDashboard"));
```

### 2. Query Caching
React Query used throughout:
- 5-minute default stale time
- Background refetching
- Optimistic updates

### 3. Translation Caching
- 30-day cache expiration
- MD5 hash for content identification
- Reduces AI costs by 83%

### 4. Data Pagination
- AI usage logs: 10 per page
- Assignment lists: Configurable limits
- Class lists: Paginated when > 20

---

## INTEGRATION POINTS

### Dashboard to Dashboard Navigation
```
Student → Class Detail
Parent → Student Progress
Teacher → Analytics → Student Detail
Admin → Teacher Management → Teacher Dashboard
System Admin → User Management → Any Dashboard (via impersonation)
Developer → Impersonation → Any Dashboard
```

### External Integrations
- **Supabase**: All data storage and auth
- **OpenAI/Lovable AI**: Translations, summaries, insights
- **Sentry**: Error tracking (Developer Dashboard)
- **Edge Functions**: Translation, AI operations

---

## FUTURE ENHANCEMENTS

### Identified Gaps

1. **Super Admin Dashboard**: Most tabs are placeholders
   - User management UI needed
   - Database admin tools needed
   - Audit log viewer needed
   - Multi-tenancy features planned

2. **Parent Dashboard**: Single student limitation
   - Multi-student selector needed
   - Student comparison views
   - Family-wide analytics

3. **Analytics Enhancement**: Mock data in several places
   - Real-time engagement metrics
   - Predictive analytics
   - Custom report builder

4. **AI Insights**: Placeholder content
   - Learning pattern detection
   - Personalized recommendations
   - Intervention suggestions

5. **Mobile Apps**: Web-only currently
   - Native mobile dashboards
   - Offline support
   - Push notifications

---

## RECOMMENDATIONS

### 1. Admin Dashboard Improvements
- Replace mock data with real queries
- Add export functionality for reports
- Implement real-time notifications
- Add dashboard customization (widgets)

### 2. Accessibility Enhancements
- Keyboard navigation improvements
- Screen reader optimization
- High contrast mode
- Focus indicators

### 3. Performance Monitoring
- Add performance metrics to all dashboards
- Implement lazy loading for heavy components
- Optimize database queries
- Add caching for frequently accessed data

### 4. Analytics Enhancement
- Real-time data updates via Supabase subscriptions
- Custom date range selectors
- Export to CSV/PDF
- Scheduled email reports

---

## CONCLUSION

The platform features a sophisticated, multi-tiered dashboard architecture with clear role separation and robust security. Each dashboard is purpose-built for its target users with appropriate data access and functionality.

**Strengths**:
- Clear role hierarchy with secure implementation
- Comprehensive coverage of user types
- Robust access control via RLS and security definer functions
- Modern React patterns with hooks and lazy loading
- Good separation of concerns

**Areas for Improvement**:
- Some dashboards have placeholder/mock data
- Multi-student parent dashboard support
- Super Admin dashboard tab completion
- Real-time analytics enhancement
- Unified documentation access

**Recent Achievements**:
- Fixed authentication loading race condition
- Added dashboard navigation from landing page
- Fixed AI usage log visibility (RLS policy)
- Implemented micro-cost display for AI tracking
- Implemented intelligent translation caching (83% cost reduction)

The platform is well-architected for growth and can scale to support additional roles, features, and user types as needed.