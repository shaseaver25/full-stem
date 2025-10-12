import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface NavigationItem {
  label: string;
  path: string;
  icon?: LucideIcon;
}

export interface NavigationGroup {
  label: string;
  icon?: LucideIcon;
  items: NavigationItem[];
  defaultOpen?: boolean;
}

interface CollapsibleNavGroupProps {
  group: NavigationGroup;
  onLinkClick?: () => void;
  variant?: 'desktop' | 'mobile';
}

export const CollapsibleNavGroup = ({
  group,
  onLinkClick,
  variant = 'desktop',
}: CollapsibleNavGroupProps) => {
  const [isOpen, setIsOpen] = useState(group.defaultOpen ?? false);

  const baseClasses =
    variant === 'desktop'
      ? 'text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium'
      : 'text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium';

  return (
    <div className="space-y-1">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className={`${baseClasses} w-full justify-start`}
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4 mr-2" />
        ) : (
          <ChevronRight className="h-4 w-4 mr-2" />
        )}
        {group.icon && <group.icon className="h-4 w-4 mr-2" />}
        {group.label}
      </Button>

      {isOpen && (
        <div className="ml-4 space-y-1">
          {group.items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${baseClasses} flex items-center`}
              onClick={onLinkClick}
            >
              {item.icon && <item.icon className="h-4 w-4 mr-2" />}
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
