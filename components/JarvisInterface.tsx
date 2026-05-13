"use client";

import { useMemo, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { buildUserContext, JarvisMode } from "@/lib/jarvis-system";
import { createSpeechRecognition, detectLanguage } from "@/utils/speech";

export function JarvisInterface() {
  const [mode, setMode] = useState<JarvisMode>("idle");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("Systems online, Sir. Awaiting your command.");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const bars = useMemo(() => Array.from({ length: 20 }, (_, i) => i), []);

  const startListening = () => {
    setError(null);
    const recognition = createSpeechRecognition("tr-TR");
    if (!recognition) {
      setError("SpeechRecognition API is unavailable in this browser.");
      return;
    }
    recognitionRef.current = recognition;
    setMode("listening");
    setTranscript("");

    recognition.onresult = (event) => {
      const current = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ");
      setTranscript(current);
    };

    recognition.onerror = () => {
      setError("Microphone permission denied or recognition error occurred.");
      setMode("idle");
    };

    recognition.onend = async () => {
      if (!transcript.trim()) {
        setMode("idle");
        return;
      }
      await sendToJarvis(transcript);
    };

    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setMode("idle");
  };

  const sendToJarvis = async (text: string) => {
    try {
      setMode("processing");
      const language = detectLanguage(text);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          language,
          context: buildUserContext(language)
        })
      });

      if (!res.ok) throw new Error("API request failed");

      const data = (await res.json()) as { reply: string; audioBase64?: string };
      setResponse(data.reply);
      setMode("speaking");

      if (data.audioBase64) {
        const audio = new Audio(`data:audio/mpeg;base64,${data.audioBase64}`);
        await audio.play();
      }
      setMode("idle");
    } catch {
      setError("Command processing failed. Check API keys and network.");
      setMode("idle");
    }
  };

  return (
    <section className="mx-auto max-w-5xl rounded-3xl holo-panel p-6 md:p-10">
      <header className="mb-8 text-center">
        <p className="text-xs tracking-[0.45em] text-cyan-300 animate-flicker">J.A.R.V.I.S. PROTOCOL</p>
        <h1 className="mt-3 text-3xl md:text-5xl font-semibold">Mark XV Voice Console</h1>
      </header>

      <div className="grid gap-8 md:grid-cols-[1fr_280px] items-center">
        <div className="rounded-2xl border border-cyan-400/30 p-5 min-h-44 bg-black/20">
          <p className="text-cyan-200/80 text-sm mb-2">Live Transcript</p>
          <p className="text-lg">{transcript || "Awaiting vocal input..."}</p>
          <p className="mt-5 text-cyan-200/80 text-sm">JARVIS Response</p>
          <p className="mt-1 text-xl font-medium">{response}</p>
          {error && <p className="mt-3 text-rose-400 text-sm">{error}</p>}
        </div>

        <div className="flex flex-col items-center gap-5">
          <button
            onClick={mode === "listening" ? stopListening : startListening}
            className="relative h-44 w-44 rounded-full border border-cyan-300/50 bg-cyan-400/10 shadow-[0_0_40px_rgba(0,198,255,.35)]"
          >
            <span className="absolute inset-0 rounded-full animate-pulseRing border border-cyan-300/40" />
            <span className="absolute inset-5 rounded-full border border-cyan-200/40" />
            <span className="relative z-10 flex h-full items-center justify-center text-cyan-100">
              {mode === "listening" ? <MicOff size={48} /> : <Mic size={48} />}
            </span>
          </button>
          <p className="text-cyan-200 text-sm uppercase tracking-[0.25em]">{mode}</p>
        </div>
      </div>

      <div className="mt-8 flex items-end gap-1 h-16">
        {bars.map((bar) => (
          <span
            key={bar}
            className="w-1.5 bg-cyan-300/70 rounded-full animate-equalize"
            style={{ animationDelay: `${bar * 0.06}s`, height: `${12 + (bar % 8) * 5}px` }}
          />
        ))}
      </div>
    </section>
  );
}
