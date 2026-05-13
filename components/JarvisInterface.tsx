"use client";

import { useMemo, useRef, useState } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSpeechRecognition, detectLanguage, speakWithElevenLabs } from "@/utils/speech";

export function JarvisInterface() {
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("At your service, Sir.");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const bars = useMemo(() => Array.from({ length: 24 }), []);

  const startListening = () => {
    setError(null);
    const recognition = createSpeechRecognition();
    if (!recognition) {
      setError("SpeechRecognition API is unavailable in this browser, Sir.");
      return;
    }

    recognition.onstart = () => setIsListening(true);
    recognition.onerror = (event) => {
      setError(`Microphone error: ${event.error}`);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    recognition.onresult = async (event) => {
      const spoken = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();
      setTranscript(spoken);
      if (event.results[event.results.length - 1].isFinal && spoken) {
        await askJarvis(spoken);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const askJarvis = async (message: string) => {
    setIsThinking(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      const data = (await res.json()) as { answer?: string; error?: string };
      if (!res.ok || !data.answer) throw new Error(data.error ?? "Unknown API error.");

      setResponse(data.answer);
      const language = detectLanguage(message);
      await speakWithElevenLabs(data.answer, language);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown issue.");
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <section className="mx-auto flex min-h-[90vh] w-full max-w-5xl flex-col items-center justify-center gap-8 rounded-3xl border border-cyan-500/20 bg-slate-900/40 p-6 shadow-hologram backdrop-blur-xl">
      <h1 className="bg-gradient-to-r from-cyan-200 via-sky-300 to-blue-500 bg-clip-text text-center text-4xl font-semibold text-transparent sm:text-6xl">
        J.A.R.V.I.S.
      </h1>

      <div className="relative flex h-72 w-72 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-500/5">
        <span className="absolute h-72 w-72 rounded-full border border-cyan-400/30 animate-pulseRing" />
        <span className="absolute h-60 w-60 rounded-full border border-sky-300/30 animate-pulseRing [animation-delay:400ms]" />

        <div className="absolute inset-8 flex items-end justify-center gap-1">
          {bars.map((_, i) => (
            <span
              key={i}
              className="h-8 w-1 rounded bg-cyan-300/70"
              style={{
                animation: `equalizer ${0.7 + (i % 5) * 0.2}s ease-in-out infinite`,
                opacity: isListening ? 1 : 0.2
              }}
            />
          ))}
        </div>

        <Button
          size="icon"
          className="relative z-10 h-24 w-24 rounded-full border border-cyan-200/50 bg-cyan-400/20 shadow-[0_0_30px_rgba(34,211,238,0.6)]"
          onClick={isListening ? stopListening : startListening}
        >
          {isListening ? <MicOff className="h-10 w-10 text-cyan-100" /> : <Mic className="h-10 w-10 text-cyan-100" />}
        </Button>
      </div>

      <div className="w-full max-w-3xl space-y-3 rounded-xl border border-cyan-500/20 bg-slate-950/50 p-4">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Live Transcript</p>
        <p className="min-h-7 text-slate-200">{transcript || "Listening for your command, Sir..."}</p>
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Jarvis Response</p>
        <p className="min-h-14 text-sky-100">{response}</p>

        {isThinking && (
          <div className="flex items-center gap-2 text-cyan-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="animate-typing">Processing, Sir...</span>
          </div>
        )}

        {error && <p className="text-sm text-rose-400">{error}</p>}
      </div>
    </section>
  );
}
