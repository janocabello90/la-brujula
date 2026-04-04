"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import type { HistoryEntry } from "@/lib/types";

interface Props {
  userId: string;
  data: any;
  history: HistoryEntry[];
  hasApiKey: boolean;
}

// Brand colors
const CREMA = "FAF7F2";
const NEGRO = "111111";
const NARANJA = "E8920A";
const GRIS_CLARO = "F5F5F5";
const GRIS_MEDIO = "E0E0E0";
const BLANCO = "FFFFFF";

interface Suggestion {
  pilar: string;
  subtema: string;
  angulo: string;
  formato: string;
  canal: string;
  titular: string;
}

export default function MinorityReportClient({ userId, data, history, hasApiKey }: Props) {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const exportExcel = async () => {
    setExporting(true);
    setExportError("");

    try {
      // Step 1: Generate AI suggestions if user has API key
      let suggestions: Suggestion[] = [];
      if (hasApiKey) {
        try {
          const res = await fetch("/api/export-suggestions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
          });
          if (res.ok) {
            const json = await res.json();
            suggestions = json.suggestions || [];
          }
        } catch {
          // Continue without suggestions if API fails
        }
      }

      // Step 2: Build Excel with ExcelJS
      const ExcelJS = await import("exceljs");
      const wb = new ExcelJS.Workbook();
      wb.creator = "La Brújula de Contenido";
      wb.created = new Date();

      const ws = wb.addWorksheet("Mi Mapa Estratégico", {
        properties: { defaultColWidth: 40 },
        views: [{ showGridLines: false }],
      });

      // Column widths
      ws.getColumn(1).width = 28;
      ws.getColumn(2).width = 50;
      ws.getColumn(3).width = 30;

      let row = 1;

      // ============================
      // HEADER
      // ============================
      const headerRow = ws.getRow(row);
      ws.mergeCells(row, 1, row, 3);
      const headerCell = ws.getCell(row, 1);
      headerCell.value = "LA BRÚJULA DE CONTENIDO";
      headerCell.font = { name: "Calibri", size: 22, bold: true, color: { argb: NEGRO } };
      headerCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: CREMA } };
      headerCell.alignment = { horizontal: "center", vertical: "middle" };
      headerRow.height = 50;
      row++;

      // Subtitle
      ws.mergeCells(row, 1, row, 3);
      const subCell = ws.getCell(row, 1);
      subCell.value = "Tu mapa estratégico de marca personal";
      subCell.font = { name: "Calibri", size: 11, italic: true, color: { argb: "666666" } };
      subCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: CREMA } };
      subCell.alignment = { horizontal: "center", vertical: "middle" };
      ws.getRow(row).height = 24;
      row++;

      // Date
      ws.mergeCells(row, 1, row, 3);
      const dateCell = ws.getCell(row, 1);
      dateCell.value = `Generado el ${new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}`;
      dateCell.font = { name: "Calibri", size: 9, color: { argb: "999999" } };
      dateCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: CREMA } };
      dateCell.alignment = { horizontal: "center", vertical: "middle" };
      ws.getRow(row).height = 20;
      row++;
      row++; // blank

      // ============================
      // HELPER FUNCTIONS
      // ============================
      const addSectionHeader = (title: string) => {
        ws.mergeCells(row, 1, row, 3);
        const cell = ws.getCell(row, 1);
        cell.value = title;
        cell.font = { name: "Calibri", size: 14, bold: true, color: { argb: BLANCO } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NARANJA } };
        cell.alignment = { horizontal: "left", vertical: "middle" };
        cell.border = {
          top: { style: "thin", color: { argb: NARANJA } },
          bottom: { style: "thin", color: { argb: NARANJA } },
        };
        ws.getRow(row).height = 32;
        row++;
      };

      const addField = (label: string, value: string) => {
        const labelCell = ws.getCell(row, 1);
        labelCell.value = label;
        labelCell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "555555" } };
        labelCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GRIS_CLARO } };
        labelCell.alignment = { vertical: "top", wrapText: true };
        labelCell.border = {
          bottom: { style: "hair", color: { argb: GRIS_MEDIO } },
        };

        ws.mergeCells(row, 2, row, 3);
        const valCell = ws.getCell(row, 2);
        valCell.value = value || "—";
        valCell.font = { name: "Calibri", size: 10, color: { argb: NEGRO } };
        valCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GRIS_CLARO } };
        valCell.alignment = { vertical: "top", wrapText: true };
        valCell.border = {
          bottom: { style: "hair", color: { argb: GRIS_MEDIO } },
        };

        ws.getRow(row).height = Math.max(20, Math.ceil((value || "").length / 60) * 16);
        row++;
      };

      const addSpacer = () => { row++; };

      // ============================
      // BRIEFING PERSONAL
      // ============================
      addSectionHeader("🎯  BRIEFING PERSONAL");
      addField("Tema raíz", data?.briefing?.temaRaiz);
      addField("Propuesta de valor", data?.briefing?.propuestaValor);
      addField("Etiqueta profesional", data?.briefing?.etiquetaProfesional);
      addField("¿Por qué tú?", data?.briefing?.porQueTu);
      addSpacer();

      // ============================
      // BUYER PERSONAS
      // ============================
      const buyersList = data?.buyers && data.buyers.length > 0 ? data.buyers : data?.buyer?.nombre ? [data.buyer] : [];
      addSectionHeader("👤  BUYER PERSONAS");
      buyersList.forEach((b: any, i: number) => {
        if (i > 0) addSpacer();
        if (buyersList.length > 1) addField(`— Persona ${i + 1}`, b.nombre || "");
        else addField("Nombre", b.nombre);
        addField("Edad", b.edad);
        addField("Profesión", b.profesion);
        addField("Qué quiere", b.queQuiere);
        addField("Qué le frena", b.queLeFrena);
        addField("Qué consume", b.queConsumo);
        addField("Dónde está", b.dondeEsta);
        addField("Lenguaje", b.lenguaje);
      });
      addSpacer();

      // ============================
      // MAPA DE EMPATÍA
      // ============================
      addSectionHeader("🧠  MAPA DE EMPATÍA");
      addField("Qué ve", data?.empathy?.queVe);
      addField("Qué oye", data?.empathy?.queOye);
      addField("Qué dice y hace", data?.empathy?.queDiceHace);
      addField("Qué piensa y siente", data?.empathy?.quePiensaSiente);
      addField("Dolores", data?.empathy?.dolores);
      addField("Deseos", data?.empathy?.deseos);
      addSpacer();

      // ============================
      // INSIGHT
      // ============================
      addSectionHeader("💡  EL INSIGHT");
      addField("Insight", data?.insight?.insight);
      addField("Frase de la audiencia", data?.insight?.fraseAudiencia);
      addSpacer();

      // ============================
      // ÁRBOL DE CONTENIDOS
      // ============================
      addSectionHeader("🌳  ÁRBOL DE CONTENIDOS");

      // Table header
      const treeHeaderLabels = ["Pilar", "Subtema", "Ángulo"];
      treeHeaderLabels.forEach((label, i) => {
        const cell = ws.getCell(row, i + 1);
        cell.value = label;
        cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: BLANCO } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "333333" } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          bottom: { style: "thin", color: { argb: "333333" } },
        };
      });
      ws.getRow(row).height = 24;
      row++;

      // Tree data
      const pilares = data?.tree?.pilares || [];
      let treeRowIdx = 0;
      pilares.forEach((p: any) => {
        const subs = p.subtemas?.length ? p.subtemas : ["—"];
        const angs = p.angulos?.length ? p.angulos : ["—"];
        const maxLen = Math.max(subs.length, angs.length);
        for (let j = 0; j < maxLen; j++) {
          const bgColor = treeRowIdx % 2 === 0 ? BLANCO : GRIS_CLARO;

          const pilarCell = ws.getCell(row, 1);
          pilarCell.value = j === 0 ? p.nombre : "";
          pilarCell.font = { name: "Calibri", size: 10, bold: j === 0, color: { argb: NEGRO } };
          pilarCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
          pilarCell.alignment = { vertical: "middle" };

          const subCell = ws.getCell(row, 2);
          subCell.value = subs[j] || "";
          subCell.font = { name: "Calibri", size: 10, color: { argb: NEGRO } };
          subCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
          subCell.alignment = { vertical: "middle" };

          const angCell = ws.getCell(row, 3);
          angCell.value = angs[j] || "";
          angCell.font = { name: "Calibri", size: 10, color: { argb: NEGRO } };
          angCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
          angCell.alignment = { vertical: "middle" };

          row++;
          treeRowIdx++;
        }
      });
      addSpacer();

      // ============================
      // CANALES Y OBJETIVOS
      // ============================
      addSectionHeader("📡  CANALES Y OBJETIVOS");
      addField("Canales", (data?.channels?.canales || []).join("  ·  "));
      addField("Objetivos principales", (data?.channels?.objetivosPrincipales || []).join("  ·  "));
      addSpacer();

      // ============================
      // SUGERENCIAS DE CONTENIDO (AI-generated)
      // ============================
      if (suggestions.length > 0) {
        addSectionHeader("✨  SUGERENCIAS DE CONTENIDO — by La Brújula");

        // Table header
        const sugHeaders = ["Nº", "Pilar · Subtema · Ángulo", "Formato", "Canal", "Titular propuesto"];
        // Adjust columns for this section
        sugHeaders.forEach((label, i) => {
          const col = i + 1;
          const cell = ws.getCell(row, col);
          cell.value = label;
          cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: BLANCO } };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "333333" } };
          cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        });
        // Need 5 columns for suggestions
        ws.getColumn(4).width = 14;
        ws.getColumn(5).width = 40;
        ws.getRow(row).height = 24;
        row++;

        suggestions.slice(0, 10).forEach((s, i) => {
          const bgColor = i % 2 === 0 ? BLANCO : GRIS_CLARO;

          const numCell = ws.getCell(row, 1);
          numCell.value = i + 1;
          numCell.font = { name: "Calibri", size: 10, bold: true, color: { argb: NARANJA } };
          numCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
          numCell.alignment = { horizontal: "center", vertical: "middle" };

          const contentCell = ws.getCell(row, 2);
          contentCell.value = `${s.pilar} · ${s.subtema} · ${s.angulo}`;
          contentCell.font = { name: "Calibri", size: 10, color: { argb: NEGRO } };
          contentCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
          contentCell.alignment = { vertical: "middle", wrapText: true };

          const fmtCell = ws.getCell(row, 3);
          fmtCell.value = s.formato;
          fmtCell.font = { name: "Calibri", size: 10, color: { argb: NEGRO } };
          fmtCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
          fmtCell.alignment = { horizontal: "center", vertical: "middle" };

          const canalCell = ws.getCell(row, 4);
          canalCell.value = s.canal;
          canalCell.font = { name: "Calibri", size: 10, color: { argb: NEGRO } };
          canalCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
          canalCell.alignment = { horizontal: "center", vertical: "middle" };

          const titleCell = ws.getCell(row, 5);
          titleCell.value = s.titular;
          titleCell.font = { name: "Calibri", size: 10, color: { argb: NEGRO } };
          titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
          titleCell.alignment = { vertical: "middle", wrapText: true };

          ws.getRow(row).height = 28;
          row++;
        });

        addSpacer();
      }

      // ============================
      // HISTORIAL
      // ============================
      if (history.length > 0) {
        addSectionHeader("📚  HISTORIAL DE SUGERENCIAS");

        const histHeaders = ["Fecha", "Pilar", "Subtema", "Formato", "Tono"];
        histHeaders.forEach((label, i) => {
          const cell = ws.getCell(row, i + 1);
          cell.value = label;
          cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: BLANCO } };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "333333" } };
          cell.alignment = { horizontal: "center", vertical: "middle" };
        });
        ws.getRow(row).height = 24;
        row++;

        history.slice(0, 15).forEach((h, i) => {
          const bgColor = i % 2 === 0 ? BLANCO : GRIS_CLARO;
          const vals = [h.date, h.pilar, h.subtema, h.formato, h.tono];
          vals.forEach((val, j) => {
            const cell = ws.getCell(row, j + 1);
            cell.value = val || "";
            cell.font = { name: "Calibri", size: 10, color: { argb: NEGRO } };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
            cell.alignment = { vertical: "middle" };
          });
          row++;
        });
        addSpacer();
      }

      // ============================
      // FOOTER
      // ============================
      ws.mergeCells(row, 1, row, 3);
      const footerCell = ws.getCell(row, 1);
      footerCell.value = "La Brújula de Contenido — Tu mapa estratégico para crear con dirección";
      footerCell.font = { name: "Calibri", size: 9, italic: true, color: { argb: "999999" } };
      footerCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: CREMA } };
      footerCell.alignment = { horizontal: "center", vertical: "middle" };
      ws.getRow(row).height = 28;

      // Step 3: Download
      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "La_Brujula_Minority_Report.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Export error:", err);
      setExportError("Error al exportar. Inténtalo de nuevo.");
    } finally {
      setExporting(false);
    }
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-card rounded-card shadow-card p-6 mb-4">
      <h3 className="font-headline text-xl text-on-surface mb-3">{title}</h3>
      {children}
    </div>
  );

  const Field = ({ label, value }: { label: string; value: string }) => (
    <div className="mb-2">
      <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">{label}</span>
      <p className="text-on-surface text-sm mt-0.5">{value || <span className="text-on-surface-variant-light italic">Sin completar</span>}</p>
    </div>
  );

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-headline text-3xl text-on-surface">Minority Report</h1>
            <p className="text-on-surface-variant text-sm">Tu mapa estratégico completo</p>
          </div>
          <button
            onClick={exportExcel}
            disabled={exporting}
            className="bg-success text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {exporting ? (
              <span className="flex items-center gap-2">
                <span className="loader-sm" /> Generando...
              </span>
            ) : (
              "📊 Exportar Excel"
            )}
          </button>
        </div>

        {exportError && (
          <div className="bg-danger/10 border border-danger/30 rounded-lg p-3 text-danger text-sm mb-4">
            {exportError}
          </div>
        )}

        {!hasApiKey && (
          <div className="bg-primary-container/10 border border-naranja/30 rounded-lg p-4 text-sm mb-6">
            <p className="text-on-surface">
              ⚠️ Sin API Key, el Excel se exportará sin sugerencias de contenido IA.{" "}
              <Link href="/settings" className="text-primary hover:underline font-medium">
                Configúrala en Ajustes
              </Link>
            </p>
          </div>
        )}

        {/* Briefing */}
        <Section title="🎯 Briefing Personal">
          <Field label="Tema raíz" value={data?.briefing?.temaRaiz} />
          <Field label="Propuesta de valor" value={data?.briefing?.propuestaValor} />
          <Field label="Etiqueta profesional" value={data?.briefing?.etiquetaProfesional} />
          <Field label="¿Por qué tú?" value={data?.briefing?.porQueTu} />
        </Section>

        {/* Buyers */}
        <Section title={`👤 Buyer Persona${(data?.buyers || []).length > 1 ? "s" : ""}`}>
          {(data?.buyers && data.buyers.length > 0 ? data.buyers : data?.buyer?.nombre ? [data.buyer] : []).map((b: any, i: number) => (
            <div key={i} className={`${i > 0 ? "mt-4 pt-4 border-t border-outline/40" : ""}`}>
              {(data?.buyers || []).length > 1 && (
                <span className="text-xs font-semibold text-primary mb-2 block">Persona {i + 1}</span>
              )}
              <div className="grid grid-cols-2 gap-x-6">
                <Field label="Nombre" value={b.nombre} />
                <Field label="Edad" value={b.edad} />
                <Field label="Profesión" value={b.profesion} />
                <Field label="Dónde está" value={b.dondeEsta} />
              </div>
              <Field label="Qué quiere" value={b.queQuiere} />
              <Field label="Qué le frena" value={b.queLeFrena} />
              <Field label="Qué consume" value={b.queConsumo} />
              <Field label="Lenguaje" value={b.lenguaje} />
            </div>
          ))}
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
            <div key={i} className="border border-outline rounded-lg p-4 mb-3">
              <h4 className="font-semibold text-on-surface mb-2">
                <span className="pill pill-dark mr-2">{pilar.nombre || `Pilar ${i + 1}`}</span>
              </h4>
              {pilar.subtemas?.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs text-on-surface-variant">Subtemas: </span>
                  {pilar.subtemas.map((sub: string, j: number) => (
                    <span key={j} className="subtema-tag">{sub}</span>
                  ))}
                </div>
              )}
              {pilar.angulos?.length > 0 && (
                <div>
                  <span className="text-xs text-on-surface-variant">Ángulos: </span>
                  {pilar.angulos.map((ang: string, j: number) => (
                    <span key={j} className="pill pill-light mr-1 mb-1">{ang}</span>
                  ))}
                </div>
              )}
              {pilar.titulares?.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs text-on-surface-variant">Titulares de referencia:</span>
                  <div className="mt-1 space-y-1">
                    {pilar.titulares.map((tit: string, j: number) => (
                      <p key={j} className="text-xs text-on-surface/70 italic pl-2 border-l-2 border-naranja/30">&ldquo;{tit}&rdquo;</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </Section>

        {/* Channels */}
        <Section title="📡 Canales y Objetivos">
          <div className="mb-3">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Canales</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {(data?.channels?.canales || []).map((ch: string) => (
                <span key={ch} className="pill pill-accent">{ch}</span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Objetivos</span>
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
                <div key={i} className="flex items-center gap-3 text-sm border-b border-outline pb-2 last:border-0">
                  <span className="text-on-surface-variant-light text-xs flex-shrink-0">{h.date}</span>
                  <span className="pill pill-dark text-xs">{h.pilar}</span>
                  <span className="text-on-surface-variant">→</span>
                  <span className="text-on-surface">{h.subtema}</span>
                  <span className="text-on-surface-variant-light text-xs ml-auto">{h.formato}</span>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </AppShell>
  );
}
