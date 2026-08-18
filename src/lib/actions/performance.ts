"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function touch() {
  revalidatePath("/rendimiento");
  revalidatePath("/dashboard");
}

export type MetricInput = {
  contentPieceId: number;
  platform: string;
  date: string;
  views?: number | null;
  reach?: number | null;
  likes?: number | null;
  comments?: number | null;
  shares?: number | null;
  saves?: number | null;
  messages?: number | null;
  leads?: number | null;
  appointments?: number | null;
  sales?: number | null;
  notes?: string | null;
};

export async function createMetric(data: MetricInput) {
  await prisma.performanceMetric.create({
    data: {
      contentPiece: { connect: { id: data.contentPieceId } },
      platform: data.platform,
      date: new Date(data.date),
      views: data.views ?? null,
      reach: data.reach ?? null,
      likes: data.likes ?? null,
      comments: data.comments ?? null,
      shares: data.shares ?? null,
      saves: data.saves ?? null,
      messages: data.messages ?? null,
      leads: data.leads ?? null,
      appointments: data.appointments ?? null,
      sales: data.sales ?? null,
      notes: data.notes ?? null,
    },
  });
  touch();
}

export async function deleteMetric(id: number) {
  await prisma.performanceMetric.delete({ where: { id } });
  touch();
}

export async function createLearning(data: {
  title: string;
  description: string;
  contentPieceId: number | null;
}) {
  await prisma.learning.create({
    data: {
      title: data.title,
      description: data.description,
      contentPiece: data.contentPieceId ? { connect: { id: data.contentPieceId } } : undefined,
    },
  });
  revalidatePath("/aprendizajes");
  revalidatePath("/dashboard");
}

export async function deleteLearning(id: number) {
  await prisma.learning.delete({ where: { id } });
  revalidatePath("/aprendizajes");
}
