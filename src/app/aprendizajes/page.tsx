import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { LearningsBoard } from "@/components/LearningsBoard";

export const dynamic = "force-dynamic";

export default async function AprendizajesPage() {
  const [learnings, pieces] = await Promise.all([
    prisma.learning.findMany({
      include: { contentPiece: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.contentPiece.findMany({ orderBy: { number: "asc" } }),
  ]);

  return (
    <div className="pb-16">
      <PageHeader
        title="Aprendizajes"
        description="Patrones y decisiones que surgen del rendimiento real de las publicaciones"
      />
      <div className="px-6 md:px-8">
        <LearningsBoard
          initialLearnings={JSON.parse(JSON.stringify(learnings))}
          pieces={JSON.parse(JSON.stringify(pieces))}
        />
      </div>
    </div>
  );
}
