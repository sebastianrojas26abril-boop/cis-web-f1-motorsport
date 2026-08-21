"use server";

import { prisma } from "@/lib/prisma";
import { syncMetaMetrics } from "@/lib/meta-sync";
import { revalidatePath } from "next/cache";

export async function syncMetaNow() {
  const result = await syncMetaMetrics();
  revalidatePath("/rendimiento");
  revalidatePath("/configuracion");
  revalidatePath("/dashboard");
  return result;
}

export async function disconnectMeta() {
  await prisma.metaConnection.deleteMany({ where: { id: 1 } });
  revalidatePath("/configuracion");
  revalidatePath("/rendimiento");
}
