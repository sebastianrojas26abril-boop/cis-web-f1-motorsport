import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { CalendarView } from "@/components/CalendarView";

export const dynamic = "force-dynamic";

export default async function CalendarioPage() {
  const pieces = await prisma.contentPiece.findMany({
    orderBy: { number: "asc" },
    where: { status: { not: "PAUSADO" } },
  });

  return (
    <div className="pb-12 h-full flex flex-col">
      <PageHeader
        title="Calendario"
        description="Arrastra un contenido sobre un día para programar su publicación"
      />
      <div className="px-6 md:px-8 flex-1 min-h-0">
        <CalendarView initialPieces={JSON.parse(JSON.stringify(pieces))} />
      </div>
    </div>
  );
}
