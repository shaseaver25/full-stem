# AI Provider Architecture

TailorEDU uses a **hybrid-ready AI architecture** that abstracts model calls behind a provider interface. This enables seamless switching between AI providers (OpenAI, Mixtral, Llama 3, Command R+) without changing business logic.

## 🎯 Goals

- **Provider Abstraction**: All AI calls go through a unified interface
- **Cost Tracking**: Automatic logging of token usage and estimated costs
- **Future-Proof**: Easy to add new providers without refactoring
- **Transparent**: Current behavior identical to OpenAI-only implementation

---

## 🏗️ Architecture

### Provider Interface

All providers implement the `AIProvider` interface:

```typescript
interface AIProvider {
  name: string;
  generate(prompt: string, options?: AIGenerateOptions): Promise<AIGenerateResponse>;
  estimateCost?(inputTokens: number, outputTokens: number): number;
}
```

### File Structure

```
src/services/aiProvider/
├── types.ts                # Shared interfaces
├── index.ts                # Provider selector
├── openaiProvider.ts       # ✅ Implemented
├── mixtralProvider.ts      # 🚧 Stub
├── llama3Provider.ts       # 🚧 Stub
└── commandrProvider.ts     # 🚧 Stub
```

---

## 🔧 Configuration

### Environment Variables

Add to `.env.local`:

```bash
# Primary provider (default: openai)
VITE_AI_PROVIDER=openai

# API Keys (only OpenAI required currently)
VITE_OPENAI_API_KEY=sk-...
VITE_MIXTRAL_API_KEY=      # For future use
VITE_LLAMA_API_KEY=        # For future use
VITE_COMMANDR_API_KEY=     # For future use
```

### Supabase Secrets

For edge functions, add to Supabase dashboard:

```bash
OPENAI_API_KEY=sk-...
```

---

## 📊 Cost Tracking

### Database Schema

The `ai_lesson_history` table logs every AI request:

```sql
CREATE TABLE ai_lesson_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users,
  model_provider text DEFAULT 'openai',
  model_name text,
  input_tokens int,
  output_tokens int,
  estimated_cost numeric(10,4),
  prompt_preview text,
  response_preview text,
  created_at timestamptz DEFAULT now()
);
```

### Cost Estimates

Current pricing (as of 2025):

| Provider | Input Cost | Output Cost | Model |
|----------|-----------|-------------|-------|
| **OpenAI** | $0.150 / 1M tokens | $0.600 / 1M tokens | gpt-4o-mini |
| Mixtral | ~$0.60 / 1M tokens | ~$0.60 / 1M tokens | mixtral-8x7b |
| Llama 3 | Varies by host | Varies by host | llama-3-70b |
| Command R+ | $3.00 / 1M tokens | $15.00 / 1M tokens | command-r-plus |

---

## 🚀 Usage

### Frontend Hook

```typescript
import { useAILessonGeneration } from '@/hooks/useAILessonGeneration';

const { generateLesson, isGenerating, lastUsage } = useAILessonGeneration();

const lessonText = await generateLesson({
  prompt: 'Create a lesson on photosynthesis for 8th grade',
  gradeLevel: '8',
  subject: 'Biology',
  providerName: 'openai', // Optional - defaults to VITE_AI_PROVIDER
});

console.log('Cost:', lastUsage?.estimatedCost);
```

### Edge Function

```typescript
import { getProvider } from './aiProvider';

const provider = getProvider();
const response = await provider.generate(prompt, {
  systemPrompt: 'You are an expert educator...',
  temperature: 0.7,
  maxTokens: 2000,
});

console.log('Tokens used:', response.usage?.totalTokens);
console.log('Estimated cost:', provider.estimateCost?.(
  response.usage.inputTokens,
  response.usage.outputTokens
));
```

---

## 📈 Admin Dashboard

The `AIUsageSummary` component shows:

- **Total Requests**: Number of AI calls made
- **Total Tokens**: Combined input + output tokens
- **Estimated Cost**: Total cost across all providers
- **By Provider**: Breakdown per model (OpenAI, Mixtral, etc.)

Add to admin dashboard:

```tsx
import { AIUsageSummary } from '@/components/admin/AIUsageSummary';

<AIUsageSummary />
```

---

## 🔮 Adding New Providers

### Step 1: Implement Provider

Create `src/services/aiProvider/newProvider.ts`:

```typescript
import type { AIProvider, AIGenerateOptions, AIGenerateResponse } from './types';

class NewProvider implements AIProvider {
  name = 'newprovider';
  private apiKey = import.meta.env.VITE_NEWPROVIDER_API_KEY;

  async generate(prompt: string, options?: AIGenerateOptions): Promise<AIGenerateResponse> {
    const response = await fetch('https://api.newprovider.com/v1/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
      }),
    });

    const data = await response.json();
    return {
      text: data.response,
      usage: {
        inputTokens: data.usage.input,
        outputTokens: data.usage.output,
        totalTokens: data.usage.total,
      },
      modelUsed: data.model,
    };
  }

  estimateCost(inputTokens: number, outputTokens: number): number {
    const inputCost = (inputTokens / 1_000_000) * 1.50;  // $1.50 per 1M input
    const outputCost = (outputTokens / 1_000_000) * 4.00; // $4.00 per 1M output
    return inputCost + outputCost;
  }
}

export const newProvider = new NewProvider();
```

### Step 2: Register Provider

Update `src/services/aiProvider/index.ts`:

```typescript
import { newProvider } from './newProvider';

export function getProvider(name?: string): AIProvider {
  switch (providerName.toLowerCase()) {
    case 'openai': return openaiProvider;
    case 'newprovider': return newProvider;  // ✅ Add here
    default: return openaiProvider;
  }
}
```

### Step 3: Add Environment Variable

```bash
VITE_NEWPROVIDER_API_KEY=your-api-key
```

### Step 4: Update `isProviderAvailable()`

```typescript
export function isProviderAvailable(name: string): boolean {
  return ['openai', 'newprovider'].includes(name);  // ✅ Add here
}
```

---

## 🧪 Testing Provider Switching

### Development Test

1. Set `VITE_AI_PROVIDER=mixtral` in `.env.local`
2. Trigger lesson generation
3. Expected: "Mixtral provider not implemented yet. Coming soon!"
4. Logs should show: `[AI Provider] Selecting provider: mixtral`

### Production Test

OpenAI remains active in production (no changes to runtime behavior).

---

## 🚦 Future Roadmap

### Phase 1: Current (OpenAI Only) ✅
- Provider abstraction in place
- Cost tracking active
- Usage dashboard live

### Phase 2: Multi-Model Support 🚧
- Implement Mixtral provider
- Implement Llama 3 provider
- Implement Command R+ provider

### Phase 3: Intelligent Routing 🔮
- Auto-switch to cheaper models for drafts
- Use premium models for final generation
- A/B testing framework
- Per-teacher provider preferences

---

## 📝 Migration Notes

### Breaking Changes
None. Existing OpenAI behavior is preserved.

### Database Updates
Run migration:
```sql
ALTER TABLE ai_lesson_history
ADD COLUMN model_provider text DEFAULT 'openai',
ADD COLUMN model_name text,
ADD COLUMN input_tokens int,
ADD COLUMN output_tokens int,
ADD COLUMN estimated_cost numeric(10,4);
```

### Edge Function Updates
Edge functions must log usage to `ai_lesson_history` for tracking.

---

## 🔒 Security

- **API Keys**: Never commit to source control
- **Rate Limiting**: Implement per-user limits
- **Cost Alerts**: Set up alerts for unusual usage
- **RLS Policies**: Users can only see their own usage

---

## 📞 Support

Questions? See:
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [OpenAI API Docs](https://platform.openai.com/docs)
- TailorEDU Developer Slack: #ai-providers
