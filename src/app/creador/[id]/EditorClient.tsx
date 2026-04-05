"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ─── Types ───

interface CreatorProject {
  id: string;
  user_id: string;
  title: string;
  project_type: "video_short" | "video_long" | "article" | "newsletter" | "post" | "carousel";
  status: "draft" | "published" | "archived";
  content?: any;
  ai_insights?: any;
  source_suggestion?: any;
  analytics?: Record<string, number>;
  canal?: string;
  pilar?: string;
  formato?: string;
  tono?: string;
  created_at: string;
  updated_at: string;
}

interface CreatorSlide {
  id: string;
  project_id: string;
  slide_order: number;
  image_url?: string;
  title: string;
  description: string;
  cta: string;
  created_at: string;
}

interface ChatMessage {
  id: string;
  project_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface EditorClientProps {
  project: CreatorProject;
  slides: CreatorSlide[];
  chatHistory: ChatMessage[];
  userId: string;
  userName: string;
  hasApiKey: boolean;
  brujulaContext?: any;
}

type EditorMode = "video_short" | "video_long" | "article" | "newsletter" | "post" | "carousel";

// ─── Helper Components ───

const Icon = ({ name, className = "" }: { name: string; className?: string }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

// ─── Default Content by Type ───

function getDefaultContent(type: EditorMode) {
  if (type === "video_short" || type === "video_long") {
    return {
      hook: "",
      retention: "",
      steps: [{ text: "" }],
      closing: "",
      visual_notes: "",
    };
  }
  if (type === "article" || type === "newsletter" || type === "post") {
    return {
      subtitle: "",
      body: "",
    };
  }
  return {};
}

// ─── Main Component ───

export default function EditorClient({
  project: initialProject,
  slides: initialSlides,
  chatHistory: initialChatHistory,
  userId,
  userName,
  hasApiKey,
  brujulaContext,
}: EditorClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  // State
  const [project, setProject] = useState<CreatorProject>(initialProject);
  const [title, setTitle] = useState(initialProject.title);
  const [content, setContent] = useState(
    initialProject.content || getDefaultContent(initialProject.project_type as EditorMode)
  );
  const [slides, setSlides] = useState<CreatorSlide[]>(initialSlides);
  // Auto-populate insights from source_suggestion if no ai_insights yet
  const [insights, setInsights] = useState(() => {
    if (initialProject.ai_insights && Object.keys(initialProject.ai_insights).length > 0) {
      return initialProject.ai_insights;
    }
    const src = initialProject.source_suggestion;
    if (src && (src.titulares || src.gancho || src.enfoque)) {
      return {
        titulares: src.titulares || [],
        gancho_apertura: src.gancho || "",
        enfoque: src.enfoque || "",
        pistas_creativas: src.pistas || [],
        cierre_cta: src.cta || "",
        estrategia: src.estrategia || "",
        por_que_ahora: src.porQueAhora || "",
      };
    }
    return null;
  });
  const [analytics, setAnalytics] = useState(initialProject.analytics || {});
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [showChat, setShowChat] = useState(false);
  const [showInsights, setShowInsights] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatHistory);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [toast, setToast] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const projectType = project.project_type as EditorMode;
  const isVideoMode = projectType === "video_short" || projectType === "video_long";
  const isTextMode = projectType === "article" || projectType === "newsletter" || projectType === "post";
  const isCarouselMode = projectType === "carousel";

  // ─── Helpers ───

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const autoSave = useCallback(
    async (updatedData: any = {}) => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(async () => {
        setSaveStatus("saving");
        try {
          const { error } = await supabase
            .from("creator_projects")
            .update({
              title: updatedData.title || title,
              content: updatedData.content || content,
              ai_insights: updatedData.insights || insights,
              analytics: updatedData.analytics || analytics,
              updated_at: new Date().toISOString(),
            })
            .eq("id", project.id);

          if (error) throw error;
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        } catch (error) {
          console.error("Auto-save error:", error);
          setSaveStatus("idle");
        }
      }, 1500);
    },
    [project.id, title, content, insights, analytics, supabase]
  );

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    autoSave({ title: newTitle });
  };

  const handleContentChange = (newContent: any) => {
    setContent(newContent);
    autoSave({ content: newContent });
  };

  const handleAnalyticsChange = (key: string, value: number) => {
    const updated = { ...analytics, [key]: value };
    setAnalytics(updated);
    autoSave({ analytics: updated });
  };

  // ─── AI Insights ───

  const generateInsights = async () => {
    if (!hasApiKey) {
      showToast("Configura tu API key en Ajustes para usar Maestro IA");
      return;
    }

    setGeneratingInsights(true);
    try {
      const response = await fetch("/api/creador/ai-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          projectType: projectType,
          title,
          content,
          brujulaContext,
          pilar: project.pilar || "",
          canal: project.canal || "",
          tono: project.tono || "",
        }),
      });

      if (!response.ok) throw new Error("Failed to generate insights");

      const data = await response.json();
      const newInsights = data.insights || data;
      setInsights(newInsights);
      autoSave({ insights: newInsights });
      showToast("Insights generados");
    } catch (error) {
      console.error("Insights error:", error);
      showToast("Error al generar insights");
    } finally {
      setGeneratingInsights(false);
    }
  };

  // ─── Chat with Maestro IA ───

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !hasApiKey) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      project_id: project.id,
      role: "user",
      content: chatInput,
      created_at: new Date().toISOString(),
    };

    setChatMessages([...chatMessages, userMessage]);
    setChatInput("");
    setChatLoading(true);

    try {
      const response = await fetch("/api/creador/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          message: chatInput,
          projectType,
          title,
          content,
          brujulaContext,
        }),
      });

      if (!response.ok) throw new Error("Chat error");

      // Read streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        project_id: project.id,
        role: "assistant",
        content: "",
        created_at: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, assistantMessage]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });
          setChatMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id ? { ...m, content: fullText } : m
            )
          );
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      showToast("Error en el chat");
    } finally {
      setChatLoading(false);
    }
  };

  // ─── Export ───

  const exportContent = async () => {
    let exportText = `# ${title}\n\n`;

    if (isVideoMode) {
      exportText += `## Gancho\n${(content as any).hook || ""}\n\n`;
      exportText += `## Retención\n${(content as any).retention || ""}\n\n`;
      exportText += `## Desarrollo\n${
        ((content as any).steps || []).map((step: any, i: number) => `${i + 1}. ${step.text}`).join("\n") || ""
      }\n\n`;
      exportText += `## Cierre\n${(content as any).closing || ""}\n\n`;
      exportText += `## Notas Visuales\n${(content as any).visual_notes || ""}\n`;
    } else if (isTextMode) {
      exportText += `## Subtítulo\n${(content as any).subtitle || ""}\n\n`;
      exportText += `## Contenido\n${(content as any).body || ""}\n`;
    }

    try {
      await navigator.clipboard.writeText(exportText);
      showToast("Contenido copiado al portapapeles");
    } catch {
      showToast("Error al copiar");
    }
  };

  // ─── Publish ───

  const togglePublish = async () => {
    const newStatus = project.status === "published" ? "draft" : "published";
    try {
      const { error } = await supabase
        .from("creator_projects")
        .update({
          status: newStatus,
          published_at: newStatus === "published" ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", project.id);

      if (error) throw error;
      setProject({ ...project, status: newStatus });
      showToast(newStatus === "published" ? "Publicado" : "Movido a borradores");
    } catch (error) {
      console.error("Publish toggle error:", error);
      showToast("Error al cambiar estado");
    }
  };

  // ─── Render Editor by Type ───

  const renderEditor = () => {
    if (isVideoMode) {
      return (
        <VideoEditor
          content={content}
          onChange={handleContentChange}
          type={projectType}
        />
      );
    }
    if (isTextMode) {
      return (
        <TextEditor
          content={content}
          onChange={handleContentChange}
        />
      );
    }
    if (isCarouselMode) {
      return (
        <CarouselEditor
          slides={slides}
          onSlidesChange={setSlides}
          projectId={project.id}
        />
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-outline/10 signature-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          {/* Back + Title */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Link
              href="/creador"
              className="flex-shrink-0 p-2 rounded-xl hover:bg-surface-container-low transition-colors"
            >
              <Icon name="arrow_back" className="text-xl text-on-surface" />
            </Link>
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                onBlur={() => setIsEditing(false)}
                autoFocus
                className="flex-1 min-w-0 text-xl font-headline text-on-surface bg-transparent border-b-2 border-primary focus:outline-none"
              />
            ) : (
              <h1
                onClick={() => setIsEditing(true)}
                className="flex-1 min-w-0 text-xl font-headline text-on-surface truncate cursor-pointer hover:text-primary/80 transition-colors"
              >
                {title}
              </h1>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Save Status */}
            {saveStatus !== "idle" && (
              <div className="flex items-center gap-1.5 text-xs text-on-surface-variant px-3 py-1.5 rounded-lg bg-surface-container-low">
                {saveStatus === "saving" ? (
                  <>
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Icon name="check" className="text-sm text-green-600" />
                    Guardado
                  </>
                )}
              </div>
            )}

            {/* Export */}
            <button
              onClick={exportContent}
              className="px-3 py-2 text-sm text-on-surface-variant hover:text-on-surface rounded-xl hover:bg-surface-container-low transition-colors"
              title="Exportar contenido"
            >
              <Icon name="download" className="text-lg" />
            </button>

            {/* Publish / Unpublish */}
            {project.status === "draft" ? (
              <button
                onClick={togglePublish}
                className="px-4 py-2.5 text-sm font-medium rounded-xl gradient-denim text-white hover:shadow-lg transition-all"
              >
                Publicar
              </button>
            ) : project.status === "published" ? (
              <button
                onClick={togglePublish}
                className="px-4 py-2.5 text-sm font-medium rounded-xl bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-600 transition-all group"
              >
                <span className="group-hover:hidden">Publicado</span>
                <span className="hidden group-hover:inline">Despublicar</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex gap-6 relative">
        {/* Editor Area */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl signature-shadow overflow-hidden">
            {renderEditor()}
          </div>
        </div>

        {/* Right Sidebar - AI Insights + Analytics */}
        {showInsights && (
          <div className="w-80 flex-shrink-0 space-y-6">
            {/* AI Insights */}
            <div className="bg-white rounded-2xl signature-shadow p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Icon name="stars" className="text-xl text-primary" />
                  <h3 className="font-headline text-base text-on-surface">AI Insights</h3>
                </div>
                <button
                  onClick={() => setShowInsights(false)}
                  className="p-1 rounded-lg hover:bg-surface-container-low transition-colors"
                >
                  <Icon name="close" className="text-lg text-on-surface-variant" />
                </button>
              </div>

              {insights ? (
                <div className="space-y-4">
                  {/* Ideas de Titular */}
                  {insights.titulares && (
                    <div>
                      <p className="text-xs font-semibold text-on-surface-variant/60 uppercase tracking-widest mb-2">
                        Ideas de Titular
                      </p>
                      <div className="space-y-2">
                        {insights.titulares.slice(0, 3).map((h: string, i: number) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 p-2.5 rounded-lg bg-surface-container-low hover:bg-primary/5 group cursor-pointer transition-colors"
                            onClick={() => handleTitleChange(h)}
                          >
                            <span className="text-xs text-primary font-semibold flex-shrink-0 mt-0.5">+</span>
                            <span className="text-xs text-on-surface leading-snug flex-1">{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gancho de Apertura */}
                  {insights.gancho_apertura && (
                    <div>
                      <p className="text-xs font-semibold text-on-surface-variant/60 uppercase tracking-widest mb-2">
                        Gancho de Apertura
                      </p>
                      <blockquote className="text-xs text-on-surface/70 border-l-2 border-primary/20 pl-3 italic">
                        {insights.gancho_apertura}
                      </blockquote>
                    </div>
                  )}

                  {/* Enfoque y Estrategia */}
                  {(insights.enfoque || insights.estrategia) && (
                    <div>
                      <p className="text-xs font-semibold text-on-surface-variant/60 uppercase tracking-widest mb-2">
                        Enfoque y Estrategia
                      </p>
                      {insights.enfoque && (
                        <p className="text-xs text-on-surface/80 mb-2">{insights.enfoque}</p>
                      )}
                      {insights.estrategia && (
                        <p className="text-xs text-on-surface-variant/70 italic">{insights.estrategia}</p>
                      )}
                      {insights.por_que_ahora && (
                        <p className="text-xs text-primary/70 mt-2 font-medium">{insights.por_que_ahora}</p>
                      )}
                    </div>
                  )}

                  {/* Pistas Creativas */}
                  {insights.pistas_creativas && (
                    <div>
                      <p className="text-xs font-semibold text-on-surface-variant/60 uppercase tracking-widest mb-2">
                        Pistas Creativas
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {insights.pistas_creativas.slice(0, 5).map((spark: string, i: number) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-medium"
                          >
                            {spark}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cierre / CTA */}
                  {insights.cierre_cta && (
                    <div>
                      <p className="text-xs font-semibold text-on-surface-variant/60 uppercase tracking-widest mb-2">
                        Cierre / CTA
                      </p>
                      <p className="text-xs text-on-surface/70">{insights.cierre_cta}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Icon name="lightbulb" className="text-3xl text-outline mb-2 block" />
                  <p className="text-xs text-on-surface-variant/60 mb-3">
                    Genera insights para esta pieza
                  </p>
                  <button
                    onClick={generateInsights}
                    disabled={generatingInsights}
                    className="w-full px-3 py-2 text-xs font-medium rounded-lg gradient-denim text-white hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {generatingInsights ? "Generando..." : "Generar Insights"}
                  </button>
                </div>
              )}

              {insights && (
                <button
                  onClick={generateInsights}
                  disabled={generatingInsights}
                  className="w-full mt-4 px-3 py-2 text-xs font-medium rounded-lg gradient-denim text-white hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {generatingInsights ? "Regenerando..." : "Regenerar"}
                </button>
              )}
            </div>

            {/* Analytics */}
            {project.status === "published" && (
              <div className="bg-white rounded-2xl signature-shadow p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Icon name="analytics" className="text-xl text-primary" />
                  <h3 className="font-headline text-base text-on-surface">Analíticas</h3>
                </div>

                <div className="space-y-3">
                  {[
                    { key: "views", label: "Visualizaciones", icon: "visibility" },
                    { key: "likes", label: "Likes", icon: "favorite" },
                    { key: "comments", label: "Comentarios", icon: "comment" },
                    { key: "saves", label: "Guardados", icon: "bookmark" },
                    { key: "shares", label: "Compartidos", icon: "share" },
                    { key: "sends", label: "Enviados", icon: "send" },
                  ].map(({ key, label, icon }) => (
                    <div key={key}>
                      <label className="text-xs text-on-surface-variant/60 font-medium">
                        {label}
                      </label>
                      <input
                        type="number"
                        value={analytics[key] || 0}
                        onChange={(e) =>
                          handleAnalyticsChange(key, parseInt(e.target.value) || 0)
                        }
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Maestro IA Chat Bubble */}
      <MaestroChat
        isOpen={showChat}
        onToggle={() => setShowChat(!showChat)}
        messages={chatMessages}
        input={chatInput}
        onInputChange={setChatInput}
        onSend={sendChatMessage}
        loading={chatLoading}
        hasApiKey={hasApiKey}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-negro text-white text-sm font-medium shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

// ─── Video Editor ───

function VideoEditor({
  content,
  onChange,
  type,
}: {
  content: any;
  onChange: (c: any) => void;
  type: EditorMode;
}) {
  const isShort = type === "video_short";
  const wordCount = [
    content.hook || "",
    content.retention || "",
    content.closing || "",
    ((content.steps || []) as any[]).reduce((acc, s) => acc + (s.text || ""), ""),
  ].join(" ").split(" ").length;
  const estimatedMinutes = Math.ceil(wordCount / 150);

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          isShort
            ? "bg-primary/10 text-primary"
            : "bg-secondary/10 text-secondary"
        }`}>
          {isShort ? "Reels / TikTok" : "YouTube"}
        </span>
        {estimatedMinutes > 0 && (
          <span className="text-xs text-on-surface-variant">
            Duración estimada: ~{estimatedMinutes} min
          </span>
        )}
      </div>

      <div className="space-y-8">
        {/* Hook */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
              1
            </div>
            <h3 className="font-headline text-lg text-on-surface">Gancho (Hook)</h3>
          </div>
          <div className="border-l-4 border-primary/30 pl-4">
            <textarea
              value={content.hook || ""}
              onChange={(e) => onChange({ ...content, hook: e.target.value })}
              placeholder="El opening que atrapa en los primeros 3 segundos..."
              className="w-full px-4 py-3 rounded-lg bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              rows={4}
            />
          </div>
        </div>

        {/* Retention */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
              2
            </div>
            <h3 className="font-headline text-lg text-on-surface">Retención (Valor)</h3>
          </div>
          <textarea
            value={content.retention || ""}
            onChange={(e) => onChange({ ...content, retention: e.target.value })}
            placeholder="¿Por qué debería quedarse viendo? ¿Qué valor recibe en los próximos 10 segundos?"
            className="w-full px-4 py-3 rounded-lg bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            rows={4}
          />
        </div>

        {/* Development Steps */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
              3
            </div>
            <h3 className="font-headline text-lg text-on-surface">Desarrollo</h3>
          </div>
          <div className="space-y-3">
            {(content.steps || []).map((step: any, idx: number) => (
              <div key={idx} className="flex gap-3 items-start">
                <span className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                  {idx + 1}
                </span>
                <textarea
                  value={step.text || ""}
                  onChange={(e) => {
                    const newSteps = [...content.steps];
                    newSteps[idx].text = e.target.value;
                    onChange({ ...content, steps: newSteps });
                  }}
                  placeholder={`Paso ${idx + 1}...`}
                  className="flex-1 px-4 py-3 rounded-lg bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  rows={2}
                />
                {content.steps.length > 1 && (
                  <button
                    onClick={() => {
                      const newSteps = content.steps.filter((_: any, i: number) => i !== idx);
                      onChange({ ...content, steps: newSteps });
                    }}
                    className="flex-shrink-0 p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant transition-colors"
                  >
                    <Icon name="delete" className="text-lg" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => onChange({ ...content, steps: [...(content.steps || []), { text: "" }] })}
              className="w-full px-4 py-2.5 rounded-lg border border-primary/30 text-primary text-sm font-medium hover:bg-primary/5 transition-colors"
            >
              + Añadir Paso
            </button>
          </div>
        </div>

        {/* Closing */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
              4
            </div>
            <h3 className="font-headline text-lg text-on-surface">Cierre (CTA)</h3>
          </div>
          <textarea
            value={content.closing || ""}
            onChange={(e) => onChange({ ...content, closing: e.target.value })}
            placeholder="La acción final que quieres que hagan. Suscribirse, comentar, visitar enlace..."
            className="w-full px-4 py-3 rounded-lg bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            rows={3}
          />
        </div>

        {/* Visual Notes */}
        <div>
          <h3 className="font-headline text-lg text-on-surface mb-3">Notas Visuales</h3>
          <textarea
            value={content.visual_notes || ""}
            onChange={(e) => onChange({ ...content, visual_notes: e.target.value })}
            placeholder="Direcciones de cámara, overlays de texto, efectos, transiciones..."
            className="w-full px-4 py-3 rounded-lg bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Text Editor ───

function TextEditor({
  content,
  onChange,
}: {
  content: any;
  onChange: (c: any) => void;
}) {
  const wordCount = ((content.body || "") + (content.subtitle || "")).split(" ").length;
  const estimatedReadTime = Math.ceil(wordCount / 200);

  return (
    <div className="p-8">
      <div className="mb-8">
        <input
          type="text"
          value={content.subtitle || ""}
          onChange={(e) => onChange({ ...content, subtitle: e.target.value })}
          placeholder="Subtítulo / Categoría"
          className="text-xs font-semibold text-primary uppercase tracking-widest mb-4 bg-transparent border-none focus:outline-none p-0"
        />
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <h2 className="font-headline text-4xl text-on-surface leading-tight">
              {content.subtitle ? `${content.subtitle}` : "Tu Titular Principal..."}
            </h2>
          </div>
          {estimatedReadTime > 0 && (
            <span className="text-xs text-on-surface-variant/60 whitespace-nowrap">
              ~{estimatedReadTime} min de lectura
            </span>
          )}
        </div>
      </div>

      <div className="border-t border-outline/20 pt-8">
        <textarea
          value={content.body || ""}
          onChange={(e) => onChange({ ...content, body: e.target.value })}
          placeholder="Empieza a escribir tu contenido aquí..."
          className="w-full text-lg text-on-surface leading-relaxed bg-transparent focus:outline-none resize-none"
          rows={20}
        />
      </div>
    </div>
  );
}

// ─── Carousel Editor ───

function CarouselEditor({
  slides,
  onSlidesChange,
  projectId,
}: {
  slides: CreatorSlide[];
  onSlidesChange: (slides: CreatorSlide[]) => void;
  projectId: string;
}) {
  const [selectedSlide, setSelectedSlide] = useState(0);
  const currentSlide = slides[selectedSlide] || { title: "", description: "", cta: "" };

  const updateSlide = (idx: number, field: string, value: string) => {
    const updated = [...slides];
    updated[idx] = { ...updated[idx], [field]: value };
    onSlidesChange(updated);
  };

  const addSlide = () => {
    const newSlide: CreatorSlide = {
      id: `slide-${Date.now()}`,
      project_id: projectId,
      slide_order: slides.length + 1,
      title: "",
      description: "",
      cta: "",
      created_at: new Date().toISOString(),
    };
    onSlidesChange([...slides, newSlide]);
    setSelectedSlide(slides.length);
  };

  const deleteSlide = (idx: number) => {
    if (slides.length === 1) return;
    const updated = slides.filter((_, i) => i !== idx);
    onSlidesChange(updated);
    setSelectedSlide(Math.max(0, idx - 1));
  };

  return (
    <div className="flex gap-8 p-8">
      {/* Left: Slide Editor Stack */}
      <div className="flex-1 space-y-4">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            onClick={() => setSelectedSlide(idx)}
            className={`p-6 rounded-xl cursor-pointer transition-all border-2 ${
              selectedSlide === idx
                ? "border-primary bg-primary/5"
                : "border-outline/20 hover:border-primary/30 bg-surface-container-low"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-2xl font-bold text-primary/60">
                {String(idx + 1).padStart(2, "0")}
              </span>
              {slides.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSlide(idx);
                  }}
                  className="p-1 rounded-lg hover:bg-surface text-on-surface-variant transition-colors"
                >
                  <Icon name="delete" className="text-lg" />
                </button>
              )}
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={slide.title}
                onChange={(e) => updateSlide(idx, "title", e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="TITULAR DEL SLIDE"
                className="w-full px-3 py-2 rounded-lg bg-white text-on-surface text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-on-surface-variant/60">{slide.description.slice(0, 40)}...</p>
            </div>
          </div>
        ))}

        <button
          onClick={addSlide}
          className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-primary/30 text-primary text-sm font-medium hover:bg-primary/5 transition-colors"
        >
          + Añadir Nuevo Slide
        </button>
      </div>

      {/* Right: Slide Editor + Preview */}
      {slides.length > 0 && (
        <div className="flex-1 space-y-6">
          {/* Slide Editor */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant/60 uppercase tracking-widest mb-2">
                Titular del Slide
              </label>
              <input
                type="text"
                value={currentSlide.title}
                onChange={(e) => updateSlide(selectedSlide, "title", e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant/60 uppercase tracking-widest mb-2">
                Descripción / Cuerpo
              </label>
              <textarea
                value={currentSlide.description}
                onChange={(e) => updateSlide(selectedSlide, "description", e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant/60 uppercase tracking-widest mb-2">
                Llamada a la Acción (CTA)
              </label>
              <input
                type="text"
                value={currentSlide.cta}
                onChange={(e) => updateSlide(selectedSlide, "cta", e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="ej: Visita nuestro sitio"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-black rounded-3xl p-1 w-full" style={{ aspectRatio: "375/667" }}>
            <div className="bg-white rounded-3xl h-full p-6 flex flex-col justify-between overflow-hidden">
              <div>
                {currentSlide.image_url && (
                  <img
                    src={currentSlide.image_url}
                    alt={currentSlide.title}
                    className="w-full h-32 rounded-lg object-cover mb-4"
                  />
                )}
              </div>
              <div>
                <h3 className="font-headline text-lg text-on-surface line-clamp-2 mb-2">
                  {currentSlide.title || "Titular del Slide"}
                </h3>
                <p className="text-xs text-on-surface-variant line-clamp-3 mb-4">
                  {currentSlide.description || "Descripción del contenido"}
                </p>
                {currentSlide.cta && (
                  <button className="w-full px-4 py-2.5 rounded-lg gradient-yellow text-on-surface font-semibold text-sm">
                    {currentSlide.cta}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-on-surface-variant">
              Slide {selectedSlide + 1} de {slides.length}
            </p>
            <p className="text-xs text-on-surface-variant/60">Instagram 1080x1080</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Maestro IA Chat ───

function MaestroChat({
  isOpen,
  onToggle,
  messages,
  input,
  onInputChange,
  onSend,
  loading,
  hasApiKey,
}: {
  isOpen: boolean;
  onToggle: () => void;
  messages: ChatMessage[];
  input: string;
  onInputChange: (s: string) => void;
  onSend: () => void;
  loading: boolean;
  hasApiKey: boolean;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full gradient-denim text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
        title="Maestro IA"
      >
        <Icon name="chat" className="text-xl" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl signature-shadow flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-outline/10 flex items-center justify-between bg-gradient-denim">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🦍</span>
          <div>
            <h3 className="font-headline text-sm text-white">Maestro IA</h3>
          </div>
        </div>
        <button onClick={onToggle} className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors">
          <Icon name="close" className="text-lg" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!hasApiKey && (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <Icon name="lock" className="text-4xl text-outline mb-2 block" />
              <p className="text-xs text-on-surface-variant">
                Configura tu API key en Ajustes
              </p>
            </div>
          </div>
        )}

        {hasApiKey && messages.length === 0 && (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <span className="text-4xl">🦍</span>
              <p className="text-xs text-on-surface-variant mt-2">
                ¿Alguna pregunta sobre tu contenido?
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs px-4 py-2.5 rounded-xl text-sm ${
                msg.role === "user"
                  ? "bg-primary text-white"
                  : "bg-surface-container-low text-on-surface"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-surface-container-low px-4 py-2.5 rounded-xl">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0.2s" }} />
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {hasApiKey && (
        <div className="p-4 border-t border-outline/10 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && onSend()}
            placeholder="Escribe tu pregunta..."
            className="flex-1 px-3 py-2 rounded-lg bg-surface-container-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            disabled={loading}
          />
          <button
            onClick={onSend}
            disabled={!input.trim() || loading}
            className="px-4 py-2 rounded-lg gradient-denim text-white text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Icon name="send" className="text-lg" />
          </button>
        </div>
      )}
    </div>
  );
}
