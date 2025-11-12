import React, { useEffect, useRef } from 'react';
import { EditorView, keymap, highlightActiveLine, lineNumbers, highlightActiveLineGutter } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { bracketMatching } from '@codemirror/language';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';

interface CodeMirrorEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
  readOnly: boolean;
  fontSize: number;
  highContrast: boolean;
  dyslexiaFont: boolean;
}

const CodeMirrorEditor: React.FC<CodeMirrorEditorProps> = ({
  language,
  value,
  onChange,
  readOnly,
  fontSize,
  highContrast,
  dyslexiaFont,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    // Determine language extension
    const langExtension = language === 'python' ? python() : javascript();

    // Create custom theme for kid mode
    const kidTheme = EditorView.theme({
      '&': {
        fontSize: `${fontSize}px`,
        fontFamily: dyslexiaFont ? 'OpenDyslexic, monospace' : 'monospace',
        backgroundColor: highContrast ? '#000' : '#f8fafc',
        color: highContrast ? '#fff' : '#334155',
      },
      '.cm-content': {
        padding: '16px',
        caretColor: highContrast ? '#fff' : '#0ea5e9',
      },
      '.cm-gutters': {
        backgroundColor: highContrast ? '#1a1a1a' : '#e2e8f0',
        color: highContrast ? '#fff' : '#64748b',
        border: 'none',
        fontSize: `${fontSize - 2}px`,
      },
      '.cm-activeLineGutter': {
        backgroundColor: highContrast ? '#333' : '#cbd5e1',
      },
      '.cm-activeLine': {
        backgroundColor: highContrast ? '#1a1a1a' : '#e0f2fe',
      },
      '.cm-selectionBackground': {
        backgroundColor: highContrast ? '#fff !important' : '#bfdbfe !important',
      },
      '&.cm-focused .cm-selectionBackground': {
        backgroundColor: highContrast ? '#fff !important' : '#93c5fd !important',
      },
    });

    // Basic setup extensions for kid mode
    const basicExtensions = [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightActiveLine(),
      history(),
      bracketMatching(),
      closeBrackets(),
      autocompletion(),
      highlightSelectionMatches(),
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...completionKeymap,
      ]),
    ];

    const extensions = [
      ...basicExtensions,
      langExtension,
      kidTheme,
      EditorView.editable.of(!readOnly),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChange(update.state.doc.toString());
        }
      }),
      EditorView.lineWrapping,
    ];

    const state = EditorState.create({
      doc: value,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [language, readOnly, fontSize, highContrast, dyslexiaFont]);

  // Update value when it changes externally
  useEffect(() => {
    if (viewRef.current) {
      const currentValue = viewRef.current.state.doc.toString();
      if (currentValue !== value) {
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: currentValue.length,
            insert: value,
          },
        });
      }
    }
  }, [value]);

  return <div ref={editorRef} className="h-full w-full" />;
};

export default CodeMirrorEditor;
