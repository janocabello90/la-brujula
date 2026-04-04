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
      completed ? 'bg-primary-container text-white' : 'bg-borde text-on-surface-variant'
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
    <div className="border border-outline-variant rounded-lg overflow-hidden mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 bg-surface hover:bg-primary-container/5 flex items-center justify-between font-headline text-on-surface transition-colors"
      >
        <span className="flex items-center gap-3">
          <span className="text-sm">{open ? '▼' : '▶'}</span>
          {title}
          {completed && <span className="text-xs bg-primary-container text-white px-2 py-1 rounded">✅ Completada</span>}
        </span>
      </button>
      {open && <div className="px-4 py-3 bg-white border-t border-outline-variant">{children}</div>}
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
    <div className="flex gap-4 py-2 border-b border-outline-variant/50 last:border-b-0">
      <div className="font-semibold text-sm text-on-surface min-w-48">{label}</div>
      <div className={`text-sm flex-1 ${displayValue === '—' ? 'text-on-surface-variant italic' : 'text-on-surface'}`}>
        {displayValue}
      </div>
    </div>
  );
};

const TagPill = ({ value }: { value: string }) => (
  <span className="inline-block bg-primary-container/10 text-primary rounded-full px-3 py-1 text-xs font-medium mr-2 mb-2">
    {value}
  </span>
);

const TagsDisplay = ({ values }: { values: any[] | string | null | undefined }) => {
  if (!values) return <span className="text-on-surface-variant italic">—</span>;

  const items = Array.isArray(values) ? values : [values];
  const filtered = items.filter((v) => v !== null && v !== undefined && v !== '');

  if (filtered.length === 0) return <span className="text-on-surface-variant italic">—</span>;

  return (
    <div className="flex flex-wrap gap-1">
      {filtered.map((value, idx) => (
        <TagPill key={idx} value={String(value)} />
      ))}
    </div>
  );
};

const PiramideSection = ({ data }: { data: any }) => {
  if (!data) return <p className="text-on-surface-variant italic">Sin datos de Pirámide</p>;

  return (
    <div className="space-y-6">
      {/* Prólogo */}
      {(data.prologo?.el_comienzo ||
        data.prologo?.los_nudos ||
        data.prologo?.las_semillas ||
        data.prologo?.la_proyeccion) && (
        <div>
          <h4 className="font-semibold text-on-surface mb-3">Prólogo</h4>
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
          <h4 className="font-semibold text-on-surface mb-3">Mentalidad</h4>
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
          <h4 className="font-semibold text-on-surface mb-3">Buena Vida</h4>
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
          <h4 className="font-semibold text-on-surface mb-3">Bajo Tierra</h4>

          {/* Historia */}
          {(data.bajo_tierra?.historia_infancia ||
            data.bajo_tierra?.historia_adolescencia ||
            data.bajo_tierra?.historia_adulta ||
            data.bajo_tierra?.momentos_dificiles ||
            data.bajo_tierra?.momentos_triunfo) && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-on-surface mb-2">Historia</h5>
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
              <h5 className="text-sm font-semibold text-on-surface mb-2">Creencias Limitantes</h5>
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
              <h5 className="text-sm font-semibold text-on-surface mb-2">Creencias Potenciadoras</h5>
              <FieldRow label="Creencia potenciadora 1" value={data.bajo_tierra?.creencia_potenciadora_1} />
              <FieldRow label="Creencia potenciadora 2" value={data.bajo_tierra?.creencia_potenciadora_2} />
              <FieldRow label="Creencia potenciadora 3" value={data.bajo_tierra?.creencia_potenciadora_3} />
            </div>
          )}

          {/* Money & Success beliefs */}
          {(data.bajo_tierra?.creencia_sobre_dinero || data.bajo_tierra?.creencia_sobre_exito) && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-on-surface mb-2">Creencias sobre Dinero y Éxito</h5>
              <FieldRow label="Creencia sobre dinero" value={data.bajo_tierra?.creencia_sobre_dinero} />
              <FieldRow label="Creencia sobre éxito" value={data.bajo_tierra?.creencia_sobre_exito} />
            </div>
          )}

          {/* Identity */}
          {(data.bajo_tierra?.tu_superpoder ||
            data.bajo_tierra?.que_te_hace_unico ||
            data.bajo_tierra?.talento_natural) && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-on-surface mb-2">Identidad</h5>
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
              <h5 className="text-sm font-semibold text-on-surface mb-2">Espejos</h5>
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
          <h4 className="font-semibold text-on-surface mb-3">Nivel 1: Valores, Propósito, Visión</h4>

          {/* Values */}
          {(data.valor_1 || data.valor_2 || data.valor_3 || data.valor_4 || data.valor_5) && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-on-surface mb-2">Valores</h5>
              {[1, 2, 3, 4, 5].map((num) =>
                data[`valor_${num}`] ? (
                  <div key={num} className="mb-3 pb-3 border-b border-outline-variant/50 last:border-b-0">
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
              <h5 className="text-sm font-semibold text-on-surface mb-2">Propósito (Por qué)</h5>
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
              <h5 className="text-sm font-semibold text-on-surface mb-2">Visión</h5>
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
              <h5 className="text-sm font-semibold text-on-surface mb-2">Banderas Rojas</h5>
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
              <h5 className="text-sm font-semibold text-on-surface mb-2">Identidad y Coherencia</h5>
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
          <h4 className="font-semibold text-on-surface mb-3">Nivel 2: Mercado</h4>

          {/* Audience */}
          {(data.nombre_audiencia ||
            data.edad_audiencia ||
            data.frustracion ||
            data.deseo ||
            data.objecion ||
            data.donde_esta ||
            data.lenguaje) && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-on-surface mb-2">Audiencia</h5>
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
              <h5 className="text-sm font-semibold text-on-surface mb-2">Propuesta de Valor</h5>
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
              <h5 className="text-sm font-semibold text-on-surface mb-2">Objetivos</h5>
              <div className="mb-3">
                <h6 className="text-xs font-semibold text-primary mb-2">Pasional</h6>
                <FieldRow label="Objetivo" value={data.objetivo_pasional} />
                <FieldRow label="Secundario" value={data.objetivo_pasional_secundario} />
                <FieldRow label="KPI" value={data.objetivo_pasional_kpi} />
              </div>
              <div className="mb-3">
                <h6 className="text-xs font-semibold text-primary mb-2">Referencia</h6>
                <FieldRow label="Objetivo" value={data.objetivo_referencia} />
                <FieldRow label="Secundario" value={data.objetivo_referencia_secundario} />
                <FieldRow label="KPI" value={data.objetivo_referencia_kpi} />
              </div>
              <div className="mb-3">
                <h6 className="text-xs font-semibold text-primary mb-2">Económico</h6>
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
          <h4 className="font-semibold text-on-surface mb-3">Nivel 3: Estrategia</h4>

          {/* Channels */}
          {(data.canal_1 || data.canal_2 || data.canal_3) && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-on-surface mb-2">Canales</h5>
              {[1, 2, 3].map((num) =>
                data[`canal_${num}`] ? (
                  <div key={num} className="mb-3 pb-3 border-b border-outline-variant/50 last:border-b-0">
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
              <h5 className="text-sm font-semibold text-on-surface mb-2">Pilares de Contenido</h5>
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
              <h5 className="text-sm font-semibold text-on-surface mb-2">Etapas del Funnel</h5>
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
          <h4 className="font-semibold text-on-surface mb-3">Nivel 4: Resultados</h4>

          {/* Metrics */}
          {(data.metrica_visible || data.metrica_invisible) && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-on-surface mb-2">Métricas</h5>
              <FieldRow label="Métrica visible" value={data.metrica_visible} />
              <FieldRow label="Métrica invisible" value={data.metrica_invisible} />
            </div>
          )}

          {/* Good Life Indicators */}
          {data.indicador_buena_vida && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-on-surface mb-2">Indicador Buena Vida</h5>
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
  if (!data) return <p className="text-on-surface-variant italic">Sin datos de Árbol</p>;

  return (
    <div className="space-y-6">
      {/* La Semilla */}
      {(data.proposito || data.vision || data.intencion || data.objetivos) && (
        <div>
          <h4 className="font-semibold text-on-surface mb-3">La Semilla</h4>
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
          <h4 className="font-semibold text-on-surface mb-3">Las Raíces</h4>
          <FieldRow label="Creencias" value={data.creencias} />
          <div className="py-2 border-b border-outline-variant/50">
            <div className="font-semibold text-sm text-on-surface mb-2">Valores</div>
            <TagsDisplay values={data.valores} />
          </div>
          <FieldRow label="Identidad" value={data.identidad} />
          <FieldRow label="Historia" value={data.historia} />
          <FieldRow label="Conocimiento/Habilidades" value={data.conocimientoHabilidades} />
          <div className="py-2 border-b border-outline-variant/50">
            <div className="font-semibold text-sm text-on-surface mb-2">Fortalezas</div>
            <TagsDisplay values={data.fortalezas} />
          </div>
          <FieldRow label="Experiencia" value={data.experiencia} />
          <FieldRow label="Intuición" value={data.intuicion} />
        </div>
      )}

      {/* El Tronco */}
      {(data.temaPrincipal || data.propuestaValor || data.zonaGenialidad) && (
        <div>
          <h4 className="font-semibold text-on-surface mb-3">El Tronco</h4>
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
          <h4 className="font-semibold text-on-surface mb-3">Las Ramas</h4>
          <div className="py-2 border-b border-outline-variant/50">
            <div className="font-semibold text-sm text-on-surface mb-2">Pasiones</div>
            <TagsDisplay values={data.pasiones} />
          </div>
          <div className="py-2 border-b border-outline-variant/50">
            <div className="font-semibold text-sm text-on-surface mb-2">Intereses</div>
            <TagsDisplay values={data.intereses} />
          </div>
          <div className="py-2 border-b border-outline-variant/50">
            <div className="font-semibold text-sm text-on-surface mb-2">Hobbies</div>
            <TagsDisplay values={data.hobbies} />
          </div>
          <div className="py-2 border-b border-outline-variant/50">
            <div className="font-semibold text-sm text-on-surface mb-2">Habilidades Secundarias</div>
            <TagsDisplay values={data.habilidadesSecundarias} />
          </div>
          <div className="py-2 border-b border-outline-variant/50">
            <div className="font-semibold text-sm text-on-surface mb-2">Contextos Profesionales</div>
            <TagsDisplay values={data.contextosProfesionales} />
          </div>
          <div className="py-2 border-b border-outline-variant/50">
            <div className="font-semibold text-sm text-on-surface mb-2">Formatos de Comunicación</div>
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
          <h4 className="font-semibold text-on-surface mb-3">La Copa</h4>
          <div className="py-2 border-b border-outline-variant/50">
            <div className="font-semibold text-sm text-on-surface mb-2">Atributos</div>
            <TagsDisplay values={data.atributos} />
          </div>
          {data.arquetipos && Array.isArray(data.arquetipos) && data.arquetipos.length > 0 && (
            <div className="py-2 border-b border-outline-variant/50">
              <div className="font-semibold text-sm text-on-surface mb-2">Arquetipos</div>
              {data.arquetipos.map((arch: any, idx: number) => (
                <div key={idx} className="text-sm text-on-surface mb-1">
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
          <h4 className="font-semibold text-on-surface mb-3">Los Frutos</h4>
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
          <h4 className="font-semibold text-on-surface mb-3">El Entorno</h4>
          <FieldRow label="Audiencia Principal" value={data.audienciaPrincipal} />
          <div className="py-2 border-b border-outline-variant/50">
            <div className="font-semibold text-sm text-on-surface mb-2">Dónde están</div>
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
          <h4 className="font-semibold text-on-surface mb-3">El Tiempo</h4>
          <FieldRow label="Ritmo de Publicación" value={data.ritmoPublicacion} />
          <FieldRow label="Próximo Hito" value={data.proximoHito} />
          <FieldRow label="Meta Anual" value={data.metaAnual} />
          <FieldRow label="Buena Vida" value={data.buenaVida} />
        </div>
      )}

      {/* El Cofre */}
      {data.productos && Array.isArray(data.productos) && data.productos.length > 0 && (
        <div>
          <h4 className="font-semibold text-on-surface mb-3">El Cofre</h4>
          {data.productos.map((producto: any, idx: number) => (
            <div key={idx} className="mb-4 p-3 bg-primary-container/5 rounded-lg border border-naranja/20">
              <h5 className="font-semibold text-on-surface mb-2">{producto.nombre || `Producto ${idx + 1}`}</h5>
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
  if (!data) return <p className="text-on-surface-variant italic">Sin datos de Brújula</p>;

  return (
    <div className="space-y-6">
      {/* Briefing */}
      {(data.temaRaiz || data.propuestaValor || data.etiquetaProfesional || data.porQueTu) && (
        <div>
          <h4 className="font-semibold text-on-surface mb-3">Briefing</h4>
          <FieldRow label="Tema Raíz" value={data.temaRaiz} />
          <FieldRow label="Propuesta de Valor" value={data.propuestaValor} />
          <FieldRow label="Etiqueta Profesional" value={data.etiquetaProfesional} />
          <FieldRow label="Por qué tú" value={data.porQueTu} />
        </div>
      )}

      {/* Buyer Personas */}
      {data.buyerPersonas && Array.isArray(data.buyerPersonas) && data.buyerPersonas.length > 0 && (
        <div>
          <h4 className="font-semibold text-on-surface mb-3">Buyer Personas</h4>
          {data.buyerPersonas.map((persona: any, idx: number) => (
            <div key={idx} className="mb-4 p-3 bg-primary-container/5 rounded-lg border border-naranja/20">
              <h5 className="font-semibold text-on-surface mb-2">{persona.nombre || `Persona ${idx + 1}`}</h5>
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
          <h4 className="font-semibold text-on-surface mb-3">Mapa de Empatía</h4>
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
          <h4 className="font-semibold text-on-surface mb-3">Insight</h4>
          <FieldRow label="Insight" value={data.insight} />
          <FieldRow label="Frase Audiencia" value={data.fraseAudiencia} />
        </div>
      )}

      {/* Pilares de Contenido */}
      {data.pilares && Array.isArray(data.pilares) && data.pilares.length > 0 && (
        <div>
          <h4 className="font-semibold text-on-surface mb-3">Pilares de Contenido</h4>
          {data.pilares.map((pilar: any, idx: number) => (
            <div key={idx} className="mb-4 p-3 bg-primary-container/5 rounded-lg border border-naranja/20">
              <h5 className="font-semibold text-on-surface mb-2">{pilar.nombre || `Pilar ${idx + 1}`}</h5>
              <div className="py-2 border-b border-naranja/30">
                <div className="font-semibold text-sm text-on-surface mb-2">Subtemas</div>
                <TagsDisplay values={pilar.subtemas} />
              </div>
              <div className="py-2 border-b border-naranja/30">
                <div className="font-semibold text-sm text-on-surface mb-2">Ángulos</div>
                <TagsDisplay values={pilar.angulos} />
              </div>
              {pilar.titulares && Array.isArray(pilar.titulares) && pilar.titulares.length > 0 && (
                <div className="py-2">
                  <div className="font-semibold text-sm text-on-surface mb-2">Titulares</div>
                  <ul className="text-sm text-on-surface list-disc list-inside">
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
          <h4 className="font-semibold text-on-surface mb-3">Canales</h4>
          <div className="py-2 border-b border-outline-variant/50 mb-3">
            <div className="font-semibold text-sm text-on-surface mb-2">Canales</div>
            <TagsDisplay values={data.canales} />
          </div>
          {data.objetivosPrincipales && (
            <div className="py-2">
              <div className="font-semibold text-sm text-on-surface mb-2">Objetivos Principales</div>
              <TagsDisplay values={data.objetivosPrincipales} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── TXT Export Function ────────────────────────────────────
function exportAlumnoToTxt(alumno: AlumnoData) {
  const val = (v: any): string => {
    if (v === null || v === undefined || v === '') return '—';
    if (Array.isArray(v)) return v.length > 0 ? v.join(', ') : '—';
    return String(v);
  };

  const field = (label: string, value: any): string => {
    const v = val(value);
    return v !== '—' ? `${label}: ${v}\n` : '';
  };

  const section = (title: string): string => `\n${'='.repeat(60)}\n${title.toUpperCase()}\n${'='.repeat(60)}\n\n`;
  const subsection = (title: string): string => `\n--- ${title} ---\n\n`;

  let txt = '';
  txt += `INFORME COMPLETO DEL ALUMNO\n`;
  txt += `Generado: ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}\n`;
  txt += `${'='.repeat(60)}\n\n`;
  txt += field('Nombre', alumno.displayName);
  txt += field('Email', alumno.email);
  txt += field('Registrado', new Date(alumno.createdAt).toLocaleDateString('es-ES'));
  txt += field('Pirámide completada', alumno.piramideCompleted ? 'Sí' : 'No');
  txt += field('Árbol completado', alumno.arbolCompleted ? 'Sí' : 'No');
  txt += field('Ruta asignada', alumno.rutaAsignada || 'No');
  txt += field('Brújula completada', alumno.brujulaCompleted ? 'Sí' : 'No');

  // ── PIRÁMIDE ──
  const p = alumno.piramide;
  if (p) {
    txt += section('LA PIRÁMIDE DE LA MARCA PERSONAL');

    txt += subsection('Prólogo');
    txt += field('¿Cuál es tu comienzo? ¿De dónde vienes?', p.prologo?.el_comienzo);
    txt += field('¿Cuáles son tus nudos? ¿Qué te ha frenado?', p.prologo?.los_nudos);
    txt += field('¿Cuáles son tus semillas? ¿Qué has aprendido?', p.prologo?.las_semillas);
    txt += field('¿Cuál es tu proyección? ¿Hacia dónde quieres ir?', p.prologo?.la_proyeccion);

    txt += subsection('Mentalidad');
    txt += field('¿Qué quieres que sienta tu audiencia?', p.mentalidad?.que_sienta);
    txt += field('¿Qué elementos deben estar en el centro?', p.mentalidad?.elementos_centro);
    txt += field('¿Qué valores quieres que se respiren en tu marca?', p.mentalidad?.valores_ambiente);
    txt += field('¿Qué quieres que recuerden de ti?', p.mentalidad?.que_recuerden);

    txt += subsection('Buena Vida');
    txt += field('¿Cómo defines una buena vida?', p.buena_vida?.definiendo_buena_vida);
    txt += field('¿Qué espacios te generan resonancia?', p.buena_vida?.espacios_resonancia);
    txt += field('¿Cuál es tu relación con el trabajo?', p.buena_vida?.relacion_trabajo);
    txt += field('¿Cómo defines el éxito?', p.buena_vida?.definicion_exito);
    txt += field('¿Cuáles son tus principios guía?', p.buena_vida?.principios_guia);
    txt += field('¿Cuál es tu brújula emocional?', p.buena_vida?.brujula_emocional);
    txt += field('¿Cuál es tu recordatorio personal?', p.buena_vida?.recordatorio_personal);

    txt += subsection('Bajo Tierra — Historia');
    txt += field('Historia de infancia', p.bajo_tierra?.historia_infancia);
    txt += field('Historia de adolescencia', p.bajo_tierra?.historia_adolescencia);
    txt += field('Historia adulta', p.bajo_tierra?.historia_adulta);
    txt += field('Momentos difíciles', p.bajo_tierra?.momentos_dificiles);
    txt += field('Momentos de triunfo', p.bajo_tierra?.momentos_triunfo);

    txt += subsection('Bajo Tierra — Creencias');
    txt += field('Creencia limitante 1', p.bajo_tierra?.creencia_limitante_1);
    txt += field('Reformulada 1', p.bajo_tierra?.creencia_limitante_1_reformulada);
    txt += field('Creencia limitante 2', p.bajo_tierra?.creencia_limitante_2);
    txt += field('Reformulada 2', p.bajo_tierra?.creencia_limitante_2_reformulada);
    txt += field('Creencia limitante 3', p.bajo_tierra?.creencia_limitante_3);
    txt += field('Reformulada 3', p.bajo_tierra?.creencia_limitante_3_reformulada);
    txt += field('Creencia potenciadora 1', p.bajo_tierra?.creencia_potenciadora_1);
    txt += field('Creencia potenciadora 2', p.bajo_tierra?.creencia_potenciadora_2);
    txt += field('Creencia potenciadora 3', p.bajo_tierra?.creencia_potenciadora_3);
    txt += field('Creencia sobre el dinero', p.bajo_tierra?.creencia_sobre_dinero);
    txt += field('Creencia sobre el éxito', p.bajo_tierra?.creencia_sobre_exito);

    txt += subsection('Bajo Tierra — Identidad');
    txt += field('Tu superpoder', p.bajo_tierra?.tu_superpoder);
    txt += field('¿Qué te hace único?', p.bajo_tierra?.que_te_hace_unico);
    txt += field('Tu talento natural', p.bajo_tierra?.talento_natural);

    txt += subsection('Bajo Tierra — Espejos');
    txt += field('Espejo del pasado (¿quién eras?)', p.bajo_tierra?.espejo_pasado);
    txt += field('Espejo del presente (¿quién eres?)', p.bajo_tierra?.espejo_presente);
    txt += field('Espejo del futuro (¿quién quieres ser?)', p.bajo_tierra?.espejo_futuro);

    txt += subsection('Nivel 1 — Valores');
    for (let i = 1; i <= 5; i++) {
      const v = p.nivel_1?.[`valor_${i}`] || p[`valor_${i}`];
      const s = p.nivel_1?.[`significado_${i}`] || p[`significado_${i}`];
      const e = p.nivel_1?.[`ejemplo_${i}`] || p[`ejemplo_${i}`];
      if (v) {
        txt += field(`Valor ${i}`, v);
        txt += field(`  ¿Qué significa para ti?`, s);
        txt += field(`  Ejemplo concreto`, e);
      }
    }

    txt += subsection('Nivel 1 — Propósito (Los 5 por qué)');
    for (let i = 1; i <= 5; i++) {
      txt += field(`¿Por qué ${i}?`, p.nivel_1?.[`por_que_${i}`] || p[`por_que_${i}`]);
    }

    txt += subsection('Nivel 1 — Visión');
    for (let i = 1; i <= 4; i++) {
      txt += field(`Visión ${i}`, p.nivel_1?.[`vision_${i}`] || p[`vision_${i}`]);
    }

    txt += subsection('Nivel 1 — Banderas Rojas');
    for (let i = 1; i <= 5; i++) {
      txt += field(`Bandera roja ${i} (lo que no cruzas)`, p.nivel_1?.[`bandera_roja_${i}`] || p[`bandera_roja_${i}`]);
    }

    txt += field('Identidad', p.nivel_1?.identidad || p.identidad);
    txt += field('Coherencia', p.nivel_1?.coherencia || p.coherencia);

    txt += subsection('Nivel 2 — Mercado y Audiencia');
    txt += field('¿A quién ayudas? (nombre)', p.nivel_2?.nombre_audiencia || p.nombre_audiencia);
    txt += field('Edad', p.nivel_2?.edad_audiencia || p.edad_audiencia);
    txt += field('¿Cuál es su frustración?', p.nivel_2?.frustracion || p.frustracion);
    txt += field('¿Cuál es su deseo?', p.nivel_2?.deseo || p.deseo);
    txt += field('¿Cuál es su objeción?', p.nivel_2?.objecion || p.objecion);
    txt += field('¿Dónde está?', p.nivel_2?.donde_esta || p.donde_esta);
    txt += field('¿Cómo habla?', p.nivel_2?.lenguaje || p.lenguaje);

    txt += subsection('Nivel 2 — Propuesta de Valor');
    txt += field('Ayudo a...', p.nivel_2?.ayudo_a || p.ayudo_a);
    txt += field('A conseguir...', p.nivel_2?.a_conseguir || p.a_conseguir);
    txt += field('A través de...', p.nivel_2?.a_traves_de || p.a_traves_de);
    txt += field('Sin necesidad de...', p.nivel_2?.sin_necesidad || p.sin_necesidad);
    txt += field('Frase completa', p.nivel_2?.frase_completa || p.frase_completa);
    txt += field('¿Por qué tú?', p.nivel_2?.por_que_tu || p.por_que_tu);

    txt += subsection('Nivel 2 — Objetivos');
    txt += field('Objetivo pasional', p.nivel_2?.objetivo_pasional || p.objetivo_pasional);
    txt += field('  Secundario', p.nivel_2?.objetivo_pasional_secundario || p.objetivo_pasional_secundario);
    txt += field('  KPI', p.nivel_2?.objetivo_pasional_kpi || p.objetivo_pasional_kpi);
    txt += field('Objetivo de referencia', p.nivel_2?.objetivo_referencia || p.objetivo_referencia);
    txt += field('  Secundario', p.nivel_2?.objetivo_referencia_secundario || p.objetivo_referencia_secundario);
    txt += field('  KPI', p.nivel_2?.objetivo_referencia_kpi || p.objetivo_referencia_kpi);
    txt += field('Objetivo económico', p.nivel_2?.objetivo_economico || p.objetivo_economico);
    txt += field('  Secundario', p.nivel_2?.objetivo_economico_secundario || p.objetivo_economico_secundario);
    txt += field('  KPI', p.nivel_2?.objetivo_economico_kpi || p.objetivo_economico_kpi);

    txt += subsection('Nivel 3 — Estrategia y Canales');
    for (let i = 1; i <= 3; i++) {
      const canal = p.nivel_3?.[`canal_${i}`] || p[`canal_${i}`];
      if (canal) {
        txt += field(`Canal ${i}`, canal);
        txt += field(`  Descripción`, p.nivel_3?.[`canal_${i}_descripcion`] || p[`canal_${i}_descripcion`]);
        txt += field(`  Frecuencia`, p.nivel_3?.[`canal_${i}_frecuencia`] || p[`canal_${i}_frecuencia`]);
      }
    }
    txt += field('Pilar de contenido 1', p.nivel_3?.pilar_contenido_1 || p.pilar_contenido_1);
    txt += field('Pilar de contenido 2', p.nivel_3?.pilar_contenido_2 || p.pilar_contenido_2);
    txt += field('Pilar de contenido 3', p.nivel_3?.pilar_contenido_3 || p.pilar_contenido_3);
    txt += field('Etapa funnel: Awareness', p.nivel_3?.etapa_funnel_awareness || p.etapa_funnel_awareness);
    txt += field('Etapa funnel: Consideration', p.nivel_3?.etapa_funnel_consideration || p.etapa_funnel_consideration);
    txt += field('Etapa funnel: Decision', p.nivel_3?.etapa_funnel_decision || p.etapa_funnel_decision);
    txt += field('Estrategia', p.nivel_3?.estrategia || p.estrategia);
    txt += field('Resistencia', p.nivel_3?.resistencia || p.resistencia);

    txt += subsection('Nivel 4 — Resultados');
    txt += field('Métrica visible', p.nivel_4?.metrica_visible || p.metrica_visible);
    txt += field('Métrica invisible', p.nivel_4?.metrica_invisible || p.metrica_invisible);
    txt += field('Indicador de buena vida', p.nivel_4?.indicador_buena_vida || p.indicador_buena_vida);
    txt += field('Review trimestral', p.nivel_4?.review_trimestral || p.review_trimestral);
    txt += field('Commitment', p.nivel_4?.commitment || p.commitment);
  }

  // ── ÁRBOL ──
  const a = alumno.arbol;
  if (a) {
    txt += section('EL ÁRBOL — PLAYBOOK DE MARCA');

    txt += subsection('La Semilla');
    txt += field('¿Cuál es tu propósito?', a.semilla?.proposito);
    txt += field('¿Cuál es tu visión?', a.semilla?.vision);
    txt += field('¿Cuál es tu intención?', a.semilla?.intencion);
    txt += field('¿Cuáles son tus objetivos?', a.semilla?.objetivos);

    txt += subsection('Las Raíces');
    txt += field('¿Cuáles son tus creencias fundamentales?', a.raices?.creencias);
    txt += field('Valores', val(a.raices?.valores));
    txt += field('¿Cómo defines tu identidad?', a.raices?.identidad);
    txt += field('¿Cuál es tu historia?', a.raices?.historia);
    txt += field('Conocimientos y habilidades', a.raices?.conocimientoHabilidades);
    txt += field('Fortalezas', val(a.raices?.fortalezas));
    txt += field('Experiencia', a.raices?.experiencia);
    txt += field('Intuición', a.raices?.intuicion);

    txt += subsection('El Tronco');
    txt += field('¿Cuál es tu tema principal?', a.tronco?.temaPrincipal);
    txt += field('¿Cuál es tu propuesta de valor?', a.tronco?.propuestaValor);
    txt += field('¿Cuál es tu zona de genialidad?', a.tronco?.zonaGenialidad);

    txt += subsection('Las Ramas');
    txt += field('Pasiones', val(a.ramas?.pasiones));
    txt += field('Intereses', val(a.ramas?.intereses));
    txt += field('Hobbies', val(a.ramas?.hobbies));
    txt += field('Habilidades secundarias', val(a.ramas?.habilidadesSecundarias));
    txt += field('Contextos profesionales', val(a.ramas?.contextosProfesionales));
    txt += field('Formatos de comunicación', val(a.ramas?.formatosComunicacion));

    txt += subsection('La Copa');
    txt += field('Atributos', val(a.copa?.atributos));
    if (a.copa?.arquetipos?.length) {
      txt += 'Arquetipos:\n';
      a.copa.arquetipos.forEach((arq: any) => {
        txt += `  - ${arq.nombre}: ${arq.porcentaje}%\n`;
      });
    }
    txt += field('Tono de voz', a.copa?.tonoDeVoz);
    txt += field('Narrativa', a.copa?.narrativa);
    txt += field('Energía', a.copa?.energia);
    txt += field('Presencia', a.copa?.presencia);
    txt += field('Percepción', a.copa?.percepcion);

    txt += subsection('Los Frutos');
    txt += field('¿Qué deseas recibir?', a.frutos?.queDeseasRecibir);
    txt += field('Meta de seguidores', a.frutos?.metaSeguidores);
    txt += field('Mensajes que quieres recibir', a.frutos?.mensajesQueQuieres);
    txt += field('Impacto deseado', a.frutos?.impactoDeseado);
    txt += field('Testimonio ideal', a.frutos?.testimonioIdeal);

    txt += subsection('El Entorno');
    txt += field('¿Quién es tu audiencia principal?', a.entorno?.audienciaPrincipal);
    txt += field('¿Dónde están?', val(a.entorno?.dondeEstan));
    txt += field('Competencia', a.entorno?.competencia);
    txt += field('Aliados potenciales', a.entorno?.aliadosPotenciales);
    txt += field('Posicionamiento', a.entorno?.posicionamiento);

    txt += subsection('El Tiempo');
    txt += field('Ritmo de publicación', a.tiempo?.ritmoPublicacion);
    txt += field('Próximo hito', a.tiempo?.proximoHito);
    txt += field('Meta anual', a.tiempo?.metaAnual);
    txt += field('Definición de buena vida', a.tiempo?.buenaVida);

    if (a.cofre?.productos?.length) {
      txt += subsection('El Cofre — Productos');
      a.cofre.productos.forEach((prod: any, i: number) => {
        txt += `\nProducto ${i + 1}: ${prod.nombreProducto || prod.nombre || 'Sin nombre'}\n`;
        txt += field('  Oferta', prod.oferta);
        txt += field('  Packaging narrativo', prod.packagingNarrativo);
        txt += field('  Cliente', prod.cliente);
        txt += field('  Canales', prod.canales);
        txt += field('  Sistema de entrega', prod.sistemaEntrega);
        txt += field('  Precio', prod.precio);
        txt += field('  Estado actual', prod.estadoActual);
      });
    }
  }

  // ── BRÚJULA ──
  const b = alumno.brujula;
  if (b) {
    txt += section('LA BRÚJULA — SISTEMA DE CONTENIDO');

    txt += subsection('Briefing');
    txt += field('¿Cuál es tu tema raíz?', b.briefing?.temaRaiz);
    txt += field('¿Cuál es tu propuesta de valor?', b.briefing?.propuestaValor);
    txt += field('¿Cuál es tu etiqueta profesional?', b.briefing?.etiquetaProfesional);
    txt += field('¿Por qué tú?', b.briefing?.porQueTu);

    const buyers = b.buyers || (b.buyer?.nombre ? [b.buyer] : []);
    if (buyers.length > 0) {
      txt += subsection('Buyer Personas');
      buyers.forEach((bp: any, i: number) => {
        txt += `\nPersona ${i + 1}: ${bp.nombre || 'Sin nombre'}\n`;
        txt += field('  Edad', bp.edad);
        txt += field('  Profesión', bp.profesion);
        txt += field('  ¿Qué quiere?', bp.queQuiere);
        txt += field('  ¿Qué le frena?', bp.queLeFrena);
        txt += field('  ¿Qué consume?', bp.queConsumo);
        txt += field('  ¿Dónde está?', bp.dondeEsta);
        txt += field('  ¿Cómo habla?', bp.lenguaje);
      });
    }

    txt += subsection('Mapa de Empatía');
    txt += field('¿Qué ve tu audiencia?', b.empathy?.queVe);
    txt += field('¿Qué oye?', b.empathy?.queOye);
    txt += field('¿Qué dice y hace?', b.empathy?.queDiceHace);
    txt += field('¿Qué piensa y siente?', b.empathy?.quePiensaSiente);
    txt += field('¿Cuáles son sus dolores?', b.empathy?.dolores);
    txt += field('¿Cuáles son sus deseos?', b.empathy?.deseos);

    txt += subsection('Insight');
    txt += field('Insight estratégico', b.insight?.insight);
    txt += field('Frase que diría tu audiencia', b.insight?.fraseAudiencia);

    if (b.tree?.pilares?.length) {
      txt += subsection('Pilares de Contenido');
      b.tree.pilares.forEach((pilar: any, i: number) => {
        txt += `\nPilar ${i + 1}: ${pilar.nombre || 'Sin nombre'}\n`;
        txt += field('  Subtemas', val(pilar.subtemas));
        txt += field('  Ángulos', val(pilar.angulos));
        txt += field('  Titulares', val(pilar.titulares));
      });
    }

    txt += subsection('Canales');
    txt += field('Canales seleccionados', val(b.channels?.canales));
    txt += field('Objetivos principales', val(b.channels?.objetivosPrincipales));
  }

  txt += `\n${'='.repeat(60)}\n`;
  txt += `Fin del informe de ${alumno.displayName || alumno.email}\n`;

  // Download
  const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a2 = document.createElement('a');
  a2.href = url;
  a2.download = `alumno-${(alumno.displayName || alumno.email).replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.txt`;
  a2.click();
  URL.revokeObjectURL(url);
}

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
          {/* Back button + Export */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setSelectedAlumnoId(null)}
              className="text-primary hover:text-primary/80 font-headline transition-colors"
            >
              ← Volver a la lista
            </button>
            <button
              onClick={() => exportAlumnoToTxt(selectedAlumno)}
              className="bg-negro text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-negro/80 transition-colors"
            >
              📄 Exportar a TXT
            </button>
          </div>

          {/* Header */}
          <div className="bg-white border border-outline-variant rounded-lg p-6 mb-6">
            <h1 className="font-headline text-3xl text-on-surface mb-2">{selectedAlumno.displayName}</h1>
            <p className="text-sm text-on-surface-variant mb-4">{selectedAlumno.email}</p>

            <div className="flex flex-wrap gap-4 text-sm mb-4">
              <div>
                <span className="text-on-surface-variant">Registrado:</span>
                <span className="ml-2 font-semibold text-on-surface">
                  {new Date(selectedAlumno.createdAt).toLocaleDateString('es-ES')}
                </span>
              </div>
              {selectedAlumno.lastUpdated && (
                <div>
                  <span className="text-on-surface-variant">Última actividad:</span>
                  <span className="ml-2 font-semibold text-on-surface">
                    {new Date(selectedAlumno.lastUpdated).toLocaleDateString('es-ES')}
                  </span>
                </div>
              )}
            </div>

            {/* Phase Progress */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-on-surface-variant">Fases completadas:</span>
              <div className="flex gap-3">
                <div className="flex items-center gap-2">
                  <PhaseIcon completed={selectedAlumno.piramideCompleted} />
                  <span className="text-xs text-on-surface-variant">Pirámide</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhaseIcon completed={selectedAlumno.arbolCompleted} />
                  <span className="text-xs text-on-surface-variant">Árbol</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhaseIcon completed={!!selectedAlumno.rutaAsignada} />
                  <span className="text-xs text-on-surface-variant">Ruta</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhaseIcon completed={selectedAlumno.brujulaCompleted} />
                  <span className="text-xs text-on-surface-variant">Brújula</span>
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
        <Link href="/admin" className="text-primary hover:text-primary/80 font-headline transition-colors mb-6 inline-block">
          ← Volver
        </Link>

        {/* Title */}
        <h1 className="font-headline text-4xl text-on-surface mb-2">Mis Alumnos</h1>
        <p className="text-sm text-on-surface-variant mb-6">Total: {stats.total} alumnos</p>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <div className="bg-white border border-outline-variant rounded-lg p-4">
            <div className="text-2xl font-headline text-primary">{stats.total}</div>
            <div className="text-xs text-on-surface-variant">Total</div>
          </div>
          <div className="bg-white border border-outline-variant rounded-lg p-4">
            <div className="text-2xl font-headline text-primary">{stats.piramideCompleted}</div>
            <div className="text-xs text-on-surface-variant">Pirámide ✓</div>
          </div>
          <div className="bg-white border border-outline-variant rounded-lg p-4">
            <div className="text-2xl font-headline text-primary">{stats.arbolCompleted}</div>
            <div className="text-xs text-on-surface-variant">Árbol ✓</div>
          </div>
          <div className="bg-white border border-outline-variant rounded-lg p-4">
            <div className="text-2xl font-headline text-primary">{stats.rutaAsignada}</div>
            <div className="text-xs text-on-surface-variant">Ruta asignada</div>
          </div>
          <div className="bg-white border border-outline-variant rounded-lg p-4">
            <div className="text-2xl font-headline text-primary">{stats.brujulaCompleted}</div>
            <div className="text-xs text-on-surface-variant">Brújula ✓</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-white text-on-surface placeholder-muted focus:outline-none focus:ring-2 focus:ring-naranja"
          />
        </div>

        {/* Students List */}
        {sortedAlumnos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-on-surface-variant">No hay alumnos que coincidan con la búsqueda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedAlumnos.map((alumno) => (
              <button
                key={alumno.id}
                onClick={() => setSelectedAlumnoId(alumno.id)}
                className="w-full text-left bg-white border border-outline-variant rounded-lg p-4 hover:border-naranja hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-48">
                    <h3 className="font-semibold text-on-surface">{alumno.displayName}</h3>
                    <p className="text-xs text-on-surface-variant">{alumno.email}</p>
                  </div>

                  {/* Phase Progress */}
                  <div className="flex gap-2">
                    <PhaseIcon completed={alumno.piramideCompleted} />
                    <PhaseIcon completed={alumno.arbolCompleted} />
                    <PhaseIcon completed={!!alumno.rutaAsignada} />
                    <PhaseIcon completed={alumno.brujulaCompleted} />
                  </div>

                  <div className="text-right min-w-40">
                    <div className="text-xs text-on-surface-variant">
                      Registrado: {new Date(alumno.createdAt).toLocaleDateString('es-ES')}
                    </div>
                    {alumno.lastUpdated && (
                      <div className="text-xs text-on-surface-variant">
                        Última: {new Date(alumno.lastUpdated).toLocaleDateString('es-ES')}
                      </div>
                    )}
                  </div>

                  <div className="text-primary font-headline">Ver detalle →</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
