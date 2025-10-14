import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSimpleGradebook } from '@/hooks/useSimpleGradebook';
import { Loader2, Save } from 'lucide-react';

interface SimpleGradebookProps {
  classId: string;
}

const SimpleGradebook: React.FC<SimpleGradebookProps> = ({ classId }) => {
  const {
    students,
    assignments,
    grades,
    loading,
    saving,
    updateGrade,
    calculateStudentAverage,
    calculateAssignmentAverage,
  } = useSimpleGradebook(classId);

  const [editingGrades, setEditingGrades] = useState<{
    [key: string]: { grade: string; feedback: string };
  }>({});

  const getGrade = (studentUserId: string, assignmentId: string) => {
    return grades.find(
      (g) => g.student_user_id === studentUserId && g.assignment_id === assignmentId
    );
  };

  const getEditKey = (studentUserId: string, assignmentId: string) => {
    return `${studentUserId}-${assignmentId}`;
  };

  const handleGradeChange = (
    studentUserId: string,
    assignmentId: string,
    field: 'grade' | 'feedback',
    value: string
  ) => {
    const key = getEditKey(studentUserId, assignmentId);
    setEditingGrades((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const handleSaveGrade = async (studentUserId: string, assignmentId: string) => {
    const key = getEditKey(studentUserId, assignmentId);
    const editData = editingGrades[key];
    
    if (!editData?.grade) return;

    const grade = getGrade(studentUserId, assignmentId);
    if (!grade) return;

    const gradeValue = parseFloat(editData.grade);
    if (isNaN(gradeValue)) {
      alert('Please enter a valid number');
      return;
    }

    await updateGrade(grade.submission_id, gradeValue, editData.feedback);
    
    // Clear editing state
    setEditingGrades((prev) => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (students.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Students</CardTitle>
          <CardDescription>
            There are no students enrolled in this class yet.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (assignments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Assignments</CardTitle>
          <CardDescription>
            Create assignments for this class to start grading.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gradebook</CardTitle>
        <CardDescription>
          View and edit grades for {students.length} students across {assignments.length} assignments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px] sticky left-0 bg-background z-10">
                  Student
                </TableHead>
                {assignments.map((assignment) => (
                  <TableHead key={assignment.id} className="min-w-[150px] text-center">
                    <div className="flex flex-col">
                      <span className="font-semibold">{assignment.title}</span>
                      {assignment.due_at && (
                        <span className="text-xs text-muted-foreground">
                          Due: {new Date(assignment.due_at).toLocaleDateString()}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground mt-1">
                        Avg: {calculateAssignmentAverage(assignment.id)?.toFixed(1) || '-'}
                      </span>
                    </div>
                  </TableHead>
                ))}
                <TableHead className="min-w-[100px] text-center sticky right-0 bg-background z-10">
                  Average
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const studentAvg = calculateStudentAverage(student.user_id);
                
                return (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium sticky left-0 bg-background z-10">
                      <div>
                        <div>{student.first_name} {student.last_name}</div>
                        {student.email && (
                          <div className="text-xs text-muted-foreground">{student.email}</div>
                        )}
                      </div>
                    </TableCell>
                    {assignments.map((assignment) => {
                      const grade = getGrade(student.user_id, assignment.id);
                      const key = getEditKey(student.user_id, assignment.id);
                      const isEditing = !!editingGrades[key];
                      const editData = editingGrades[key];

                      return (
                        <TableCell key={assignment.id} className="text-center">
                          {grade ? (
                            <div className="flex flex-col gap-1">
                              <Input
                                type="number"
                                min="0"
                                max={assignment.max_points}
                                placeholder="Grade"
                                value={
                                  isEditing
                                    ? editData.grade
                                    : grade.grade?.toString() || ''
                                }
                                onChange={(e) =>
                                  handleGradeChange(
                                    student.user_id,
                                    assignment.id,
                                    'grade',
                                    e.target.value
                                  )
                                }
                                className="h-8 text-center"
                              />
                              {isEditing && (
                                <>
                                  <Input
                                    type="text"
                                    placeholder="Feedback (optional)"
                                    value={editData.feedback || ''}
                                    onChange={(e) =>
                                      handleGradeChange(
                                        student.user_id,
                                        assignment.id,
                                        'feedback',
                                        e.target.value
                                      )
                                    }
                                    className="h-8 text-xs"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleSaveGrade(student.user_id, assignment.id)
                                    }
                                    disabled={saving}
                                  >
                                    {saving ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Save className="h-3 w-3" />
                                    )}
                                  </Button>
                                </>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">No submission</span>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center font-semibold sticky right-0 bg-background z-10">
                      {studentAvg !== null ? `${studentAvg.toFixed(1)}%` : '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleGradebook;
