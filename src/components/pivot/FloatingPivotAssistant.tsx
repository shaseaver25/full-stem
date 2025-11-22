import React, { useState, useEffect, lazy, Suspense } from 'react';
import { SpeechBubble } from './SpeechBubble';
import pivotLogo from '@/assets/pivot-logo.svg';

const PivotChatInterface = lazy(() => import('./PivotChatInterface'));

interface FloatingPivotAssistantProps {
  lessonId?: string;
  componentContext?: 'general' | 'quiz' | 'slides' | 'poll';
}

const PIVOT_MESSAGES = {
  general: [
    "Need help? Click me!",
    "Have questions? I'm here!",
    "Let's explore this together!",
    "Stuck? I can help!",
    "Ready to learn? Let's go!"
  ],
  quiz: [
    "Need help with this question?",
    "Let me explain this concept!",
    "Want a hint? Just ask!",
    "Confused? I can clarify!"
  ],
  slides: [
    "Need more explanation?",
    "Let's dive deeper into this!",
    "Have questions about this slide?",
    "Want me to explain this?"
  ],
  poll: [
    "Not sure which to choose?",
    "Let me help you think through this!",
    "Need to discuss the options?"
  ]
};

const MESSAGE_INTERVAL_MIN = 30000; // 30 seconds
const MESSAGE_INTERVAL_MAX = 60000; // 60 seconds
const MESSAGE_DISPLAY_DURATION = 8000; // 8 seconds
const PIVOT_SIZE = 100;

const useMessageRotation = (context: 'general' | 'quiz' | 'slides' | 'poll') => {
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    const showRandomMessage = () => {
      const messages = PIVOT_MESSAGES[context] || PIVOT_MESSAGES.general;
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      
      setCurrentMessage(randomMessage);
      setShowBubble(true);

      setTimeout(() => {
        setShowBubble(false);
      }, MESSAGE_DISPLAY_DURATION);
    };

    const initialDelay = setTimeout(() => {
      showRandomMessage();
    }, 5000);

    const messageInterval = setInterval(() => {
      showRandomMessage();
    }, Math.random() * (MESSAGE_INTERVAL_MAX - MESSAGE_INTERVAL_MIN) + MESSAGE_INTERVAL_MIN);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(messageInterval);
    };
  }, [context]);

  return { currentMessage, showBubble, setShowBubble };
};

export const FloatingPivotAssistant: React.FC<FloatingPivotAssistantProps> = ({
  lessonId,
  componentContext = 'general'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const { currentMessage, showBubble, setShowBubble } = useMessageRotation(componentContext);

  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setShowPulse(true);
      setTimeout(() => setShowPulse(false), 2000);
    }, 45000);

    return () => clearInterval(pulseInterval);
  }, []);

  const handleClick = () => {
    setShowBubble(false);
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 500);
    setIsExpanded(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <>
      <div
        className={`
          pivot-assistant
          ${showPulse ? 'pivot-pulse-animation' : ''}
          ${isClicked ? 'pivot-clicked' : ''}
        `}
        onClick={handleClick}
        onKeyPress={handleKeyPress}
        role="button"
        tabIndex={0}
        aria-label="Open Pivot AI Assistant chat"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: `${PIVOT_SIZE}px`,
          height: `${PIVOT_SIZE}px`,
          borderRadius: '50%',
          background: 'white',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          cursor: 'pointer',
          border: 'none',
          padding: 0
        }}
      >
        <img
          src={pivotLogo}
          alt="Pivot - AI Learning Assistant"
          role="img"
          className="pivot-icon"
          style={{ width: '80%', height: '80%' }}
        />
      </div>

      {currentMessage && (
        <SpeechBubble
          message={currentMessage}
          visible={showBubble}
          onDismiss={() => setShowBubble(false)}
        />
      )}

      {isExpanded && (
        <Suspense fallback={<div className="loading-spinner" />}>
          <PivotChatInterface
            lessonId={lessonId}
            onClose={() => setIsExpanded(false)}
          />
        </Suspense>
      )}

      <div role="status" aria-live="polite" className="sr-only">
        {showBubble && currentMessage ? `Pivot says: ${currentMessage}` : ''}
      </div>
    </>
  );
};
