"use client";

import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  PointerSensor,
  closestCenter,
  useDroppable,
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

type ColumnProps = {
  title: string;
  list: Task[];
  status: Container;
  emptyMessage: string;
  loading: boolean;
  children: React.ReactNode;
};

function Column({ title, list, status, emptyMessage, loading, children }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${status}-dropzone`,
    data: { type: "column", container: status }
  });

  return (
    <Card
      className={cn(
        "flex h-full flex-col transition-colors duration-200",
        isOver ? "border-slate-300 ring-1 ring-slate-200" : "",
        "cursor-default"
      )}
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
        ref={setNodeRef}
        className={cn(
          "flex flex-1 flex-col space-y-3 min-h-[220px]",
          isOver ? "bg-slate-50/40" : ""
        )}
      >
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

function SortableTask({
  task,
  container,
  onToggle,
  onDelete,
  onUpdate,
  categories
}: {
  task: Task;
  container: Container;
  onToggle: (task: Task) => Promise<void>;
  onDelete: (task: Task) => Promise<void>;
  onUpdate: (taskId: number, payload: TaskUpdateInput) => Promise<void>;
  categories: string[];
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task.id,
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
        isDragging={isDragging}
      />
    </div>
  );
}

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
  const [overContainer, setOverContainer] = useState<Container | null>(null);

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

  const getContainer = (id: number): Container | null => {
    if (undone.find((t) => t.id === id)) return "undone";
    if (done.find((t) => t.id === id)) return "done";
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(Number(active.id));
    const container = active.data.current?.container as Container | undefined;
    if (container) setOverContainer(container);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const container = event.over?.data.current?.container as Container | undefined;
    if (container) setOverContainer(container);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !tasks) {
      setActiveId(null);
      setOverContainer(null);
      return;
    }

    const activeTaskId = Number(active.id);
    const overType = over.data.current?.type as "item" | "column" | undefined;
    const overItemId =
      overType === "item" && typeof over.id === "number"
        ? Number(over.id)
        : null;
    const activeContainer =
      (active.data.current?.container as Container | undefined) ||
      getContainer(activeTaskId);
    const overContainer =
      (over.data.current?.container as Container | undefined) || activeContainer;

    if (!activeContainer || !overContainer) {
      setActiveId(null);
      setOverContainer(null);
      return;
    }

    if (activeContainer === overContainer) {
      const list = activeContainer === "undone" ? undone : done;
      const ids = list.map((t) => t.id);
      const targetIndex =
        overType === "item" && overItemId !== null
          ? ids.indexOf(overItemId)
          : Math.max(ids.length - 1, 0);
      const newIds = arrayMove(
        ids,
        ids.indexOf(activeTaskId),
        targetIndex
      );
      const reordered =
        activeContainer === "undone"
          ? newIds.map((id) => undone.find((t) => t.id === id)!)
          : newIds.map((id) => done.find((t) => t.id === id)!);
      const optimistic =
        activeContainer === "undone"
          ? [...reordered, ...done]
          : [...undone, ...reordered];
      await onReorder(optimistic.map((t) => t.id), optimistic);
    } else {
      const fromList = activeContainer === "undone" ? undone : done;
      const toList = overContainer === "undone" ? undone : done;
      const movingTask = fromList.find((t) => t.id === activeTaskId);
      if (!movingTask) {
        setActiveId(null);
        return;
      }
      const remainingSource = fromList.filter((t) => t.id !== activeTaskId);
      const targetIndex =
        overType === "item" && overItemId !== null
          ? toList.findIndex((t) => t.id === overItemId)
          : toList.length;
      const updatedTarget = [
        ...toList.slice(0, targetIndex),
        { ...movingTask, completed: overContainer === "done" },
        ...toList.slice(targetIndex)
      ];

      const optimistic =
        overContainer === "undone"
          ? [...updatedTarget, ...remainingSource]
          : [...remainingSource, ...updatedTarget];

      await onMove(
        optimistic.map((t) => t.id),
        activeTaskId,
        overContainer === "done",
        optimistic
      );
    }

    setActiveId(null);
    setOverContainer(null);
  };

  const activeTask = tasks?.find((t) => t.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid items-stretch gap-4 transition duration-300 md:grid-cols-2">
        <Column
          title="Undone"
          list={undone}
          status="undone"
          emptyMessage="Nothing pending"
          loading={isLoading}
        >
          <SortableContext
            items={[
              ...undone.map((t) => t.id),
              ...(overContainer === "undone" && activeTask && !undone.some((t) => t.id === activeTask.id)
                ? [activeTask.id]
                : [])
            ]}
            strategy={verticalListSortingStrategy}
          >
            {undone.map((task) => (
              <SortableTask
                key={task.id}
                task={task}
                container="undone"
                onToggle={onToggle}
                onDelete={onDelete}
                onUpdate={onUpdate}
                categories={categories}
              />
            ))}
            {overContainer === "undone" &&
            activeTask &&
            !undone.some((t) => t.id === activeTask.id) ? (
              <div className="h-16 rounded-md border-2 border-dashed border-slate-300 bg-white/80" />
            ) : null}
          </SortableContext>
        </Column>
        <Column
          title="Done"
          list={done}
          status="done"
          emptyMessage="No completed tasks"
          loading={isLoading}
        >
          <SortableContext
            items={[
              ...done.map((t) => t.id),
              ...(overContainer === "done" && activeTask && !done.some((t) => t.id === activeTask.id)
                ? [activeTask.id]
                : [])
            ]}
            strategy={verticalListSortingStrategy}
          >
            {done.map((task) => (
              <SortableTask
                key={task.id}
                task={task}
                container="done"
                onToggle={onToggle}
                onDelete={onDelete}
                onUpdate={onUpdate}
                categories={categories}
              />
            ))}
            {overContainer === "done" &&
            activeTask &&
            !done.some((t) => t.id === activeTask.id) ? (
              <div className="h-16 rounded-md border-2 border-dashed border-slate-300 bg-white/80" />
            ) : null}
          </SortableContext>
        </Column>
      </div>
    </DndContext>
  );
}
