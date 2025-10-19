/**
 * AI Lesson Generator Hook
 * 
 * Environment Variables:
 * - Frontend: Uses VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY from .env
 * - Edge Function: Uses OPENAI_API_KEY from Supabase secrets
 *   (Configure at: Supabase Dashboard → Project Settings → Edge Functions → Secrets)
 */

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AILesson } from "@/types/aiLesson";
import { useToast } from "@/hooks/use-toast";

interface GenerateLessonParams {
  topic: string;
  subject: string;
  gradeLevel: string;
  readingLevel: string;
  language: string;
  durationMinutes: number;
  standards?: Array<{ framework: string; code: string; description?: string }>;
}

export function useAILessonWizard() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lesson, setLesson] = useState<AILesson | null>(null);
  const [usage, setUsage] = useState<any>(null);
  const { toast } = useToast();

  async function generateLesson({
    topic,
    subject,
    gradeLevel,
    readingLevel,
    language,
    durationMinutes,
    standards,
  }: GenerateLessonParams) {
    setIsGenerating(true);
    setError(null);

    try {
      // Call the Edge Function (uses Supabase client configured from .env)
      // The edge function accesses OPENAI_API_KEY via Supabase secrets (Deno.env.get)
      const { data, error: functionError } = await supabase.functions.invoke(
        "ai-lesson-generator",
        {
          body: {
            topic,
            subject,
            gradeLevel,
            readingLevel,
            language,
            durationMinutes,
            standards,
          },
        }
      );

      if (functionError) {
        const errorMessage = functionError.message || "Something went wrong";
        setError(errorMessage);
        toast({
          title: "Generation Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      if (data?.lesson) {
        setLesson(data.lesson);
        setUsage(data.usage);
        toast({
          title: "Lesson Generated",
          description: "AI successfully created a full lesson plan.",
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong";
      setError(errorMessage);
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  return {
    generateLesson,
    lesson,
    usage,
    isGenerating,
    error,
  };
}
