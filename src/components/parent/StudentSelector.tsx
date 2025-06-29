
import React from 'react';
import { Button } from '@/components/ui/button';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  grade_level: string;
  reading_level: string;
  class_name: string;
}

interface StudentSelectorProps {
  students: Student[];
  selectedStudent: Student | null;
  onStudentSelect: (student: Student) => void;
}

const StudentSelector: React.FC<StudentSelectorProps> = ({
  students,
  selectedStudent,
  onStudentSelect
}) => {
  return (
    <div className="flex space-x-4 mb-6">
      {students.map((student) => (
        <Button
          key={student.id}
          variant={selectedStudent?.id === student.id ? "default" : "outline"}
          onClick={() => onStudentSelect(student)}
        >
          {student.first_name} {student.last_name}
        </Button>
      ))}
    </div>
  );
};

export default StudentSelector;
