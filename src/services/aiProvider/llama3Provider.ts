import type { AIProvider, AIGenerateOptions, AIGenerateResponse } from './types';

/**
 * Llama 3 Provider (Stub - Not Implemented)
 * Future integration for Meta's Llama 3 model
 */
class Llama3Provider implements AIProvider {
  name = 'llama3';

  async generate(_prompt: string, _options?: AIGenerateOptions): Promise<AIGenerateResponse> {
    throw new Error('Llama 3 provider not implemented yet. Coming soon!');
  }

  estimateCost(_inputTokens: number, _outputTokens: number): number {
    // Future: Llama 3 pricing (varies by hosting provider)
    return 0;
  }
}

export const llama3Provider = new Llama3Provider();
