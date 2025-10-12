# Role-Aware Navigation Implementation

## Overview
The navigation menu has been updated to show only authorized routes based on the user's role. This ensures users only see links they can access.

## Components Created

### 1. Permissions Utility (`src/utils/permissions.ts`)
Defines all navigation items and provides role-based filtering functions:
- `getAllowedRoutes(role)` - Returns array of allowed route patterns for a role
- `isRouteAllowed(route, role)` - Checks if a specific route is allowed
- `getNavigationItemsForRole(role)` - Returns all navigation items for a role
- `getPrimaryNavigationForRole(role)` - Returns main navigation items for dashboard

### 2. User Role Hook (`src/hooks/useUserRole.ts`)
Custom hook that:
- Fetches user role from `user_roles` table
- Provides real-time updates when role changes
- Subscribes to database changes for instant updates
- Returns `{ role, loading }` state

### 3. Role-Aware Navigation Component (`src/components/RoleAwareNavigation.tsx`)
Reusable component that:
- Fetches current user's role
- Filters navigation items based on role
- Renders only authorized links
- Supports both desktop and mobile variants
- Shows developer-specific links when appropriate

### 4. Updated Header Component (`src/components/Header.tsx`)
Global header now:
- Uses `RoleAwareNavigation` instead of hardcoded links
- Automatically updates when user role changes
- Shows appropriate navigation for authenticated vs. unauthenticated users
- Maintains responsive design (desktop & mobile)

## Navigation Items by Role

### Student
- Home
- Dashboard (`/dashboard/student`)
- My Classes (`/classes/my-classes`)
- Assignments (`/assignments`)
- Grades (`/grades`)
- Preferences (`/preferences`)

### Teacher
- Home
- Dashboard (`/teacher/dashboard`)
- Classes (`/teacher/classes`)
- Gradebook (`/teacher/gradebook`)
- Content (`/content`)
- Analytics (`/teacher/analytics`)

### Parent
- Home
- Dashboard (`/dashboard/parent`)
- Preferences (`/preferences`)

### Admin
- Home
- Dashboard (`/admin/dashboard`)
- AI Builder (`/admin/ai-course-builder`)
- Course Editor (`/admin/course-editor`)
- Content (`/content`)
- Analytics (`/dashboard/admin/analytics`)

### Super Admin
- Home
- Super Admin (`/super-admin`)
- Admin Dashboard (`/admin/dashboard`)
- Analytics (`/dashboard/admin/analytics`)

### Developer
- Home
- Developer (`/dev`)
- Super Admin (`/super-admin`)
- Admin (`/admin/dashboard`)
- Teacher (`/teacher/dashboard`)
- Student (`/dashboard/student`)

## Features

### Real-Time Updates
✅ Navigation updates instantly when:
- User logs in/out
- User role changes in database
- Developer impersonates different users
- Role assignments are modified by admin

### Security
✅ Frontend protection:
- Links only visible to authorized roles
- Non-authorized users don't see restricted routes
- Developer mode clearly indicated

✅ Backend protection (already implemented):
- All routes protected by `RequireRole` component
- Attempting to access hidden routes redirects to `/access-denied`
- RLS policies enforce data access at database level

### User Experience
✅ Clean interface:
- Users only see relevant options
- No confusion from unauthorized links
- Consistent experience across desktop and mobile
- Smooth transitions when role changes

## Verification Checklist

### Test with Student Account
- [ ] Only sees: Dashboard, My Classes, Assignments, Grades, Preferences
- [ ] Does NOT see: Admin, Teacher, or Developer links
- [ ] Can click visible links successfully
- [ ] Cannot access admin routes even if typed directly

### Test with Teacher Account
- [ ] Only sees: Dashboard, Classes, Gradebook, Content, Analytics
- [ ] Does NOT see: Admin or Student dashboard links
- [ ] Can click visible links successfully
- [ ] Cannot access student or admin routes directly

### Test with Admin Account
- [ ] Only sees: Dashboard, AI Builder, Course Editor, Content, Analytics
- [ ] Does NOT see: Teacher or Student links
- [ ] Can click visible links successfully
- [ ] Has appropriate administrative access

### Test with Developer Account
- [ ] Sees ALL navigation items
- [ ] Has special "Developer" link (red color)
- [ ] Can access any route for debugging
- [ ] Developer badge visible in navigation

### Test Unauthenticated User
- [ ] Sees: Home, Student Signup, Teacher Portal
- [ ] Does NOT see: Dashboard or role-specific links
- [ ] Can access public routes only
- [ ] Prompted to sign in when accessing protected routes

### Test Real-Time Updates
- [ ] Log in → navigation updates immediately
- [ ] Log out → navigation reverts to public links
- [ ] Role change in database → navigation reflects instantly
- [ ] Impersonation → navigation switches to impersonated role

## Technical Details

### Route Patterns
The system supports wildcard matching for route groups:
```typescript
'/teacher/*'  // Matches all teacher routes
'/admin/*'    // Matches all admin routes
'/student/*'  // Matches all student routes
'*'           // Developer access - matches everything
```

### Developer Access
Developers have special privileges:
- `allowedRoutes: ['*']` grants access to all routes
- Unique visual indicator (red "Developer" link with code icon)
- Can impersonate other roles to test their experience
- Full access maintained even during impersonation

### Performance
- Role fetched once on mount, cached in state
- Real-time subscription for role changes (minimal overhead)
- Navigation items filtered in-memory (no additional DB queries)
- Fast response when switching between pages

## Integration with RBAC System

This navigation system works seamlessly with the existing RBAC:

1. **Frontend Guards** (`RequireRole`)
   - Blocks unauthorized route access
   - Redirects to `/access-denied` if role insufficient

2. **Backend Security** (RLS Policies)
   - Enforces data access at database level
   - Prevents API bypass attempts

3. **Navigation Menu** (This Implementation)
   - Prevents users from seeing unauthorized links
   - Improves UX by hiding inaccessible options
   - Updates in real-time with role changes

## Code Examples

### Using the Permissions Utility
```typescript
import { getPrimaryNavigationForRole } from '@/utils/permissions';
import { useUserRole } from '@/hooks/useUserRole';

const MyComponent = () => {
  const { role } = useUserRole();
  const navItems = getPrimaryNavigationForRole(role);
  
  return (
    <nav>
      {navItems.map(item => (
        <Link key={item.path} to={item.path}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
};
```

### Checking Route Access
```typescript
import { isRouteAllowed } from '@/utils/permissions';
import { useUserRole } from '@/hooks/useUserRole';

const MyComponent = () => {
  const { role } = useUserRole();
  const canAccessAdmin = isRouteAllowed('/admin/dashboard', role);
  
  return canAccessAdmin ? <AdminLink /> : null;
};
```

## Maintenance

### Adding New Routes
To add new routes to the navigation:

1. Update `allNavigationItems` in `src/utils/permissions.ts`:
```typescript
{ path: '/new-route', label: 'New Feature', description: 'Description' }
```

2. Update role-specific routes in `getAllowedRoutes()`:
```typescript
teacher: [
  // ... existing routes
  '/new-route',
],
```

3. Add route to `App.tsx` with `RequireRole` wrapper

### Modifying Role Access
To change which roles can access a route:

1. Update the role's array in `getAllowedRoutes()`
2. Update the `RequireRole` wrapper in `App.tsx`
3. Verify RLS policies match the new access pattern

## Summary

✅ Navigation is now fully role-aware
✅ Users only see authorized links
✅ Real-time updates when roles change
✅ Works seamlessly with existing RBAC
✅ Consistent across desktop and mobile
✅ Developer mode for full access testing

The system provides a smooth, secure, and intuitive navigation experience for all user roles.
