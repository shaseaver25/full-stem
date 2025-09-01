import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Users, Plus, Edit, Trash2, UserPlus } from 'lucide-react';
import { DemoStudentCard } from './DemoStudentCard';
import { AddAIClassStudents } from './AddAIClassStudents';
import { MultiSelect, Option } from '@/components/ui/multi-select';
import { useStudentManagement, Student, CreateStudentData, DemoStudent } from '@/hooks/useStudentManagement';
import { useForm } from 'react-hook-form';

interface StudentRosterPanelProps {
  classId: string;
}

interface StudentFormData extends CreateStudentData {}

// Lesson modification options
const LESSON_MODIFICATION_OPTIONS: Option[] = [
  { label: 'Extended Time', value: 'extended_time' },
  { label: 'Reduced Assignment Length', value: 'reduced_length' },
  { label: 'Text-to-Speech', value: 'text_to_speech' },
  { label: 'Large Print Materials', value: 'large_print' },
  { label: 'Simplified Instructions', value: 'simplified_instructions' },
  { label: 'Visual Supports', value: 'visual_supports' },
  { label: 'Frequent Breaks', value: 'frequent_breaks' },
  { label: 'Alternative Assessment', value: 'alternative_assessment' },
  { label: 'Peer Support', value: 'peer_support' },
  { label: 'Preferential Seating', value: 'preferential_seating' },
  { label: 'Chunked Content', value: 'chunked_content' },
  { label: 'Graphic Organizers', value: 'graphic_organizers' },
  { label: 'Translation Support', value: 'translation_support' },
  { label: 'Lower Reading Level', value: 'lower_reading_level' },
  { label: 'Audio Instructions', value: 'audio_instructions' },
  { label: 'Movement Breaks', value: 'movement_breaks' },
  { label: 'Reduced Distractions', value: 'reduced_distractions' },
  { label: 'Assistive Technology', value: 'assistive_technology' }
];

export const StudentRosterPanel: React.FC<StudentRosterPanelProps> = ({ classId }) => {
  const {
    students,
    demoStudents,
    loading,
    fetchStudents,
    fetchDemoStudents,
    addSelectedDemoStudents,
    addStudent,
    updateStudent,
    deleteStudent
  } = useStudentManagement(classId);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedDemoStudents, setSelectedDemoStudents] = useState<string[]>([]);
  const [selectedModifications, setSelectedModifications] = useState<string[]>([]);

  const { register, handleSubmit, reset, setValue, watch } = useForm<StudentFormData>();

  useEffect(() => {
    fetchStudents();
    fetchDemoStudents();
  }, [classId]);

  const handleAddStudent = async (data: StudentFormData) => {
    const studentData = {
      ...data,
      lesson_modifications: selectedModifications
    };
    await addStudent(studentData);
    reset();
    setSelectedModifications([]);
    setIsAddDialogOpen(false);
  };

  const handleUpdateStudent = async (data: StudentFormData) => {
    if (!editingStudent) return;
    const studentData = {
      ...data,
      lesson_modifications: selectedModifications
    };
    await updateStudent(editingStudent.id, studentData);
    reset();
    setSelectedModifications([]);
    setEditingStudent(null);
  };

  const handleEditClick = (student: Student) => {
    setEditingStudent(student);
    setValue('first_name', student.first_name);
    setValue('last_name', student.last_name);
    setValue('grade_level', student.grade_level);
    setValue('reading_level', student.reading_level);
    setValue('learning_style', student.learning_style);
    setValue('language_preference', student.language_preference);
    setSelectedModifications(student.lesson_modifications || []);
  };

  const handleAddSelectedDemoStudents = async () => {
    await addSelectedDemoStudents(selectedDemoStudents);
    setSelectedDemoStudents([]);
  };

  const handleDemoStudentSelect = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedDemoStudents(prev => [...prev, studentId]);
    } else {
      setSelectedDemoStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  const handleSelectAllDemo = (checked: boolean) => {
    if (checked) {
      setSelectedDemoStudents(demoStudents.map(s => s.id));
    } else {
      setSelectedDemoStudents([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Student Roster</h2>
          <Badge variant="secondary">{students.length} students</Badge>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(handleAddStudent)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name</Label>
                    <Input {...register('first_name', { required: true })} />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input {...register('last_name', { required: true })} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="grade_level">Grade Level</Label>
                  <Select onValueChange={(value) => setValue('grade_level', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6th Grade">6th Grade</SelectItem>
                      <SelectItem value="7th Grade">7th Grade</SelectItem>
                      <SelectItem value="8th Grade">8th Grade</SelectItem>
                      <SelectItem value="9th Grade">9th Grade</SelectItem>
                      <SelectItem value="10th Grade">10th Grade</SelectItem>
                      <SelectItem value="11th Grade">11th Grade</SelectItem>
                      <SelectItem value="12th Grade">12th Grade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="reading_level">Reading Level</Label>
                  <Select onValueChange={(value) => setValue('reading_level', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reading level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Below Grade Level">Below Grade Level</SelectItem>
                      <SelectItem value="Grade Level">Grade Level</SelectItem>
                      <SelectItem value="Above Grade Level">Above Grade Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="learning_style">Learning Style</Label>
                  <Select onValueChange={(value) => setValue('learning_style', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select learning style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Visual">Visual</SelectItem>
                      <SelectItem value="Auditory">Auditory</SelectItem>
                      <SelectItem value="Kinesthetic">Kinesthetic</SelectItem>
                      <SelectItem value="Mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="lesson_modifications">Lesson Modifications</Label>
                  <MultiSelect
                    options={LESSON_MODIFICATION_OPTIONS}
                    selected={selectedModifications}
                    onChange={setSelectedModifications}
                    placeholder="Select lesson modifications..."
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    Add Student
                  </Button>
                </div>
              </form>
            </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="roster" className="space-y-4">
        <TabsList>
          <TabsTrigger value="roster">Current Roster ({students.length})</TabsTrigger>
          <TabsTrigger value="demo-students">Add Demo Students</TabsTrigger>
          <TabsTrigger value="ai-class">Add AI Class Students</TabsTrigger>
        </TabsList>

        <TabsContent value="roster">
          {loading ? (
            <div className="text-center py-8">Loading students...</div>
          ) : students.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {students.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onEdit={() => handleEditClick(student)}
                  onDelete={() => deleteStudent(student.id)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No students yet</h3>
                <p className="text-gray-600 mb-4">
                  Add students to your class to start teaching.
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Student
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="demo-students">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-medium">Available Demo Students</h3>
                <Badge variant="secondary">{demoStudents.length} available</Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleSelectAllDemo(selectedDemoStudents.length !== demoStudents.length)}
                >
                  {selectedDemoStudents.length === demoStudents.length ? 'Deselect All' : 'Select All'}
                </Button>
                <Button
                  onClick={handleAddSelectedDemoStudents}
                  disabled={loading || selectedDemoStudents.length === 0}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Selected ({selectedDemoStudents.length})
                </Button>
              </div>
            </div>

            {demoStudents.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {demoStudents.map((demoStudent) => (
                  <DemoStudentCard
                    key={demoStudent.id}
                    student={demoStudent}
                    isSelected={selectedDemoStudents.includes(demoStudent.id)}
                    onSelect={(checked) => handleDemoStudentSelect(demoStudent.id, checked)}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No demo students available</h3>
                  <p className="text-gray-600">
                    Demo students will appear here when available.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ai-class">
          <AddAIClassStudents classId={classId} />
        </TabsContent>
      </Tabs>

      {/* Edit Student Dialog */}
      <Dialog open={!!editingStudent} onOpenChange={() => setEditingStudent(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleUpdateStudent)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input {...register('first_name', { required: true })} />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input {...register('last_name', { required: true })} />
              </div>
            </div>
            <div>
              <Label htmlFor="grade_level">Grade Level</Label>
              <Select onValueChange={(value) => setValue('grade_level', value)} value={watch('grade_level')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6th Grade">6th Grade</SelectItem>
                  <SelectItem value="7th Grade">7th Grade</SelectItem>
                  <SelectItem value="8th Grade">8th Grade</SelectItem>
                  <SelectItem value="9th Grade">9th Grade</SelectItem>
                  <SelectItem value="10th Grade">10th Grade</SelectItem>
                  <SelectItem value="11th Grade">11th Grade</SelectItem>
                  <SelectItem value="12th Grade">12th Grade</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reading_level">Reading Level</Label>
              <Select onValueChange={(value) => setValue('reading_level', value)} value={watch('reading_level')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reading level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Below Grade Level">Below Grade Level</SelectItem>
                  <SelectItem value="Grade Level">Grade Level</SelectItem>
                  <SelectItem value="Above Grade Level">Above Grade Level</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="learning_style">Learning Style</Label>
              <Select onValueChange={(value) => setValue('learning_style', value)} value={watch('learning_style')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select learning style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Visual">Visual</SelectItem>
                  <SelectItem value="Auditory">Auditory</SelectItem>
                  <SelectItem value="Kinesthetic">Kinesthetic</SelectItem>
                  <SelectItem value="Mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="lesson_modifications">Lesson Modifications</Label>
              <MultiSelect
                options={LESSON_MODIFICATION_OPTIONS}
                selected={selectedModifications}
                onChange={setSelectedModifications}
                placeholder="Select lesson modifications..."
                className="w-full"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setEditingStudent(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                Update Student
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface StudentCardProps {
  student: Student;
  onEdit: () => void;
  onDelete: () => void;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, onEdit, onDelete }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">
              {student.first_name} {student.last_name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{student.grade_level}</p>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={onEdit}>
              <Edit className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onDelete}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {student.reading_level}
          </Badge>
          {student.learning_style && (
            <Badge variant="outline" className="text-xs">
              {student.learning_style}
            </Badge>
          )}
        </div>
        {student.language_preference && (
          <p className="text-xs text-muted-foreground">
            Language: {student.language_preference}
          </p>
        )}
        {student.lesson_modifications && student.lesson_modifications.length > 0 && (
          <div className="text-xs text-muted-foreground">
            <p className="font-medium">Lesson Modifications:</p>
            <div className="flex gap-1 flex-wrap mt-1">
              {student.lesson_modifications.slice(0, 3).map((mod, index) => {
                const option = LESSON_MODIFICATION_OPTIONS.find(opt => opt.value === mod);
                return (
                  <Badge key={index} variant="outline" className="text-xs py-0 px-1">
                    {option?.label || mod}
                  </Badge>
                );
              })}
              {student.lesson_modifications.length > 3 && (
                <Badge variant="outline" className="text-xs py-0 px-1">
                  +{student.lesson_modifications.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};