'use client';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

function formatDate(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString();
}

type Props = {
  task: Task;
  onToggle: (task: Task) => Promise<void>;
  onDelete: (task: Task) => Promise<void>;
  onUpdate: (taskId: number, payload: Partial<Task>) => Promise<void>;
  categories: string[];
  draggable?: boolean;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: () => void;
  isDragging?: boolean;
  dimmed?: boolean;
};

export function TaskItem({
  task,
  onToggle,
  onDelete,
  onUpdate,
  categories,
  draggable = false,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging = false,
  dimmed = false
}: Props) {
  return (
    <Card
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        dimmed ? "opacity-50" : "",
        draggable && "cursor-grab active:cursor-grabbing",
        isDragging && "cursor-grabbing"
      )}
    >
      <CardContent className="flex items-start gap-3 p-4">
        <div className="flex flex-1 flex-col gap-2">
          <div>
            <p
              className={cn(
                "text-base font-semibold text-slate-900",
                task.completed && "line-through text-slate-500"
              )}
            >
              {task.title}
            </p>
            {task.description ? (
              <p className="text-sm text-slate-600">{task.description}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={task.priority}
              onChange={(e) => onUpdate(task.id, { priority: Number(e.target.value) })}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 cursor-pointer"
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((p) => (
                <option key={p} value={p}>
                  Priority: {p}
                </option>
              ))}
            </select>
            <select
              value={task.category ?? ""}
              onChange={(e) => onUpdate(task.id, { category: e.target.value || null })}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 cursor-pointer"
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {formatDate(task.due_date) ? (
              <Badge variant="secondary">Due: {formatDate(task.due_date)}</Badge>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col gap-2 self-end">
          <Button variant="secondary" onClick={() => onToggle(task)}>
            {task.completed ? "Reopen" : "Done"}
          </Button>
          <Button
            variant="destructive"
            onClick={() => onDelete(task)}
            className="mt-auto"
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
