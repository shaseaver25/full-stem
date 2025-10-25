import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Library, ChevronDown, Loader2 } from 'lucide-react';
import { ClassesGrid } from '@/components/teacher/ClassesGrid';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface ClassItem {
  id: string;
  name: string;
  subject: string;
  grade_level: string;
  enrollment_count: number;
  current_lesson?: string;
  average_grade?: number;
  created_at: string;
  description?: string;
}

interface ClassesListProps {
  classes: ClassItem[];
  loading: boolean;
}

export const ClassesList = ({ classes, loading }: ClassesListProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [addingClassId, setAddingClassId] = useState<string | null>(null);

  // Fetch available classes
  useEffect(() => {
    const fetchAvailableClasses = async () => {
      setLoadingClasses(true);
      try {
        const { data, error } = await supabase
          .from('classes')
          .select('id, name, subject, grade_level, description')
          .eq('published', true)
          .order('name');

        if (error) throw error;
        setAvailableClasses(data || []);
      } catch (error: any) {
        console.error('Error fetching classes:', error);
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchAvailableClasses();
  }, []);

  // Handle adding a class to teacher's roster
  const handleAddClass = async (classId: string) => {
    if (!user) return;

    setAddingClassId(classId);
    try {
      // Get teacher profile ID
      const { data: teacherProfile, error: profileError } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      // Create a copy of the class for this teacher
      const originalClass = availableClasses.find(c => c.id === classId);
      if (!originalClass) throw new Error('Class not found');

      const { data: newClass, error: createError } = await supabase
        .from('classes')
        .insert({
          name: originalClass.name,
          subject: originalClass.subject,
          grade_level: originalClass.grade_level,
          description: originalClass.description,
          teacher_id: teacherProfile.id,
          published: false,
        })
        .select()
        .single();

      if (createError) throw createError;

      toast({
        title: 'Success',
        description: `${originalClass.name} has been added to your classes`,
      });

      // Refresh classes list
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      
      // Navigate to edit the new class
      navigate(`/teacher/classes/${newClass.id}/edit`);
    } catch (error: any) {
      console.error('Error adding class:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add class',
        variant: 'destructive',
      });
    } finally {
      setAddingClassId(null);
    }
  };

  // Ensure classes have created_at field for ClassesGrid compatibility
  const classesWithDates = classes.map(cls => ({
    ...cls,
    created_at: cls.created_at || new Date().toISOString(),
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>My Classes</CardTitle>
          <CardDescription>Manage your active classes</CardDescription>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={loadingClasses}>
                {loadingClasses ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Library className="h-4 w-4 mr-2" />
                )}
                Browse Classes
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 max-h-96 overflow-y-auto bg-popover">
              <DropdownMenuLabel>Available Classes</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableClasses.length === 0 ? (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                  No classes available
                </div>
              ) : (
                availableClasses.map((cls) => (
                  <DropdownMenuItem
                    key={cls.id}
                    onClick={() => handleAddClass(cls.id)}
                    disabled={addingClassId === cls.id}
                    className="flex flex-col items-start gap-1 py-2 cursor-pointer"
                  >
                    <div className="font-medium text-sm">
                      {addingClassId === cls.id && (
                        <Loader2 className="h-3 w-3 mr-1 inline animate-spin" />
                      )}
                      {cls.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {cls.subject} • {cls.grade_level}
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <ClassesGrid 
          classes={classesWithDates} 
          loading={loading}
          showSearch={false}
          showStats={false}
          showCreateButton={false}
        />
      </CardContent>
    </Card>
  );
};
