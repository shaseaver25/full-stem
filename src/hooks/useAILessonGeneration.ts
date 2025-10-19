import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getProvider } from '@/services/aiProvider';
import type { AIUsageLog } from '@/services/aiProvider/types';

interface GenerateLessonOptions {
  prompt: string;
  systemPrompt?: string;
  gradeLevel?: string;
  subject?: string;
  providerName?: string;
}

export function useAILessonGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastUsage, setLastUsage] = useState<AIUsageLog | null>(null);
  const { toast } = useToast();

  const generateLesson = async (options: GenerateLessonOptions): Promise<string | null> => {
    setIsGenerating(true);
    
    try {
      const provider = getProvider(options.providerName);
      console.log(`[AI Generation] Using provider: ${provider.name}`);

      const defaultSystemPrompt = `You are an expert educator creating lesson plans. Generate structured, standards-aligned content suitable for ${options.gradeLevel || 'middle school'} students studying ${options.subject || 'the given topic'}. Include clear learning objectives, activities, and assessments.`;

      const response = await provider.generate(options.prompt, {
        systemPrompt: options.systemPrompt || defaultSystemPrompt,
        temperature: 0.7,
        maxTokens: 2000,
      });

      // Log usage and cost
      const usage: AIUsageLog = {
        provider: provider.name,
        model: response.modelUsed || 'unknown',
        inputTokens: response.usage?.inputTokens || 0,
        outputTokens: response.usage?.outputTokens || 0,
        estimatedCost: provider.estimateCost 
          ? provider.estimateCost(response.usage?.inputTokens || 0, response.usage?.outputTokens || 0)
          : 0,
        timestamp: new Date(),
      };

      setLastUsage(usage);

      // Log to database
      await logAIUsage(usage, options.prompt, response.text);

      console.log('[AI Generation] Success:', {
        provider: usage.provider,
        tokens: usage.inputTokens + usage.outputTokens,
        cost: usage.estimatedCost.toFixed(4),
      });

      toast({
        title: 'Lesson Generated',
        description: `Generated using ${provider.name}. Tokens: ${usage.inputTokens + usage.outputTokens}`,
      });

      return response.text;
    } catch (error) {
      console.error('[AI Generation] Error:', error);
      
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate lesson',
        variant: 'destructive',
      });

      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateLesson,
    isGenerating,
    lastUsage,
  };
}

async function logAIUsage(usage: AIUsageLog, prompt: string, response: string) {
  try {
    const { error } = await supabase.from('ai_lesson_history').insert({
      model_provider: usage.provider,
      model_name: usage.model,
      input_tokens: usage.inputTokens,
      output_tokens: usage.outputTokens,
      estimated_cost: usage.estimatedCost,
      prompt_preview: prompt.substring(0, 500),
      response_preview: response.substring(0, 500),
    });

    if (error) {
      console.error('[AI Usage Log] Failed to log usage:', error);
    }
  } catch (error) {
    console.error('[AI Usage Log] Error:', error);
  }
}
