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
import { Select } from "@/components/ui/select";
import {
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
  reorderTasks
} from "@/lib/api";
import { Task, TaskCreateInput, TaskSort, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const categoryOptions = ["Work", "Personal", "Home", "Study"];
const sortOptions: { value: TaskSort; label: string }[] = [
  { value: null, label: "Newest first" },
  { value: "priority_desc", label: "Priority ↓" },
  { value: "priority_asc", label: "Priority ↑" },
  { value: "due_date_asc", label: "Due date ↑" },
  { value: "due_date_desc", label: "Due date ↓" }
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

  const handleUpdate = async (taskId: number, payload: Partial<Task>) => {
    await mutate(
      async () => {
        const updated = await updateTask(taskId, payload);
        if (!tasks) return [updated];
        return tasks.map((t) => (t.id === taskId ? updated : t));
      },
      {
        optimisticData: tasks?.map((t) =>
          t.id === taskId ? { ...t, ...payload } : t
        ),
        rollbackOnError: true,
        revalidate: true,
        populateCache: true
      }
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container py-12">
        <div className="mx-auto flex max-w-[800px] flex-col gap-8">
          <Card className="bg-gradient-to-r from-white to-slate-50">
            <CardHeader className="gap-3 pb-5">
              <div className="flex items-start justify-between">
                <CardTitle className="text-3xl font-semibold text-slate-900">
                  Task manager
                </CardTitle>
                <Badge variant={isValidating ? "warning" : "success"}>
                  {isValidating ? "Refreshing" : "Synced"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <CardDescription className="text-base text-slate-600">
                  Next.js + FastAPI + SQLite
                </CardDescription>
                <Badge variant="secondary">
                  {doneCount} / {total} done
                </Badge>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Add new task
                </p>
                <p className="text-xs text-slate-500">
                  Category & due date are optional; priority 1–10.
                </p>
              </div>
              <Button onClick={() => setIsModalOpen(true)}>Add task</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400 hover:border-slate-300"
                />
                <div className="flex w-full max-w-[480px] flex-none justify-end gap-3 md:w-auto">
                  <Select
                    value={category}
                    onChange={(v) => setCategory(v)}
                    options={[
                      { label: "All categories", value: "" },
                      ...categoryOptions.map((c) => ({ label: c, value: c }))
                    ]}
                    className="w-1/2"
                  />
                  <Select
                    value={sort ?? ""}
                    onChange={(v) => setSort(v === "" ? null : (v as TaskSort))}
                    options={sortOptions.map((o) => ({
                      label: o.label,
                      value: o.value ?? ""
                    }))}
                    className="w-1/2"
                  />
                </div>
              </div>
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
