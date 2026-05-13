"use client";

export type SupportedLanguage = "tr" | "en";

export function detectLanguage(input: string): SupportedLanguage {
  const trChars = /[çğıöşüÇĞİÖŞÜ]/;
  const trWords = /(merhaba|nasılsın|hava|saat|teşekkür|efendim)/i;
  return trChars.test(input) || trWords.test(input) ? "tr" : "en";
}

export function createSpeechRecognition(): SpeechRecognition | null {
  if (typeof window === "undefined") return null;
  const SpeechRecognitionImpl =
    window.SpeechRecognition || (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
  if (!SpeechRecognitionImpl) return null;

  const recognition = new SpeechRecognitionImpl();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  recognition.lang = "en-US";
  return recognition;
}

export async function speakWithElevenLabs(text: string, language: SupportedLanguage) {
  const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
  const voiceId =
    language === "tr"
      ? process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_TR ?? "EXAVITQu4vr4xnSDxMaL"
      : process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_EN ?? "TxGEqnHWrfWFTfGW9XjX";

  if (!apiKey) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "tr" ? "tr-TR" : "en-US";
    speechSynthesis.speak(utterance);
    return;
  }

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.85,
        similarity_boost: 0.85,
        style: 0.45,
        use_speaker_boost: true
      }
    })
  });

  if (!response.ok) throw new Error("ElevenLabs TTS failed.");

  const audioBuffer = await response.arrayBuffer();
  const audioBlob = new Blob([audioBuffer], { type: "audio/mpeg" });
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  await audio.play();
}
