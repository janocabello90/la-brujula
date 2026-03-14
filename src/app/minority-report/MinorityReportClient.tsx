"use client";

import AppShell from "@/components/AppShell";
import type { HistoryEntry } from "@/lib/types";

interface Props {
  data: any;
  history: HistoryEntry[];
}

export default function MinorityReportClient({ data, history }: Props) {
  const exportExcel = async () => {
    const XLSX = await import("xlsx");

    const wb = XLSX.utils.book_new();

    // Sheet 1: Briefing
    const briefingRows = [
      ["Campo", "Valor"],
      ["Tema raíz", data?.briefing?.temaRaiz || ""],
      ["Propuesta de valor", data?.briefing?.propuestaValor || ""],
      ["Etiqueta profesional", data?.briefing?.etiquetaProfesional || ""],
      ["¿Por qué tú?", data?.briefing?.porQueTu || ""],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(briefingRows), "Briefing");

    // Sheet 2: Buyer Persona
    const buyerRows = [
      ["Campo", "Valor"],
      ["Nombre", data?.buyer?.nombre || ""],
      ["Edad", data?.buyer?.edad || ""],
      ["Profesión", data?.buyer?.profesion || ""],
      ["Qué quiere", data?.buyer?.queQuiere || ""],
      ["Qué le frena", data?.buyer?.queLeFrena || ""],
      ["Qué consume", data?.buyer?.queConsumo || ""],
      ["Dónde está", data?.buyer?.dondeEsta || ""],
      ["Lenguaje", data?.buyer?.lenguaje || ""],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(buyerRows), "Buyer Persona");

    // Sheet 3: Mapa Empatía
    const empathyRows = [
      ["Campo", "Valor"],
      ["Qué ve", data?.empathy?.queVe || ""],
      ["Qué oye", data?.empathy?.queOye || ""],
      ["Qué dice y hace", data?.empathy?.queDiceHace || ""],
      ["Qué piensa y siente", data?.empathy?.quePiensaSiente || ""],
      ["Dolores", data?.empathy?.dolores || ""],
      ["Deseos", data?.empathy?.deseos || ""],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(empathyRows), "Mapa Empatía");

    // Sheet 4: Insight
    const insightRows = [
      ["Campo", "Valor"],
      ["Insight", data?.insight?.insight || ""],
      ["Frase de audiencia", data?.insight?.fraseAudiencia || ""],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(insightRows), "Insight");

    // Sheet 5: Árbol
    const treeRows = [["Pilar", "Subtema", "Ángulo"]];
    (data?.tree?.pilares || []).forEach((p: any) => {
      const subs = p.subtemas?.length ? p.subtemas : [""];
      const angs = p.angulos?.length ? p.angulos : [""];
      subs.forEach((sub: string) => {
        angs.forEach((ang: string) => {
          treeRows.push([p.nombre, sub, ang]);
        });
      });
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(treeRows), "Árbol");

    // Sheet 6: Historial
    if (history.length > 0) {
      const historyRows = [["Fecha", "Pilar", "Subtema", "Ángulo", "Formato", "Tono", "Objetivo", "Energía"]];
      history.forEach((h) => {
        historyRows.push([h.date, h.pilar, h.subtema, h.angulo, h.formato, h.tono, h.objetivo, h.energia]);
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(historyRows), "Historial");
    }

    XLSX.writeFile(wb, "La_Brujula_Minority_Report.xlsx");
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-card rounded-card shadow-card p-6 mb-4">
      <h3 className="font-heading text-xl text-negro mb-3">{title}</h3>
      {children}
    </div>
  );

  const Field = ({ label, value }: { label: string; value: string }) => (
    <div className="mb-2">
      <span className="text-xs font-semibold text-muted uppercase tracking-wide">{label}</span>
      <p className="text-negro text-sm mt-0.5">{value || <span className="text-muted-light italic">Sin completar</span>}</p>
    </div>
  );

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl text-negro">Minority Report</h1>
            <p className="text-muted text-sm">Tu mapa estratégico completo</p>
          </div>
          <button
            onClick={exportExcel}
            className="bg-success text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            📊 Exportar Excel
          </button>
        </div>

        {/* Briefing */}
        <Section title="🎯 Briefing Personal">
          <Field label="Tema raíz" value={data?.briefing?.temaRaiz} />
          <Field label="Propuesta de valor" value={data?.briefing?.propuestaValor} />
          <Field label="Etiqueta profesional" value={data?.briefing?.etiquetaProfesional} />
          <Field label="¿Por qué tú?" value={data?.briefing?.porQueTu} />
        </Section>

        {/* Buyer */}
        <Section title="👤 Buyer Persona">
          <div className="grid grid-cols-2 gap-x-6">
            <Field label="Nombre" value={data?.buyer?.nombre} />
            <Field label="Edad" value={data?.buyer?.edad} />
            <Field label="Profesión" value={data?.buyer?.profesion} />
            <Field label="Dónde está" value={data?.buyer?.dondeEsta} />
          </div>
          <Field label="Qué quiere" value={data?.buyer?.queQuiere} />
          <Field label="Qué le frena" value={data?.buyer?.queLeFrena} />
          <Field label="Qué consume" value={data?.buyer?.queConsumo} />
          <Field label="Lenguaje" value={data?.buyer?.lenguaje} />
        </Section>

        {/* Empathy */}
        <Section title="🧠 Mapa de Empatía">
          <div className="grid grid-cols-2 gap-x-6">
            <Field label="Qué ve" value={data?.empathy?.queVe} />
            <Field label="Qué oye" value={data?.empathy?.queOye} />
            <Field label="Qué dice y hace" value={data?.empathy?.queDiceHace} />
            <Field label="Qué piensa y siente" value={data?.empathy?.quePiensaSiente} />
          </div>
          <Field label="Dolores" value={data?.empathy?.dolores} />
          <Field label="Deseos" value={data?.empathy?.deseos} />
        </Section>

        {/* Insight */}
        <Section title="💡 El Insight">
          <Field label="Insight" value={data?.insight?.insight} />
          <Field label="Frase de la audiencia" value={data?.insight?.fraseAudiencia} />
        </Section>

        {/* Tree */}
        <Section title="🌳 Árbol de Contenidos">
          {(data?.tree?.pilares || []).map((pilar: any, i: number) => (
            <div key={i} className="border border-borde rounded-lg p-4 mb-3">
              <h4 className="font-semibold text-negro mb-2">
                <span className="pill pill-dark mr-2">{pilar.nombre || `Pilar ${i + 1}`}</span>
              </h4>
              {pilar.subtemas?.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs text-muted">Subtemas: </span>
                  {pilar.subtemas.map((sub: string, j: number) => (
                    <span key={j} className="subtema-tag">{sub}</span>
                  ))}
                </div>
              )}
              {pilar.angulos?.length > 0 && (
                <div>
                  <span className="text-xs text-muted">Ángulos: </span>
                  {pilar.angulos.map((ang: string, j: number) => (
                    <span key={j} className="pill pill-light mr-1 mb-1">{ang}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </Section>

        {/* Channels */}
        <Section title="📡 Canales y Objetivos">
          <div className="mb-3">
            <span className="text-xs font-semibold text-muted uppercase tracking-wide">Canales</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {(data?.channels?.canales || []).map((ch: string) => (
                <span key={ch} className="pill pill-accent">{ch}</span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold text-muted uppercase tracking-wide">Objetivos</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {(data?.channels?.objetivosPrincipales || []).map((obj: string) => (
                <span key={obj} className="pill pill-dark">{obj}</span>
              ))}
            </div>
          </div>
        </Section>

        {/* History */}
        {history.length > 0 && (
          <Section title="📚 Historial de sugerencias">
            <div className="space-y-2">
              {history.slice(0, 10).map((h, i) => (
                <div key={i} className="flex items-center gap-3 text-sm border-b border-borde pb-2 last:border-0">
                  <span className="text-muted-light text-xs flex-shrink-0">{h.date}</span>
                  <span className="pill pill-dark text-xs">{h.pilar}</span>
                  <span className="text-muted">→</span>
                  <span className="text-negro">{h.subtema}</span>
                  <span className="text-muted-light text-xs ml-auto">{h.formato}</span>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </AppShell>
  );
}
