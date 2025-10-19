// src/integrations/supabase/functions.ts
import { env } from '@/utils/env';

export const SEED_FN = 'seed-demo-tenant'; // must match folder name (dashes)
export const SEED_BASE =
  `${env.VITE_SUPABASE_URL}/functions/v1/${SEED_FN}`;

export const seedDemoStatusUrl = `${SEED_BASE}?action=status`; // GET (public)
export const seedDemoSeedUrl   = `${SEED_BASE}?action=seed`;   // POST (auth)
export const seedDemoWipeUrl   = `${SEED_BASE}?action=wipe`;   // POST (auth)