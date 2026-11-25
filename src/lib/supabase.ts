import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client serveur (service_role) pour les fonctions SQL réservées au serveur.
// SUPABASE_SERVICE_ROLE_KEY ne doit jamais être préfixée NEXT_PUBLIC_.
// Sans cette clé, on retombe sur le client anon (les RPC seront refusées).
export const supabaseServer = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : supabase;

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
  translations?: Record<string, string>; // ajouté par la migration 20261125
  created_at: string;
}
