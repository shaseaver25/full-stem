import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PersonalizeRequest, PersonalizeResponse } from '@/types/personalizationTypes';

export const usePersonalization = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [personalizationResult, setPersonalizationResult] = useState<PersonalizeResponse | null>(null);
  const [originalText, setOriginalText] = useState('');
  const { toast } = useToast();

  const personalizeAssignment = async (request: PersonalizeRequest): Promise<PersonalizeResponse> => {
    const { data, error } = await supabase.functions.invoke('personalize-assignment', {
      body: request,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  };

  const personalizeMutation = useMutation({
    mutationFn: personalizeAssignment,
    onSuccess: (data, variables) => {
      setPersonalizationResult(data);
      setOriginalText(variables.base_assignment);
      setIsModalOpen(true);
    },
    onError: (error) => {
      toast({
        title: "Personalization Failed",
        description: error.message || "Failed to personalize assignment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAccept = () => {
    if (!personalizationResult || !originalText) return;
    
    // Console audit log as requested
    console.log('Personalization audit:', {
      assignment_id: 'current_assignment', // In real app, would be actual assignment ID
      student_id: personalizationResult ? 'current_user' : null, // In real app, would be actual student ID
      accepted: true,
      changed_elements: personalizationResult.changed_elements,
      timestamp: new Date().toISOString(),
    });

    // For MVP, just log to console
    console.log('Personalized assignment accepted:', personalizationResult?.personalized_text);
    toast({
      title: "Personalization Applied",
      description: "Assignment has been personalized based on student interests.",
    });
    setIsModalOpen(false);
    setPersonalizationResult(null);
  };

  const handleReset = () => {
    setIsModalOpen(false);
    setPersonalizationResult(null);
    setOriginalText('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return {
    personalizeAssignment: personalizeMutation.mutate,
    isPersonalizing: personalizeMutation.isPending,
    isModalOpen,
    personalizationResult,
    originalText,
    handleAccept,
    handleReset,
    closeModal,
  };
};