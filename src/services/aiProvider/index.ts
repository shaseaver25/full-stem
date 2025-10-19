import type { AIProvider } from './types';
import { openaiProvider } from './openaiProvider';
import { mixtralProvider } from './mixtralProvider';
import { llama3Provider } from './llama3Provider';
import { commandrProvider } from './commandrProvider';

export * from './types';
export { openaiProvider, mixtralProvider, llama3Provider, commandrProvider };

/**
 * Get AI provider by name
 * Defaults to OpenAI if not specified or if VITE_AI_PROVIDER env var is not set
 */
export function getProvider(name?: string): AIProvider {
  const providerName = name ?? import.meta.env.VITE_AI_PROVIDER ?? 'openai';
  
  console.log(`[AI Provider] Selecting provider: ${providerName}`);
  
  switch (providerName.toLowerCase()) {
    case 'openai':
      return openaiProvider;
    case 'mixtral':
      return mixtralProvider;
    case 'llama3':
      return llama3Provider;
    case 'commandr':
      return commandrProvider;
    default:
      console.warn(`[AI Provider] Unknown provider "${providerName}", defaulting to OpenAI`);
      return openaiProvider;
  }
}

/**
 * Check if a provider is available (implemented)
 */
export function isProviderAvailable(name: string): boolean {
  try {
    const provider = getProvider(name);
    // Stub providers throw errors in generate(), but we can check their name
    return ['openai'].includes(provider.name);
  } catch {
    return false;
  }
}
