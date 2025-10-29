import { Link } from 'react-router-dom';
import { getPrimaryNavigationForRole, getNavigationGroupsForRole } from '@/utils/permissions';
import { useUserRole } from '@/hooks/useUserRole';
import { Code, Sparkles } from 'lucide-react';
import { CollapsibleNavGroup } from '@/components/navigation/CollapsibleNavGroup';
import React, { useContext } from 'react';
import { ImpersonationContext } from '@/contexts/ImpersonationContext';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";

interface RoleAwareNavigationProps {
  onLinkClick?: () => void;
  variant?: 'desktop' | 'mobile' | 'menubar';
}

const RoleAwareNavigation = ({ onLinkClick, variant = 'desktop' }: RoleAwareNavigationProps) => {
  const { roles, isLoading } = useUserRole();
  
  // Safely check for impersonation context without throwing
  const impersonationContext = useContext(ImpersonationContext);
  const isDeveloper = impersonationContext?.isDeveloper ?? false;
  
  // Don't render navigation items while loading
  if (isLoading) {
    return null;
  }
  
  // Get highest role for navigation
  const role = roles.length > 0 ? roles.reduce((highest, current) => {
    const ROLE_RANK: Record<string, number> = {
      student: 1, parent: 2, teacher: 3, admin: 4, system_admin: 5, super_admin: 6, developer: 7
    };
    return (ROLE_RANK[current] || 0) > (ROLE_RANK[highest] || 0) ? current : highest;
  }, roles[0]) : null;
  
  const navigationItems = getPrimaryNavigationForRole(role as any);
  const navigationGroups = getNavigationGroupsForRole(role as any);
  
  const baseClasses = variant === 'desktop' || variant === 'menubar'
    ? 'text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium'
    : 'text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium';

  // Menubar variant for horizontal dropdown navigation
  if (variant === 'menubar') {
    return (
      <Menubar className="border-none bg-transparent space-x-1">
        {/* Home link - no dropdown */}
        <Link to="/" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium inline-flex items-center">
          Home
        </Link>

        {/* Public routes when not authenticated - no dropdown */}
        {!role && (
          <>
            <Link to="/signup/student" className="text-green-600 hover:text-green-700 px-3 py-2 text-sm font-medium inline-flex items-center">
              Student Signup
            </Link>
            <Link to="/teacher/auth" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium inline-flex items-center">
              Teacher Portal
            </Link>
            <Link to="/teacher-demo" className="text-purple-600 hover:text-purple-700 px-3 py-2 text-sm font-medium inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Lesson Demo
            </Link>
          </>
        )}

        {/* Role-based navigation - group similar items into dropdown menus */}
        {role && navigationItems.length > 0 && (
          <MenubarMenu>
            <MenubarTrigger className="text-gray-700 hover:text-gray-900 cursor-pointer">
              <span className="flex items-center gap-2">
                My Menu
              </span>
            </MenubarTrigger>
            <MenubarContent>
              {navigationItems.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <MenubarItem key={item.path} asChild>
                    <Link 
                      to={item.path} 
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      {ItemIcon && <ItemIcon className="h-4 w-4" />}
                      {item.label}
                    </Link>
                  </MenubarItem>
                );
              })}
            </MenubarContent>
          </MenubarMenu>
        )}

        {/* Navigation groups as dropdown menus */}
        {navigationGroups.map((group) => {
          const GroupIcon = group.icon;
          return (
            <MenubarMenu key={group.label}>
              <MenubarTrigger className="text-gray-700 hover:text-gray-900 cursor-pointer">
                <span className="flex items-center gap-2">
                  {GroupIcon && <GroupIcon className="h-4 w-4" />}
                  {group.label}
                </span>
              </MenubarTrigger>
              <MenubarContent>
                {group.items.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <MenubarItem key={item.path} asChild>
                      <Link 
                        to={item.path} 
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        {ItemIcon && <ItemIcon className="h-4 w-4" />}
                        {item.label}
                      </Link>
                    </MenubarItem>
                  );
                })}
              </MenubarContent>
            </MenubarMenu>
          );
        })}

        {/* Developer-only link */}
        {isDeveloper && (
          <Link to="/dev" className="text-red-500 hover:text-red-700 px-3 py-2 text-sm font-medium inline-flex items-center gap-2">
            <Code className="h-4 w-4" />
            Developer
          </Link>
        )}
      </Menubar>
    );
  }

  // Original desktop/mobile variant (unchanged)
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
          variant={variant === 'desktop' ? 'desktop' : 'mobile'}
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
