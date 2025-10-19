import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { generateBreadcrumbSchema, type BreadcrumbItem } from '@/utils/schemaGenerators';

/**
 * Hook to generate BreadcrumbList schema based on current route
 * Automatically infers breadcrumb structure from URL
 */
export const useBreadcrumbSchema = () => {
  const location = useLocation();
  const baseUrl = window.location.origin;

  const breadcrumbs = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [
      { name: 'Home', url: baseUrl }
    ];

    let currentPath = '';
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Humanize segment names
      let name = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Special case mappings
      if (segment === 'teacher') name = 'Teacher Dashboard';
      if (segment === 'student') name = 'Student Dashboard';
      if (segment === 'classes') name = 'Classes';
      if (segment === 'lessons') name = 'Lessons';
      if (segment === 'assignments') name = 'Assignments';

      // For UUIDs or lesson IDs, skip or use generic name
      if (segment.match(/^[0-9a-f-]{36}$/) || segment.match(/^\d+$/)) {
        // Skip UUID/ID segments or use generic name
        if (pathSegments[index - 1] === 'classes') {
          name = 'Class Details';
        } else if (pathSegments[index - 1] === 'lessons') {
          name = 'Lesson Details';
        } else {
          name = 'Details';
        }
      }

      items.push({
        name,
        url: `${baseUrl}${currentPath}`
      });
    });

    return items;
  }, [location.pathname, baseUrl]);

  // Only generate breadcrumbs if there are multiple items
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return generateBreadcrumbSchema(breadcrumbs);
};
