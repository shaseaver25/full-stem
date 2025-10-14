import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, Users, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface BrowseClassesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AvailableClass {
  id: string;
  name: string;
  subject: string;
  grade_level: string;
  description: string;
  enrollment_count?: number;
}

export const BrowseClassesModal = ({ open, onOpenChange }: BrowseClassesModalProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [classes, setClasses] = useState<AvailableClass[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingClassId, setAddingClassId] = useState<string | null>(null);

  // Fetch published/template classes when modal opens
  const fetchAvailableClasses = async () => {
    if (!open || classes.length > 0) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          id,
          name,
          subject,
          grade_level,
          description,
          class_students (count)
        `)
        .eq('published', true)
        .order('name');

      if (error) throw error;

      const formattedClasses = (data || []).map((cls: any) => ({
        id: cls.id,
        name: cls.name,
        subject: cls.subject || 'General',
        grade_level: cls.grade_level || 'All Levels',
        description: cls.description || 'No description available',
        enrollment_count: cls.class_students?.[0]?.count || 0,
      }));

      setClasses(formattedClasses);
    } catch (error: any) {
      console.error('Error fetching classes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load available classes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

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
      const originalClass = classes.find(c => c.id === classId);
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

      onOpenChange(false);
      
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

  // Fetch classes when modal opens
  if (open && classes.length === 0) {
    fetchAvailableClasses();
  }

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.grade_level.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Browse Available Classes</DialogTitle>
          <DialogDescription>
            Select from pre-built classes to add to your roster
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search classes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Classes List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredClasses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {classes.length === 0 ? 'No classes available' : 'No classes found'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {filteredClasses.map((cls) => (
                <Card key={cls.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-base mb-2">{cls.name}</CardTitle>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {cls.subject}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {cls.grade_level}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2 text-sm">
                      {cls.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span className="text-xs">
                          {cls.enrollment_count || 0} enrolled
                        </span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddClass(cls.id)}
                        disabled={addingClassId === cls.id}
                      >
                        {addingClassId === cls.id ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <Plus className="h-3 w-3 mr-1" />
                            Add Class
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
