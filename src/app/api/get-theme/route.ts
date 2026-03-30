import { NextResponse } from "next/server";
import { supabase, supabaseAdmin, Theme } from "@/lib/supabase";
import OpenAI from "openai";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

export const maxDuration = 60; // Timeout pour génération temps réel

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });

const REALTIME_RATIO = 0.05; // 5% de génération temps réel
const MIN_STOCK = 20; // Stock minimum avant de forcer le temps réel

// Traductions des langues supportées
const LANGUAGE_NAMES: Record<string, string> = {
  fr: "French",
  en: "English", 
  es: "Spanish",
  de: "German",
  ko: "Korean",
  zh: "Chinese",
  ar: "Arabic",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang") || "en";
  const forceRealtime = searchParams.get("realtime") === "true";
  const lastThemeId = searchParams.get("lastId") || null; // Éviter de rejouer le même

  try {
    // Compter le stock actuel
    const { count } = await supabase
      .from("sublime_themes")
      .select("*", { count: "exact", head: true });

    const stockCount = count || 0;
    const useRealtime = forceRealtime || stockCount < MIN_STOCK || Math.random() < REALTIME_RATIO;

    if (useRealtime) {
      // Génération temps réel
      console.log("🎨 Generating realtime theme...");
      return await generateRealtimeTheme(lang);
    } else {
      // Récupérer depuis le cache
      console.log("📦 Fetching cached theme...");
      return await getCachedTheme(lang, lastThemeId);
    }
  } catch (error) {
    console.error("Error in get-theme:", error);
    return NextResponse.json(
      { error: "Failed to get theme" },
      { status: 500 }
    );
  }
}

// Récupérer un thème depuis le cache Supabase
async function getCachedTheme(lang: string, excludeId: string | null) {
  // Construire la requête de base
  let query = supabase.from("sublime_themes").select("*", { count: "exact", head: true });
  
  // Exclure le dernier thème joué
  if (excludeId) {
    query = query.neq("id", excludeId);
  }
  
  const { count } = await query;
  
  if (!count || count === 0) {
    return await generateRealtimeTheme(lang);
  }
  
  // Offset aléatoire pour récupérer un thème au hasard
  const randomOffset = Math.floor(Math.random() * count);
  
  let dataQuery = supabase.from("sublime_themes").select("*");
  if (excludeId) {
    dataQuery = dataQuery.neq("id", excludeId);
  }
  
  const { data: themes, error } = await dataQuery
    .range(randomOffset, randomOffset)
    .limit(1);

  if (error || !themes || themes.length === 0) {
    // Fallback sur génération temps réel si pas de cache
    return await generateRealtimeTheme(lang);
  }

  const theme = themes[0] as Theme;

  // Incrémenter le play_count
  await supabase
    .from("sublime_themes")
    .update({ play_count: theme.play_count + 1 })
    .eq("id", theme.id);

  // Traduire si nécessaire
  let phrase = theme.phrase_en;
  if (lang !== "en") {
    phrase = await translatePhrase(theme.phrase_en, lang);
  }

  // Construire l'URL audio depuis le bucket
  const audioUrl = theme.music_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/SUBLIME/${theme.music_path}`
    : null;

  return NextResponse.json({
    themeId: theme.id, // Pour éviter de rejouer le même
    phrase,
    colors: theme.colors,
    speed: theme.speed,
    softness: theme.softness,
    stepsPerColor: theme.steps_per_color,
    audioUrl,
    source: "cache",
  });
}

// Générer le thème directement avec OpenAI (plus de fetch HTTP interne)
async function generateThemeWithOpenAI() {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Tu es une IA générative visuelle et poétique. Ton rôle est de créer des concepts d'ambiance visuelle uniques et évocateurs.

        Génère une phrase courte (max 8 mots) qui décrit une ambiance visuelle. The phrase must be in English.
        
        CATÉGORIES D'INSPIRATION (varie entre elles) :
        
        🌌 COSMIQUE & SCI-FI :
        - "Sunset on Mars"
        - "Colliding nebula"
        - "Abandoned space station"
        - "Aurora borealis on Titan"
        - "Awakening black hole"
        
        🌊 NATURE & ÉLÉMENTS :
        - "Silent glacial dawn"
        - "Bamboo forest in the mist"
        - "Electric storm over the ocean"
        - "Salt desert at twilight"
        - "Waterfall frozen in time"
        
        🏙️ URBAIN & CYBERPUNK :
        - "Neon under the rain"
        - "Tokyo 3am"
        - "Ghost metro last car"
        - "Skyscraper in the fog"
        - "Deserted holographic alley"
        
        🎨 ABSTRAIT & ÉMOTIONNEL :
        - "Liquid melancholy"
        - "Explosion of pure joy"
        - "Silence before the storm"
        - "Fragmented lucid dream"
        - "Nostalgia of a lost future"
        
        RÈGLES :
        - Sois TRÈS créatif, ne répète jamais les exemples
        - Mélange les univers de manière inattendue
        - Évoque des sensations, pas juste des lieux
        - Ose les associations surprenantes
        
        Génère une palette de 5 couleurs hexadécimales qui correspondent PARFAITEMENT à cette ambiance.
        
        Choisis des paramètres pour un effet visuel (Simplex Noise) :
           - speed : entre 0.2 (très calme) et 2.0 (très agité)
           - softness : entre 0.0 (net, tranchant) et 1.5 (très flou/vaporeux)
           - stepsPerColor : entre 1 et 5 (complexité du dégradé)`
      },
      {
        role: "user",
        content: "Generate a new unique visual atmosphere."
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "visual_theme_response",
        strict: true,
        schema: {
          type: "object",
          properties: {
            phrase: {
              type: "string",
              description: "A short poetic phrase in English describing the atmosphere."
            },
            colors: {
              type: "array",
              items: { type: "string" },
              description: "A list of exactly 5 hexadecimal colors."
            },
            speed: {
              type: "number",
              description: "Animation speed (0.2 to 2.0)."
            },
            softness: {
              type: "number",
              description: "Noise softness (0.0 to 1.5)."
            },
            stepsPerColor: {
              type: "number",
              description: "Steps per color (1 to 5)."
            }
          },
          required: ["phrase", "colors", "speed", "softness", "stepsPerColor"],
          additionalProperties: false
        }
      }
    },
    temperature: 1,
  });

  const content = completion.choices[0].message.content;
  if (!content) throw new Error("No content generated");
  
  return JSON.parse(content);
}

// Générer un nouveau thème en temps réel
async function generateRealtimeTheme(lang: string) {
  // 1. Générer le thème avec OpenAI (en anglais) - appel direct, pas de fetch HTTP
  const theme = await generateThemeWithOpenAI();

  // 2. Générer la musique avec ElevenLabs
  console.log("🎵 Generating music for:", theme.phrase);
  const musicResponse = await elevenlabs.music.compose({
    prompt: theme.phrase,
    musicLengthMs: 30000,
    forceInstrumental: true,
  });

  // Convertir le stream en buffer
  const chunks: Uint8Array[] = [];
  const reader = musicResponse.getReader();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const audioArray = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    audioArray.set(chunk, offset);
    offset += chunk.length;
  }
  
  const audioBuffer = Buffer.from(audioArray);
  const audioBase64 = audioBuffer.toString("base64");

  // 3. Sauvegarder dans Supabase (en arrière-plan)
  saveThemeToSupabase(theme, audioBuffer).catch(console.error);

  // 4. Traduire si nécessaire
  let phrase = theme.phrase;
  if (lang !== "en") {
    phrase = await translatePhrase(theme.phrase, lang);
  }

  return NextResponse.json({
    phrase,
    colors: theme.colors,
    speed: theme.speed,
    softness: theme.softness,
    stepsPerColor: theme.stepsPerColor,
    audioBase64,
    source: "realtime",
  });
}

// Sauvegarder un nouveau thème dans Supabase
async function saveThemeToSupabase(theme: any, audioBuffer: Buffer) {
  try {
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.mp3`;

    // Upload le fichier audio
    const { error: uploadError } = await supabaseAdmin.storage
      .from("SUBLIME")
      .upload(fileName, audioBuffer, {
        contentType: "audio/mpeg",
        cacheControl: "31536000",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return;
    }

    // Insérer dans la table
    const { error: insertError } = await supabase.from("sublime_themes").insert({
      phrase_en: theme.phrase,
      colors: theme.colors,
      speed: theme.speed,
      softness: theme.softness,
      steps_per_color: theme.stepsPerColor,
      music_path: fileName,
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      return;
    }

    console.log("✅ Theme saved to Supabase:", fileName);
  } catch (err) {
    console.error("Error saving theme:", err);
  }
}

// Traduire une phrase avec OpenAI
async function translatePhrase(phrase: string, targetLang: string): Promise<string> {
  const langName = LANGUAGE_NAMES[targetLang] || "English";

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a translator. Translate the following poetic phrase to ${langName}. Keep the same tone and style. Return ONLY the translation, nothing else.`,
      },
      {
        role: "user",
        content: phrase,
      },
    ],
    max_tokens: 200,
    temperature: 0.3,
  });

  return response.choices[0]?.message?.content?.trim() || phrase;
}
