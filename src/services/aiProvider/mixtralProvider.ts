import type { AIProvider, AIGenerateOptions, AIGenerateResponse } from './types';

/**
 * Mixtral Provider (Stub - Not Implemented)
 * Future integration for Mistral's Mixtral-8x7B model
 */
class MixtralProvider implements AIProvider {
  name = 'mixtral';

  async generate(_prompt: string, _options?: AIGenerateOptions): Promise<AIGenerateResponse> {
    throw new Error('Mixtral provider not implemented yet. Coming soon!');
  }

  estimateCost(_inputTokens: number, _outputTokens: number): number {
    // Future: Mixtral pricing (~$0.60 / 1M input, $0.60 / 1M output via Mistral AI API)
    return 0;
  }
}

export const mixtralProvider = new MixtralProvider();
