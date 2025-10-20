import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Sparkles, RefreshCw, Send, TrendingUp, Target } from 'lucide-react';
import { format } from 'date-fns';

interface WeeklyDigestSectionProps {
  studentId: string;
  studentName: string;
}

export function WeeklyDigestSection({ studentId, studentName }: WeeklyDigestSectionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch latest digest
  const { data: digest, isLoading } = useQuery({
    queryKey: ['weekly-digest', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weekly_digests')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  // Generate digest mutation
  const generateDigest = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      const { data, error } = await supabase.functions.invoke('ai-weekly-digest', {
        body: { studentId },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data.digest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-digest', studentId] });
      toast({
        title: "Digest Generated",
        description: "Weekly summary has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate digest",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsGenerating(false);
    },
  });

  // Approve digest mutation
  const approveDigest = useMutation({
    mutationFn: async (digestId: string) => {
      const { error } = await supabase
        .from('weekly_digests')
        .update({ 
          teacher_approved: true,
          approved_by: (await supabase.auth.getUser()).data.user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', digestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-digest', studentId] });
      toast({
        title: "Digest Approved",
        description: "Weekly digest has been approved for delivery.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Send notification mutation
  const sendNotification = useMutation({
    mutationFn: async (digestId: string) => {
      // Get student's user_id
      const { data: student } = await supabase
        .from('students')
        .select('user_id')
        .eq('id', studentId)
        .single();

      if (!student?.user_id) throw new Error('Student user not found');

      // Create notification
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: student.user_id,
          title: 'Your Weekly Summary is Ready!',
          message: `Check out your progress summary for this week.`,
          type: 'info',
          metadata: { digest_id: digestId },
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Notification Sent",
        description: "Student has been notified about their weekly digest.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  const weekStartDate = digest ? new Date(digest.week_start) : null;
  const weekEndDate = digest ? new Date(digest.week_end) : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Weekly Digest
            </CardTitle>
            <CardDescription>
              AI-generated progress summary and next steps
            </CardDescription>
          </div>
          <Button
            onClick={() => generateDigest.mutate()}
            disabled={isGenerating}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            {digest ? 'Regenerate' : 'Generate Digest'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!digest ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No digest generated yet.</p>
            <p className="text-sm mt-2">Click "Generate Digest" to create a weekly summary.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b">
              <div>
                <p className="text-sm font-medium">
                  {weekStartDate && weekEndDate && 
                    `${format(weekStartDate, 'MMM d')} - ${format(weekEndDate, 'MMM d, yyyy')}`
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  Generated {format(new Date(digest.created_at), 'MMM d, h:mm a')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {digest.teacher_approved ? (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Approved
                  </Badge>
                ) : (
                  <Badge variant="secondary">Pending Approval</Badge>
                )}
                {digest.is_read && (
                  <Badge variant="outline">Read by Student</Badge>
                )}
              </div>
            </div>

            {/* Content Preview */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold text-sm">Summary</h4>
                </div>
                <p className="text-sm text-muted-foreground pl-6">
                  {digest.summary_text}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-secondary" />
                  <h4 className="font-semibold text-sm">Next Week's Focus</h4>
                </div>
                <p className="text-sm text-muted-foreground pl-6">
                  {digest.next_focus_text}
                </p>
              </div>

              <div className="space-y-2 rounded-lg bg-accent/50 p-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent-foreground" />
                  <h4 className="font-semibold text-sm text-accent-foreground">AI Insight</h4>
                </div>
                <p className="text-sm text-accent-foreground pl-6">
                  {digest.ai_note_text}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              {!digest.teacher_approved && (
                <Button
                  onClick={() => approveDigest.mutate(digest.id)}
                  disabled={approveDigest.isPending}
                  size="sm"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Digest
                </Button>
              )}
              <Button
                onClick={() => sendNotification.mutate(digest.id)}
                disabled={sendNotification.isPending}
                variant="outline"
                size="sm"
              >
                <Send className="h-4 w-4 mr-2" />
                Notify Student
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
