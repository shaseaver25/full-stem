import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Sparkles, Target, TrendingUp, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface WeeklyDigestBannerProps {
  digest: {
    id: string;
    week_start: string;
    week_end: string;
    summary_text: string;
    next_focus_text: string;
    ai_note_text: string;
    is_read: boolean;
    created_at: string;
  };
  studentName: string;
}

export function WeeklyDigestBanner({ digest, studentName }: WeeklyDigestBannerProps) {
  const [isExpanded, setIsExpanded] = useState(!digest.is_read);
  const [isDismissed, setIsDismissed] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const markAsRead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('weekly_digests')
        .update({ is_read: true })
        .eq('id', digest.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-digest'] });
      toast({
        title: "Digest Marked as Read",
        description: "Great job checking your progress!",
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

  if (isDismissed) return null;

  const weekStartDate = new Date(digest.week_start);
  const weekEndDate = new Date(digest.week_end);

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              Your Weekly Summary, {studentName}!
            </CardTitle>
            {!digest.is_read && (
              <Badge variant="secondary" className="ml-2">New</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDismissed(true)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {format(weekStartDate, 'MMM d')} - {format(weekEndDate, 'MMM d, yyyy')}
        </p>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Summary Snapshot */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Here's how you did this week...</h3>
            </div>
            <p className="text-sm leading-relaxed pl-6">
              {digest.summary_text}
            </p>
          </div>

          {/* Next Week's Focus */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-secondary" />
              <h3 className="font-semibold">Next Week's Focus</h3>
            </div>
            <p className="text-sm leading-relaxed pl-6">
              {digest.next_focus_text}
            </p>
          </div>

          {/* AI Insight */}
          <div className="space-y-2 rounded-lg bg-accent/50 p-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent-foreground" />
              <h3 className="font-semibold text-accent-foreground">AI Insight</h3>
            </div>
            <p className="text-sm leading-relaxed pl-6 text-accent-foreground">
              {digest.ai_note_text}
            </p>
          </div>

          {/* Actions */}
          {!digest.is_read && (
            <div className="flex justify-end pt-2">
              <Button
                onClick={() => markAsRead.mutate()}
                disabled={markAsRead.isPending}
                size="sm"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark as Read
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
