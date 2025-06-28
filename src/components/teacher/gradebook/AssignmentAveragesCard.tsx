
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface AssignmentAverage {
  assignment: string;
  average: string;
}

interface AssignmentAveragesCardProps {
  assignmentAverages: AssignmentAverage[];
}

const AssignmentAveragesCard = ({ assignmentAverages }: AssignmentAveragesCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Assignment Averages
        </CardTitle>
        <CardDescription>Average grades by assignment</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignmentAverages.map(({ assignment, average }) => (
            <div key={assignment} className="p-3 border rounded-lg">
              <div className="font-medium text-sm">{assignment}</div>
              <div className="text-2xl font-bold text-indigo-600">{average}%</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AssignmentAveragesCard;
