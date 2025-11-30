"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";

import { TaskForm } from "@/components/task/TaskForm";
import { TaskList } from "@/components/task/TaskList";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import {
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
  reorderTasks
} from "@/lib/api";
import {
  Task,
  TaskCreateInput,
  TaskSort,
  TaskStatus,
  TaskUpdateInput
} from "@/lib/types";
import { TaskFilters } from "@/components/filters/TaskFilters";

const categoryOptions = ["Work", "Personal", "Home", "Study"];
const sortOptions: { value: TaskSort; label: string }[] = [
  { value: "priority_desc", label: "Priority ↓" },
  { value: "priority_asc", label: "Priority ↑" },
  { value: "due_date_desc", label: "Due date ↓" },
  { value: "due_date_asc", label: "Due date ↑" },
  { value: "created_desc", label: "Created ↓" },
  { value: "created_asc", label: "Created ↑" }
];

export default function HomePage() {
  const [search, setSearch] = useState("");
  const status: TaskStatus = "all";
  const [sort, setSort] = useState<TaskSort>(null);
  const [category, setCategory] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: tasks,
    isLoading,
    mutate,
    isValidating
  } = useSWR(
    ["tasks", search, status, sort, category],
    () =>
      fetchTasks({
        search: search.trim() || null,
        status,
        sort,
        category: category.trim() || null
      }),
    { revalidateOnFocus: false }
  );

  const total = tasks?.length ?? 0;
  const doneCount = useMemo(
    () => tasks?.filter((t) => t.completed).length ?? 0,
    [tasks]
  );

  const handleCreate = async (payload: TaskCreateInput) => {
    await mutate(
      async (current) => {
        const created = await createTask(payload);
        return [created, ...(current ?? [])];
      },
      {
        optimisticData: (current) => [
          {
            id: Date.now(),
            title: payload.title,
            description: payload.description,
            completed: payload.completed ?? false,
            priority: payload.priority ?? 1,
            category: payload.category,
            due_date: payload.due_date,
            created_at: new Date().toISOString()
          },
          ...(current ?? [])
        ],
        rollbackOnError: true,
        revalidate: true,
        populateCache: true
      }
    );
    setIsModalOpen(false);
  };

  const handleToggle = async (task: Task) => {
    const nextCompleted = !task.completed;
    await mutate(
      async (current) => {
        const updated = await updateTask(task.id, { completed: nextCompleted });
        return (current ?? []).map((t) => (t.id === task.id ? updated : t));
      },
      {
        optimisticData: (current) =>
          (current ?? []).map((t) =>
            t.id === task.id ? { ...t, completed: nextCompleted } : t
          ),
        rollbackOnError: true,
        revalidate: true,
        populateCache: true
      }
    );
  };

  const handleDelete = async (task: Task) => {
    await mutate(
      async (current) => {
        await deleteTask(task.id);
        return (current ?? []).filter((t) => t.id !== task.id);
      },
      {
        optimisticData: (current) =>
          (current ?? []).filter((t) => t.id !== task.id),
        rollbackOnError: true,
        revalidate: true,
        populateCache: true
      }
    );
  };

  const handleReorder = async (orderIds: number[], optimistic?: Task[]) => {
    await mutate(
      async () => {
        const updated = await reorderTasks(orderIds);
        return updated;
      },
      {
        optimisticData: optimistic ?? tasks,
        rollbackOnError: true,
        revalidate: true,
        populateCache: true
      }
    );
  };

  const handleMove = async (
    orderIds: number[],
    movedTaskId: number,
    completed: boolean,
    optimistic?: Task[]
  ) => {
    await mutate(
      async () => {
        await updateTask(movedTaskId, { completed });
        const updated = await reorderTasks(orderIds);
        return updated;
      },
      {
        optimisticData: optimistic ?? tasks,
        rollbackOnError: true,
        revalidate: true,
        populateCache: true
      }
    );
  };

  const sanitizePayload = (payload: TaskUpdateInput): TaskUpdateInput => {
    const next: TaskUpdateInput = {};
    if (payload.title !== undefined) next.title = payload.title;
    if (payload.description !== undefined)
      next.description = payload.description ?? undefined;
    if (payload.completed !== undefined) next.completed = payload.completed;
    if (payload.priority !== undefined) next.priority = payload.priority;
    if (payload.category !== undefined)
      next.category = payload.category ?? undefined;
    if (payload.due_date !== undefined) next.due_date = payload.due_date ?? undefined;
    return next;
  };

  const handleUpdate = async (taskId: number, payload: TaskUpdateInput) => {
    const updatePayload = sanitizePayload(payload);
    await mutate(
      async () => {
        const updated = await updateTask(taskId, updatePayload);
        if (!tasks) return [updated];
        return tasks.map((t) => (t.id === taskId ? updated : t));
      },
      {
        optimisticData: tasks?.map((t) =>
          t.id === taskId ? { ...t, ...updatePayload } : t
        ),
        rollbackOnError: true,
        revalidate: true,
        populateCache: true
      }
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container pt-4 pb-8 md:pt-8">
        <div className="mx-auto flex max-w-[900px] flex-col gap-4">
          <Card className="bg-gradient-to-r from-white to-slate-50">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start justify-between gap-3 md:flex-col md:items-start md:gap-1">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-2xl font-semibold text-slate-900 md:text-3xl">
                      Task manager
                    </CardTitle>
                    <div className="flex items-center gap-2 md:hidden">
                      <Badge variant={isValidating ? "warning" : "success"}>
                        {isValidating ? "Refreshing" : "Synced"}
                      </Badge>
                      <Badge variant="secondary">
                        {doneCount} / {total} done
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <Badge className="hidden md:inline-flex" variant={isValidating ? "warning" : "success"}>
                    {isValidating ? "Refreshing" : "Synced"}
                  </Badge>
                  <Badge className="hidden md:inline-flex" variant="secondary">
                    {doneCount} / {total} done
                  </Badge>
                  <Button className="whitespace-nowrap" onClick={() => setIsModalOpen(true)}>
                    Add task
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardContent className="p-5">
              <TaskFilters
                search={search}
                onSearchChange={setSearch}
                category={category}
                onCategoryChange={setCategory}
                sort={sort}
                onSortChange={(v) => setSort(v as TaskSort)}
                categoryOptions={categoryOptions}
                sortOptions={sortOptions}
              />
            </CardContent>
          </Card>

          <TaskList
            tasks={tasks}
            isLoading={isLoading}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onReorder={handleReorder}
            onMove={handleMove}
            onUpdate={handleUpdate}
            categories={categoryOptions}
          />
        </div>
      </div>
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add a new task"
      >
        <TaskForm onSubmit={handleCreate} categories={categoryOptions} />
      </Modal>
    </main>
  );
}
