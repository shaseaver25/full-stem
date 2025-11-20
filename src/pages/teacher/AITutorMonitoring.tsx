import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Flag, 
  TrendingUp, 
  Users,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

interface Conversation {
  id: string;
  user_id: string;
  lesson_id: string;
  started_at: string;
  last_message_at: string;
  message_count: number;
  is_flagged: boolean;
  student_name: string;
  lesson_title: string;
  messages: Message[];
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  tokens_used?: number;
}

interface UsageStats {
  total_conversations: number;
  total_messages: number;
  active_today: number;
  flagged_count: number;
  avg_messages_per_conversation: number;
  most_active_lesson: string;
}

export default function AITutorMonitoring() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'flagged'>('all');

  // LOAD ALL CONVERSATIONS FOR TEACHER'S LESSONS
  useEffect(() => {
    loadConversations();
    loadStats();
  }, [filterTab]);

  const loadConversations = async () => {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get teacher profile
      const { data: teacherProfile } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!teacherProfile) return;

      // Get teacher's classes
      const { data: classes } = await supabase
        .from('classes')
        .select('id')
        .eq('teacher_id', teacherProfile.id);

      if (!classes || classes.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const classIds = classes.map(c => c.id);

      // Get lessons for these classes
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id, title, class_id')
        .in('class_id', classIds);

      if (!lessons || lessons.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const lessonIds = lessons.map(l => l.id);

      // Build query based on filter
      let query = supabase
        .from('ai_tutor_conversations')
        .select(`
          id,
          user_id,
          lesson_id,
          started_at,
          last_message_at,
          message_count,
          is_flagged
        `)
        .in('lesson_id', lessonIds)
        .order('last_message_at', { ascending: false });

      if (filterTab === 'active') {
        const today = new Date().toISOString().split('T')[0];
        query = query.gte('last_message_at', today);
      } else if (filterTab === 'flagged') {
        query = query.eq('is_flagged', true);
      }

      const { data: convs, error } = await query;

      if (error) throw error;

      // Get student info and format data
      const formattedConversations = await Promise.all(
        (convs || []).map(async (conv) => {
          const lesson = lessons.find(l => l.id === conv.lesson_id);
          
          // Get student profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', conv.user_id)
            .single();

          return {
            ...conv,
            student_name: profile?.full_name || 'Unknown Student',
            lesson_title: lesson?.title || 'Unknown Lesson',
            messages: []
          };
        })
      );

      setConversations(formattedConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get teacher profile
      const { data: teacherProfile } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!teacherProfile) return;

      // Get teacher's classes
      const { data: classes } = await supabase
        .from('classes')
        .select('id')
        .eq('teacher_id', teacherProfile.id);

      if (!classes || classes.length === 0) return;

      const classIds = classes.map(c => c.id);

      // Get lessons for these classes
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id, title, class_id')
        .in('class_id', classIds);

      if (!lessons || lessons.length === 0) return;

      const lessonIds = lessons.map(l => l.id);

      // Get conversation stats
      const { data: convs } = await supabase
        .from('ai_tutor_conversations')
        .select('*')
        .in('lesson_id', lessonIds);

      const today = new Date().toISOString().split('T')[0];
      const activeToday = convs?.filter(c => 
        c.last_message_at?.startsWith(today)
      ).length || 0;

      const flaggedCount = convs?.filter(c => c.is_flagged).length || 0;

      const totalMessages = convs?.reduce((sum, c) => sum + (c.message_count || 0), 0) || 0;
      const avgMessages = convs?.length ? totalMessages / convs.length : 0;

      // Find most active lesson
      const lessonCounts = convs?.reduce((acc, c) => {
        acc[c.lesson_id] = (acc[c.lesson_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostActiveLessonId = Object.entries(lessonCounts || {})
        .sort((a, b) => b[1] - a[1])[0]?.[0];

      const mostActiveLesson = lessons?.find(l => l.id === mostActiveLessonId);

      setStats({
        total_conversations: convs?.length || 0,
        total_messages: totalMessages,
        active_today: activeToday,
        flagged_count: flaggedCount,
        avg_messages_per_conversation: Math.round(avgMessages),
        most_active_lesson: mostActiveLesson?.title || 'N/A'
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadConversationMessages = async (conversationId: string) => {
    try {
      const { data: messages } = await supabase
        .from('ai_tutor_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        // Type cast the role to match our Message interface
        const typedMessages: Message[] = (messages || []).map(msg => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          created_at: msg.created_at,
          tokens_used: msg.tokens_used || undefined
        }));

        setSelectedConversation({
          ...conversation,
          messages: typedMessages
        });
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const toggleFlag = async (conversationId: string, currentFlag: boolean) => {
    try {
      await supabase
        .from('ai_tutor_conversations')
        .update({ is_flagged: !currentFlag })
        .eq('id', conversationId);

      // Refresh conversations
      loadConversations();
      
      // Update selected conversation if it's the one being flagged
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation({
          ...selectedConversation,
          is_flagged: !currentFlag
        });
      }
    } catch (error) {
      console.error('Error toggling flag:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">AI Tutor Monitoring</h1>
        <p className="text-muted-foreground">
          Monitor student questions and AI tutor interactions across your lessons
        </p>
      </div>

      {/* STATS OVERVIEW */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Conversations</p>
                  <p className="text-2xl font-bold">{stats.total_conversations}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Today</p>
                  <p className="text-2xl font-bold">{stats.active_today}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Flagged</p>
                  <p className="text-2xl font-bold">{stats.flagged_count}</p>
                </div>
                <Flag className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Questions</p>
                  <p className="text-2xl font-bold">{stats.avg_messages_per_conversation}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CONVERSATIONS LIST */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
            <Tabs value={filterTab} onValueChange={(v) => setFilterTab(v as any)}>
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                <TabsTrigger value="active" className="flex-1">Active</TabsTrigger>
                <TabsTrigger value="flagged" className="flex-1">Flagged</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading conversations...
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No conversations yet
                </div>
              ) : (
                <div className="space-y-3">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => loadConversationMessages(conv.id)}
                      className={`
                        p-4 rounded-lg border cursor-pointer transition-colors
                        ${selectedConversation?.id === conv.id 
                          ? 'bg-primary/10 border-primary' 
                          : 'hover:bg-muted'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{conv.student_name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {conv.lesson_title}
                          </p>
                        </div>
                        {conv.is_flagged && (
                          <Flag className="h-4 w-4 text-red-500 flex-shrink-0" />
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{conv.message_count} messages</span>
                        <span>{format(new Date(conv.last_message_at), 'MMM d, h:mm a')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* CONVERSATION DETAIL */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {selectedConversation 
                  ? `${selectedConversation.student_name} - ${selectedConversation.lesson_title}`
                  : 'Select a conversation'
                }
              </CardTitle>
              {selectedConversation && (
                <Button
                  variant={selectedConversation.is_flagged ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => toggleFlag(
                    selectedConversation.id, 
                    selectedConversation.is_flagged
                  )}
                >
                  <Flag className="h-4 w-4 mr-2" />
                  {selectedConversation.is_flagged ? 'Unflag' : 'Flag'}
                </Button>
              )}
            </div>
            {selectedConversation && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Started {format(new Date(selectedConversation.started_at), 'MMM d, yyyy h:mm a')}
              </div>
            )}
          </CardHeader>
          <CardContent>
            {!selectedConversation ? (
              <div className="flex items-center justify-center h-[600px] text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to view details</p>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {selectedConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`
                        p-4 rounded-lg
                        ${message.role === 'user' 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'bg-green-50 border border-green-200'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={message.role === 'user' ? 'default' : 'secondary'}>
                          {message.role === 'user' ? 'Student' : 'Pivot AI'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(message.created_at), 'h:mm a')}
                        </span>
                        {message.tokens_used && (
                          <span className="text-xs text-muted-foreground">
                            ({message.tokens_used} tokens)
                          </span>
                        )}
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* INSIGHTS SECTION */}
      {stats && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                <div>
                  <p className="font-semibold">Most Active Lesson</p>
                  <p className="text-sm text-muted-foreground">
                    {stats.most_active_lesson} is getting the most AI tutor questions
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-500 mt-1" />
                <div>
                  <p className="font-semibold">Engagement Level</p>
                  <p className="text-sm text-muted-foreground">
                    {stats.active_today > 0 
                      ? `${stats.active_today} students asked questions today`
                      : 'No activity today yet'
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
