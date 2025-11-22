/**
 * Pivot Help Button Component
 * 
 * ✅ WCAG 2.1 Level AA Compliant
 * - Keyboard accessible (Enter/Space activation, Alt+P shortcut)
 * - Focus indicators visible
 * - Reduced motion support
 * - Screen reader announcements
 * - High contrast mode support
 */

import { useState, useEffect, useRef } from 'react';
import { HelpCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pivotHelpButtonConfig } from '@/config/pivotHelpButton.config';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PivotHelpButtonProps {
  questionId: string;
  questionText: string;
  assessmentId: string;
  wrongAttempts?: number;
  timeOnQuestion?: number; // seconds
  disabled?: boolean;
  onHelpClick: () => void;
}

type AnimationState = 'initial' | 'gentle-glow' | 'urgent' | 'slide-in' | 'static';

export const PivotHelpButton: React.FC<PivotHelpButtonProps> = ({
  questionId,
  questionText,
  assessmentId,
  wrongAttempts = 0,
  timeOnQuestion = 0,
  disabled = false,
  onHelpClick
}) => {
  const [animationState, setAnimationState] = useState<AnimationState>('initial');
  const [hasInteracted, setHasInteracted] = useState(false);
  const [ariaMessage, setAriaMessage] = useState('');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const initialAnimationComplete = useRef(false);
  const { toast } = useToast();

  // Determine animation class based on student behavior
  useEffect(() => {
    if (hasInteracted) return; // Don't animate after student clicks

    const config = pivotHelpButtonConfig.triggers;

    // Priority 1: Multiple wrong attempts (most urgent)
    if (wrongAttempts >= config.wrongAttemptsForUrgent) {
      setAnimationState('urgent');
      if (pivotHelpButtonConfig.accessibility.announceStateChanges) {
        setAriaMessage(pivotHelpButtonConfig.text.ariaMessageMultipleWrong);
      }
      return;
    }

    // Priority 2: Single wrong attempt
    if (wrongAttempts >= config.wrongAttemptsForGlow) {
      setAnimationState('gentle-glow');
      if (pivotHelpButtonConfig.accessibility.announceStateChanges) {
        setAriaMessage(pivotHelpButtonConfig.text.ariaMessageFirstWrong);
      }
      return;
    }

    // Priority 3: Time-based (student seems stuck)
    if (timeOnQuestion >= config.timeBeforeSlideIn) {
      setAnimationState('slide-in');
      return;
    }

    // Priority 4: Initial state
    if (!initialAnimationComplete.current) {
      setAnimationState('initial');
      
      // Mark initial animation as complete after it runs
      const animConfig = pivotHelpButtonConfig.animations.initialPulse;
      const totalTime = animConfig.delay + (animConfig.duration * animConfig.iterations) + 500;
      
      const timer = setTimeout(() => {
        initialAnimationComplete.current = true;
        setAnimationState('static');
      }, totalTime);
      
      return () => clearTimeout(timer);
    }

    setAnimationState('static');
  }, [wrongAttempts, timeOnQuestion, hasInteracted]);

  // Keyboard shortcut handler (Alt+P)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'p' && !disabled) {
        e.preventDefault();
        handleClick();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [disabled]);

  const trackPivotHelpRequested = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { error } = await supabase
        .from('pivot_help_requests')
        .insert({
          student_id: userData.user.id,
          question_id: questionId,
          assessment_id: assessmentId,
          wrong_attempts: wrongAttempts,
          time_on_question: timeOnQuestion,
          requested_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error tracking Pivot help request:', error);
      }
    } catch (error) {
      console.error('Error tracking Pivot help request:', error);
    }
  };

  const handleClick = () => {
    setHasInteracted(true);
    
    // Track analytics
    trackPivotHelpRequested();

    // Haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }

    onHelpClick();
  };

  const getAnimationClasses = () => {
    const classes = ['pivot-help-button'];
    
    switch (animationState) {
      case 'initial':
        classes.push('initial-pulse');
        break;
      case 'gentle-glow':
        classes.push('after-wrong-answer');
        break;
      case 'urgent':
        classes.push('urgent-help');
        break;
      case 'slide-in':
        classes.push('slide-in');
        break;
      default:
        break;
    }
    
    return classes.join(' ');
  };

  return (
    <>
      {/* Screen reader live region for state changes */}
      {pivotHelpButtonConfig.accessibility.announceStateChanges && (
        <div role="status" aria-live="polite" className="sr-only">
          {ariaMessage}
        </div>
      )}

      <Button
        ref={buttonRef}
        variant="default"
        size="sm"
        className={getAnimationClasses()}
        onClick={handleClick}
        disabled={disabled}
        aria-label={pivotHelpButtonConfig.text.ariaLabel}
        aria-live="polite"
        aria-atomic="true"
      >
        <HelpCircle className="pivot-icon waving" size={20} />
        <span>{pivotHelpButtonConfig.text.buttonLabel}</span>
        <Sparkles size={16} style={{ opacity: 0.8 }} />
      </Button>
    </>
  );
};
