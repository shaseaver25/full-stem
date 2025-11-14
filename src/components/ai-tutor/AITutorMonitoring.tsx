import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageCircle, AlertTriangle, User } from "lucide-react";

interface Conversation {
  id: string;
  user_id: string;
  lesson_id: string;
  started_at: string;
  last_message_at: string;
  message_count: number;
  is_flagged: boolean;
}

export function AITutorMonitoring({ lessonId }: { lessonId: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, [lessonId]);

  const loadConversations = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("ai_tutor_conversations")
      .select("*")
      .eq("lesson_id", lessonId)
      .order("last_message_at", { ascending: false });

    if (data) {
      setConversations(data);
    }
    setIsLoading(false);
  };

  const loadMessages = async (conversationId: string) => {
    const { data } = await supabase
      .from("ai_tutor_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(data);
    }
  };

  const handleConversationClick = (conversationId: string) => {
    setSelectedConversation(conversationId);
    loadMessages(conversationId);
  };

  const getUsersWithMostQuestions = () => {
    const userCounts = conversations.reduce((acc, conv) => {
      acc[conv.user_id] = (acc[conv.user_id] || 0) + conv.message_count;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(userCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  };

  const totalMessages = conversations.reduce((sum, conv) => sum + conv.message_count, 0);
  const flaggedCount = conversations.filter((c) => c.is_flagged).length;
  const topUsers = getUsersWithMostQuestions();

  if (isLoading) {
    return <div>Loading monitoring data...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h4 className="font-semibold">Total Messages</h4>
          </div>
          <p className="text-2xl font-bold">{totalMessages}</p>
          <p className="text-sm text-muted-foreground">{conversations.length} conversations</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-primary" />
            <h4 className="font-semibold">Active Students</h4>
          </div>
          <p className="text-2xl font-bold">{new Set(conversations.map((c) => c.user_id)).size}</p>
          <p className="text-sm text-muted-foreground">unique users</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h4 className="font-semibold">Flagged</h4>
          </div>
          <p className="text-2xl font-bold">{flaggedCount}</p>
          <p className="text-sm text-muted-foreground">need review</p>
        </Card>
      </div>

      <Card className="p-4">
        <h4 className="font-semibold mb-4">Most Active Students</h4>
        <div className="space-y-2">
          {topUsers.map(([userId, count]) => (
            <div key={userId} className="flex items-center justify-between p-2 bg-muted rounded">
              <span className="text-sm">User {userId.slice(0, 8)}...</span>
              <Badge variant="secondary">{count} messages</Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h4 className="font-semibold mb-4">Recent Conversations</h4>
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="flex items-center justify-between p-3 bg-muted rounded cursor-pointer hover:bg-muted/80"
                onClick={() => handleConversationClick(conv.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">User {conv.user_id.slice(0, 8)}...</span>
                    {conv.is_flagged && (
                      <Badge variant="destructive" className="text-xs">
                        Flagged
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {conv.message_count} messages · Last active{" "}
                    {new Date(conv.last_message_at).toLocaleString()}
                  </p>
                </div>
                <MessageCircle className="w-5 h-5 text-muted-foreground" />
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      <Dialog open={!!selectedConversation} onOpenChange={() => setSelectedConversation(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Conversation Details</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                  <div
                    className={`rounded-lg p-3 max-w-[80%] ${
                      msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.created_at).toLocaleString()}
                    </p>
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-secondary-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
