import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AITutorChatProps {
  lessonId: string;
  lessonTitle: string;
}

export function AITutorChat({ lessonId, lessonTitle }: AITutorChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load question count
  useEffect(() => {
    const loadUsage = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("ai_tutor_usage")
        .select("questions_asked")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .eq("date", new Date().toISOString().split("T")[0])
        .single();

      if (data) {
        setQuestionCount(data.questions_asked || 0);
      }
    };

    loadUsage();
  }, [user, lessonId]);

  // Load or create conversation
  useEffect(() => {
    const loadConversation = async () => {
      if (!user) return;

      const { data: existing } = await supabase
        .from("ai_tutor_conversations")
        .select("id, ai_tutor_messages(role, content, created_at)")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .order("started_at", { ascending: false })
        .limit(1)
        .single();

      if (existing) {
        setConversationId(existing.id);
        const msgs = (existing.ai_tutor_messages as any[] || []).map((m: any) => ({
          role: m.role,
          content: m.content,
        }));
        setMessages(msgs);
      } else {
        const { data: newConv } = await supabase
          .from("ai_tutor_conversations")
          .insert({
            user_id: user.id,
            lesson_id: lessonId,
          })
          .select()
          .single();

        if (newConv) {
          setConversationId(newConv.id);
        }
      }
    };

    loadConversation();
  }, [user, lessonId]);

  const sendMessage = async () => {
    if (!input.trim() || !user || !conversationId) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Save user message
      await supabase.from("ai_tutor_messages").insert({
        conversation_id: conversationId,
        role: "user",
        content: userMessage.content,
      });

      // Call edge function with Gemini
      const systemPrompt = `You are an AI tutor helping a student with the lesson: "${lessonTitle}". 
Provide clear, educational responses that encourage learning and understanding. 
Keep answers concise but thorough. Ask follow-up questions to check understanding.`;

      const { data: functionData, error: functionError } = await supabase.functions.invoke("ai-tutor-chat", {
        body: {
          messages: messages.concat(userMessage).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          systemPrompt,
        },
      });

      if (functionError) {
        throw functionError;
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: functionData.choices[0].message.content,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Save assistant message
      await supabase.from("ai_tutor_messages").insert({
        conversation_id: conversationId,
        role: "assistant",
        content: assistantMessage.content,
      });

      // Increment usage
      await supabase.rpc("increment_tutor_usage", {
        p_user_id: user.id,
        p_lesson_id: lessonId,
      });

      setQuestionCount((prev) => prev + 1);

      // Update conversation
      await supabase
        .from("ai_tutor_conversations")
        .update({
          last_message_at: new Date().toISOString(),
          message_count: messages.length + 2,
        })
        .eq("id", conversationId);
    } catch (error: any) {
      console.error("AI Tutor error:", error);
      
      if (error.message?.includes("Rate limits exceeded")) {
        toast.error("Rate limit exceeded. Please try again in a moment.");
      } else if (error.message?.includes("Payment required")) {
        toast.error("AI service requires payment. Please contact your administrator.");
      } else {
        toast.error("Failed to get response from AI tutor. Please try again.");
      }
      
      // Remove the user message if failed
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="flex flex-col h-[600px] p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">AI Tutor</h3>
        <span className="text-sm text-muted-foreground">
          {questionCount} questions today
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Ask me anything about "{lessonTitle}"</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
            )}
            <div
              className={`rounded-lg p-3 max-w-[80%] ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-secondary-foreground" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="rounded-lg p-3 bg-muted">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question..."
          className="min-h-[60px]"
          disabled={isLoading}
        />
        <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>
    </Card>
  );
}
