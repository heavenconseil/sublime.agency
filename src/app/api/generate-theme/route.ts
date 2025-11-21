import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Remplacer par le nom exact si différent
      messages: [
        {
          role: "system",
          content: `Tu es une IA générative visuelle et poétique. Ton rôle est de créer des concepts d'ambiance visuelle.
          
          Génère une phrase courte (max 8 mots) qui décrit une ambiance visuelle abstraite ou naturelle (ex: "Coucher de soleil sur Mars", "Néon sous la pluie", "Aube glaciaire"). La phrase doit être en Français, très créative et évocative.
          
          Génère une palette de 5 couleurs hexadécimales qui correspondent PARFAITEMENT à cette ambiance.
          
          Choisis des paramètres pour un effet visuel (Simplex Noise) :
             - speed : entre 0.2 (très calme) et 2.0 (très agité)
             - softness : entre 0.0 (net, tranchant) et 1.5 (très flou/vaporeux)
             - stepsPerColor : entre 1 et 5 (complexité du dégradé)`
        },
        {
          role: "user",
          content: "Génère une nouvelle ambiance visuelle unique."
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
                description: "Une phrase courte et poétique en français décrivant l'ambiance."
              },
              colors: {
                type: "array",
                items: {
                  type: "string"
                },
                description: "Une liste de exactement 5 couleurs hexadécimales.",
                minItems: 5,
                maxItems: 5
              },
              speed: {
                type: "number",
                description: "Vitesse de l'animation (0.2 à 2.0)."
              },
              softness: {
                type: "number",
                description: "Douceur du bruit (0.0 à 1.5)."
              },
              stepsPerColor: {
                type: "number",
                description: "Nombre d'étapes par couleur (1 à 5)."
              }
            },
            required: ["phrase", "colors", "speed", "softness", "stepsPerColor"],
            additionalProperties: false
          }
        }
      },
      temperature: 1, // Un peu de créativité
    });

    const content = completion.choices[0].message.content;
    
    if (!content) {
        throw new Error("No content generated");
    }

    const data = JSON.parse(content);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("OpenAI Error:", error);
    
    // Log plus détaillé pour debug
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
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
