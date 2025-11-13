import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, User, Flag, MessageSquare } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface AITutorMonitoringProps {
  lessonId: string;
}

export function AITutorMonitoring({ lessonId }: AITutorMonitoringProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  // Fetch all conversations for this lesson
  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['tutor-conversations', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_tutor_conversations')
        .select(`
          id,
          user_id,
          message_count,
          last_message_at,
          is_flagged,
          started_at
        `)
        .eq('lesson_id', lessonId)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Fetch user profiles for each conversation
      const conversationsWithUsers = await Promise.all(
        data.map(async (conv) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', conv.user_id)
            .single();

          const { data: student } = await supabase
            .from('students')
            .select('first_name, last_name')
            .eq('user_id', conv.user_id)
            .single();

          return {
            ...conv,
            profile,
            student,
          };
        })
      );

      return conversationsWithUsers;
    },
  });

  // Fetch messages for selected conversation
  const { data: messages } = useQuery({
    queryKey: ['tutor-messages-monitoring', selectedConversation],
    queryFn: async () => {
      if (!selectedConversation) return [];
      
      const { data, error } = await supabase
        .from('ai_tutor_messages')
        .select('*')
        .eq('conversation_id', selectedConversation)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!selectedConversation,
  });

  // Get usage statistics
  const stats = {
    totalStudents: conversations?.length || 0,
    totalMessages: conversations?.reduce((sum, conv) => sum + conv.message_count, 0) || 0,
    avgMessagesPerStudent: conversations?.length 
      ? ((conversations.reduce((sum, conv) => sum + conv.message_count, 0) / conversations.length).toFixed(1))
      : 0,
  };

  if (conversationsLoading) {
    return <div className="text-center py-8">Loading AI tutor activity...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Students Using AI Tutor</CardDescription>
            <CardTitle className="text-3xl">{stats.totalStudents}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Questions Asked</CardDescription>
            <CardTitle className="text-3xl">{stats.totalMessages}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg Questions/Student</CardDescription>
            <CardTitle className="text-3xl">{stats.avgMessagesPerStudent}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Conversations List and Detail */}
      <div className="grid grid-cols-5 gap-6">
        {/* Student List */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Student Conversations
            </CardTitle>
            <CardDescription>
              Click a student to view their conversation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!conversations || conversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No students have used the AI tutor yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {conversations.map((conv) => {
                  const studentName = conv.student
                    ? `${conv.student.first_name} ${conv.student.last_name}`
                    : conv.profile?.full_name || conv.profile?.email || 'Unknown Student';
                  
                  return (
                    <div
                      key={conv.id}
                      className={`p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedConversation === conv.id ? 'bg-muted border-primary' : ''
                      }`}
                      onClick={() => setSelectedConversation(conv.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{studentName}</p>
                            <p className="text-xs text-muted-foreground">
                              {conv.message_count} messages
                            </p>
                          </div>
                        </div>
                        {conv.is_flagged && (
                          <Flag className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last active: {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conversation Detail */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Conversation Details</CardTitle>
            <CardDescription>
              View the full conversation between student and AI tutor
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedConversation ? (
              <div className="text-center py-16 text-muted-foreground">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p>Select a student to view their conversation</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4">
                {messages?.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    
                    <div className={`flex-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {message.role === 'user' ? 'Student' : 'AI Tutor'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(message.created_at), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      
                      <div className={`inline-block max-w-[85%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-primary/10 text-foreground'
                          : 'bg-muted'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
