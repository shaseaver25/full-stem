import { Link } from 'react-router-dom';
import { getPrimaryNavigationForRole } from '@/utils/permissions';
import { useUserRole } from '@/hooks/useUserRole';
import { Code } from 'lucide-react';
import { useImpersonation } from '@/contexts/ImpersonationContext';

interface RoleAwareNavigationProps {
  onLinkClick?: () => void;
  variant?: 'desktop' | 'mobile';
}

const RoleAwareNavigation = ({ onLinkClick, variant = 'desktop' }: RoleAwareNavigationProps) => {
  const { role } = useUserRole();
  const { isDeveloper } = useImpersonation();
  
  const navigationItems = getPrimaryNavigationForRole(role);
  
  const baseClasses = variant === 'desktop'
    ? 'text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium'
    : 'text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium';

  return (
    <>
      {/* Always show Home for everyone */}
      <Link
        to="/"
        className={baseClasses}
        onClick={onLinkClick}
      >
        Home
      </Link>

      {/* Public routes - shown when not authenticated */}
      {!role && (
        <>
          <Link
            to="/signup/student"
            className={variant === 'desktop' 
              ? 'text-green-600 hover:text-green-700 px-3 py-2 rounded-md text-sm font-medium'
              : 'text-green-600 hover:text-green-700 px-3 py-2 rounded-md text-base font-medium'
            }
            onClick={onLinkClick}
          >
            Student Signup
          </Link>
          <Link
            to="/teacher/auth"
            className={baseClasses}
            onClick={onLinkClick}
          >
            Teacher Portal
          </Link>
        </>
      )}

      {/* Role-based navigation items */}
      {navigationItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={baseClasses}
          onClick={onLinkClick}
        >
          {item.label}
        </Link>
      ))}

      {/* Developer-only link */}
      {isDeveloper && (
        <Link
          to="/dev"
          className={variant === 'desktop'
            ? 'text-red-500 hover:text-red-700 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1'
            : 'text-red-500 hover:text-red-700 px-3 py-2 rounded-md text-base font-medium flex items-center gap-2'
          }
          onClick={onLinkClick}
        >
          <Code className="h-4 w-4" />
          Developer
        </Link>
      )}
    </>
  );
};

export default RoleAwareNavigation;
