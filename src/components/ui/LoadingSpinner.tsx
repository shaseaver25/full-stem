import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

export const LoadingSpinner = ({ 
  size = 'lg',
  text = 'Loading...',
  fullScreen = true,
  className 
}: LoadingSpinnerProps) => {
  const content = (
    <div className="text-center space-y-4" role="status" aria-live="polite">
      <Loader2 className={cn('animate-spin text-primary mx-auto', sizeMap[size])} />
      {text && (
        <p className="text-muted-foreground text-sm" aria-label={text}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className={cn('min-h-screen flex items-center justify-center bg-background', className)}>
        {content}
      </div>
    );
  }

  return <div className={cn('flex items-center justify-center p-8', className)}>{content}</div>;
};
