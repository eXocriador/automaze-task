'use client';

import { Select } from "@/components/ui/select";
import { TaskSort } from "@/lib/types";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  sort: TaskSort;
  onSortChange: (value: TaskSort) => void;
  categoryOptions: string[];
  sortOptions: { value: TaskSort; label: string }[];
};

export function TaskFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  sort,
  onSortChange,
  categoryOptions,
  sortOptions
}: Props) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition hover:border-slate-300 focus:border-slate-400"
      />
      <div className="flex w-full max-w-[480px] flex-none justify-end gap-3 md:w-auto">
        <Select
          value={category}
          onChange={(v) => onCategoryChange(v)}
          options={[
            { label: "All categories", value: "" },
            ...categoryOptions.map((c) => ({ label: c, value: c }))
          ]}
          className="w-1/2"
        />
        <Select
          value={sort ?? ""}
          onChange={(v) => onSortChange((v || null) as TaskSort)}
          options={sortOptions.map((o) => ({
            label: o.label,
            value: o.value ?? ""
          }))}
          className="w-1/2"
        />
      </div>
    </div>
  );
}
