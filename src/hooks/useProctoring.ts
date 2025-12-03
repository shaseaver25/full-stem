import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ProctoringEventType = 'tab_switch' | 'fullscreen_exit' | 'blur' | 'focus_return' | 'fullscreen_enter' | 'session_start' | 'session_end';

export interface ProctoringEvent {
  event_type: ProctoringEventType;
  timestamp: Date;
  details?: Record<string, any>;
}

interface UseProctoringOptions {
  attemptId: string;
  enabled: boolean;
  maxViolations?: number;
  onViolationThreshold?: () => void;
  strictness?: 'lenient' | 'standard' | 'strict';
  teacherName?: string;
}

interface UseProctoringReturn {
  events: ProctoringEvent[];
  warningCount: number;
  isFullscreen: boolean;
  isFocused: boolean;
  integrityScore: number;
  showWarning: boolean;
  warningMessage: string;
  lastEventType: ProctoringEventType | '';
  showToast: boolean;
  requestFullscreen: () => Promise<void>;
  dismissWarning: () => void;
  endSession: () => void;
}

export const useProctoring = ({
  attemptId,
  enabled,
  maxViolations = 5,
  onViolationThreshold,
  strictness = 'standard',
  teacherName = 'Your Teacher'
}: UseProctoringOptions): UseProctoringReturn => {
  const [events, setEvents] = useState<ProctoringEvent[]>([]);
  const [warningCount, setWarningCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFocused, setIsFocused] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [lastEventType, setLastEventType] = useState<ProctoringEventType | ''>('');
  const [showToast, setShowToast] = useState(false);
  
  const blurStartTime = useRef<Date | null>(null);
  const sessionStarted = useRef(false);

  // Calculate integrity score
  const integrityScore = Math.max(0, 100 - (warningCount * 10));

  // Get penalty based on strictness
  const getPenaltyThreshold = useCallback(() => {
    switch (strictness) {
      case 'lenient': return 3000; // 3 seconds grace period
      case 'standard': return 1500; // 1.5 seconds
      case 'strict': return 500; // 0.5 seconds
      default: return 1500;
    }
  }, [strictness]);

  // Log event to database
  const logEvent = useCallback(async (eventType: ProctoringEventType, details?: Record<string, any>) => {
    if (!enabled || !attemptId) return;

    const event: ProctoringEvent = {
      event_type: eventType,
      timestamp: new Date(),
      details
    };

    setEvents(prev => [...prev, event]);

    // Trigger toast for violations (not for returns or session events)
    const violationEvents: ProctoringEventType[] = ['tab_switch', 'fullscreen_exit', 'blur'];
    if (violationEvents.includes(eventType)) {
      setLastEventType(eventType);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 100);
    }

    // Insert into database
    try {
      await supabase.from('proctoring_events').insert({
        quiz_attempt_id: attemptId,
        event_type: eventType,
        timestamp: event.timestamp.toISOString(),
        details: details || {}
      });
    } catch (error) {
      console.error('Failed to log proctoring event:', error);
    }
  }, [enabled, attemptId]);

  // Show warning modal
  const triggerWarning = useCallback((message: string, eventType: ProctoringEventType) => {
    setWarningCount(prev => {
      const newCount = prev + 1;
      if (newCount >= maxViolations && onViolationThreshold) {
        onViolationThreshold();
      }
      return newCount;
    });
    setWarningMessage(message);
    setLastEventType(eventType);
    setShowWarning(true);
  }, [maxViolations, onViolationThreshold]);

  // Handle visibility change (tab switch)
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        blurStartTime.current = new Date();
        logEvent('tab_switch', { action: 'left_tab' });
        triggerWarning(
          'You switched tabs or minimized the browser. This activity has been logged.',
          'tab_switch'
        );
      } else {
        const awayTime = blurStartTime.current 
          ? (new Date().getTime() - blurStartTime.current.getTime()) / 1000 
          : 0;
        logEvent('focus_return', { away_seconds: awayTime });
        blurStartTime.current = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, logEvent, triggerWarning]);

  // Handle window blur/focus
  useEffect(() => {
    if (!enabled) return;

    let blurTimeout: NodeJS.Timeout;

    const handleBlur = () => {
      setIsFocused(false);
      blurStartTime.current = new Date();
      
      // Grace period before logging
      blurTimeout = setTimeout(() => {
        if (!document.hasFocus()) {
          logEvent('blur', { action: 'window_blur' });
          triggerWarning(
            'The assessment window lost focus. Please keep this window active.',
            'blur'
          );
        }
      }, getPenaltyThreshold());
    };

    const handleFocus = () => {
      setIsFocused(true);
      clearTimeout(blurTimeout);
      
      if (blurStartTime.current) {
        const awayTime = (new Date().getTime() - blurStartTime.current.getTime()) / 1000;
        if (awayTime > getPenaltyThreshold() / 1000) {
          logEvent('focus_return', { away_seconds: awayTime });
        }
        blurStartTime.current = null;
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      clearTimeout(blurTimeout);
    };
  }, [enabled, logEvent, triggerWarning, getPenaltyThreshold]);

  // Handle fullscreen changes
  useEffect(() => {
    if (!enabled) return;

    const handleFullscreenChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);

      if (!isFs && sessionStarted.current) {
        logEvent('fullscreen_exit', { action: 'exited_fullscreen' });
        triggerWarning(
          'You exited fullscreen mode. Please return to fullscreen to continue.',
          'fullscreen_exit'
        );
      } else if (isFs) {
        logEvent('fullscreen_enter', { action: 'entered_fullscreen' });
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [enabled, logEvent, triggerWarning]);

  // Prevent keyboard shortcuts
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl/Cmd + Tab, Alt + Tab (can't fully prevent, but log)
      if ((e.ctrlKey || e.metaKey) && e.key === 'Tab') {
        e.preventDefault();
        logEvent('tab_switch', { action: 'keyboard_shortcut_attempted', keys: 'Ctrl+Tab' });
      }

      // Prevent Ctrl/Cmd + C/V/X in strict mode
      if (strictness === 'strict' && (e.ctrlKey || e.metaKey)) {
        if (['c', 'v', 'x'].includes(e.key.toLowerCase())) {
          e.preventDefault();
          logEvent('blur', { action: 'copy_paste_attempted', keys: `Ctrl+${e.key.toUpperCase()}` });
        }
      }

      // Log PrintScreen attempts
      if (e.key === 'PrintScreen') {
        logEvent('blur', { action: 'screenshot_attempted' });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled, strictness, logEvent]);

  // Prevent right-click in strict mode
  useEffect(() => {
    if (!enabled || strictness !== 'strict') return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      logEvent('blur', { action: 'right_click_attempted' });
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, [enabled, strictness, logEvent]);

  // Request fullscreen
  const requestFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
      if (!sessionStarted.current) {
        sessionStarted.current = true;
        logEvent('session_start', { fullscreen: true });
      }
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
    }
  }, [logEvent]);

  // End session
  const endSession = useCallback(() => {
    if (sessionStarted.current) {
      logEvent('session_end', { 
        total_violations: warningCount,
        final_integrity_score: integrityScore 
      });
      sessionStarted.current = false;
    }
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }, [logEvent, warningCount, integrityScore]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (enabled && sessionStarted.current) {
        endSession();
      }
    };
  }, [enabled, endSession]);

  return {
    events,
    warningCount,
    isFullscreen,
    isFocused,
    integrityScore,
    showWarning,
    warningMessage,
    lastEventType,
    showToast,
    requestFullscreen,
    dismissWarning: () => setShowWarning(false),
    endSession
  };
};
