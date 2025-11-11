import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDesmosState } from '@/hooks/useDesmosState';
import { useAccessibility } from '@/contexts/AccessibilityContext';

interface DesmosEmbedProps {
  mode: 'calculator' | 'activity';
  activityId?: string;
  lessonId?: string;
  readOnly?: boolean;
  saveState?: boolean;
  initialState?: any;
  className?: string;
}

declare global {
  interface Window {
    Desmos?: any;
  }
}

const DesmosEmbed: React.FC<DesmosEmbedProps> = ({
  mode,
  activityId,
  lessonId,
  readOnly = false,
  saveState = true,
  initialState,
  className = '',
}) => {
  const calculatorRef = useRef<HTMLDivElement>(null);
  const calculatorInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { settings } = useAccessibility();
  
  const { 
    savedState, 
    saveCalculatorState, 
    isLoading: isLoadingState 
  } = useDesmosState(lessonId || '', activityId || mode);

  // Load Desmos API
  useEffect(() => {
    if (mode === 'activity') {
      setIsLoading(false);
      return;
    }

    // Check if Desmos API is already loaded
    if (window.Desmos) {
      initializeCalculator();
      return;
    }

    // Load Desmos API script
    const script = document.createElement('script');
    script.src = 'https://www.desmos.com/api/v1.7/calculator.js';
    script.async = true;
    script.onload = () => {
      initializeCalculator();
    };
    script.onerror = (error) => {
      console.error('Failed to load Desmos script:', error);
      toast({
        title: 'Error Loading Desmos',
        description: 'Failed to load Desmos calculator. Please refresh the page.',
        variant: 'destructive',
      });
      setIsLoading(false);
    };
    document.head.appendChild(script);

    return () => {
      if (calculatorInstanceRef.current) {
        calculatorInstanceRef.current.destroy?.();
      }
    };
  }, [mode]);

  const initializeCalculator = () => {
    if (!calculatorRef.current || !window.Desmos) return;

    try {
      const calculator = window.Desmos.GraphingCalculator(calculatorRef.current, {
        expressions: !readOnly,
        settingsMenu: !readOnly,
        zoomButtons: true,
        border: false,
        keypad: !readOnly,
        lockViewport: readOnly,
        expressionsCollapsed: false,
        administerSecretFolders: false,
        images: true,
        folders: true,
        notes: true,
        sliders: true,
        links: true,
        qwertyKeyboard: true,
        restrictedFunctions: false,
      });

      calculatorInstanceRef.current = calculator;

      // Load saved state or initial state
      const stateToLoad = savedState || initialState;
      if (stateToLoad) {
        try {
          calculator.setState(stateToLoad);
        } catch (error) {
          console.error('Error loading calculator state:', error);
        }
      }

      setIsLoading(false);

      // Announce to screen readers
      const announcement = readOnly 
        ? 'Desmos calculator loaded in read-only mode'
        : 'Desmos calculator loaded and ready for input';
      
      announceToScreenReader(announcement);
    } catch (error) {
      console.error('Error initializing Desmos:', error);
      toast({
        title: 'Initialization Error',
        description: 'Could not initialize Desmos calculator.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const announceToScreenReader = (message: string) => {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.className = 'sr-only';
    liveRegion.textContent = message;
    document.body.appendChild(liveRegion);
    setTimeout(() => document.body.removeChild(liveRegion), 1000);
  };

  const handleSave = async () => {
    if (!calculatorInstanceRef.current || !lessonId) return;

    setIsSaving(true);
    try {
      const state = calculatorInstanceRef.current.getState();
      await saveCalculatorState(state);
      
      toast({
        title: 'Work Saved',
        description: 'Your calculator work has been saved successfully.',
      });
      announceToScreenReader('Calculator work saved successfully');
    } catch (error) {
      console.error('Error saving calculator state:', error);
      toast({
        title: 'Save Failed',
        description: 'Could not save your work. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestore = () => {
    if (!calculatorInstanceRef.current || !savedState) return;

    try {
      calculatorInstanceRef.current.setState(savedState);
      toast({
        title: 'Work Restored',
        description: 'Your previous work has been restored.',
      });
      announceToScreenReader('Previous calculator work restored');
    } catch (error) {
      console.error('Error restoring calculator state:', error);
      toast({
        title: 'Restore Failed',
        description: 'Could not restore your previous work.',
        variant: 'destructive',
      });
    }
  };

  // Apply accessibility settings
  const containerClasses = [
    'desmos-calculator-container',
    settings.highContrast ? 'high-contrast' : '',
    settings.dyslexiaFont ? 'dyslexia-font' : '',
    className,
  ].filter(Boolean).join(' ');

  if (mode === 'activity' && activityId) {
    return (
      <Card className={containerClasses}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label="Math">📐</span>
            Desmos Classroom Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <iframe
            src={`https://teacher.desmos.com/activitybuilder/custom/${activityId}`}
            width="100%"
            height="600"
            className="rounded border w-full"
            allowFullScreen
            title="Desmos Classroom Activity"
            loading="lazy"
            aria-label="Desmos interactive math activity"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={containerClasses}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label="Calculator">📊</span>
            Desmos Graphing Calculator
          </CardTitle>
          
          {saveState && !readOnly && lessonId && (
            <div className="flex gap-2">
              {savedState && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRestore}
                  disabled={isLoading || isLoadingState}
                  aria-label="Restore previous work"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Restore
                </Button>
              )}
              <Button
                variant="default"
                size="sm"
                onClick={handleSave}
                disabled={isLoading || isSaving}
                aria-label="Save your work"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                Save Work
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {isLoading && (
            <div 
              className="absolute inset-0 flex items-center justify-center bg-background/50 z-10"
              role="status"
              aria-live="polite"
            >
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Loading calculator...</span>
              </div>
            </div>
          )}
          <div
            ref={calculatorRef}
            className="w-full rounded border"
            style={{ height: '600px' }}
            role="application"
            aria-label="Desmos graphing calculator interface"
            tabIndex={0}
          />
        </div>
        
        {readOnly && (
          <p className="text-sm text-muted-foreground mt-2" role="note">
            This calculator is in view-only mode.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DesmosEmbed;
