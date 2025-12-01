import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface AssignTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  currentTeacherId: string;
}

export function AssignTeacherDialog({ open, onOpenChange, classId, currentTeacherId }: AssignTeacherDialogProps) {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const queryClient = useQueryClient();

  // Fetch all teachers
  const { data: teachers, isLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      // First get all teacher profiles
      const { data: teacherProfiles, error: tpError } = await supabase
        .from('teacher_profiles')
        .select('id, user_id');

      if (tpError) throw tpError;
      if (!teacherProfiles || teacherProfiles.length === 0) return [];

      // Then get profile info for each
      const userIds = teacherProfiles.map(tp => tp.user_id);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      if (profileError) throw profileError;

      // Combine the data
      return teacherProfiles.map((tp) => {
        const profile = profiles?.find(p => p.id === tp.user_id);
        return {
          id: tp.id,
          userId: tp.user_id,
          name: profile?.full_name || profile?.email || 'Unknown Teacher',
          email: profile?.email || ''
        };
      }).sort((a, b) => a.name.localeCompare(b.name));
    },
    enabled: open
  });

  // Assign teacher mutation
  const assignTeacherMutation = useMutation({
    mutationFn: async (teacherProfileId: string) => {
      const { data, error } = await supabase.functions.invoke('assign-class-teacher', {
        body: { classId, teacherProfileId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class', classId] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({
        title: '✅ Teacher Assigned',
        description: 'The teacher has been successfully assigned to this class.',
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to Assign Teacher',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    }
  });

  const handleAssign = () => {
    if (!selectedTeacherId) {
      toast({
        title: 'No Teacher Selected',
        description: 'Please select a teacher to assign',
        variant: 'destructive',
      });
      return;
    }

    assignTeacherMutation.mutate(selectedTeacherId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Teacher to Class</DialogTitle>
          <DialogDescription>
            Select a teacher to assign to this class. This will replace the current teacher.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers?.map((teacher) => (
                  <SelectItem
                    key={teacher.id}
                    value={teacher.id}
                    disabled={teacher.id === currentTeacherId}
                  >
                    {teacher.name} {teacher.email && `(${teacher.email})`}
                    {teacher.id === currentTeacherId && ' (Current)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedTeacherId || assignTeacherMutation.isPending}
          >
            {assignTeacherMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Assign Teacher
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
