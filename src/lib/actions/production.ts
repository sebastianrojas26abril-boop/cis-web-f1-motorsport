"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function touch() {
  revalidatePath("/produccion");
  revalidatePath("/dashboard");
  revalidatePath("/contenido");
}

function dedupeList(parts: (string | null | undefined)[]): string {
  const set = new Set<string>();
  for (const part of parts) {
    if (!part) continue;
    for (const item of part.split(",")) {
      const trimmed = item.trim();
      if (trimmed) set.add(trimmed);
    }
  }
  return Array.from(set).join(", ");
}

export async function createRecordingSession(input: {
  title: string;
  date: string | null;
  contentIds: number[];
  groupId?: number | null;
}) {
  const pieces = await prisma.contentPiece.findMany({
    where: { id: { in: input.contentIds } },
    include: { group: true },
  });

  const personas = dedupeList(pieces.map((p) => p.persona));
  const autos = dedupeList(pieces.map((p) => p.caso));
  const materials = dedupeList([
    ...pieces.map((p) => p.materials),
    ...pieces.map((p) => p.group?.sharedMaterial ?? null),
  ]);

  const session = await prisma.recordingSession.create({
    data: {
      title: input.title,
      date: input.date ? new Date(input.date) : null,
      group: input.groupId ? { connect: { id: input.groupId } } : undefined,
      personas: personas || null,
      autos: autos || null,
      materials: materials || null,
      contentPieces: { connect: input.contentIds.map((id) => ({ id })) },
    },
  });
  touch();
  return session.id;
}

export async function updateRecordingSession(
  id: number,
  data: {
    title?: string;
    date?: string | null;
    personas?: string | null;
    autos?: string | null;
    locaciones?: string | null;
    materials?: string | null;
    status?: string;
  }
) {
  await prisma.recordingSession.update({
    where: { id },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.date !== undefined ? { date: data.date ? new Date(data.date) : null } : {}),
      ...(data.personas !== undefined ? { personas: data.personas } : {}),
      ...(data.autos !== undefined ? { autos: data.autos } : {}),
      ...(data.locaciones !== undefined ? { locaciones: data.locaciones } : {}),
      ...(data.materials !== undefined ? { materials: data.materials } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
    },
  });
  touch();
}

export async function deleteRecordingSession(id: number) {
  await prisma.recordingSession.delete({ where: { id } });
  touch();
}

export async function createShot(input: {
  description: string;
  sessionId: number;
  contentIds: number[];
}) {
  await prisma.shot.create({
    data: {
      description: input.description,
      session: { connect: { id: input.sessionId } },
      contentPieces: { connect: input.contentIds.map((id) => ({ id })) },
    },
  });
  touch();
}

export async function updateShotStatus(id: number, status: string) {
  await prisma.shot.update({ where: { id }, data: { status } });
  touch();
}

export async function deleteShot(id: number) {
  await prisma.shot.delete({ where: { id } });
  touch();
}

export async function createProductionGroup(input: {
  name: string;
  sharedMaterial: string | null;
  contentIds: number[];
}) {
  const group = await prisma.productionGroup.create({
    data: {
      name: input.name,
      sharedMaterial: input.sharedMaterial,
    },
  });
  await prisma.$transaction(
    input.contentIds.map((id) =>
      prisma.contentPiece.update({ where: { id }, data: { group: { connect: { id: group.id } } } })
    )
  );
  touch();
  return group.id;
}
