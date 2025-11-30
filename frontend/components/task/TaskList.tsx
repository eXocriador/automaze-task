'use client';

import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Task } from "@/lib/types";

import { TaskItem } from "./TaskItem";

type Props = {
  tasks: Task[] | undefined;
  isLoading: boolean;
  onToggle: (task: Task) => Promise<void>;
  onDelete: (task: Task) => Promise<void>;
  onReorder: (orderIds: number[], optimistic?: Task[]) => Promise<void>;
};

export function TaskList({ tasks, isLoading, onToggle, onDelete, onReorder }: Props) {
  const [draggingId, setDraggingId] = useState<number | null>(null);

  const reorderList = (items: Task[], sourceId: number, targetId: number): Task[] => {
    const sourceIndex = items.findIndex((t) => t.id === sourceId);
    const targetIndex = items.findIndex((t) => t.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return items;
    const updated = [...items];
    const [moved] = updated.splice(sourceIndex, 1);
    updated.splice(targetIndex, 0, moved);
    return updated;
  };

  const handleDrop = async (targetId: number) => {
    if (!tasks || draggingId === null) return;
    const next = reorderList(tasks, draggingId, targetId);
    if (next === tasks) return;
    const orderIds = next.map((t) => t.id);
    await onReorder(orderIds, next);
    setDraggingId(null);
  };

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
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          draggable
          onDragStart={() => setDraggingId(task.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(task.id)}
        />
      ))}
    </div>
  );
}
