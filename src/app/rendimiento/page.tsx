import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { PerformanceBoard } from "@/components/PerformanceBoard";

export const dynamic = "force-dynamic";

export default async function RendimientoPage() {
  const [metrics, pieces] = await Promise.all([
    prisma.performanceMetric.findMany({
      include: { contentPiece: true },
      orderBy: { date: "desc" },
    }),
    prisma.contentPiece.findMany({ orderBy: { number: "asc" } }),
  ]);

  return (
    <div className="pb-16">
      <PageHeader
        title="Rendimiento"
        description="Registra métricas reales por publicación. Nunca se inventan datos."
      />
      <div className="px-6 md:px-8">
        <PerformanceBoard
          initialMetrics={JSON.parse(JSON.stringify(metrics))}
          pieces={JSON.parse(JSON.stringify(pieces))}
        />
      </div>
    </div>
  );
}
