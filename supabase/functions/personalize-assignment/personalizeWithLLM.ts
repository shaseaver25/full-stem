interface PersonalizeRequest {
  base_assignment: string;
  student_profile: {
    student_id: string;
    interests: string[];
    home_language: string;
    reading_level: string;
  };
  constraints: {
    must_keep_keywords: string[];
    reading_level: string;
    language_pref: string;
    max_length_words: number;
    edit_permissions: {
      allow_numbers: boolean;
      allow_rubric_edits: boolean;
    };
  };
}

interface PersonalizeResponse {
  personalized_text: string;
  rationale: string;
  kept_keywords: string[];
  changed_elements: ("context" | "examples" | "names" | "setting")[];
  reading_level_estimate: string;
}

// Default fallback interests if none provided
const DEFAULT_INTERESTS = ['sports', 'animals', 'space'];

// Stub implementation for MVP - can be swapped with real LLM later
export async function personalizeWithLLM(request: PersonalizeRequest): Promise<PersonalizeResponse> {
  // Use fallback interests if missing or empty
  const interests = request.student_profile.interests?.length > 0 
    ? request.student_profile.interests.slice(0, 5) // max 5 interests
    : DEFAULT_INTERESTS;

  // For MVP, do simple text substitutions based on interests
  let personalizedText = request.base_assignment;
  const changedElements: ("context" | "examples" | "names" | "setting")[] = [];

  // Simple interest-based personalization
  if (interests.includes('sports')) {
    personalizedText = personalizedText.replace(
      /\bexample\b/gi, 
      'sports example'
    );
    personalizedText = personalizedText.replace(
      /\bdata\b/gi,
      'sports statistics'
    );
    changedElements.push('context', 'examples');
  }

  if (interests.includes('animals')) {
    personalizedText = personalizedText.replace(
      /\bstudent(s)?\b/gi,
      'wildlife researcher$1'
    );
    personalizedText = personalizedText.replace(
      /\bpeople\b/gi,
      'animals'
    );
    changedElements.push('context', 'setting');
  }

  if (interests.includes('space')) {
    personalizedText = personalizedText.replace(
      /\bplanet\b/gi,
      'Mars'
    );
    personalizedText = personalizedText.replace(
      /\bworld\b/gi,
      'solar system'
    );
    changedElements.push('setting');
  }

  // Generic name personalization (if no specific interests matched)
  if (changedElements.length === 0) {
    personalizedText = personalizedText.replace(
      /\bAlex\b/gi,
      'Taylor'
    );
    personalizedText = personalizedText.replace(
      /\bJohn\b/gi,
      'Sam'
    );
    changedElements.push('names');
  }

  // Remove duplicates from changed elements
  const uniqueChangedElements = [...new Set(changedElements)];

  // Generate rationale based on what was changed
  let rationale = 'Personalization limited to maintain standard.';
  if (uniqueChangedElements.length > 0) {
    const interestsText = interests.slice(0, 3).join(', ');
    rationale = `Modified ${uniqueChangedElements.join(' and ')} to align with student interests in ${interestsText} while preserving core learning objectives.`;
  }

  return {
    personalized_text: personalizedText,
    rationale: rationale,
    kept_keywords: request.constraints.must_keep_keywords,
    changed_elements: uniqueChangedElements,
    reading_level_estimate: request.constraints.reading_level
  };
}

// Future: Replace this function with actual LLM integration
// export async function personalizeWithOpenAI(request: PersonalizeRequest): Promise<PersonalizeResponse> {
//   const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
//   if (!openAIApiKey) {
//     throw new Error('OpenAI API key not configured');
//   }
//
//   const systemPrompt = `You personalize ONLY the surface context of educational assignments to match a student's interests and accessibility needs.
//
// Hard rules:
// - Preserve the assessed skill/standard, solution path, and any scored vocabulary.
// - Keep numbers the same unless edit_permissions.allow_numbers = true.
// - Keep reading level within the requested band.
// - Respect language preference.
// - If a rule would be violated, do minimal personalization and include the sentence: "Personalization limited to maintain standard."
//
// Return ONLY valid JSON matching:
// {
//   "personalized_text": "string",
//   "rationale": "1-2 sentences on what changed and why",
//   "kept_keywords": ["..."],
//   "changed_elements": ["context","examples","names","setting"],
//   "reading_level_estimate": "string"
// }`;
//
//   const userPrompt = `BASE_ASSIGNMENT:
// <<<${request.base_assignment}>>>
//
// CONSTRAINTS:
// - reading_level: ${request.constraints.reading_level}
// - language: ${request.constraints.language_pref}
// - must_keep_keywords: ${request.constraints.must_keep_keywords.join(', ')}
// - max_length_words: ${request.constraints.max_length_words}
// - edit_permissions: ${JSON.stringify(request.constraints.edit_permissions)}
//
// STUDENT_INTEREST_PROFILE:
// - interests: ${request.student_profile.interests.join(', ')}
// - home_language: ${request.student_profile.home_language}
//
// TASK:
// Rewrite ONLY context/examples/names/setting to align with the interests while preserving standards, solution path, and difficulty. Keep numbers unchanged if allow_numbers=false. Output valid JSON per the schema with no extra commentary.`;
//
//   const response = await fetch('https://api.openai.com/v1/chat/completions', {
//     method: 'POST',
//     headers: {
//       'Authorization': `Bearer ${openAIApiKey}`,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       model: 'gpt-4o-mini',
//       messages: [
//         { role: 'system', content: systemPrompt },
//         { role: 'user', content: userPrompt }
//       ],
//       max_tokens: 1000,
//       temperature: 0.3,
//     }),
//   });
//
//   if (!response.ok) {
//     throw new Error(`OpenAI API error: ${response.status}`);
//   }
//
//   const data = await response.json();
//   const content = data.choices[0].message.content;
//
//   try {
//     return JSON.parse(content);
//   } catch (error) {
//     throw new Error('Invalid JSON response from OpenAI');
//   }
// }
