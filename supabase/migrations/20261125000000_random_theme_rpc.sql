-- Sublime : tirage aléatoire atomique + cache des traductions
-- À exécuter une fois dans le SQL Editor de Supabase (ou `supabase db push`).
-- Le code fonctionne avant et après : sans ces fonctions, /api/get-theme
-- retombe sur l'ancien comportement.

-- 1. Cache des traductions de phrase_en (ex. {"fr": "...", "de": "..."})
alter table public.sublime_themes
  add column if not exists translations jsonb not null default '{}'::jsonb;

-- 2. Tire un thème au hasard (hors exclude_id) et incrémente play_count
--    dans la même requête : un seul aller-retour, pas de course entre visiteurs.
create or replace function public.get_random_theme(exclude_id uuid default null)
returns setof public.sublime_themes
language sql
volatile
security definer
set search_path = public
as $$
  update public.sublime_themes t
     set play_count = t.play_count + 1
   where t.id = (
     select s.id
       from public.sublime_themes s
      where s.music_path is not null
        and (exclude_id is null or s.id <> exclude_id)
      order by random()
      limit 1
   )
  returning t.*;
$$;

-- 3. Enregistre une traduction dans le cache (sans écraser une traduction existante)
create or replace function public.save_theme_translation(theme_id uuid, lang text, phrase text)
returns void
language sql
volatile
security definer
set search_path = public
as $$
  update public.sublime_themes
     set translations = translations || jsonb_build_object(lang, phrase)
   where id = theme_id
     and not (translations ? lang)
     and lang ~ '^[a-z]{2}$'
     and length(phrase) between 1 and 300;
$$;

-- Réservées au serveur (clé service_role, jamais exposée au navigateur) :
-- la clé anon étant publique, l'exposer permettrait de modifier les phrases
-- affichées ou de gonfler play_count.
revoke all on function public.get_random_theme(uuid) from public, anon, authenticated;
revoke all on function public.save_theme_translation(uuid, text, text) from public, anon, authenticated;
grant execute on function public.get_random_theme(uuid) to service_role;
grant execute on function public.save_theme_translation(uuid, text, text) to service_role;

-- 4. Le site n'écrit plus directement dans la table : seules les fonctions
--    ci-dessus (security definer) modifient play_count et translations.
revoke insert, update, delete on public.sublime_themes from anon, authenticated;
