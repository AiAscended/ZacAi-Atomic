import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";

interface ChatInputProps {
  placeholder?: string;
  onSend: (message: string) => void;
  disabled?: boolean;
  onTTS?: () => void;
  ttsEnabled?: boolean;
  voices?: SpeechSynthesisVoice[];
  selectedVoice?: SpeechSynthesisVoice | null;
  setSelectedVoice?: (v: SpeechSynthesisVoice | null) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  placeholder = "Type your message...",
  onSend,
  disabled,
  onTTS,
  ttsEnabled = false,
  voices = [],
  selectedVoice = null,
  setSelectedVoice
}) => {
  const [value, setValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [customVoice, setCustomVoice] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const lastTranscriptRef = useRef("");

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [value]);

  // Speech-to-Text (STT) setup (persistent until toggled off)
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      // Prevent duplicate input
      if (final && final !== lastTranscriptRef.current) {
        setValue((prev) => prev + final);
        lastTranscriptRef.current = final;
      }
      if (interim && interim !== lastTranscriptRef.current) {
        setValue((prev) => prev + interim);
        lastTranscriptRef.current = interim;
      }
    };
    recognition.onend = () => {
      // Do not auto-stop listening; keep persistent until toggled off
    };
    recognitionRef.current = recognition;
    return () => recognition.stop();
  }, []);

  // TTS: speak text
  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    setIsSpeaking(true);
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  const handleSend = () => {
    const message = value.trim();
    if (message) {
      onSend(message);
      setValue("");
      if (textareaRef.current) textareaRef.current.focus();
      // Do not auto-stop mic after send; keep persistent
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input-container flex flex-col gap-1 p-2 border-t bg-background">
      <div className="flex items-end gap-2 w-full">
        <textarea
          ref={textareaRef}
          className="chat-input flex-1 resize-none rounded border p-2 text-base focus:outline-none focus:ring"
          placeholder={placeholder}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={disabled}
          aria-label="Chat message input"
          autoComplete="off"
          autoCorrect="on"
          spellCheck={true}
          inputMode="text"
        />
        <div className="flex flex-col items-end gap-1 ml-2">
          <div className="flex items-center gap-1 mb-1">
            {/* Mic toggle */}
            <button
              type="button"
              className={`p-2 rounded-full transition-colors ${isListening ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 dark:bg-gray-800 hover:bg-blue-50'}`}
              aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
              onClick={() => {
                if (isListening) {
                  recognitionRef.current?.stop();
                  setIsListening(false);
                } else {
                  try {
                    recognitionRef.current?.start();
                    setIsListening(true);
                  } catch (err) {
                    setIsListening(false);
                  }
                }
              }}
              disabled={disabled}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            {/* Speaker toggle */}
            <button
              type="button"
              className={`p-2 rounded-full transition-colors ${ttsEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 dark:bg-gray-800 hover:bg-green-50'}`}
              aria-label={ttsEnabled ? 'Disable voice output' : 'Enable voice output'}
              onClick={onTTS}
              disabled={disabled}
            >
              {ttsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            {/* Enterprise-grade voice picker dropdown */}
            {ttsEnabled && voices && voices.length > 0 && setSelectedVoice && (
              <select
                className="ml-1 px-2 py-1 rounded border text-xs bg-white dark:bg-gray-900"
                value={customVoice || selectedVoice?.voiceURI || ''}
                onChange={e => {
                  setCustomVoice(e.target.value);
                  if (e.target.value === "male-american") {
                    // Try to find a clean male American voice
                    const v = voices.find(v => v.lang === "en-US" && v.name.toLowerCase().includes("mike"))
                      || voices.find(v => v.lang === "en-US" && v.name.toLowerCase().includes("john"))
                      || voices.find(v => v.lang === "en-US" && v.name.toLowerCase().includes("male"))
                      || voices.find(v => v.lang === "en-US" && v.gender === "male");
                    setSelectedVoice(v || null);
                  } else if (e.target.value === "modern-robot") {
                    // Try to find a modern robot voice
                    const v = voices.find(v => v.name.toLowerCase().includes("robot"))
                      || voices.find(v => v.name.toLowerCase().includes("synthetic"))
                      || voices.find(v => v.name.toLowerCase().includes("bot"));
                    setSelectedVoice(v || null);
                  } else {
                    const v = voices.find(v => v.voiceURI === e.target.value) || null;
                    setSelectedVoice(v);
                  }
                }}
                aria-label="Select voice for TTS"
              >
                <option value="">Default</option>
                <option value="male-american">Male American (Presenter)</option>
                <option value="modern-robot">Modern Robot</option>
                {voices.map(v => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} {v.lang}
                  </option>
                ))}
              </select>
            )}
          </div>
          <button
            className="btn btn-primary px-4 py-2 rounded disabled:opacity-50 w-full"
            onClick={handleSend}
            disabled={disabled || !value.trim()}
            aria-label="Send message"
            type="button"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
