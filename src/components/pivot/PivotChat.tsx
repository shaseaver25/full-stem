import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Loader2, MessageSquare, X } from 'lucide-react';
import { usePivotConversation } from '@/hooks/usePivotConversation';
import { useAuth } from '@/contexts/AuthContext';
import { PivotHintButton } from './PivotHintButton';
import { PivotHintCard } from './PivotHintCard';

interface Message {
  id: string;
  sender: 'student' | 'pivot';
  text: string;
  timestamp: Date;
  type?: string;
}

interface PivotChatProps {
  lessonId: string;
  componentId: string;
  componentType: string;
  questionId?: string;
  questionText?: string;
  correctAnswer?: string;
  onClose?: () => void;
}

export const PivotChat: React.FC<PivotChatProps> = ({
  lessonId,
  componentId,
  componentType,
  questionId,
  questionText,
  correctAnswer,
  onClose
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [isGeneratingHint, setIsGeneratingHint] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { startConversation, sendMessage, endConversation, requestHint, isLoading } = usePivotConversation();

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize conversation
  useEffect(() => {
    const initConversation = async () => {
      if (!user?.id) return;
      
      const id = await startConversation({
        studentId: user.id,
        lessonId,
        componentId,
        componentType,
        questionId,
        questionText
      });
      
      // Add welcome message regardless of whether conversation was created
      const welcomeMsg: Message = {
        id: 'welcome',
        sender: 'pivot',
        text: `Hi! I'm Pivot, your learning partner. I noticed you're working on this question. I won't give you the answer, but I'll help you figure it out! Let's start here: What part feels tricky?`,
        timestamp: new Date(),
        type: 'welcome'
      };
      setMessages([welcomeMsg]);
      
      if (id) {
        setConversationId(id);
      }
    };
    
    initConversation();
  }, [user, lessonId, componentId, componentType, questionId, questionText, startConversation]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !conversationId) return;
    
    // Add student message
    const studentMsg: Message = {
      id: `student-${Date.now()}`,
      sender: 'student',
      text: inputText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, studentMsg]);
    setInputText('');
    
    // Get AI response
    const response = await sendMessage({
      conversationId,
      studentMessage: inputText,
      context: {
        questionText,
        correctAnswer,
        previousMessages: messages,
        hintsUsed
      }
    });
    
    if (response && response.text) {
      const pivotMsg: Message = {
        id: response.messageId || `pivot-${Date.now()}`,
        sender: 'pivot',
        text: response.text,
        timestamp: new Date(),
        type: response.messageType
      };
      setMessages(prev => [...prev, pivotMsg]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRequestHint = async () => {
    if (!conversationId || hintsUsed >= 3) return;
    
    setIsGeneratingHint(true);
    
    const hint = await requestHint({
      conversationId,
      questionText: questionText || '',
      correctAnswer,
      questionType: componentType,
      previousHints: messages
        .filter(m => m.type === 'hint')
        .map(m => m.text.replace(/💡 Hint \d\/3: /, '')),
      conversationHistory: messages,
      hintNumber: hintsUsed + 1
    });
    
    if (hint) {
      const hintMsg: Message = {
        id: hint.id,
        sender: 'pivot',
        text: hint.text,
        timestamp: new Date(),
        type: 'hint'
      };
      setMessages(prev => [...prev, hintMsg]);
      setHintsUsed(prev => prev + 1);
    }
    
    setIsGeneratingHint(false);
  };

  const handleClose = () => {
    if (conversationId) {
      endConversation(conversationId, false);
    }
    onClose?.();
  };

  return (
    <Card className="flex flex-col h-[600px] w-full max-w-2xl mx-auto shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-teal-50 to-blue-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
            🔄
          </div>
          <div>
            <h3 className="font-semibold text-lg">Chat with Pivot</h3>
            <p className="text-xs text-muted-foreground">Your AI learning partner</p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Context Card */}
      {questionText && (
        <div className="p-3 bg-slate-50 border-b">
          <p className="text-sm font-medium text-slate-700">Working on:</p>
          <p className="text-sm text-slate-600 mt-1">{questionText}</p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50 to-white">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`${msg.type === 'hint' ? 'w-full' : 'max-w-[80%]'} ${
                msg.type === 'hint' 
                  ? '' 
                  : msg.sender === 'student'
                  ? 'bg-blue-500 text-white rounded-lg p-3 shadow-sm'
                  : 'bg-teal-100 text-teal-900 border border-teal-200 rounded-lg p-3 shadow-sm'
              }`}
            >
              {msg.type === 'hint' ? (
                <PivotHintCard
                  hintNumber={hintsUsed >= messages.filter(m => m.type === 'hint').findIndex(m => m.id === msg.id) + 1 
                    ? messages.filter(m => m.type === 'hint').findIndex(m => m.id === msg.id) + 1 
                    : 1}
                  hintText={msg.text.replace(/💡 Hint \d\/3: /, '')}
                  timestamp={msg.timestamp}
                />
              ) : (
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              )}
            </div>
          </div>
        ))}
        
        {(isLoading || isGeneratingHint) && (
          <div className="flex justify-start">
            <div className="bg-teal-100 text-teal-900 rounded-lg p-3 flex items-center gap-2 border border-teal-200">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">
                {isGeneratingHint ? 'Generating hint...' : 'Pivot is thinking...'}
              </span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-slate-50 space-y-2">
        <Textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your response..."
          disabled={isLoading || isGeneratingHint}
          className="resize-none bg-white"
          rows={3}
        />
        
        <div className="flex items-center justify-between">
          <PivotHintButton
            hintsUsed={hintsUsed}
            maxHints={3}
            onRequestHint={handleRequestHint}
            isLoading={isGeneratingHint}
            disabled={isLoading}
          />
          
          <Button 
            onClick={handleSendMessage} 
            disabled={!inputText.trim() || isLoading || isGeneratingHint}
            className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            Send
          </Button>
        </div>
      </div>
    </Card>
  );
};
