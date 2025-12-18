import { describe, it, expect, vi, afterEach } from 'vitest';
import { speechGateway } from '../../ai/speech/speechGateway';
import { STTInferenceEngine } from '../../ai/models/speech-to-text/speech-to-text_inference/stt-inferenceEngine';
import { TTSInferenceEngine } from '../../ai/models/text-to-speech/text-to-speech_inference/tts-inferenceEngine';

function decodeAudio(base64: string) {
  return Buffer.from(base64, 'base64').toString('utf8');
}

describe('SpeechGateway', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('prefers hint transcript and keeps higher confidence', async () => {
    const spy = vi.spyOn(STTInferenceEngine.prototype, 'predict').mockReturnValue('ignored');

    const result = await speechGateway.transcribe({
      hintTranscript: 'Use the operator form',
      language: 'en-GB',
      sessionId: 'session-1',
    });

    expect(result.transcript).toBe('Use the operator form');
    expect(result.confidence).toBeCloseTo(0.92);
    expect(result.language).toBe('en-GB');
    expect(spy).toHaveBeenCalledWith({ audio: undefined, language: 'en-GB', sessionId: 'session-1' });
  });

  it('falls back to model output when no hint transcript exists', async () => {
    vi.spyOn(STTInferenceEngine.prototype, 'predict').mockReturnValue('model generated text');

    const result = await speechGateway.transcribe({
      audio: 'base64-audio',
    });

    expect(result.transcript).toBe('model generated text');
    expect(result.confidence).toBeCloseTo(0.58);
    expect(result.language).toBe('en-US');
  });

  it('returns engine audio when TTS provides base64 output', async () => {
    const mockAudio = Buffer.from('AUDIO:solara').toString('base64');
    const spy = vi
      .spyOn(TTSInferenceEngine.prototype, 'predict')
      .mockReturnValue({ audioBase64: mockAudio });

    const result = await speechGateway.synthesize({
      text: 'Render the summary',
      voice: 'solara',
      language: 'en-GB',
      sessionId: 'session-2',
    });

    expect(result.voice).toBe('solara');
    expect(result.audioBase64).toBe(mockAudio);
    expect(spy).toHaveBeenCalledWith({
      text: 'Render the summary',
      voice: 'solara',
      language: 'en-GB',
      sessionId: 'session-2',
    });
    expect(decodeAudio(result.audioBase64)).toContain('AUDIO:solara');
  });

  it('generates deterministic fallback audio when engine response is empty', async () => {
    vi.spyOn(TTSInferenceEngine.prototype, 'predict').mockReturnValue(undefined);

    const result = await speechGateway.synthesize({ text: 'Voice ready' });

    expect(result.voice).toBe('orion');
    const decoded = decodeAudio(result.audioBase64);
    expect(decoded).toContain('VOICE:orion:Voice ready');
  });
});
