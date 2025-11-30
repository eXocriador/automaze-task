"use client";

import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  closestCenter,
  DragOverlay,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Task, TaskUpdateInput } from "@/lib/types";
import { cn } from "@/lib/utils";

import { TaskItem } from "./TaskItem";

type ColumnProps = {
  title: string;
  list: Task[];
  status: Container;
  emptyMessage: string;
  loading: boolean;
  children: React.ReactNode;
};

function Column({ title, list, emptyMessage, loading, children }: ColumnProps) {
  return (
    <Card className="flex h-full flex-col transition-colors duration-200">
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
      <CardContent className="flex flex-1 flex-col space-y-3 min-h-[220px]">
        {list.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-lg bg-white px-4 py-6 text-sm text-slate-500">
            {emptyMessage}
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

type SortableTaskProps = {
  task: Task;
  container: Container;
  id: number;
  onToggle: (task: Task) => Promise<void>;
  onDelete: (task: Task) => Promise<void>;
  onUpdate: (taskId: number, payload: TaskUpdateInput) => Promise<void>;
  categories: string[];
};

function SortableTask({
  task,
  container,
  id,
  onToggle,
  onDelete,
  onUpdate,
  categories
}: SortableTaskProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id,
    data: { type: "item", container }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskItem
        task={task}
        onToggle={onToggle}
        onDelete={onDelete}
        onUpdate={onUpdate}
        categories={categories}
        isDragging={false}
      />
    </div>
  );
}

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

type Container = "undone" | "done";

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
  const [activeId, setActiveId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<Container>("undone");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 }
    })
  );

  const undone = useMemo(
    () => (tasks ?? []).filter((t) => !t.completed),
    [tasks]
  );
  const done = useMemo(() => (tasks ?? []).filter((t) => t.completed), [tasks]);

  const getContainer = (id: number | null): Container | null => {
    if (id === null) return null;
    if (undone.some((t) => t.id === id)) return "undone";
    if (done.some((t) => t.id === id)) return "done";
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(Number(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !tasks) {
      setActiveId(null);
      return;
    }

    const activeTaskId = Number(active.id);
    const overId = Number(over.id);
    const activeContainer = getContainer(activeTaskId);
    const overContainer = getContainer(overId);

    if (!activeContainer || !overContainer) {
      setActiveId(null);
      return;
    }

    if (activeContainer === overContainer) {
      const list = activeContainer === "undone" ? undone : done;
      const ids = list.map((t) => t.id);
      const fromIndex = ids.indexOf(activeTaskId);
      const toIndex = ids.indexOf(overId);
      if (fromIndex === -1 || toIndex === -1) {
        setActiveId(null);
        return;
      }
      const newIds = arrayMove(ids, fromIndex, toIndex);
      const reordered = newIds.map((id) => list.find((t) => t.id === id)!);
      const optimistic =
        activeContainer === "undone"
          ? [...reordered, ...done]
          : [...undone, ...reordered];
      await onReorder(optimistic.map((t) => t.id), optimistic);
    } else {
      const sourceList = activeContainer === "undone" ? undone : done;
      const targetList = overContainer === "undone" ? undone : done;
      const movingTask = sourceList.find((t) => t.id === activeTaskId);
      if (!movingTask) {
        setActiveId(null);
        return;
      }
      const remainingSource = sourceList.filter((t) => t.id !== activeTaskId);
      const targetIds = targetList.map((t) => t.id);
      const insertAt = targetIds.indexOf(overId);
      const newTargetIds = [
        ...targetIds.slice(0, insertAt === -1 ? targetIds.length : insertAt),
        activeTaskId,
        ...targetIds.slice(insertAt === -1 ? targetIds.length : insertAt)
      ];

      const newUndoneIds =
        activeContainer === "undone"
          ? remainingSource.map((t) => t.id)
          : newTargetIds;
      const newDoneIds =
        activeContainer === "done"
          ? remainingSource.map((t) => t.id)
          : newTargetIds;

      const optimistic = [
        ...newUndoneIds
          .map((id) => tasks.find((t) => t.id === id))
          .filter(Boolean)
          .map((t) => ({ ...t!, completed: false })),
        ...newDoneIds
          .map((id) => tasks.find((t) => t.id === id))
          .filter(Boolean)
          .map((t) => ({ ...t!, completed: true }))
      ];

      await onMove(
        [...newUndoneIds, ...newDoneIds],
        activeTaskId,
        overContainer === "done",
        optimistic
      );
    }

    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="mb-3 flex gap-2 md:hidden">
        {(["undone", "done"] as Container[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition",
              activeTab === tab
                ? "border-slate-300 bg-white text-slate-900 shadow-sm"
                : "border-slate-200 bg-slate-100 text-slate-500"
            )}
          >
            {tab === "undone" ? "Undone" : "Done"}{" "}
            {tab === "undone" ? `(${undone.length})` : `(${done.length})`}
          </button>
        ))}
      </div>

      <div className="grid items-stretch gap-4 transition duration-300 md:grid-cols-2">
        <div className={cn("md:block", activeTab === "undone" ? "block" : "hidden")}>
          <Column
            title="Undone"
            list={undone}
            status="undone"
            emptyMessage="Nothing pending"
            loading={isLoading}
          >
            <SortableContext
              items={undone.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {undone.map((task) => (
                <SortableTask
                  key={task.id}
                  id={task.id}
                  task={task}
                  container="undone"
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                  categories={categories}
                />
              ))}
            </SortableContext>
          </Column>
        </div>

        <div className={cn("md:block", activeTab === "done" ? "block" : "hidden")}>
          <Column
            title="Done"
            list={done}
            status="done"
            emptyMessage="No completed tasks"
            loading={isLoading}
          >
            <SortableContext
              items={done.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {done.map((task) => (
                <SortableTask
                  key={task.id}
                  id={task.id}
                  task={task}
                  container="done"
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                  categories={categories}
                />
              ))}
            </SortableContext>
          </Column>
        </div>
      </div>
      <DragOverlay dropAnimation={null}>
        {activeId ? (
          <div className="w-[360px] max-w-sm">
            <TaskItem
              task={(tasks || []).find((t) => t.id === activeId)!}
              onToggle={onToggle}
              onDelete={onDelete}
              onUpdate={onUpdate}
              categories={categories}
              isDragging
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
