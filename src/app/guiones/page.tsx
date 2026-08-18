import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { ScriptEditor } from "@/components/ScriptEditor";

export const dynamic = "force-dynamic";

export default async function GuionesPage() {
  const pieces = await prisma.contentPiece.findMany({
    orderBy: { number: "asc" },
    include: { shots: true },
  });

  return (
    <div className="pb-12 h-full flex flex-col">
      <PageHeader title="Guiones" description="Escribe y organiza el guion de cada contenido" />
      <div className="px-6 md:px-8 flex-1 min-h-0">
        <ScriptEditor pieces={JSON.parse(JSON.stringify(pieces))} />
      </div>
    </div>
  );
}
