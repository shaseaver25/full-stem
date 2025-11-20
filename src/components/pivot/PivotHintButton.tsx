import React from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb, Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PivotHintButtonProps {
  hintsUsed: number;
  maxHints: number;
  onRequestHint: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const PivotHintButton: React.FC<PivotHintButtonProps> = ({
  hintsUsed,
  maxHints,
  onRequestHint,
  isLoading,
  disabled
}) => {
  const hintsRemaining = maxHints - hintsUsed;
  const allHintsUsed = hintsRemaining === 0;
  
  const getButtonVariant = () => {
    if (allHintsUsed) return 'outline';
    if (hintsUsed === 0) return 'default';
    if (hintsUsed === 1) return 'secondary';
    return 'outline';
  };
  
  const getTooltipText = () => {
    if (allHintsUsed) return 'No hints remaining. Keep trying or ask your teacher for help!';
    if (hintsUsed === 0) return 'Get a helpful nudge in the right direction';
    if (hintsUsed === 1) return 'Get a more specific hint';
    return 'Get your final hint - this one will be very specific!';
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={getButtonVariant()}
            size="sm"
            onClick={onRequestHint}
            disabled={disabled || isLoading || allHintsUsed}
            className={`${allHintsUsed ? 'opacity-50' : ''}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating hint...
              </>
            ) : (
              <>
                <Lightbulb className={`w-4 h-4 mr-2 ${hintsRemaining === 1 ? 'animate-pulse' : ''}`} />
                {allHintsUsed ? 'No hints left' : `Hint (${hintsRemaining} left)`}
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
