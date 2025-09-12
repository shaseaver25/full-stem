import { useState } from 'react';
import { Search, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useAvailableStudents, useEnrollStudents } from '@/hooks/useClassManagement';
import type { ClassStudent } from '@/types/assignmentTypes';

interface RosterPickerProps {
  classId: string;
  existingStudents: ClassStudent[];
  onEnrolled?: () => void;
}

export function RosterPicker({ classId, existingStudents, onEnrolled }: RosterPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  
  const { data: allStudents = [], isLoading } = useAvailableStudents();
  const enrollStudents = useEnrollStudents(classId);

  // Filter out already enrolled students
  const enrolledStudentIds = new Set(existingStudents.map(cs => cs.student_id));
  const availableStudents = allStudents.filter(student => !enrolledStudentIds.has(student.id));

  // Filter by search term
  const filteredStudents = availableStudents.filter(student => {
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
    const email = '';
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleEnrollSelected = async () => {
    if (selectedStudentIds.length === 0) return;
    
    try {
      await enrollStudents.mutateAsync(selectedStudentIds);
      setSelectedStudentIds([]);
      onEnrolled?.();
    } catch (error) {
      console.error('Failed to enroll students:', error);
    }
  };

  const selectedStudents = allStudents.filter(s => selectedStudentIds.includes(s.id));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Enroll Students
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search students by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Selected Students */}
        {selectedStudentIds.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Selected Students ({selectedStudentIds.length})</div>
            <div className="flex flex-wrap gap-2">
              {selectedStudents.map(student => (
                <Badge key={student.id} variant="secondary" className="flex items-center gap-1">
                  {student.first_name} {student.last_name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    onClick={() => handleToggleStudent(student.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Available Students List */}
        <div className="space-y-2">
          <div className="text-sm font-medium">
            Available Students ({filteredStudents.length})
          </div>
          
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {searchTerm ? 'No students found matching your search.' : 'No students available for enrollment.'}
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-1">
              {filteredStudents.map(student => (
                <div
                  key={student.id}
                  className="flex items-center space-x-3 p-3 hover:bg-muted/50 rounded-md cursor-pointer transition-colors"
                  onClick={() => handleToggleStudent(student.id)}
                >
                  <Checkbox
                    checked={selectedStudentIds.includes(student.id)}
                    onChange={() => handleToggleStudent(student.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">
                      {student.first_name} {student.last_name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      ID: {student.id.slice(0, 8)}...
                    </div>
                    {student.grade_level && (
                      <div className="text-xs text-muted-foreground">
                        Grade {student.grade_level}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enroll Button */}
        {selectedStudentIds.length > 0 && (
          <Button
            onClick={handleEnrollSelected}
            disabled={enrollStudents.isPending}
            className="w-full"
          >
            {enrollStudents.isPending ? 'Enrolling...' : `Enroll ${selectedStudentIds.length} Student${selectedStudentIds.length > 1 ? 's' : ''}`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}