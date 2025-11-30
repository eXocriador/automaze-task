"use client";

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
  const categoryAllKey = "__all__";
  const sortDefaultKey = "__default__";

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1 h-10 rounded-md border border-slate-200 px-4 text-sm font-medium outline-none transition hover:border-slate-300 focus:border-slate-400"
      />
      <div className="flex w-full max-w-[480px] flex-none justify-end gap-3 md:w-auto">
        <Select
          value={category || categoryAllKey}
          onChange={(v) => onCategoryChange(v === categoryAllKey ? "" : v)}
          options={[
            { label: "All", value: categoryAllKey },
            ...categoryOptions.map((c) => ({ label: c, value: c }))
          ]}
          className="w-1/2 h-10"
        />
        <Select
          value={sort ?? sortDefaultKey}
          onChange={(v) =>
            onSortChange(v === sortDefaultKey ? null : (v as TaskSort))
          }
          options={sortOptions.map((o) => ({
            label: o.label,
            value: o.value ?? sortDefaultKey
          }))}
          className="w-1/2 h-10"
        />
      </div>
    </div>
  );
}
