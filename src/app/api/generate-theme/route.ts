import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(request: Request) {
  try {
    // Récupérer le paramètre de langue
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'fr';
    
    const languageInstructions: Record<string, string> = {
      fr: 'La phrase doit être en Français.',
      en: 'The phrase must be in English.',
      es: 'La frase debe estar en Español.',
      de: 'Der Satz muss auf Deutsch sein.',
      ko: '문구는 한국어로 작성되어야 합니다.',
      zh: '短语必须用中文书写。',
      ar: 'يجب أن تكون العبارة باللغة العربية.'
    };
    
    const languageInstruction = languageInstructions[lang] || languageInstructions['fr'];
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Remplacer par le nom exact si différent
      messages: [
        {
          role: "system",
          content: `Tu es une IA générative visuelle et poétique. Ton rôle est de créer des concepts d'ambiance visuelle uniques et évocateurs.

          Génère une phrase courte (max 8 mots) qui décrit une ambiance visuelle. ${languageInstruction}
          
          CATÉGORIES D'INSPIRATION (varie entre elles) :
          
          🌌 COSMIQUE & SCI-FI :
          - "Coucher de soleil sur Mars"
          - "Nébuleuse en collision"
          - "Station spatiale abandonnée"
          - "Aurore boréale sur Titan"
          - "Trou noir en éveil"
          - "Signal extraterrestre capté"
          
          🌊 NATURE & ÉLÉMENTS :
          - "Aube glaciaire silencieuse"
          - "Forêt de bambou sous la brume"
          - "Orage électrique sur l'océan"
          - "Désert de sel au crépuscule"
          - "Cascade figée dans le temps"
          - "Volcan sous-marin en éruption"
          
          🏙️ URBAIN & CYBERPUNK :
          - "Néon sous la pluie"
          - "Tokyo 3h du matin"
          - "Métro fantôme dernier wagon"
          - "Gratte-ciel dans le brouillard"
          - "Ruelle holographique déserte"
          - "Enseigne cassée qui clignote"
          
          🎨 ABSTRAIT & ÉMOTIONNEL :
          - "Mélancolie liquide"
          - "Explosion de joie pure"
          - "Silence avant la tempête"
          - "Rêve lucide fragmenté"
          - "Nostalgie d'un futur perdu"
          - "Vertige chromatique"
          
          🏛️ HISTORIQUE & MYTHOLOGIQUE :
          - "Temple englouti millénaire"
          - "Pyramide sous les étoiles"
          - "Jardin suspendu de Babylone"
          - "Navire viking dans la brume"
          - "Ruines romaines au clair de lune"
          
          🔬 MICRO & MACRO :
          - "Synapse en activation"
          - "Cristaux en formation"
          - "ADN en spirale lumineuse"
          - "Pollen en suspension dorée"
          - "Cellule en division"
          
          🎭 CINÉMATOGRAPHIQUE :
          - "Générique de fin mélancolique"
          - "Poursuite sous néons roses"
          - "Scène de bal abandonnée"
          - "Cabaret des années folles"
          - "Western au soleil couchant"
          
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
