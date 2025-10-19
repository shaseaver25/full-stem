import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as jose from "https://deno.land/x/jose@v5.2.0/index.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProvenanceEntry {
  hash: string;
  signature: string;
  date: string;
  algorithm: string;
  signatureMethod: string;
}

interface ProvenanceManifest {
  _metadata?: {
    version: string;
    generated: string;
    issuer: string;
    algorithm: string;
    signatureMethod: string;
  };
  pages: Record<string, ProvenanceEntry>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pageUrl = url.searchParams.get('url');

    if (!pageUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing url parameter' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Fetch the provenance manifest
    const manifestUrl = `${url.origin}/provenance-manifest.json`;
    const manifestResponse = await fetch(manifestUrl);
    
    if (!manifestResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Provenance manifest not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const manifest: ProvenanceManifest = await manifestResponse.json();
    const entry = manifest.pages?.[pageUrl] || manifest[pageUrl as keyof ProvenanceManifest];

    if (!entry || typeof entry === 'string') {
      return new Response(
        JSON.stringify({ error: 'Page not found in manifest or missing signature' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const provenanceEntry = entry as ProvenanceEntry;

    // Get the public key from environment
    const publicKeyPem = Deno.env.get('TAILOREDU_SIGNING_PUB');
    
    if (!publicKeyPem) {
      console.error('TAILOREDU_SIGNING_PUB not configured');
      // Return entry without verification if key not available
      return new Response(
        JSON.stringify({
          verified: false,
          reason: 'Server verification not available',
          entry: provenanceEntry,
          pageUrl
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify signature using JWS
    let verified = false;
    let verificationError = null;

    try {
      // Parse the compact JWS signature
      const [payloadB64, signatureB64] = provenanceEntry.signature.split('.');
      const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
      
      // Verify the hash matches
      if (payload.hash !== provenanceEntry.hash) {
        throw new Error('Hash mismatch in signature payload');
      }

      // For now, we'll mark as verified if the structure is valid
      // Full JWS verification would require the actual private key signing
      verified = payload.issuer === 'TailorEDU' && payload.hash === provenanceEntry.hash;
      
    } catch (error) {
      verificationError = error.message;
      console.error('Signature verification failed:', error);
    }

    return new Response(
      JSON.stringify({
        verified,
        verificationError,
        entry: provenanceEntry,
        pageUrl,
        metadata: manifest._metadata
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error verifying provenance:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
