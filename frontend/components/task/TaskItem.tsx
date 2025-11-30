'use client';

import { Button } from "@/components/ui/button";
import { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  task: Task;
  onToggle: (task: Task) => Promise<void>;
  onDelete: (task: Task) => Promise<void>;
};

export function TaskItem({ task, onToggle, onDelete }: Props) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggle(task)}
            className="h-4 w-4 accent-slate-800"
            aria-label="Позначити виконаною"
          />
          <div>
            <p
              className={cn(
                "text-sm font-medium text-slate-900",
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
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
            Пріоритет: {task.priority}
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-1 text-xs font-semibold",
              task.completed
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            )}
          >
            {task.completed ? "Виконано" : "В процесі"}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => onToggle(task)}>
          {task.completed ? "Повернути" : "Готово"}
        </Button>
        <Button variant="destructive" onClick={() => onDelete(task)}>
          Видалити
        </Button>
      </div>
    </div>
  );
}
