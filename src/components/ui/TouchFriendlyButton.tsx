
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface TouchFriendlyButtonProps extends ButtonProps {
  children: React.ReactNode;
}

const TouchFriendlyButton: React.FC<TouchFriendlyButtonProps> = ({
  children,
  className,
  ...props
}) => {
  const isMobile = useIsMobile();

  return (
    <Button
      className={cn(
        // Base styles
        className,
        // Mobile-specific styles
        isMobile && [
          "min-h-[44px]", // Minimum touch target size
          "px-4 py-3", // Larger padding for easier tapping
          "text-base", // Larger text on mobile
          "active:scale-95", // Tactile feedback
          "transition-transform duration-150 ease-in-out"
        ]
      )}
      {...props}
    >
      {children}
    </Button>
  );
};

export default TouchFriendlyButton;
