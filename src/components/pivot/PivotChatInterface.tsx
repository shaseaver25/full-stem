import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import pivotLogo from '@/assets/pivot-logo.svg';

interface ChatMessage {
  id: string;
  sender: 'user' | 'pivot';
  text: string;
  timestamp: Date;
}

interface PivotChatInterfaceProps {
  lessonId?: string;
  onClose: () => void;
}

const PivotChatInterface: React.FC<PivotChatInterfaceProps> = ({
  lessonId,
  onClose
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'pivot',
      text: "Hi! I'm Pivot, your AI learning assistant. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-tutor-chat', {
        body: {
          messages: messages.map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text
          })),
          systemPrompt: `You are Pivot, a friendly and helpful AI learning assistant for students. Help students understand concepts, answer questions, and guide their learning${lessonId ? ' in this lesson' : ''}. Keep responses clear, encouraging, and educational.`
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const aiResponse = data.choices?.[0]?.message?.content || 'Sorry, I had trouble generating a response.';

      const pivotMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'pivot',
        text: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, pivotMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: 'destructive'
      });
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="pivot-chat-interface">
      <div className="pivot-chat-header">
        <div className="pivot-header-content">
          <img src={pivotLogo} alt="Pivot" className="pivot-header-icon" />
          <div>
            <h3 className="text-lg font-semibold m-0">Pivot</h3>
            <p className="text-xs m-0 opacity-90">Your AI Learning Assistant</p>
          </div>
        </div>
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="close-chat-btn"
          aria-label="Close chat"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="pivot-chat-messages" ref={scrollRef}>
        <div className="p-4 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`chat-message chat-message-${message.sender}`}
            >
              {message.sender === 'pivot' && (
                <img
                  src={pivotLogo}
                  alt="Pivot"
                  className="message-avatar"
                />
              )}
              <div className={`message-content ${message.sender === 'user' ? 'message-content-user' : ''}`}>
                <p className="m-0 text-sm leading-relaxed">{message.text}</p>
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="chat-message chat-message-pivot">
              <img src={pivotLogo} alt="Pivot" className="message-avatar" />
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="pivot-chat-input">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything..."
          disabled={isLoading}
          className="flex-1 border rounded-full px-4"
        />
        <Button
          onClick={handleSendMessage}
          disabled={isLoading || !inputValue.trim()}
          size="icon"
          className="send-message-btn"
          aria-label="Send message"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default PivotChatInterface;
