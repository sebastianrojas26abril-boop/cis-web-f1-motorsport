"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createContent, updateContent, deleteContent, type ContentPieceInput } from "@/lib/actions/content";
import { PIPELINE_STAGES, PIPELINE_STAGE_LABELS } from "@/lib/constants";
import { Trash2, Save } from "lucide-react";

export type FormPiece = ContentPieceInput & { id?: number; number?: number };

export function ContentForm({
  initial,
  pillars,
  funnelStages,
}: {
  initial: FormPiece;
  pillars: string[];
  funnelStages: string[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormPiece>(initial);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function set<K extends keyof FormPiece>(key: K, value: FormPiece[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  function save() {
    startTransition(async () => {
      if (form.id) {
        await updateContent(form.id, form);
      } else {
        const id = await createContent(form);
        router.replace(`/contenido/${id}`);
        return;
      }
      setSaved(true);
    });
  }

  function remove() {
    if (!form.id) return;
    if (!confirm(`¿Eliminar "${form.title}"? Esta acción no se puede deshacer.`)) return;
    startTransition(async () => {
      await deleteContent(form.id!);
      router.push("/contenido");
    });
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <section className="card p-5">
        <SectionTitle>Identidad</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
          <Field label="Título" full>
            <input
              className="input"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </Field>
          <Field label="Hook">
            <input
              className="input"
              value={form.hook ?? ""}
              onChange={(e) => set("hook", e.target.value)}
            />
          </Field>
          <Field label="Objetivo">
            <input
              className="input"
              value={form.objective ?? ""}
              onChange={(e) => set("objective", e.target.value)}
            />
          </Field>
          <Field label="Pilar">
            <select
              className="select"
              value={form.pillar}
              onChange={(e) => set("pillar", e.target.value)}
            >
              {pillars.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Etapa de funnel">
            <select
              className="select"
              value={form.funnelStage}
              onChange={(e) => set("funnelStage", e.target.value)}
            >
              {funnelStages.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Opportunity Score">
            <input
              type="number"
              step="0.01"
              className="input font-mono"
              value={form.opportunityScore ?? ""}
              onChange={(e) =>
                set("opportunityScore", e.target.value === "" ? null : Number(e.target.value))
              }
            />
          </Field>
          <Field label="Estado (pipeline)">
            <select
              className="select"
              value={form.status ?? "IDEA"}
              onChange={(e) => set("status", e.target.value)}
            >
              {PIPELINE_STAGES.map((s) => (
                <option key={s} value={s}>
                  {PIPELINE_STAGE_LABELS[s]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Persona">
            <input
              className="input"
              value={form.persona ?? ""}
              onChange={(e) => set("persona", e.target.value)}
            />
          </Field>
          <Field label="Caso">
            <input
              className="input"
              value={form.caso ?? ""}
              onChange={(e) => set("caso", e.target.value)}
            />
          </Field>
          <Field label="Fecha de publicación">
            <input
              type="date"
              className="input"
              value={form.publishDate ? form.publishDate.slice(0, 10) : ""}
              onChange={(e) => set("publishDate", e.target.value || null)}
            />
          </Field>
        </div>
      </section>

      <section className="card p-5">
        <SectionTitle>Guion</SectionTitle>
        <div className="grid grid-cols-1 gap-4 mt-3">
          <Field label="CTA">
            <input
              className="input"
              value={form.cta ?? ""}
              onChange={(e) => set("cta", e.target.value)}
            />
          </Field>
          <Field label="Desarrollo del guion">
            <textarea
              className="textarea"
              rows={4}
              value={form.scriptDevelopment ?? ""}
              onChange={(e) => set("scriptDevelopment", e.target.value)}
            />
          </Field>
          <Field label="Voz en off">
            <textarea
              className="textarea"
              rows={3}
              value={form.voiceOver ?? ""}
              onChange={(e) => set("voiceOver", e.target.value)}
            />
          </Field>
          <Field label="Texto en pantalla">
            <textarea
              className="textarea"
              rows={3}
              value={form.onScreenText ?? ""}
              onChange={(e) => set("onScreenText", e.target.value)}
            />
          </Field>
          <Field label="Notas de edición">
            <textarea
              className="textarea"
              rows={3}
              value={form.editingNotes ?? ""}
              onChange={(e) => set("editingNotes", e.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className="card p-5">
        <SectionTitle>Producción</SectionTitle>
        <div className="grid grid-cols-1 gap-4 mt-3">
          <Field label="Material necesario">
            <textarea
              className="textarea"
              rows={2}
              value={form.materials ?? ""}
              onChange={(e) => set("materials", e.target.value)}
            />
          </Field>
          <Field label="Notas">
            <textarea
              className="textarea"
              rows={3}
              value={form.notes ?? ""}
              onChange={(e) => set("notes", e.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className="card p-5">
        <SectionTitle>Publicación</SectionTitle>
        <p className="text-xs mt-1 mb-3" style={{ color: "var(--text-faint)" }}>
          Pega el link del post publicado una sola vez — el sync de Meta se encarga de traer las
          métricas solo, desde Rendimiento.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Link de Instagram">
            <input
              className="input"
              placeholder="https://www.instagram.com/p/..."
              value={form.instagramUrl ?? ""}
              onChange={(e) => set("instagramUrl", e.target.value)}
            />
          </Field>
          <Field label="Link de Facebook">
            <input
              className="input"
              placeholder="https://www.facebook.com/.../posts/..."
              value={form.facebookUrl ?? ""}
              onChange={(e) => set("facebookUrl", e.target.value)}
            />
          </Field>
        </div>
      </section>

      <div className="flex items-center gap-2 sticky bottom-4">
        <button className="btn btn-primary" onClick={save} disabled={isPending}>
          <Save size={14} /> {isPending ? "Guardando…" : saved ? "Guardado ✓" : "Guardar cambios"}
        </button>
        {form.id && (
          <button className="btn btn-secondary" onClick={remove} style={{ color: "var(--accent)" }}>
            <Trash2 size={14} /> Eliminar
          </button>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold">{children}</h2>;
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="label block mb-1.5">{label}</label>
      {children}
    </div>
  );
}
