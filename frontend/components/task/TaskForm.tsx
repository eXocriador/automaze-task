'use client';

import { useState } from "react";

import { Button } from "@/components/ui/button";
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
      const message = err instanceof Error ? err.message : "Не вдалося створити задачу";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-lg border bg-white p-4 shadow-sm"
    >
      <div>
        <label className="text-sm font-medium text-slate-700">Назва</label>
        <input
          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-offset-2 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          placeholder="Напр. Купити молоко"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={255}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Опис</label>
        <textarea
          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-offset-2 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          placeholder="Деталі задачі (необов'язково)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-slate-700">Пріоритет</label>
        <input
          type="number"
          min={1}
          max={10}
          value={priority}
          onChange={(e) => setPriority(Number(e.target.value))}
          className="w-24 rounded-md border border-slate-200 px-3 py-2 text-sm outline-none ring-offset-2 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
        />
        <span className="text-xs text-slate-500">1 — низький, 10 — найвищий</span>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Створюємо..." : "Додати задачу"}
        </Button>
      </div>
    </form>
  );
}
