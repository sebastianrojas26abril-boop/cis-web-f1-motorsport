"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Lightbulb } from "lucide-react";
import { fmtDate, EmptyState } from "@/components/ui";
import { createLearning, deleteLearning } from "@/lib/actions/performance";

type Piece = { id: number; number: number; title: string };
type Learning = {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  contentPieceId: number | null;
  contentPiece: Piece | null;
};

export function LearningsBoard({
  initialLearnings,
  pieces,
}: {
  initialLearnings: Learning[];
  pieces: Piece[];
}) {
  const [learnings, setLearnings] = useState(initialLearnings);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentPieceId, setContentPieceId] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  function submit() {
    if (!title.trim() || !description.trim()) return;
    startTransition(async () => {
      await createLearning({
        title,
        description,
        contentPieceId: contentPieceId ? Number(contentPieceId) : null,
      });
      setLearnings((prev) => [
        {
          id: Date.now(),
          title,
          description,
          createdAt: new Date().toISOString(),
          contentPieceId: contentPieceId ? Number(contentPieceId) : null,
          contentPiece: contentPieceId ? pieces.find((p) => p.id === Number(contentPieceId))! : null,
        },
        ...prev,
      ]);
      setTitle("");
      setDescription("");
      setContentPieceId("");
      setOpen(false);
    });
  }

  function remove(id: number) {
    if (!confirm("¿Eliminar este aprendizaje?")) return;
    setLearnings((prev) => prev.filter((l) => l.id !== id));
    startTransition(() => {
      deleteLearning(id);
    });
  }

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <div className="card p-4">
        {!open ? (
          <button className="btn btn-primary" onClick={() => setOpen(true)}>
            <Plus size={14} /> Registrar aprendizaje
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <div>
              <label className="label block mb-1.5">Título</label>
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="label block mb-1.5">Descripción</label>
              <textarea
                className="textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="label block mb-1.5">Contenido relacionado (opcional)</label>
              <select
                className="select"
                value={contentPieceId}
                onChange={(e) => setContentPieceId(e.target.value)}
              >
                <option value="">Ninguno / general</option>
                {pieces.map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.number} {p.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                className="btn btn-primary"
                disabled={isPending || !title.trim() || !description.trim()}
                onClick={submit}
              >
                Guardar
              </button>
              <button className="btn btn-ghost" onClick={() => setOpen(false)}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {learnings.length === 0 ? (
        <EmptyState label="No hay aprendizajes registrados todavía" />
      ) : (
        <div className="flex flex-col gap-2.5">
          {learnings.map((l) => (
            <div key={l.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                  >
                    <Lightbulb size={14} />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold">{l.title}</div>
                    <p className="text-[13px] mt-1" style={{ color: "var(--text-muted)" }}>
                      {l.description}
                    </p>
                    <div className="text-xs mt-2 flex items-center gap-2" style={{ color: "var(--text-faint)" }}>
                      {fmtDate(l.createdAt)}
                      {l.contentPiece && <span>· #{l.contentPiece.number} {l.contentPiece.title}</span>}
                    </div>
                  </div>
                </div>
                <button className="btn btn-ghost p-1" style={{ color: "var(--accent)" }} onClick={() => remove(l.id)}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
