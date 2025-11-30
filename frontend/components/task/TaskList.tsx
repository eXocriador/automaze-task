'use client';

import { Card, CardContent } from "@/components/ui/card";
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
      <Card>
        <CardContent className="p-4 text-sm text-slate-600">
          Loading tasks...
        </CardContent>
      </Card>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-slate-600">
          No tasks yet. Add your first one!
        </CardContent>
      </Card>
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
