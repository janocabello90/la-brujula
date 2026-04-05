"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Material Symbols icon helper
const Icon = ({ name, className = "" }: { name: string; className?: string }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

interface CreatorProject {
  id: string;
  user_id: string;
  title: string;
  type: "video_short" | "video_long" | "article" | "newsletter" | "post" | "carousel";
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
  content?: any;
  views?: number;
  likes?: number;
  comments?: number;
  saves?: number;
  shares?: number;
  sends?: number;
}

interface Props {
  projects: CreatorProject[];
  userId: string;
  userName: string;
  hasApiKey: boolean;
}

const PROJECT_TYPES = {
  video_short: { label: "Vídeo Corto", icon: "movie" },
  video_long: { label: "Vídeo Largo", icon: "videocam" },
  article: { label: "Artículo", icon: "article" },
  newsletter: { label: "Newsletter", icon: "mail" },
  post: { label: "Post", icon: "edit_note" },
  carousel: { label: "Carrusel", icon: "view_carousel" },
};

type ProjectType = keyof typeof PROJECT_TYPES;

export default function CreadorClient({
  projects,
  userId,
  userName,
  hasApiKey,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<"drafts" | "published" | "analytics">("drafts");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectType, setNewProjectType] = useState<ProjectType | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [toast, setToast] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<CreatorProject[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      PROJECT_TYPES[p.type].label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const draftProjects = filteredProjects.filter((p) => p.status === "draft");
  const publishedProjects = filteredProjects.filter((p) => p.status === "published");

  const createNewProject = async () => {
    if (!newProjectTitle.trim() || !newProjectType) {
      showToast("Completa el título y tipo de proyecto");
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from("creator_projects")
        .insert({
          user_id: userId,
          title: newProjectTitle,
          type: newProjectType,
          status: "draft",
          content: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setNewProjectTitle("");
      setNewProjectType(null);
      setShowNewProjectModal(false);
      showToast("Proyecto creado");
      router.push(`/creador/${data.id}`);
    } catch (error) {
      console.error(error);
      showToast("Error al crear proyecto");
    } finally {
      setIsCreating(false);
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este proyecto?")) return;

    setDeletingId(id);
    try {
      const { error } = await supabase
        .from("creator_projects")
        .delete()
        .eq("id", id);

      if (error) throw error;
      router.refresh();
      showToast("Proyecto eliminado");
    } catch (error) {
      console.error(error);
      showToast("Error al eliminar proyecto");
    } finally {
      setDeletingId(null);
    }
  };

  const publishProject = async (id: string) => {
    setPublishingId(id);
    try {
      const { error } = await supabase
        .from("creator_projects")
        .update({ status: "published", updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      router.refresh();
      showToast("Proyecto publicado");
    } catch (error) {
      console.error(error);
      showToast("Error al publicar proyecto");
    } finally {
      setPublishingId(null);
    }
  };

  const loadAnalyticsData = async () => {
    setLoadingAnalytics(true);
    try {
      const published = projects.filter((p) => p.status === "published");
      setAnalyticsData(published);
    } catch (error) {
      console.error(error);
      showToast("Error al cargar analíticas");
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const generateAnalyticsReport = async () => {
    try {
      const response = await fetch("/api/creador/analytics-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, projects: analyticsData }),
      });

      if (!response.ok) throw new Error("Error generating report");

      const report = await response.json();
      console.log("Analytics Report:", report);
      showToast("Informe generado");
    } catch (error) {
      console.error(error);
      showToast("Error al generar informe");
    }
  };

  useEffect(() => {
    if (activeTab === "analytics") {
      loadAnalyticsData();
    }
  }, [activeTab]);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-headline text-4xl text-on-surface mb-1">El Creador</h1>
          <p className="text-on-surface-variant text-sm uppercase tracking-widest font-medium">
            CREATIVE STUDIO
          </p>
        </div>
        <button
          onClick={() => setShowNewProjectModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl gradient-yellow text-on-surface font-bold text-sm shadow-button hover:shadow-button-hover transition-all flex-shrink-0"
        >
          <Icon name="add" className="text-lg" />
          Nuevo Proyecto
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar proyectos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 bg-surface-container-low rounded-2xl text-on-surface text-sm border border-outline/20 focus:outline-none focus:border-primary placeholder:text-on-surface-variant"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-outline/20">
        <button
          onClick={() => setActiveTab("drafts")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "drafts"
              ? "border-primary text-on-surface"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Borradores ({draftProjects.length})
        </button>
        <button
          onClick={() => setActiveTab("published")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "published"
              ? "border-primary text-on-surface"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Publicados ({publishedProjects.length})
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "analytics"
              ? "border-primary text-on-surface"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Analíticas
        </button>
      </div>

      {/* Content */}
      {activeTab === "drafts" && (
        <div>
          {draftProjects.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="edit_note" className="text-4xl text-outline mb-3 block" />
              <p className="text-on-surface-variant text-sm mb-3">
                {searchTerm
                  ? "No hay borradores que coincidan"
                  : "No tienes borradores todavía"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowNewProjectModal(true)}
                  className="text-primary text-sm font-medium hover:underline"
                >
                  Crear primer proyecto →
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {draftProjects.map((project) => (
                <div
                  key={project.id}
                  className="surface-card signature-shadow rounded-2xl p-5 hover:border-primary/20 transition-colors group"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary flex-shrink-0">
                      <Icon name={PROJECT_TYPES[project.type].icon} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-on-surface text-sm line-clamp-2 mb-0.5">
                        {project.title}
                      </h3>
                      <p className="text-xs text-on-surface-variant">
                        {PROJECT_TYPES[project.type].label}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                        Progreso
                      </span>
                      <span className="text-xs text-on-surface">0%</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                      <div className="h-full w-0 gradient-denim rounded-full" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-on-surface-variant mb-4">
                    <span>
                      {new Date(project.updated_at).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-outline/20">
                    <Link
                      href={`/creador/${project.id}`}
                      className="flex-1 px-3 py-2 text-xs font-medium text-on-surface hover:bg-primary/5 rounded-lg transition-colors"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => publishProject(project.id)}
                      disabled={publishingId === project.id}
                      className="flex-1 px-3 py-2 text-xs font-medium text-white gradient-denim rounded-lg hover:shadow-button transition-all disabled:opacity-50"
                    >
                      {publishingId === project.id ? "..." : "Publicar"}
                    </button>
                    <button
                      onClick={() => deleteProject(project.id)}
                      disabled={deletingId === project.id}
                      className="px-3 py-2 text-xs font-medium text-error hover:bg-error/10 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deletingId === project.id ? "..." : "✕"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "published" && (
        <div>
          {publishedProjects.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="publish" className="text-4xl text-outline mb-3 block" />
              <p className="text-on-surface-variant text-sm">
                {searchTerm
                  ? "No hay proyectos publicados que coincidan"
                  : "No tienes proyectos publicados todavía"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {publishedProjects.map((project) => (
                <div
                  key={project.id}
                  className="surface-card signature-shadow rounded-2xl p-5 hover:border-primary/20 transition-colors"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-success/10 text-success flex-shrink-0">
                      <Icon name={PROJECT_TYPES[project.type].icon} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-on-surface text-sm line-clamp-2 mb-0.5">
                        {project.title}
                      </h3>
                      <p className="text-xs text-on-surface-variant">
                        {PROJECT_TYPES[project.type].label}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4 text-[10px]">
                    <div className="bg-surface-container-low p-2 rounded-lg">
                      <p className="text-on-surface-variant mb-0.5">Vistas</p>
                      <p className="text-on-surface font-bold">{project.views || 0}</p>
                    </div>
                    <div className="bg-surface-container-low p-2 rounded-lg">
                      <p className="text-on-surface-variant mb-0.5">Me gusta</p>
                      <p className="text-on-surface font-bold">{project.likes || 0}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-outline/20">
                    <Link
                      href={`/creador/${project.id}`}
                      className="flex-1 px-3 py-2 text-xs font-medium text-on-surface hover:bg-primary/5 rounded-lg transition-colors"
                    >
                      Ver
                    </Link>
                    <button
                      onClick={() => deleteProject(project.id)}
                      disabled={deletingId === project.id}
                      className="px-3 py-2 text-xs font-medium text-error hover:bg-error/10 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deletingId === project.id ? "..." : "✕"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "analytics" && (
        <div>
          {loadingAnalytics ? (
            <div className="text-center py-12">
              <p className="text-on-surface-variant text-sm">Cargando analíticas...</p>
            </div>
          ) : analyticsData.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="analytics" className="text-4xl text-outline mb-3 block" />
              <p className="text-on-surface-variant text-sm">
                Publica proyectos para ver analíticas
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Analytics Summary Table */}
              <div className="surface-card signature-shadow rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-outline/20">
                  <h3 className="font-headline text-on-surface font-bold">
                    Resumen de Analíticas
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-outline/20 bg-surface-container-low">
                        <th className="text-left px-5 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                          Proyecto
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                          Vistas
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                          Me gusta
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                          Comentarios
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                          Guardados
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                          Compartidos
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                          Enviados
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.map((project) => (
                        <tr key={project.id} className="border-b border-outline/10 hover:bg-surface-container-low/50 transition-colors">
                          <td className="px-5 py-4 text-sm text-on-surface font-medium">{project.title}</td>
                          <td className="px-4 py-4 text-center text-xs text-on-surface-variant">
                            {PROJECT_TYPES[project.type].label}
                          </td>
                          <td className="px-4 py-4 text-center text-sm text-on-surface font-medium">
                            {project.views || 0}
                          </td>
                          <td className="px-4 py-4 text-center text-sm text-on-surface font-medium">
                            {project.likes || 0}
                          </td>
                          <td className="px-4 py-4 text-center text-sm text-on-surface font-medium">
                            {project.comments || 0}
                          </td>
                          <td className="px-4 py-4 text-center text-sm text-on-surface font-medium">
                            {project.saves || 0}
                          </td>
                          <td className="px-4 py-4 text-center text-sm text-on-surface font-medium">
                            {project.shares || 0}
                          </td>
                          <td className="px-4 py-4 text-center text-sm text-on-surface font-medium">
                            {project.sends || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* AI Report Section */}
              <div className="surface-card signature-shadow rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-headline text-on-surface font-bold">
                    Informe IA
                  </h3>
                  <button
                    onClick={generateAnalyticsReport}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-yellow text-on-surface font-bold text-xs shadow-button hover:shadow-button-hover transition-all"
                  >
                    <Icon name="auto_awesome" className="text-sm" />
                    Generar Informe IA
                  </button>
                </div>
                <div className="text-center py-8 text-on-surface-variant text-sm">
                  <p>Haz clic en &ldquo;Generar Informe IA&rdquo; para obtener insights personalizados</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl signature-shadow max-w-md w-full p-6">
            <div className="mb-6">
              <h2 className="font-headline text-xl text-on-surface mb-1">Nuevo Proyecto</h2>
              <p className="text-on-surface-variant text-sm">Crea tu próximo contenido</p>
            </div>

            {/* Title Input */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Título del Proyecto
              </label>
              <input
                type="text"
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                placeholder="Ej: Mi primer vídeo corto"
                className="w-full px-4 py-3 bg-surface-container-low rounded-xl text-on-surface text-sm border border-outline/20 focus:outline-none focus:border-primary placeholder:text-on-surface-variant"
              />
            </div>

            {/* Type Selection */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">
                Tipo de Proyecto
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(PROJECT_TYPES) as [ProjectType, any][]).map(
                  ([type, config]) => (
                    <button
                      key={type}
                      onClick={() => setNewProjectType(type)}
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                        newProjectType === type
                          ? "border-primary bg-primary/5"
                          : "border-outline/20 hover:border-primary/30"
                      }`}
                    >
                      <Icon name={config.icon} className="text-lg" />
                      <span className="text-xs font-medium text-on-surface text-center line-clamp-2">
                        {config.label}
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="flex-1 px-4 py-3 border border-outline rounded-xl text-on-surface-variant text-sm font-medium hover:bg-primary/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={createNewProject}
                disabled={isCreating || !newProjectTitle.trim() || !newProjectType}
                className="flex-1 px-4 py-3 rounded-xl gradient-denim text-white text-sm font-bold hover:shadow-button transition-all disabled:opacity-50"
              >
                {isCreating ? "Creando..." : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-negro text-white text-sm px-5 py-2.5 rounded-xl shadow-lg animate-toast z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
