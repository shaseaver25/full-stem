import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface GoogleTTSOptions {
  voice: string;
  speed: number;
  pitch?: number;
  languageCode?: string;
}

interface GoogleTTSResponse {
  audioContent: string;
  timepoints?: Array<{
    markName: string;
    timeSeconds: number;
  }>;
}

export const useGoogleTTS = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const generateSpeech = useCallback(async (
    text: string, 
    options: GoogleTTSOptions
  ): Promise<string | null> => {
    setIsLoading(true);
    
    try {
      // This would call your backend endpoint that interfaces with Google Cloud TTS
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice: options.voice,
          speed: options.speed,
          pitch: options.pitch || 0,
          languageCode: options.languageCode || 'en-US',
          enableTimePointing: true, // For word-level timing
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const data: GoogleTTSResponse = await response.json();
      
      // Convert base64 audio to blob URL
      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
        { type: 'audio/mpeg' }
      );
      
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      return url;
    } catch (error) {
      console.error('Google TTS Error:', error);
      toast({
        title: "Speech Generation Failed",
        description: "Falling back to browser speech synthesis",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const clearAudio = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  }, [audioUrl]);

  // Fallback to Web Speech API
  const generateSpeechFallback = useCallback((
    text: string,
    options: GoogleTTSOptions
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.speed;
      utterance.pitch = options.pitch || 1;
      
      // Try to find the best available voice
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('google') ||
        voice.name.toLowerCase().includes('enhanced') ||
        (voice.lang.startsWith('en') && voice.localService === false)
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error('Speech synthesis failed'));
      
      speechSynthesis.speak(utterance);
    });
  }, []);

  return {
    generateSpeech,
    generateSpeechFallback,
    clearAudio,
    isLoading,
    audioUrl
  };
};