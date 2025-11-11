import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Download, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MarkdownViewerProps {
  filePath: string;
  title?: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ 
  filePath, 
  title = 'Documentation' 
}) => {
  const [content, setContent] = useState<string>('');
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadMarkdown = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(filePath);
        
        if (!response.ok) {
          throw new Error('Failed to load documentation');
        }
        
        const text = await response.text();
        
        // Parse metadata header if present
        const metadataMatch = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        
        if (metadataMatch) {
          const metadataText = metadataMatch[1];
          const contentText = metadataMatch[2];
          
          // Parse metadata
          const meta: Record<string, string> = {};
          metadataText.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split(':');
            if (key && valueParts.length) {
              meta[key.trim()] = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
            }
          });
          
          setMetadata(meta);
          setContent(contentText);
        } else {
          setContent(text);
        }
      } catch (error) {
        console.error('Error loading markdown:', error);
        toast({
          title: 'Error',
          description: 'Failed to load documentation file',
          variant: 'destructive',
        });
        setContent('# Error\n\nFailed to load documentation file.');
      } finally {
        setIsLoading(false);
      }
    };

    loadMarkdown();
  }, [filePath, toast]);

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filePath.split('/').pop() || 'document.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Downloaded',
      description: 'Documentation downloaded successfully',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>{metadata.title || title}</CardTitle>
              {metadata.version && (
                <p className="text-sm text-muted-foreground mt-1">
                  Version {metadata.version} • Last updated: {metadata.last_updated}
                </p>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] w-full">
          <div className="prose prose-slate dark:prose-invert max-w-none pr-4">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold text-foreground mb-4 mt-6 pb-2 border-b border-border">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-semibold text-foreground mb-3 mt-6">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-lg font-semibold text-foreground mb-2 mt-3">
                    {children}
                  </h4>
                ),
                p: ({ children }) => (
                  <p className="text-muted-foreground mb-4 leading-7">
                    {children}
                  </p>
                ),
                code: ({ inline, children, ...props }: any) => 
                  inline ? (
                    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground" {...props}>
                      {children}
                    </code>
                  ) : (
                    <code className="block bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto text-foreground" {...props}>
                      {children}
                    </code>
                  ),
                pre: ({ children }) => (
                  <pre className="bg-muted rounded-lg mb-4 overflow-x-auto">
                    {children}
                  </pre>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full border-collapse border border-border">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-border bg-muted px-4 py-2 text-left font-semibold text-foreground">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-border px-4 py-2 text-muted-foreground">
                    {children}
                  </td>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-4 space-y-2 text-muted-foreground">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-4 space-y-2 text-muted-foreground">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="leading-7">
                    {children}
                  </li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
                    {children}
                  </blockquote>
                ),
                a: ({ children, href }) => (
                  <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
                hr: () => (
                  <hr className="my-6 border-border" />
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};