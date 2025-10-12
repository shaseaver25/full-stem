import { UserRole } from './roleRedirect';

export interface NavigationItem {
  path: string;
  label: string;
  icon?: string;
  description?: string;
}

// Define all possible navigation items
export const allNavigationItems: NavigationItem[] = [
  // Student routes
  { path: '/dashboard/student', label: 'Dashboard', description: 'Student dashboard' },
  { path: '/classes/my-classes', label: 'My Classes', description: 'View enrolled classes' },
  { path: '/assignments', label: 'Assignments', description: 'View assignments' },
  { path: '/grades', label: 'Grades', description: 'View grades' },
  { path: '/quiz/learning-genius', label: 'Learning Quiz', description: 'Take learning style quiz' },
  
  // Teacher routes
  { path: '/teacher/dashboard', label: 'Teacher Dashboard', description: 'Teacher home' },
  { path: '/teacher/classes', label: 'Classes', description: 'Manage classes' },
  { path: '/teacher/gradebook', label: 'Gradebook', description: 'Grade assignments' },
  { path: '/teacher/analytics', label: 'Analytics', description: 'View analytics' },
  { path: '/dashboard/teacher/analytics', label: 'Teacher Analytics', description: 'Detailed analytics' },
  { path: '/teacher/feedback', label: 'Feedback', description: 'View feedback' },
  
  // Parent routes
  { path: '/dashboard/parent', label: 'Parent Dashboard', description: 'Parent home' },
  { path: '/parent', label: 'Parent Portal', description: 'Access parent portal' },
  
  // Admin routes
  { path: '/admin/dashboard', label: 'Admin Dashboard', description: 'Admin home' },
  { path: '/admin/ai-course-builder', label: 'AI Course Builder', description: 'Build courses with AI' },
  { path: '/admin/course-editor', label: 'Course Editor', description: 'Edit courses' },
  { path: '/dashboard/admin/analytics', label: 'Admin Analytics', description: 'System analytics' },
  { path: '/admin/build-class', label: 'Build Class', description: 'Create classes' },
  { path: '/admin/advanced', label: 'Advanced', description: 'Advanced settings' },
  
  // Super Admin routes
  { path: '/super-admin', label: 'Super Admin', description: 'Super admin dashboard' },
  
  // Developer routes
  { path: '/dev', label: 'Developer', description: 'Developer tools' },
  
  // Shared routes
  { path: '/content', label: 'Content Library', description: 'Manage content' },
  { path: '/preferences', label: 'Preferences', description: 'User preferences' },
];

/**
 * Get allowed routes for a given user role
 */
export const getAllowedRoutes = (role: UserRole | null): string[] => {
  if (!role) return [];

  const routesByRole: Record<UserRole, string[]> = {
    student: [
      '/dashboard/student',
      '/classes/my-classes',
      '/classes/join',
      '/assignments',
      '/grades',
      '/preferences',
      '/quiz/learning-genius',
      '/lesson/*',
      '/course/*',
      '/student/*',
    ],
    teacher: [
      '/teacher/dashboard',
      '/teacher/classes',
      '/teacher/gradebook',
      '/teacher/assignment-gradebook',
      '/teacher/analytics',
      '/teacher/feedback',
      '/teacher/submissions',
      '/dashboard/teacher/analytics',
      '/content',
      '/preferences',
      '/build-class',
      '/lesson/*',
      '/class-lesson/*',
    ],
    parent: [
      '/dashboard/parent',
      '/parent',
      '/preferences',
    ],
    admin: [
      '/admin/dashboard',
      '/admin/ai-course-builder',
      '/admin/course-editor',
      '/admin/build-class',
      '/admin/advanced',
      '/dashboard/admin/analytics',
      '/content',
      '/preferences',
      '/build-class',
    ],
    super_admin: [
      '/super-admin',
      '/admin/dashboard',
      '/admin/ai-course-builder',
      '/admin/course-editor',
      '/admin/build-class',
      '/admin/advanced',
      '/dashboard/admin/analytics',
      '/content',
      '/preferences',
      '/build-class',
    ],
    developer: ['*'], // Full access to all routes
  };

  return routesByRole[role] || [];
};

/**
 * Check if a route is allowed for a given role
 */
export const isRouteAllowed = (route: string, role: UserRole | null): boolean => {
  if (!role) return false;
  
  const allowedRoutes = getAllowedRoutes(role);
  
  // Developer has access to everything
  if (allowedRoutes.includes('*')) return true;
  
  // Check exact match
  if (allowedRoutes.includes(route)) return true;
  
  // Check wildcard matches
  return allowedRoutes.some(allowedRoute => {
    if (allowedRoute.endsWith('/*')) {
      const prefix = allowedRoute.slice(0, -2);
      return route.startsWith(prefix);
    }
    return false;
  });
};

/**
 * Get navigation items filtered by user role
 */
export const getNavigationItemsForRole = (role: UserRole | null): NavigationItem[] => {
  if (!role) return [];
  
  const allowedRoutes = getAllowedRoutes(role);
  
  // Developer sees everything
  if (allowedRoutes.includes('*')) {
    return allNavigationItems;
  }
  
  // Filter navigation items based on allowed routes
  return allNavigationItems.filter(item => 
    isRouteAllowed(item.path, role)
  );
};

/**
 * Get primary navigation items for a role (main dashboard and key pages)
 */
export const getPrimaryNavigationForRole = (role: UserRole | null): NavigationItem[] => {
  if (!role) return [];

  const primaryRoutes: Record<UserRole, NavigationItem[]> = {
    student: [
      { path: '/dashboard/student', label: 'Dashboard' },
      { path: '/classes/my-classes', label: 'My Classes' },
      { path: '/assignments', label: 'Assignments' },
      { path: '/grades', label: 'Grades' },
      { path: '/preferences', label: 'Preferences' },
    ],
    teacher: [
      { path: '/teacher/dashboard', label: 'Dashboard' },
      { path: '/teacher/classes', label: 'Classes' },
      { path: '/teacher/gradebook', label: 'Gradebook' },
      { path: '/content', label: 'Content' },
      { path: '/teacher/analytics', label: 'Analytics' },
    ],
    parent: [
      { path: '/dashboard/parent', label: 'Dashboard' },
      { path: '/preferences', label: 'Preferences' },
    ],
    admin: [
      { path: '/admin/dashboard', label: 'Dashboard' },
      { path: '/admin/ai-course-builder', label: 'AI Builder' },
      { path: '/admin/course-editor', label: 'Course Editor' },
      { path: '/content', label: 'Content' },
      { path: '/dashboard/admin/analytics', label: 'Analytics' },
    ],
    super_admin: [
      { path: '/super-admin', label: 'Super Admin' },
      { path: '/admin/dashboard', label: 'Admin Dashboard' },
      { path: '/dashboard/admin/analytics', label: 'Analytics' },
    ],
    developer: [
      { path: '/dev', label: 'Developer' },
      { path: '/super-admin', label: 'Super Admin' },
      { path: '/admin/dashboard', label: 'Admin' },
      { path: '/teacher/dashboard', label: 'Teacher' },
      { path: '/dashboard/student', label: 'Student' },
    ],
  };

  return primaryRoutes[role] || [];
};
