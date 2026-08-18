import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { StrategyForm } from "@/components/StrategyForm";
import {
  DEFAULT_PILLARS,
  DEFAULT_FUNNEL_STAGES,
  DEFAULT_SCORE_WEIGHTS,
  DEFAULT_FUNNEL_DISTRIBUTION,
  DEFAULT_OBJECTIVE,
  DEFAULT_AUDIENCE,
  DEFAULT_TONE,
} from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function EstrategiaPage() {
  const strategy = await prisma.strategyConfig.findUnique({ where: { id: 1 } });

  const initial = {
    pillars: strategy ? JSON.parse(strategy.pillars) : DEFAULT_PILLARS,
    funnelStages: strategy ? JSON.parse(strategy.funnelStages) : DEFAULT_FUNNEL_STAGES,
    objective: strategy?.objective ?? DEFAULT_OBJECTIVE,
    audience: strategy?.audience ?? DEFAULT_AUDIENCE,
    tone: strategy?.tone ?? DEFAULT_TONE,
    scoreWeights: strategy ? JSON.parse(strategy.scoreWeights) : DEFAULT_SCORE_WEIGHTS,
    funnelDistribution: strategy
      ? JSON.parse(strategy.funnelDistribution)
      : DEFAULT_FUNNEL_DISTRIBUTION,
  };

  return (
    <div className="pb-16">
      <PageHeader
        title="Estrategia"
        description="Estos valores no se recalculan automáticamente — solo cambian si los editas aquí"
      />
      <div className="px-6 md:px-8">
        <StrategyForm initial={initial} />
      </div>
    </div>
  );
}
