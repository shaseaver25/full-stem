import React from 'react';
import { X } from 'lucide-react';

interface SpeechBubbleProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  message,
  visible,
  onDismiss
}) => {
  return (
    <div
      className={`speech-bubble ${visible ? 'speech-bubble-visible' : ''}`}
      style={{
        position: 'fixed',
        bottom: '140px',
        right: '24px',
        background: 'white',
        borderRadius: '12px',
        padding: '12px 16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        maxWidth: '280px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'all 0.3s ease',
        zIndex: 9998,
        pointerEvents: visible ? 'auto' : 'none'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <p style={{
          margin: 0,
          fontSize: '14px',
          color: '#1F2937',
          lineHeight: '1.5',
          flex: 1
        }}>
          {message}
        </p>
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: '#9CA3AF',
            cursor: 'pointer',
            padding: 0,
            width: '20px',
            height: '20px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Dismiss message"
        >
          <X size={16} />
        </button>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: '-8px',
          right: '40px',
          width: 0,
          height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '8px solid white'
        }}
      />
    </div>
  );
};
