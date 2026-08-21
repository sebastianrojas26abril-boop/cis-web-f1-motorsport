"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, Radio, RefreshCw, Unlink, CheckCircle2, AlertCircle } from "lucide-react";
import { syncMetaNow, disconnectMeta } from "@/lib/actions/meta";
import { fmtDate } from "@/components/ui";

type Connection = {
  pageName: string | null;
  instagramUsername: string | null;
  lastSyncAt: string | null;
  lastSyncError: string | null;
} | null;

export function MetaConnectionCard({
  connection,
  connectedBanner,
  errorBanner,
}: {
  connection: Connection;
  connectedBanner?: boolean;
  errorBanner?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [syncResult, setSyncResult] = useState<string | null>(null);

  function sync() {
    setSyncResult(null);
    startTransition(async () => {
      const result = await syncMetaNow();
      if (result.ok) {
        const ok = result.results.filter((r) => r.status === "ok").length;
        const noMatch = result.results.filter((r) => r.status === "no_match").length;
        const errors = result.results.filter((r) => r.status === "error").length;
        setSyncResult(
          `Sincronizado: ${ok} actualizados${noMatch ? `, ${noMatch} sin match` : ""}${errors ? `, ${errors} con error` : ""}.`
        );
      } else {
        setSyncResult(result.error);
      }
      router.refresh();
    });
  }

  function disconnect() {
    if (!confirm("¿Desconectar la cuenta de Meta? Los links pegados en cada contenido se mantienen.")) return;
    startTransition(async () => {
      await disconnectMeta();
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {connectedBanner && (
        <div className="badge" style={{ background: "var(--ok-soft)", color: "var(--ok)" }}>
          <CheckCircle2 size={12} /> &nbsp;Cuenta de Meta conectada correctamente
        </div>
      )}
      {errorBanner && (
        <div className="badge" style={{ background: "var(--warn-soft)", color: "var(--warn)" }}>
          <AlertCircle size={12} /> &nbsp;{errorBanner}
        </div>
      )}

      {connection ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-[13px]">
              <Radio size={15} style={{ color: "var(--info)" }} />
              {connection.pageName ?? "Página conectada"}
            </div>
            {connection.instagramUsername && (
              <div className="flex items-center gap-1.5 text-[13px]">
                <Camera size={15} style={{ color: "#c026d3" }} />@{connection.instagramUsername}
              </div>
            )}
          </div>
          <div className="text-xs" style={{ color: "var(--text-faint)" }}>
            Última sincronización: {connection.lastSyncAt ? fmtDate(connection.lastSyncAt) : "nunca"}
          </div>
          {connection.lastSyncError && (
            <div className="text-xs" style={{ color: "var(--accent)" }}>
              Último error: {connection.lastSyncError}
            </div>
          )}
          {syncResult && (
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>
              {syncResult}
            </div>
          )}
          <div className="flex gap-2">
            <button className="btn btn-secondary" onClick={sync} disabled={isPending}>
              <RefreshCw size={13} /> {isPending ? "Sincronizando…" : "Sincronizar ahora"}
            </button>
            <button className="btn btn-ghost" onClick={disconnect} style={{ color: "var(--accent)" }}>
              <Unlink size={13} /> Desconectar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Conecta la Página de Facebook vinculada a tu cuenta de Instagram Business. Después de
            conectar, pega el link del post publicado una sola vez en cada contenido (ficha →
            Publicación) y el sync trae las métricas solo.
          </p>
          <a href="/api/meta/connect" className="btn btn-primary w-fit">
            <Radio size={14} /> Conectar Instagram / Facebook
          </a>
        </div>
      )}
    </div>
  );
}
