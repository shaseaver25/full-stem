import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StartConversationParams {
  studentId: string;
  lessonId: string;
  componentId: string;
  componentType: string;
  questionId?: string;
  questionText?: string;
}

interface SendMessageParams {
  conversationId: string;
  studentMessage: string;
  context: {
    questionText?: string;
    correctAnswer?: string;
    previousMessages: any[];
    hintsUsed: number;
    gradeLevel?: string;
  };
}

export const usePivotConversation = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Helper to check if string is valid UUID
  const isValidUUID = (str?: string): boolean => {
    if (!str) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  const startConversation = async (params: StartConversationParams) => {
    setIsLoading(true);
    try {
      console.log('🔄 Starting Pivot conversation:', params);
      
      // Only include question_id if it's a valid UUID
      const questionId = isValidUUID(params.questionId) ? params.questionId : null;
      
      const { data, error } = await supabase
        .from('pivot_conversations')
        .insert({
          student_id: params.studentId,
          lesson_id: params.lessonId,
          component_id: params.componentId,
          component_type: params.componentType,
          question_id: questionId,
          question_text: params.questionText
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error starting conversation:', error);
        throw error;
      }
      
      console.log('✅ Conversation started:', data.id);
      return data.id;
    } catch (error) {
      console.error('💥 Failed to start conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to start conversation with Pivot',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (params: SendMessageParams) => {
    setIsLoading(true);
    try {
      console.log('💬 Sending message to Pivot:', params.studentMessage);
      
      // Record student message
      const { error: studentMsgError } = await supabase
        .rpc('record_pivot_message', {
          p_conversation_id: params.conversationId,
          p_sender: 'student',
          p_message_text: params.studentMessage,
          p_message_type: 'response'
        });

      if (studentMsgError) {
        console.error('❌ Error recording student message:', studentMsgError);
        throw studentMsgError;
      }

      // Get AI response
      const { data, error } = await supabase.functions.invoke('pivot-chat', {
        body: {
          conversationId: params.conversationId,
          studentMessage: params.studentMessage,
          context: params.context
        }
      });

      if (error) {
        console.error('❌ Error getting AI response:', error);
        throw error;
      }
      
      console.log('✅ Got Pivot response');
      return data;
    } catch (error) {
      console.error('💥 Failed to send message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message to Pivot',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const endConversation = async (conversationId: string, wasSuccessful: boolean) => {
    try {
      console.log('🏁 Ending conversation:', conversationId, 'successful:', wasSuccessful);
      
      const { error } = await supabase
        .from('pivot_conversations')
        .update({
          ended_at: new Date().toISOString(),
          was_successful: wasSuccessful
        })
        .eq('id', conversationId);

      if (error) throw error;
      
      console.log('✅ Conversation ended');
    } catch (error) {
      console.error('❌ Error ending conversation:', error);
    }
  };

  const requestHint = async (params: {
    conversationId: string;
    questionText: string;
    correctAnswer?: string;
    questionType?: string;
    previousHints: string[];
    conversationHistory: any[];
    hintNumber: number;
  }) => {
    setIsLoading(true);
    try {
      console.log('💡 Requesting hint:', params.hintNumber);
      
      const { data, error } = await supabase.functions.invoke('pivot-generate-hint', {
        body: {
          conversationId: params.conversationId,
          questionText: params.questionText,
          correctAnswer: params.correctAnswer,
          questionType: params.questionType || 'general',
          previousHints: params.previousHints,
          conversationHistory: params.conversationHistory,
          hintNumber: params.hintNumber
        }
      });

      if (error) throw error;
      
      console.log('✅ Hint generated:', data.hint);
      return data.hint;
    } catch (error) {
      console.error('❌ Error requesting hint:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate hint',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    startConversation,
    sendMessage,
    endConversation,
    requestHint,
    isLoading
  };
};
