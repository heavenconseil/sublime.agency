import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // ou gpt-3.5-turbo si tu préfères
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Tu es une IA générative visuelle et poétique. Ton rôle est de créer des concepts d'ambiance visuelle.
          
          RÈGLES STRICTES :
          1. Génère une phrase courte (max 8 mots) qui décrit une ambiance visuelle abstraite ou naturelle (ex: "Coucher de soleil sur Mars", "Néon sous la pluie", "Aube glaciaire"). La phrase doit être en Français.
          2. Génère une palette de 5 couleurs hexadécimales qui correspondent PARFAITEMENT à cette ambiance.
          3. Choisis des paramètres pour un effet visuel (Simplex Noise) :
             - speed : entre 0.2 (très calme) et 2.0 (très agité)
             - softness : entre 0.0 (net, tranchant) et 1.5 (très flou/vaporeux)
             - stepsPerColor : entre 1 et 5 (complexité du dégradé)
          4. Retourne UNIQUEMENT un objet JSON valide.

          FORMAT ATTENDU :
          {
            "phrase": "string",
            "colors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
            "speed": number,
            "softness": number,
            "stepsPerColor": number
          }`
        },
        {
          role: "user",
          content: "Génère une nouvelle ambiance visuelle unique."
        }
      ],
      temperature: 1.1, // Un peu de créativité
    });

    const content = completion.choices[0].message.content;
    
    if (!content) {
        throw new Error("No content generated");
    }

    const data = JSON.parse(content);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("OpenAI Error:", error);
    return NextResponse.json(
      { 
        phrase: "Connexion perdue...", 
        colors: ["#2f2235", "#3f3244", "#60495a", "#a9aca9", "#bfc3ba"],
        speed: 1,
        softness: 1,
        stepsPerColor: 3
      },
      { status: 500 }
    );
  }
}

