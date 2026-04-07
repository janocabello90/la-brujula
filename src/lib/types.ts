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
  tendencia?: {
    nombre: string;
    objetivo: string;
    aplicacion: string;
  } | null;
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

// ===== LA PIRÁMIDE DE LA MARCA PERSONAL =====

export type PiramideStep =
  | 'prologo'
  | 'mentalidad'
  | 'buena_vida'
  | 'bajo_tierra'
  | 'nivel_1'
  | 'nivel_2'
  | 'nivel_3'
  | 'nivel_4'
  | 'completada';

// Prólogo: Tu historia
export interface PrologoData {
  el_comienzo: string;
  los_nudos: string;
  las_semillas: string;
  la_proyeccion: string;
}

// Cap II: Mentalidad — Diseña tu escaparate
export interface MentalidadData {
  que_sienta: string;
  elementos_centro: string;
  valores_ambiente: string;
  que_recuerden: string;
}

// Cap III: Éxito y Buena Vida
export interface BuenaVidaData {
  definiendo_buena_vida: string;
  espacios_resonancia: string;
  relacion_trabajo: string;
  definicion_exito: string;
  principios_guia: string;
  brujula_emocional: string;
  recordatorio_personal: string;
}

// Bajo Tierra — Ejercicios profundos de autoconocimiento
export interface BajoTierraData {
  // Ejercicio 1: Tu historia subterránea
  historia_infancia: string;       // ¿Qué aprendiste en casa? ¿Qué valores o carencias heredaste?
  historia_formacion: string;      // ¿Qué experiencias formativas (estudios, trabajos, relaciones) te moldearon?
  historia_fracasos: string;       // ¿Cuáles han sido tus mayores fracasos y qué aprendiste de ellos?
  historia_victorias: string;      // ¿Qué logros te hacen sentir orgulloso — aunque nadie los conozca?
  // Ejercicio 2: Mapa de creencias (formulario estructurado)
  creencia_sobre_ti: string;       // ¿Qué crees sobre ti mismo? (ej: "soy bueno en...", "no soy capaz de...")
  creencia_sobre_dinero: string;   // ¿Qué crees sobre el dinero? (ej: "el dinero es difícil de ganar", "soy malo gestionándolo")
  creencia_sobre_exito: string;    // ¿Qué crees sobre el éxito? (ej: "el éxito es para otros", "hay que sacrificar todo")
  creencia_sobre_exposicion: string; // ¿Qué crees sobre exponerte públicamente?
  creencia_sobre_vender: string;   // ¿Qué crees sobre vender o promocionarte?
  // Ejercicio 3: Transformación de creencias
  limitante_1: string;             // Creencia limitante 1
  limitante_1_origen: string;      // ¿De dónde viene esta creencia?
  limitante_1_alternativa: string; // ¿Qué creencia alternativa podrías adoptar?
  limitante_2: string;
  limitante_2_origen: string;
  limitante_2_alternativa: string;
  limitante_3: string;
  limitante_3_origen: string;
  limitante_3_alternativa: string;
  // Ejercicio 4: Tus fortalezas ocultas
  potenciadora_1: string;          // Creencia potenciadora 1
  potenciadora_2: string;          // Creencia potenciadora 2
  potenciadora_3: string;          // Creencia potenciadora 3
  que_dicen_de_ti: string;         // ¿Qué dicen de ti las personas que te conocen bien?
  // Ejercicio 5: Teoría de los sistemas complejos — Tu unicidad
  combinacion_unica: string;       // ¿Qué combinación irrepetible de experiencias, talentos y visión tienes?
  que_haces_diferente: string;     // ¿Qué haces de una forma que nadie más hace?
  tu_superpoder: string;           // Si tuvieras un superpoder profesional, ¿cuál sería?
  // Ejercicio 6: El espejo interior
  espejo_diez_anos: string;        // ¿Qué pensaría tu yo de 10 años al verte hoy?
  espejo_futuro: string;           // ¿Qué necesita tu yo del futuro que empieces a hacer hoy?
}

// Nivel 1 — Identidad profunda
export interface Nivel1Data {
  // Ejercicio 1: Tus 5 valores innegociables (lista estructurada)
  valor_1: string;
  valor_1_significado: string;     // ¿Qué significa este valor para ti en la práctica?
  valor_1_ejemplo: string;         // ¿Cuándo lo has demostrado con acciones?
  valor_2: string;
  valor_2_significado: string;
  valor_2_ejemplo: string;
  valor_3: string;
  valor_3_significado: string;
  valor_3_ejemplo: string;
  valor_4: string;
  valor_4_significado: string;
  valor_4_ejemplo: string;
  valor_5: string;
  valor_5_significado: string;
  valor_5_ejemplo: string;
  // Ejercicio 2: Los 5 porqués del propósito
  proposito_superficie: string;    // ¿A qué te dedicas? (la respuesta superficial)
  proposito_porque_1: string;      // ¿Por qué haces esto?
  proposito_porque_2: string;      // ¿Y por qué es eso importante?
  proposito_porque_3: string;      // ¿Y por qué importa eso?
  proposito_porque_4: string;      // ¿Y eso por qué te mueve?
  proposito_porque_5: string;      // ¿Y al final... para qué?
  proposito_destilado: string;     // Ahora escribe tu propósito en una sola frase
  // Ejercicio 3: Visión — El día perfecto en 5 años
  vision_dia_perfecto: string;     // Describe un día perfecto dentro de 5 años con todo detalle
  vision_profesional: string;      // ¿Qué estás haciendo profesionalmente?
  vision_personal: string;         // ¿Cómo es tu vida personal?
  vision_impacto: string;          // ¿Qué impacto estás teniendo en los demás?
  // Ejercicio 4: Banderas rojas (lista de líneas que no cruzas)
  bandera_1: string;               // Línea que no cruzo #1
  bandera_2: string;
  bandera_3: string;
  bandera_4: string;
  bandera_5: string;
  banderas_experiencia: string;    // ¿Alguna vez cruzaste alguna de estas líneas? ¿Qué pasó?
  // Ejercicio 5: Identidad sin cargo
  identidad_sin_cargo: string;     // Preséntate sin usar tu profesión ni tu cargo
  identidad_frase: string;         // Tu identidad en una frase: "Soy alguien que..."
  // Ejercicio 6: Test de coherencia
  coherencia_acciones: string;     // ¿Tus acciones diarias reflejan tus valores?
  coherencia_grietas: string;      // ¿Dónde hay grietas entre lo que dices y lo que haces?
  coherencia_ajuste: string;       // ¿Qué necesitas ajustar para vivir más alineado?
}

// Nivel 2 — Mercado, propuesta de valor y objetivos
export interface Nivel2Data {
  // Ejercicio 1: Tu audiencia como persona real
  audiencia_nombre: string;        // Dale un nombre a tu cliente ideal
  audiencia_edad_contexto: string; // Edad, situación vital, contexto profesional
  audiencia_frustracion: string;   // ¿Qué le frustra? ¿Qué problema tiene que no ha resuelto?
  audiencia_deseo: string;         // ¿Qué desea profundamente? ¿Qué resultado quiere conseguir?
  audiencia_objecion: string;      // ¿Por qué no lo ha conseguido aún? ¿Qué objeciones tiene?
  audiencia_donde_esta: string;    // ¿Dónde pasa el tiempo? ¿Qué consume? ¿A quién sigue?
  audiencia_lenguaje: string;      // ¿Cómo habla? ¿Qué palabras usa para describir su problema?
  // Ejercicio 2: Propuesta de valor — La fórmula
  pv_ayudo_a: string;             // Ayudo a [tipo de persona]...
  pv_a_conseguir: string;         // ...a conseguir [resultado concreto]...
  pv_a_traves_de: string;         // ...a través de [tu método/enfoque único]...
  pv_sin_necesidad: string;       // ...sin necesidad de [lo que odian o temen]
  pv_frase_completa: string;      // Tu propuesta de valor en una frase completa
  pv_por_que_tu: string;          // ¿Por qué tú y no otro? ¿Qué te diferencia?
  // Ejercicio 3: Cuadro de objetivos — Estructura jerárquica
  // ❤️ Objetivo pasional (lo que te mueve por dentro)
  obj_pasional: string;
  obj_pasional_sec_1: string;       // Secundario 1 del pasional
  obj_pasional_sec_1_kpi: string;   // KPI del secundario 1
  obj_pasional_sec_2: string;       // Secundario 2 del pasional
  obj_pasional_sec_2_kpi: string;
  obj_pasional_sec_3: string;       // Secundario 3 del pasional (opcional)
  obj_pasional_sec_3_kpi: string;
  // ⭐ Objetivo de referencia (cómo quieres ser percibido)
  obj_referencia: string;
  obj_referencia_sec_1: string;
  obj_referencia_sec_1_kpi: string;
  obj_referencia_sec_2: string;
  obj_referencia_sec_2_kpi: string;
  obj_referencia_sec_3: string;
  obj_referencia_sec_3_kpi: string;
  // 💰 Objetivo económico (la sostenibilidad de tu proyecto)
  obj_economico: string;
  obj_economico_sec_1: string;
  obj_economico_sec_1_kpi: string;
  obj_economico_sec_2: string;
  obj_economico_sec_2_kpi: string;
  obj_economico_sec_3: string;
  obj_economico_sec_3_kpi: string;
  // Ejercicio 4: Conexión propuesta → audiencia → objetivos
  conexion_propuesta_audiencia: string;  // ¿Tu propuesta resuelve el problema real de tu audiencia?
  conexion_objetivos_coherencia: string; // ¿Tus objetivos están alineados con tu buena vida?
  conexion_que_falta: string;            // ¿Qué pieza falta para que todo encaje?
}

// Nivel 3 — Estrategia, guías y embudos
export interface Nivel3Data {
  // Ejercicio 1: Selección de canales (máx 2-3)
  canal_1_nombre: string;          // Canal principal
  canal_1_por_que: string;         // ¿Por qué este canal?
  canal_1_estrategia: string;      // ¿Qué vas a hacer aquí? ¿Con qué frecuencia?
  canal_1_objetivo: string;        // ¿Qué objetivo persigues en este canal?
  canal_2_nombre: string;
  canal_2_por_que: string;
  canal_2_estrategia: string;
  canal_2_objetivo: string;
  canal_3_nombre: string;
  canal_3_por_que: string;
  canal_3_estrategia: string;
  canal_3_objetivo: string;
  // Ejercicio 2: Tu contenido — Pilares y formato
  pilar_1: string;                 // Pilar de contenido #1 (de qué hablas)
  pilar_2: string;
  pilar_3: string;
  formato_preferido: string;       // ¿Texto, vídeo, audio, imagen? ¿Con qué te sientes cómodo?
  frecuencia_sostenible: string;   // ¿Cuántas veces a la semana puedes publicar de forma sostenible?
  contenido_resistente: string;    // ¿Qué tipo de contenido tuyo puede resistir al paso del tiempo?
  // Ejercicio 3: Embudo de confianza — paso a paso
  embudo_descubrimiento: string;   // ¿Cómo te descubre alguien por primera vez?
  embudo_primera_impresion: string; // ¿Qué ve cuando llega a tu perfil/web?
  embudo_confianza: string;        // ¿Cómo construyes confianza? (contenido, prueba social, newsletter...)
  embudo_conversion: string;       // ¿Cuál es el siguiente paso? (DM, llamada, registro, compra...)
  embudo_fidelizacion: string;     // ¿Cómo mantienes la relación después de la primera interacción?
  // Ejercicio 4: Conexión objetivos → estrategia
  objetivo_a_estrategia_1: string; // Objetivo 1 del Nivel 2 → ¿Qué acciones concretas lo logran?
  objetivo_a_estrategia_2: string; // Objetivo 2 → acciones
  objetivo_a_estrategia_3: string; // Objetivo 3 → acciones
  // Ejercicio 5: Resistencia al algoritmo
  resistencia_que_no_haras: string;   // ¿Qué tendencias o prácticas no vas a seguir, aunque funcionen?
  resistencia_tu_diferencia: string;  // ¿Qué vas a hacer diferente al resto de tu sector?
  resistencia_compromiso: string;     // Tu compromiso: ¿qué tipo de creador/profesional quieres ser?
}

// Nivel 4 — Resultados, métricas y buena vida
export interface Nivel4Data {
  // Ejercicio 1: Métricas visibles (tabla)
  metrica_visible_1: string;       // Métrica visible #1 (ej: seguidores, ingresos, clientes)
  metrica_visible_1_actual: string; // Valor actual
  metrica_visible_1_meta: string;  // Meta a 12 meses
  metrica_visible_2: string;
  metrica_visible_2_actual: string;
  metrica_visible_2_meta: string;
  metrica_visible_3: string;
  metrica_visible_3_actual: string;
  metrica_visible_3_meta: string;
  // Ejercicio 2: Métricas invisibles
  metrica_inv_paz_mental: string;     // ¿Cómo está tu paz mental ahora? ¿Cómo la quieres?
  metrica_inv_coherencia: string;     // ¿Vives en coherencia con tus valores del Nivel 1?
  metrica_inv_relaciones: string;     // ¿Cómo son tus relaciones profesionales y personales?
  metrica_inv_energia: string;        // ¿Tu trabajo te da energía o te la quita?
  metrica_inv_legado: string;         // ¿Estás construyendo algo que trasciende?
  // Ejercicio 3: Indicadores de buena vida (conecta con Cap III)
  indicador_bv_1: string;          // Indicador de buena vida #1
  indicador_bv_2: string;
  indicador_bv_3: string;
  indicador_bv_cumple: string;     // ¿Estás viviendo tu buena vida tal como la definiste?
  indicador_bv_distancia: string;  // ¿Qué te separa de ella ahora mismo?
  // Ejercicio 4: Revisión de tu pirámide completa
  revision_bajo_tierra: string;    // Mirando Bajo Tierra: ¿Hay algo que necesites trabajar?
  revision_nivel_1: string;        // Mirando Nivel 1: ¿Tu identidad está clara y alineada?
  revision_nivel_2: string;        // Mirando Nivel 2: ¿Tu mercado y objetivos siguen vigentes?
  revision_nivel_3: string;        // Mirando Nivel 3: ¿Tu estrategia funciona o necesitas pivotar?
  revision_decision: string;       // ¿Qué decisión llevas posponiendo que necesitas tomar?
  // Ejercicio 5: Tu compromiso final
  compromiso_frase: string;        // Escribe tu compromiso contigo mismo en una frase
  compromiso_primer_paso: string;  // ¿Cuál es el primer paso que vas a dar mañana?
  compromiso_recordatorio: string; // ¿Qué frase quieres que te recuerde por qué haces todo esto?
}

export interface PiramideData {
  id: string;
  user_id: string;
  current_step: PiramideStep;
  steps_completed: PiramideStep[];
  prologo: PrologoData;
  mentalidad: MentalidadData;
  buena_vida: BuenaVidaData;
  bajo_tierra: BajoTierraData;
  nivel_1: Nivel1Data;
  nivel_2: Nivel2Data;
  nivel_3: Nivel3Data;
  nivel_4: Nivel4Data;
  created_at: string;
  updated_at: string;
}

export const DEFAULT_PIRAMIDE: Omit<PiramideData, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  current_step: 'prologo',
  steps_completed: [],
  prologo: { el_comienzo: '', los_nudos: '', las_semillas: '', la_proyeccion: '' },
  mentalidad: { que_sienta: '', elementos_centro: '', valores_ambiente: '', que_recuerden: '' },
  buena_vida: { definiendo_buena_vida: '', espacios_resonancia: '', relacion_trabajo: '', definicion_exito: '', principios_guia: '', brujula_emocional: '', recordatorio_personal: '' },
  bajo_tierra: {
    historia_infancia: '', historia_formacion: '', historia_fracasos: '', historia_victorias: '',
    creencia_sobre_ti: '', creencia_sobre_dinero: '', creencia_sobre_exito: '', creencia_sobre_exposicion: '', creencia_sobre_vender: '',
    limitante_1: '', limitante_1_origen: '', limitante_1_alternativa: '',
    limitante_2: '', limitante_2_origen: '', limitante_2_alternativa: '',
    limitante_3: '', limitante_3_origen: '', limitante_3_alternativa: '',
    potenciadora_1: '', potenciadora_2: '', potenciadora_3: '', que_dicen_de_ti: '',
    combinacion_unica: '', que_haces_diferente: '', tu_superpoder: '',
    espejo_diez_anos: '', espejo_futuro: '',
  },
  nivel_1: {
    valor_1: '', valor_1_significado: '', valor_1_ejemplo: '',
    valor_2: '', valor_2_significado: '', valor_2_ejemplo: '',
    valor_3: '', valor_3_significado: '', valor_3_ejemplo: '',
    valor_4: '', valor_4_significado: '', valor_4_ejemplo: '',
    valor_5: '', valor_5_significado: '', valor_5_ejemplo: '',
    proposito_superficie: '', proposito_porque_1: '', proposito_porque_2: '', proposito_porque_3: '', proposito_porque_4: '', proposito_porque_5: '', proposito_destilado: '',
    vision_dia_perfecto: '', vision_profesional: '', vision_personal: '', vision_impacto: '',
    bandera_1: '', bandera_2: '', bandera_3: '', bandera_4: '', bandera_5: '', banderas_experiencia: '',
    identidad_sin_cargo: '', identidad_frase: '',
    coherencia_acciones: '', coherencia_grietas: '', coherencia_ajuste: '',
  },
  nivel_2: {
    audiencia_nombre: '', audiencia_edad_contexto: '', audiencia_frustracion: '', audiencia_deseo: '', audiencia_objecion: '', audiencia_donde_esta: '', audiencia_lenguaje: '',
    pv_ayudo_a: '', pv_a_conseguir: '', pv_a_traves_de: '', pv_sin_necesidad: '', pv_frase_completa: '', pv_por_que_tu: '',
    obj_pasional: '', obj_pasional_sec_1: '', obj_pasional_sec_1_kpi: '', obj_pasional_sec_2: '', obj_pasional_sec_2_kpi: '', obj_pasional_sec_3: '', obj_pasional_sec_3_kpi: '',
    obj_referencia: '', obj_referencia_sec_1: '', obj_referencia_sec_1_kpi: '', obj_referencia_sec_2: '', obj_referencia_sec_2_kpi: '', obj_referencia_sec_3: '', obj_referencia_sec_3_kpi: '',
    obj_economico: '', obj_economico_sec_1: '', obj_economico_sec_1_kpi: '', obj_economico_sec_2: '', obj_economico_sec_2_kpi: '', obj_economico_sec_3: '', obj_economico_sec_3_kpi: '',
    conexion_propuesta_audiencia: '', conexion_objetivos_coherencia: '', conexion_que_falta: '',
  },
  nivel_3: {
    canal_1_nombre: '', canal_1_por_que: '', canal_1_estrategia: '', canal_1_objetivo: '',
    canal_2_nombre: '', canal_2_por_que: '', canal_2_estrategia: '', canal_2_objetivo: '',
    canal_3_nombre: '', canal_3_por_que: '', canal_3_estrategia: '', canal_3_objetivo: '',
    pilar_1: '', pilar_2: '', pilar_3: '', formato_preferido: '', frecuencia_sostenible: '', contenido_resistente: '',
    embudo_descubrimiento: '', embudo_primera_impresion: '', embudo_confianza: '', embudo_conversion: '', embudo_fidelizacion: '',
    objetivo_a_estrategia_1: '', objetivo_a_estrategia_2: '', objetivo_a_estrategia_3: '',
    resistencia_que_no_haras: '', resistencia_tu_diferencia: '', resistencia_compromiso: '',
  },
  nivel_4: {
    metrica_visible_1: '', metrica_visible_1_actual: '', metrica_visible_1_meta: '',
    metrica_visible_2: '', metrica_visible_2_actual: '', metrica_visible_2_meta: '',
    metrica_visible_3: '', metrica_visible_3_actual: '', metrica_visible_3_meta: '',
    metrica_inv_paz_mental: '', metrica_inv_coherencia: '', metrica_inv_relaciones: '', metrica_inv_energia: '', metrica_inv_legado: '',
    indicador_bv_1: '', indicador_bv_2: '', indicador_bv_3: '', indicador_bv_cumple: '', indicador_bv_distancia: '',
    revision_bajo_tierra: '', revision_nivel_1: '', revision_nivel_2: '', revision_nivel_3: '', revision_decision: '',
    compromiso_frase: '', compromiso_primer_paso: '', compromiso_recordatorio: '',
  },
};

// Step configuration for the Pirámide experience
export type PiramideFieldType = 'textarea' | 'short' | 'table_row';

export interface PiramideField {
  key: string;
  label: string;
  placeholder: string;
  hint?: string;
  type?: PiramideFieldType; // defaults to 'textarea'
}

export interface PiramideExercise {
  title: string;
  description?: string;
  theoryLink?: string; // URL a la comunidad Skool con la teoría
  fields: PiramideField[];
  layout?: 'default' | 'table' | 'objectives'; // rendering layout
  tableHeaders?: string[];      // headers para layout table
}

export interface PiramideStepConfig {
  id: PiramideStep;
  label: string;
  title: string;
  icon: string;
  tagline: string;
  intro: string;
  level: 'preparacion' | 'piramide';
  exercises: PiramideExercise[];
  // Legacy support — flat fields computed from exercises
  fields: PiramideField[];
}

// Helper: build flat fields from exercises
function buildFlatFields(exercises: PiramideExercise[]): PiramideField[] {
  return exercises.flatMap((ex) => ex.fields);
}

const THEORY_URL = 'https://www.skool.com/una-buena-vida-comunidad-2471/classroom/24c4710c?md=7daa9e990c64473b9ee1de3969644264';

// ===== STEP DEFINITIONS =====

const PROLOGO_EXERCISES: PiramideExercise[] = [
  {
    title: 'Cuéntate tu historia',
    description: 'Este es un mapa emocional, una declaración de intenciones, un ejercicio de memoria, gratitud y proyección. Si lo haces con sinceridad, verás que el resto de esta formación será mucho más clara y transformadora. Porque sabrás desde dónde partes. Y si alguna vez te pierdes, vuelve aquí.',
    theoryLink: THEORY_URL,
    fields: [
      { key: 'el_comienzo', label: 'El comienzo', placeholder: '¿De dónde vienes? ¿Cómo era tu infancia? ¿Qué aprendiste de tu entorno, tus referentes, tus heridas? ¿Qué es lo primero que recuerdas que te emocionaba o te hacía sentirte tú? ¿Hay algún fuego que te guíe desde pequeño?', hint: 'Hay un fuego que te guía desde pequeño. Encuéntralo.' },
      { key: 'los_nudos', label: 'Los nudos del viaje', placeholder: '¿Qué momentos marcaron tu vida? ¿Cuándo sentiste que estabas perdido, cambiado, roto, o a punto de rendirte? ¿Qué decisiones te han traído hasta aquí? ¿Qué batallas has librado contigo mismo o con el mundo?', hint: 'Las batallas que has librado contigo mismo o con el mundo te han moldeado.' },
      { key: 'las_semillas', label: 'Las semillas que has sembrado', placeholder: '¿Qué sabes hacer hoy? ¿Qué te apasiona, qué te interesa, qué causas te mueven? ¿Qué has aprendido de ti en estos últimos años? ¿Qué legado ya has comenzado a construir sin saberlo?', hint: 'Todo lo que has aprendido de ti en estos últimos años.' },
      { key: 'la_proyeccion', label: 'La proyección', placeholder: '¿Qué tipo de vida quieres construir? ¿Qué significa para ti una buena vida? ¿Qué tipo de pirámide deseas dejar como símbolo de tu paso por este mundo? ¿Para quién lo haces?', hint: '¿Para quién lo haces?' },
    ],
  },
];

const MENTALIDAD_EXERCISES: PiramideExercise[] = [
  {
    title: 'Diseña tu escaparate personal',
    description: 'Tu marca personal es el escaparate de tu talento, tus atributos y también tus defectos. Tu misión es saber identificarlos, ordenarlos y ponerlos en el lugar adecuado en pro de tus objetivos.',
    theoryLink: THEORY_URL,
    fields: [
      { key: 'que_sienta', label: '¿Qué quieres que la gente sienta al mirar tu escaparate?', placeholder: '¿Confianza? ¿Curiosidad? ¿Inspiración? ¿Cercanía? Escribe al menos tres palabras que definan esa atmósfera emocional.', hint: 'Piensa en la emoción o sensaciones que provocarías en alguien que te ve por primera vez.' },
      { key: 'elementos_centro', label: '¿Qué elementos colocas en el centro del escaparate?', placeholder: '¿Qué talentos, experiencias, habilidades o pasiones deben estar siempre visibles en tu marca? Lista entre tres y cinco elementos.', hint: 'El corazón de tu propuesta. Lo que te representa y debe ser reconocible a simple vista.' },
      { key: 'valores_ambiente', label: '¿Qué valores se respiran en el ambiente?', placeholder: 'Más allá de lo que se ve, ¿qué principios deberían sentirse al mirar tu escaparate? Enumera entre dos y cuatro valores.', hint: 'Lo que guiará tus decisiones, incluso cuando no se enuncie.' },
      { key: 'que_recuerden', label: '¿Qué quieres que la gente recuerde después de verlo?', placeholder: 'Imagina que la persona sigue su camino. ¿Qué idea, frase o imagen debería permanecer en su memoria?', hint: 'Una frase breve o un concepto que resuma el impacto que deseas dejar.' },
    ],
  },
];

const BUENA_VIDA_EXERCISES: PiramideExercise[] = [
  {
    title: 'Ejercicio de reflexión: Éxito y Buena Vida',
    description: 'Este ejercicio no es para hacerlo rápido. Busca un momento tranquilo, sin interrupciones. Responde sin filtro. No hay respuestas buenas o malas, solo las que te acerquen a ti mismo.',
    theoryLink: THEORY_URL,
    fields: [
      { key: 'definiendo_buena_vida', label: '1. Definiendo la buena vida', placeholder: 'Imagina que tienes todo resuelto: dinero, tiempo y salud.\n\n¿Cómo es un día normal en esa vida ideal?\n¿Con quién compartes tu tiempo?\n¿Dónde estás viviendo?\n¿Qué estás haciendo que te hace sentir pleno/a?\n¿Qué estás evitando conscientemente?', hint: '¿Qué estás evitando conscientemente en esa vida ideal?' },
      { key: 'espacios_resonancia', label: '2. Tus espacios de resonancia', placeholder: 'La paz no se encuentra, se recuerda. ¿Dónde la has sentido antes?\n\n¿Cuándo fue la última vez que sentiste paz mental?\n¿Qué estabas haciendo?\n¿Qué elementos había en ese momento que puedes replicar hoy?\n¿Qué decisiones te alejan de esa paz?', hint: '¿Qué decisiones te alejan de esa paz?' },
      { key: 'relacion_trabajo', label: '3. Tu relación con el trabajo', placeholder: 'El trabajo es parte de la vida, pero no toda la vida.\n\n¿Qué parte de tu trabajo actual te llena? ¿Qué parte te vacía?\n¿Podrías vivir tu buena vida con tu trabajo actual? ¿Qué tendrías que ajustar?\n¿Te da libertad o te la quita?', hint: 'El trabajo es parte de la vida, pero no toda la vida.' },
      { key: 'definicion_exito', label: '4. Tu definición de éxito', placeholder: 'Olvida lo que te han contado. Piensa en lo que te importa de verdad.\n\n¿Qué significa para ti tener éxito?\n¿A quién admiras y por qué? (No solo en lo profesional)\n¿Qué indicadores (externos o internos) te dirían que estás viviendo tu definición de éxito?\n¿Estás más cerca o más lejos que hace un año?', hint: '¿Estás más cerca o más lejos que hace un año?' },
      { key: 'principios_guia', label: '5. Tus principios guía', placeholder: 'Cuando todo se tambalea, tus valores te sostienen.\n\n¿Qué valores son innegociables para ti en tu trabajo y en tu vida?\n¿Qué decisiones tomaste en contra de ellos y qué aprendiste?\n¿Qué decisiones futuras se te harían más fáciles si tienes estos principios claros?', hint: 'Cuando todo se tambalea, tus valores te sostienen.' },
      { key: 'brujula_emocional', label: '6. Tu brújula emocional', placeholder: 'No basta con subir, hay que saber hacia dónde.\n\n¿Qué emociones quieres sentir con frecuencia?\n¿Qué tipo de relaciones quieres tener a tu alrededor?\n¿Qué tipo de impacto te gustaría dejar en los demás?', hint: 'No basta con subir, hay que saber hacia dónde.' },
      { key: 'recordatorio_personal', label: '7. Tu recordatorio personal', placeholder: 'Cuando llegues arriba, no olvides por qué empezaste.\n\nEscribe una frase que quieras tener presente cuando estés en lo alto de tu pirámide. Algo que puedas volver a leer cuando tengas dudas. Algo que te devuelva a ti.', hint: 'Cuando llegues arriba, no olvides por qué empezaste.' },
    ],
  },
];

const BAJO_TIERRA_EXERCISES: PiramideExercise[] = [
  {
    title: 'Ejercicio 1: Tu historia subterránea',
    description: 'Las broncas que te echaba tu padre por suspender, las veces que fracasaste o triunfaste en el amor, tu relación con tu abuelo o aquella frase que te dijo una vez un amigo, forman parte de lo que está bajo tierra. Lo que no se ve, pero sostiene todo.',
    theoryLink: THEORY_URL,
    fields: [
      { key: 'historia_infancia', label: '¿Qué aprendiste en casa?', placeholder: '¿Qué valores o carencias heredaste de tu familia? ¿Qué se premiaba y qué se castigaba? ¿Qué patrones reconoces hoy que vienen de entonces?' },
      { key: 'historia_formacion', label: 'Tus experiencias formativas', placeholder: '¿Qué estudios, trabajos, relaciones o viajes te moldearon de forma definitiva? ¿Qué te enseñaron sobre ti mismo?' },
      { key: 'historia_fracasos', label: 'Tus fracasos más importantes', placeholder: '¿Cuáles han sido tus mayores fracasos? No los resumas — descríbelos. ¿Qué sentiste? ¿Qué aprendiste? ¿Qué cambió en ti después?' },
      { key: 'historia_victorias', label: 'Tus victorias silenciosas', placeholder: '¿Qué logros te hacen sentir orgulloso — aunque nadie los conozca? ¿Qué superaste que parecía imposible? ¿Qué te demostró que eras capaz?' },
    ],
  },
  {
    title: 'Ejercicio 2: Mapa de creencias',
    description: 'Tu sistema de creencias con el dinero determina tu habilidad para ganarlo, gastarlo o ahorrarlo. Lo mismo pasa con el éxito, la exposición y la venta. Identificar estas creencias es el primer paso para transformarlas.',
    theoryLink: THEORY_URL,
    fields: [
      { key: 'creencia_sobre_ti', label: '¿Qué crees sobre ti mismo?', placeholder: 'Ej: "Soy bueno en...", "No soy capaz de...", "La gente me ve como...", "No merezco..."', type: 'short' as PiramideFieldType },
      { key: 'creencia_sobre_dinero', label: '¿Qué crees sobre el dinero?', placeholder: 'Ej: "El dinero es difícil de ganar", "Los ricos son...", "Cobrar por lo que sé es..."', type: 'short' as PiramideFieldType },
      { key: 'creencia_sobre_exito', label: '¿Qué crees sobre el éxito?', placeholder: 'Ej: "El éxito requiere sacrificarlo todo", "Solo unos pocos lo consiguen", "El éxito es..."', type: 'short' as PiramideFieldType },
      { key: 'creencia_sobre_exposicion', label: '¿Qué crees sobre exponerte públicamente?', placeholder: 'Ej: "Si me expongo me van a criticar", "No tengo nada interesante que decir", "La gente no quiere oír sobre..."', type: 'short' as PiramideFieldType },
      { key: 'creencia_sobre_vender', label: '¿Qué crees sobre vender o promocionarte?', placeholder: 'Ej: "Vender es de vendemotos", "Si soy bueno, vendrán solos", "Promocionarme es ser arrogante"', type: 'short' as PiramideFieldType },
    ],
  },
  {
    title: 'Ejercicio 3: Transformación de creencias',
    description: 'De todo lo que encuentras bajo tierra, lo único que puedes modificar son tus creencias. Identifica las tres que más te limitan, busca su origen y escribe la creencia alternativa que quieres adoptar.',
    fields: [
      { key: 'limitante_1', label: 'Creencia limitante #1', placeholder: 'Escribe una creencia que te frena...', type: 'short' as PiramideFieldType },
      { key: 'limitante_1_origen', label: '¿De dónde viene?', placeholder: '¿Quién te la enseñó? ¿Qué experiencia la creó?', type: 'short' as PiramideFieldType },
      { key: 'limitante_1_alternativa', label: 'Creencia alternativa', placeholder: '¿Qué podrías creer en su lugar que te impulse?', type: 'short' as PiramideFieldType },
      { key: 'limitante_2', label: 'Creencia limitante #2', placeholder: 'Escribe otra creencia que te frena...', type: 'short' as PiramideFieldType },
      { key: 'limitante_2_origen', label: '¿De dónde viene?', placeholder: '¿Quién te la enseñó? ¿Qué experiencia la creó?', type: 'short' as PiramideFieldType },
      { key: 'limitante_2_alternativa', label: 'Creencia alternativa', placeholder: '¿Qué podrías creer en su lugar?', type: 'short' as PiramideFieldType },
      { key: 'limitante_3', label: 'Creencia limitante #3', placeholder: 'Una más...', type: 'short' as PiramideFieldType },
      { key: 'limitante_3_origen', label: '¿De dónde viene?', placeholder: '¿Quién te la enseñó? ¿Qué experiencia la creó?', type: 'short' as PiramideFieldType },
      { key: 'limitante_3_alternativa', label: 'Creencia alternativa', placeholder: '¿Qué podrías creer en su lugar?', type: 'short' as PiramideFieldType },
    ],
  },
  {
    title: 'Ejercicio 4: Tus fortalezas y lo que otros ven en ti',
    description: 'Tus creencias potenciadoras son los cimientos invisibles de tu pirámide. Y a veces, lo que otros ven en ti es más revelador que lo que tú ves en el espejo.',
    fields: [
      { key: 'potenciadora_1', label: 'Creencia potenciadora #1', placeholder: '¿Qué crees firmemente que te impulsa? Ej: "Soy capaz de aprender cualquier cosa", "Siempre encuentro soluciones"', type: 'short' as PiramideFieldType },
      { key: 'potenciadora_2', label: 'Creencia potenciadora #2', placeholder: 'Otra verdad profunda que te da fuerza...', type: 'short' as PiramideFieldType },
      { key: 'potenciadora_3', label: 'Creencia potenciadora #3', placeholder: 'Una más...', type: 'short' as PiramideFieldType },
      { key: 'que_dicen_de_ti', label: '¿Qué dicen de ti las personas que te conocen bien?', placeholder: 'Pregunta a 3-5 personas cercanas: "¿En qué dirías que soy bueno? ¿Qué me hace diferente?". Recoge aquí sus respuestas.', hint: 'Si no lo has preguntado aún, es un gran ejercicio. Envía un mensaje ahora y vuelve después.' },
    ],
  },
  {
    title: 'Ejercicio 5: Tu unicidad — Teoría de los sistemas complejos',
    description: 'La Teoría de los sistemas complejos dice que cada persona es un sistema único e irrepetible. Nadie puede conseguir lo mismo que tú haciendo exactamente los mismos pasos. Tu camino hacia la buena vida es solamente tuyo.',
    theoryLink: THEORY_URL,
    fields: [
      { key: 'combinacion_unica', label: '¿Cuál es tu combinación irrepetible?', placeholder: '¿Qué mezcla de experiencias, talentos, conocimientos y formas de ver el mundo tienes que nadie más tiene exactamente igual?' },
      { key: 'que_haces_diferente', label: '¿Qué haces de una forma que nadie más hace?', placeholder: 'Piensa en tu manera de trabajar, de comunicar, de resolver problemas. ¿Qué es lo tuyo?', type: 'short' as PiramideFieldType },
      { key: 'tu_superpoder', label: 'Si tuvieras un superpoder profesional, ¿cuál sería?', placeholder: 'Esa habilidad que parece natural en ti pero que otros admiran o envidian.', type: 'short' as PiramideFieldType },
    ],
  },
  {
    title: 'Ejercicio 6: El espejo interior',
    description: 'Un último ejercicio para cerrar lo que está bajo tierra. Mírate con honestidad.',
    fields: [
      { key: 'espejo_diez_anos', label: '¿Qué pensaría tu yo de 10 años al verte hoy?', placeholder: '¿Se sentiría orgulloso? ¿Sorprendido? ¿Decepcionado? ¿Qué le dirías?' },
      { key: 'espejo_futuro', label: '¿Qué necesita tu yo del futuro que empieces a hacer hoy?', placeholder: 'Imagina que tu yo de dentro de 10 años te envía un mensaje. ¿Qué te pide que hagas ya?', hint: 'No se trata de ser perfecto. Se trata de ser consciente.' },
    ],
  },
];

const NIVEL_1_EXERCISES: PiramideExercise[] = [
  {
    title: 'Ejercicio 1: Tus 5 valores innegociables',
    description: 'Construir tu marca personal sin una buena base asentada en tu identidad significa construir un relato que no va en coherencia con lo que de verdad eres. Asentar bien esta base es crucial.',
    theoryLink: THEORY_URL,
    fields: [
      { key: 'valor_1', label: 'Valor #1', placeholder: 'Ej: Honestidad, libertad, familia, creatividad...', type: 'short' as PiramideFieldType },
      { key: 'valor_1_significado', label: '¿Qué significa este valor para ti en la práctica?', placeholder: '¿Cómo se traduce en acciones concretas en tu día a día?', type: 'short' as PiramideFieldType },
      { key: 'valor_1_ejemplo', label: '¿Cuándo lo has demostrado con acciones?', placeholder: 'Un momento concreto en que este valor guió tu decisión.', type: 'short' as PiramideFieldType },
      { key: 'valor_2', label: 'Valor #2', placeholder: '', type: 'short' as PiramideFieldType },
      { key: 'valor_2_significado', label: '¿Qué significa para ti?', placeholder: '', type: 'short' as PiramideFieldType },
      { key: 'valor_2_ejemplo', label: '¿Cuándo lo demostraste?', placeholder: '', type: 'short' as PiramideFieldType },
      { key: 'valor_3', label: 'Valor #3', placeholder: '', type: 'short' as PiramideFieldType },
      { key: 'valor_3_significado', label: '¿Qué significa para ti?', placeholder: '', type: 'short' as PiramideFieldType },
      { key: 'valor_3_ejemplo', label: '¿Cuándo lo demostraste?', placeholder: '', type: 'short' as PiramideFieldType },
      { key: 'valor_4', label: 'Valor #4', placeholder: '', type: 'short' as PiramideFieldType },
      { key: 'valor_4_significado', label: '¿Qué significa para ti?', placeholder: '', type: 'short' as PiramideFieldType },
      { key: 'valor_4_ejemplo', label: '¿Cuándo lo demostraste?', placeholder: '', type: 'short' as PiramideFieldType },
      { key: 'valor_5', label: 'Valor #5', placeholder: '', type: 'short' as PiramideFieldType },
      { key: 'valor_5_significado', label: '¿Qué significa para ti?', placeholder: '', type: 'short' as PiramideFieldType },
      { key: 'valor_5_ejemplo', label: '¿Cuándo lo demostraste?', placeholder: '', type: 'short' as PiramideFieldType },
    ],
  },
  {
    title: 'Ejercicio 2: Los 5 porqués del propósito',
    description: 'Profundiza hasta llegar a tu propósito real. Empieza por lo superficial y ve profundizando capa a capa hasta encontrar lo que de verdad te mueve. El propósito no tiene que ser grandioso. Tiene que ser tuyo.',
    theoryLink: THEORY_URL,
    fields: [
      { key: 'proposito_superficie', label: '¿A qué te dedicas?', placeholder: 'La respuesta superficial, la que le dices a cualquiera.', type: 'short' as PiramideFieldType },
      { key: 'proposito_porque_1', label: '¿Por qué haces esto?', placeholder: 'Primera capa. ¿Por qué elegiste este camino?', type: 'short' as PiramideFieldType },
      { key: 'proposito_porque_2', label: '¿Y por qué es eso importante para ti?', placeholder: 'Segunda capa. Ve más profundo.', type: 'short' as PiramideFieldType },
      { key: 'proposito_porque_3', label: '¿Y por qué importa eso?', placeholder: 'Tercera capa. Aquí empiezas a acercarte.', type: 'short' as PiramideFieldType },
      { key: 'proposito_porque_4', label: '¿Y eso por qué te mueve?', placeholder: 'Cuarta capa. La emoción ya debería aparecer.', type: 'short' as PiramideFieldType },
      { key: 'proposito_porque_5', label: '¿Y al final... para qué?', placeholder: 'Quinta capa. Aquí está tu propósito real.', type: 'short' as PiramideFieldType },
      { key: 'proposito_destilado', label: 'Tu propósito en una sola frase', placeholder: 'Destila todo lo anterior en una frase potente que te represente.', hint: 'Esta frase debería darte escalofríos. Si no, sigue profundizando.' },
    ],
  },
  {
    title: 'Ejercicio 3: Visión — Tu día perfecto en 5 años',
    description: 'Proyecta tu visión como un ideal que te sirva de motor, no como objetivo rígido. Describe con detalle para que sea tangible.',
    fields: [
      { key: 'vision_dia_perfecto', label: 'Describe un día perfecto dentro de 5 años', placeholder: 'Con todo detalle: ¿dónde te despiertas? ¿qué haces por la mañana? ¿con quién estás? ¿qué trabajo haces? ¿cómo termina el día?' },
      { key: 'vision_profesional', label: '¿Qué estás haciendo profesionalmente?', placeholder: '¿Qué proyectos llevas? ¿Con quién trabajas? ¿Cómo es tu día de trabajo?', type: 'short' as PiramideFieldType },
      { key: 'vision_personal', label: '¿Cómo es tu vida personal?', placeholder: '¿Dónde vives? ¿Cómo son tus relaciones? ¿Qué hobbies tienes? ¿Cómo cuidas tu salud?', type: 'short' as PiramideFieldType },
      { key: 'vision_impacto', label: '¿Qué impacto estás teniendo en los demás?', placeholder: '¿A cuántas personas ayudas? ¿Cómo se transforma su vida gracias a ti?', type: 'short' as PiramideFieldType },
    ],
  },
  {
    title: 'Ejercicio 4: Tus banderas rojas',
    description: 'Las líneas que no cruzas te definen tanto como las que sí. En la marca personal, saber decir "no" es tan importante como saber decir "sí".',
    fields: [
      { key: 'bandera_1', label: 'Línea que no cruzo #1', placeholder: 'Ej: "No trabajo con clientes que no respetan mi tiempo"', type: 'short' as PiramideFieldType },
      { key: 'bandera_2', label: 'Línea que no cruzo #2', placeholder: 'Ej: "No promociono productos en los que no creo"', type: 'short' as PiramideFieldType },
      { key: 'bandera_3', label: 'Línea que no cruzo #3', placeholder: 'Ej: "No sacrifico mi salud por un proyecto"', type: 'short' as PiramideFieldType },
      { key: 'bandera_4', label: 'Línea que no cruzo #4', placeholder: '', type: 'short' as PiramideFieldType },
      { key: 'bandera_5', label: 'Línea que no cruzo #5', placeholder: '', type: 'short' as PiramideFieldType },
      { key: 'banderas_experiencia', label: '¿Alguna vez cruzaste alguna de estas líneas?', placeholder: '¿Qué pasó cuando lo hiciste? ¿Qué aprendiste?', hint: 'Las experiencias negativas son los mejores maestros para definir tus límites.' },
    ],
  },
  {
    title: 'Ejercicio 5: Tu identidad sin cargo',
    description: 'Tu marca personal no es un personaje que interpretas — es la expresión consciente y estratégica de tu identidad auténtica en el mundo. Solo si reconoces, respetas y valoras tu identidad, podrás defenderla cuando vengan las olas.',
    fields: [
      { key: 'identidad_sin_cargo', label: 'Preséntate sin usar tu profesión ni tu cargo', placeholder: 'Si tuvieras que presentarte en una cena sin poder mencionar a qué te dedicas, ¿qué dirías? ¿Cómo te defines de verdad?' },
      { key: 'identidad_frase', label: 'Tu identidad en una frase', placeholder: 'Completa: "Soy alguien que..."', hint: 'Esta frase debería funcionar en cualquier contexto de tu vida.', type: 'short' as PiramideFieldType },
    ],
  },
  {
    title: 'Ejercicio 6: Test de coherencia',
    description: 'Antes de seguir construyendo, comprueba que los cimientos están alineados. La falta de coherencia entre lo que dices ser y lo que haces es la grieta más peligrosa de cualquier marca personal.',
    fields: [
      { key: 'coherencia_acciones', label: '¿Tus acciones diarias reflejan tus valores?', placeholder: 'Repasa tus 5 valores del ejercicio anterior. ¿Cuántos de ellos están presentes en tu día a día de forma real?', type: 'short' as PiramideFieldType },
      { key: 'coherencia_grietas', label: '¿Dónde hay grietas entre lo que dices y lo que haces?', placeholder: 'Sé honesto. ¿En qué áreas dices una cosa pero haces otra? ¿Dónde hay incoherencia?' },
      { key: 'coherencia_ajuste', label: '¿Qué necesitas ajustar para vivir más alineado?', placeholder: '¿Qué pequeño cambio puedes hacer esta semana para cerrar una de esas grietas?' },
    ],
  },
];

const NIVEL_2_EXERCISES: PiramideExercise[] = [
  {
    title: 'Ejercicio 1: Tu audiencia como persona real',
    description: 'Tu mayor enemigo será la ilusión de las masas. La falsa creencia de que debes conquistar a cientos de miles de personas. No es cierto. Solo necesitas una sala de cien personas que te necesiten de verdad. Describe a UNA persona concreta.',
    theoryLink: THEORY_URL,
    fields: [
      { key: 'audiencia_nombre', label: 'Dale un nombre a tu cliente ideal', placeholder: 'Un nombre ficticio que te ayude a humanizarle. Ej: "Laura"', type: 'short' as PiramideFieldType },
      { key: 'audiencia_edad_contexto', label: 'Edad, situación vital y contexto profesional', placeholder: '¿Cuántos años tiene? ¿Trabaja por cuenta propia o ajena? ¿Tiene familia? ¿En qué momento vital está?', type: 'short' as PiramideFieldType },
      { key: 'audiencia_frustracion', label: '¿Qué le frustra? ¿Qué problema tiene que no ha resuelto?', placeholder: '¿Qué le quita el sueño? ¿Qué ha intentado que no le ha funcionado? ¿Por qué sigue atascado/a?' },
      { key: 'audiencia_deseo', label: '¿Qué desea profundamente?', placeholder: '¿Qué resultado quiere conseguir? ¿Cómo sería su vida ideal si resolviese su problema?', type: 'short' as PiramideFieldType },
      { key: 'audiencia_objecion', label: '¿Por qué no lo ha conseguido aún?', placeholder: '¿Qué objeciones tiene? ¿Qué le frena? ¿Qué miedos le paralizan? ¿Qué excusas se pone?', type: 'short' as PiramideFieldType },
      { key: 'audiencia_donde_esta', label: '¿Dónde pasa el tiempo?', placeholder: '¿Qué redes sociales usa? ¿Qué podcasts escucha? ¿A quién sigue? ¿Qué eventos frecuenta?', type: 'short' as PiramideFieldType },
      { key: 'audiencia_lenguaje', label: '¿Cómo habla?', placeholder: '¿Qué palabras usa para describir su problema? ¿Cómo le contaría a un amigo lo que necesita?', type: 'short' as PiramideFieldType },
    ],
  },
  {
    title: 'Ejercicio 2: Propuesta de valor — La fórmula',
    description: 'Tu propuesta de valor conecta lo que sabes hacer mejor con lo que tu audiencia necesita desesperadamente. Completa cada parte de la fórmula por separado y luego escribe la frase completa.',
    theoryLink: THEORY_URL,
    fields: [
      { key: 'pv_ayudo_a', label: 'Ayudo a...', placeholder: '¿A qué tipo de persona? (usa el perfil del ejercicio anterior)', type: 'short' as PiramideFieldType },
      { key: 'pv_a_conseguir', label: '...a conseguir...', placeholder: '¿Qué resultado concreto y medible?', type: 'short' as PiramideFieldType },
      { key: 'pv_a_traves_de', label: '...a través de...', placeholder: '¿Tu método, enfoque o proceso único?', type: 'short' as PiramideFieldType },
      { key: 'pv_sin_necesidad', label: '...sin necesidad de...', placeholder: '¿Qué es lo que odian, temen o quieren evitar?', type: 'short' as PiramideFieldType },
      { key: 'pv_frase_completa', label: 'Tu propuesta de valor completa', placeholder: 'Escríbela de corrido. Ej: "Ayudo a fisioterapeutas propietarios de clínica a facturar más de 30.000€/mes a través del método SCALE sin sacrificar su vida personal"', hint: 'Debe ser clara, concreta y generar interés en una sola lectura.' },
      { key: 'pv_por_que_tu', label: '¿Por qué tú y no otro?', placeholder: '¿Qué te diferencia de las alternativas? ¿Qué experiencia, perspectiva o método es exclusivamente tuyo?' },
    ],
  },
  {
    title: 'Ejercicio 3: Cuadro de objetivos',
    description: 'Los objetivos no son sueños — son compromisos. Cada objetivo principal tiene entre 2 y 3 objetivos secundarios, y cada secundario tiene un KPI medible. Los tres tipos de objetivo conviven para que tu marca personal sea sostenible, reconocible y auténtica.',
    theoryLink: THEORY_URL,
    layout: 'objectives',
    fields: [
      // ❤️ Objetivo pasional
      { key: 'obj_pasional', label: '❤️ Objetivo pasional', placeholder: 'Lo que te mueve por dentro. El objetivo que nace de tu propósito y tu pasión. Ej: "Ayudar a 100 personas a encontrar su camino profesional"', hint: 'Si este objetivo no te emociona, no es el correcto.' },
      { key: 'obj_pasional_sec_1', label: 'Objetivo secundario 1', placeholder: 'Ej: Crear una comunidad activa de marca personal', type: 'short' as PiramideFieldType },
      { key: 'obj_pasional_sec_1_kpi', label: 'KPI', placeholder: 'Ej: 100 miembros activos en 6 meses', type: 'short' as PiramideFieldType },
      { key: 'obj_pasional_sec_2', label: 'Objetivo secundario 2', placeholder: 'Ej: Publicar contenido de valor semanal', type: 'short' as PiramideFieldType },
      { key: 'obj_pasional_sec_2_kpi', label: 'KPI', placeholder: 'Ej: 2 posts/semana con >5% engagement', type: 'short' as PiramideFieldType },
      { key: 'obj_pasional_sec_3', label: 'Objetivo secundario 3 (opcional)', placeholder: '', type: 'short' as PiramideFieldType },
      { key: 'obj_pasional_sec_3_kpi', label: 'KPI', placeholder: '', type: 'short' as PiramideFieldType },
      // ⭐ Objetivo de referencia
      { key: 'obj_referencia', label: '⭐ Objetivo de referencia', placeholder: 'Cómo quieres que te perciban. El posicionamiento que buscas. Ej: "Ser el referente en marca personal con propósito en España"', hint: 'Este objetivo habla de tu reputación y autoridad.' },
      { key: 'obj_referencia_sec_1', label: 'Objetivo secundario 1', placeholder: 'Ej: Conseguir 5 colaboraciones con referentes del sector', type: 'short' as PiramideFieldType },
      { key: 'obj_referencia_sec_1_kpi', label: 'KPI', placeholder: 'Ej: 5 podcasts/entrevistas en 12 meses', type: 'short' as PiramideFieldType },
      { key: 'obj_referencia_sec_2', label: 'Objetivo secundario 2', placeholder: 'Ej: Aumentar la audiencia cualificada', type: 'short' as PiramideFieldType },
      { key: 'obj_referencia_sec_2_kpi', label: 'KPI', placeholder: 'Ej: 5.000 seguidores relevantes en 12 meses', type: 'short' as PiramideFieldType },
      { key: 'obj_referencia_sec_3', label: 'Objetivo secundario 3 (opcional)', placeholder: '', type: 'short' as PiramideFieldType },
      { key: 'obj_referencia_sec_3_kpi', label: 'KPI', placeholder: '', type: 'short' as PiramideFieldType },
      // 💰 Objetivo económico
      { key: 'obj_economico', label: '💰 Objetivo económico', placeholder: 'La sostenibilidad de tu proyecto. Sin esto, el resto se cae. Ej: "Facturar 5.000€/mes con mi marca personal"', hint: 'Este objetivo es el que hace que tu buena vida sea viable.' },
      { key: 'obj_economico_sec_1', label: 'Objetivo secundario 1', placeholder: 'Ej: Lanzar mi primer producto digital', type: 'short' as PiramideFieldType },
      { key: 'obj_economico_sec_1_kpi', label: 'KPI', placeholder: 'Ej: 50 ventas en los primeros 3 meses', type: 'short' as PiramideFieldType },
      { key: 'obj_economico_sec_2', label: 'Objetivo secundario 2', placeholder: 'Ej: Crear un servicio de mentoría', type: 'short' as PiramideFieldType },
      { key: 'obj_economico_sec_2_kpi', label: 'KPI', placeholder: 'Ej: 10 clientes/mes a 200€', type: 'short' as PiramideFieldType },
      { key: 'obj_economico_sec_3', label: 'Objetivo secundario 3 (opcional)', placeholder: '', type: 'short' as PiramideFieldType },
      { key: 'obj_economico_sec_3_kpi', label: 'KPI', placeholder: '', type: 'short' as PiramideFieldType },
    ],
  },
  {
    title: 'Ejercicio 4: Conexión propuesta → audiencia → objetivos',
    description: 'Ahora que tienes las tres piezas del Nivel 2, comprueba que encajan entre sí. Si hay desconexión, es el momento de ajustar antes de construir la estrategia.',
    fields: [
      { key: 'conexion_propuesta_audiencia', label: '¿Tu propuesta resuelve el problema real de tu audiencia?', placeholder: 'Vuelve al perfil de tu cliente ideal y a tu propuesta de valor. ¿Encajan? ¿Tu propuesta le habla directamente? ¿Le haría decir "esto es para mí"?' },
      { key: 'conexion_objetivos_coherencia', label: '¿Tus objetivos están alineados con tu buena vida?', placeholder: 'Vuelve a tu definición de buena vida del paso anterior. ¿Tus objetivos te acercan a esa vida o te alejan? ¿Estás persiguiendo métricas que realmente importan?' },
      { key: 'conexion_que_falta', label: '¿Qué pieza falta para que todo encaje?', placeholder: '¿Hay alguna desconexión? ¿Algún ajuste necesario? ¿Qué necesitas resolver antes de avanzar al Nivel 3?', hint: 'Si aquí detectas una grieta, mejor arreglarla ahora que construir encima.' },
    ],
  },
];

const NIVEL_3_EXERCISES: PiramideExercise[] = [
  {
    title: 'Ejercicio 1: Selección de canales',
    description: 'Las estrategias de marca personal son cambiantes y se ajustan a los tiempos, la tecnología y el entorno. Elige máximo 2-3 canales donde tu audiencia realmente está y donde tú te sientes cómodo. Qué contenido hacer y cómo hacerlo te saldrá solo al concluir este apartado.',
    theoryLink: THEORY_URL,
    fields: [
      { key: 'canal_1_nombre', label: 'Canal principal', placeholder: 'Ej: Instagram, YouTube, LinkedIn, Newsletter, Podcast...', type: 'short' as PiramideFieldType },
      { key: 'canal_1_por_que', label: '¿Por qué este canal?', placeholder: '¿Tu audiencia está aquí? ¿Te sientes cómodo comunicando en este formato?', type: 'short' as PiramideFieldType },
      { key: 'canal_1_estrategia', label: '¿Qué vas a hacer aquí?', placeholder: '¿Qué tipo de contenido? ¿Con qué frecuencia? ¿Cuál es tu enfoque?', type: 'short' as PiramideFieldType },
      { key: 'canal_1_objetivo', label: '¿Qué objetivo persigues en este canal?', placeholder: 'Ej: Generar confianza, captar leads, vender, crear comunidad...', type: 'short' as PiramideFieldType },
      { key: 'canal_2_nombre', label: 'Canal secundario', placeholder: '', type: 'short' as PiramideFieldType },
      { key: 'canal_2_por_que', label: '¿Por qué este canal?', placeholder: '', type: 'short' as PiramideFieldType },
      { key: 'canal_2_estrategia', label: '¿Qué vas a hacer aquí?', placeholder: '', type: 'short' as PiramideFieldType },
      { key: 'canal_2_objetivo', label: '¿Qué objetivo persigues?', placeholder: '', type: 'short' as PiramideFieldType },
      { key: 'canal_3_nombre', label: 'Canal terciario (opcional)', placeholder: 'Solo si puedes mantenerlo de forma sostenible', type: 'short' as PiramideFieldType },
      { key: 'canal_3_por_que', label: '¿Por qué este canal?', placeholder: '', type: 'short' as PiramideFieldType },
      { key: 'canal_3_estrategia', label: '¿Qué vas a hacer aquí?', placeholder: '', type: 'short' as PiramideFieldType },
      { key: 'canal_3_objetivo', label: '¿Qué objetivo persigues?', placeholder: '', type: 'short' as PiramideFieldType },
    ],
  },
  {
    title: 'Ejercicio 2: Pilares de contenido y formato',
    description: 'Nadie debería decirte qué contenido hacer. Lo sabrás tú, que para eso eres el constructor de tu pirámide. Conocerás y te sentirás cómodo con el mensaje, el tono y el formato adecuados porque habrás hecho el trabajo previo.',
    theoryLink: THEORY_URL,
    fields: [
      { key: 'pilar_1', label: 'Pilar de contenido #1', placeholder: 'Ej: Educativo — enseñar sobre marca personal', type: 'short' as PiramideFieldType },
      { key: 'pilar_2', label: 'Pilar de contenido #2', placeholder: 'Ej: Personal — compartir mi proceso y aprendizajes', type: 'short' as PiramideFieldType },
      { key: 'pilar_3', label: 'Pilar de contenido #3', placeholder: 'Ej: Inspiracional — casos reales de transformación', type: 'short' as PiramideFieldType },
      { key: 'formato_preferido', label: '¿Con qué formato te sientes más cómodo?', placeholder: '¿Texto largo, carruseles, vídeo corto, vídeo largo, audio, imagen? ¿Qué se te da bien de forma natural?', type: 'short' as PiramideFieldType },
      { key: 'frecuencia_sostenible', label: '¿Cuántas veces a la semana puedes publicar de forma sostenible?', placeholder: 'Sé realista. Es mejor 2 veces consistentes que 7 que no puedes mantener.', type: 'short' as PiramideFieldType },
      { key: 'contenido_resistente', label: '¿Qué contenido tuyo puede resistir al paso del tiempo?', placeholder: 'Piensa en contenido que seguiría siendo valioso dentro de un año. Genera resistencia al contenido manido. Crea algo que perdure.' },
    ],
  },
  {
    title: 'Ejercicio 3: Tu embudo de confianza — paso a paso',
    description: 'Un camino de migas de pan que guíe a una persona desde que te conoce hasta que se enamora de lo que ofreces. Describe cada paso del recorrido.',
    theoryLink: THEORY_URL,
    fields: [
      { key: 'embudo_descubrimiento', label: 'Paso 1: Descubrimiento', placeholder: '¿Cómo te descubre alguien por primera vez? ¿A través de qué canal, contenido o referencia?', type: 'short' as PiramideFieldType },
      { key: 'embudo_primera_impresion', label: 'Paso 2: Primera impresión', placeholder: '¿Qué ve cuando llega a tu perfil, web o canal? ¿Qué se lleva en los primeros 10 segundos?', type: 'short' as PiramideFieldType },
      { key: 'embudo_confianza', label: 'Paso 3: Construcción de confianza', placeholder: '¿Cómo construyes confianza? ¿Contenido de valor, testimonios, newsletter, lead magnet, comunidad?', type: 'short' as PiramideFieldType },
      { key: 'embudo_conversion', label: 'Paso 4: Conversión', placeholder: '¿Cuál es el paso que da para comprarte o contratarte? ¿DM, llamada, landing, formulario?', type: 'short' as PiramideFieldType },
      { key: 'embudo_fidelizacion', label: 'Paso 5: Fidelización', placeholder: '¿Cómo mantienes la relación después? ¿Cómo conviertes un cliente en un fan que te recomienda?', type: 'short' as PiramideFieldType },
    ],
  },
  {
    title: 'Ejercicio 4: Conexión objetivos → estrategia',
    description: 'Cada objetivo del Nivel 2 necesita acciones concretas del Nivel 3. Conecta tus objetivos con la estrategia que los hará posibles.',
    fields: [
      { key: 'objetivo_a_estrategia_1', label: 'Objetivo principal #1 → ¿Qué acciones concretas lo logran?', placeholder: 'Vuelve a tus objetivos del Nivel 2. ¿Qué canales, contenido y tácticas específicas necesitas para lograr el objetivo 1?' },
      { key: 'objetivo_a_estrategia_2', label: 'Objetivo principal #2 → Acciones', placeholder: '¿Qué necesitas hacer concretamente para lograr el objetivo 2?' },
      { key: 'objetivo_a_estrategia_3', label: 'Objetivo principal #3 → Acciones', placeholder: '¿Y para el objetivo 3?' },
    ],
  },
  {
    title: 'Ejercicio 5: Resistencia al algoritmo',
    description: 'Te invito a generar resistencia al algoritmo. Son numerosos los casos de personas que han sabido resistirse a la moda de publicar lo que el algoritmo desea para crear el contenido que quieren. La marca personal no es una carrera hacia la viralidad, es una construcción a fuego lento y con propósito.',
    theoryLink: THEORY_URL,
    fields: [
      { key: 'resistencia_que_no_haras', label: '¿Qué NO vas a hacer, aunque funcione?', placeholder: '¿Qué tendencias, formatos o prácticas de tu sector rechazas conscientemente? ¿Qué contenido nunca crearás aunque te dé más visitas?' },
      { key: 'resistencia_tu_diferencia', label: '¿Qué vas a hacer diferente al resto?', placeholder: '¿Qué hace que tu forma de comunicar sea distinta? ¿Qué apuesta haces que el mercado no espera?' },
      { key: 'resistencia_compromiso', label: 'Tu compromiso como creador/profesional', placeholder: '¿Qué tipo de creador o profesional quieres ser? Escribe tu compromiso contigo mismo.', hint: '¿Quieres ser libre o quieres ser importante? La respuesta a esta pregunta define tu estrategia.' },
    ],
  },
];

const NIVEL_4_EXERCISES: PiramideExercise[] = [
  {
    title: 'Ejercicio 1: Métricas visibles',
    description: 'En este nivel habrás culminado tu estrategia de marca personal. Ahora necesitas métricas para saber si funciona. Empieza por las visibles: las que puedes medir con números.',
    theoryLink: THEORY_URL,
    layout: 'table',
    tableHeaders: ['Métrica', 'Valor actual', 'Meta a 12 meses'],
    fields: [
      { key: 'metrica_visible_1', label: 'Métrica #1', placeholder: 'Ej: Seguidores, ingresos, clientes...', type: 'table_row' as PiramideFieldType },
      { key: 'metrica_visible_1_actual', label: 'Actual', placeholder: 'Ej: 500', type: 'table_row' as PiramideFieldType },
      { key: 'metrica_visible_1_meta', label: 'Meta', placeholder: 'Ej: 2.000', type: 'table_row' as PiramideFieldType },
      { key: 'metrica_visible_2', label: 'Métrica #2', placeholder: '', type: 'table_row' as PiramideFieldType },
      { key: 'metrica_visible_2_actual', label: 'Actual', placeholder: '', type: 'table_row' as PiramideFieldType },
      { key: 'metrica_visible_2_meta', label: 'Meta', placeholder: '', type: 'table_row' as PiramideFieldType },
      { key: 'metrica_visible_3', label: 'Métrica #3', placeholder: '', type: 'table_row' as PiramideFieldType },
      { key: 'metrica_visible_3_actual', label: 'Actual', placeholder: '', type: 'table_row' as PiramideFieldType },
      { key: 'metrica_visible_3_meta', label: 'Meta', placeholder: '', type: 'table_row' as PiramideFieldType },
    ],
  },
  {
    title: 'Ejercicio 2: Métricas invisibles',
    description: 'Las métricas invisibles son tan importantes como las visibles. Algunos modelos mentales y la propia vida te dirán si estás en el buen camino. El mercado te dirá que optimices y escales. Pero la decisión debe ser tuya. Personal e intransferible.',
    theoryLink: THEORY_URL,
    fields: [
      { key: 'metrica_inv_paz_mental', label: 'Tu paz mental', placeholder: '¿Cómo está ahora? Del 1 al 10, ¿cuánta paz sientes? ¿Qué la mejoraría?', type: 'short' as PiramideFieldType },
      { key: 'metrica_inv_coherencia', label: 'Tu coherencia', placeholder: '¿Vives en coherencia con tus valores del Nivel 1? ¿Tu marca refleja quién eres de verdad?', type: 'short' as PiramideFieldType },
      { key: 'metrica_inv_relaciones', label: 'Tus relaciones', placeholder: '¿Cómo son tus relaciones profesionales y personales? ¿Atraes a las personas correctas?', type: 'short' as PiramideFieldType },
      { key: 'metrica_inv_energia', label: 'Tu energía', placeholder: '¿Tu trabajo te da energía o te la quita? ¿Terminas el día satisfecho o vacío?', type: 'short' as PiramideFieldType },
      { key: 'metrica_inv_legado', label: 'Tu legado', placeholder: '¿Estás construyendo algo que trasciende más allá de ti? ¿Qué quedará cuando ya no estés?', type: 'short' as PiramideFieldType },
    ],
  },
  {
    title: 'Ejercicio 3: Indicadores de buena vida',
    description: 'Vuelve a tu definición de buena vida del Paso 3 (Éxito y Buena Vida). ¿Estás más cerca o más lejos?',
    fields: [
      { key: 'indicador_bv_1', label: 'Indicador de buena vida #1', placeholder: 'Ej: "Tengo tiempo para desayunar con mi familia" → Actualmente: sí/no', type: 'short' as PiramideFieldType },
      { key: 'indicador_bv_2', label: 'Indicador de buena vida #2', placeholder: '', type: 'short' as PiramideFieldType },
      { key: 'indicador_bv_3', label: 'Indicador de buena vida #3', placeholder: '', type: 'short' as PiramideFieldType },
      { key: 'indicador_bv_cumple', label: '¿Estás viviendo tu buena vida tal como la definiste?', placeholder: 'Sé honesto. ¿En qué porcentaje dirías que estás viviendo la vida que describiste en el ejercicio de Buena Vida?' },
      { key: 'indicador_bv_distancia', label: '¿Qué te separa de ella ahora mismo?', placeholder: '¿Qué obstáculos concretos hay entre donde estás y donde quieres estar? ¿Cuáles dependen de ti?' },
    ],
  },
  {
    title: 'Ejercicio 4: Revisión de tu pirámide completa',
    description: 'Mira tu pirámide desde arriba. Repasa cada nivel y detecta dónde necesitas invertir más tiempo.',
    fields: [
      { key: 'revision_bajo_tierra', label: 'Bajo Tierra: ¿Hay algo que necesites trabajar?', placeholder: '¿Tus creencias te apoyan o te frenan? ¿Has procesado tu historia?', type: 'short' as PiramideFieldType },
      { key: 'revision_nivel_1', label: 'Nivel 1: ¿Tu identidad está clara y alineada?', placeholder: '¿Tus valores, propósito y visión están bien definidos?', type: 'short' as PiramideFieldType },
      { key: 'revision_nivel_2', label: 'Nivel 2: ¿Tu mercado y objetivos siguen vigentes?', placeholder: '¿Tu audiencia sigue siendo la misma? ¿Tus objetivos han cambiado?', type: 'short' as PiramideFieldType },
      { key: 'revision_nivel_3', label: 'Nivel 3: ¿Tu estrategia funciona o necesitas pivotar?', placeholder: '¿Los canales elegidos te dan resultados? ¿El embudo funciona?', type: 'short' as PiramideFieldType },
      { key: 'revision_decision', label: '¿Qué decisión llevas posponiendo?', placeholder: 'Hay algo que sabes que necesitas hacer pero no has hecho. ¿Qué es?', hint: 'El mercado te dirá que optimices y escales. Pero la decisión debe ser tuya. Personal e intransferible.' },
    ],
  },
  {
    title: 'Ejercicio 5: Tu compromiso final',
    description: 'Has construido tu pirámide. Ahora necesitas un compromiso que la mantenga en pie. Porque cuando tienes una marca personal sólida, genuina, basada en tus principios y orientada hacia una buena vida, tienes algo que nadie puede quitarte.',
    fields: [
      { key: 'compromiso_frase', label: 'Tu compromiso contigo mismo', placeholder: 'Escribe una frase-compromiso que te sirva de ancla. Ej: "Me comprometo a construir una marca personal que refleje quién soy, no quién se supone que debería ser."', hint: 'Esta frase es tu pacto contigo mismo. Tenla siempre a mano.' },
      { key: 'compromiso_primer_paso', label: '¿Cuál es el primer paso que das mañana?', placeholder: 'No pienses en grande. ¿Qué acción concreta y pequeña puedes hacer mañana para empezar a mover tu pirámide?', type: 'short' as PiramideFieldType },
      { key: 'compromiso_recordatorio', label: 'Tu frase final', placeholder: 'Escribe la frase que quieres que te recuerde por qué haces todo esto. La que leerás cuando dudes.', hint: 'Cuando llegues arriba, no olvides por qué empezaste.' },
    ],
  },
];

export const PIRAMIDE_STEPS: PiramideStepConfig[] = [
  {
    id: 'prologo',
    label: 'Tu Historia',
    title: 'Prólogo: Cuéntate tu historia',
    icon: '📖',
    tagline: 'Para seguir construyendo, hay que mirar los primeros ladrillos que colocaste.',
    intro: 'Este es el ejercicio más importante y quizá el más difícil. No será evaluado ni puntuado. Es un ejercicio sincero de expresión escrita a través del cual te vas a contar a ti mismo tu historia. Date permiso para crear.',
    level: 'preparacion',
    exercises: PROLOGO_EXERCISES,
    fields: buildFlatFields(PROLOGO_EXERCISES),
  },
  {
    id: 'mentalidad',
    label: 'Tu Escaparate',
    title: 'Diseña tu escaparate personal',
    icon: '🪟',
    tagline: 'Tu marca personal es un escaparate. Muestra con intención lo que hay dentro.',
    intro: 'Imagina que tu marca personal es un escaparate. No muestra todo lo que eres, pero sí lo esencial para que quien pase por delante se detenga, entienda tu esencia y decida si quiere entrar a conocerte mejor. Un escaparate no vende humo: muestra con intención lo que hay dentro.',
    level: 'preparacion',
    exercises: MENTALIDAD_EXERCISES,
    fields: buildFlatFields(MENTALIDAD_EXERCISES),
  },
  {
    id: 'buena_vida',
    label: 'Buena Vida',
    title: 'Éxito y Buena Vida',
    icon: '🌅',
    tagline: 'Antes de construir tu marca, construye tu verdad.',
    intro: 'Hay una meta vital por encima de los objetivos profesionales y es saber definir nuestro éxito y el concepto que tenemos de buena vida. Este capítulo pretende ser una posada, un alto en el camino, antes de emprender la construcción de tu pirámide.',
    level: 'preparacion',
    exercises: BUENA_VIDA_EXERCISES,
    fields: buildFlatFields(BUENA_VIDA_EXERCISES),
  },
  {
    id: 'bajo_tierra',
    label: 'Bajo Tierra',
    title: 'Bajo Tierra: Autoconocimiento',
    icon: '⛏️',
    tagline: 'Lo que no se ve pero sostiene todo. Antes de venderte, aprende a conocerte.',
    intro: 'De todo lo que encuentras bajo tierra, lo único que puedes modificar son tus creencias. Tu historia, tus experiencias, tu genética — todo eso te ha moldeado y te hace único e irrepetible. La decisión de construir tu marca personal está determinada por el conjunto de estos factores.',
    level: 'piramide',
    exercises: BAJO_TIERRA_EXERCISES,
    fields: buildFlatFields(BAJO_TIERRA_EXERCISES),
  },
  {
    id: 'nivel_1',
    label: 'Nivel 1',
    title: 'Nivel 1: Identidad',
    icon: '🏛️',
    tagline: 'Lo que eres es lo que necesitas ser.',
    intro: 'Sobre el cimiento invisible pero sólido de lo que está bajo tierra, empezamos a construir. Primero: tus valores, tu identidad, tu propósito e incluso tus banderas rojas. Construir tu marca personal sin una buena base asentada en tu identidad significa construir un relato que no va en coherencia con lo que de verdad eres.',
    level: 'piramide',
    exercises: NIVEL_1_EXERCISES,
    fields: buildFlatFields(NIVEL_1_EXERCISES),
  },
  {
    id: 'nivel_2',
    label: 'Nivel 2',
    title: 'Nivel 2: Mercado y Objetivos',
    icon: '🎯',
    tagline: 'La intersección entre lo que sabes hacer, lo que te motiva y lo que el mercado necesita.',
    intro: 'En esta fase hablamos de objetivos, audiencia y propuesta de valor. Cuantos más años tengas, más sólidos serán. Si estás en tu veintena, los cambios de los próximos años te harán reconstruir este nivel — y eso es maravilloso. La experiencia se adhiere al nuevo proyecto, sumándole mucho más valor.',
    level: 'piramide',
    exercises: NIVEL_2_EXERCISES,
    fields: buildFlatFields(NIVEL_2_EXERCISES),
  },
  {
    id: 'nivel_3',
    label: 'Nivel 3',
    title: 'Nivel 3: Estrategia',
    icon: '♟️',
    tagline: '¿Quieres ser libre o quieres ser importante?',
    intro: 'Las estrategias de marca personal son cambiantes y se ajustan a los tiempos, la tecnología y el entorno. En esta fase, menos apego y más métricas. Genera resistencia al algoritmo. Qué contenido hacer y cómo hacerlo te saldrá solo al concluir este nivel.',
    level: 'piramide',
    exercises: NIVEL_3_EXERCISES,
    fields: buildFlatFields(NIVEL_3_EXERCISES),
  },
  {
    id: 'nivel_4',
    label: 'Nivel 4',
    title: 'Nivel 4: Resultados',
    icon: '🏔️',
    tagline: 'Cuando los niveles anteriores están bien construidos, los resultados llegan como consecuencia lógica.',
    intro: 'Habrás culminado tu estrategia de marca personal. Habrás construido con seguridad y paciencia la que te hará vivir una vida con propósito. Ahora la pregunta es: ¿cómo sabrás que has llegado? ¿Cómo medirás los resultados? ¿Estás viviendo una buena vida acorde a lo que querías?',
    level: 'piramide',
    exercises: NIVEL_4_EXERCISES,
    fields: buildFlatFields(NIVEL_4_EXERCISES),
  },
];

// ===== LAS RUTAS — USER JOURNEY =====

export type DiagnosticProfile = 'A' | 'B' | 'C' | 'D';
export type RutaType = 'cimientos' | 'visibilidad' | 'reconstruccion' | 'difusion';

export interface RutaModulo {
  id: string;
  nombre: string;
  descripcion: string;
  completado: boolean;
  fecha_completado: string | null;
  // New fields for strategy generation
  objetivo?: string;
  herramientas?: string[];
  promptContext?: string;
}

export interface StrategyTask {
  titulo: string;
  descripcion: string;
  herramienta: string;
  link: string;
  accion: string;
}

export interface GeneratedStrategy {
  insight: string;
  tareas: StrategyTask[];
  reflexion: string;
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
