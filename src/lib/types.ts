export interface BriefingData {
  temaRaiz: string;
  propuestaValor: string;
  etiquetaProfesional: string;
  porQueTu: string;
}

export interface BuyerData {
  nombre: string;
  edad: string;
  profesion: string;
  queQuiere: string;
  queLeFrena: string;
  queConsumo: string;
  dondeEsta: string;
  lenguaje: string;
}

export interface EmpathyData {
  queVe: string;
  queOye: string;
  queDiceHace: string;
  quePiensaSiente: string;
  dolores: string;
  deseos: string;
}

export interface InsightData {
  insight: string;
  fraseAudiencia: string;
}

export interface Pilar {
  nombre: string;
  subtemas: string[];
  angulos: string[];
  titulares?: string[];
}

export interface TreeData {
  pilares: Pilar[];
}

export interface ChannelsData {
  canales: string[];
  objetivosPrincipales: string[];
}

export interface HistoryEntry {
  pilar: string;
  subtema: string;
  angulo: string;
  formato: string;
  tono: string;
  date: string;
  objetivo: string;
  energia: string;
}

export interface BrujulaState {
  briefing: BriefingData;
  buyer: BuyerData;          // Legacy single buyer (kept for backwards compat)
  buyers?: BuyerData[];      // Multiple buyer personas (up to 5)
  empathy: EmpathyData;
  insight: InsightData;
  tree: TreeData;
  channels: ChannelsData;
  history: HistoryEntry[];
  apiKey: string;
}

export interface SuggestionResult {
  pilar: string;
  subtema: string;
  angulo: string;
  tono: string;
  formato: string;
  titulares: string[];
  gancho: string;
  enfoque: string;
  pistas: string[];
  cta: string;
  estrategia: string;
  porQueAhora: string;
  // Legacy field (may exist in old history entries)
  sugerencia?: string;
}

export interface MaestroSelection {
  objetivo: string | null;
  energia: string | null;
  canal: string | null;
  pilar: string | null;
}

export interface IdeaItem {
  id: string;
  user_id: string;
  text: string;
  pilar: string | null;
  subtema: string | null;
  status: "raw" | "enriched" | "worked";
  enrichment: {
    pilar: string;
    subtema: string;
    angulos: string[];
    conexion: string;
  } | null;
  created_at: string;
}

export interface SavedPiece {
  id: string;
  user_id: string;
  suggestion: SuggestionResult;
  canal: string;
  notes: string;
  status: "saved" | "editing" | "planned";
  created_at: string;
  updated_at: string;
}

export interface PlannerItem {
  id: string;
  user_id: string;
  scheduled_date: string | null;
  scheduled_time: string | null;
  title: string;
  pilar: string;
  formato: string;
  tono: string;
  canal: string;
  sugerencia: string;
  estrategia: string;
  status: "draft" | "scheduled" | "published";
  gcal_synced: boolean;
  created_at: string;
  updated_at: string;
}

// ===== EL ÁRBOL DE LA MARCA PERSONAL =====

export interface ArbolSemilla {
  proposito: string;          // ¿Para qué existe tu marca personal?
  vision: string;             // ¿Hacia dónde quieres llevar tu vida y trabajo?
  intencion: string;          // ¿Qué quieres provocar en los demás?
  objetivos: string;          // ¿Qué te gustaría conseguir comunicando mejor?
}

export interface ArbolRaices {
  creencias: string;          // Tus creencias clave
  valores: string[];          // Tus valores no negociables
  identidad: string;          // Cómo te defines de verdad
  historia: string;           // Tu historia personal
  conocimientoHabilidades: string; // Conocimiento y habilidades reales
  fortalezas: string[];       // Tus fortalezas
  experiencia: string;        // Tu experiencia (incluso la invisible)
  intuicion: string;          // Tu intuición — lo que sabes sin saber explicar
}

export interface ArbolTronco {
  temaPrincipal: string;      // ¿De qué va tu marca personal?
  propuestaValor: string;     // ¿Qué aportas a la vida de los demás?
  zonaGenialidad: string;     // ¿Qué sabes hacer excepcionalmente bien?
}

export interface ArbolRamas {
  pasiones: string[];         // Cosas que te mueven
  intereses: string[];        // Aquello que te gusta explorar
  hobbies: string[];          // Lo que disfrutas sin presión
  habilidadesSecundarias: string[]; // Cosas que suman a tu perfil
  contextosProfesionales: string[]; // Dónde actúas hoy
  formatosComunicacion: string[];   // Cómo te expresas mejor (texto, vídeo, voz...)
}

export interface ArquetipoSeleccion {
  nombre: string;
  porcentaje: number;
}

export interface ArbolCopa {
  atributos: string[];        // Atributos que quieres representar
  arquetipos: ArquetipoSeleccion[]; // Arquetipos con porcentaje
  tonoDeVoz: string;          // Cercano, técnico, emocional, reflexivo, divertido...
  narrativa: string;          // Qué historia cuentas o historias
  energia: string;            // Qué emoción llevas al mundo (misterio, vitalidad, calma...)
  presencia: string;          // Cómo apareces en escena (de calle, uniforme, en casa...)
  percepcion: string;         // ¿Cómo quiero que me perciban?
}

export interface ArbolFrutos {
  queDeseasRecibir: string;   // Qué esperas obtener de tu trabajo bien hecho
  metaSeguidores: string;     // Cuántos seguidores/alcance te gustaría
  mensajesQueQuieres: string; // Qué tipo de mensajes quieres recibir
  impactoDeseado: string;     // Qué impacto quieres dejar en los demás
  testimonioIdeal: string;    // La frase que te gustaría que dijeran de ti
}

export interface ArbolEntorno {
  audienciaPrincipal: string;
  dondeEstan: string[];
  competencia: string;
  aliadosPotenciales: string;
  posicionamiento: string;
}

export interface ArbolTiempo {
  ritmoPublicacion: string;
  proximoHito: string;
  metaAnual: string;
  buenaVida: string;
}

export interface CofreItem {
  nombreProducto: string;     // ¿Qué vendes?
  oferta: string;             // ¿Qué lo hace deseable? (promesa, transformación, dolor que alivia)
  packagingNarrativo: string; // ¿Cómo lo cuentas? (relato de venta, historia, emoción)
  cliente: string;            // ¿Quién lo necesita y cómo lo quiere?
  canales: string;            // ¿Cómo se accede? (web, llamada, DM, comunidad...)
  sistemaEntrega: string;     // ¿Cómo lo entregas? (estructura, ritmo, acompañamiento)
  precio: string;
  estadoActual: string;
}

export interface ArbolCofre {
  productos: CofreItem[];
}

export interface ArbolData {
  semilla: ArbolSemilla;
  raices: ArbolRaices;
  tronco: ArbolTronco;
  ramas: ArbolRamas;
  copa: ArbolCopa;
  frutos: ArbolFrutos;
  entorno: ArbolEntorno;
  tiempo: ArbolTiempo;
  cofre: ArbolCofre;
}

// ===== LAS RUTAS — USER JOURNEY =====

export type DiagnosticProfile = 'A' | 'B' | 'C' | 'D';
export type RutaType = 'cimientos' | 'visibilidad' | 'reconstruccion' | 'difusion';

export interface RutaModulo {
  id: string;
  nombre: string;
  descripcion: string;
  completado: boolean;
  fecha_completado: string | null;
}

export interface CoherenciaEntry {
  fecha: string;
  score: number;
}

export interface NotaCoach {
  fecha: string;
  nota: string;
  fase: number;
}

export interface UserJourney {
  id: string;
  user_id: string;

  // Estado general
  current_phase: number; // 1-5
  phase_started_at: Record<string, string | null>;

  // Fase 1: Pirámide
  piramide_completada: boolean;
  piramide_niveles: Record<string, boolean>;
  perfil_piramide: Record<string, any>;
  profundidad_score: number;

  // Fase 2: Diagnóstico
  arbol_completado: boolean;
  diagnostico_coherencia: {
    score?: number;
    grietas?: string[];
    fortalezas?: string[];
  };
  perfil_diagnostico: DiagnosticProfile | null;

  // Fase 3: Ruta
  ruta_asignada: RutaType | null;
  ruta_modulos: RutaModulo[];
  ruta_iniciada: boolean;

  // Fase 4-5: Ejecución y evolución
  coherencia_historica: CoherenciaEntry[];
  piezas_count: number;
  coherencia_media_piezas: number;
  ultima_revision: string | null;

  // Coaching
  coaching_habilitado: boolean;
  notas_coach: NotaCoach[];

  // Timestamps
  created_at: string;
  updated_at: string;
}

export const DEFAULT_USER_JOURNEY: Partial<UserJourney> = {
  current_phase: 1,
  phase_started_at: { "1": new Date().toISOString() },
  piramide_completada: false,
  piramide_niveles: {},
  perfil_piramide: {},
  profundidad_score: 0,
  arbol_completado: false,
  diagnostico_coherencia: {},
  perfil_diagnostico: null,
  ruta_asignada: null,
  ruta_modulos: [],
  ruta_iniciada: false,
  coherencia_historica: [],
  piezas_count: 0,
  coherencia_media_piezas: 0,
  ultima_revision: null,
  coaching_habilitado: false,
  notas_coach: [],
};

// ===== PHASE CONFIGURATION =====

export interface PhaseConfig {
  number: number;
  name: string;
  tagline: string;
  icon: string;
  description: string;
  tools: string[];
  unlockCondition: string;
}

export const PHASES: PhaseConfig[] = [
  {
    number: 1,
    name: "Quién eres",
    tagline: "¿Qué hay debajo de lo que el mundo ve de ti?",
    icon: "🔺",
    description: "Completa La Pirámide para descubrir tu base: historia, valores, propósito y mercado.",
    tools: ["La Pirámide", "El Espejo"],
    unlockCondition: "Siempre disponible",
  },
  {
    number: 2,
    name: "Cómo te ve el mundo",
    tagline: "¿Lo que muestras se parece a lo que eres?",
    icon: "🌳",
    description: "El Árbol evalúa la coherencia entre tu identidad profunda y tu presencia visible.",
    tools: ["El Árbol", "La Brújula"],
    unlockCondition: "Completa La Pirámide hasta el Nivel 2",
  },
  {
    number: 3,
    name: "Tu camino",
    tagline: "No el mismo camino para todos. El tuyo.",
    icon: "🗺️",
    description: "Basándose en tu perfil y diagnóstico, Las Rutas te proponen un camino personalizado.",
    tools: ["Las Rutas", "El Maestro (guía)"],
    unlockCondition: "Completa 7 de 9 secciones del Árbol",
  },
  {
    number: 4,
    name: "Ejecuta",
    tagline: "Deja de pensar y empieza a hacer — con un plan detrás.",
    icon: "⚡",
    description: "Las herramientas de ejecución se desbloquean con contexto personalizado de tu ruta.",
    tools: ["Planificador", "Ideas", "Piezas", "Mi Mapa"],
    unlockCondition: "Inicia tu ruta y completa el primer módulo",
  },
  {
    number: 5,
    name: "Evoluciona",
    tagline: "El sistema aprende contigo. Cada mes estás más cerca.",
    icon: "🔄",
    description: "Revisión mensual de coherencia, tendencias y feedback de Jano.",
    tools: ["La Brújula (evolucionada)", "Panel de coaching"],
    unlockCondition: "Lleva al menos 1 mes ejecutando",
  },
];

// Mapping: which minimum phase is required for each tool/route
export const PHASE_REQUIREMENTS: Record<string, number> = {
  "/espejo": 1,        // Siempre disponible
  "/maestro": 1,       // Siempre (evoluciona con las fases)
  "/minority-report": 1, // Siempre (se va llenando)
  "/arbol": 2,         // Requiere Fase 2+
  "/rutas": 3,         // Requiere Fase 3+
  "/planner": 4,       // Requiere Fase 4+
  "/ideas": 4,         // Requiere Fase 4+
  "/piezas": 4,        // Requiere Fase 4+
};

// Route type display config
export const RUTA_CONFIG: Record<RutaType, { name: string; color: string; icon: string; tagline: string }> = {
  cimientos: {
    name: "Ruta de Cimientos",
    color: "#f39c12",
    icon: "🧱",
    tagline: "Vuelve a la base",
  },
  visibilidad: {
    name: "Ruta de Visibilidad",
    color: "#3498db",
    icon: "👁️",
    tagline: "Muestra lo que eres",
  },
  reconstruccion: {
    name: "Ruta de Reconstrucción",
    color: "#e85d3a",
    icon: "🔧",
    tagline: "Reajusta sin perder",
  },
  difusion: {
    name: "Ruta de Difusión",
    color: "#2ecc71",
    icon: "📡",
    tagline: "Amplifica tu mensaje",
  },
};

export const DEFAULT_ARBOL: ArbolData = {
  semilla: { proposito: "", vision: "", intencion: "", objetivos: "" },
  raices: { creencias: "", valores: [], identidad: "", historia: "", conocimientoHabilidades: "", fortalezas: [], experiencia: "", intuicion: "" },
  tronco: { temaPrincipal: "", propuestaValor: "", zonaGenialidad: "" },
  ramas: { pasiones: [], intereses: [], hobbies: [], habilidadesSecundarias: [], contextosProfesionales: [], formatosComunicacion: [] },
  copa: { atributos: [], arquetipos: [], tonoDeVoz: "", narrativa: "", energia: "", presencia: "", percepcion: "" },
  frutos: { queDeseasRecibir: "", metaSeguidores: "", mensajesQueQuieres: "", impactoDeseado: "", testimonioIdeal: "" },
  entorno: { audienciaPrincipal: "", dondeEstan: [], competencia: "", aliadosPotenciales: "", posicionamiento: "" },
  tiempo: { ritmoPublicacion: "", proximoHito: "", metaAnual: "", buenaVida: "" },
  cofre: { productos: [{ nombreProducto: "", oferta: "", packagingNarrativo: "", cliente: "", canales: "", sistemaEntrega: "", precio: "", estadoActual: "idea" }] },
};
