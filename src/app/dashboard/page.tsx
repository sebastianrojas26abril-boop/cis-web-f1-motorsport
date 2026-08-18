import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard, Tag, ScoreTag, EmptyState, fmtDate } from "@/components/ui";
import {
  Layers,
  Video,
  Scissors,
  CalendarClock,
  Send,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [all, byFunnel, byPillar, topScore, upcoming, upcomingSessions] = await Promise.all([
    prisma.contentPiece.findMany({ select: { status: true } }),
    prisma.contentPiece.groupBy({ by: ["funnelStage"], _count: { _all: true } }),
    prisma.contentPiece.groupBy({ by: ["pillar"], _count: { _all: true } }),
    prisma.contentPiece.findMany({
      orderBy: { opportunityScore: "desc" },
      take: 5,
      where: { opportunityScore: { not: null } },
    }),
    prisma.contentPiece.findMany({
      where: { publishDate: { not: null } },
      orderBy: { publishDate: "asc" },
      take: 6,
    }),
    prisma.recordingSession.findMany({
      orderBy: { date: "asc" },
      take: 5,
      include: { contentPieces: true },
    }),
  ]);

  const count = (statuses: string[]) => all.filter((c) => statuses.includes(c.status)).length;
  const enPipeline = all.filter((c) => !["PUBLICADO", "PAUSADO"].includes(c.status)).length;
  const grabadas = count(["GRABADO"]);
  const enEdicion = count(["EDICIÓN"]);
  const programadas = count(["PROGRAMADO"]);
  const publicadas = count(["PUBLICADO"]);

  const maxFunnel = Math.max(1, ...byFunnel.map((f) => f._count._all));
  const maxPillar = Math.max(1, ...byPillar.map((p) => p._count._all));

  return (
    <div className="pb-12">
      <PageHeader
        title="Dashboard"
        description="Vista general del sistema de contenido F1 Motorsport"
      />

      <div className="px-6 md:px-8 grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard label="En pipeline" value={enPipeline} icon={Layers} />
        <StatCard label="Grabadas" value={grabadas} icon={Video} />
        <StatCard label="En edición" value={enEdicion} icon={Scissors} />
        <StatCard label="Programadas" value={programadas} icon={CalendarClock} />
        <StatCard label="Publicadas" value={publicadas} icon={Send} />
      </div>

      <div className="px-6 md:px-8 mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Próximos contenidos</h2>
            <Link href="/calendario" className="text-xs" style={{ color: "var(--accent)" }}>
              Ver calendario →
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <EmptyState label="No hay contenidos con fecha programada" />
          ) : (
            <div className="flex flex-col divide-y" style={{ borderColor: "var(--border)" }}>
              {upcoming.map((c) => (
                <Link
                  key={c.id}
                  href={`/contenido/${c.id}`}
                  className="flex items-center justify-between py-2.5 gap-3 hover:opacity-70"
                >
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium truncate">
                      #{c.number} {c.title}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>
                      {fmtDate(c.publishDate)}
                    </div>
                  </div>
                  <Tag value={c.funnelStage} />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold flex items-center gap-1.5">
              <TrendingUp size={15} /> Mayor Opportunity Score
            </h2>
            <Link href="/contenido" className="text-xs" style={{ color: "var(--accent)" }}>
              Ver contenido →
            </Link>
          </div>
          {topScore.length === 0 ? (
            <EmptyState label="Sin datos" />
          ) : (
            <div className="flex flex-col divide-y" style={{ borderColor: "var(--border)" }}>
              {topScore.map((c) => (
                <Link
                  key={c.id}
                  href={`/contenido/${c.id}`}
                  className="flex items-center justify-between py-2.5 gap-3 hover:opacity-70"
                >
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium truncate">
                      #{c.number} {c.title}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>
                      {c.pillar}
                    </div>
                  </div>
                  <ScoreTag score={c.opportunityScore} />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4">Distribución por funnel</h2>
          <div className="flex flex-col gap-2.5">
            {byFunnel.map((f) => (
              <div key={f.funnelStage} className="flex items-center gap-3">
                <div className="w-24 shrink-0 text-xs" style={{ color: "var(--text-muted)" }}>
                  {f.funnelStage}
                </div>
                <div className="flex-1 h-2 rounded-full" style={{ background: "var(--surface-2)" }}>
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${(f._count._all / maxFunnel) * 100}%`,
                      background: "var(--accent)",
                    }}
                  />
                </div>
                <div className="w-6 text-right text-xs tabular-nums font-medium">
                  {f._count._all}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4">Distribución por pilares</h2>
          <div className="flex flex-col gap-3">
            {byPillar.map((p) => (
              <div key={p.pillar}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span style={{ color: "var(--text-muted)" }}>{p.pillar}</span>
                  <span className="tabular-nums font-medium shrink-0 ml-2">{p._count._all}</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: "var(--surface-2)" }}>
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${(p._count._all / maxPillar) * 100}%`,
                      background: "var(--accent)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Próximas sesiones de grabación</h2>
            <Link href="/produccion" className="text-xs" style={{ color: "var(--accent)" }}>
              Ver producción →
            </Link>
          </div>
          {upcomingSessions.length === 0 ? (
            <EmptyState label="No hay sesiones de grabación programadas" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {upcomingSessions.map((s) => (
                <Link
                  key={s.id}
                  href={`/produccion`}
                  className="p-3 rounded-lg border hover:opacity-70"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="text-[13px] font-medium">{s.title}</div>
                  <div className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>
                    {fmtDate(s.date)} · {s.contentPieces.length} piezas · {s.status}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
