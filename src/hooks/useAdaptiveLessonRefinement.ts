import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AILesson } from "@/types/aiLesson";
import { useToast } from "@/hooks/use-toast";

interface RefinementResult {
  refinement: {
    id: string;
    refined_json: AILesson;
    student_summary: any;
    created_at: string;
  };
  usage: {
    inputTokens: number;
    outputTokens: number;
    estimatedCost: number;
    provider: string;
    model: string;
  };
}

export function useAdaptiveLessonRefinement() {
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refinedLesson, setRefinedLesson] = useState<AILesson | null>(null);
  const [usage, setUsage] = useState<any>(null);
  const { toast } = useToast();

  async function refineLesson(lessonId: string, classId: string) {
    setIsRefining(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke(
        "adaptive-content",
        {
          body: {
            lessonId,
            classId,
          },
        }
      );

      if (functionError) {
        const errorMessage = functionError.message || "Failed to refine lesson";
        setError(errorMessage);
        toast({
          title: "Refinement Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return null;
      }

      const result = data as RefinementResult;
      
      if (result?.refinement) {
        setRefinedLesson(result.refinement.refined_json);
        setUsage(result.usage);
        toast({
          title: "Lesson Refined Successfully",
          description: "The lesson has been adapted for your students.",
        });
        return result;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong";
      setError(errorMessage);
      toast({
        title: "Refinement Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsRefining(false);
    }
  }

  return {
    refineLesson,
    refinedLesson,
    usage,
    isRefining,
    error,
  };
}
