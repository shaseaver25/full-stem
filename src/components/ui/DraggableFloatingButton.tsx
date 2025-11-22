import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Move } from 'lucide-react';

interface DraggableFloatingButtonProps {
  icon: React.ReactNode;
  label?: string;
  onClick: () => void;
  initialPosition?: { x: number; y: number };
  className?: string;
  variant?: 'default' | 'iconOnly';
}

export const DraggableFloatingButton: React.FC<DraggableFloatingButtonProps> = ({
  icon,
  label,
  onClick,
  initialPosition = { x: 20, y: 20 },
  className = '',
  variant = 'default',
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showMoveIcon, setShowMoveIcon] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleClick = (e: React.MouseEvent) => {
    // Only trigger onClick if we didn't just finish dragging
    if (!isDragging) {
      onClick();
    }
  };

  return (
    <Button
      ref={buttonRef}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onMouseEnter={() => setShowMoveIcon(true)}
      onMouseLeave={() => !isDragging && setShowMoveIcon(false)}
      className={`fixed rounded-full transition-all ${
        variant === 'iconOnly' ? 'shadow-none bg-transparent p-0' : 'w-14 h-14 shadow-lg'
      } ${isDragging ? 'cursor-grabbing scale-110' : 'cursor-grab'} ${className}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 40,
      }}
      size="icon"
      title={label}
    >
      {showMoveIcon || isDragging ? (
        <Move className="h-5 w-5" />
      ) : (
        icon
      )}
    </Button>
  );
};
