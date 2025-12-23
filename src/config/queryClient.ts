/**
 * Optimized React Query configuration for TailorEDU
 * 
 * Features:
 * - Intelligent caching with stale-time policies
 * - Query key factories for cache invalidation
 * - Retry logic with exponential backoff (integrated with Phase 1 error handling)
 * - Performance-optimized defaults
 */

import { QueryClient } from '@tanstack/react-query';
import { createQueryRetryFn, createQueryRetryDelay, RETRY_PRESETS } from '@/hooks/useQueryRetry';

// Create retry functions integrated with error handling
const queryRetryFn = createQueryRetryFn(RETRY_PRESETS.query);
const queryRetryDelay = createQueryRetryDelay(RETRY_PRESETS.query);
const mutationRetryFn = createQueryRetryFn({ maxRetries: 1 });
const mutationRetryDelay = createQueryRetryDelay({ initialDelay: 1000 });

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 5 * 60 * 1000,
      
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      
      // Smart retry: retryable errors (network, timeout) retry; permanent errors (auth, permission) fail immediately
      retry: queryRetryFn,
      
      // Exponential backoff with jitter: 500ms base, 5s max
      retryDelay: queryRetryDelay,
      
      // Refetch on window focus for fresh data
      refetchOnWindowFocus: true,
      
      // Don't refetch on mount if data is fresh
      refetchOnMount: false,
      
      // Keep previous data while fetching (smooth transitions)
      placeholderData: (previousData) => previousData,
    },
    mutations: {
      // Smart retry for mutations
      retry: mutationRetryFn,
      
      // Slower retry delay for mutations (1s base)
      retryDelay: mutationRetryDelay,
    },
  },
});

/**
 * Query Keys Factory
 * 
 * Provides consistent query key structure for:
 * - Predictable cache invalidation
 * - Type-safe query keys
 * - Hierarchical cache management
 */
export const queryKeys = {
  // Student queries
  students: {
    all: ['students'] as const,
    lists: () => [...queryKeys.students.all, 'list'] as const,
    list: (filters?: Record<string, any>) => 
      [...queryKeys.students.lists(), filters] as const,
    details: () => [...queryKeys.students.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.students.details(), id] as const,
    profile: (userId: string) => 
      [...queryKeys.students.all, 'profile', userId] as const,
    enrollment: (studentId: string) => 
      [...queryKeys.students.detail(studentId), 'enrollment'] as const,
  },
  
  // Class queries
  classes: {
    all: ['classes'] as const,
    lists: () => [...queryKeys.classes.all, 'list'] as const,
    list: (filters?: Record<string, any>) => 
      [...queryKeys.classes.lists(), filters] as const,
    details: () => [...queryKeys.classes.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.classes.details(), id] as const,
    students: (classId: string) => 
      [...queryKeys.classes.detail(classId), 'students'] as const,
    lessons: (classId: string) => 
      [...queryKeys.classes.detail(classId), 'lessons'] as const,
    assignments: (classId: string) => 
      [...queryKeys.classes.detail(classId), 'assignments'] as const,
  },
  
  // Assignment queries
  assignments: {
    all: ['assignments'] as const,
    lists: () => [...queryKeys.assignments.all, 'list'] as const,
    list: (filters?: Record<string, any>) => 
      [...queryKeys.assignments.lists(), filters] as const,
    details: () => [...queryKeys.assignments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.assignments.details(), id] as const,
    submissions: (assignmentId: string) => 
      [...queryKeys.assignments.detail(assignmentId), 'submissions'] as const,
    submission: (assignmentId: string, userId: string) => 
      [...queryKeys.assignments.submissions(assignmentId), userId] as const,
  },
  
  // Lesson queries
  lessons: {
    all: ['lessons'] as const,
    lists: () => [...queryKeys.lessons.all, 'list'] as const,
    list: (filters?: Record<string, any>) => 
      [...queryKeys.lessons.lists(), filters] as const,
    details: () => [...queryKeys.lessons.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.lessons.details(), id] as const,
    components: (lessonId: string) => 
      [...queryKeys.lessons.detail(lessonId), 'components'] as const,
  },
  
  // Enrollment queries
  enrollment: {
    all: ['class_students'] as const,
    byClass: (classId: string) => 
      [...queryKeys.enrollment.all, 'class', classId] as const,
    byStudent: (studentId: string) => 
      [...queryKeys.enrollment.all, 'student', studentId] as const,
  },
  
  // Notification queries  
  notifications: {
    all: ['notifications'] as const,
    unread: () => [...queryKeys.notifications.all, 'unread'] as const,
  },
  
  // User profile queries
  profiles: {
    all: ['profiles'] as const,
    detail: (userId: string) => 
      [...queryKeys.profiles.all, 'detail', userId] as const,
  },
  
  // User roles queries (cached for performance)
  userRoles: {
    all: ['userRoles'] as const,
    byUser: (userId: string) => 
      [...queryKeys.userRoles.all, 'user', userId] as const,
  },
};

/**
 * Cache time presets for different data types
 */
export const cachePresets = {
  // High-frequency, stable data (rarely changes)
  stable: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
  },
  
  // Medium-frequency, semi-dynamic data
  semiDynamic: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
  },
  
  // High-frequency, dynamic data
  dynamic: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000, // Auto-refetch every 60s
  },
  
  // Real-time data
  realtime: {
    staleTime: 0, // Always stale
    gcTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchInterval: 10 * 1000, // Auto-refetch every 10s
  },
};

/**
 * Helper function to prefetch related data
 */
export const prefetchHelpers = {
  /**
   * Prefetch student details on hover/focus
   */
  student: (studentId: string, fetchFn: () => Promise<any>) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.students.detail(studentId),
      queryFn: fetchFn,
      staleTime: cachePresets.semiDynamic.staleTime,
    });
  },
  
  /**
   * Prefetch class details
   */
  class: (classId: string, fetchFn: () => Promise<any>) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.classes.detail(classId),
      queryFn: fetchFn,
      staleTime: cachePresets.semiDynamic.staleTime,
    });
  },
  
  /**
   * Prefetch next page of results
   */
  nextPage: (queryKey: readonly any[], fetchFn: () => Promise<any>) => {
    return queryClient.prefetchQuery({
      queryKey,
      queryFn: fetchFn,
      staleTime: cachePresets.semiDynamic.staleTime,
    });
  },
};
