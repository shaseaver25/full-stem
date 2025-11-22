import React from 'react';
import { FloatingPivotAssistant } from '@/components/pivot/FloatingPivotAssistant';

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
  return (
    <FloatingPivotAssistant 
      lessonId={lessonId}
      componentContext="general"
    />
  );
};