"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { TaskCreateInput } from "@/lib/types";

type Props = {
  onSubmit: (payload: TaskCreateInput) => Promise<void>;
  categories: string[];
};

export function TaskForm({ onSubmit, categories }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(5);
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        completed: false,
        category: category.trim() || undefined,
        due_date: dueDate ? new Date(dueDate).toISOString() : undefined
      });
      setTitle("");
      setDescription("");
      setPriority(5);
      setCategory("");
      setDueDate("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create task";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-700">Title</label>
        <input
          className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm font-medium outline-none ring-offset-2 transition hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          placeholder="e.g. Buy milk"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={255}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Description</label>
        <textarea
          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-medium outline-none ring-offset-2 transition hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          placeholder="Task details (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700">Category</label>
          <div className="mt-1">
            <Select
              value={category || "__none__"}
              onChange={(v) => setCategory(v === "__none__" ? "" : v)}
              options={[
                { label: "No category", value: "__none__" },
                ...categories.map((c) => ({ label: c, value: c }))
              ]}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Due date</label>
          <input
            type="date"
            className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm font-medium outline-none ring-offset-2 transition hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            placeholder="Select date"
            autoComplete="off"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-slate-700">Priority</label>
        <div className="w-28">
          <Select
            value={String(priority)}
            onChange={(v) => setPriority(Number(v))}
            options={Array.from({ length: 10 }, (_, i) => {
              const p = i + 1;
              return { label: `Priority: ${p}`, value: String(p) };
            })}
          />
        </div>
        <span className="text-xs text-slate-500">1 — lowest, 10 — highest</span>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Add task"}
        </Button>
      </div>
    </form>
  );
}
