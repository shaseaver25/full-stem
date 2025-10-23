/**
 * Role-Based Access Control (RBAC) Utilities
 * 
 * SECURITY MODEL:
 * - Roles are stored in the `user_roles` table (many-to-many relationship)
 * - Server-side validation uses security definer function: has_role(user_id, role)
 * - Client-side redirects use highest priority role from ROLE_RANK
 * - Never store roles in profiles table to prevent privilege escalation attacks
 * - All permission checks must ultimately rely on RLS policies and security definer functions
 * 
 * ARCHITECTURE:
 * - Users can have multiple roles (e.g., teacher + admin)
 * - Redirect logic uses the highest ranked role for dashboard routing
 * - Permission checks use hasPermission() to verify role hierarchy
 * - Real-time role updates are supported via Supabase subscriptions
 */

export type UserRole = 'student' | 'teacher' | 'parent' | 'admin' | 'super_admin' | 'system_admin' | 'developer';

// Role hierarchy - higher number = more permissions
export const ROLE_RANK: Record<UserRole, number> = {
  student: 1,
  parent: 2,
  teacher: 3,
  admin: 4,
  system_admin: 5,
  super_admin: 6,
  developer: 7
};

// Check if a user has sufficient permissions
export const hasPermission = (userRole: UserRole | null, requiredRole: UserRole): boolean => {
  if (!userRole) return false;
  return ROLE_RANK[userRole] >= ROLE_RANK[requiredRole];
};

// Get dashboard path for a role
export const getRoleDashboardPath = (role: UserRole | null): string => {
  switch (role) {
    case 'developer':
      return '/dev';
    case 'super_admin':
      return '/super-admin';
    case 'system_admin':
      return '/system-dashboard';
    case 'admin':
      return '/dashboard/admin/analytics';
    case 'teacher':
      return '/teacher/dashboard';
    case 'parent':
      return '/dashboard/parent';
    case 'student':
      return '/dashboard/student';
    default:
      return '/';
  }
};

// Check if a role has access to a specific route pattern
export const canAccessRoute = (userRole: UserRole | null, routePattern: string): boolean => {
  if (!userRole) return false;
  
  // Developer has access to everything
  if (userRole === 'developer') return true;
  
  // Define route access by role
  const routeAccess: Record<UserRole, string[]> = {
    student: ['/dashboard/student', '/classes', '/assignments', '/grades'],
    parent: ['/dashboard/parent', '/student-progress'],
    teacher: ['/teacher/dashboard', '/teacher', '/classes', '/lessons', '/assignments', '/grades'],
    admin: ['/dashboard/admin', '/classes', '/users', '/reports'],
    system_admin: ['/system-dashboard', '/dashboard/admin', '/classes', '/users', '/reports'],
    super_admin: ['/super-admin', '/dashboard/admin', '/system-dashboard', '/classes', '/users', '/reports'],
    developer: ['*'] // All routes
  };
  
  const allowedRoutes = routeAccess[userRole] || [];
  
  // Check if route matches any allowed pattern
  return allowedRoutes.some(pattern => {
    if (pattern === '*') return true;
    if (pattern.endsWith('*')) {
      return routePattern.startsWith(pattern.slice(0, -1));
    }
    return routePattern.startsWith(pattern);
  });
};
