import type { AIProvider, AIGenerateOptions, AIGenerateResponse } from './types';

/**
 * OpenAI GPT Provider
 * Cost estimates (as of 2025):
 * - gpt-4o-mini: $0.150 / 1M input tokens, $0.600 / 1M output tokens
 */
class OpenAIProvider implements AIProvider {
  name = 'openai';
  private apiKey: string;
  private defaultModel = 'gpt-4o-mini';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || import.meta.env.VITE_OPENAI_API_KEY || '';
  }

  async generate(prompt: string, options?: AIGenerateOptions): Promise<AIGenerateResponse> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured. Set VITE_OPENAI_API_KEY.');
    }

    const model = options?.model || this.defaultModel;
    const messages = [
      ...(options?.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
      { role: 'user', content: prompt }
    ];

    console.log(`[OpenAI] Generating with model: ${model}`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[OpenAI] API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    const usage = data.usage ? {
      inputTokens: data.usage.prompt_tokens,
      outputTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
    } : undefined;

    console.log(`[OpenAI] Response received. Usage:`, usage);

    return { text, usage, modelUsed: model };
  }

  estimateCost(inputTokens: number, outputTokens: number): number {
    // GPT-4o-mini pricing
    const inputCost = (inputTokens / 1_000_000) * 0.150;
    const outputCost = (outputTokens / 1_000_000) * 0.600;
    return inputCost + outputCost;
  }
}

export const openaiProvider = new OpenAIProvider();
