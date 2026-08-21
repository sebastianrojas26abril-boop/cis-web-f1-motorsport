import { prisma } from "@/lib/prisma";
import {
  resolveInstagramMediaId,
  resolveFacebookPostId,
  fetchInstagramInsights,
  fetchFacebookInsights,
  type MetaInsightsResult,
} from "@/lib/meta";

async function upsertAutoMetric(contentPieceId: number, platform: string, insights: MetaInsightsResult) {
  const existing = await prisma.performanceMetric.findFirst({
    where: { contentPieceId, platform, source: "META_AUTO" },
  });

  const data = {
    platform,
    date: new Date(),
    views: insights.views,
    reach: insights.reach,
    likes: insights.likes,
    comments: insights.comments,
    shares: insights.shares,
    saves: insights.saves,
    source: "META_AUTO",
  };

  if (existing) {
    await prisma.performanceMetric.update({ where: { id: existing.id }, data });
  } else {
    await prisma.performanceMetric.create({
      data: { ...data, contentPiece: { connect: { id: contentPieceId } } },
    });
  }
}

export async function syncMetaMetrics() {
  const connection = await prisma.metaConnection.findUnique({ where: { id: 1 } });
  if (!connection) {
    return { ok: false as const, error: "No hay una cuenta de Meta conectada." };
  }

  const results: { number: number; platform: string; status: "ok" | "no_match" | "error"; detail?: string }[] = [];

  const pieces = await prisma.contentPiece.findMany({
    where: { OR: [{ instagramUrl: { not: null } }, { facebookUrl: { not: null } }] },
  });

  for (const piece of pieces) {
    if (piece.instagramUrl && connection.instagramBusinessId) {
      try {
        let mediaId = piece.instagramMediaId;
        if (!mediaId) {
          mediaId = await resolveInstagramMediaId(
            connection.instagramBusinessId,
            connection.pageAccessToken,
            piece.instagramUrl
          );
          if (mediaId) {
            await prisma.contentPiece.update({ where: { id: piece.id }, data: { instagramMediaId: mediaId } });
          }
        }
        if (!mediaId) {
          results.push({ number: piece.number, platform: "Instagram", status: "no_match" });
        } else {
          const insights = await fetchInstagramInsights(mediaId, connection.pageAccessToken);
          await upsertAutoMetric(piece.id, "Instagram", insights);
          results.push({ number: piece.number, platform: "Instagram", status: "ok" });
        }
      } catch (err) {
        results.push({
          number: piece.number,
          platform: "Instagram",
          status: "error",
          detail: err instanceof Error ? err.message : String(err),
        });
      }
    }

    if (piece.facebookUrl) {
      try {
        let postId = piece.facebookPostId;
        if (!postId) {
          postId = await resolveFacebookPostId(connection.pageId, connection.pageAccessToken, piece.facebookUrl);
          if (postId) {
            await prisma.contentPiece.update({ where: { id: piece.id }, data: { facebookPostId: postId } });
          }
        }
        if (!postId) {
          results.push({ number: piece.number, platform: "Facebook", status: "no_match" });
        } else {
          const insights = await fetchFacebookInsights(postId, connection.pageAccessToken);
          await upsertAutoMetric(piece.id, "Facebook", insights);
          results.push({ number: piece.number, platform: "Facebook", status: "ok" });
        }
      } catch (err) {
        results.push({
          number: piece.number,
          platform: "Facebook",
          status: "error",
          detail: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }

  const hadErrors = results.some((r) => r.status === "error");
  const errorSummary = results
    .filter((r) => r.status === "error")
    .map((r) => `#${r.number} ${r.platform}: ${r.detail}`)
    .join(" | ");

  await prisma.metaConnection.update({
    where: { id: 1 },
    data: { lastSyncAt: new Date(), lastSyncError: hadErrors ? errorSummary : null },
  });

  return { ok: true as const, results };
}
