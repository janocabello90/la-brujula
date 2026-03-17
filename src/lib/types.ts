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

// Bajo Tierra
export interface BajoTierraData {
  historia_experiencias: string;
  creencias_limitantes: string;
  creencias_potenciadoras: string;
  que_te_hace_unico: string;
}

// Nivel 1
export interface Nivel1Data {
  valores: string;
  proposito: string;
  vision: string;
  banderas_rojas: string;
  identidad: string;
}

// Nivel 2
export interface Nivel2Data {
  mercado_audiencia: string;
  propuesta_valor: string;
  objetivos: string;
}

// Nivel 3
export interface Nivel3Data {
  canales_estrategia: string;
  tipo_contenido: string;
  embudo_confianza: string;
}

// Nivel 4
export interface Nivel4Data {
  metricas_exito: string;
  indicadores_buena_vida: string;
  ajustes_necesarios: string;
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
  bajo_tierra: { historia_experiencias: '', creencias_limitantes: '', creencias_potenciadoras: '', que_te_hace_unico: '' },
  nivel_1: { valores: '', proposito: '', vision: '', banderas_rojas: '', identidad: '' },
  nivel_2: { mercado_audiencia: '', propuesta_valor: '', objetivos: '' },
  nivel_3: { canales_estrategia: '', tipo_contenido: '', embudo_confianza: '' },
  nivel_4: { metricas_exito: '', indicadores_buena_vida: '', ajustes_necesarios: '' },
};

// Step configuration for the Pirámide experience
export interface PiramideStepConfig {
  id: PiramideStep;
  label: string;
  title: string;
  icon: string;
  tagline: string;
  intro: string;
  level: 'preparacion' | 'piramide';
  fields: { key: string; label: string; placeholder: string; hint?: string }[];
}

export const PIRAMIDE_STEPS: PiramideStepConfig[] = [
  {
    id: 'prologo',
    label: 'Tu Historia',
    title: 'Prólogo: Cuéntate tu historia',
    icon: '📖',
    tagline: 'Para seguir construyendo, hay que mirar los primeros ladrillos que colocaste.',
    intro: 'Este es el ejercicio más importante y quizá el más difícil. No será evaluado ni puntuado. Es un ejercicio sincero de expresión escrita a través del cual te vas a contar a ti mismo tu historia. Date permiso para crear.',
    level: 'preparacion',
    fields: [
      {
        key: 'el_comienzo',
        label: 'El comienzo',
        placeholder: '¿De dónde vienes? ¿Cómo era tu infancia? ¿Qué aprendiste de tu entorno, tus referentes, tus heridas? ¿Qué es lo primero que recuerdas que te emocionaba o te hacía sentirte tú?',
        hint: 'Hay un fuego que te guía desde pequeño. Encuéntralo.',
      },
      {
        key: 'los_nudos',
        label: 'Los nudos del viaje',
        placeholder: '¿Qué momentos marcaron tu vida? ¿Cuándo sentiste que estabas perdido, cambiado, roto, o a punto de rendirte? ¿Qué decisiones te han traído hasta aquí?',
        hint: 'Las batallas que has librado contigo mismo o con el mundo te han moldeado.',
      },
      {
        key: 'las_semillas',
        label: 'Las semillas que has sembrado',
        placeholder: '¿Qué sabes hacer hoy? ¿Qué te apasiona, qué te interesa, qué causas te mueven? ¿Qué legado ya has comenzado a construir sin saberlo?',
        hint: 'Todo lo que has aprendido de ti en estos últimos años.',
      },
      {
        key: 'la_proyeccion',
        label: 'La proyección',
        placeholder: '¿Qué tipo de vida quieres construir? ¿Qué significa para ti una buena vida? ¿Qué tipo de pirámide deseas dejar como símbolo de tu paso por este mundo?',
        hint: '¿Para quién lo haces?',
      },
    ],
  },
  {
    id: 'mentalidad',
    label: 'Tu Escaparate',
    title: 'Diseña tu escaparate personal',
    icon: '🪟',
    tagline: 'Tu marca personal es un escaparate. Muestra con intención lo que hay dentro.',
    intro: 'Imagina que tu marca personal es un escaparate. No muestra todo lo que eres, pero sí lo esencial para que quien pase por delante se detenga, entienda tu esencia y decida si quiere entrar a conocerte mejor. Un escaparate no vende humo: muestra con intención lo que hay dentro.',
    level: 'preparacion',
    fields: [
      {
        key: 'que_sienta',
        label: '¿Qué quieres que la gente sienta al mirar tu escaparate?',
        placeholder: '¿Confianza? ¿Curiosidad? ¿Inspiración? ¿Cercanía? Escribe al menos tres palabras que definan esa atmósfera emocional.',
        hint: 'Piensa en la emoción o sensaciones que provocarías en alguien que te ve por primera vez.',
      },
      {
        key: 'elementos_centro',
        label: '¿Qué elementos colocas en el centro del escaparate?',
        placeholder: '¿Qué talentos, experiencias, habilidades o pasiones deben estar siempre visibles en tu marca? Lista entre tres y cinco elementos.',
        hint: 'El corazón de tu propuesta. Lo que te representa y debe ser reconocible a simple vista.',
      },
      {
        key: 'valores_ambiente',
        label: '¿Qué valores se respiran en el ambiente?',
        placeholder: 'Más allá de lo que se ve, ¿qué principios deberían sentirse al mirar tu escaparate? Enumera entre dos y cuatro valores.',
        hint: 'Lo que guiará tus decisiones, incluso cuando no se enuncie.',
      },
      {
        key: 'que_recuerden',
        label: '¿Qué quieres que la gente recuerde después de verlo?',
        placeholder: 'Imagina que la persona sigue su camino. ¿Qué idea, frase o imagen debería permanecer en su memoria?',
        hint: 'Una frase breve o un concepto que resuma el impacto que deseas dejar.',
      },
    ],
  },
  {
    id: 'buena_vida',
    label: 'Buena Vida',
    title: 'Éxito y Buena Vida',
    icon: '🌅',
    tagline: 'Antes de construir tu marca, construye tu verdad.',
    intro: 'Este ejercicio no es para hacerlo rápido. Busca un momento tranquilo, sin interrupciones. Responde sin filtro. No hay respuestas buenas o malas, solo las que te acerquen a ti mismo. Recuerda: "Una mente en calma, un cuerpo en forma y una casa llena de amor. Estas tres cosas no se consiguen con dinero, hay que ganárselas." — Naval Ravikant.',
    level: 'preparacion',
    fields: [
      {
        key: 'definiendo_buena_vida',
        label: '1. Definiendo la buena vida',
        placeholder: 'Imagina que tienes todo resuelto: dinero, tiempo y salud. ¿Cómo es un día normal en esa vida ideal? ¿Con quién compartes tu tiempo? ¿Dónde estás viviendo? ¿Qué haces que te hace sentir pleno?',
        hint: '¿Qué estás evitando conscientemente en esa vida ideal?',
      },
      {
        key: 'espacios_resonancia',
        label: '2. Tus espacios de resonancia',
        placeholder: 'La paz no se encuentra, se recuerda. ¿Cuándo fue la última vez que sentiste paz mental? ¿Qué estabas haciendo? ¿Qué elementos había que puedes replicar hoy?',
        hint: '¿Qué decisiones te alejan de esa paz?',
      },
      {
        key: 'relacion_trabajo',
        label: '3. Tu relación con el trabajo',
        placeholder: '¿Qué parte de tu trabajo actual te llena? ¿Qué parte te vacía? ¿Podrías vivir tu buena vida con tu trabajo actual? ¿Te da libertad o te la quita?',
        hint: 'El trabajo es parte de la vida, pero no toda la vida.',
      },
      {
        key: 'definicion_exito',
        label: '4. Tu definición de éxito',
        placeholder: 'Olvida lo que te han contado. ¿Qué significa para ti tener éxito? ¿A quién admiras y por qué? ¿Qué indicadores te dirían que estás viviendo tu definición de éxito?',
        hint: '¿Estás más cerca o más lejos que hace un año?',
      },
      {
        key: 'principios_guia',
        label: '5. Tus principios guía',
        placeholder: '¿Qué valores son innegociables para ti? ¿Qué decisiones tomaste en contra de ellos y qué aprendiste? ¿Qué decisiones futuras se harían más fáciles con estos principios claros?',
        hint: 'Cuando todo se tambalea, tus valores te sostienen.',
      },
      {
        key: 'brujula_emocional',
        label: '6. Tu brújula emocional',
        placeholder: '¿Qué emociones quieres sentir con frecuencia? ¿Qué tipo de relaciones quieres a tu alrededor? ¿Qué tipo de impacto te gustaría dejar en los demás?',
        hint: 'No basta con subir, hay que saber hacia dónde.',
      },
      {
        key: 'recordatorio_personal',
        label: '7. Tu recordatorio personal',
        placeholder: 'Escribe una frase que quieras tener presente cuando estés en lo alto de tu pirámide. Algo que puedas volver a leer cuando tengas dudas. Algo que te devuelva a ti.',
        hint: 'Cuando llegues arriba, no olvides por qué empezaste.',
      },
    ],
  },
  {
    id: 'bajo_tierra',
    label: 'Bajo Tierra',
    title: 'Bajo Tierra',
    icon: '⛏️',
    tagline: 'Lo que no se ve pero sostiene todo.',
    intro: 'De todo lo que encuentras bajo tierra, lo único que puedes modificar son tus creencias. Tu historia, tus experiencias, tu genética — todo eso te ha moldeado y te hace único e irrepetible. La decisión de construir tu marca personal está determinada por el conjunto de estos factores.',
    level: 'piramide',
    fields: [
      {
        key: 'historia_experiencias',
        label: 'Tu historia y experiencias',
        placeholder: '¿Qué experiencias te han formado? Las broncas, los fracasos, las victorias, las relaciones, los trabajos, los viajes. ¿Qué hay bajo tierra en tu pirámide que sostiene todo lo demás?',
        hint: 'Recuerda: tu camino hacia la buena vida es solamente tuyo y no podrás replicarlo en otra persona.',
      },
      {
        key: 'creencias_limitantes',
        label: 'Creencias que te frenan',
        placeholder: '¿Qué creencias sobre ti mismo, sobre el dinero, sobre el éxito o sobre el mundo te están limitando? ¿Cuáles son esos pensamientos que te dicen "no puedo" o "no soy suficiente"?',
        hint: 'Las creencias se pueden modificar. Identificarlas es el primer paso.',
      },
      {
        key: 'creencias_potenciadoras',
        label: 'Creencias que te impulsan',
        placeholder: '¿Qué crees firmemente que te ha ayudado hasta ahora? ¿Qué verdades profundas sientes sobre ti, sobre tu trabajo o sobre la vida que te dan fuerza?',
        hint: 'Estas creencias son los cimientos invisibles de tu pirámide.',
      },
      {
        key: 'que_te_hace_unico',
        label: '¿Qué te hace único e irrepetible?',
        placeholder: 'La "Teoría de los sistemas complejos" dice que cada persona es un sistema único. ¿Cuál es esa combinación irrepetible de experiencias, talentos y formas de ver el mundo que solo tú tienes?',
        hint: 'Nadie puede conseguir lo mismo que tú haciendo exactamente los mismos pasos.',
      },
    ],
  },
  {
    id: 'nivel_1',
    label: 'Nivel 1',
    title: 'Nivel 1: Identidad',
    icon: '🏛️',
    tagline: 'Lo que eres es lo que necesitas ser.',
    intro: 'Sobre el cimiento invisible pero sólido de lo que está bajo tierra, empezamos a construir. Primero: tus valores, tu identidad, tu propósito e incluso tus banderas rojas. Esta base constituye tu identidad más genuina. Atractivo para unos y repudiado por otros — eso es inevitable y maravilloso.',
    level: 'piramide',
    fields: [
      {
        key: 'valores',
        label: 'Tus valores innegociables',
        placeholder: '¿Qué principios defiendes por encima de todo? ¿Qué no estás dispuesto a sacrificar por dinero, fama o comodidad? ¿Qué valores guían tus decisiones más importantes?',
        hint: 'Solo si reconoces, respetas y valoras tu identidad, podrás defenderla cuando vengan las olas.',
      },
      {
        key: 'proposito',
        label: 'Tu propósito',
        placeholder: '¿Para qué haces lo que haces? No me digas "para ganar dinero" — ve más allá. ¿Qué problema del mundo quieres resolver? ¿Qué te levanta de la cama cuando todo lo demás falla?',
        hint: 'El propósito no tiene que ser grandioso. Tiene que ser tuyo.',
      },
      {
        key: 'vision',
        label: 'Tu visión a largo plazo',
        placeholder: '¿Dónde te ves en 5-10 años si todo sale como deseas? No hables de métricas — describe la vida, el impacto, la sensación. ¿Qué estás construyendo?',
        hint: 'Proyéctala como un ideal que te sirva de motor, no como objetivo rígido.',
      },
      {
        key: 'banderas_rojas',
        label: 'Tus banderas rojas',
        placeholder: '¿Qué líneas no cruzas? ¿Qué tipo de trabajos, clientes, colaboraciones o prácticas rechazas? ¿Qué te hace decir "no" sin dudarlo?',
        hint: 'Las líneas que no cruzas te definen tanto como las que sí.',
      },
      {
        key: 'identidad',
        label: 'Tu identidad genuina',
        placeholder: 'Si tuvieras que presentarte a alguien sin usar tu cargo profesional, ¿qué dirías? ¿Cómo te defines de verdad, sin el traje que te pones para trabajar?',
        hint: 'Tu marca personal no es un personaje que interpretas — es la expresión consciente de quién eres.',
      },
    ],
  },
  {
    id: 'nivel_2',
    label: 'Nivel 2',
    title: 'Nivel 2: Mercado',
    icon: '🎯',
    tagline: 'La intersección entre lo que sabes hacer, lo que te motiva y lo que el mercado necesita.',
    intro: 'En esta fase hablamos de objetivos, audiencia y propuesta de valor. Cuantos más años tengas, más sólidos serán. Si estás en tu veintena, los cambios de los próximos años te harán reconstruir este nivel — y eso es maravilloso. La experiencia se adhiere al nuevo proyecto, sumándole mucho más valor.',
    level: 'piramide',
    fields: [
      {
        key: 'mercado_audiencia',
        label: 'Tu mercado y audiencia',
        placeholder: '¿A quién ayudas o quieres ayudar? Describe a esa persona concreta: ¿qué necesita? ¿qué le frustra? ¿dónde está? No es un perfil demográfico — es una persona real con miedos, deseos y objeciones.',
        hint: 'Tu mayor enemigo será la ilusión de las masas. Solo necesitas una sala de cien personas.',
      },
      {
        key: 'propuesta_valor',
        label: 'Tu propuesta de valor',
        placeholder: '¿Qué resultado concreto les das? ¿Qué problema resuelves que nadie más resuelve de tu manera? ¿Cuál es la transformación que ofreces?',
        hint: 'Conecta lo que sabes hacer mejor con lo que tu audiencia necesita desesperadamente.',
      },
      {
        key: 'objetivos',
        label: 'Tus objetivos',
        placeholder: '¿Qué quieres lograr con tu marca personal en los próximos 12 meses? Sé específico. ¿Qué número de personas quieres alcanzar? ¿Qué ingresos necesitas? ¿Qué impacto quieres tener?',
        hint: 'Los objetivos no son sueños — son compromisos con fecha.',
      },
    ],
  },
  {
    id: 'nivel_3',
    label: 'Nivel 3',
    title: 'Nivel 3: Estrategia',
    icon: '♟️',
    tagline: '¿Quieres ser libre o quieres ser importante?',
    intro: 'Las estrategias son cambiantes y se ajustan a los tiempos. En esta fase, menos apego y más métricas. Genera resistencia al algoritmo. Son numerosos los casos de personas que han sabido resistirse a la moda de publicar lo que el algoritmo desea para crear el contenido que quieren.',
    level: 'piramide',
    fields: [
      {
        key: 'canales_estrategia',
        label: 'Tus canales y estrategia',
        placeholder: '¿Dónde vas a estar presente? Elige máximo 2-3 canales donde tu audiencia realmente está y donde tú te sientes cómodo comunicando. ¿Cuál es tu estrategia para cada uno?',
        hint: 'Nadie debería decirte qué contenido hacer. Lo sabrás tú, que para eso construiste los niveles anteriores.',
      },
      {
        key: 'tipo_contenido',
        label: 'Tu tipo de contenido',
        placeholder: '¿Qué tipo de contenido se alinea con tu identidad y tu propuesta de valor? ¿Texto, vídeo, audio, imagen? ¿Educativo, reflexivo, provocador, práctico? ¿Con qué frecuencia puedes mantenerlo de forma sostenible?',
        hint: 'Intenta generar resistencia al contenido manido. Crea algo que perdure en el tiempo.',
      },
      {
        key: 'embudo_confianza',
        label: 'Tu embudo de confianza',
        placeholder: 'Describe el camino que sigue alguien desde que te descubre hasta que se convierte en tu cliente. ¿Cómo te conoce? ¿Cómo confía en ti? ¿Cómo decide comprarte?',
        hint: 'Un camino de migas de pan que guíe a una persona desde que te conoce hasta que se enamora de lo que ofreces.',
      },
    ],
  },
  {
    id: 'nivel_4',
    label: 'Nivel 4',
    title: 'Nivel 4: Resultados',
    icon: '🏔️',
    tagline: 'Cuando los niveles anteriores están bien construidos, los resultados llegan como consecuencia lógica.',
    intro: 'Habrás culminado tu estrategia de marca personal. Habrás construido con seguridad y paciencia la que te hará vivir una vida con propósito. Ahora la pregunta es: ¿cómo sabrás que has llegado? ¿Cómo medirás los resultados? ¿Estás viviendo una buena vida acorde a lo que querías?',
    level: 'piramide',
    fields: [
      {
        key: 'metricas_exito',
        label: 'Tus métricas de éxito',
        placeholder: '¿Cómo sabrás que tu pirámide funciona? ¿Qué indicadores (visibles e invisibles) te dirán que vas por buen camino? No solo seguidores o dinero — piensa en coherencia, paz mental, impacto.',
        hint: 'Las métricas invisibles son tan importantes como las visibles.',
      },
      {
        key: 'indicadores_buena_vida',
        label: 'Tus indicadores de buena vida',
        placeholder: 'Vuelve a tu definición de buena vida del ejercicio anterior. ¿Qué señales concretas te dirán que la estás viviendo? ¿Cómo sabrás que no te has perdido por el camino?',
        hint: '¿Estás haciendo lo que querías? ¿Te sientes como imaginabas? ¿Eres feliz?',
      },
      {
        key: 'ajustes_necesarios',
        label: '¿Qué ajustes necesitas?',
        placeholder: 'Mirando tu pirámide completa — desde bajo tierra hasta aquí — ¿qué necesitas ajustar? ¿Dónde hay grietas? ¿Qué nivel necesita más trabajo? ¿Qué decisión llevas posponiendo?',
        hint: 'El mercado te dirá que optimices y escales. Pero la decisión debe ser tuya. Personal e intransferible.',
      },
    ],
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
