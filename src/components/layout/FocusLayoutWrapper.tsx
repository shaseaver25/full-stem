import { ReactNode } from 'react';
import { useFocusMode } from '@/contexts/FocusModeContext';
import { cn } from '@/lib/utils';

interface FocusLayoutWrapperProps {
  children: ReactNode;
  className?: string;
}

export function FocusLayoutWrapper({ children, className }: FocusLayoutWrapperProps) {
  const { focusMode } = useFocusMode();

  return (
    <div
      className={cn(
        'transition-all duration-300',
        focusMode && [
          'bg-background',
          'text-lg leading-loose',
          'p-6 md:p-8 lg:p-12',
          'max-w-4xl mx-auto',
          'rounded-lg shadow-lg',
          'my-4'
        ],
        className
      )}
      style={{
        lineHeight: focusMode ? 1.8 : undefined,
      }}
    >
      {children}
    </div>
  );
}
