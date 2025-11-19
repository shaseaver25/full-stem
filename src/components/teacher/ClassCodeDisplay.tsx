import { useState } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ClassCodeDisplayProps {
  classId: string;
  classCode: string;
  onCodeRegenerated?: (newCode: string) => void;
}

export const ClassCodeDisplay = ({ classId, classCode, onCodeRegenerated }: ClassCodeDisplayProps) => {
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(classCode);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'Class code copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      // Call a function to regenerate the code
      const { data, error } = await supabase
        .rpc('generate_class_code')
        .single();

      if (error) throw error;

      const newCode = data;

      // Update the class with the new code
      const { error: updateError } = await supabase
        .from('classes')
        .update({
          class_code: newCode,
          code_last_regenerated_at: new Date().toISOString(),
          code_usage_count: 0,
        })
        .eq('id', classId);

      if (updateError) throw updateError;

      toast({
        title: 'Code Regenerated',
        description: 'A new class code has been generated',
      });

      onCodeRegenerated?.(newCode);
    } catch (error: any) {
      console.error('Error regenerating code:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to regenerate code',
        variant: 'destructive',
      });
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Class Code</CardTitle>
        <CardDescription>
          Students can use this code to join your class
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-muted rounded-lg p-4 text-center">
            <p className="text-3xl font-bold tracking-wider font-mono">{classCode}</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            title="Copy code"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <Button
          variant="outline"
          onClick={handleRegenerate}
          disabled={regenerating}
          className="w-full"
        >
          {regenerating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate Code
            </>
          )}
        </Button>
        <p className="text-sm text-muted-foreground">
          ⚠️ Regenerating the code will invalidate the old code
        </p>
      </CardContent>
    </Card>
  );
};
