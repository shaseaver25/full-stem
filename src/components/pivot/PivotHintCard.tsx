import React from 'react';
import { Card } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

interface PivotHintCardProps {
  hintNumber: number;
  hintText: string;
  timestamp: Date;
}

export const PivotHintCard: React.FC<PivotHintCardProps> = ({
  hintNumber,
  hintText,
  timestamp
}) => {
  return (
    <Card className="p-4 bg-amber-50 border-amber-200 border-l-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-amber-900">
              Hint {hintNumber}/3
            </h4>
            <span className="text-xs text-amber-700">
              {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          
          <p className="text-sm text-amber-900 leading-relaxed">
            {hintText}
          </p>
          
          {hintNumber === 3 && (
            <p className="text-xs text-amber-700 mt-2 italic">
              This is your last hint! If you're still stuck, try asking your teacher.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};
