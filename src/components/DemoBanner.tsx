import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ExternalLink, X } from 'lucide-react';
import { useDemoMode } from '@/hooks/useDemoMode';

interface DemoBannerProps {
  onClose?: () => void;
  variant?: 'banner' | 'watermark';
}

const DemoBanner: React.FC<DemoBannerProps> = ({ onClose, variant = 'banner' }) => {
  const { isDemoMode } = useDemoMode();

  if (!isDemoMode) return null;

  if (variant === 'watermark') {
    return (
      <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
        <Badge 
          variant="outline" 
          className="bg-background/90 backdrop-blur-sm border-primary/20 text-primary shadow-lg"
        >
          <Sparkles className="w-3 h-3 mr-1" />
          DEMO
        </Badge>
      </div>
    );
  }

  return (
    <Alert className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 shadow-sm">
      <Sparkles className="h-4 w-4 text-blue-600" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="text-blue-800">
          <strong>You're in a demo sandbox.</strong> Data resets after you leave. 
          Want a live pilot? <strong>Book a call</strong> with our team.
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button 
            size="sm" 
            variant="outline" 
            className="text-blue-700 border-blue-300 hover:bg-blue-100"
            onClick={() => window.open('https://calendly.com/tailoredu-demo', '_blank')}
          >
            Book Call
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
          {onClose && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="text-blue-600 hover:bg-blue-100 p-1 h-auto"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default DemoBanner;