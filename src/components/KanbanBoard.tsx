"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { PIPELINE_STAGES, PIPELINE_STAGE_LABELS } from "@/lib/constants";
import { colorFor } from "@/lib/colors";
import { updateContentStatus } from "@/lib/actions/content";
import { ScoreTag, Tag } from "@/components/ui";

type Piece = {
  id: number;
  number: number;
  title: string;
  pillar: string;
  funnelStage: string;
  opportunityScore: number | null;
  status: string;
};

export function KanbanBoard({ initialPieces }: { initialPieces: Piece[] }) {
  const [pieces, setPieces] = useState(initialPieces);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function handleDragStart(e: DragStartEvent) {
    setActiveId(Number(e.active.id));
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const id = Number(active.id);
    const newStatus = String(over.id);
    const current = pieces.find((p) => p.id === id);
    if (!current || current.status === newStatus) return;

    setPieces((prev) => prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p)));
    startTransition(() => {
      updateContentStatus(id, newStatus);
    });
  }

  const active = pieces.find((p) => p.id === activeId);

  return (
    <DndContext id="pipeline-board" sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 h-full overflow-x-auto pb-6 scrollbar-thin">
        {PIPELINE_STAGES.map((stage) => (
          <Column
            key={stage}
            stage={stage}
            pieces={pieces.filter((p) => p.status === stage)}
          />
        ))}
      </div>
      <DragOverlay>{active && <Card piece={active} dragging />}</DragOverlay>
    </DndContext>
  );
}

function Column({ stage, pieces }: { stage: string; pieces: Piece[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const c = colorFor(stage);

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col w-64 shrink-0 rounded-xl"
      style={{
        background: isOver ? "var(--surface-2)" : "transparent",
        border: isOver ? "1px dashed var(--accent)" : "1px solid transparent",
      }}
    >
      <div className="flex items-center justify-between px-2 py-2 sticky top-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: c.fg }} />
          <span className="text-xs font-semibold">{PIPELINE_STAGE_LABELS[stage]}</span>
        </div>
        <span className="text-xs tabular-nums" style={{ color: "var(--text-faint)" }}>
          {pieces.length}
        </span>
      </div>
      <div className="flex flex-col gap-2 px-1 pb-2 min-h-[80px]">
        {pieces.map((p) => (
          <DraggableCard key={p.id} piece={p} />
        ))}
      </div>
    </div>
  );
}

function DraggableCard({ piece }: { piece: Piece }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: piece.id,
  });
  const style = {
    touchAction: "none" as const,
    userSelect: "none" as const,
    ...(transform
      ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, opacity: isDragging ? 0.3 : 1 }
      : {}),
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <Card piece={piece} />
    </div>
  );
}

function Card({ piece, dragging }: { piece: Piece; dragging?: boolean }) {
  return (
    <div
      className="card p-3 cursor-grab active:cursor-grabbing"
      style={{ boxShadow: dragging ? "var(--shadow-lg)" : undefined }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[11px] font-mono" style={{ color: "var(--text-faint)" }}>
          #{piece.number}
        </span>
        <ScoreTag score={piece.opportunityScore} />
      </div>
      <Link
        href={`/contenido/${piece.id}`}
        onClick={(e) => e.stopPropagation()}
        className="text-[13px] font-medium leading-snug block mb-2 hover:underline"
      >
        {piece.title}
      </Link>
      <Tag value={piece.pillar} />
    </div>
  );
}
