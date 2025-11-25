import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client avec service role pour les opérations admin (upload, etc.)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
);

// Types pour la table themes
export interface Theme {
  id: string;
  phrase_en: string;
  colors: string[];
  speed: number;
  softness: number;
  steps_per_color: number;
  music_path: string | null;
  play_count: number;
  created_at: string;
}
