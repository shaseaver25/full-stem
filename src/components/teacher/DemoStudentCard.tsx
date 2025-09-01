import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DemoStudent } from '@/hooks/useStudentManagement';

interface DemoStudentCardProps {
  student: DemoStudent;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
}

export const DemoStudentCard: React.FC<DemoStudentCardProps> = ({
  student,
  isSelected,
  onSelect
}) => {
  return (
    <Card className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
            />
            <div>
              <h4 className="font-medium text-sm">
                {student.first_name} {student.last_name}
              </h4>
              <p className="text-xs text-muted-foreground">{student.grade_level}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex gap-1 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {student.reading_level}
          </Badge>
          {student.learning_style && (
            <Badge variant="outline" className="text-xs">
              {student.learning_style}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          From: {student.class_name}
        </p>
      </CardContent>
    </Card>
  );
};