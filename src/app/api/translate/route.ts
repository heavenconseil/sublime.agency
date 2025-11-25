import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const LANGUAGE_NAMES: Record<string, string> = {
  fr: "French",
  en: "English",
  es: "Spanish",
  de: "German",
  ko: "Korean",
  zh: "Chinese",
  ar: "Arabic",
};

export async function POST(request: Request) {
  try {
    const { text, targetLang } = await request.json();

    if (!text || !targetLang) {
      return NextResponse.json(
        { error: "text and targetLang are required" },
        { status: 400 }
      );
    }

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
          content: text,
        },
      ],
      max_tokens: 200,
      temperature: 0.3,
    });

    const translated = response.choices[0]?.message?.content?.trim() || text;

    return NextResponse.json({ translated });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "Failed to translate" },
      { status: 500 }
    );
  }
}
