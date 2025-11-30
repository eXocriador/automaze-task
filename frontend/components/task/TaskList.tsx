'use client';

import { Task } from "@/lib/types";

import { TaskItem } from "./TaskItem";

type Props = {
  tasks: Task[] | undefined;
  isLoading: boolean;
  onToggle: (task: Task) => Promise<void>;
  onDelete: (task: Task) => Promise<void>;
};

export function TaskList({ tasks, isLoading, onToggle, onDelete }: Props) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-white p-4 text-sm text-slate-600 shadow-sm">
        Завантаження задач...
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-4 text-sm text-slate-600 shadow-sm">
        Поки що задач немає. Додай першу!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </div>
  );
}
