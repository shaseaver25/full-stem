
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGradebook, Grade, StudentWithGrades } from '@/hooks/useGradebook';
import { Plus, Edit2, Trash2, Download, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface GradebookProps {
  classId: string;
  className: string;
}

const Gradebook: React.FC<GradebookProps> = ({ classId, className }) => {
  const { students, categories, loading, saving, addGrade, updateGrade, deleteGrade } = useGradebook(classId);
  const [isAddGradeOpen, setIsAddGradeOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [gradeForm, setGradeForm] = useState({
    student_id: '',
    lesson_id: '',
    assignment_id: '',
    category_id: '',
    points_earned: '',
    points_possible: '',
    comments: ''
  });

  const resetForm = () => {
    setGradeForm({
      student_id: '',
      lesson_id: '',
      assignment_id: '',
      category_id: '',
      points_earned: '',
      points_possible: '',
      comments: ''
    });
    setEditingGrade(null);
  };

  const handleSubmitGrade = async () => {
    if (!gradeForm.student_id || !gradeForm.category_id || !gradeForm.points_possible) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const gradeData = {
      student_id: gradeForm.student_id,
      lesson_id: gradeForm.lesson_id ? parseInt(gradeForm.lesson_id) : undefined,
      assignment_id: gradeForm.assignment_id || undefined,
      category_id: gradeForm.category_id,
      points_earned: gradeForm.points_earned ? parseFloat(gradeForm.points_earned) : undefined,
      points_possible: parseFloat(gradeForm.points_possible),
      comments: gradeForm.comments || undefined,
    };

    let success = false;
    if (editingGrade) {
      success = await updateGrade(editingGrade.id, gradeData);
    } else {
      success = await addGrade(gradeData);
    }

    if (success) {
      setIsAddGradeOpen(false);
      resetForm();
    }
  };

  const handleEditGrade = (grade: Grade) => {
    setEditingGrade(grade);
    setGradeForm({
      student_id: grade.student_id,
      lesson_id: grade.lesson_id?.toString() || '',
      assignment_id: grade.assignment_id || '',
      category_id: grade.category_id,
      points_earned: grade.points_earned?.toString() || '',
      points_possible: grade.points_possible.toString(),
      comments: grade.comments || ''
    });
    setIsAddGradeOpen(true);
  };

  const getGradeColor = (percentage?: number) => {
    if (!percentage) return 'bg-gray-100 text-gray-800';
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 80) return 'bg-blue-100 text-blue-800';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
    if (percentage >= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const calculateStudentAverage = (student: StudentWithGrades) => {
    if (!student.grades.length) return null;
    
    const categoryAverages = categories.map(category => {
      const categoryGrades = student.grades.filter(grade => grade.category_id === category.id);
      if (!categoryGrades.length) return { category, average: 0, weight: category.weight };
      
      const average = categoryGrades.reduce((sum, grade) => sum + (grade.percentage || 0), 0) / categoryGrades.length;
      return { category, average, weight: category.weight };
    });

    const totalWeight = categoryAverages.reduce((sum, item) => sum + item.weight, 0);
    const weightedSum = categoryAverages.reduce((sum, item) => sum + (item.average * item.weight / 100), 0);
    
    return totalWeight > 0 ? (weightedSum * 100 / totalWeight) : 0;
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
          <h2 className="text-2xl font-bold">Gradebook</h2>
          <p className="text-gray-600">{className}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Dialog open={isAddGradeOpen} onOpenChange={setIsAddGradeOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Add Grade
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingGrade ? 'Edit Grade' : 'Add Grade'}</DialogTitle>
                <DialogDescription>
                  {editingGrade ? 'Update the grade information.' : 'Enter grade information for a student.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="student">Student</Label>
                  <Select value={gradeForm.student_id} onValueChange={(value) => setGradeForm({...gradeForm, student_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map(student => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.first_name} {student.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={gradeForm.category_id} onValueChange={(value) => setGradeForm({...gradeForm, category_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name} ({category.weight}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="points_earned">Points Earned</Label>
                    <Input
                      id="points_earned"
                      type="number"
                      step="0.01"
                      value={gradeForm.points_earned}
                      onChange={(e) => setGradeForm({...gradeForm, points_earned: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="points_possible">Points Possible</Label>
                    <Input
                      id="points_possible"
                      type="number"
                      step="0.01"
                      value={gradeForm.points_possible}
                      onChange={(e) => setGradeForm({...gradeForm, points_possible: e.target.value})}
                      placeholder="100.00"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="comments">Comments (Optional)</Label>
                  <Textarea
                    id="comments"
                    value={gradeForm.comments}
                    onChange={(e) => setGradeForm({...gradeForm, comments: e.target.value})}
                    placeholder="Add any comments about this grade..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddGradeOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitGrade} disabled={saving}>
                    {saving ? 'Saving...' : (editingGrade ? 'Update' : 'Add')} Grade
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Grade Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map(category => (
          <Card key={category.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </CardTitle>
              <CardDescription>{category.weight}% of total grade</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Students Gradebook Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Grades</CardTitle>
          <CardDescription>
            {students.length} students enrolled
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Overall Grade</TableHead>
                  {categories.map(category => (
                    <TableHead key={category.id}>{category.name}</TableHead>
                  ))}
                  <TableHead>Recent Grades</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map(student => {
                  const overallAverage = calculateStudentAverage(student);
                  return (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="font-medium">
                          {student.first_name} {student.last_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        {overallAverage !== null ? (
                          <Badge className={getGradeColor(overallAverage)}>
                            {overallAverage.toFixed(1)}%
                          </Badge>
                        ) : (
                          <span className="text-gray-400">No grades</span>
                        )}
                      </TableCell>
                      {categories.map(category => {
                        const categoryGrades = student.grades.filter(grade => grade.category_id === category.id);
                        const categoryAverage = categoryGrades.length > 0 
                          ? categoryGrades.reduce((sum, grade) => sum + (grade.percentage || 0), 0) / categoryGrades.length
                          : null;
                        
                        return (
                          <TableCell key={category.id}>
                            {categoryAverage !== null ? (
                              <Badge variant="outline" className={getGradeColor(categoryAverage)}>
                                {categoryAverage.toFixed(1)}%
                              </Badge>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                        );
                      })}
                      <TableCell>
                        <div className="flex gap-1">
                          {student.grades.slice(0, 3).map(grade => (
                            <Badge 
                              key={grade.id} 
                              variant="outline" 
                              className={`text-xs ${getGradeColor(grade.percentage)}`}
                            >
                              {grade.percentage?.toFixed(0)}%
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedStudent(student.id)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Gradebook;
