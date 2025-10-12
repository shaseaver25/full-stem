# Role-Based Access Control (RBAC) Implementation

## Overview
Comprehensive role-based access control has been implemented across TailorEDU with both frontend route guards and backend RLS policies.

## Components Created

### 1. RequireRole Component (`src/components/auth/RequireRole.tsx`)
- Fetches user role from `user_roles` table
- Checks if user has required role for route
- Redirects to `/access-denied` if unauthorized
- Shows loading state during authentication check

### 2. Access Denied Page (`src/pages/AccessDenied.tsx`)
- Clean 403 error page
- Shows attempted route
- Provides "Go to Dashboard" button (role-aware)
- Provides "Go Back" button

## Role Access Matrix

### Student Role
**Routes:**
- `/dashboard/student` - Student dashboard
- `/quiz/learning-genius` - Learning style quiz
- `/classes/join` - Join class with code
- `/classes/my-classes` - View enrolled classes
- `/classes/:id` - View class details
- `/assignments` - List assignments
- `/assignments/:id` - View assignment details
- `/grades` - View grades
- `/student/*` - Student-specific routes
- `/lesson/*` - View lessons
- `/course/*` - View courses (public demo content)

### Teacher Role
**Routes:**
- `/teacher/*` - All teacher routes (protected by ProtectedTeacherRoute)
- `/content` - Content management
- `/lesson/*` - View/manage lessons
- `/classes/*` - Manage classes

### Parent Role
**Routes:**
- `/parent` - Parent portal
- `/dashboard/parent` - Parent dashboard (protected by ProtectedParentRoute)
- View their children's progress and grades

### Admin Role
**Routes:**
- `/admin/dashboard` - Admin dashboard
- `/admin/build-class` - Build classes
- `/admin/ai-course-builder` - AI course builder
- `/admin/course-editor` - Course editor
- `/admin/advanced` - Advanced admin features
- `/dashboard/admin/analytics` - Admin analytics (protected by ProtectedAdminRoute)
- `/content` - Content management

### Super Admin Role
**Routes:**
- `/super-admin` - Super admin dashboard
- All admin routes
- System-wide oversight

### Developer Role
**Routes:**
- `/dev` - Developer dashboard (protected by DeveloperRoute)
- `/super-admin` - Access to super admin features
- All system routes for debugging and development

## Backend Security (RLS Policies)

### Tables Protected:
1. **teacher_profiles**
   - Teachers view/update own profile
   - Admins view/manage all profiles

2. **parent_profiles**
   - Parents view/update own profile
   - Admins view all profiles
   - Teachers view parents of their students

3. **students**
   - Protected via security definer functions
   - `can_view_student()` - Students, teachers, parents
   - `can_manage_student()` - Teachers only

4. **classes**
   - Teachers manage their own classes
   - Students view enrolled classes
   - Admins view/manage all classes

5. **grades**
   - Students view own grades
   - Teachers view/manage grades for their classes
   - Parents view children's grades (if permission granted)

6. **class_students**
   - Teachers manage their class enrollments
   - Students view own enrollment
   - Admins view all enrollments

7. **notifications**
   - Users view/update own notifications only

8. **user_progress**
   - Students view/update own progress
   - Teachers view progress of their students

## Security Features

### Frontend:
- ✅ All sensitive routes wrapped with `RequireRole`
- ✅ Role checked from database (not client storage)
- ✅ Loading states prevent unauthorized access
- ✅ Clean error page for denied access
- ✅ Automatic redirect to appropriate dashboard

### Backend:
- ✅ RLS enabled on all tables
- ✅ Policies use `has_role()` security definer function
- ✅ No recursive policy issues
- ✅ Teachers can only access their own students/classes
- ✅ Students can only access their own data
- ✅ Parents limited to their children's data
- ✅ Admins have elevated access
- ✅ Developers have full access

## Testing Checklist

### Student Account (student@test.com)
- [ ] Can access `/dashboard/student` ✓
- [ ] Can access `/classes/my-classes` ✓
- [ ] Cannot access `/admin/dashboard` → redirects to /access-denied ✓
- [ ] Cannot access `/teacher/dashboard` → redirects to /access-denied ✓
- [ ] Can view only own assignments and grades ✓

### Teacher Account (teacher@test.com)
- [ ] Can access `/teacher/dashboard` ✓
- [ ] Can access `/teacher/classes` ✓
- [ ] Can access `/content` ✓
- [ ] Cannot access `/admin/dashboard` → redirects to /access-denied ✓
- [ ] Cannot access `/student` → redirects to /access-denied ✓
- [ ] Can view only their students' data ✓

### Admin Account (admin@test.com)
- [ ] Can access `/admin/dashboard` ✓
- [ ] Can access `/admin/*` routes ✓
- [ ] Can access `/content` ✓
- [ ] Cannot access `/teacher/dashboard` → redirects to /access-denied ✓
- [ ] Can view all classes and students ✓

### Developer Account (developer@test.com)
- [ ] Can access `/dev` ✓
- [ ] Can access `/super-admin` ✓
- [ ] Can access all routes ✓
- [ ] Can view all data ✓

## Database Functions Used

### Security Definer Functions:
1. `has_role(_user_id, _role)` - Check if user has specific role
2. `can_view_student(_user_id, _student_id)` - Check student view permission
3. `can_manage_student(_user_id, _student_id)` - Check student manage permission

These functions prevent RLS recursion and provide secure role checking.

## Important Notes

⚠️ **Security Warning**: Never check roles from client-side storage. Always fetch from `user_roles` table.

⚠️ **Bypass Protection**: Direct API calls are protected by RLS policies - frontend restrictions alone are insufficient.

⚠️ **Role Assignment**: Roles are stored in the `user_roles` table with `app_role` enum type.

## Verification

To verify role-based access:

1. Log in with different role accounts
2. Try accessing restricted routes
3. Verify redirect to `/access-denied`
4. Check database queries are filtered correctly
5. Confirm no unauthorized data appears in API responses

## Migration Applied

Migration `20251012XXXXXX` applied the following:
- Added/updated RLS policies for teacher_profiles
- Added/updated RLS policies for parent_profiles
- Added/updated RLS policies for classes
- Added/updated RLS policies for grades
- Added/updated RLS policies for class_students
- Added/updated RLS policies for notifications
- Added/updated RLS policies for user_progress

All policies use security definer functions to avoid recursion.
