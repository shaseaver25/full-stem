interface ValidationIssue {
  field: string;
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
}

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

// Extract numeric tokens from text (handles currency, decimals, etc.)
function extractNumbers(text: string): number[] {
  // Match numbers including currency symbols, decimals, percentages
  const numberRegex = /[$£€¥]?(\d+(?:[.,]\d+)*)\s*[%]?/g;
  const numbers: number[] = [];
  let match;
  
  while ((match = numberRegex.exec(text)) !== null) {
    // Remove commas and convert to number
    const numValue = parseFloat(match[1].replace(/,/g, ''));
    if (!isNaN(numValue)) {
      numbers.push(numValue);
    }
  }
  
  return numbers.sort((a, b) => a - b); // Sort for comparison
}

// Count words in text
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

// Check if two arrays of numbers are equal
function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (Math.abs(a[i] - b[i]) > 0.001) return false; // Account for floating point precision
  }
  return true;
}

export function validateRequest(request: PersonalizeRequest): ValidationResult {
  const issues: ValidationIssue[] = [];

  // Check required fields
  if (!request.base_assignment || request.base_assignment.trim().length === 0) {
    issues.push({ field: 'base_assignment', message: 'Base assignment text is required' });
  }

  if (!request.student_profile?.student_id) {
    issues.push({ field: 'student_profile.student_id', message: 'Student ID is required' });
  }

  if (!request.constraints?.max_length_words || request.constraints.max_length_words <= 0) {
    issues.push({ field: 'constraints.max_length_words', message: 'Valid max_length_words is required' });
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}

export function validateResponse(
  response: PersonalizeResponse,
  request: PersonalizeRequest
): ValidationResult {
  const issues: ValidationIssue[] = [];

  try {
    // 1. Check if response can be JSON parsed (assuming it came from JSON)
    if (!response.personalized_text || typeof response.personalized_text !== 'string') {
      issues.push({ field: 'personalized_text', message: 'Personalized text must be a non-empty string' });
      return { isValid: false, issues };
    }

    // 2. Word cap validation
    const wordCount = countWords(response.personalized_text);
    if (wordCount > request.constraints.max_length_words) {
      issues.push({
        field: 'personalized_text',
        message: `Text exceeds word limit: ${wordCount} > ${request.constraints.max_length_words}`
      });
    }

    // 3. Number invariants validation (if allow_numbers is false)
    if (!request.constraints.edit_permissions.allow_numbers) {
      const originalNumbers = extractNumbers(request.base_assignment);
      const personalizedNumbers = extractNumbers(response.personalized_text);

      if (!arraysEqual(originalNumbers, personalizedNumbers)) {
        issues.push({
          field: 'personalized_text',
          message: `Numbers must remain unchanged. Original: [${originalNumbers.join(', ')}], Personalized: [${personalizedNumbers.join(', ')}]`
        });
      }
    }

    // 4. Validate required response fields
    if (!response.rationale || response.rationale.trim().length === 0) {
      issues.push({ field: 'rationale', message: 'Rationale is required' });
    }

    if (!Array.isArray(response.kept_keywords)) {
      issues.push({ field: 'kept_keywords', message: 'kept_keywords must be an array' });
    }

    if (!Array.isArray(response.changed_elements)) {
      issues.push({ field: 'changed_elements', message: 'changed_elements must be an array' });
    }

    const validElements = ['context', 'examples', 'names', 'setting'];
    for (const element of response.changed_elements || []) {
      if (!validElements.includes(element)) {
        issues.push({
          field: 'changed_elements',
          message: `Invalid changed element: ${element}. Must be one of: ${validElements.join(', ')}`
        });
      }
    }

    if (!response.reading_level_estimate || response.reading_level_estimate.trim().length === 0) {
      issues.push({ field: 'reading_level_estimate', message: 'Reading level estimate is required' });
    }

  } catch (error) {
    issues.push({ field: 'response', message: 'Invalid JSON response format' });
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}