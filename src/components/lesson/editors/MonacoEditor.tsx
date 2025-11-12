import React, { useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';

interface MonacoEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
  readOnly: boolean;
  fontSize: number;
  highContrast: boolean;
  dyslexiaFont: boolean;
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({
  language,
  value,
  onChange,
  readOnly,
  fontSize,
  highContrast,
  dyslexiaFont,
}) => {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  // Map common language names to Monaco language IDs
  const getMonacoLanguage = (lang: string): string => {
    const languageMap: Record<string, string> = {
      javascript: 'javascript',
      js: 'javascript',
      typescript: 'typescript',
      ts: 'typescript',
      python: 'python',
      py: 'python',
      html: 'html',
      css: 'css',
      json: 'json',
      java: 'java',
      cpp: 'cpp',
      'c++': 'cpp',
      c: 'c',
    };
    return languageMap[lang.toLowerCase()] || 'javascript';
  };

  return (
    <Editor
      height="100%"
      language={getMonacoLanguage(language)}
      value={value}
      onChange={handleEditorChange}
      onMount={handleEditorDidMount}
      theme={highContrast ? 'hc-black' : 'vs'}
      options={{
        readOnly,
        fontSize,
        fontFamily: dyslexiaFont ? 'OpenDyslexic, monospace' : 'monospace',
        minimap: { enabled: false },
        lineNumbers: 'on',
        roundedSelection: true,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: 'on',
        suggest: {
          showKeywords: true,
          showSnippets: true,
        },
        quickSuggestions: {
          other: true,
          comments: false,
          strings: false,
        },
        parameterHints: {
          enabled: true,
        },
        suggestOnTriggerCharacters: true,
        acceptSuggestionOnEnter: 'on',
        folding: true,
        foldingHighlight: true,
        showFoldingControls: 'mouseover',
        matchBrackets: 'always',
        renderLineHighlight: 'all',
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
      }}
    />
  );
};

export default MonacoEditor;
