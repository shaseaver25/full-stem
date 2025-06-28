
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Edit } from 'lucide-react';
import { AssignmentGradeRow } from '@/hooks/useAssignmentGradebook';

interface GradebookTableProps {
  grades: AssignmentGradeRow[];
  sortBy: 'grade' | 'date' | 'student' | 'assignment';
  sortOrder: 'asc' | 'desc';
  onSort: (field: 'grade' | 'date' | 'student' | 'assignment') => void;
  onEditGrade: (grade: AssignmentGradeRow) => void;
}

const GradebookTable = ({ grades, sortBy, sortOrder, onSort, onEditGrade }: GradebookTableProps) => {
  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'bg-green-100 text-green-800';
    if (grade >= 80) return 'bg-blue-100 text-blue-800';
    if (grade >= 70) return 'bg-yellow-100 text-yellow-800';
    if (grade >= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getSortIcon = (field: 'grade' | 'date' | 'student' | 'assignment') => {
    if (sortBy !== field) return <Minus className="w-3 h-3 text-gray-400" />;
    return sortOrder === 'asc' ? 
      <TrendingUp className="w-3 h-3 text-blue-600" /> : 
      <TrendingDown className="w-3 h-3 text-blue-600" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assignment Grades</CardTitle>
        <CardDescription>
          {grades.length} grades found
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50" 
                  onClick={() => onSort('student')}
                >
                  <div className="flex items-center gap-2">
                    Student Name
                    {getSortIcon('student')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50" 
                  onClick={() => onSort('assignment')}
                >
                  <div className="flex items-center gap-2">
                    Assignment
                    {getSortIcon('assignment')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50" 
                  onClick={() => onSort('grade')}
                >
                  <div className="flex items-center gap-2">
                    Grade
                    {getSortIcon('grade')}
                  </div>
                </TableHead>
                <TableHead>Feedback</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50" 
                  onClick={() => onSort('date')}
                >
                  <div className="flex items-center gap-2">
                    Graded At
                    {getSortIcon('date')}
                  </div>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.map(grade => (
                <TableRow key={grade.id}>
                  <TableCell className="font-medium">
                    {grade.student_name}
                  </TableCell>
                  <TableCell>{grade.assignment_title}</TableCell>
                  <TableCell>
                    <Badge className={getGradeColor(grade.grade)}>
                      {grade.grade}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={grade.feedback}>
                      {grade.feedback || '-'}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {grade.graded_at}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditGrade(grade)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {grades.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No assignment grades found matching your filters.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GradebookTable;
