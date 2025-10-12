import { UserRole } from './roleRedirect';
import { LucideIcon, LayoutDashboard, Sparkles, FileEdit, BookOpen, FolderOpen, BarChart3, Settings, Plus, GraduationCap, Users, Home, ClipboardList } from 'lucide-react';

export interface NavigationItem {
  path: string;
  label: string;
  icon?: LucideIcon;
  description?: string;
}

export interface NavigationGroup {
  label: string;
  icon?: LucideIcon;
  items: NavigationItem[];
  defaultOpen?: boolean;
  roles: UserRole[];
}

// Define all possible navigation items with icons
export const allNavigationItems: NavigationItem[] = [
  // Student routes
  { path: '/dashboard/student', label: 'Dashboard', icon: LayoutDashboard, description: 'Student dashboard' },
  { path: '/classes/my-classes', label: 'My Classes', icon: BookOpen, description: 'View enrolled classes' },
  { path: '/assignments', label: 'Assignments', icon: ClipboardList, description: 'View assignments' },
  { path: '/grades', label: 'Grades', icon: BarChart3, description: 'View grades' },
  { path: '/quiz/learning-genius', label: 'Learning Quiz', icon: GraduationCap, description: 'Take learning style quiz' },
  
  // Teacher routes
  { path: '/teacher/dashboard', label: 'Teacher Dashboard', icon: LayoutDashboard, description: 'Teacher home' },
  { path: '/teacher/classes', label: 'Classes', icon: BookOpen, description: 'Manage classes' },
  { path: '/teacher/gradebook', label: 'Gradebook', icon: ClipboardList, description: 'Grade assignments' },
  { path: '/teacher/analytics', label: 'Analytics', icon: BarChart3, description: 'View analytics' },
  { path: '/dashboard/teacher/analytics', label: 'Teacher Analytics', icon: BarChart3, description: 'Detailed analytics' },
  { path: '/teacher/feedback', label: 'Feedback', icon: Users, description: 'View feedback' },
  
  // Parent routes
  { path: '/dashboard/parent', label: 'Parent Dashboard', icon: Home, description: 'Parent home' },
  { path: '/parent', label: 'Parent Portal', icon: Users, description: 'Access parent portal' },
  
  // Admin routes
  { path: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard, description: 'Admin home' },
  { path: '/admin/ai-course-builder', label: 'AI Course Builder', icon: Sparkles, description: 'Build courses with AI' },
  { path: '/admin/course-editor', label: 'Course Editor', icon: FileEdit, description: 'Edit courses' },
  { path: '/dashboard/admin/analytics', label: 'Admin Analytics', icon: BarChart3, description: 'System analytics' },
  { path: '/admin/build-class', label: 'Build Class', icon: Plus, description: 'Create classes' },
  { path: '/admin/advanced', label: 'Advanced', icon: Settings, description: 'Advanced settings' },
  
  // Super Admin routes
  { path: '/super-admin', label: 'Super Admin', icon: Settings, description: 'Super admin dashboard' },
  
  // Developer routes
  { path: '/dev', label: 'Developer', icon: Settings, description: 'Developer tools' },
  
  // Shared routes
  { path: '/content', label: 'Content Library', icon: FolderOpen, description: 'Manage content' },
  { path: '/preferences', label: 'Preferences', icon: Settings, description: 'User preferences' },
];

// Admin navigation groups
export const adminNavigationGroups: NavigationGroup[] = [
  {
    label: 'Admin Tools',
    icon: Settings,
    defaultOpen: false,
    roles: ['admin', 'super_admin', 'developer'],
    items: [
      { path: '/admin/advanced', label: 'Advanced Settings', icon: Settings },
    ],
  },
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
      { path: '/dashboard/student', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/classes/my-classes', label: 'My Classes', icon: BookOpen },
      { path: '/assignments', label: 'Assignments', icon: ClipboardList },
      { path: '/grades', label: 'Grades', icon: BarChart3 },
      { path: '/preferences', label: 'Preferences', icon: Settings },
    ],
    teacher: [
      { path: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/teacher/classes', label: 'Classes', icon: BookOpen },
      { path: '/teacher/gradebook', label: 'Gradebook', icon: ClipboardList },
      { path: '/content', label: 'Content', icon: FolderOpen },
      { path: '/teacher/analytics', label: 'Analytics', icon: BarChart3 },
    ],
    parent: [
      { path: '/dashboard/parent', label: 'Dashboard', icon: Home },
      { path: '/preferences', label: 'Preferences', icon: Settings },
    ],
    admin: [
      { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/admin/ai-course-builder', label: 'AI Builder', icon: Sparkles },
      { path: '/admin/course-editor', label: 'Course Editor', icon: FileEdit },
      { path: '/admin/build-class', label: 'Build Class', icon: Plus },
      { path: '/content', label: 'Content', icon: FolderOpen },
      { path: '/dashboard/admin/analytics', label: 'Analytics', icon: BarChart3 },
    ],
    super_admin: [
      { path: '/super-admin', label: 'Super Admin', icon: Settings },
      { path: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
      { path: '/dashboard/admin/analytics', label: 'Analytics', icon: BarChart3 },
    ],
    developer: [
      { path: '/dev', label: 'Developer', icon: Settings },
      { path: '/super-admin', label: 'Super Admin', icon: Settings },
      { path: '/admin/dashboard', label: 'Admin', icon: LayoutDashboard },
      { path: '/teacher/dashboard', label: 'Teacher', icon: LayoutDashboard },
      { path: '/dashboard/student', label: 'Student', icon: LayoutDashboard },
    ],
  };

  return primaryRoutes[role] || [];
};

export const getNavigationGroupsForRole = (role: UserRole | null): NavigationGroup[] => {
  if (!role) return [];
  
  return adminNavigationGroups.filter(group => group.roles.includes(role));
};
