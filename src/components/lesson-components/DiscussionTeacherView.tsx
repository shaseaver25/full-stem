import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Users, BarChart3 } from 'lucide-react';

interface DiscussionTeacherViewProps {
  lessonComponentId: string;
}

export function DiscussionTeacherView({ lessonComponentId }: DiscussionTeacherViewProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['discussion-stats', lessonComponentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discussion_posts' as any)
        .select('user_id, created_at, parent_post_id')
        .eq('lesson_component_id', lessonComponentId)
        .eq('is_deleted', false);

      if (error) throw error;

      const uniqueParticipants = new Set((data as any[]).map(p => p.user_id)).size;
      const totalPosts = (data as any[]).length;
      const topLevelPosts = (data as any[]).filter(p => !p.parent_post_id).length;
      const replies = totalPosts - topLevelPosts;

      return {
        uniqueParticipants,
        totalPosts,
        topLevelPosts,
        replies,
        averagePostsPerStudent: uniqueParticipants > 0 
          ? (totalPosts / uniqueParticipants).toFixed(1) 
          : '0',
      };
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-24" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Total Responses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats?.topLevelPosts || 0}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Users className="h-4 w-4" />
            Participants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats?.uniqueParticipants || 0}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Avg Posts/Student
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats?.averagePostsPerStudent || 0}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Total Replies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats?.replies || 0}</p>
        </CardContent>
      </Card>
    </div>
  );
}
