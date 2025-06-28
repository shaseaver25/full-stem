
import React, { useState } from 'react';
import { useAssignmentGradebook, AssignmentGradeRow } from '@/hooks/useAssignmentGradebook';
import EditGradeModal from './EditGradeModal';
import GradebookHeader from './gradebook/GradebookHeader';
import AssignmentAveragesCard from './gradebook/AssignmentAveragesCard';
import GradebookFilters from './gradebook/GradebookFilters';
import GradebookTable from './gradebook/GradebookTable';

const AssignmentGradebook = () => {
  const {
    grades,
    loading,
    assignmentFilter,
    setAssignmentFilter,
    studentFilter,
    setStudentFilter,
    uniqueAssignments,
    assignmentAverages,
    updateGrade,
  } = useAssignmentGradebook();

  const [sortBy, setSortBy] = useState<'grade' | 'date' | 'student' | 'assignment'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editingGrade, setEditingGrade] = useState<AssignmentGradeRow | null>(null);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <GradebookHeader onExportCSV={exportToCSV} />
      
      <AssignmentAveragesCard assignmentAverages={assignmentAverages} />
      
      <GradebookFilters
        assignmentFilter={assignmentFilter}
        setAssignmentFilter={setAssignmentFilter}
        studentFilter={studentFilter}
        setStudentFilter={setStudentFilter}
        uniqueAssignments={uniqueAssignments}
      />
      
      <GradebookTable
        grades={sortedGrades}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onEditGrade={setEditingGrade}
      />

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
