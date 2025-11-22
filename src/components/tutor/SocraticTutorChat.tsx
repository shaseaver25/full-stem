import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, X, Send, Loader2, Mic, MicOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DraggableFloatingButton } from '@/components/ui/DraggableFloatingButton';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import pivotLogo from '@/assets/pivot-logo.svg';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SocraticTutorChatProps {
  lessonId: string;
  lessonTitle: string;
  lessonContent?: string;
}

export const SocraticTutorChat: React.FC<SocraticTutorChatProps> = ({
  lessonId,
  lessonTitle,
  lessonContent
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your Socratic tutor. I'm here to help you understand this lesson by asking guiding questions. What would you like to explore?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const { 
    isRecording, 
    isProcessing, 
    setIsProcessing,
    startRecording, 
    stopRecording, 
    convertBlobToBase64 
  } = useVoiceRecording();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('socratic-tutor', {
        body: {
          message: userMessage,
          conversationId,
          lessonId,
          lessonTitle,
          lessonContent
        }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });

      // Remove the user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleVoiceInput = async () => {
    if (isRecording) {
      // Stop recording and transcribe
      try {
        setIsProcessing(true);
        const audioBlob = await stopRecording();
        const base64Audio = await convertBlobToBase64(audioBlob);

        // Send to transcription endpoint
        const { data, error } = await supabase.functions.invoke('transcribe-voice', {
          body: { audio: base64Audio }
        });

        if (error) {
          throw error;
        }

        if (data.error) {
          throw new Error(data.error);
        }

        if (data.text) {
          setInput(data.text);
          toast({
            title: 'Transcription Complete',
            description: 'Your speech has been converted to text.',
          });
        }
      } catch (error) {
        console.error('Error transcribing audio:', error);
        toast({
          title: 'Transcription Failed',
          description: error instanceof Error ? error.message : 'Could not transcribe audio',
          variant: 'destructive'
        });
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Start recording
      const started = await startRecording();
      if (!started) {
        toast({
          title: 'Microphone Access Required',
          description: 'Please allow microphone access to use voice input.',
          variant: 'destructive'
        });
      }
    }
  };

  if (!isOpen) {
    return (
      <DraggableFloatingButton
        icon={
          <img
            src={pivotLogo}
            alt="Open Pivot Socratic tutor"
            className="h-16 w-16 pivot-icon"
          />
        }
        label="Ask Tutor"
        onClick={() => setIsOpen(true)}
        initialPosition={{ x: window.innerWidth - 100, y: window.innerHeight - 180 }}
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg p-2"
      />
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[600px] shadow-2xl border-2 border-primary/20 z-50 flex flex-col">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white pb-4">
        <div className="flex items-center justify-between">
          <img
            src={pivotLogo}
            alt="Pivot Socratic tutor"
            className="h-10 w-10 pivot-icon"
          />
          <CardTitle className="text-lg">Socratic Tutor</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-xs text-white/90 mt-1">
          I'll help you learn through questions
        </p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p className="text-sm text-muted-foreground">Thinking...</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Button
              onClick={handleVoiceInput}
              disabled={isLoading || isProcessing}
              size="icon"
              variant={isRecording ? "destructive" : "outline"}
              className={isRecording ? "animate-pulse" : ""}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isRecording ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isRecording ? "Recording..." : "Ask a question or click the mic..."}
              disabled={isLoading || isRecording || isProcessing}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading || isRecording || isProcessing}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {isRecording ? (
              <span className="text-destructive font-medium">● Recording - Click mic to stop</span>
            ) : (
              <>Press Enter to send • Click mic to speak • Shift+Enter for new line</>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
