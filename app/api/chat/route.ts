import { NextResponse } from "next/server";
import { buildJarvisMessages } from "@/lib/jarvis-system";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { message?: string };
    if (!body.message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Server is missing OPENAI_API_KEY." }, { status: 500 });
    }

    const completion = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini",
        messages: buildJarvisMessages(body.message),
        temperature: 0.7
      })
    });

    if (!completion.ok) {
      const errorText = await completion.text();
      return NextResponse.json({ error: `OpenAI error: ${errorText}` }, { status: completion.status });
    }

    const data = (await completion.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const answer = data.choices?.[0]?.message?.content ?? "Apologies Sir, I had a transient fault.";
    return NextResponse.json({ answer });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown server error." },
      { status: 500 }
    );
  }
}
