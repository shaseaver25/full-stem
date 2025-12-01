import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, BookOpen, Users, Calendar, Plus, Eye, Edit, BarChart3, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ClassStudentImport } from './ClassStudentImport';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StudentRosterPanel } from './StudentRosterPanel';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ClassData {
  id: string;
  name: string;
  subject?: string;
  grade_level?: string;
  description?: string;
  created_at: string;
  enrollment_count?: number;
  current_lesson?: string;
  average_grade?: number;
}

interface ClassesGridProps {
  classes: ClassData[];
  loading?: boolean;
  showSearch?: boolean;
  showStats?: boolean;
  showCreateButton?: boolean;
}

export const ClassesGrid = ({ 
  classes, 
  loading = false, 
  showSearch = true,
  showStats = true,
  showCreateButton = true 
}: ClassesGridProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [deletingClassId, setDeletingClassId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleImportComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['classes'] });
  };

  const handleDeleteClass = async (classId: string, className: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId);

      if (error) throw error;

      toast.success(`Deleted "${className}" successfully`);
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    } catch (error) {
      console.error('Error deleting class:', error);
      toast.error('Failed to delete class');
    } finally {
      setIsDeleting(false);
      setDeletingClassId(null);
    }
  };

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.grade_level?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      {showSearch && classes.length > 0 && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredClasses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {classes.length === 0 ? 'No classes yet' : 'No classes found'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {classes.length === 0
                ? 'Create your first class to start organizing students and assignments.'
                : 'Try adjusting your search terms.'}
            </p>
            {classes.length === 0 && showCreateButton && (
              <Button onClick={() => navigate('/teacher/build-class')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Class
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Classes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((cls) => (
              <Card key={cls.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{cls.name}</CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        {cls.subject && (
                          <Badge variant="secondary">{cls.subject}</Badge>
                        )}
                        {cls.grade_level && (
                          <Badge variant="outline">{cls.grade_level}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {cls.description && (
                    <CardDescription className="line-clamp-2">
                      {cls.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{cls.enrollment_count || 0} students</span>
                      </div>
                      {cls.average_grade !== undefined && (
                        <span className="font-medium text-foreground">
                          Avg: {cls.average_grade}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Current Lesson */}
                  {cls.current_lesson && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Current:</span> {cls.current_lesson}
                    </div>
                  )}
                  
                  {/* Date */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Created {format(new Date(cls.created_at), 'MMM d, yyyy')}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/classes/${cls.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/teacher/classes/${cls.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/teacher/gradebook?class=${cls.id}`)}
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeletingClassId(cls.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Add Single Student Button */}
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => setSelectedClassId(cls.id)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Student
                  </Button>

                  {/* Student Import */}
                  <ClassStudentImport 
                    classId={cls.id}
                    onImportComplete={handleImportComplete}
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Stats */}
          {showStats && classes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{classes.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {classes.reduce((sum, cls) => sum + (cls.enrollment_count || 0), 0)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {classes.length > 0
                      ? Math.round(
                          classes.reduce((sum, cls) => sum + (cls.average_grade || 0), 0) /
                            classes.filter(cls => cls.average_grade !== undefined).length || 0
                        )
                      : 0}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{classes.length}</div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Add Student Dialog */}
      <Dialog open={!!selectedClassId} onOpenChange={(open) => !open && setSelectedClassId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Students</DialogTitle>
          </DialogHeader>
          {selectedClassId && (
            <StudentRosterPanel classId={selectedClassId} />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingClassId} onOpenChange={(open) => !open && setDeletingClassId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this class?</AlertDialogTitle>
            <AlertDialogDescription>
              {(() => {
                const classToDelete = classes.find(c => c.id === deletingClassId);
                const studentCount = classToDelete?.enrollment_count || 0;
                return (
                  <>
                    Are you sure you want to delete "{classToDelete?.name}"?
                    {studentCount > 0 && (
                      <span className="block mt-2 font-semibold text-destructive">
                        Warning: This class has {studentCount} student{studentCount !== 1 ? 's' : ''} enrolled. 
                        All assignments and student data will be permanently deleted.
                      </span>
                    )}
                    <span className="block mt-2">This action cannot be undone.</span>
                  </>
                );
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const classToDelete = classes.find(c => c.id === deletingClassId);
                if (classToDelete) {
                  handleDeleteClass(classToDelete.id, classToDelete.name);
                }
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Class'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
