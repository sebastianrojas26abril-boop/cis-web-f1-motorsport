"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Trash2, ExternalLink, Plus } from "lucide-react";
import { PIPELINE_STAGES, PIPELINE_STAGE_LABELS, NO_DATA } from "@/lib/constants";
import { updateContent, deleteContent } from "@/lib/actions/content";

type Piece = {
  id: number;
  number: number;
  title: string;
  pillar: string;
  funnelStage: string;
  opportunityScore: number | null;
  persona: string | null;
  caso: string | null;
  status: string;
  publishDate: string | null;
};

export function ContentTable({
  initialPieces,
  pillars,
  funnelStages,
}: {
  initialPieces: Piece[];
  pillars: string[];
  funnelStages: string[];
}) {
  const [pieces, setPieces] = useState(initialPieces);
  const [isPending, startTransition] = useTransition();

  const [fPillar, setFPillar] = useState("");
  const [fFunnel, setFFunnel] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fPersona, setFPersona] = useState("");
  const [fCaso, setFCaso] = useState("");

  const personas = useMemo(
    () => Array.from(new Set(pieces.map((p) => p.persona).filter(Boolean))) as string[],
    [pieces]
  );
  const casos = useMemo(
    () => Array.from(new Set(pieces.map((p) => p.caso).filter(Boolean))) as string[],
    [pieces]
  );

  const filtered = pieces.filter(
    (p) =>
      (!fPillar || p.pillar === fPillar) &&
      (!fFunnel || p.funnelStage === fFunnel) &&
      (!fStatus || p.status === fStatus) &&
      (!fPersona || p.persona === fPersona) &&
      (!fCaso || p.caso === fCaso)
  );

  function patch(id: number, partial: Partial<Piece>) {
    setPieces((prev) => prev.map((p) => (p.id === id ? { ...p, ...partial } : p)));
    startTransition(() => {
      updateContent(id, partial as never);
    });
  }

  function remove(id: number, title: string) {
    if (!confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return;
    setPieces((prev) => prev.filter((p) => p.id !== id));
    startTransition(() => {
      deleteContent(id);
    });
  }

  return (
    <div>
      <div className="card p-3 flex flex-wrap items-center gap-2 mb-4">
        <Select label="Pilar" value={fPillar} onChange={setFPillar} options={pillars} />
        <Select label="Funnel" value={fFunnel} onChange={setFFunnel} options={funnelStages} />
        <Select
          label="Estado"
          value={fStatus}
          onChange={setFStatus}
          options={[...PIPELINE_STAGES]}
          labels={PIPELINE_STAGE_LABELS}
        />
        <Select label="Persona" value={fPersona} onChange={setFPersona} options={personas} />
        <Select label="Caso" value={fCaso} onChange={setFCaso} options={casos} />
        {(fPillar || fFunnel || fStatus || fPersona || fCaso) && (
          <button
            className="btn btn-ghost"
            onClick={() => {
              setFPillar("");
              setFFunnel("");
              setFStatus("");
              setFPersona("");
              setFCaso("");
            }}
          >
            Limpiar filtros
          </button>
        )}
        <div className="flex-1" />
        <Link href="/contenido/nuevo" className="btn btn-primary">
          <Plus size={14} /> Nuevo contenido
        </Link>
      </div>

      <div className="card overflow-x-auto scrollbar-thin">
        <table className="w-full text-[13px]">
          <thead>
            <tr
              className="text-left"
              style={{ borderBottom: "1px solid var(--border)", color: "var(--text-faint)" }}
            >
              <Th>#</Th>
              <Th className="min-w-[220px]">Título</Th>
              <Th className="min-w-[180px]">Pilar</Th>
              <Th className="min-w-[110px]">Funnel</Th>
              <Th className="min-w-[80px]">Score</Th>
              <Th className="min-w-[110px]">Persona</Th>
              <Th className="min-w-[100px]">Caso</Th>
              <Th className="min-w-[130px]">Estado</Th>
              <Th className="min-w-[130px]">Fecha</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr
                key={p.id}
                style={{ borderBottom: "1px solid var(--border)" }}
                className="hover:bg-[var(--surface-2)]"
              >
                <Td className="tabular-nums" style={{ color: "var(--text-faint)" }}>
                  {p.number}
                </Td>
                <Td>
                  <Link
                    href={`/contenido/${p.id}`}
                    className="font-medium hover:underline flex items-center gap-1"
                  >
                    {p.title}
                  </Link>
                </Td>
                <Td>
                  <select
                    className="select"
                    value={p.pillar}
                    onChange={(e) => patch(p.id, { pillar: e.target.value })}
                  >
                    {pillars.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </Td>
                <Td>
                  <select
                    className="select"
                    value={p.funnelStage}
                    onChange={(e) => patch(p.id, { funnelStage: e.target.value })}
                  >
                    {funnelStages.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </Td>
                <Td>
                  <input
                    type="number"
                    step="0.01"
                    className="input w-24 font-mono"
                    value={p.opportunityScore ?? ""}
                    placeholder={NO_DATA}
                    onChange={(e) =>
                      setPieces((prev) =>
                        prev.map((x) =>
                          x.id === p.id
                            ? { ...x, opportunityScore: e.target.value === "" ? null : Number(e.target.value) }
                            : x
                        )
                      )
                    }
                    onBlur={(e) =>
                      patch(p.id, {
                        opportunityScore: e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                  />
                </Td>
                <Td>
                  <input
                    className="input w-28"
                    defaultValue={p.persona ?? ""}
                    placeholder={NO_DATA}
                    onBlur={(e) => patch(p.id, { persona: e.target.value || null })}
                  />
                </Td>
                <Td>
                  <input
                    className="input w-24"
                    defaultValue={p.caso ?? ""}
                    placeholder={NO_DATA}
                    onBlur={(e) => patch(p.id, { caso: e.target.value || null })}
                  />
                </Td>
                <Td>
                  <select
                    className="select"
                    value={p.status}
                    onChange={(e) => patch(p.id, { status: e.target.value })}
                  >
                    {PIPELINE_STAGES.map((v) => (
                      <option key={v} value={v}>
                        {PIPELINE_STAGE_LABELS[v]}
                      </option>
                    ))}
                  </select>
                </Td>
                <Td>
                  <input
                    type="date"
                    className="input"
                    value={p.publishDate ? p.publishDate.slice(0, 10) : ""}
                    onChange={(e) => patch(p.id, { publishDate: e.target.value || null })}
                  />
                </Td>
                <Td>
                  <div className="flex items-center gap-1 justify-end">
                    <Link href={`/contenido/${p.id}`} className="btn btn-ghost p-1.5">
                      <ExternalLink size={14} />
                    </Link>
                    <button
                      className="btn btn-ghost p-1.5"
                      onClick={() => remove(p.id, p.title)}
                      style={{ color: "var(--accent)" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center py-10" style={{ color: "var(--text-faint)" }}>
                  No hay contenidos con estos filtros
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {isPending && (
        <div className="text-xs mt-2" style={{ color: "var(--text-faint)" }}>
          Guardando…
        </div>
      )}
    </div>
  );
}

function Th({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <th className={`px-3 py-2.5 font-medium text-xs ${className}`}>{children}</th>;
}
function Td({
  children,
  className = "",
  style,
}: {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <td className={`px-3 py-2 align-middle ${className}`} style={style}>
      {children}
    </td>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  labels,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  labels?: Record<string, string>;
}) {
  return (
    <select
      className="select w-auto"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
    >
      <option value="">{label}: todos</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {labels?.[o] ?? o}
        </option>
      ))}
    </select>
  );
}
