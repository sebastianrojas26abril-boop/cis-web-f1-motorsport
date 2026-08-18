"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Check, Circle, ChevronDown, ChevronUp } from "lucide-react";
import { Tag } from "@/components/ui";
import {
  createRecordingSession,
  updateRecordingSession,
  deleteRecordingSession,
  createShot,
  updateShotStatus,
  deleteShot,
} from "@/lib/actions/production";

type Piece = {
  id: number;
  number: number;
  title: string;
  pillar: string;
  persona: string | null;
  caso: string | null;
  groupId: number | null;
};
type ShotWithPieces = {
  id: number;
  description: string;
  status: string;
  sessionId: number | null;
  contentPieces: Piece[];
};
type Group = {
  id: number;
  name: string;
  sharedMaterial: string | null;
  contentPieces: Piece[];
};
type Session = {
  id: number;
  title: string;
  date: string | null;
  personas: string | null;
  autos: string | null;
  locaciones: string | null;
  materials: string | null;
  status: string;
  contentPieces: Piece[];
  shots: ShotWithPieces[];
};

export function ProductionBoard({
  groups,
  sessions,
  pieces,
  shotsByGroup,
}: {
  groups: Group[];
  sessions: Session[];
  pieces: Piece[];
  shotsByGroup: ShotWithPieces[];
}) {
  return (
    <div className="flex flex-col gap-8">
      <NewSessionForm pieces={pieces} />

      {groups.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-3">Grupos de producción</h2>
          <div className="flex flex-col gap-3">
            {groups.map((g) => (
              <GroupCard
                key={g.id}
                group={g}
                shots={shotsByGroup.filter((s) => s.contentPieces.some((p) => p.groupId === g.id))}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-semibold mb-3">Sesiones de grabación ({sessions.length})</h2>
        <div className="flex flex-col gap-3">
          {sessions.map((s) => (
            <SessionCard key={s.id} session={s} allPieces={pieces} />
          ))}
          {sessions.length === 0 && (
            <div
              className="text-sm rounded-lg border border-dashed py-8 text-center"
              style={{ color: "var(--text-faint)", borderColor: "var(--border)" }}
            >
              No hay sesiones de grabación todavía
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function GroupCard({ group, shots }: { group: Group; shots: ShotWithPieces[] }) {
  const [, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[13px] font-semibold">{group.name}</div>
          {group.sharedMaterial && (
            <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Material compartido: {group.sharedMaterial}
            </div>
          )}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {group.contentPieces.map((p) => (
            <Link key={p.id} href={`/contenido/${p.id}`}>
              <span className="badge" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
                #{p.number} {p.title}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {shots.length > 0 && (
        <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="label mb-2">Tomas compartidas</div>
          <div className="flex flex-col gap-1.5">
            {shots.map((shot) => (
              <div key={shot.id} className="flex items-center justify-between gap-3 text-[13px]">
                <div>
                  <span className="font-medium">{shot.description}</span>
                  <span style={{ color: "var(--text-faint)" }}>
                    {" "}
                    → sirve para {shot.contentPieces.map((p) => `#${p.number}`).join(", ")}
                  </span>
                </div>
                <ShotStatusToggle
                  status={shot.status}
                  onToggle={(status) =>
                    startTransition(async () => {
                      await updateShotStatus(shot.id, status);
                      router.refresh();
                    })
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ShotStatusToggle({
  status,
  onToggle,
}: {
  status: string;
  onToggle: (status: string) => void;
}) {
  const grabada = status === "GRABADA";
  return (
    <button
      className="badge"
      onClick={() => onToggle(grabada ? "PENDIENTE" : "GRABADA")}
      style={{
        background: grabada ? "var(--ok-soft)" : "var(--surface-2)",
        color: grabada ? "var(--ok)" : "var(--text-muted)",
      }}
    >
      {grabada ? <Check size={11} /> : <Circle size={11} />}
      &nbsp;{grabada ? "Grabada" : "Pendiente"}
    </button>
  );
}

function NewSessionForm({ pieces }: { pieces: Piece[] }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function toggle(id: number) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function submit() {
    if (!title.trim() || selected.length === 0) return;
    startTransition(async () => {
      await createRecordingSession({ title, date: date || null, contentIds: selected });
      setTitle("");
      setDate("");
      setSelected([]);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="card p-4">
      <button
        className="flex items-center justify-between w-full text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-sm font-semibold flex items-center gap-2">
          <Plus size={15} /> Nueva sesión de grabación
        </span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {open && (
        <div className="mt-4 flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label block mb-1.5">Título de la sesión</label>
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Bloque de grabación martes"
              />
            </div>
            <div>
              <label className="label block mb-1.5">Fecha</label>
              <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label block mb-1.5">
              Contenidos incluidos ({selected.length} seleccionados)
            </label>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-64 overflow-y-auto scrollbar-thin p-2 rounded-lg"
              style={{ background: "var(--surface-2)" }}
            >
              {pieces.map((p) => (
                <label
                  key={p.id}
                  className="flex items-center gap-2 text-[13px] px-2 py-1.5 rounded cursor-pointer"
                  style={{ background: selected.includes(p.id) ? "var(--accent-soft)" : "transparent" }}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(p.id)}
                    onChange={() => toggle(p.id)}
                  />
                  <span className="font-mono text-xs" style={{ color: "var(--text-faint)" }}>
                    #{p.number}
                  </span>
                  <span className="truncate">{p.title}</span>
                </label>
              ))}
            </div>
            <p className="text-xs mt-1.5" style={{ color: "var(--text-faint)" }}>
              Personas, auto/caso y materiales se sugieren automáticamente combinando los datos de los
              contenidos seleccionados, sin duplicados.
            </p>
          </div>

          <div>
            <button
              className="btn btn-primary"
              disabled={isPending || !title.trim() || selected.length === 0}
              onClick={submit}
            >
              {isPending ? "Creando…" : "Crear sesión"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SessionCard({ session, allPieces }: { session: Session; allPieces: Piece[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [local, setLocal] = useState(session);
  const [newShot, setNewShot] = useState("");
  const [newShotFor, setNewShotFor] = useState<number[]>(session.contentPieces.map((p) => p.id));

  function saveField(field: keyof Session, value: string | null) {
    setLocal((s) => ({ ...s, [field]: value }) as Session);
    startTransition(() => {
      updateRecordingSession(session.id, { [field]: value } as never);
    });
  }

  function addShot() {
    if (!newShot.trim() || newShotFor.length === 0) return;
    startTransition(async () => {
      await createShot({ description: newShot, sessionId: session.id, contentIds: newShotFor });
      setNewShot("");
      router.refresh();
    });
  }

  function removeSession() {
    if (!confirm(`¿Eliminar la sesión "${session.title}"?`)) return;
    startTransition(async () => {
      await deleteRecordingSession(session.id);
      router.refresh();
    });
  }

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
        <div className="flex-1 min-w-[200px]">
          <input
            className="input font-medium"
            defaultValue={local.title}
            onBlur={(e) => saveField("title", e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            className="input w-auto"
            value={local.date ? local.date.slice(0, 10) : ""}
            onChange={(e) => saveField("date", e.target.value || null)}
          />
          <select
            className="select w-auto"
            value={local.status}
            onChange={(e) => saveField("status", e.target.value)}
          >
            <option value="PENDIENTE">Pendiente</option>
            <option value="GRABADA">Grabada</option>
          </select>
          <button className="btn btn-ghost p-1.5" style={{ color: "var(--accent)" }} onClick={removeSession}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {session.contentPieces.map((p) => (
          <Link key={p.id} href={`/contenido/${p.id}`}>
            <Tag value={`#${p.number} ${p.title}`} />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <TextField label="Personas" value={local.personas} onSave={(v) => saveField("personas", v)} />
        <TextField label="Autos" value={local.autos} onSave={(v) => saveField("autos", v)} />
        <TextField label="Locaciones" value={local.locaciones} onSave={(v) => saveField("locaciones", v)} />
        <TextField label="Materiales" value={local.materials} onSave={(v) => saveField("materials", v)} />
      </div>

      <div style={{ borderTop: "1px solid var(--border)" }} className="pt-3">
        <div className="label mb-2">Tomas ({session.shots.length})</div>
        <div className="flex flex-col gap-1.5 mb-3">
          {session.shots.map((shot) => (
            <div key={shot.id} className="flex items-center justify-between gap-3 text-[13px]">
              <div>
                <span className="font-medium">{shot.description}</span>
                <span style={{ color: "var(--text-faint)" }}>
                  {" "}
                  → sirve para {shot.contentPieces.map((p) => `#${p.number}`).join(", ")}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShotStatusToggle
                  status={shot.status}
                  onToggle={(status) =>
                    startTransition(async () => {
                      await updateShotStatus(shot.id, status);
                      router.refresh();
                    })
                  }
                />
                <button
                  className="btn btn-ghost p-1"
                  style={{ color: "var(--accent)" }}
                  onClick={() =>
                    startTransition(async () => {
                      await deleteShot(shot.id);
                      router.refresh();
                    })
                  }
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            className="input flex-1 min-w-[160px]"
            placeholder="Nueva toma (ej. suspensión)"
            value={newShot}
            onChange={(e) => setNewShot(e.target.value)}
          />
          <div className="flex flex-wrap gap-1">
            {session.contentPieces.map((p) => (
              <label
                key={p.id}
                className="text-[11px] px-1.5 py-1 rounded cursor-pointer flex items-center gap-1"
                style={{
                  background: newShotFor.includes(p.id) ? "var(--accent-soft)" : "var(--surface-2)",
                  color: newShotFor.includes(p.id) ? "var(--accent)" : "var(--text-muted)",
                }}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={newShotFor.includes(p.id)}
                  onChange={() =>
                    setNewShotFor((prev) =>
                      prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id]
                    )
                  }
                />
                #{p.number}
              </label>
            ))}
          </div>
          <button className="btn btn-secondary" disabled={isPending} onClick={addShot}>
            <Plus size={13} /> Agregar
          </button>
        </div>
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onSave,
}: {
  label: string;
  value: string | null;
  onSave: (v: string | null) => void;
}) {
  return (
    <div>
      <label className="label block mb-1">{label}</label>
      <input
        className="input"
        defaultValue={value ?? ""}
        placeholder="Sin datos"
        onBlur={(e) => onSave(e.target.value || null)}
      />
    </div>
  );
}
