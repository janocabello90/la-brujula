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
  quienEres: string;          // Descripción breve de quién eres
  valoresCore: string[];      // 3-5 valores fundamentales
  proposito: string;          // Para qué haces lo que haces
  superpoder: string;         // Tu talento diferencial
}

export interface ArbolRaices {
  historia: string;           // Tu historia profesional/personal relevante
  momentosClave: string[];    // Momentos que te formaron
  aprendizajes: string;       // Qué aprendiste del camino
  deQueHuyes: string;         // Qué no quieres volver a vivir
}

export interface ArbolTronco {
  propuestaValor: string;     // Tu propuesta de valor central
  etiquetaProfesional: string; // Cómo te defines profesionalmente
  problemaQueResuelves: string; // El problema principal que solucionas
  aQuienAyudas: string;       // A quién ayudas (descripción general)
  comoLoHaces: string;        // Tu método o enfoque único
}

export interface ArbolRamas {
  pilares: {
    nombre: string;
    descripcion: string;
    subtemas: string[];
  }[];
}

export interface ArbolCopa {
  vision: string;             // Dónde quieres llegar
  mision: string;             // Qué haces cada día para lograrlo
  impacto: string;            // Qué cambio quieres generar en el mundo
  fraseBrujula: string;       // Una frase que te guíe (recordatorio)
}

export interface ArbolFrutos {
  productoEstrella: string;   // Tu producto/servicio principal
  otrosProductos: string[];   // Otros productos o servicios
  resultadoCliente: string;   // Qué consigue tu cliente
  testimonioIdeal: string;    // La frase que te gustaría que dijeran de ti
}

export interface ArbolEntorno {
  audienciaPrincipal: string; // Descripción de tu audiencia ideal
  dondeEstan: string[];       // Dónde se mueve tu audiencia (canales)
  competencia: string;        // Quién más habla de lo tuyo
  aliadosPotenciales: string; // Con quién podrías colaborar
  posicionamiento: string;    // Qué te hace diferente en ese entorno
}

export interface ArbolTiempo {
  ritmoPublicacion: string;   // Frecuencia y canales (ej: "3x semana en IG, 1 newsletter")
  proximoHito: string;        // Siguiente meta a 90 días
  metaAnual: string;          // Meta a 12 meses
  buenaVida: string;          // Tu definición de éxito/buena vida
}

export interface ArbolProducto {
  nombreProducto: string;     // Nombre del producto/servicio estrella
  paraQuien: string;          // Público objetivo específico
  queConsigue: string;        // Transformación que ofrece
  precio: string;             // Rango de precio
  canalVenta: string;         // Cómo lo vendes
  estadoActual: string;       // "idea" | "en_desarrollo" | "validado" | "vendiendo"
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
  producto: ArbolProducto;
}

export const DEFAULT_ARBOL: ArbolData = {
  semilla: { quienEres: "", valoresCore: [], proposito: "", superpoder: "" },
  raices: { historia: "", momentosClave: [], aprendizajes: "", deQueHuyes: "" },
  tronco: { propuestaValor: "", etiquetaProfesional: "", problemaQueResuelves: "", aQuienAyudas: "", comoLoHaces: "" },
  ramas: { pilares: [{ nombre: "", descripcion: "", subtemas: [] }] },
  copa: { vision: "", mision: "", impacto: "", fraseBrujula: "" },
  frutos: { productoEstrella: "", otrosProductos: [], resultadoCliente: "", testimonioIdeal: "" },
  entorno: { audienciaPrincipal: "", dondeEstan: [], competencia: "", aliadosPotenciales: "", posicionamiento: "" },
  tiempo: { ritmoPublicacion: "", proximoHito: "", metaAnual: "", buenaVida: "" },
  producto: { nombreProducto: "", paraQuien: "", queConsigue: "", precio: "", canalVenta: "", estadoActual: "idea" },
};
