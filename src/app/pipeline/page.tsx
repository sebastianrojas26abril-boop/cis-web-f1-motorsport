import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { KanbanBoard } from "@/components/KanbanBoard";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const pieces = await prisma.contentPiece.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div className="pb-12 h-full flex flex-col">
      <PageHeader
        title="Pipeline"
        description="Arrastra las tarjetas entre columnas para cambiar su estado"
      />
      <div className="px-6 md:px-8 flex-1 min-h-0">
        <KanbanBoard initialPieces={JSON.parse(JSON.stringify(pieces))} />
      </div>
    </div>
  );
}
