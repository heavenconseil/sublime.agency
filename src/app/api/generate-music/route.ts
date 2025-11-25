import { NextResponse } from "next/server";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

export const maxDuration = 60; // Timeout plus long pour la génération

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ElevenLabs API key not configured" },
        { status: 500 }
      );
    }

    const client = new ElevenLabsClient({
      apiKey,
    });

    console.log("Generating music for prompt:", prompt);
    const startTime = Date.now();

    // Générer la musique (30 secondes = 30000ms)
    const response = await client.music.compose({
      prompt,
      musicLengthMs: 30000,
      forceInstrumental: true,
    });

    const endTime = Date.now();
    console.log(`Music generated in ${(endTime - startTime) / 1000}s`);

    // response est un ReadableStream, on doit le convertir en audio
    // Pour l'instant, retournons l'URL ou les données audio
    
    // Collecter les chunks du stream
    const chunks: Uint8Array[] = [];
    const reader = response.getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    // Combiner les chunks en un seul buffer
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const audioBuffer = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      audioBuffer.set(chunk, offset);
      offset += chunk.length;
    }

    // Retourner l'audio en base64
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    return NextResponse.json({
      success: true,
      audio: base64Audio,
      duration: 30,
      generationTime: (endTime - startTime) / 1000,
    });

  } catch (error) {
    console.error("Error generating music:", error);
    return NextResponse.json(
      { error: "Failed to generate music", details: String(error) },
      { status: 500 }
    );
  }
}
