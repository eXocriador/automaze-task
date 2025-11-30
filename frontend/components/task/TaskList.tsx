"use client";

import { useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Task, TaskUpdateInput } from "@/lib/types";
import { cn } from "@/lib/utils";

import { TaskItem } from "./TaskItem";

type Props = {
  tasks: Task[] | undefined;
  isLoading: boolean;
  onToggle: (task: Task) => Promise<void>;
  onDelete: (task: Task) => Promise<void>;
  onReorder: (orderIds: number[], optimistic?: Task[]) => Promise<void>;
  onMove: (
    orderIds: number[],
    movedTaskId: number,
    completed: boolean,
    optimistic?: Task[]
  ) => Promise<void>;
  onUpdate: (taskId: number, payload: TaskUpdateInput) => Promise<void>;
  categories: string[];
};

export function TaskList({
  tasks,
  isLoading,
  onToggle,
  onDelete,
  onReorder,
  onMove,
  onUpdate,
  categories
}: Props) {
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [hoverStatus, setHoverStatus] = useState<"done" | "undone" | null>(
    null
  );

  const undone = useMemo(
    () => (tasks ?? []).filter((t) => !t.completed),
    [tasks]
  );
  const done = useMemo(() => (tasks ?? []).filter((t) => t.completed), [tasks]);

  const reorderList = (
    items: Task[],
    sourceId: number,
    targetId: number | null
  ): Task[] => {
    const sourceIndex = items.findIndex((t) => t.id === sourceId);
    if (sourceIndex === -1) return items;
    const updated = [...items];
    const [moved] = updated.splice(sourceIndex, 1);
    if (targetId === null) {
      updated.push(moved);
    } else {
      const targetIndex = updated.findIndex((t) => t.id === targetId);
      if (targetIndex === -1) {
        updated.push(moved);
      } else {
        updated.splice(targetIndex, 0, moved);
      }
    }
    return updated;
  };

  const buildOptimistic = (updatedUndone: Task[], updatedDone: Task[]) => [
    ...updatedUndone,
    ...updatedDone
  ];

  const handleDrop = async (
    targetStatus: "done" | "undone",
    targetId: number | null = null
  ) => {
    setHoverStatus(null);
    if (!tasks || draggingId === null) return;
    const draggedTask = tasks.find((t) => t.id === draggingId);
    if (!draggedTask) return;

    const movingToDone = targetStatus === "done";
    const sourceCompleted = draggedTask.completed;
    const targetCompleted = movingToDone;

    let updatedUndone = undone.filter((t) => t.id !== draggingId);
    let updatedDone = done.filter((t) => t.id !== draggingId);

    if (movingToDone) {
      updatedDone = reorderList(
        [...updatedDone, { ...draggedTask, completed: true }],
        draggedTask.id,
        targetId
      );
    } else {
      updatedUndone = reorderList(
        [...updatedUndone, { ...draggedTask, completed: false }],
        draggedTask.id,
        targetId
      );
    }

    const optimisticTasks = buildOptimistic(updatedUndone, updatedDone);
    const orderIds = optimisticTasks.map((t) => t.id);

    await onMove(orderIds, draggedTask.id, targetCompleted, optimisticTasks);
    setDraggingId(null);
  };

  const column = (
    title: string,
    list: Task[],
    status: "done" | "undone",
    emptyMessage: string,
    loading: boolean
  ) => (
    <Card
      className={cn(
        "flex h-full flex-col transition-colors duration-200",
        hoverStatus === status && draggingId
          ? "border-slate-300 ring-1 ring-slate-200"
          : "",
        draggingId ? "cursor-grabbing" : "cursor-default"
      )}
      onDragEnter={() => setHoverStatus(status)}
      onDragLeave={() => setHoverStatus(null)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex h-5 w-8 items-center justify-center">
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-500" />
            ) : (
              <span className="text-sm font-semibold text-slate-500 leading-none">
                {list.length}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent
        className="flex flex-1 flex-col space-y-3 min-h-[220px]"
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => handleDrop(status, null)}
      >
        {list.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-lg bg-white px-4 py-6 text-sm text-slate-500">
            {emptyMessage}
          </div>
        ) : (
          list.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
              onUpdate={onUpdate}
              categories={categories}
              draggable
              onDragStart={() => setDraggingId(task.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(status, task.id)}
              dimmed={draggingId === task.id}
            />
          ))
        )}
      </CardContent>
    </Card>
  );

  const hasTasks = (tasks ?? []).length > 0;
  const showSkeleton = !tasks && isLoading;

  return (
    <div className="grid items-stretch gap-4 transition duration-300 md:grid-cols-2">
      {showSkeleton ? (
        <>
          <Card className="flex h-full flex-col border-slate-200 bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">Undone</CardTitle>
                <div className="flex h-5 w-8 items-center justify-center">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col min-h-[220px]">
              <div className="flex flex-1 rounded-lg bg-white" />
            </CardContent>
          </Card>
          <Card className="flex h-full flex-col border-slate-200 bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">Done</CardTitle>
                <div className="flex h-5 w-8 items-center justify-center">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col min-h-[220px]">
              <div className="flex flex-1 rounded-lg bg-white" />
            </CardContent>
          </Card>
        </>
      ) : hasTasks ? (
        <>
          {column("Undone", undone, "undone", "Nothing pending", isLoading)}
          {column("Done", done, "done", "No completed tasks", isLoading)}
        </>
      ) : (
        <>
          {column("Undone", [], "undone", "Nothing pending", isLoading)}
          {column("Done", [], "done", "No completed tasks", isLoading)}
        </>
      )}
    </div>
  );
}
