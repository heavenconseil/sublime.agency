# Sublime — sublime.agency

Landing page de Sublime (heaven). À chaque cycle, l'écran tire une « ambiance » au hasard : une phrase, une palette de 5 couleurs animée en shader, et une musique de 30 s.

## Fonctionnement

- **Stock d'ambiances** : table Supabase `sublime_themes` (phrase en anglais, couleurs, paramètres du shader, `music_path`, `play_count`, `translations`) et bucket `SUBLIME` pour les MP3. Le stock (environ 1 075 ambiances) a été généré avec OpenAI + ElevenLabs ; il n'y a plus de génération.
- **`GET /api/get-theme?lang=fr&lastId=<uuid>`** : tire une ambiance au hasard (hors `lastId`) via la fonction SQL `get_random_theme`, qui incrémente `play_count` dans la même requête. La phrase est traduite avec `gpt-4o-mini` puis mise en cache dans `translations`.
- **`GET /api/audio/<fichier>.mp3`** : proxy vers le bucket Supabase, en cache CDN pendant 1 an.
- **`POST /api/translate`** : traduit la phrase affichée quand le visiteur change de langue.
- Langues : fr, en, es, de, ko, zh, ar.

## Développement

```bash
npm install
npm run dev
```

Variables d'environnement (`.env.local`) :

```
OPENAI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # serveur uniquement : appelle get_random_theme / save_theme_translation
```

## Base de données

Les migrations sont dans `supabase/migrations/`. Pour les appliquer, colle-les dans le SQL Editor de Supabase ou lance `supabase db push`.

Déployé sur Vercel.
