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
      return await getCachedTheme(lang);
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
async function getCachedTheme(lang: string) {
  // Récupérer un thème aléatoire parmi les moins joués
  const { data: themes, error } = await supabase
    .from("sublime_themes")
    .select("*")
    .order("play_count", { ascending: true })
    .limit(10);

  if (error || !themes || themes.length === 0) {
    // Fallback sur génération temps réel si pas de cache
    return await generateRealtimeTheme(lang);
  }

  // Choisir aléatoirement parmi les 10 moins joués
  const theme = themes[Math.floor(Math.random() * themes.length)] as Theme;

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
    phrase,
    colors: theme.colors,
    speed: theme.speed,
    softness: theme.softness,
    stepsPerColor: theme.steps_per_color,
    audioUrl,
    source: "cache",
  });
}

// Générer un nouveau thème en temps réel
async function generateRealtimeTheme(lang: string) {
  // 1. Générer le thème avec OpenAI (en anglais)
  const themeResponse = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/generate-theme?lang=en`
  );
  if (!themeResponse.ok) throw new Error("Failed to generate theme");
  const theme = await themeResponse.json();

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
