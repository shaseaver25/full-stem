import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, Info } from 'lucide-react';
import { useDemoMode } from '@/hooks/useDemoMode';

interface DemoModeIndicatorProps {
  className?: string;
  variant?: 'header' | 'banner' | 'badge';
}

const DemoModeIndicator: React.FC<DemoModeIndicatorProps> = ({ 
  className = '', 
  variant = 'banner' 
}) => {
  const { isDemoMode } = useDemoMode();

  if (!isDemoMode) return null;

  switch (variant) {
    case 'header':
      return (
        <Badge variant="outline" className={`bg-blue-50 text-blue-700 border-blue-200 ${className}`}>
          <Database className="w-3 h-3 mr-1" />
          Demo Mode
        </Badge>
      );

    case 'badge':
      return (
        <Badge className={`bg-gradient-to-r from-blue-500 to-purple-600 text-white ${className}`}>
          <Database className="w-3 h-3 mr-1" />
          Viewing Demo Data
        </Badge>
      );

    case 'banner':
    default:
      return (
        <Alert className={`bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 ${className}`}>
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Demo Mode Active:</strong> You're viewing sample data for "AI for Middle School Students" class.
            Try the Read-Aloud and Translate features on Assignment #1!
          </AlertDescription>
        </Alert>
      );
  }
};

export default DemoModeIndicator;