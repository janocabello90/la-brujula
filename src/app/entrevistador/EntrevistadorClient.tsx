"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/client";

// Web Speech API types
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

interface Props {
  userId: string;
  apiKey: string;
  frases: Array<{ id: string; frase: string; contexto: string; pregunta: string; created_at: string }>;
  sessions: Array<{ id: string; estilo: string; created_at: string }>;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const ESTILOS = [
  {
    id: "profundo",
    name: "Profundo",
    icon: "🎙️",
    desc: "Preguntas que van al hueso. Para pensar de verdad.",
  },
  {
    id: "inspirador",
    name: "Inspirador",
    icon: "✨",
    desc: "Te hace ver lo mejor de ti. Ideal para encontrar tu relato.",
  },
  {
    id: "divertido",
    name: "Divertido",
    icon: "😄",
    desc: "Como un late night. Saca lo auténtico con humor.",
  },
  {
    id: "cotilla",
    name: "Cotilla",
    icon: "👀",
    desc: "Quiere todos los detalles. No te deja escapar ni una.",
  },
];

export default function EntrevistadorClient({ userId, apiKey, frases: initialFrases, sessions }: Props) {
  const [activeTab, setActiveTab] = useState<"entrevista" | "frases">("entrevista");
  const [selectedEstilo, setSelectedEstilo] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [frases, setFrases] = useState(initialFrases);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const wantsListeningRef = useRef(false);
  const processedResultsRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Check speech recognition support
  useEffect(() => {
    const supported = typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
    setSpeechSupported(supported);
  }, []);

  const startListening = useCallback(() => {
    if (!speechSupported || isListening) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "es-ES";

    processedResultsRef.current = 0;
    wantsListeningRef.current = true;

    recognition.onstart = () => {
      setIsListening(true);
      setInterimTranscript("");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let newFinalText = "";
      let interimText = "";

      // Only process results we haven't seen yet
      for (let i = processedResultsRef.current; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          newFinalText += result[0].transcript;
          processedResultsRef.current = i + 1;
        } else {
          interimText += result[0].transcript;
        }
      }

      if (newFinalText) {
        setInputValue((prev) => {
          const separator = prev && !prev.endsWith(" ") ? " " : "";
          return prev + separator + newFinalText;
        });
      }
      setInterimTranscript(interimText);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      // Don't stop on transient errors like no-speech or network
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        wantsListeningRef.current = false;
        setIsListening(false);
        setInterimTranscript("");
      }
    };

    recognition.onend = () => {
      // Auto-restart if user hasn't explicitly stopped
      // This handles Chrome's tendency to stop after silence
      if (wantsListeningRef.current && recognitionRef.current) {
        try {
          processedResultsRef.current = 0;
          recognitionRef.current.start();
          return;
        } catch (e) {
          // If restart fails, fall through to stop
        }
      }
      setIsListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [speechSupported, isListening]);

  const stopListening = useCallback(() => {
    wantsListeningRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript("");
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Cleanup on unmount
  // Auto-resize textarea when voice dictation adds text
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + "px";
    }
  }, [inputValue]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      wantsListeningRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const startInterview = async () => {
    if (!selectedEstilo || !apiKey) return;

    setLoading(true);
    setMessages([]);

    try {
      const res = await fetch("/api/entrevistador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          messages: [{ role: "user", content: "Hola, estoy listo para la entrevista." }],
          estilo: selectedEstilo,
          sessionId: null,
        }),
      });

      if (!res.ok) {
        throw new Error("Error al iniciar la entrevista");
      }

      const data = await res.json();
      setCurrentSessionId(data.sessionId);
      setMessages([{ role: "assistant", content: data.response }]);
      setHasStarted(true);

      // Update local frases state (API already saved them to DB)
      if (data.frases && data.frases.length > 0) {
        addFrasesToLocal(data.frases);
      }
    } catch (err: any) {
      console.error("Error starting interview:", err);
      setMessages([{ role: "assistant", content: "Hubo un error al iniciar la entrevista. Intenta de nuevo." }]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || loading || !selectedEstilo || !currentSessionId) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/entrevistador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          messages: newMessages,
          estilo: selectedEstilo,
          sessionId: currentSessionId,
        }),
      });

      if (!res.ok) {
        throw new Error("Error al enviar el mensaje");
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);

      // Update local frases state (API already saved them to DB)
      if (data.frases && data.frases.length > 0) {
        addFrasesToLocal(data.frases);
      }
    } catch (err: any) {
      console.error("Error sending message:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Hubo un error. Intenta de nuevo." },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  // Add frases to local state (DB save already handled by API route)
  const addFrasesToLocal = (
    newFrases: Array<{ frase: string; pregunta?: string; contexto?: string }>
  ) => {
    for (const frase of newFrases) {
      const localFrase = {
        id: crypto.randomUUID(),
        frase: frase.frase,
        contexto: frase.contexto || selectedEstilo || "",
        pregunta: frase.pregunta || "",
        created_at: new Date().toISOString(),
      };
      setFrases((prev) => [localFrase, ...prev]);
    }
    if (newFrases.length > 0) {
      showToast(`💎 ${newFrases.length === 1 ? "Frase guardada" : newFrases.length + " frases guardadas"} en tu repositorio`);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Error copying:", err);
    }
  };

  const saveToIdeas = async (frase: string) => {
    const supabase = createClient();
    try {
      await supabase.from("ideas").insert({
        user_id: userId,
        text: frase,
        source: "entrevistador",
      });
      showToast("✓ Frase guardada en Ideas");
    } catch (err) {
      console.error("Error saving to ideas:", err);
      showToast("Error al guardar en Ideas");
    }
  };

  const groupFrasesByDate = (items: typeof frases) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const groups: {
      [key: string]: typeof items;
    } = {
      "Hoy": [],
      "Ayer": [],
      "Esta semana": [],
      "Más antiguo": [],
    };

    items.forEach((item) => {
      const itemDate = new Date(item.created_at);
      const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

      if (itemDateOnly.getTime() === todayOnly.getTime()) {
        groups["Hoy"].push(item);
      } else if (itemDateOnly.getTime() === yesterdayOnly.getTime()) {
        groups["Ayer"].push(item);
      } else if (itemDate > weekAgo) {
        groups["Esta semana"].push(item);
      } else {
        groups["Más antiguo"].push(item);
      }
    });

    return groups;
  };

  const stripHighlightTags = (text: string) => {
    return text.replace(/\[FRASE_DESTACADA\]/g, "").replace(/\[\/FRASE_DESTACADA\]/g, "");
  };

  const highlightPhrases = (text: string) => {
    const parts: (string | JSX.Element)[] = [];
    const regex = /\[FRASE_DESTACADA\](.*?)\[\/FRASE_DESTACADA\]/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(
        <span key={match.index} className="bg-yellow-100 border-b-2 border-yellow-400 px-1">
          {match[1]}
        </span>
      );
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  if (!apiKey) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="font-headline text-3xl text-on-surface mb-1">El Entrevistador</h1>
            <p className="text-on-surface-variant text-sm">Tu podcast privado. Practica tu relato, descubre tus mejores frases.</p>
          </div>

          <div className="surface-card signature-shadow rounded-2xl p-6 text-center">
            <p className="text-on-surface mb-4">
              Para usar El Entrevistador necesitas una API Key de Anthropic. Configúrala en Ajustes.
            </p>
            <Link href="/settings" className="inline-block gradient-denim text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">
              Ir a Ajustes
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="font-headline text-3xl text-on-surface mb-1">El Entrevistador</h1>
          <p className="text-on-surface-variant text-sm">Tu podcast privado. Practica tu relato, descubre tus mejores frases.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mb-6 border-b border-outline">
          <button
            onClick={() => setActiveTab("entrevista")}
            className={`pb-3 font-medium text-sm transition-colors ${
              activeTab === "entrevista"
                ? "border-b-2 border-primary text-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Entrevista
          </button>
          <button
            onClick={() => setActiveTab("frases")}
            className={`pb-3 font-medium text-sm transition-colors ${
              activeTab === "frases"
                ? "border-b-2 border-primary text-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Mis Frases
          </button>
        </div>

        {/* Tab 1: Entrevista */}
        {activeTab === "entrevista" && (
          <div>
            {!hasStarted ? (
              <div>
                <h3 className="text-sm font-semibold text-on-surface mb-4">Elige tu estilo de entrevista</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {ESTILOS.map((estilo) => (
                    <div
                      key={estilo.id}
                      onClick={() => setSelectedEstilo(estilo.id)}
                      className={`cursor-pointer p-4 rounded-xl transition-all ${
                        selectedEstilo === estilo.id
                          ? "surface-card signature-shadow ring-2 ring-primary/20"
                          : "surface-low hover:surface-container-low"
                      }`}
                    >
                      <div className="text-2xl mb-2">{estilo.icon}</div>
                      <h4 className="font-semibold text-on-surface mb-1">{estilo.name}</h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed">{estilo.desc}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={startInterview}
                  disabled={!selectedEstilo || loading}
                  className="w-full gradient-denim text-white font-semibold py-3.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  🎙️ Empezar entrevista
                </button>
              </div>
            ) : (
              <div className="flex flex-col h-[calc(100vh-24rem)]">
                {/* Messages container */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs sm:max-w-md px-4 py-3 rounded-2xl ${
                          msg.role === "user"
                            ? "gradient-denim text-white"
                            : "surface-low text-on-surface"
                        }`}
                      >
                        {msg.role === "assistant" ? (
                          <div className="text-sm leading-relaxed">
                            {highlightPhrases(stripHighlightTags(msg.content))}
                          </div>
                        ) : (
                          <p className="text-sm">{msg.content}</p>
                        )}
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="flex justify-start">
                      <div className="surface-low rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="animate-pulse text-2xl">🎙️</div>
                          <p className="text-sm text-on-surface-variant">El Entrevistador está escuchando...</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Interim transcript indicator */}
                {isListening && interimTranscript && (
                  <div className="px-3 py-1.5 surface-low rounded-lg mb-2 border border-primary/20">
                    <p className="text-xs text-primary italic">{interimTranscript}...</p>
                  </div>
                )}

                {/* Input with voice */}
                <div className="flex gap-2">
                  {speechSupported && (
                    <button
                      onClick={toggleListening}
                      disabled={loading}
                      className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                        isListening
                          ? "bg-error text-white animate-pulse shadow-lg shadow-error/30"
                          : "surface-container-low text-on-surface hover:surface-container"
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                      title={isListening ? "Parar dictado" : "Dictar con voz"}
                    >
                      {isListening ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                          <line x1="12" y1="19" x2="12" y2="22" />
                        </svg>
                      )}
                    </button>
                  )}
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      // Auto-resize
                      e.target.style.height = "auto";
                      e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && !loading) {
                        e.preventDefault();
                        if (isListening) stopListening();
                        sendMessage();
                      }
                    }}
                    placeholder={isListening ? "Escuchando... habla ahora. Extiéndete todo lo que quieras." : "Tu respuesta... (Shift+Enter para nueva línea)"}
                    disabled={loading}
                    rows={2}
                    className="flex-1 px-4 py-3 bg-surface-container-low border-none rounded-xl text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/10 disabled:opacity-50 resize-none overflow-y-auto"
                    style={{ maxHeight: "200px" }}
                  />
                  <button
                    onClick={() => {
                      if (isListening) stopListening();
                      sendMessage();
                    }}
                    disabled={!inputValue.trim() || loading}
                    className="gradient-denim text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    Enviar
                  </button>
                </div>
                {isListening && (
                  <p className="text-xs text-error mt-1.5 text-center animate-pulse">
                    Grabando... pulsa el botón rojo para parar o Enviar cuando termines
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Mis Frases */}
        {activeTab === "frases" && (
          <div>
            {frases.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-on-surface-variant text-sm">
                  Todavía no tienes frases guardadas. Empieza una entrevista y las iremos destacando por ti.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupFrasesByDate(frases)).map(([group, items]) =>
                  items.length > 0 ? (
                    <div key={group}>
                      <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">
                        {group}
                      </h3>
                      <div className="space-y-3">
                        {items.map((frase) => (
                          <div
                            key={frase.id}
                            className="surface-card signature-shadow rounded-2xl p-4 hover:shadow-lg transition-shadow"
                          >
                            <p className="font-headline text-lg text-on-surface italic mb-2">{frase.frase}</p>
                            {frase.pregunta && (
                              <p className="text-xs text-on-surface-variant italic mb-3">
                                Pregunta: &ldquo;{frase.pregunta}&rdquo;
                              </p>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="pill pill-light text-xs">
                                  {ESTILOS.find((e) => e.id === frase.contexto)?.name || frase.contexto}
                                </span>
                                <span className="text-[10px] text-on-surface-variant">
                                  {new Date(frase.created_at).toLocaleDateString("es-ES", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => copyToClipboard(frase.frase, frase.id)}
                                  className="px-3 py-1.5 surface-container-low rounded-lg text-xs font-medium text-on-surface hover:surface-container transition-colors"
                                >
                                  {copiedId === frase.id ? "Copiado ✓" : "Copiar"}
                                </button>
                                <button
                                  onClick={() => saveToIdeas(frase.frase)}
                                  className="px-3 py-1.5 surface-container-low rounded-lg text-xs font-medium text-primary hover:surface-container transition-colors"
                                >
                                  → Ideas
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 surface-container text-on-surface px-4 py-3 rounded-lg text-sm font-medium signature-shadow animate-in fade-in">
          {toastMessage}
        </div>
      )}
    </AppShell>
  );
}
