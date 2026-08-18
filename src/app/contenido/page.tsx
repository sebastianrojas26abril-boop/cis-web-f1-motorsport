import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { ContentTable } from "@/components/ContentTable";
import { DEFAULT_PILLARS, DEFAULT_FUNNEL_STAGES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function ContenidoPage() {
  const [pieces, strategy] = await Promise.all([
    prisma.contentPiece.findMany({ orderBy: { number: "asc" } }),
    prisma.strategyConfig.findUnique({ where: { id: 1 } }),
  ]);

  const pillars: string[] = strategy ? JSON.parse(strategy.pillars) : DEFAULT_PILLARS;
  const funnelStages: string[] = strategy
    ? JSON.parse(strategy.funnelStages)
    : DEFAULT_FUNNEL_STAGES;

  return (
    <div className="pb-12">
      <PageHeader
        title="Contenido"
        description={`${pieces.length} piezas de contenido registradas`}
      />
      <div className="px-6 md:px-8">
        <ContentTable
          initialPieces={JSON.parse(JSON.stringify(pieces))}
          pillars={pillars}
          funnelStages={funnelStages}
        />
      </div>
    </div>
  );
}
