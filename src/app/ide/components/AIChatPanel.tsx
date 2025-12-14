"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
  Send,
  Bot,
  User,
  Code2,
  FileCode,
  Bug,
  Sparkles,
  Copy,
  FileDown,
  Check,
  Mic,
  MicOff,
  Volume2,
  RefreshCcw,
  Loader2,
  Square,
} from 'lucide-react';
import { aiAssistant, type IDEContext } from '@/lib/ide/aiAssistant';
import { useEditorStore } from '@/lib/ide/editorStore';
import { useFileSystem } from '@/lib/ide/useFileSystem';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-python';
import type { OrchestratorSettings } from '@/ai/shared/types/adminSettings';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  codeBlocks?: Array<{
    language: string;
    code: string;
    filename?: string;
  }>;
  domains?: string[];
}

const quickActions = [
  { icon: Code2, label: 'Explain Code', action: 'explain' },
  { icon: FileCode, label: 'Generate Code', action: 'generate' },
  { icon: Bug, label: 'Fix Bug', action: 'fix' },
  { icon: Sparkles, label: 'Optimize', action: 'optimize' },
];

const SPEECH_PREFS_KEY = 'zacai.ide.speech-prefs.v1';

type HybridSpeechConfig = {
  enabled: boolean;
  allowUserOverride: boolean;
  speech: OrchestratorSettings['hybridMode']['speech'];
};

type SpeechStatus = 'idle' | 'recording' | 'processing';
type TTSState = 'idle' | 'loading' | 'playing';

interface SpeechPreferences {
  autoSend: boolean;
  autoPlay: boolean;
  selectedVoice: string;
}

const blobToBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result?.split(',')[1];
      if (!base64) {
        reject(new Error('Audio encoding failed'));
        return;
      }
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

export function AIChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your ZacAi coding assistant powered by 23 knowledge domains and 13 AI models. I can help you with:\n\n• Code explanation and documentation\n• Bug fixing and debugging\n• Code generation and refactoring\n• Best practices and optimization\n• Testing and security analysis\n\nSelect code in the editor and use the quick actions, or just ask me anything!',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [speechConfig, setSpeechConfig] = useState<HybridSpeechConfig | null>(null);
  const [speechStatus, setSpeechStatus] = useState<SpeechStatus>('idle');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeechLoading, setIsSpeechLoading] = useState(false);
  const [ttsCache, setTtsCache] = useState<Record<string, string>>({});
  const [ttsState, setTtsState] = useState<Record<string, TTSState>>({});
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [speechPrefs, setSpeechPrefs] = useState<SpeechPreferences>({
    autoSend: false,
    autoPlay: false,
    selectedVoice: '',
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const autoSpokenMessageRef = useRef<string | null>(null);
  const { openFiles, activeFileId, getFileById, updateFileContent } = useEditorStore();
  const { fs, fileTree } = useFileSystem();

  // Initialize AI assistant
  useEffect(() => {
    const initAI = async () => {
      try {
        await aiAssistant.initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize AI:', error);
      }
    };
    initAI();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(SPEECH_PREFS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSpeechPrefs((prev) => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.warn('Failed to load speech prefs', error);
    }
  }, []);

  const persistSpeechPrefs = useCallback((updates: Partial<SpeechPreferences>) => {
    setSpeechPrefs((prev) => {
      const next = { ...prev, ...updates };
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(SPEECH_PREFS_KEY, JSON.stringify(next));
        }
      } catch (error) {
        console.warn('Failed to persist speech prefs', error);
      }
      return next;
    });
  }, []);

  const fetchSpeechConfig = useCallback(async () => {
    setIsSpeechLoading(true);
    try {
      const response = await fetch('/api/hco/config', { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Unable to load hybrid config');
      }
      setSpeechConfig(payload.data);
      setSpeechError(null);
    } catch (error) {
      console.error('Speech config load failed', error);
      setSpeechError(error instanceof Error ? error.message : 'Speech configuration unavailable');
    } finally {
      setIsSpeechLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpeechConfig();
  }, [fetchSpeechConfig]);

  useEffect(() => {
    if (!speechConfig) return;
    setSpeechPrefs((prev) => {
      if (prev.selectedVoice) return prev;
      const fallbackVoice =
        speechConfig.speech?.defaultVoice || speechConfig.speech?.availableVoices?.[0] || '';
      if (!fallbackVoice) return prev;
      const next = { ...prev, selectedVoice: fallbackVoice };
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(SPEECH_PREFS_KEY, JSON.stringify(next));
        }
      } catch (error) {
        console.warn('Failed to cache speech voice', error);
      }
      return next;
    });
  }, [speechConfig]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (ttsAudioRef.current) {
        ttsAudioRef.current.pause();
        ttsAudioRef.current = null;
      }
    };
  }, []);

  // Build IDE context
  const getIDEContext = (): IDEContext => {
    const activeFile = getFileById(activeFileId);
    const projectFiles = fileTree.map((node) => node.path);

    return {
      currentFile: activeFile
        ? {
            path: activeFile.path,
            content: activeFile.content,
            language: activeFile.language,
          }
        : undefined,
      openFiles: openFiles.map((file) => ({
        path: file.path,
        content: file.content,
        language: file.language,
      })),
      projectFiles,
    };
  };

  const handleSend = async (messageOverride?: string) => {
    const prompt = messageOverride ?? input;
    if (!prompt.trim() || isLoading || !isInitialized) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const context = getIDEContext();
      const response = await aiAssistant.sendMessage(prompt, context);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
        codeBlocks: response.codeBlocks,
        domains: response.domains,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceTranscription = async (audioBlob: Blob) => {
    if (!speechConfig?.speech?.enableSTT) return;
    setSpeechStatus('processing');
    setSpeechError(null);

    try {
      const audioBase64 = await blobToBase64(audioBlob);
      const response = await fetch('/api/hco/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'transcribe',
          audio: audioBase64,
          language: speechConfig.speech.preferredLanguages?.[0],
          sessionId: aiAssistant.getSessionId(),
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Unable to transcribe audio');
      }

      const transcript: string | undefined = payload.data?.transcript;
      if (!transcript) {
        throw new Error('Speech engine returned an empty transcript');
      }

      if (speechPrefs.autoSend) {
        await handleSend(transcript);
      } else {
        setInput((prev) => (prev ? `${prev.trim()} ${transcript}`.trim() : transcript));
      }
    } catch (error) {
      console.error('Transcription failed', error);
      setSpeechError(error instanceof Error ? error.message : 'Speech transcription failed');
    } finally {
      setIsRecording(false);
      setSpeechStatus('idle');
    }
  };

  const startRecording = async () => {
    if (!speechConfig?.speech?.enableSTT) return;
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setSpeechError('Browser does not support audio capture');
      return;
    }

    try {
      setSpeechError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];
        if (audioBlob.size > 0) {
          handleVoiceTranscription(audioBlob);
        } else {
          setSpeechStatus('idle');
        }
      };

      recorder.start();
      setIsRecording(true);
      setSpeechStatus('recording');
    } catch (error) {
      console.error('Microphone access denied', error);
      setSpeechError('Microphone permission denied or unavailable');
      setSpeechStatus('idle');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (speechStatus === 'recording') {
      setSpeechStatus('processing');
    }
  };

  const handleStopPlayback = useCallback(() => {
    if (ttsAudioRef.current) {
      ttsAudioRef.current.pause();
      ttsAudioRef.current = null;
    }
    if (playingMessageId) {
      setTtsState((prev) => ({ ...prev, [playingMessageId]: 'idle' }));
    }
    setPlayingMessageId(null);
  }, [playingMessageId]);

  const speechReady = Boolean(speechConfig?.enabled && speechConfig.speech?.enabled);
  const sttEnabled = Boolean(speechReady && speechConfig?.speech?.enableSTT);
  const ttsEnabled = Boolean(speechReady && speechConfig?.speech?.enableTTS);
  const preferredLanguage = speechConfig?.speech?.preferredLanguages?.[0];
  const availableVoices = speechConfig?.speech?.availableVoices || [];

  const handleSpeakMessage = useCallback(
    async (message: Message, autoTriggered = false) => {
      if (!ttsEnabled || !message.content?.trim()) return;
      handleStopPlayback();
      setSpeechError(null);
      setTtsState((prev) => ({ ...prev, [message.id]: 'loading' }));

      try {
        let audioBase64 = ttsCache[message.id];

        if (!audioBase64) {
          const response = await fetch('/api/hco/speech', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'synthesize',
              text: message.content,
              voice: speechPrefs.selectedVoice || speechConfig?.speech?.defaultVoice,
              language: preferredLanguage,
              sessionId: aiAssistant.getSessionId(),
            }),
          });

          const payload = await response.json();
          if (!response.ok || !payload.success) {
            throw new Error(payload.error || 'Unable to synthesize audio');
          }

          audioBase64 = payload.data?.audioBase64;
          if (!audioBase64) {
            throw new Error('Speech service returned empty audio');
          }

          setTtsCache((prev) => ({ ...prev, [message.id]: audioBase64 }));
        }

        const audio = new Audio(`data:audio/webm;base64,${audioBase64}`);
        ttsAudioRef.current = audio;
        setPlayingMessageId(message.id);
        setTtsState((prev) => ({ ...prev, [message.id]: 'playing' }));

        audio.onended = () => {
          setPlayingMessageId((current) => (current === message.id ? null : current));
          setTtsState((prev) => ({ ...prev, [message.id]: 'idle' }));
        };

        await audio.play();
      } catch (error) {
        console.error('Speech synthesis failed', error);
        if (!autoTriggered) {
          setSpeechError(error instanceof Error ? error.message : 'Unable to play audio response');
        }
        setTtsState((prev) => ({ ...prev, [message.id]: 'idle' }));
      }
    },
    [handleStopPlayback, preferredLanguage, speechConfig, speechPrefs.selectedVoice, ttsCache, ttsEnabled]
  );

  useEffect(() => {
    if (!speechPrefs.autoPlay || !ttsEnabled) return;
    const latestAssistant = [...messages].reverse().find((message) => message.role === 'assistant');
    if (!latestAssistant) return;
    if (autoSpokenMessageRef.current === latestAssistant.id) return;

    autoSpokenMessageRef.current = latestAssistant.id;
    handleSpeakMessage(latestAssistant, true);
  }, [messages, speechPrefs.autoPlay, ttsEnabled, handleSpeakMessage]);

  const handleQuickAction = async (action: string) => {
    const activeFile = getFileById(activeFileId);
    
    if (!activeFile) {
      setInput(`${action} code for: `);
      return;
    }

    setIsLoading(true);

    try {
      let response;
      const code = activeFile.content;
      const language = activeFile.language;

      switch (action) {
        case 'explain':
          response = await aiAssistant.explainCode(code, language);
          break;
        case 'fix':
          response = await aiAssistant.fixCode(code, language);
          break;
        case 'optimize':
          response = await aiAssistant.optimizeCode(code, language);
          break;
        case 'generate':
          setInput('Generate code for: ');
          setIsLoading(false);
          return;
        default:
          setIsLoading(false);
          return;
      }

      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
        codeBlocks: response.codeBlocks,
        domains: response.domains,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Quick action error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleInsertCode = async (code: string, filename?: string) => {
    if (!fs) return;

    if (filename) {
      // Create new file
      try {
        const path = `/${filename}`;
        await fs.write(path, code);
        // The file system hook will refresh the tree
      } catch (error) {
        console.error('Failed to create file:', error);
      }
    } else if (activeFileId) {
      // Insert into active file
      const activeFile = getFileById(activeFileId);
      if (activeFile) {
        updateFileContent(activeFileId, code);
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-3 border-b">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <span className="font-semibold">AI Assistant</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-2 border-b">
        <div className="grid grid-cols-2 gap-1">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="ghost"
              size="sm"
              className="justify-start text-xs h-8"
              onClick={() => handleQuickAction(action.action)}
            >
              <action.icon className="h-3 w-3 mr-1" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              <div
                className={`flex gap-2 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {message.domains && message.domains.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {message.domains.slice(0, 3).map((domain) => (
                        <span
                          key={domain}
                          className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary"
                        >
                          {domain.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>

                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>

              {message.role === 'assistant' && ttsEnabled && (
                <div className="ml-10 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() =>
                      playingMessageId === message.id
                        ? handleStopPlayback()
                        : handleSpeakMessage(message)
                    }
                    disabled={ttsState[message.id] === 'loading'}
                  >
                    {ttsState[message.id] === 'loading' ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : playingMessageId === message.id ? (
                      <Square className="h-3 w-3 mr-1" />
                    ) : (
                      <Volume2 className="h-3 w-3 mr-1" />
                    )}
                    {playingMessageId === message.id ? 'Stop audio' : 'Listen'}
                  </Button>
                </div>
              )}

              {/* Code blocks with actions */}
              {message.codeBlocks && message.codeBlocks.length > 0 && (
                <div className="ml-10 mt-2 space-y-2">
                  {message.codeBlocks.map((block, idx) => {
                    const blockId = `${message.id}-${idx}`;
                    const highlightedCode = Prism.highlight(
                      block.code,
                      Prism.languages[block.language] || Prism.languages.plaintext,
                      block.language
                    );

                    return (
                      <div
                        key={idx}
                        className="rounded-lg overflow-hidden border bg-background"
                      >
                        <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-muted-foreground">
                              {block.language}
                            </span>
                            {block.filename && (
                              <span className="text-xs text-muted-foreground">
                                {block.filename}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => handleCopyCode(block.code, blockId)}
                            >
                              {copiedCode === blockId ? (
                                <>
                                  <Check className="h-3 w-3 mr-1" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3 mr-1" />
                                  Copy
                                </>
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => handleInsertCode(block.code, block.filename)}
                            >
                              <FileDown className="h-3 w-3 mr-1" />
                              {block.filename ? 'Create File' : 'Insert'}
                            </Button>
                          </div>
                        </div>
                        <div className="p-3 overflow-x-auto">
                          <pre className="text-xs">
                            <code
                              dangerouslySetInnerHTML={{ __html: highlightedCode }}
                            />
                          </pre>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary animate-pulse" />
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t space-y-2">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask me anything about your code..."
              className="min-h-[60px] max-h-[140px] resize-none"
              disabled={isLoading || !isInitialized}
            />
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant={isRecording ? 'destructive' : 'outline'}
                size="icon"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!sttEnabled || isSpeechLoading || !isInitialized || speechStatus === 'processing'}
                className="flex-shrink-0"
                title={isRecording ? 'Stop recording' : 'Capture voice input'}
              >
                {speechStatus === 'processing' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isRecording ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading || !isInitialized}
                size="icon"
                className="flex-shrink-0"
                title="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              {speechReady ? (
                <>
                  <Bot className="h-3 w-3 text-primary" />
                  <span>
                    {speechStatus === 'recording'
                      ? 'Recording voice input...'
                      : speechStatus === 'processing'
                      ? 'Transcribing voice input...'
                      : 'Hybrid speech interface ready'}
                  </span>
                </>
              ) : (
                <>
                  <MicOff className="h-3 w-3" />
                  <span>Speech controls disabled by admin</span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1">
                <Switch
                  id="auto-send-voice"
                  checked={speechPrefs.autoSend}
                  onCheckedChange={(checked) => persistSpeechPrefs({ autoSend: checked })}
                  disabled={!sttEnabled}
                />
                <Label htmlFor="auto-send-voice" className="text-xs">
                  Auto-send voice
                </Label>
              </div>
              <div className="flex items-center gap-1">
                <Switch
                  id="auto-play-voice"
                  checked={speechPrefs.autoPlay}
                  onCheckedChange={(checked) => persistSpeechPrefs({ autoPlay: checked })}
                  disabled={!ttsEnabled}
                />
                <Label htmlFor="auto-play-voice" className="text-xs">
                  Auto-play replies
                </Label>
              </div>
              <Select
                value={speechPrefs.selectedVoice}
                onValueChange={(voice) => persistSpeechPrefs({ selectedVoice: voice })}
                disabled={!ttsEnabled || availableVoices.length === 0}
              >
                <SelectTrigger className="w-[140px] h-8">
                  <SelectValue placeholder="Voice" />
                </SelectTrigger>
                <SelectContent>
                  {availableVoices.map((voice) => (
                    <SelectItem key={voice} value={voice}>
                      {voice}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={fetchSpeechConfig}
                disabled={isSpeechLoading}
                className="h-8"
              >
                <RefreshCcw className="h-3 w-3 mr-1" />
                Sync speech
              </Button>
            </div>
          </div>

          {speechError && (
            <p className="text-xs text-destructive">{speechError}</p>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {isInitialized ? '✅ Phase 5 Complete: AI-powered coding assistant active' : 'Initializing AI assistant...'}
        </p>
      </div>
    </div>
  );
}
