'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';

interface AlumnoData {
  id: string;
  email: string;
  displayName: string;
  hasApiKey: boolean;
  tourCompleted: boolean;
  createdAt: string;
  piramideStep: string | null;
  piramideStepsCompleted: string[];
  piramideCompleted: boolean;
  arbolCompleted: boolean;
  arbolStep: number;
  rutaAsignada: string | null;
  brujulaCompleted: boolean;
  piramide: any | null;
  arbol: any | null;
  brujula: any | null;
  entrevistadorSessions: number;
  entrevistadorFrases: number;
  lastUpdated: string | null;
}

interface Props {
  alumnos: AlumnoData[];
}

const PhaseIcon = ({ completed }: { completed: boolean }) => (
  <span
    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
      completed ? 'bg-naranja text-white' : 'bg-borde text-muted'
    }`}
  >
    ✓
  </span>
);

const Accordion = ({
  title,
  children,
  completed,
}: {
  title: string;
  children: React.ReactNode;
  completed?: boolean;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-borde rounded-lg overflow-hidden mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 bg-crema hover:bg-naranja/5 flex items-center justify-between font-heading text-negro transition-colors"
      >
        <span className="flex items-center gap-3">
          <span className="text-sm">{open ? '▼' : '▶'}</span>
          {title}
          {completed && <span className="text-xs bg-naranja text-white px-2 py-1 rounded">✅ Completada</span>}
        </span>
      </button>
      {open && <div className="px-4 py-3 bg-white border-t border-borde">{children}</div>}
    </div>
  );
};

const FieldRow = ({ label, value }: { label: string; value: any }) => {
  const displayValue =
    value === null || value === undefined || value === ''
      ? '—'
      : Array.isArray(value)
      ? value.length === 0
        ? '—'
        : value.join(', ')
      : String(value);

  return (
    <div className="flex gap-4 py-2 border-b border-borde/50 last:border-b-0">
      <div className="font-semibold text-sm text-negro min-w-48">{label}</div>
      <div className={`text-sm flex-1 ${displayValue === '—' ? 'text-muted italic' : 'text-negro'}`}>
        {displayValue}
      </div>
    </div>
  );
};

const TagPill = ({ value }: { value: string }) => (
  <span className="inline-block bg-naranja/10 text-naranja rounded-full px-3 py-1 text-xs font-medium mr-2 mb-2">
    {value}
  </span>
);

const TagsDisplay = ({ values }: { values: any[] | string | null | undefined }) => {
  if (!values) return <span className="text-muted italic">—</span>;

  const items = Array.isArray(values) ? values : [values];
  const filtered = items.filter((v) => v !== null && v !== undefined && v !== '');

  if (filtered.length === 0) return <span className="text-muted italic">—</span>;

  return (
    <div className="flex flex-wrap gap-1">
      {filtered.map((value, idx) => (
        <TagPill key={idx} value={String(value)} />
      ))}
    </div>
  );
};

const PiramideSection = ({ data }: { data: any }) => {
  if (!data) return <p className="text-muted italic">Sin datos de Pirámide</p>;

  return (
    <div className="space-y-6">
      {/* Prólogo */}
      {(data.prologo?.el_comienzo ||
        data.prologo?.los_nudos ||
        data.prologo?.las_semillas ||
        data.prologo?.la_proyeccion) && (
        <div>
          <h4 className="font-semibold text-negro mb-3">Prólogo</h4>
          <FieldRow label="El Comienzo" value={data.prologo?.el_comienzo} />
          <FieldRow label="Los Nudos" value={data.prologo?.los_nudos} />
          <FieldRow label="Las Semillas" value={data.prologo?.las_semillas} />
          <FieldRow label="La Proyección" value={data.prologo?.la_proyeccion} />
        </div>
      )}

      {/* Mentalidad */}
      {(data.mentalidad?.que_sienta ||
        data.mentalidad?.elementos_centro ||
        data.mentalidad?.valores_ambiente ||
        data.mentalidad?.que_recuerden) && (
        <div>
          <h4 className="font-semibold text-negro mb-3">Mentalidad</h4>
          <FieldRow label="Qué sienta" value={data.mentalidad?.que_sienta} />
          <FieldRow label="Elementos centro" value={data.mentalidad?.elementos_centro} />
          <FieldRow label="Valores ambiente" value={data.mentalidad?.valores_ambiente} />
          <FieldRow label="Qué recuerden" value={data.mentalidad?.que_recuerden} />
        </div>
      )}

      {/* Buena Vida */}
      {(data.buena_vida?.definiendo_buena_vida ||
        data.buena_vida?.espacios_resonancia ||
        data.buena_vida?.relacion_trabajo ||
        data.buena_vida?.definicion_exito ||
        data.buena_vida?.principios_guia ||
        data.buena_vida?.brujula_emocional ||
        data.buena_vida?.recordatorio_personal) && (
        <div>
          <h4 className="font-semibold text-negro mb-3">Buena Vida</h4>
          <FieldRow label="Definiendo buena vida" value={data.buena_vida?.definiendo_buena_vida} />
          <FieldRow label="Espacios de resonancia" value={data.buena_vida?.espacios_resonancia} />
          <FieldRow label="Relación con trabajo" value={data.buena_vida?.relacion_trabajo} />
          <FieldRow label="Definición de éxito" value={data.buena_vida?.definicion_exito} />
          <FieldRow label="Principios guía" value={data.buena_vida?.principios_guia} />
          <FieldRow label="Brújula emocional" value={data.buena_vida?.brujula_emocional} />
          <FieldRow label="Recordatorio personal" value={data.buena_vida?.recordatorio_personal} />
        </div>
      )}

      {/* Bajo Tierra */}
      {(data.bajo_tierra || Object.keys(data).some((k) => k.startsWith('historia_') || k.startsWith('creencia_'))) && (
        <div>
          <h4 className="font-semibold text-negro mb-3">Bajo Tierra</h4>

          {/* Historia */}
          {(data.bajo_tierra?.historia_infancia ||
            data.bajo_tierra?.historia_adolescencia ||
            data.bajo_tierra?.historia_adulta ||
            data.bajo_tierra?.momentos_dificiles ||
            data.bajo_tierra?.momentos_triunfo) && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-negro mb-2">Historia</h5>
              <FieldRow label="Infancia" value={data.bajo_tierra?.historia_infancia} />
              <FieldRow label="Adolescencia" value={data.bajo_tierra?.historia_adolescencia} />
              <FieldRow label="Adulta" value={data.bajo_tierra?.historia_adulta} />
              <FieldRow label="Momentos difíciles" value={data.bajo_tierra?.momentos_dificiles} />
              <FieldRow label="Momentos triunfo" value={data.bajo_tierra?.momentos_triunfo} />
            </div>
          )}

          {/* Creencias limitantes */}
          {(data.bajo_tierra?.creencia_limitante_1 ||
            data.bajo_tierra?.creencia_limitante_2 ||
            data.bajo_tierra?.creencia_limitante_3) && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-negro mb-2">Creencias Limitantes</h5>
              {data.bajo_tierra?.creencia_limitante_1 && (
                <>
                  <FieldRow label="Creencia limitante 1" value={data.bajo_tierra?.creencia_limitante_1} />
                  <FieldRow label="Reformulada 1" value={data.bajo_tierra?.creencia_limitante_1_reformulada} />
                </>
              )}
              {data.bajo_tierra?.creencia_limitante_2 && (
                <>
                  <FieldRow label="Creencia limitante 2" value={data.bajo_tierra?.creencia_limitante_2} />
                  <FieldRow label="Reformulada 2" value={data.bajo_tierra?.creencia_limitante_2_reformulada} />
                </>
              )}
              {data.bajo_tierra?.creencia_limitante_3 && (
                <>
                  <FieldRow label="Creencia limitante 3" value={data.bajo_tierra?.creencia_limitante_3} />
                  <FieldRow label="Reformulada 3" value={data.bajo_tierra?.creencia_limitante_3_reformulada} />
                </>
              )}
            </div>
          )}

          {/* Creencias potenciadoras */}
          {(data.bajo_tierra?.creencia_potenciadora_1 ||
            data.bajo_tierra?.creencia_potenciadora_2 ||
            data.bajo_tierra?.creencia_potenciadora_3) && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-negro mb-2">Creencias Potenciadoras</h5>
              <FieldRow label="Creencia potenciadora 1" value={data.bajo_tierra?.creencia_potenciadora_1} />
              <FieldRow label="Creencia potenciadora 2" value={data.bajo_tierra?.creencia_potenciadora_2} />
              <FieldRow label="Creencia potenciadora 3" value={data.bajo_tierra?.creencia_potenciadora_3} />
            </div>
          )}

          {/* Money & Success beliefs */}
          {(data.bajo_tierra?.creencia_sobre_dinero || data.bajo_tierra?.creencia_sobre_exito) && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-negro mb-2">Creencias sobre Dinero y Éxito</h5>
              <FieldRow label="Creencia sobre dinero" value={data.bajo_tierra?.creencia_sobre_dinero} />
              <FieldRow label="Creencia sobre éxito" value={data.bajo_tierra?.creencia_sobre_exito} />
            </div>
          )}

          {/* Identity */}
          {(data.bajo_tierra?.tu_superpoder ||
            data.bajo_tierra?.que_te_hace_unico ||
            data.bajo_tierra?.talento_natural) && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-negro mb-2">Identidad</h5>
              <FieldRow label="Tu superpoder" value={data.bajo_tierra?.tu_superpoder} />
              <FieldRow label="Qué te hace único" value={data.bajo_tierra?.que_te_hace_unico} />
              <FieldRow label="Talento natural" value={data.bajo_tierra?.talento_natural} />
            </div>
          )}

          {/* Mirrors */}
          {(data.bajo_tierra?.espejo_pasado ||
            data.bajo_tierra?.espejo_presente ||
            data.bajo_tierra?.espejo_futuro) && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-negro mb-2">Espejos</h5>
              <FieldRow label="Espejo Pasado" value={data.bajo_tierra?.espejo_pasado} />
              <FieldRow label="Espejo Presente" value={data.bajo_tierra?.espejo_presente} />
              <FieldRow label="Espejo Futuro" value={data.bajo_tierra?.espejo_futuro} />
            </div>
          )}
        </div>
      )}

      {/* Nivel 1: Valores, Propósito, Visión */}
      {Object.keys(data).some((k) => k.startsWith('valor_') || k.startsWith('por_que_') || k.startsWith('vision_')) && (
        <div>
          <h4 className="font-semibold text-negro mb-3">Nivel 1: Valores, Propósito, Visión</h4>

          {/* Values */}
          {(data.valor_1 || data.valor_2 || data.valor_3 || data.valor_4 || data.valor_5) && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-negro mb-2">Valores</h5>
              {[1, 2, 3, 4, 5].map((num) =>
                data[`valor_${num}`] ? (
                  <div key={num} className="mb-3 pb-3 border-b border-borde/50 last:border-b-0">
                    <FieldRow label={`Valor ${num}`} value={data[`valor_${num}`]} />
                    <FieldRow label={`Significado ${num}`} value={data[`significado_${num}`]} />
                    <FieldRow label={`Ejemplo ${num}`} value={data[`ejemplo_${num}`]} />
                  </div>
                ) : null
              )}
            </div>
          )}

          {/* Purpose Whys */}
          {(data.por_que_1 || data.por_que_2 || data.por_que_3 || data.por_que_4 || data.por_que_5) && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-negro mb-2">Propósito (Por qué)</h5>
              <FieldRow label="Por qué 1" value={data.por_que_1} />
              <FieldRow label="Por qué 2" value={data.por_que_2} />
              <FieldRow label="Por qué 3" value={data.por_que_3} />
              <FieldRow label="Por qué 4" value={data.por_que_4} />
              <FieldRow label="Por qué 5" value={data.por_que_5} />
            </div>
          )}

          {/* Vision */}
          {(data.vision_1 || data.vision_2 || data.vision_3 || data.vision_4) && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-negro mb-2">Visión</h5>
              <FieldRow label="Visión 1" value={data.vision_1} />
              <FieldRow label="Visión 2" value={data.vision_2} />
              <FieldRow label="Visión 3" value={data.vision_3} />
              <FieldRow label="Visión 4" value={data.vision_4} />
            </div>
          )}

          {/* Red flags */}
          {(data.bandera_roja_1 ||
            data.bandera_roja_2 ||
            data.bandera_roja_3 ||
            data.bandera_roja_4 ||
            data.bandera_roja_5) && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-negro mb-2">Banderas Rojas</h5>
              <FieldRow label="Bandera roja 1" value={data.bandera_roja_1} />
              <FieldRow label="Bandera roja 2" value={data.bandera_roja_2} />
              <FieldRow label="Bandera roja 3" value={data.bandera_roja_3} />
              <FieldRow label="Bandera roja 4" value={data.bandera_roja_4} />
              <FieldRow label="Bandera roja 5" value={data.bandera_roja_5} />
            </div>
          )}

          {/* Identity and Coherence */}
          {(data.identidad || data.coherencia) && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-negro mb-2">Identidad y Coherencia</h5>
              <FieldRow label="Identidad" value={data.identidad} />
              <FieldRow label="Coherencia" value={data.coherencia} />
            </div>
          )}
        </div>
      )}

      {/* Nivel 2: Mercado */}
      {Object.keys(data).some((k) =>
        [
          'nombre_audiencia',
          'edad_audiencia',
          'frustracion',
          'deseo',
          'objecion',
          'donde_esta',
          'lenguaje',
          'ayudo_a',
          'a_conseguir',
          'a_traves_de',
          'sin_necesidad',
          'frase_completa',
          'por_que_tu',
        ].includes(k)
      ) && (
        <div>
          <h4 className="font-semibold text-negro mb-3">Nivel 2: Mercado</h4>

          {/* Audience */}
          {(data.nombre_audiencia ||
            data.edad_audiencia ||
            data.frustracion ||
            data.deseo ||
            data.objecion ||
            data.donde_esta ||
            data.lenguaje) && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-negro mb-2">Audiencia</h5>
              <FieldRow label="Nombre" value={data.nombre_audiencia} />
              <FieldRow label="Edad" value={data.edad_audiencia} />
              <FieldRow label="Frustración" value={data.frustracion} />
              <FieldRow label="Deseo" value={data.deseo} />
              <FieldRow label="Objeción" value={data.objecion} />
              <FieldRow label="Dónde está" value={data.donde_esta} />
              <FieldRow label="Lenguaje" value={data.lenguaje} />
            </div>
          )}

          {/* Value Proposition */}
          {(data.ayudo_a ||
            data.a_conseguir ||
            data.a_traves_de ||
            data.sin_necesidad ||
            data.frase_completa ||
            data.por_que_tu) && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-negro mb-2">Propuesta de Valor</h5>
              <FieldRow label="Ayudo a" value={data.ayudo_a} />
              <FieldRow label="A conseguir" value={data.a_conseguir} />
              <FieldRow label="A través de" value={data.a_traves_de} />
              <FieldRow label="Sin necesidad" value={data.sin_necesidad} />
              <FieldRow label="Frase completa" value={data.frase_completa} />
              <FieldRow label="Por qué tú" value={data.por_que_tu} />
            </div>
          )}

          {/* Objectives */}
          {(data.objetivo_pasional ||
            data.objetivo_pasional_secundario ||
            data.objetivo_pasional_kpi ||
            data.objetivo_referencia ||
            data.objetivo_referencia_secundario ||
            data.objetivo_referencia_kpi ||
            data.objetivo_economico ||
            data.objetivo_economico_secundario ||
            data.objetivo_economico_kpi) && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-negro mb-2">Objetivos</h5>
              <div className="mb-3">
                <h6 className="text-xs font-semibold text-naranja mb-2">Pasional</h6>
                <FieldRow label="Objetivo" value={data.objetivo_pasional} />
                <FieldRow label="Secundario" value={data.objetivo_pasional_secundario} />
                <FieldRow label="KPI" value={data.objetivo_pasional_kpi} />
              </div>
              <div className="mb-3">
                <h6 className="text-xs font-semibold text-naranja mb-2">Referencia</h6>
                <FieldRow label="Objetivo" value={data.objetivo_referencia} />
                <FieldRow label="Secundario" value={data.objetivo_referencia_secundario} />
                <FieldRow label="KPI" value={data.objetivo_referencia_kpi} />
              </div>
              <div className="mb-3">
                <h6 className="text-xs font-semibold text-naranja mb-2">Económico</h6>
                <FieldRow label="Objetivo" value={data.objetivo_economico} />
                <FieldRow label="Secundario" value={data.objetivo_economico_secundario} />
                <FieldRow label="KPI" value={data.objetivo_economico_kpi} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Nivel 3: Estrategia */}
      {Object.keys(data).some((k) =>
        [
          'canal_1',
          'canal_2',
          'canal_3',
          'pilar_contenido_1',
          'pilar_contenido_2',
          'pilar_contenido_3',
          'etapa_funnel_awareness',
          'etapa_funnel_consideration',
          'etapa_funnel_decision',
          'estrategia',
          'resistencia',
        ].includes(k)
      ) && (
        <div>
          <h4 className="font-semibold text-negro mb-3">Nivel 3: Estrategia</h4>

          {/* Channels */}
          {(data.canal_1 || data.canal_2 || data.canal_3) && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-negro mb-2">Canales</h5>
              {[1, 2, 3].map((num) =>
                data[`canal_${num}`] ? (
                  <div key={num} className="mb-3 pb-3 border-b border-borde/50 last:border-b-0">
                    <FieldRow label={`Canal ${num}`} value={data[`canal_${num}`]} />
                    <FieldRow label={`Descripción ${num}`} value={data[`canal_${num}_descripcion`]} />
                    <FieldRow label={`Frecuencia ${num}`} value={data[`canal_${num}_frecuencia`]} />
                  </div>
                ) : null
              )}
            </div>
          )}

          {/* Content Pillars */}
          {(data.pilar_contenido_1 || data.pilar_contenido_2 || data.pilar_contenido_3) && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-negro mb-2">Pilares de Contenido</h5>
              <FieldRow label="Pilar 1" value={data.pilar_contenido_1} />
              <FieldRow label="Pilar 2" value={data.pilar_contenido_2} />
              <FieldRow label="Pilar 3" value={data.pilar_contenido_3} />
            </div>
          )}

          {/* Funnel */}
          {(data.etapa_funnel_awareness ||
            data.etapa_funnel_consideration ||
            data.etapa_funnel_decision) && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-negro mb-2">Etapas del Funnel</h5>
              <FieldRow label="Awareness" value={data.etapa_funnel_awareness} />
              <FieldRow label="Consideration" value={data.etapa_funnel_consideration} />
              <FieldRow label="Decision" value={data.etapa_funnel_decision} />
            </div>
          )}

          {/* Strategy & Resistance */}
          {(data.estrategia || data.resistencia) && (
            <div className="mb-4">
              <FieldRow label="Estrategia" value={data.estrategia} />
              <FieldRow label="Resistencia" value={data.resistencia} />
            </div>
          )}
        </div>
      )}

      {/* Nivel 4: Resultados */}
      {Object.keys(data).some((k) =>
        [
          'metrica_visible',
          'metrica_invisible',
          'indicador_buena_vida',
          'review_trimestral',
          'commitment',
        ].includes(k)
      ) && (
        <div>
          <h4 className="font-semibold text-negro mb-3">Nivel 4: Resultados</h4>

          {/* Metrics */}
          {(data.metrica_visible || data.metrica_invisible) && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-negro mb-2">Métricas</h5>
              <FieldRow label="Métrica visible" value={data.metrica_visible} />
              <FieldRow label="Métrica invisible" value={data.metrica_invisible} />
            </div>
          )}

          {/* Good Life Indicators */}
          {data.indicador_buena_vida && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-negro mb-2">Indicador Buena Vida</h5>
              <FieldRow label="Indicador" value={data.indicador_buena_vida} />
            </div>
          )}

          {/* Review & Commitment */}
          {(data.review_trimestral || data.commitment) && (
            <div className="mb-4">
              <FieldRow label="Review trimestral" value={data.review_trimestral} />
              <FieldRow label="Commitment" value={data.commitment} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ArbolSection = ({ data }: { data: any }) => {
  if (!data) return <p className="text-muted italic">Sin datos de Árbol</p>;

  return (
    <div className="space-y-6">
      {/* La Semilla */}
      {(data.proposito || data.vision || data.intencion || data.objetivos) && (
        <div>
          <h4 className="font-semibold text-negro mb-3">La Semilla</h4>
          <FieldRow label="Propósito" value={data.proposito} />
          <FieldRow label="Visión" value={data.vision} />
          <FieldRow label="Intención" value={data.intencion} />
          <FieldRow label="Objetivos" value={data.objetivos} />
        </div>
      )}

      {/* Las Raíces */}
      {(data.creencias ||
        data.valores ||
        data.identidad ||
        data.historia ||
        data.conocimientoHabilidades ||
        data.fortalezas ||
        data.experiencia ||
        data.intuicion) && (
        <div>
          <h4 className="font-semibold text-negro mb-3">Las Raíces</h4>
          <FieldRow label="Creencias" value={data.creencias} />
          <div className="py-2 border-b border-borde/50">
            <div className="font-semibold text-sm text-negro mb-2">Valores</div>
            <TagsDisplay values={data.valores} />
          </div>
          <FieldRow label="Identidad" value={data.identidad} />
          <FieldRow label="Historia" value={data.historia} />
          <FieldRow label="Conocimiento/Habilidades" value={data.conocimientoHabilidades} />
          <div className="py-2 border-b border-borde/50">
            <div className="font-semibold text-sm text-negro mb-2">Fortalezas</div>
            <TagsDisplay values={data.fortalezas} />
          </div>
          <FieldRow label="Experiencia" value={data.experiencia} />
          <FieldRow label="Intuición" value={data.intuicion} />
        </div>
      )}

      {/* El Tronco */}
      {(data.temaPrincipal || data.propuestaValor || data.zonaGenialidad) && (
        <div>
          <h4 className="font-semibold text-negro mb-3">El Tronco</h4>
          <FieldRow label="Tema Principal" value={data.temaPrincipal} />
          <FieldRow label="Propuesta de Valor" value={data.propuestaValor} />
          <FieldRow label="Zona de Genialidad" value={data.zonaGenialidad} />
        </div>
      )}

      {/* Las Ramas */}
      {(data.pasiones ||
        data.intereses ||
        data.hobbies ||
        data.habilidadesSecundarias ||
        data.contextosProfesionales ||
        data.formatosComunicacion) && (
        <div>
          <h4 className="font-semibold text-negro mb-3">Las Ramas</h4>
          <div className="py-2 border-b border-borde/50">
            <div className="font-semibold text-sm text-negro mb-2">Pasiones</div>
            <TagsDisplay values={data.pasiones} />
          </div>
          <div className="py-2 border-b border-borde/50">
            <div className="font-semibold text-sm text-negro mb-2">Intereses</div>
            <TagsDisplay values={data.intereses} />
          </div>
          <div className="py-2 border-b border-borde/50">
            <div className="font-semibold text-sm text-negro mb-2">Hobbies</div>
            <TagsDisplay values={data.hobbies} />
          </div>
          <div className="py-2 border-b border-borde/50">
            <div className="font-semibold text-sm text-negro mb-2">Habilidades Secundarias</div>
            <TagsDisplay values={data.habilidadesSecundarias} />
          </div>
          <div className="py-2 border-b border-borde/50">
            <div className="font-semibold text-sm text-negro mb-2">Contextos Profesionales</div>
            <TagsDisplay values={data.contextosProfesionales} />
          </div>
          <div className="py-2 border-b border-borde/50">
            <div className="font-semibold text-sm text-negro mb-2">Formatos de Comunicación</div>
            <TagsDisplay values={data.formatosComunicacion} />
          </div>
        </div>
      )}

      {/* La Copa */}
      {(data.atributos ||
        data.arquetipos ||
        data.tonoDeVoz ||
        data.narrativa ||
        data.energia ||
        data.presencia ||
        data.percepcion) && (
        <div>
          <h4 className="font-semibold text-negro mb-3">La Copa</h4>
          <div className="py-2 border-b border-borde/50">
            <div className="font-semibold text-sm text-negro mb-2">Atributos</div>
            <TagsDisplay values={data.atributos} />
          </div>
          {data.arquetipos && Array.isArray(data.arquetipos) && data.arquetipos.length > 0 && (
            <div className="py-2 border-b border-borde/50">
              <div className="font-semibold text-sm text-negro mb-2">Arquetipos</div>
              {data.arquetipos.map((arch: any, idx: number) => (
                <div key={idx} className="text-sm text-negro mb-1">
                  {arch.nombre || arch} {arch.porcentaje ? `(${arch.porcentaje}%)` : ''}
                </div>
              ))}
            </div>
          )}
          <FieldRow label="Tono de Voz" value={data.tonoDeVoz} />
          <FieldRow label="Narrativa" value={data.narrativa} />
          <FieldRow label="Energía" value={data.energia} />
          <FieldRow label="Presencia" value={data.presencia} />
          <FieldRow label="Percepción" value={data.percepcion} />
        </div>
      )}

      {/* Los Frutos */}
      {(data.queDeseasRecibir ||
        data.metaSeguidores ||
        data.mensajesQueQuieres ||
        data.impactoDeseado ||
        data.testimonioIdeal) && (
        <div>
          <h4 className="font-semibold text-negro mb-3">Los Frutos</h4>
          <FieldRow label="Qué deseas recibir" value={data.queDeseasRecibir} />
          <FieldRow label="Meta seguidores" value={data.metaSeguidores} />
          <FieldRow label="Mensajes que quieres" value={data.mensajesQueQuieres} />
          <FieldRow label="Impacto deseado" value={data.impactoDeseado} />
          <FieldRow label="Testimonio ideal" value={data.testimonioIdeal} />
        </div>
      )}

      {/* El Entorno */}
      {(data.audienciaPrincipal ||
        data.dondeEstan ||
        data.competencia ||
        data.aliadosPotenciales ||
        data.posicionamiento) && (
        <div>
          <h4 className="font-semibold text-negro mb-3">El Entorno</h4>
          <FieldRow label="Audiencia Principal" value={data.audienciaPrincipal} />
          <div className="py-2 border-b border-borde/50">
            <div className="font-semibold text-sm text-negro mb-2">Dónde están</div>
            <TagsDisplay values={data.dondeEstan} />
          </div>
          <FieldRow label="Competencia" value={data.competencia} />
          <FieldRow label="Aliados Potenciales" value={data.aliadosPotenciales} />
          <FieldRow label="Posicionamiento" value={data.posicionamiento} />
        </div>
      )}

      {/* El Tiempo */}
      {(data.ritmoPublicacion ||
        data.proximoHito ||
        data.metaAnual ||
        data.buenaVida) && (
        <div>
          <h4 className="font-semibold text-negro mb-3">El Tiempo</h4>
          <FieldRow label="Ritmo de Publicación" value={data.ritmoPublicacion} />
          <FieldRow label="Próximo Hito" value={data.proximoHito} />
          <FieldRow label="Meta Anual" value={data.metaAnual} />
          <FieldRow label="Buena Vida" value={data.buenaVida} />
        </div>
      )}

      {/* El Cofre */}
      {data.productos && Array.isArray(data.productos) && data.productos.length > 0 && (
        <div>
          <h4 className="font-semibold text-negro mb-3">El Cofre</h4>
          {data.productos.map((producto: any, idx: number) => (
            <div key={idx} className="mb-4 p-3 bg-naranja/5 rounded-lg border border-naranja/20">
              <h5 className="font-semibold text-negro mb-2">{producto.nombre || `Producto ${idx + 1}`}</h5>
              <FieldRow label="Descripción" value={producto.descripcion} />
              <FieldRow label="Formato" value={producto.formato} />
              <FieldRow label="Duración" value={producto.duracion} />
              <FieldRow label="Inversión" value={producto.inversion} />
              <FieldRow label="Cupos" value={producto.cupos} />
              <FieldRow label="Impacto" value={producto.impacto} />
              <FieldRow label="Lanzamiento" value={producto.lanzamiento} />
              <FieldRow label="Notas" value={producto.notas} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const BrujulaSection = ({ data }: { data: any }) => {
  if (!data) return <p className="text-muted italic">Sin datos de Brújula</p>;

  return (
    <div className="space-y-6">
      {/* Briefing */}
      {(data.temaRaiz || data.propuestaValor || data.etiquetaProfesional || data.porQueTu) && (
        <div>
          <h4 className="font-semibold text-negro mb-3">Briefing</h4>
          <FieldRow label="Tema Raíz" value={data.temaRaiz} />
          <FieldRow label="Propuesta de Valor" value={data.propuestaValor} />
          <FieldRow label="Etiqueta Profesional" value={data.etiquetaProfesional} />
          <FieldRow label="Por qué tú" value={data.porQueTu} />
        </div>
      )}

      {/* Buyer Personas */}
      {data.buyerPersonas && Array.isArray(data.buyerPersonas) && data.buyerPersonas.length > 0 && (
        <div>
          <h4 className="font-semibold text-negro mb-3">Buyer Personas</h4>
          {data.buyerPersonas.map((persona: any, idx: number) => (
            <div key={idx} className="mb-4 p-3 bg-naranja/5 rounded-lg border border-naranja/20">
              <h5 className="font-semibold text-negro mb-2">{persona.nombre || `Persona ${idx + 1}`}</h5>
              <FieldRow label="Edad" value={persona.edad} />
              <FieldRow label="Profesión" value={persona.profesion} />
              <FieldRow label="Qué quiere" value={persona.queQuiere} />
              <FieldRow label="Qué le frena" value={persona.queLeFrena} />
              <FieldRow label="Qué consume" value={persona.queConsumo} />
              <FieldRow label="Dónde está" value={persona.dondeEsta} />
              <FieldRow label="Lenguaje" value={persona.lenguaje} />
            </div>
          ))}
        </div>
      )}

      {/* Mapa de Empatía */}
      {(data.queVe || data.queOye || data.queDiceHace || data.quePiensaSiente || data.dolores || data.deseos) && (
        <div>
          <h4 className="font-semibold text-negro mb-3">Mapa de Empatía</h4>
          <FieldRow label="Qué ve" value={data.queVe} />
          <FieldRow label="Qué oye" value={data.queOye} />
          <FieldRow label="Qué dice/hace" value={data.queDiceHace} />
          <FieldRow label="Qué piensa/siente" value={data.quePiensaSiente} />
          <FieldRow label="Dolores" value={data.dolores} />
          <FieldRow label="Deseos" value={data.deseos} />
        </div>
      )}

      {/* Insight */}
      {(data.insight || data.fraseAudiencia) && (
        <div>
          <h4 className="font-semibold text-negro mb-3">Insight</h4>
          <FieldRow label="Insight" value={data.insight} />
          <FieldRow label="Frase Audiencia" value={data.fraseAudiencia} />
        </div>
      )}

      {/* Pilares de Contenido */}
      {data.pilares && Array.isArray(data.pilares) && data.pilares.length > 0 && (
        <div>
          <h4 className="font-semibold text-negro mb-3">Pilares de Contenido</h4>
          {data.pilares.map((pilar: any, idx: number) => (
            <div key={idx} className="mb-4 p-3 bg-naranja/5 rounded-lg border border-naranja/20">
              <h5 className="font-semibold text-negro mb-2">{pilar.nombre || `Pilar ${idx + 1}`}</h5>
              <div className="py-2 border-b border-naranja/30">
                <div className="font-semibold text-sm text-negro mb-2">Subtemas</div>
                <TagsDisplay values={pilar.subtemas} />
              </div>
              <div className="py-2 border-b border-naranja/30">
                <div className="font-semibold text-sm text-negro mb-2">Ángulos</div>
                <TagsDisplay values={pilar.angulos} />
              </div>
              {pilar.titulares && Array.isArray(pilar.titulares) && pilar.titulares.length > 0 && (
                <div className="py-2">
                  <div className="font-semibold text-sm text-negro mb-2">Titulares</div>
                  <ul className="text-sm text-negro list-disc list-inside">
                    {pilar.titulares.map((titular: any, i: number) => (
                      <li key={i}>{titular}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Canales */}
      {data.canales && (data.canales.length > 0 || typeof data.canales === 'string') && (
        <div>
          <h4 className="font-semibold text-negro mb-3">Canales</h4>
          <div className="py-2 border-b border-borde/50 mb-3">
            <div className="font-semibold text-sm text-negro mb-2">Canales</div>
            <TagsDisplay values={data.canales} />
          </div>
          {data.objetivosPrincipales && (
            <div className="py-2">
              <div className="font-semibold text-sm text-negro mb-2">Objetivos Principales</div>
              <TagsDisplay values={data.objetivosPrincipales} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function AlumnosClient({ alumnos }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlumnoId, setSelectedAlumnoId] = useState<string | null>(null);

  const filteredAlumnos = useMemo(() => {
    return alumnos.filter(
      (alumno) =>
        alumno.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alumno.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [alumnos, searchQuery]);

  const sortedAlumnos = useMemo(() => {
    return [...filteredAlumnos].sort((a, b) => {
      const dateA = new Date(a.lastUpdated || a.createdAt).getTime();
      const dateB = new Date(b.lastUpdated || b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [filteredAlumnos]);

  const selectedAlumno = useMemo(() => {
    return alumnos.find((a) => a.id === selectedAlumnoId);
  }, [alumnos, selectedAlumnoId]);

  const stats = useMemo(() => {
    return {
      total: alumnos.length,
      piramideCompleted: alumnos.filter((a) => a.piramideCompleted).length,
      arbolCompleted: alumnos.filter((a) => a.arbolCompleted).length,
      rutaAsignada: alumnos.filter((a) => a.rutaAsignada).length,
      brujulaCompleted: alumnos.filter((a) => a.brujulaCompleted).length,
    };
  }, [alumnos]);

  if (selectedAlumno) {
    return (
      <AppShell fullWidth>
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Back button */}
          <button
            onClick={() => setSelectedAlumnoId(null)}
            className="mb-6 text-naranja hover:text-naranja/80 font-heading transition-colors"
          >
            ← Volver a la lista
          </button>

          {/* Header */}
          <div className="bg-white border border-borde rounded-lg p-6 mb-6">
            <h1 className="font-heading text-3xl text-negro mb-2">{selectedAlumno.displayName}</h1>
            <p className="text-sm text-muted mb-4">{selectedAlumno.email}</p>

            <div className="flex flex-wrap gap-4 text-sm mb-4">
              <div>
                <span className="text-muted">Registrado:</span>
                <span className="ml-2 font-semibold text-negro">
                  {new Date(selectedAlumno.createdAt).toLocaleDateString('es-ES')}
                </span>
              </div>
              {selectedAlumno.lastUpdated && (
                <div>
                  <span className="text-muted">Última actividad:</span>
                  <span className="ml-2 font-semibold text-negro">
                    {new Date(selectedAlumno.lastUpdated).toLocaleDateString('es-ES')}
                  </span>
                </div>
              )}
            </div>

            {/* Phase Progress */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted">Fases completadas:</span>
              <div className="flex gap-3">
                <div className="flex items-center gap-2">
                  <PhaseIcon completed={selectedAlumno.piramideCompleted} />
                  <span className="text-xs text-muted">Pirámide</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhaseIcon completed={selectedAlumno.arbolCompleted} />
                  <span className="text-xs text-muted">Árbol</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhaseIcon completed={!!selectedAlumno.rutaAsignada} />
                  <span className="text-xs text-muted">Ruta</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhaseIcon completed={selectedAlumno.brujulaCompleted} />
                  <span className="text-xs text-muted">Brújula</span>
                </div>
              </div>
            </div>
          </div>

          {/* Accordions */}
          <div className="space-y-4">
            <Accordion title="La Pirámide" completed={selectedAlumno.piramideCompleted}>
              <PiramideSection data={selectedAlumno.piramide} />
            </Accordion>

            <Accordion title="El Árbol" completed={selectedAlumno.arbolCompleted}>
              <ArbolSection data={selectedAlumno.arbol} />
            </Accordion>

            <Accordion title="La Brújula" completed={selectedAlumno.brujulaCompleted}>
              <BrujulaSection data={selectedAlumno.brujula} />
            </Accordion>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell fullWidth>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link href="/admin" className="text-naranja hover:text-naranja/80 font-heading transition-colors mb-6 inline-block">
          ← Volver
        </Link>

        {/* Title */}
        <h1 className="font-heading text-4xl text-negro mb-2">Mis Alumnos</h1>
        <p className="text-sm text-muted mb-6">Total: {stats.total} alumnos</p>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <div className="bg-white border border-borde rounded-lg p-4">
            <div className="text-2xl font-heading text-naranja">{stats.total}</div>
            <div className="text-xs text-muted">Total</div>
          </div>
          <div className="bg-white border border-borde rounded-lg p-4">
            <div className="text-2xl font-heading text-naranja">{stats.piramideCompleted}</div>
            <div className="text-xs text-muted">Pirámide ✓</div>
          </div>
          <div className="bg-white border border-borde rounded-lg p-4">
            <div className="text-2xl font-heading text-naranja">{stats.arbolCompleted}</div>
            <div className="text-xs text-muted">Árbol ✓</div>
          </div>
          <div className="bg-white border border-borde rounded-lg p-4">
            <div className="text-2xl font-heading text-naranja">{stats.rutaAsignada}</div>
            <div className="text-xs text-muted">Ruta asignada</div>
          </div>
          <div className="bg-white border border-borde rounded-lg p-4">
            <div className="text-2xl font-heading text-naranja">{stats.brujulaCompleted}</div>
            <div className="text-xs text-muted">Brújula ✓</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-borde rounded-lg bg-white text-negro placeholder-muted focus:outline-none focus:ring-2 focus:ring-naranja"
          />
        </div>

        {/* Students List */}
        {sortedAlumnos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted">No hay alumnos que coincidan con la búsqueda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedAlumnos.map((alumno) => (
              <button
                key={alumno.id}
                onClick={() => setSelectedAlumnoId(alumno.id)}
                className="w-full text-left bg-white border border-borde rounded-lg p-4 hover:border-naranja hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-48">
                    <h3 className="font-semibold text-negro">{alumno.displayName}</h3>
                    <p className="text-xs text-muted">{alumno.email}</p>
                  </div>

                  {/* Phase Progress */}
                  <div className="flex gap-2">
                    <PhaseIcon completed={alumno.piramideCompleted} />
                    <PhaseIcon completed={alumno.arbolCompleted} />
                    <PhaseIcon completed={!!alumno.rutaAsignada} />
                    <PhaseIcon completed={alumno.brujulaCompleted} />
                  </div>

                  <div className="text-right min-w-40">
                    <div className="text-xs text-muted">
                      Registrado: {new Date(alumno.createdAt).toLocaleDateString('es-ES')}
                    </div>
                    {alumno.lastUpdated && (
                      <div className="text-xs text-muted">
                        Última: {new Date(alumno.lastUpdated).toLocaleDateString('es-ES')}
                      </div>
                    )}
                  </div>

                  <div className="text-naranja font-heading">Ver detalle →</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
