import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { ProductionBoard } from "@/components/ProductionBoard";

export const dynamic = "force-dynamic";

export default async function ProduccionPage() {
  const [groups, sessions, pieces] = await Promise.all([
    prisma.productionGroup.findMany({
      include: { contentPieces: true },
      orderBy: { id: "asc" },
    }),
    prisma.recordingSession.findMany({
      include: { contentPieces: true, shots: { include: { contentPieces: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.contentPiece.findMany({ orderBy: { number: "asc" } }),
  ]);

  const groupIds = groups.map((g) => g.id);
  const shotsByGroup = groupIds.length
    ? await prisma.shot.findMany({
        where: { contentPieces: { some: { groupId: { in: groupIds } } } },
        include: { contentPieces: true },
      })
    : [];

  return (
    <div className="pb-16">
      <PageHeader
        title="Producción"
        description="Crea sesiones de grabación combinando tomas compartidas entre varios contenidos"
      />
      <div className="px-6 md:px-8">
        <ProductionBoard
          groups={JSON.parse(JSON.stringify(groups))}
          sessions={JSON.parse(JSON.stringify(sessions))}
          pieces={JSON.parse(JSON.stringify(pieces))}
          shotsByGroup={JSON.parse(JSON.stringify(shotsByGroup))}
        />
      </div>
    </div>
  );
}
