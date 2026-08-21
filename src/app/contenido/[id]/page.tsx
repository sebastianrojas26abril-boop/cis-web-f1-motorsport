import { prisma } from "@/lib/prisma";
import { PageHeader, Tag } from "@/components/ui";
import { ContentForm, type FormPiece } from "@/components/ContentForm";
import { DEFAULT_PILLARS, DEFAULT_FUNNEL_STAGES } from "@/lib/constants";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) notFound();

  const [piece, strategy] = await Promise.all([
    prisma.contentPiece.findUnique({
      where: { id: numericId },
      include: { shots: true, group: true },
    }),
    prisma.strategyConfig.findUnique({ where: { id: 1 } }),
  ]);

  if (!piece) notFound();

  const pillars: string[] = strategy ? JSON.parse(strategy.pillars) : DEFAULT_PILLARS;
  const funnelStages: string[] = strategy
    ? JSON.parse(strategy.funnelStages)
    : DEFAULT_FUNNEL_STAGES;

  const initial: FormPiece = {
    id: piece.id,
    number: piece.number,
    title: piece.title,
    hook: piece.hook,
    objective: piece.objective,
    pillar: piece.pillar,
    funnelStage: piece.funnelStage,
    opportunityScore: piece.opportunityScore,
    persona: piece.persona,
    caso: piece.caso,
    cta: piece.cta,
    voiceOver: piece.voiceOver,
    onScreenText: piece.onScreenText,
    scriptDevelopment: piece.scriptDevelopment,
    editingNotes: piece.editingNotes,
    materials: piece.materials,
    notes: piece.notes,
    status: piece.status,
    publishDate: piece.publishDate ? piece.publishDate.toISOString() : null,
    instagramUrl: piece.instagramUrl,
    facebookUrl: piece.facebookUrl,
  };

  return (
    <div className="pb-16">
      <PageHeader
        title={`#${piece.number} ${piece.title}`}
        description={piece.group ? `Parte de: ${piece.group.name}` : undefined}
        actions={
          <div className="flex gap-1.5">
            <Tag value={piece.pillar} />
            <Tag value={piece.funnelStage} />
          </div>
        }
      />
      <div className="px-6 md:px-8 flex flex-col gap-6">
        {piece.shots.length > 0 && (
          <section className="card p-5 max-w-4xl">
            <h2 className="text-sm font-semibold mb-3">Tomas asociadas</h2>
            <div className="flex flex-wrap gap-2">
              {piece.shots.map((s) => (
                <span key={s.id} className="badge" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
                  {s.description} · {s.status}
                </span>
              ))}
            </div>
            <Link href="/produccion" className="text-xs mt-3 inline-block" style={{ color: "var(--accent)" }}>
              Gestionar en Producción →
            </Link>
          </section>
        )}
        <ContentForm initial={initial} pillars={pillars} funnelStages={funnelStages} />
      </div>
    </div>
  );
}
