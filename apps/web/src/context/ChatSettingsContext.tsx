import React, { createContext, useContext, useState, useEffect } from "react";

interface ChatSettingsContextType {
  ttsEnabled: boolean;
  setTtsEnabled: (v: boolean) => void;
  sttEnabled: boolean;
  setSttEnabled: (v: boolean) => void;
  selectedVoice: SpeechSynthesisVoice | null;
  setSelectedVoice: (v: SpeechSynthesisVoice | null) => void;
  voices: SpeechSynthesisVoice[];
}

const ChatSettingsContext = createContext<ChatSettingsContextType | undefined>(undefined);

export const ChatSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ttsEnabled, setTtsEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ttsEnabled") === "true";
    }
    return false;
  });
  const [sttEnabled, setSttEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sttEnabled") === "true";
    }
    return false;
  });
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    localStorage.setItem("ttsEnabled", String(ttsEnabled));
  }, [ttsEnabled]);
  useEffect(() => {
    localStorage.setItem("sttEnabled", String(sttEnabled));
  }, [sttEnabled]);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const populateVoices = () => {
        const v = window.speechSynthesis.getVoices();
        setVoices(v);
        if (!selectedVoice && v.length > 0) setSelectedVoice(v[0]);
      };
      populateVoices();
      window.speechSynthesis.onvoiceschanged = populateVoices;
    }
  }, [selectedVoice]);

  return (
    <ChatSettingsContext.Provider value={{ ttsEnabled, setTtsEnabled, sttEnabled, setSttEnabled, selectedVoice, setSelectedVoice, voices }}>
      {children}
    </ChatSettingsContext.Provider>
  );
};

export const useChatSettings = () => {
  const ctx = useContext(ChatSettingsContext);
  if (!ctx) throw new Error("useChatSettings must be used within ChatSettingsProvider");
  return ctx;
};
