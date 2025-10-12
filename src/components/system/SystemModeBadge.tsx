import { Shield, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const SystemModeBadge = () => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="destructive" 
            className="flex items-center gap-1 px-3 py-1 cursor-help"
          >
            <Shield className="h-3 w-3" />
            System Mode
            <AlertTriangle className="h-3 w-3" />
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">
            You are operating in System Administrator mode. All actions are logged and monitored.
            Be cautious with system-level changes.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
