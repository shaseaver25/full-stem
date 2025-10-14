import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, UserPlus, X, Users, Upload } from 'lucide-react';
import {
  useClassStudents,
  useAvailableStudents,
  useEnrollStudents,
  useRemoveStudent,
} from '@/hooks/useClassManagement';
import { Student } from '@/services/classManagementService';
import { StudentImportModal } from './StudentImportModal';

interface RosterManagementProps {
  classId: string;
  maxStudents?: number;
}

export function RosterManagement({ classId, maxStudents }: RosterManagementProps) {
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const { data: classStudents = [], isLoading: studentsLoading } = useClassStudents(classId);
  const { data: availableStudents = [], isLoading: availableLoading } = useAvailableStudents();
  const enrollStudents = useEnrollStudents(classId);
  const removeStudent = useRemoveStudent(classId);

  // Filter out already enrolled students
  const enrolledStudentIds = new Set(classStudents.map(cs => cs.student_id));
  const studentsToShow = availableStudents.filter(student => 
    !enrolledStudentIds.has(student.id) &&
    (student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     student.user_id?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEnrollStudents = async () => {
    if (selectedStudents.length === 0) return;
    
    try {
      await enrollStudents.mutateAsync(selectedStudents);
      setSelectedStudents([]);
      setEnrollDialogOpen(false);
      setSearchTerm('');
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    try {
      await removeStudent.mutateAsync(studentId);
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const canEnrollMore = !maxStudents || classStudents.length < maxStudents;
  const rosterCount = classStudents.length;
  const rosterLimit = maxStudents ? `${rosterCount}/${maxStudents}` : `${rosterCount}`;

  if (studentsLoading) {
    return <div>Loading roster...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Class Roster
            </CardTitle>
            <CardDescription>
              Manage students enrolled in this class ({rosterLimit})
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setImportModalOpen(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={!canEnrollMore}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Enroll Students
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Enroll Students</DialogTitle>
                <DialogDescription>
                  Select students to enroll in this class
                  {maxStudents && ` (${maxStudents - rosterCount} spots remaining)`}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {availableLoading ? (
                  <div>Loading students...</div>
                ) : (
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {studentsToShow.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={() => toggleStudentSelection(student.id)}
                          disabled={maxStudents && selectedStudents.length >= (maxStudents - rosterCount) && !selectedStudents.includes(student.id)}
                        />
                        <Avatar>
                          <AvatarFallback>
                            {student.first_name[0]}{student.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium">
                            {student.first_name} {student.last_name}
                          </div>
                           {student.user_id && (
                             <div className="text-sm text-muted-foreground">
                               ID: {student.user_id.substring(0, 8)}...
                             </div>
                           )}
                        </div>
                        {student.grade_level && (
                          <Badge variant="outline">
                            {student.grade_level}
                          </Badge>
                        )}
                      </div>
                    ))}
                    {studentsToShow.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        {searchTerm ? 'No students found matching your search.' : 'All available students are already enrolled.'}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
                  </div>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEnrollDialogOpen(false);
                        setSelectedStudents([]);
                        setSearchTerm('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleEnrollStudents}
                      disabled={selectedStudents.length === 0 || enrollStudents.isPending}
                    >
                      {enrollStudents.isPending ? 'Enrolling...' : `Enroll ${selectedStudents.length} Student${selectedStudents.length !== 1 ? 's' : ''}`}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </CardHeader>
      
      <StudentImportModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        classId={classId}
        onImportComplete={() => {
          // Refresh the student list
          window.location.reload();
        }}
      />
      <CardContent>
        {classStudents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No students enrolled yet. Click "Enroll Students" to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {classStudents.map((classStudent) => (
              <div
                key={classStudent.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      {classStudent.student.first_name[0]}{classStudent.student.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {classStudent.student.first_name} {classStudent.student.last_name}
                    </div>
                     {classStudent.student.user_id && (
                       <div className="text-sm text-muted-foreground">
                         ID: {classStudent.student.user_id.substring(0, 8)}...
                       </div>
                     )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {classStudent.student.grade_level && (
                    <Badge variant="outline">
                      {classStudent.student.grade_level}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveStudent(classStudent.student_id)}
                    disabled={removeStudent.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}