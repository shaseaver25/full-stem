import { Link } from 'react-router-dom';
import { getPrimaryNavigationForRole, getNavigationGroupsForRole } from '@/utils/permissions';
import { useUserRole } from '@/hooks/useUserRole';
import { Code } from 'lucide-react';
import { CollapsibleNavGroup } from '@/components/navigation/CollapsibleNavGroup';
import React, { useContext } from 'react';
import { ImpersonationContext } from '@/contexts/ImpersonationContext';

interface RoleAwareNavigationProps {
  onLinkClick?: () => void;
  variant?: 'desktop' | 'mobile';
}

const RoleAwareNavigation = ({ onLinkClick, variant = 'desktop' }: RoleAwareNavigationProps) => {
  const { role, loading } = useUserRole();
  
  // Safely check for impersonation context without throwing
  const impersonationContext = useContext(ImpersonationContext);
  const isDeveloper = impersonationContext?.isDeveloper ?? false;
  
  // Don't render navigation items while loading
  if (loading) {
    return null;
  }
  
  const navigationItems = getPrimaryNavigationForRole(role);
  const navigationGroups = getNavigationGroupsForRole(role);
  
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
      {navigationItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`${baseClasses} flex items-center gap-2`}
            onClick={onLinkClick}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {item.label}
          </Link>
        );
      })}

      {/* Collapsible navigation groups */}
      {navigationGroups.map((group) => (
        <CollapsibleNavGroup
          key={group.label}
          group={group}
          onLinkClick={onLinkClick}
          variant={variant}
        />
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
