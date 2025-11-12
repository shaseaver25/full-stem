import React, { Suspense, lazy, useEffect, useRef } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Loader2 } from 'lucide-react';

const CodeMirrorEditor = lazy(() => import('./editors/CodeMirrorEditor'));
const MonacoEditor = lazy(() => import('./editors/MonacoEditor'));

export interface EditorShellProps {
  mode: 'kid' | 'pro';
  language: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  height?: string;
  accessibilitySettings?: {
    fontSize?: number;
    highContrast?: boolean;
    dyslexiaFont?: boolean;
  };
}

export const EditorShell: React.FC<EditorShellProps> = ({
  mode,
  language,
  value,
  onChange,
  readOnly = false,
  height = '400px',
  accessibilitySettings,
}) => {
  const { settings } = useAccessibility();
  
  // Merge global accessibility settings with component-specific ones
  const mergedSettings = {
    fontSize: accessibilitySettings?.fontSize ?? 14,
    highContrast: accessibilitySettings?.highContrast ?? settings.highContrast,
    dyslexiaFont: accessibilitySettings?.dyslexiaFont ?? settings.dyslexiaFont,
  };

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className={`
        w-full rounded-lg border border-border overflow-hidden
        ${mergedSettings.highContrast ? 'border-2' : ''}
        ${mergedSettings.dyslexiaFont ? 'font-[OpenDyslexic]' : ''}
      `}
      style={{ height }}
    >
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-full bg-muted/10">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        {mode === 'kid' ? (
          <CodeMirrorEditor
            language={language}
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            fontSize={mergedSettings.fontSize}
            highContrast={mergedSettings.highContrast}
            dyslexiaFont={mergedSettings.dyslexiaFont}
          />
        ) : (
          <MonacoEditor
            language={language}
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            fontSize={mergedSettings.fontSize}
            highContrast={mergedSettings.highContrast}
            dyslexiaFont={mergedSettings.dyslexiaFont}
          />
        )}
      </Suspense>
    </div>
  );
};
