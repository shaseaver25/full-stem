
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  grade_level: string;
  reading_level: string;
  class_name: string;
}

interface StudentProfileProps {
  student: Student;
}

const StudentProfile: React.FC<StudentProfileProps> = ({ student }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="mr-2 h-5 w-5" />
          Student Profile
        </CardTitle>
        <CardDescription>
          {student.first_name}'s academic information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Full Name</Label>
            <p className="text-lg font-medium">
              {student.first_name} {student.last_name}
            </p>
          </div>
          <div>
            <Label>Grade Level</Label>
            <p className="text-lg font-medium">{student.grade_level}</p>
          </div>
          <div>
            <Label>Reading Level</Label>
            <p className="text-lg font-medium">{student.reading_level}</p>
          </div>
          <div>
            <Label>Class</Label>
            <p className="text-lg font-medium">{student.class_name}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentProfile;
