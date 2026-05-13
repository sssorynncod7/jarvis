"use client";

type SpeechRecognitionType = typeof window.SpeechRecognition;

interface ExtendedWindow extends Window {
  webkitSpeechRecognition?: SpeechRecognitionType;
  SpeechRecognition?: SpeechRecognitionType;
}

export function createSpeechRecognition(lang = "en-US") {
  if (typeof window === "undefined") return null;
  const w = window as ExtendedWindow;
  const SpeechCtor = w.SpeechRecognition || w.webkitSpeechRecognition;
  if (!SpeechCtor) return null;

  const recognition = new SpeechCtor();
  recognition.lang = lang;
  recognition.interimResults = true;
  recognition.continuous = false;
  return recognition;
}

export function detectLanguage(text: string): "tr" | "en" {
  const trChars = /[çğıöşüİ]/i;
  const trWords = /(ve|bir|için|lütfen|nasıl|bugün|yarın|hava)/i;
  return trChars.test(text) || trWords.test(text) ? "tr" : "en";
}

export function toElevenLabsVoiceId(language: "tr" | "en") {
  // Example defaults; can be replaced with dashboard voice IDs.
  return language === "tr"
    ? process.env.NEXT_PUBLIC_ELEVENLABS_TR_VOICE_ID || "EXAVITQu4vr4xnSDxMaL"
    : process.env.NEXT_PUBLIC_ELEVENLABS_EN_VOICE_ID || "TxGEqnHWrfWFTfGW9XjX";
}
