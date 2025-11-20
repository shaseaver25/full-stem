import React from 'react';
import { Card } from '@/components/ui/card';
import { Lightbulb, TrendingUp, TrendingDown } from 'lucide-react';

interface PivotHintStatsProps {
  totalHintsRequested: number;
  solvedAfterHint: number;
  avgHintsPerConversation: number;
}

export const PivotHintStats: React.FC<PivotHintStatsProps> = ({
  totalHintsRequested,
  solvedAfterHint,
  avgHintsPerConversation
}) => {
  const successRate = totalHintsRequested > 0 
    ? Math.round((solvedAfterHint / totalHintsRequested) * 100) 
    : 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Hints Used</p>
            <p className="text-2xl font-bold mt-1">{totalHintsRequested}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-amber-600" />
          </div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Success Rate</p>
            <p className="text-2xl font-bold mt-1">{successRate}%</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            {successRate >= 70 ? (
              <TrendingUp className="w-6 h-6 text-green-600" />
            ) : (
              <TrendingDown className="w-6 h-6 text-red-600" />
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Students who solved after using hints
        </p>
      </Card>
      
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Avg Hints/Problem</p>
            <p className="text-2xl font-bold mt-1">{avgHintsPerConversation.toFixed(1)}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-bold">📊</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
