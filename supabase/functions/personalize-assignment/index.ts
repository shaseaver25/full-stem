import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateRequest, validateResponse } from './validator.ts';
import { personalizeWithLLM } from './personalizeWithLLM.ts';

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

    // Validate request
    const requestValidation = validateRequest(requestData);
    if (!requestValidation.isValid) {
      return new Response(JSON.stringify({ 
        error: 'validation_failed', 
        issues: requestValidation.issues 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate personalized response
    const response = await personalizeWithLLM(requestData);

    // Validate response
    const responseValidation = validateResponse(response, requestData);
    if (!responseValidation.isValid) {
      console.error('Response validation failed:', responseValidation.issues);
      return new Response(JSON.stringify({ 
        error: 'validation_failed', 
        issues: responseValidation.issues 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log successful personalization for audit
    console.log('Personalization successful:', {
      student_id: requestData.student_profile.student_id,
      interests: requestData.student_profile.interests,
      changed_elements: response.changed_elements,
      word_count: response.personalized_text.split(/\s+/).length,
      timestamp: new Date().toISOString(),
    });

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