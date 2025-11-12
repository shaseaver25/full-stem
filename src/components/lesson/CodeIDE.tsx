import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Download, RotateCcw, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EditorShell } from './EditorShell';
import { useEditorMode } from '@/hooks/useEditorMode';

interface CodeIDEProps {
  content: {
    title?: string;
    description?: string;
    starterCode?: string;
    language?: string;
    instructions?: string;
    expectedOutput?: string;
  };
}

const CodeIDE: React.FC<CodeIDEProps> = ({ content }) => {
  const [code, setCode] = useState(content.starterCode || '// Start coding here\nconsole.log("Hello, World!");');
  const [language, setLanguage] = useState(content.language || 'javascript');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();
  
  // Determine editor mode - defaults to 'pro' for now
  // TODO: Pass actual user and lesson data when available
  const editorMode = useEditorMode();

  const handleRunCode = async () => {
    setIsRunning(true);
    try {
      // For now, we'll simulate code execution
      // In a real implementation, you'd send this to a code execution service
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (language === 'javascript') {
        try {
          // Simple JavaScript execution simulation
          const logs: string[] = [];
          const mockConsole = {
            log: (...args: any[]) => logs.push(args.join(' '))
          };
          
          // Very basic eval for demonstration - in production, use a sandboxed environment
          const wrappedCode = `
            (function() {
              const console = arguments[0];
              ${code}
            })(arguments[0]);
          `;
          
          new Function('console')(mockConsole);
          eval(wrappedCode.replace('arguments[0]', 'mockConsole'));
          setOutput(logs.join('\n') || 'Code executed successfully (no output)');
        } catch (error) {
          setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else {
        setOutput(`Code execution for ${language} is not yet implemented in this demo.`);
      }
    } catch (error) {
      setOutput(`Execution error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setCode(content.starterCode || '// Start coding here\nconsole.log("Hello, World!");');
    setOutput('');
    toast({
      title: "Code Reset",
      description: "Code has been reset to starter template",
    });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code Copied",
      description: "Code has been copied to clipboard",
    });
  };

  const handleDownload = () => {
    const fileExtensions: Record<string, string> = {
      javascript: 'js',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      html: 'html',
      css: 'css'
    };
    
    const extension = fileExtensions[language] || 'txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Code Downloaded",
      description: `Code saved as code.${extension}`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{content.title || 'Code Exercise'}</h3>
          {content.description && (
            <p className="text-sm text-muted-foreground mt-1">{content.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
              <SelectItem value="html">HTML</SelectItem>
              <SelectItem value="css">CSS</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline">{language}</Badge>
        </div>
      </div>

      {content.instructions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p>{content.instructions}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="editor">Code Editor</TabsTrigger>
          <TabsTrigger value="output">Output</TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor" className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">Code Editor</h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleRunCode}
                disabled={isRunning}
                size="sm"
              >
                <Play className="h-4 w-4 mr-1" />
                {isRunning ? 'Running...' : 'Run'}
              </Button>
            </div>
          </div>
          
          <EditorShell
            mode={editorMode}
            language={language}
            value={code}
            onChange={setCode}
            height="400px"
          />
        </TabsContent>
        
        <TabsContent value="output" className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">Output</h4>
            {content.expectedOutput && (
              <Badge variant="secondary">Expected output available</Badge>
            )}
          </div>
          
          <Card>
            <CardContent className="p-4">
              <pre className="font-mono text-sm whitespace-pre-wrap min-h-48 max-h-96 overflow-auto bg-muted/30 p-3 rounded">
                {output || 'Run your code to see the output here...'}
              </pre>
            </CardContent>
          </Card>
          
          {content.expectedOutput && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Expected Output</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="font-mono text-sm whitespace-pre-wrap bg-muted/30 p-3 rounded">
                  {content.expectedOutput}
                </pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CodeIDE;