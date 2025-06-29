
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User } from 'lucide-react';

const EmptyStudentsState: React.FC = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center">
          <User className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-medium">No Students Found</h3>
          <p className="text-muted-foreground">
            No students are currently linked to your parent account.
            Please contact your school administrator.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyStudentsState;
