"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function touch() {
  revalidatePath("/dashboard");
  revalidatePath("/contenido");
  revalidatePath("/pipeline");
  revalidatePath("/calendario");
  revalidatePath("/produccion");
  revalidatePath("/guiones");
}

export type ContentPieceInput = {
  title: string;
  hook?: string | null;
  objective?: string | null;
  pillar: string;
  funnelStage: string;
  opportunityScore?: number | null;
  persona?: string | null;
  caso?: string | null;
  cta?: string | null;
  voiceOver?: string | null;
  onScreenText?: string | null;
  scriptDevelopment?: string | null;
  editingNotes?: string | null;
  materials?: string | null;
  notes?: string | null;
  status?: string;
  publishDate?: string | null;
};

export async function createContent(data: ContentPieceInput) {
  const max = await prisma.contentPiece.aggregate({ _max: { number: true } });
  const nextNumber = (max._max.number ?? 0) + 1;

  const created = await prisma.contentPiece.create({
    data: {
      number: nextNumber,
      title: data.title,
      hook: data.hook || null,
      objective: data.objective || null,
      pillar: data.pillar,
      funnelStage: data.funnelStage,
      opportunityScore: data.opportunityScore ?? null,
      persona: data.persona || null,
      caso: data.caso || null,
      cta: data.cta || null,
      voiceOver: data.voiceOver || null,
      onScreenText: data.onScreenText || null,
      scriptDevelopment: data.scriptDevelopment || null,
      editingNotes: data.editingNotes || null,
      materials: data.materials || null,
      notes: data.notes || null,
      status: data.status || "IDEA",
      publishDate: data.publishDate ? new Date(data.publishDate) : null,
    },
  });
  touch();
  return created.id;
}

export async function updateContent(id: number, data: Partial<ContentPieceInput>) {
  await prisma.contentPiece.update({
    where: { id },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.hook !== undefined ? { hook: data.hook || null } : {}),
      ...(data.objective !== undefined ? { objective: data.objective || null } : {}),
      ...(data.pillar !== undefined ? { pillar: data.pillar } : {}),
      ...(data.funnelStage !== undefined ? { funnelStage: data.funnelStage } : {}),
      ...(data.opportunityScore !== undefined ? { opportunityScore: data.opportunityScore } : {}),
      ...(data.persona !== undefined ? { persona: data.persona || null } : {}),
      ...(data.caso !== undefined ? { caso: data.caso || null } : {}),
      ...(data.cta !== undefined ? { cta: data.cta || null } : {}),
      ...(data.voiceOver !== undefined ? { voiceOver: data.voiceOver || null } : {}),
      ...(data.onScreenText !== undefined ? { onScreenText: data.onScreenText || null } : {}),
      ...(data.scriptDevelopment !== undefined
        ? { scriptDevelopment: data.scriptDevelopment || null }
        : {}),
      ...(data.editingNotes !== undefined ? { editingNotes: data.editingNotes || null } : {}),
      ...(data.materials !== undefined ? { materials: data.materials || null } : {}),
      ...(data.notes !== undefined ? { notes: data.notes || null } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.publishDate !== undefined
        ? { publishDate: data.publishDate ? new Date(data.publishDate) : null }
        : {}),
    },
  });
  touch();
}

export async function deleteContent(id: number) {
  await prisma.contentPiece.delete({ where: { id } });
  touch();
}

export async function updateContentStatus(id: number, status: string) {
  await prisma.contentPiece.update({ where: { id }, data: { status } });
  touch();
}

export async function updateContentPublishDate(id: number, publishDate: string | null) {
  await prisma.contentPiece.update({
    where: { id },
    data: { publishDate: publishDate ? new Date(publishDate) : null },
  });
  touch();
}
