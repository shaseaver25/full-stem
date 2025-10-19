/**
 * Common interface for all AI providers
 */
export interface AIProvider {
  name: string;
  generate(prompt: string, options?: AIGenerateOptions): Promise<AIGenerateResponse>;
  estimateCost?(inputTokens: number, outputTokens: number): number;
}

export interface AIGenerateOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
  [key: string]: any;
}

export interface AIGenerateResponse {
  text: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  modelUsed?: string;
}

export interface AIUsageLog {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  timestamp: Date;
}
