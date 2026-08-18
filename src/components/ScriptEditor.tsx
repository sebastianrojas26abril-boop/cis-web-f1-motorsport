"use client";

import { useMemo, useState, useTransition } from "react";
import { Copy, Check, Search } from "lucide-react";
import { Tag, ScoreTag } from "@/components/ui";
import { updateContent } from "@/lib/actions/content";

type Shot = { id: number; description: string; status: string };
type Piece = {
  id: number;
  number: number;
  title: string;
  pillar: string;
  funnelStage: string;
  opportunityScore: number | null;
  status: string;
  hook: string | null;
  scriptDevelopment: string | null;
  cta: string | null;
  voiceOver: string | null;
  onScreenText: string | null;
  editingNotes: string | null;
  shots: Shot[];
};

export function ScriptEditor({ pieces }: { pieces: Piece[] }) {
  const [selectedId, setSelectedId] = useState<number | null>(pieces[0]?.id ?? null);
  const [query, setQuery] = useState("");
  const [data, setData] = useState<Record<number, Piece>>(
    Object.fromEntries(pieces.map((p) => [p.id, p]))
  );

  const filtered = pieces.filter((p) =>
    `${p.number} ${p.title}`.toLowerCase().includes(query.toLowerCase())
  );

  const selected = selectedId ? data[selectedId] : null;

  return (
    <div className="flex gap-4 h-full">
      <div className="w-72 shrink-0 card p-2 flex flex-col">
        <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
          <Search size={14} style={{ color: "var(--text-faint)" }} />
          <input
            className="text-[13px] flex-1 bg-transparent outline-none"
            placeholder="Buscar contenido…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin flex flex-col gap-0.5">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className="text-left px-2.5 py-2 rounded-md"
              style={{
                background: selectedId === p.id ? "var(--accent-soft)" : "transparent",
              }}
            >
              <div className="text-[13px] font-medium leading-tight truncate">
                #{p.number} {p.title}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: "var(--text-faint)" }}>
                {p.hook ? "Con guion" : "Sin guion"}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-w-0 overflow-y-auto scrollbar-thin">
        {selected ? (
          <ScriptPanel
            key={selected.id}
            piece={selected}
            onChange={(updated) => setData((d) => ({ ...d, [updated.id]: updated }))}
          />
        ) : (
          <div className="card p-8 text-center" style={{ color: "var(--text-faint)" }}>
            Selecciona un contenido
          </div>
        )}
      </div>
    </div>
  );
}

function ScriptPanel({
  piece,
  onChange,
}: {
  piece: Piece;
  onChange: (p: Piece) => void;
}) {
  const [form, setForm] = useState(piece);
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  function set<K extends keyof Piece>(key: K, value: Piece[K]) {
    const next = { ...form, [key]: value };
    setForm(next);
    onChange(next);
    startTransition(() => {
      updateContent(piece.id, { [key]: value } as never);
    });
  }

  const fullScript = useMemo(() => {
    return [
      `# ${form.title}`,
      "",
      "## HOOK",
      form.hook || "Sin datos",
      "",
      "## DESARROLLO",
      form.scriptDevelopment || "Sin datos",
      "",
      "## CTA",
      form.cta || "Sin datos",
      "",
      "## VOZ EN OFF",
      form.voiceOver || "Sin datos",
      "",
      "## TEXTO EN PANTALLA",
      form.onScreenText || "Sin datos",
      "",
      "## TOMAS",
      form.shots.length ? form.shots.map((s) => `- ${s.description} (${s.status})`).join("\n") : "Sin datos",
      "",
      "## NOTAS DE EDICIÓN",
      form.editingNotes || "Sin datos",
    ].join("\n");
  }, [form]);

  function copyScript() {
    navigator.clipboard.writeText(fullScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-base font-semibold">
            #{form.number} {form.title}
          </h2>
          <div className="flex gap-1.5 mt-1.5">
            <Tag value={form.pillar} />
            <Tag value={form.funnelStage} />
            <ScoreTag score={form.opportunityScore} />
          </div>
        </div>
        <button className="btn btn-primary" onClick={copyScript}>
          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copiado" : "Copiar guion"}
        </button>
      </div>

      <ScriptField label="Hook" value={form.hook} onSave={(v) => set("hook", v)} rows={2} />
      <ScriptField
        label="Desarrollo"
        value={form.scriptDevelopment}
        onSave={(v) => set("scriptDevelopment", v)}
        rows={6}
      />
      <ScriptField label="CTA" value={form.cta} onSave={(v) => set("cta", v)} rows={2} />
      <ScriptField label="Voz en off" value={form.voiceOver} onSave={(v) => set("voiceOver", v)} rows={4} />
      <ScriptField
        label="Texto en pantalla"
        value={form.onScreenText}
        onSave={(v) => set("onScreenText", v)}
        rows={3}
      />

      <div>
        <label className="label block mb-1.5">Tomas</label>
        {form.shots.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {form.shots.map((s) => (
              <span
                key={s.id}
                className="badge"
                style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
              >
                {s.description} · {s.status}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs" style={{ color: "var(--text-faint)" }}>
            Sin tomas asignadas — créalas desde Producción
          </p>
        )}
      </div>

      <ScriptField
        label="Notas de edición"
        value={form.editingNotes}
        onSave={(v) => set("editingNotes", v)}
        rows={3}
      />

      {isPending && (
        <div className="text-xs" style={{ color: "var(--text-faint)" }}>
          Guardando…
        </div>
      )}
    </div>
  );
}

function ScriptField({
  label,
  value,
  onSave,
  rows,
}: {
  label: string;
  value: string | null;
  onSave: (v: string) => void;
  rows: number;
}) {
  return (
    <div>
      <label className="label block mb-1.5">{label}</label>
      <textarea
        className="textarea"
        rows={rows}
        defaultValue={value ?? ""}
        onBlur={(e) => onSave(e.target.value)}
      />
    </div>
  );
}
