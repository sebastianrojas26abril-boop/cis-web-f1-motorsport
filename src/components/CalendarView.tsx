"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { updateContentPublishDate } from "@/lib/actions/content";
import { colorFor } from "@/lib/colors";

type Piece = {
  id: number;
  number: number;
  title: string;
  pillar: string;
  status: string;
  publishDate: string | null;
};

const UNSCHEDULED = "unscheduled";

export function CalendarView({ initialPieces }: { initialPieces: Piece[] }) {
  const [pieces, setPieces] = useState(initialPieces);
  const [view, setView] = useState<"month" | "week">("month");
  const [cursor, setCursor] = useState(new Date());
  const [activeId, setActiveId] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const days = useMemo(() => {
    if (view === "month") {
      const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
      const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    }
    const start = startOfWeek(cursor, { weekStartsOn: 1 });
    const end = endOfWeek(cursor, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [cursor, view]);

  const byDay = useMemo(() => {
    const map = new Map<string, Piece[]>();
    for (const p of pieces) {
      if (!p.publishDate) continue;
      const key = p.publishDate.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return map;
  }, [pieces]);

  const unscheduled = pieces.filter((p) => !p.publishDate);

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const id = Number(active.id);
    const target = String(over.id);
    const newDate = target === UNSCHEDULED ? null : target;

    setPieces((prev) => prev.map((p) => (p.id === id ? { ...p, publishDate: newDate } : p)));
    startTransition(() => {
      updateContentPublishDate(id, newDate);
    });
  }

  const active = pieces.find((p) => p.id === activeId);

  return (
    <DndContext
      id="calendar-board"
      sensors={sensors}
      onDragStart={(e) => setActiveId(Number(e.active.id))}
      onDragEnd={handleDragEnd}
    >
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            className="btn btn-secondary p-1.5"
            onClick={() => setCursor(view === "month" ? subMonths(cursor, 1) : subWeeks(cursor, 1))}
          >
            <ChevronLeft size={15} />
          </button>
          <div className="text-sm font-semibold capitalize w-40 text-center">
            {format(cursor, view === "month" ? "MMMM yyyy" : "'Semana del' d MMM", { locale: es })}
          </div>
          <button
            className="btn btn-secondary p-1.5"
            onClick={() => setCursor(view === "month" ? addMonths(cursor, 1) : addWeeks(cursor, 1))}
          >
            <ChevronRight size={15} />
          </button>
          <button className="btn btn-ghost" onClick={() => setCursor(new Date())}>
            Hoy
          </button>
        </div>
        <div className="flex items-center gap-1 card p-1">
          <button
            className="btn"
            style={{ background: view === "month" ? "var(--accent)" : "transparent", color: view === "month" ? "white" : "var(--text)" }}
            onClick={() => setView("month")}
          >
            Mes
          </button>
          <button
            className="btn"
            style={{ background: view === "week" ? "var(--accent)" : "transparent", color: view === "week" ? "white" : "var(--text)" }}
            onClick={() => setView("week")}
          >
            Semana
          </button>
        </div>
      </div>

      <div className="flex gap-4 items-start flex-wrap lg:flex-nowrap">
        <div className="flex-1 min-w-0 card p-3">
          <div className="grid grid-cols-7 gap-1.5 mb-1.5">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
              <div
                key={d}
                className="text-center text-[11px] font-semibold py-1"
                style={{ color: "var(--text-faint)" }}
              >
                {d}
              </div>
            ))}
          </div>
          <div className={`grid grid-cols-7 gap-1.5 ${view === "week" ? "" : ""}`}>
            {days.map((day) => (
              <DayCell
                key={day.toISOString()}
                day={day}
                inMonth={view === "week" || isSameMonth(day, cursor)}
                pieces={byDay.get(format(day, "yyyy-MM-dd")) ?? []}
                compact={view === "month"}
              />
            ))}
          </div>
        </div>

        <UnscheduledPanel pieces={unscheduled} />
      </div>

      <DragOverlay>{active && <MiniCard piece={active} dragging />}</DragOverlay>
    </DndContext>
  );
}

function DayCell({
  day,
  inMonth,
  pieces,
  compact,
}: {
  day: Date;
  inMonth: boolean;
  pieces: Piece[];
  compact: boolean;
}) {
  const dateKey = format(day, "yyyy-MM-dd");
  const { setNodeRef, isOver } = useDroppable({ id: dateKey });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg p-1.5 flex flex-col gap-1 ${compact ? "min-h-[92px]" : "min-h-[220px]"}`}
      style={{
        background: isOver ? "var(--surface-2)" : "var(--surface)",
        border: `1px solid ${isOver ? "var(--accent)" : "var(--border)"}`,
        opacity: inMonth ? 1 : 0.4,
      }}
    >
      <div
        className="text-[11px] font-medium tabular-nums w-5 h-5 flex items-center justify-center rounded-full"
        style={{
          background: isToday(day) ? "var(--accent)" : "transparent",
          color: isToday(day) ? "white" : "var(--text-faint)",
        }}
      >
        {format(day, "d")}
      </div>
      <div className="flex flex-col gap-1 overflow-y-auto scrollbar-thin">
        {pieces.map((p) => (
          <DraggableMini key={p.id} piece={p} />
        ))}
      </div>
    </div>
  );
}

function UnscheduledPanel({ pieces }: { pieces: Piece[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: UNSCHEDULED });
  return (
    <div
      ref={setNodeRef}
      className="card p-3 w-full lg:w-64 shrink-0"
      style={{ borderColor: isOver ? "var(--accent)" : undefined }}
    >
      <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
        <Inbox size={13} /> Sin programar ({pieces.length})
      </div>
      <div className="flex flex-col gap-1.5 max-h-[420px] overflow-y-auto scrollbar-thin">
        {pieces.map((p) => (
          <DraggableMini key={p.id} piece={p} />
        ))}
        {pieces.length === 0 && (
          <div className="text-xs py-4 text-center" style={{ color: "var(--text-faint)" }}>
            Todo programado
          </div>
        )}
      </div>
    </div>
  );
}

function DraggableMini({ piece }: { piece: Piece }) {
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
      <MiniCard piece={piece} />
    </div>
  );
}

function MiniCard({ piece, dragging }: { piece: Piece; dragging?: boolean }) {
  const c = colorFor(piece.pillar);
  return (
    <Link
      href={`/contenido/${piece.id}`}
      onClick={(e) => dragging && e.preventDefault()}
      className="text-[11px] leading-tight px-1.5 py-1 rounded cursor-grab active:cursor-grabbing block"
      style={{
        background: c.bg,
        color: c.fg,
        boxShadow: dragging ? "var(--shadow-lg)" : undefined,
      }}
      title={piece.title}
    >
      <span className="font-mono">#{piece.number}</span> {piece.title}
    </Link>
  );
}
