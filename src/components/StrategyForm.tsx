"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { updateStrategy, type StrategyInput } from "@/lib/actions/strategy";

export function StrategyForm({ initial }: { initial: StrategyInput }) {
  const [form, setForm] = useState<StrategyInput>(initial);
  const [newPillar, setNewPillar] = useState("");
  const [newFunnel, setNewFunnel] = useState("");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function save() {
    startTransition(async () => {
      await updateStrategy(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  const weightSum = Object.values(form.scoreWeights).reduce((a, b) => a + Number(b || 0), 0);
  const distributionSum = Object.values(form.funnelDistribution).reduce(
    (a, b) => a + Number(b || 0),
    0
  );

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <section className="card p-5">
        <h2 className="text-sm font-semibold mb-3">Pilares</h2>
        <div className="flex flex-col gap-1.5">
          {form.pillars.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                className="input"
                value={p}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    pillars: f.pillars.map((x, xi) => (xi === i ? e.target.value : x)),
                  }))
                }
              />
              <button
                className="btn btn-ghost p-1.5"
                style={{ color: "var(--accent)" }}
                onClick={() =>
                  setForm((f) => ({ ...f, pillars: f.pillars.filter((_, xi) => xi !== i) }))
                }
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <input
            className="input"
            placeholder="Nuevo pilar"
            value={newPillar}
            onChange={(e) => setNewPillar(e.target.value)}
          />
          <button
            className="btn btn-secondary"
            onClick={() => {
              if (!newPillar.trim()) return;
              setForm((f) => ({ ...f, pillars: [...f.pillars, newPillar.trim()] }));
              setNewPillar("");
            }}
          >
            <Plus size={14} /> Agregar
          </button>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="text-sm font-semibold mb-3">Etapas de funnel y distribución objetivo</h2>
        <div className="flex flex-col gap-1.5">
          {form.funnelStages.map((stage, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                className="input flex-1"
                value={stage}
                onChange={(e) => {
                  const newStage = e.target.value;
                  setForm((f) => {
                    const dist = { ...f.funnelDistribution };
                    dist[newStage] = dist[stage] ?? 0;
                    if (newStage !== stage) delete dist[stage];
                    return {
                      ...f,
                      funnelStages: f.funnelStages.map((x, xi) => (xi === i ? newStage : x)),
                      funnelDistribution: dist,
                    };
                  });
                }}
              />
              <input
                type="number"
                className="input w-24 font-mono"
                value={form.funnelDistribution[stage] ?? 0}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    funnelDistribution: { ...f.funnelDistribution, [stage]: Number(e.target.value) },
                  }))
                }
              />
              <span className="text-xs" style={{ color: "var(--text-faint)" }}>
                piezas/ciclo
              </span>
              <button
                className="btn btn-ghost p-1.5"
                style={{ color: "var(--accent)" }}
                onClick={() =>
                  setForm((f) => {
                    const dist = { ...f.funnelDistribution };
                    delete dist[stage];
                    return {
                      ...f,
                      funnelStages: f.funnelStages.filter((_, xi) => xi !== i),
                      funnelDistribution: dist,
                    };
                  })
                }
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <input
            className="input"
            placeholder="Nueva etapa de funnel"
            value={newFunnel}
            onChange={(e) => setNewFunnel(e.target.value)}
          />
          <button
            className="btn btn-secondary"
            onClick={() => {
              if (!newFunnel.trim()) return;
              setForm((f) => ({
                ...f,
                funnelStages: [...f.funnelStages, newFunnel.trim()],
                funnelDistribution: { ...f.funnelDistribution, [newFunnel.trim()]: 0 },
              }));
              setNewFunnel("");
            }}
          >
            <Plus size={14} /> Agregar
          </button>
        </div>
        <p className="text-xs mt-2" style={{ color: "var(--text-faint)" }}>
          Total del ciclo: {distributionSum} piezas
        </p>
      </section>

      <section className="card p-5">
        <h2 className="text-sm font-semibold mb-3">Pesos del Opportunity Score</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(Object.keys(form.scoreWeights) as (keyof StrategyInput["scoreWeights"])[]).map((k) => (
            <div key={k}>
              <label className="label block mb-1.5 capitalize">{labelFor(k)}</label>
              <input
                type="number"
                className="input font-mono"
                value={form.scoreWeights[k]}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    scoreWeights: { ...f.scoreWeights, [k]: Number(e.target.value) },
                  }))
                }
              />
            </div>
          ))}
        </div>
        <p
          className="text-xs mt-2"
          style={{ color: weightSum === 100 ? "var(--ok)" : "var(--warn)" }}
        >
          Suma actual: {weightSum}% {weightSum !== 100 && "(el estándar del CIS es 100%)"}
        </p>
      </section>

      <section className="card p-5">
        <h2 className="text-sm font-semibold mb-3">Objetivo, audiencia y tono</h2>
        <div className="flex flex-col gap-3">
          <div>
            <label className="label block mb-1.5">Objetivo</label>
            <input
              className="input"
              value={form.objective ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, objective: e.target.value }))}
            />
          </div>
          <div>
            <label className="label block mb-1.5">Audiencia</label>
            <input
              className="input"
              value={form.audience ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value }))}
            />
          </div>
          <div>
            <label className="label block mb-1.5">Tono</label>
            <input
              className="input"
              value={form.tone ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, tone: e.target.value }))}
            />
          </div>
        </div>
      </section>

      <div className="flex items-center gap-2">
        <button className="btn btn-primary" onClick={save} disabled={isPending}>
          <Save size={14} /> {isPending ? "Guardando…" : saved ? "Guardado ✓" : "Guardar estrategia"}
        </button>
      </div>
    </div>
  );
}

function labelFor(key: string) {
  const map: Record<string, string> = {
    conversion: "Conversión",
    retention: "Retención",
    attention: "Atención",
    interaction: "Interacción",
    authority: "Autoridad",
  };
  return map[key] ?? key;
}
