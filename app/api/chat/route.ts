import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { JARVIS_SYSTEM_PROMPT } from "@/lib/jarvis-system";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function synthesizeWithElevenLabs(text: string, voiceId: string) {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return undefined;

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": key,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_turbo_v2_5",
      voice_settings: { stability: 0.85, similarity_boost: 0.9, style: 0.35 }
    })
  });
  if (!res.ok) return undefined;

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
}

export async function POST(req: NextRequest) {
  try {
    const { text, language } = (await req.json()) as { text: string; language: "tr" | "en" };
    const completion = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        { role: "system", content: JARVIS_SYSTEM_PROMPT },
        {
          role: "user",
          content: `User language: ${language}. Request: ${text}. Reply accordingly and address user as ${language === "tr" ? "Efendim" : "Sir"}.`
        }
      ]
    });

    const reply = completion.output_text || "At your service, Sir.";
    const voiceId = language === "tr" ? process.env.ELEVENLABS_TR_VOICE_ID : process.env.ELEVENLABS_EN_VOICE_ID;
    const audioBase64 = voiceId ? await synthesizeWithElevenLabs(reply, voiceId) : undefined;

    return NextResponse.json({ reply, audioBase64 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
