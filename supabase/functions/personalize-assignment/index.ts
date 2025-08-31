import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

const personalizeWithLLM = async (request: PersonalizeRequest): Promise<PersonalizeResponse> => {
  // For MVP, return a mock personalized version
  const interests = request.student_profile.interests.slice(0, 3).join(", ");
  
  // Simple personalization: inject interests into the assignment
  let personalizedText = request.base_assignment;
  
  // Add interest-based context
  if (interests.includes("sports")) {
    personalizedText = personalizedText.replace(
      /example/gi, 
      "sports example (like basketball scores or team statistics)"
    );
  }
  
  if (interests.includes("animals")) {
    personalizedText = personalizedText.replace(
      /data/gi,
      "animal data (like pet surveys or zoo visitor counts)"
    );
  }

  return {
    personalized_text: personalizedText,
    rationale: `Personalized based on student interests: ${interests}. Modified examples and context to relate to student's interests while maintaining the core learning objectives.`,
    kept_keywords: request.constraints.must_keep_keywords,
    changed_elements: ["context", "examples"],
    reading_level_estimate: request.constraints.reading_level
  };
};

const validateResponse = (response: PersonalizeResponse): boolean => {
  return !!(
    response.personalized_text &&
    response.rationale &&
    Array.isArray(response.kept_keywords) &&
    Array.isArray(response.changed_elements) &&
    response.reading_level_estimate
  );
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const requestData: PersonalizeRequest = await req.json();

    // Basic validation
    if (!requestData.base_assignment || !requestData.student_profile) {
      return new Response(JSON.stringify({ error: 'Invalid request data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await personalizeWithLLM(requestData);

    if (!validateResponse(response)) {
      throw new Error('Invalid response from personalization engine');
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in personalize-assignment function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});