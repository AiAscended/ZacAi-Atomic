/**
 * Fallback speech gateway implementation to keep APIs online.
 * Replace with real STT/TTS integration when available.
 */

interface TranscribeInput {
  audio?: unknown;
  hintTranscript?: string;
  language?: string;
  sessionId?: string;
}

interface SynthesizeInput {
  text: string;
  voice?: string;
  language?: string;
  sessionId?: string;
}

export const speechGateway = {
  async transcribe(input: TranscribeInput) {
    return {
      transcript: input.hintTranscript || "",
      language: input.language || "en-US",
      confidence: 0.5,
      sessionId: input.sessionId,
      fallback: true,
    };
  },

  async synthesize(input: SynthesizeInput) {
    return {
      audioUrl: "data:audio/wav;base64,",
      voice: input.voice || "orion",
      language: input.language || "en-US",
      sessionId: input.sessionId,
      fallback: true,
    };
  },
};
