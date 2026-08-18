import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { ContentForm, type FormPiece } from "@/components/ContentForm";
import { DEFAULT_PILLARS, DEFAULT_FUNNEL_STAGES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function NuevoContenidoPage() {
  const strategy = await prisma.strategyConfig.findUnique({ where: { id: 1 } });
  const pillars: string[] = strategy ? JSON.parse(strategy.pillars) : DEFAULT_PILLARS;
  const funnelStages: string[] = strategy
    ? JSON.parse(strategy.funnelStages)
    : DEFAULT_FUNNEL_STAGES;

  const initial: FormPiece = {
    title: "Nueva idea",
    pillar: pillars[0],
    funnelStage: funnelStages[0],
    status: "IDEA",
  };

  return (
    <div className="pb-16">
      <PageHeader title="Nuevo contenido" description="Crear una nueva idea en el pipeline" />
      <div className="px-6 md:px-8">
        <ContentForm initial={initial} pillars={pillars} funnelStages={funnelStages} />
      </div>
    </div>
  );
}
