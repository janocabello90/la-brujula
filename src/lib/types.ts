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
