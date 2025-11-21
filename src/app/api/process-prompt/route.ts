import { NextResponse } from 'next/server';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

type PromptType = 'text' | 'video' | 'image' | 'audio';

// Détecter le type de demande
function detectPromptType(prompt: string): PromptType {
  const p = prompt.toLowerCase();
  
  if (p.includes('video') || p.includes('film') || p.includes('showreel') || p.includes('movie')) {
    return 'video';
  }
  
  if (p.includes('image') || p.includes('photo') || p.includes('visuel') || p.includes('picture') || p.includes('drawing')) {
    return 'image';
  }

  if (p.includes('son') || p.includes('musique') || p.includes('audio') || p.includes('sound') || p.includes('music') || p.includes('track')) {
    return 'audio';
  }

  return 'text';
}

export async function POST(request: Request) {
  try {
    const { prompt, language, currentAudio } = await request.json();

    // Simulation de latence pour l'effet "réflexion IA"
    await new Promise(resolve => setTimeout(resolve, 1000));

    const detectedType = detectPromptType(prompt);

    // 1. Cas AUDIO
    if (detectedType === 'audio') {
        // Liste complète des sons disponibles
        const availableSounds = ['/sounds/01.mp3', '/sounds/02.mp3', '/sounds/03.mp3'];
        
        // Filtrer pour exclure le son actuel
        // currentAudio peut être null, undefined ou une chaine vide
        const filteredSounds = currentAudio 
            ? availableSounds.filter(s => !currentAudio.endsWith(s)) 
            : availableSounds;

        // Sécurité : si jamais la liste est vide (ne devrait pas arriver), on reprend tout
        const soundsToPickFrom = filteredSounds.length > 0 ? filteredSounds : availableSounds;

        const randomSound = soundsToPickFrom[Math.floor(Math.random() * soundsToPickFrom.length)];
        
        return NextResponse.json({
            type: 'audio',
            content: randomSound,
            caption: language === 'fr' 
                ? "Voici une nouvelle ambiance sonore." 
                : "Here is a new soundscape."
        });
    }

    // 2. Cas VIDÉO
    if (detectedType === 'video') {
      return NextResponse.json({
        type: 'video',
        // Utilisation de l'embed Vimeo
        content: 'https://player.vimeo.com/video/1069614602?h=0&autoplay=1&loop=1&title=0&byline=0&portrait=0'
      });
    }

    // 3. Cas IMAGE
    if (detectedType === 'image') {
        return NextResponse.json({
            type: 'image',
            content: '/ai-pattern.svg',
            caption: language === 'fr' 
                ? "Un concept visuel généré pour vous." 
                : "A visual concept generated for you."
        });
    }

    // 4. Cas TEXTE (Défaut) - Streaming avec Vercel AI SDK
    const systemPrompt = language === 'fr' 
        ? "Tu es l'IA de Sublime Agency, un studio créatif primé spécialisé en IA et expériences digitales. Réponds de manière créative, concise et engageante. Ton ton est professionnel mais accessible."
        : "You are Sublime Agency's AI, an award-winning creative studio specialized in AI and digital experiences. Respond creatively, concisely and engagingly. Your tone is professional but accessible.";

    const result = streamText({
        model: openai('gpt-4o'),
        system: systemPrompt,
        prompt: prompt,
        temperature: 0.7,
        maxRetries: 3,
    });

    // Utiliser toTextStreamResponse (méthode officielle pour Route Handlers Next.js)
    return result.toTextStreamResponse();

  } catch (error) {
    return NextResponse.json({ error: 'Failed to process prompt' }, { status: 500 });
  }
}
