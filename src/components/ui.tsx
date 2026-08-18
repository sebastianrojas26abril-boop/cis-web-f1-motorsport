import { colorFor, scoreColor } from "@/lib/colors";
import { NO_DATA, PIPELINE_STAGE_LABELS } from "@/lib/constants";
import type { LucideIcon } from "lucide-react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-6 md:px-8 py-6 flex-wrap">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Tag({ value }: { value: string }) {
  const c = colorFor(value);
  return (
    <span className="badge" style={{ background: c.bg, color: c.fg }}>
      {value}
    </span>
  );
}

export function StatusTag({ value }: { value: string }) {
  const c = colorFor(value);
  return (
    <span className="badge" style={{ background: c.bg, color: c.fg }}>
      {PIPELINE_STAGE_LABELS[value] ?? value}
    </span>
  );
}

export function ScoreTag({ score }: { score: number | null | undefined }) {
  const c = scoreColor(score);
  return (
    <span className="badge font-mono" style={{ background: c.bg, color: c.fg }}>
      {score != null ? score.toFixed(2) : NO_DATA}
    </span>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  hint?: string;
}) {
  return (
    <div className="card p-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="label">{label}</div>
        <div className="text-2xl font-semibold mt-1.5 tabular-nums">{value}</div>
        {hint && (
          <div className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>
            {hint}
          </div>
        )}
      </div>
      {Icon && (
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
        >
          <Icon size={17} />
        </div>
      )}
    </div>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <div
      className="flex items-center justify-center py-10 text-sm rounded-lg border border-dashed"
      style={{ color: "var(--text-faint)", borderColor: "var(--border)" }}
    >
      {label}
    </div>
  );
}

export function fmtDate(d: Date | string | null | undefined) {
  if (!d) return NO_DATA;
  const date = typeof d === "string" ? new Date(d) : d;
  // Las fechas se guardan como instante UTC de medianoche (campos "solo fecha").
  // Se formatea en UTC para que el día mostrado sea siempre el que se ingresó,
  // sin desplazarse por la zona horaria del navegador (ej. America/Lima, UTC-5).
  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function orNoData(v: string | number | null | undefined) {
  if (v === null || v === undefined || v === "") return NO_DATA;
  return v;
}
