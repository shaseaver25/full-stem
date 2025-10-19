import type { AIProvider, AIGenerateOptions, AIGenerateResponse } from './types';

/**
 * Command R+ Provider (Stub - Not Implemented)
 * Future integration for Cohere's Command R+ model
 */
class CommandRProvider implements AIProvider {
  name = 'commandr';

  async generate(_prompt: string, _options?: AIGenerateOptions): Promise<AIGenerateResponse> {
    throw new Error('Command R+ provider not implemented yet. Coming soon!');
  }

  estimateCost(_inputTokens: number, _outputTokens: number): number {
    // Future: Command R+ pricing (~$3 / 1M input, $15 / 1M output)
    return 0;
  }
}

export const commandrProvider = new CommandRProvider();
