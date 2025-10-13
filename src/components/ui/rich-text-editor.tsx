import React, { useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    ['link', 'image'],
    [{ 'align': [] }],
    [{ 'color': [] }, { 'background': [] }],
    ['clean']
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'indent',
  'link', 'image', 'align',
  'color', 'background'
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter content...",
  className,
  disabled = false
}) => {
  const quillRef = useRef<ReactQuill>(null);

  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      // Custom styling for better integration
      const toolbar = quill.getModule('toolbar') as any;
      if (toolbar && toolbar.container) {
        const toolbarElement = toolbar.container as HTMLElement;
        toolbarElement.style.borderColor = 'hsl(var(--border))';
        toolbarElement.style.borderRadius = '0.375rem 0.375rem 0 0';
      }
    }
  }, []);

  return (
    <div className={cn("rich-text-editor", className)}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={disabled}
        style={{
          backgroundColor: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
        }}
      />
      <style>{`
        .ql-toolbar {
          border-color: hsl(var(--border)) !important;
          border-radius: 0.375rem 0.375rem 0 0 !important;
          background: hsl(var(--background)) !important;
        }
        
        .ql-container {
          border-color: hsl(var(--border)) !important;
          border-radius: 0 0 0.375rem 0.375rem !important;
          background: hsl(var(--background)) !important;
          color: hsl(var(--foreground)) !important;
          font-family: inherit !important;
        }
        
        .ql-editor {
          color: hsl(var(--foreground)) !important;
          font-size: 0.875rem !important;
          line-height: 1.25rem !important;
          min-height: 120px !important;
        }
        
        .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground)) !important;
          font-style: normal !important;
        }
        
        .ql-stroke {
          stroke: hsl(var(--foreground)) !important;
        }
        
        .ql-fill, .ql-stroke.ql-fill {
          fill: hsl(var(--foreground)) !important;
        }
        
        .ql-picker-label {
          color: hsl(var(--foreground)) !important;
        }
        
        .ql-picker-options {
          background: hsl(var(--background)) !important;
          border-color: hsl(var(--border)) !important;
        }
        
        .ql-picker-item:hover {
          background: hsl(var(--accent)) !important;
        }
        
        .ql-tooltip {
          background: hsl(var(--background)) !important;
          border-color: hsl(var(--border)) !important;
          color: hsl(var(--foreground)) !important;
        }
        
        .ql-tooltip input {
          background: hsl(var(--background)) !important;
          color: hsl(var(--foreground)) !important;
          border-color: hsl(var(--border)) !important;
        }
      `}</style>
    </div>
  );
};