export const STEPS = [
  { id: 'briefing', label: 'Paso 1 de 6', title: 'Briefing Personal', desc: 'Quién eres, de qué hablas y por qué tú. Los cimientos de tu Pirámide.' },
  { id: 'buyer', label: 'Paso 2 de 6', title: 'Buyer Persona', desc: 'A quién le hablas. Puedes definir hasta 5 perfiles — personas reales con miedos y deseos concretos.' },
  { id: 'empathy', label: 'Paso 3 de 6', title: 'Mapa de Empatía', desc: 'Métete en su cabeza. Qué ve, qué oye, qué siente por dentro y no dice.' },
  { id: 'insight', label: 'Paso 4 de 6', title: 'El Insight', desc: 'La verdad oculta que conecta lo que tú ofreces con lo que ellos realmente necesitan.' },
  { id: 'tree', label: 'Paso 5 de 6', title: 'Árbol de Contenidos', desc: 'Tus pilares, subtemas y ángulos. El mapa de todo lo que puedes contar.' },
  { id: 'channels', label: 'Paso 6 de 6', title: 'Canales y Objetivos', desc: 'Dónde publicas y qué buscas conseguir con tu contenido.' }
];

export const ANGLES = [
  'Experiencia personal', 'Enseñanza directa', 'Opinión / Crítica',
  'Análisis de caso', 'Pregunta al lector', 'Mito vs. Realidad',
  'Historia / Referencia cultural', 'Tutorial / Paso a paso',
  'Detrás de cámaras', 'Curación de contenido'
];

export const CHANNELS = ['Instagram', 'LinkedIn', 'Newsletter', 'Podcast', 'YouTube', 'Skool', 'Blog', 'Twitter / X', 'TikTok'];

export const OBJECTIVES = [
  { value: 'atraer', label: 'Atraer audiencia nueva', icon: '🧲' },
  { value: 'nutrir', label: 'Nutrir mi comunidad', icon: '🌱' },
  { value: 'convertir', label: 'Convertir / Vender', icon: '💰' },
  { value: 'posicionar', label: 'Posicionarme como referente', icon: '👑' },
  { value: 'conversar', label: 'Generar conversación', icon: '💬' }
];

export const ENERGY_LEVELS = [
  { value: 'encendido', label: 'Estoy encendido', desc: 'Quiero grabar, crear algo potente', icon: '🔥' },
  { value: 'currar', label: 'Tengo tiempo y ganas', desc: 'Puedo dedicarle un buen rato', icon: '💪' },
  { value: 'equilibrado', label: 'Algo que impacte sin matarme', desc: 'Quiero resultado con esfuerzo justo', icon: '⚡' },
  { value: 'minimo', label: 'Lo mínimo viable', desc: 'Ni tiempo ni ganas, pero quiero publicar', icon: '🎯' }
];

export const FORMAT_MAP: Record<string, string[]> = {
  'encendido': ['Vídeo largo', 'Directo / Live', 'Vídeo corto (Reel/TikTok)', 'Carrusel elaborado', 'Artículo largo', 'Episodio de podcast'],
  'currar': ['Carrusel', 'Newsletter', 'Artículo de blog', 'Vídeo corto', 'Post largo con imagen', 'Hilo de Twitter'],
  'equilibrado': ['Post con imagen', 'Historia con reflexión', 'Carrusel corto (3-5 slides)', 'Email corto a la lista', 'Repost con comentario propio'],
  'minimo': ['Story rápida', 'Frase + imagen', 'Encuesta / Pregunta', 'Repost con opinión breve', 'Comentario en post ajeno']
};

export const DEFAULT_STATE = {
  briefing: { temaRaiz: '', propuestaValor: '', etiquetaProfesional: '', porQueTu: '' },
  buyer: { nombre: '', edad: '', profesion: '', queQuiere: '', queLeFrena: '', queConsumo: '', dondeEsta: '', lenguaje: '' },
  buyers: [{ nombre: '', edad: '', profesion: '', queQuiere: '', queLeFrena: '', queConsumo: '', dondeEsta: '', lenguaje: '' }] as { nombre: string; edad: string; profesion: string; queQuiere: string; queLeFrena: string; queConsumo: string; dondeEsta: string; lenguaje: string }[],
  empathy: { queVe: '', queOye: '', queDiceHace: '', quePiensaSiente: '', dolores: '', deseos: '' },
  insight: { insight: '', fraseAudiencia: '' },
  tree: { pilares: [{ nombre: '', subtemas: [] as string[], angulos: [] as string[], titulares: [] as string[] }] },
  channels: { canales: [] as string[], objetivosPrincipales: [] as string[] },
  history: [] as any[],
  apiKey: ''
};
