"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { NO_DATA } from "@/lib/constants";
import { fmtDate } from "@/components/ui";
import { createMetric, deleteMetric, type MetricInput } from "@/lib/actions/performance";

type Piece = { id: number; number: number; title: string };
type Metric = MetricInput & {
  id: number;
  contentPiece: { id: number; number: number; title: string };
};

const NUMERIC_FIELDS: { key: keyof MetricInput; label: string }[] = [
  { key: "views", label: "Visualizaciones" },
  { key: "reach", label: "Alcance" },
  { key: "likes", label: "Likes" },
  { key: "comments", label: "Comentarios" },
  { key: "shares", label: "Compartidos" },
  { key: "saves", label: "Guardados" },
  { key: "messages", label: "Mensajes" },
  { key: "leads", label: "Leads" },
  { key: "appointments", label: "Citas" },
  { key: "sales", label: "Ventas" },
];

export function PerformanceBoard({
  initialMetrics,
  pieces,
}: {
  initialMetrics: Metric[];
  pieces: Piece[];
}) {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [open, setOpen] = useState(false);
  const [filterPiece, setFilterPiece] = useState("");
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<Partial<MetricInput>>({
    contentPieceId: pieces[0]?.id,
    platform: "",
    date: new Date().toISOString().slice(0, 10),
  });

  function submit() {
    if (!form.contentPieceId || !form.platform || !form.date) return;
    startTransition(async () => {
      await createMetric(form as MetricInput);
      const piece = pieces.find((p) => p.id === form.contentPieceId)!;
      setMetrics((prev) => [
        {
          ...(form as MetricInput),
          id: Date.now(),
          contentPiece: piece,
        },
        ...prev,
      ]);
      setForm({ contentPieceId: pieces[0]?.id, platform: "", date: new Date().toISOString().slice(0, 10) });
      setOpen(false);
    });
  }

  function remove(id: number) {
    if (!confirm("¿Eliminar este registro de métricas?")) return;
    setMetrics((prev) => prev.filter((m) => m.id !== id));
    startTransition(() => {
      deleteMetric(id);
    });
  }

  const filtered = filterPiece
    ? metrics.filter((m) => String(m.contentPieceId) === filterPiece)
    : metrics;

  return (
    <div className="flex flex-col gap-4">
      <div className="card p-4">
        <button className="flex items-center justify-between w-full text-left" onClick={() => setOpen((o) => !o)}>
          <span className="text-sm font-semibold flex items-center gap-2">
            <Plus size={15} /> Registrar métrica
          </span>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {open && (
          <div className="mt-4 flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="label block mb-1.5">Contenido</label>
                <select
                  className="select"
                  value={form.contentPieceId}
                  onChange={(e) => setForm((f) => ({ ...f, contentPieceId: Number(e.target.value) }))}
                >
                  {pieces.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.number} {p.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label block mb-1.5">Plataforma</label>
                <input
                  className="input"
                  list="platforms"
                  value={form.platform ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
                  placeholder="Instagram, TikTok…"
                />
                <datalist id="platforms">
                  <option value="Instagram" />
                  <option value="TikTok" />
                  <option value="YouTube" />
                  <option value="Facebook" />
                </datalist>
              </div>
              <div>
                <label className="label block mb-1.5">Fecha</label>
                <input
                  type="date"
                  className="input"
                  value={form.date ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {NUMERIC_FIELDS.map((f) => (
                <div key={f.key}>
                  <label className="label block mb-1.5">{f.label}</label>
                  <input
                    type="number"
                    className="input font-mono"
                    value={(form[f.key] as number) ?? ""}
                    placeholder={NO_DATA}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        [f.key]: e.target.value === "" ? null : Number(e.target.value),
                      }))
                    }
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="label block mb-1.5">Notas</label>
              <textarea
                className="textarea"
                rows={2}
                value={form.notes ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>

            <div>
              <button
                className="btn btn-primary"
                disabled={isPending || !form.contentPieceId || !form.platform || !form.date}
                onClick={submit}
              >
                {isPending ? "Guardando…" : "Guardar métrica"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <select className="select w-auto" value={filterPiece} onChange={(e) => setFilterPiece(e.target.value)}>
          <option value="">Todos los contenidos</option>
          {pieces.map((p) => (
            <option key={p.id} value={p.id}>
              #{p.number} {p.title}
            </option>
          ))}
        </select>
      </div>

      <div className="card overflow-x-auto scrollbar-thin">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left" style={{ borderBottom: "1px solid var(--border)", color: "var(--text-faint)" }}>
              <Th>Contenido</Th>
              <Th>Plataforma</Th>
              <Th>Fecha</Th>
              <Th>Views</Th>
              <Th>Alcance</Th>
              <Th>Likes</Th>
              <Th>Coment.</Th>
              <Th>Compart.</Th>
              <Th>Guard.</Th>
              <Th>Msjs</Th>
              <Th>Leads</Th>
              <Th>Citas</Th>
              <Th>Ventas</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <Td className="font-medium">
                  #{m.contentPiece.number} {m.contentPiece.title}
                </Td>
                <Td>{m.platform}</Td>
                <Td>{fmtDate(m.date)}</Td>
                <Td className="tabular-nums">{m.views ?? NO_DATA}</Td>
                <Td className="tabular-nums">{m.reach ?? NO_DATA}</Td>
                <Td className="tabular-nums">{m.likes ?? NO_DATA}</Td>
                <Td className="tabular-nums">{m.comments ?? NO_DATA}</Td>
                <Td className="tabular-nums">{m.shares ?? NO_DATA}</Td>
                <Td className="tabular-nums">{m.saves ?? NO_DATA}</Td>
                <Td className="tabular-nums">{m.messages ?? NO_DATA}</Td>
                <Td className="tabular-nums">{m.leads ?? NO_DATA}</Td>
                <Td className="tabular-nums">{m.appointments ?? NO_DATA}</Td>
                <Td className="tabular-nums">{m.sales ?? NO_DATA}</Td>
                <Td>
                  <button className="btn btn-ghost p-1" style={{ color: "var(--accent)" }} onClick={() => remove(m.id)}>
                    <Trash2 size={13} />
                  </button>
                </Td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={13} className="text-center py-10" style={{ color: "var(--text-faint)" }}>
                  Sin datos registrados todavía
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="px-3 py-2.5 font-medium text-xs whitespace-nowrap">{children}</th>;
}
function Td({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 whitespace-nowrap ${className}`}>{children}</td>;
}
