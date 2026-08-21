import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { PerformanceBoard } from "@/components/PerformanceBoard";

export const dynamic = "force-dynamic";

export default async function RendimientoPage() {
  const [metrics, pieces, connection] = await Promise.all([
    prisma.performanceMetric.findMany({
      include: { contentPiece: true },
      orderBy: { date: "desc" },
    }),
    prisma.contentPiece.findMany({ orderBy: { number: "asc" } }),
    prisma.metaConnection.findUnique({ where: { id: 1 } }),
  ]);

  return (
    <div className="pb-16">
      <PageHeader
        title="Rendimiento"
        description="Instagram y Facebook se sincronizan solos. Todo lo demás se registra a mano — nunca se inventan datos."
      />
      <div className="px-6 md:px-8">
        <PerformanceBoard
          initialMetrics={JSON.parse(JSON.stringify(metrics))}
          pieces={JSON.parse(JSON.stringify(pieces))}
          metaConnected={Boolean(connection)}
          lastSyncAt={connection?.lastSyncAt ? connection.lastSyncAt.toISOString() : null}
        />
      </div>
    </div>
  );
}
