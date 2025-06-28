import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAssignmentGradebook, AssignmentGradeRow } from '@/hooks/useAssignmentGradebook';
import { Download, Filter, TrendingUp, TrendingDown, Minus, Edit } from 'lucide-react';
import EditGradeModal from './EditGradeModal';

const AssignmentGradebook = () => {
  const {
    grades,
    loading,
    assignmentFilter,
    setAssignmentFilter,
    studentFilter,
    setStudentFilter,
    uniqueAssignments,
    uniqueStudents,
    assignmentAverages,
    updateGrade,
  } = useAssignmentGradebook();

  const [sortBy, setSortBy] = useState<'grade' | 'date' | 'student' | 'assignment'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editingGrade, setEditingGrade] = useState<AssignmentGradeRow | null>(null);

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'bg-green-100 text-green-800';
    if (grade >= 80) return 'bg-blue-100 text-blue-800';
    if (grade >= 70) return 'bg-yellow-100 text-yellow-800';
    if (grade >= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const sortedGrades = [...grades].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'grade':
        comparison = a.grade - b.grade;
        break;
      case 'date':
        comparison = new Date(a.graded_at).getTime() - new Date(b.graded_at).getTime();
        break;
      case 'student':
        comparison = a.student_name.localeCompare(b.student_name);
        break;
      case 'assignment':
        comparison = a.assignment_title.localeCompare(b.assignment_title);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const exportToCSV = () => {
    const headers = ['Student Name', 'Assignment Title', 'Grade', 'Feedback', 'Graded At'];
    const csvContent = [
      headers.join(','),
      ...sortedGrades.map(grade => [
        `"${grade.student_name}"`,
        `"${grade.assignment_title}"`,
        grade.grade,
        `"${grade.feedback || ''}"`,
        `"${grade.graded_at}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'assignment_grades.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getSortIcon = (field: typeof sortBy) => {
    if (sortBy !== field) return <Minus className="w-3 h-3 text-gray-400" />;
    return sortOrder === 'asc' ? 
      <TrendingUp className="w-3 h-3 text-blue-600" /> : 
      <TrendingDown className="w-3 h-3 text-blue-600" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Assignment Gradebook</h2>
          <p className="text-gray-600">View and manage assignment grades</p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Assignment Averages */}
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assignment-filter">Assignment</Label>
              <Select value={assignmentFilter} onValueChange={setAssignmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All assignments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All assignments</SelectItem>
                  {uniqueAssignments.map(assignment => (
                    <SelectItem key={assignment} value={assignment}>
                      {assignment}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="student-filter">Student</Label>
              <Input
                id="student-filter"
                placeholder="Search students..."
                value={studentFilter}
                onChange={(e) => setStudentFilter(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grades Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment Grades</CardTitle>
          <CardDescription>
            {sortedGrades.length} grades found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50" 
                    onClick={() => handleSort('student')}
                  >
                    <div className="flex items-center gap-2">
                      Student Name
                      {getSortIcon('student')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50" 
                    onClick={() => handleSort('assignment')}
                  >
                    <div className="flex items-center gap-2">
                      Assignment
                      {getSortIcon('assignment')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50" 
                    onClick={() => handleSort('grade')}
                  >
                    <div className="flex items-center gap-2">
                      Grade
                      {getSortIcon('grade')}
                    </div>
                  </TableHead>
                  <TableHead>Feedback</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50" 
                    onClick={() => handleSort('date')}
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
                {sortedGrades.map(grade => (
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
                        onClick={() => setEditingGrade(grade)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {sortedGrades.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No assignment grades found matching your filters.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Grade Modal */}
      {editingGrade && (
        <EditGradeModal
          isOpen={!!editingGrade}
          onClose={() => setEditingGrade(null)}
          grade={editingGrade}
          onUpdate={updateGrade}
        />
      )}
    </div>
  );
};

export default AssignmentGradebook;
