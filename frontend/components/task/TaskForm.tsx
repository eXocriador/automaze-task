'use client';

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskCreateInput } from "@/lib/types";

type Props = {
  onSubmit: (payload: TaskCreateInput) => Promise<void>;
};

export function TaskForm({ onSubmit }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(5);
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
        completed: false
      });
      setTitle("");
      setDescription("");
      setPriority(5);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create task";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Add a new task</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Title</label>
            <input
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-offset-2 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
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
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-offset-2 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              placeholder="Task details (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-700">Priority</label>
            <input
              type="number"
              min={1}
              max={10}
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="w-24 rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-offset-2 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
            <span className="text-xs text-slate-500">1 — lowest, 10 — highest</span>
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Add task"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
