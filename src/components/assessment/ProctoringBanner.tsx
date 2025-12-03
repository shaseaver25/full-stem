import { Shield, Maximize, Eye, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProctoringBannerProps {
  isFullscreen: boolean;
  isFocused: boolean;
  integrityScore: number;
  warningCount: number;
  maxViolations: number;
  onRequestFullscreen?: () => void;
}

export const ProctoringBanner = ({
  isFullscreen,
  isFocused,
  integrityScore,
  warningCount,
  maxViolations,
  onRequestFullscreen
}: ProctoringBannerProps) => {
  const hasViolations = warningCount > 0;
  const isNearThreshold = warningCount >= maxViolations - 2;

  const getIntegrityColor = () => {
    if (integrityScore >= 90) return 'text-green-600';
    if (integrityScore >= 70) return 'text-yellow-600';
    if (integrityScore >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getIntegrityBg = () => {
    if (integrityScore >= 90) return 'bg-green-50 border-green-200';
    if (integrityScore >= 70) return 'bg-yellow-50 border-yellow-200';
    if (integrityScore >= 50) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className={cn(
      'sticky top-0 z-50 border-b-2 px-4 py-2 transition-colors',
      hasViolations ? 'bg-orange-50 border-orange-300' : 'bg-blue-50 border-blue-200'
    )}>
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        {/* Left: Proctoring Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className={cn(
              'h-5 w-5',
              hasViolations ? 'text-orange-600' : 'text-blue-600'
            )} />
            <span className="font-semibold text-sm">
              Integrity Monitoring Active
            </span>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-3">
            <Badge 
              variant="outline" 
              className={cn(
                'gap-1.5',
                isFullscreen 
                  ? 'bg-green-100 text-green-800 border-green-300' 
                  : 'bg-red-100 text-red-800 border-red-300'
              )}
            >
              <Maximize className="h-3 w-3" />
              {isFullscreen ? 'Fullscreen' : 'Not Fullscreen'}
            </Badge>

            <Badge 
              variant="outline" 
              className={cn(
                'gap-1.5',
                isFocused 
                  ? 'bg-green-100 text-green-800 border-green-300' 
                  : 'bg-red-100 text-red-800 border-red-300'
              )}
            >
              <Eye className="h-3 w-3" />
              {isFocused ? 'Focused' : 'Not Focused'}
            </Badge>
          </div>
        </div>

        {/* Right: Integrity Score & Warnings */}
        <div className="flex items-center gap-4">
          {/* Warning Count */}
          {hasViolations && (
            <div className={cn(
              'flex items-center gap-2 px-3 py-1 rounded-full',
              isNearThreshold ? 'bg-red-100 border border-red-300' : 'bg-orange-100 border border-orange-300'
            )}>
              <AlertTriangle className={cn(
                'h-4 w-4',
                isNearThreshold ? 'text-red-600' : 'text-orange-600'
              )} />
              <span className={cn(
                'text-sm font-bold',
                isNearThreshold ? 'text-red-800' : 'text-orange-800'
              )}>
                {warningCount}/{maxViolations} Violations
              </span>
            </div>
          )}

          {/* Integrity Score */}
          <div className={cn(
            'flex items-center gap-2 px-3 py-1 rounded-full border',
            getIntegrityBg()
          )}>
            {integrityScore >= 90 ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className={cn('h-4 w-4', getIntegrityColor())} />
            )}
            <span className={cn('text-sm font-bold', getIntegrityColor())}>
              {integrityScore}% Integrity
            </span>
          </div>

          {/* Fullscreen Button */}
          {!isFullscreen && onRequestFullscreen && (
            <Button
              size="sm"
              variant="destructive"
              onClick={onRequestFullscreen}
              className="gap-2"
            >
              <Maximize className="h-4 w-4" />
              Enter Fullscreen
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
