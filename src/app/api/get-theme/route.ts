import { NextResponse } from "next/server";
import { supabase, supabaseServer, Theme } from "@/lib/supabase";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Langues supportées
const LANGUAGE_NAMES: Record<string, string> = {
  fr: "French",
  en: "English",
  es: "Spanish",
  de: "German",
  ko: "Korean",
  zh: "Chinese",
  ar: "Arabic",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedLang = searchParams.get("lang") || "en";
  const lang = requestedLang in LANGUAGE_NAMES ? requestedLang : "en";
  const lastId = searchParams.get("lastId");
  const excludeId = lastId && UUID_RE.test(lastId) ? lastId : null; // Éviter de rejouer le même

  try {
    const theme = await pickRandomTheme(excludeId);

    if (!theme) {
      return NextResponse.json({ error: "No theme available" }, { status: 503 });
    }

    const phrase = await getPhrase(theme, lang);

    return NextResponse.json(
      {
        themeId: theme.id,
        lang,
        phrase,
        colors: theme.colors,
        speed: theme.speed,
        softness: theme.softness,
        stepsPerColor: theme.steps_per_color,
        // URL audio via notre proxy (cache 1 an)
        audioUrl: theme.music_path ? `/api/audio/${theme.music_path}` : null,
        source: "cache",
      },
      {
        // Chaque appel doit tirer un thème différent : pas de cache CDN
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("Error in get-theme:", error);
    return NextResponse.json({ error: "Failed to get theme" }, { status: 500 });
  }
}

// Tire un thème au hasard et incrémente play_count (RPC atomique, 1 requête)
async function pickRandomTheme(excludeId: string | null): Promise<Theme | null> {
  const { data, error } = await supabaseServer.rpc("get_random_theme", { exclude_id: excludeId });

  if (!error) {
    return (data as Theme[] | null)?.[0] ?? null;
  }

  // Fonction absente (migration pas encore appliquée) ou clé service_role
  // manquante : ancien tirage
  if (error.code === "PGRST202" || error.code === "42501") {
    return pickRandomThemeLegacy(excludeId);
  }

  throw error;
}

async function pickRandomThemeLegacy(excludeId: string | null): Promise<Theme | null> {
  let countQuery = supabase.from("sublime_themes").select("*", { count: "exact", head: true });
  if (excludeId) countQuery = countQuery.neq("id", excludeId);
  const { count } = await countQuery;
  if (!count) return null;

  let dataQuery = supabase.from("sublime_themes").select("*");
  if (excludeId) dataQuery = dataQuery.neq("id", excludeId);
  const offset = Math.floor(Math.random() * count);
  const { data, error } = await dataQuery.range(offset, offset);
  if (error || !data?.length) return null;

  const theme = data[0] as Theme;
  await supabase
    .from("sublime_themes")
    .update({ play_count: theme.play_count + 1 })
    .eq("id", theme.id);
  return theme;
}

// Phrase dans la langue demandée : cache en base, sinon traduction + mise en cache
async function getPhrase(theme: Theme, lang: string): Promise<string> {
  if (lang === "en") return theme.phrase_en;

  const cached = theme.translations?.[lang];
  if (cached) return cached;

  const translated = await translatePhrase(theme.phrase_en, lang);

  if (translated !== theme.phrase_en) {
    const { error } = await supabaseServer.rpc("save_theme_translation", {
      theme_id: theme.id,
      lang,
      phrase: translated,
    });
    if (error && error.code !== "PGRST202" && error.code !== "42501") {
      console.error("Error saving translation:", error);
    }
  }

  return translated;
}

// Traduire une phrase avec OpenAI
async function translatePhrase(phrase: string, targetLang: string): Promise<string> {
  const langName = LANGUAGE_NAMES[targetLang] || "English";

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a translator. Translate the following poetic phrase to ${langName}. Keep the same tone and style. Return ONLY the translation, nothing else.`,
        },
        { role: "user", content: phrase },
      ],
      max_tokens: 200,
      temperature: 0.3,
    });

    return response.choices[0]?.message?.content?.trim() || phrase;
  } catch (error) {
    console.error("Translation error:", error);
    return phrase;
  }
}
