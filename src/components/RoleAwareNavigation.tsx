import { Link } from 'react-router-dom';
import { getPrimaryNavigationForRole, getNavigationGroupsForRole } from '@/utils/permissions';
import { useUserRole } from '@/hooks/useUserRole';
import { Code } from 'lucide-react';
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
  
  const baseClasses = variant === 'desktop' || variant === 'menubar'
    ? 'text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium'
    : 'text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium';

  // Menubar variant for horizontal dropdown navigation
  if (variant === 'menubar') {
    return (
      <Menubar className="border-none bg-transparent">
        {/* Home link */}
        <MenubarMenu>
          <MenubarTrigger className="cursor-pointer" asChild>
            <Link to="/" className="text-gray-700 hover:text-gray-900">
              Home
            </Link>
          </MenubarTrigger>
        </MenubarMenu>

        {/* Public routes when not authenticated */}
        {!role && (
          <>
            <MenubarMenu>
              <MenubarTrigger className="cursor-pointer" asChild>
                <Link to="/signup/student" className="text-green-600 hover:text-green-700">
                  Student Signup
                </Link>
              </MenubarTrigger>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger className="cursor-pointer" asChild>
                <Link to="/teacher/auth" className="text-gray-700 hover:text-gray-900">
                  Teacher Portal
                </Link>
              </MenubarTrigger>
            </MenubarMenu>
          </>
        )}

        {/* Primary navigation items as individual menu items */}
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <MenubarMenu key={item.path}>
              <MenubarTrigger className="cursor-pointer" asChild>
                <Link to={item.path} className="text-gray-700 hover:text-gray-900 flex items-center gap-2">
                  {Icon && <Icon className="h-4 w-4" />}
                  {item.label}
                </Link>
              </MenubarTrigger>
            </MenubarMenu>
          );
        })}

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
              <MenubarContent className="bg-white shadow-lg border rounded-md z-50 min-w-[200px]">
                {group.items.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <MenubarItem key={item.path} asChild>
                      <Link 
                        to={item.path} 
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
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
          <MenubarMenu>
            <MenubarTrigger className="cursor-pointer" asChild>
              <Link to="/dev" className="text-red-500 hover:text-red-700 flex items-center gap-2">
                <Code className="h-4 w-4" />
                Developer
              </Link>
            </MenubarTrigger>
          </MenubarMenu>
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
