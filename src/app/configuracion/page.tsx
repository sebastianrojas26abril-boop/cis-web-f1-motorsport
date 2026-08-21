import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { PIPELINE_STAGES, PIPELINE_STAGE_LABELS } from "@/lib/constants";
import { MetaConnectionCard } from "@/components/MetaConnectionCard";
import { Sparkles, Database, GitBranch, Radio } from "lucide-react";

export const dynamic = "force-dynamic";

const AI_FEATURES = [
  { title: "Generar ideas", desc: "Sugerir nuevas ideas de contenido a partir de pilares y patrones de rendimiento." },
  { title: "Generar guiones", desc: "Redactar un primer borrador de guion a partir del hook y el objetivo." },
  { title: "Mejorar guiones", desc: "Sugerir ajustes de guion existente (hook, CTA, ritmo)." },
  { title: "Analizar rendimiento", desc: "Detectar patrones entre mecanismo, pilar y resultados reales." },
];

export default async function ConfiguracionPage({
  searchParams,
}: {
  searchParams: Promise<{ meta_connected?: string; meta_error?: string }>;
}) {
  const [connection, params] = await Promise.all([
    prisma.metaConnection.findUnique({ where: { id: 1 } }),
    searchParams,
  ]);

  return (
    <div className="pb-16">
      <PageHeader title="Configuración" description="Información del sistema e integraciones" />
      <div className="px-6 md:px-8 flex flex-col gap-6 max-w-3xl">
        <section className="card p-5">
          <h2 className="text-sm font-semibold flex items-center gap-2 mb-3">
            <Radio size={15} /> Meta (Instagram + Facebook)
          </h2>
          <MetaConnectionCard
            connection={
              connection
                ? {
                    pageName: connection.pageName,
                    instagramUsername: connection.instagramUsername,
                    lastSyncAt: connection.lastSyncAt ? connection.lastSyncAt.toISOString() : null,
                    lastSyncError: connection.lastSyncError,
                  }
                : null
            }
            connectedBanner={params.meta_connected === "1"}
            errorBanner={params.meta_error}
          />
        </section>

        <section className="card p-5">
          <h2 className="text-sm font-semibold flex items-center gap-2 mb-3">
            <GitBranch size={15} /> Etapas del pipeline
          </h2>
          <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
            Estados fijos del flujo de producción, usados en Pipeline y en la ficha de cada contenido.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {PIPELINE_STAGES.map((s) => (
              <span
                key={s}
                className="badge"
                style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
              >
                {PIPELINE_STAGE_LABELS[s]}
              </span>
            ))}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="text-sm font-semibold flex items-center gap-2 mb-3">
            <Database size={15} /> Almacenamiento
          </h2>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Todos los cambios se guardan en una base de datos Postgres (Neon) propia de esta
            aplicación, completamente separada de la Knowledge Base original del CIS. Los archivos
            Markdown del CIS no se modifican ni se usan como almacenamiento — solo se usaron como
            fuente inicial de datos.
          </p>
        </section>

        <section className="card p-5">
          <h2 className="text-sm font-semibold flex items-center gap-2 mb-3">
            <Sparkles size={15} /> Integraciones de IA
          </h2>
          <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
            Próximamente. La arquitectura está preparada para agregarlas, pero no están implementadas
            todavía — la gestión manual es la prioridad actual.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {AI_FEATURES.map((f) => (
              <div
                key={f.title}
                className="p-3 rounded-lg border flex items-start justify-between gap-2"
                style={{ borderColor: "var(--border)", opacity: 0.6 }}
              >
                <div>
                  <div className="text-[13px] font-medium">{f.title}</div>
                  <div className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>
                    {f.desc}
                  </div>
                </div>
                <span className="badge shrink-0" style={{ background: "var(--surface-2)", color: "var(--text-faint)" }}>
                  Próximamente
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
