"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type StrategyInput = {
  pillars: string[];
  funnelStages: string[];
  objective: string | null;
  audience: string | null;
  tone: string | null;
  scoreWeights: {
    conversion: number;
    retention: number;
    attention: number;
    interaction: number;
    authority: number;
  };
  funnelDistribution: Record<string, number>;
};

export async function updateStrategy(data: StrategyInput) {
  await prisma.strategyConfig.upsert({
    where: { id: 1 },
    update: {
      pillars: JSON.stringify(data.pillars),
      funnelStages: JSON.stringify(data.funnelStages),
      objective: data.objective,
      audience: data.audience,
      tone: data.tone,
      scoreWeights: JSON.stringify(data.scoreWeights),
      funnelDistribution: JSON.stringify(data.funnelDistribution),
    },
    create: {
      id: 1,
      pillars: JSON.stringify(data.pillars),
      funnelStages: JSON.stringify(data.funnelStages),
      objective: data.objective,
      audience: data.audience,
      tone: data.tone,
      scoreWeights: JSON.stringify(data.scoreWeights),
      funnelDistribution: JSON.stringify(data.funnelDistribution),
    },
  });
  revalidatePath("/estrategia");
  revalidatePath("/contenido");
  revalidatePath("/contenido/nuevo");
  revalidatePath("/dashboard");
}
