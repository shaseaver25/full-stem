import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TTSButtonProps {
  text: string;
  className?: string;
}

export function TTSButton({ text, className }: TTSButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      toast({
        title: 'Not Supported',
        description: 'Text-to-speech is not supported in your browser',
        variant: 'destructive',
      });
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = (error) => {
      console.error('TTS error:', error);
      setIsPlaying(false);
      setIsLoading(false);
      toast({
        title: 'Error',
        description: 'Failed to play audio',
        variant: 'destructive',
      });
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggleSpeech}
      disabled={isLoading || !text}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : isPlaying ? (
        <VolumeX className="h-4 w-4 mr-2" />
      ) : (
        <Volume2 className="h-4 w-4 mr-2" />
      )}
      {isPlaying ? 'Stop' : '🔊 Listen to Feedback'}
    </Button>
  );
}
