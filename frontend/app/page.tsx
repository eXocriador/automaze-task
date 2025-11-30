'use client';

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
import { createTask, deleteTask, fetchTasks, updateTask } from "@/lib/api";
import { Task, TaskCreateInput, TaskSort, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusOptions: TaskStatus[] = ["all", "done", "undone"];
const sortOptions: { value: TaskSort; label: string }[] = [
  { value: null, label: "Newest first" },
  { value: "priority_desc", label: "Priority ↓" },
  { value: "priority_asc", label: "Priority ↑" }
];

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TaskStatus>("all");
  const [sort, setSort] = useState<TaskSort>(null);

  const { data: tasks, isLoading, mutate, isValidating } = useSWR(
    ["tasks", search, status, sort],
    () =>
      fetchTasks({
        search: search.trim() || null,
        status,
        sort
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
            created_at: new Date().toISOString()
          },
          ...(current ?? [])
        ],
        rollbackOnError: true,
        revalidate: true,
        populateCache: true
      }
    );
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container py-12">
        <div className="mx-auto flex max-w-[800px] flex-col gap-8">
          <Card className="bg-gradient-to-r from-white to-slate-50">
            <CardHeader className="gap-2">
              <CardTitle className="text-3xl font-semibold text-slate-900">
                Task list
              </CardTitle>
              <CardDescription>
                Next.js App Router + FastAPI via /api/tasks proxy
              </CardDescription>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={isValidating ? "warning" : "success"}>
                  {isValidating ? "Refreshing..." : "Synced"}
                </Badge>
                <Badge variant="secondary">
                  {doneCount} / {total} done
                </Badge>
              </div>
            </CardHeader>
          </Card>

          <TaskForm onSubmit={handleCreate} />

          <Card>
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                {statusOptions.map((option) => (
                  <Button
                    key={option}
                    variant={status === option ? "primary" : "secondary"}
                    onClick={() => setStatus(option)}
                  >
                    {option === "all"
                      ? "All"
                      : option === "done"
                      ? "Done"
                      : "Undone"}
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full min-w-[200px] rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-offset-2 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 sm:w-64"
                />
                <select
                  value={sort ?? ""}
                  onChange={(e) =>
                    setSort(
                      e.target.value === ""
                        ? null
                        : (e.target.value as TaskSort)
                    )
                  }
                  className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-offset-2 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                >
                  {sortOptions.map((option) => (
                    <option key={option.label} value={option.value ?? ""}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <TaskList
            tasks={tasks}
            isLoading={isLoading}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </main>
  );
}
