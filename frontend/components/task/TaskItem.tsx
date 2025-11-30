'use client';

import React from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Task, TaskUpdateInput } from "@/lib/types";
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
  onUpdate: (taskId: number, payload: TaskUpdateInput) => Promise<void>;
  categories: string[];
  isDragging?: boolean;
  nodeRef?: (el: HTMLElement | null) => void;
  style?: React.CSSProperties;
};

export function TaskItem({
  task,
  onToggle,
  onDelete,
  onUpdate,
  categories,
  isDragging = false,
  nodeRef,
  style
}: Props) {
  return (
    <Card
      ref={nodeRef}
      style={style}
      className={cn(
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        isDragging && "cursor-grabbing opacity-60"
      )}
    >
      <CardContent className="flex items-start gap-4 p-4">
        <div className="flex flex-1 flex-col gap-3">
          <div className="space-y-1">
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
            <Select
              value={String(task.priority)}
              onChange={(v) => onUpdate(task.id, { priority: Number(v) })}
              options={Array.from({ length: 10 }, (_, i) => {
                const p = i + 1;
                return { label: `Priority: ${p}`, value: String(p) };
              })}
              className="h-11 min-w-[150px]"
            />
            <Select
              value={task.category ?? "__none__"}
              onChange={(v) =>
                onUpdate(task.id, {
                  category: v === "__none__" ? undefined : v
                })
              }
              options={[
                { label: "No category", value: "__none__" },
                ...categories.map((c) => ({ label: c, value: c }))
              ]}
              className="h-11 min-w-[150px]"
            />
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
