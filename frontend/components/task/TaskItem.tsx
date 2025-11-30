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
};

export function TaskItem({ task, onToggle, onDelete }: Props) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-4">
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggle(task)}
              className="mt-1 h-4 w-4 accent-slate-800"
              aria-label="Mark as completed"
            />
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
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Priority: {task.priority}</Badge>
            <Badge variant={task.completed ? "success" : "warning"}>
              {task.completed ? "Completed" : "In progress"}
            </Badge>
            {task.category ? (
              <Badge variant="outline">Category: {task.category}</Badge>
            ) : null}
            {formatDate(task.due_date) ? (
              <Badge variant="secondary">Due: {formatDate(task.due_date)}</Badge>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="secondary" onClick={() => onToggle(task)}>
            {task.completed ? "Reopen" : "Done"}
          </Button>
          <Button variant="destructive" onClick={() => onDelete(task)}>
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
