'use client';

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type Option = {
  label: string;
  value: string;
};

type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
};

export function Select({ value, onChange, options, placeholder, className }: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [menuWidth, setMenuWidth] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    if (btnRef.current) {
      setMenuWidth(btnRef.current.offsetWidth);
    }
  }, [value, options]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = options.find((o) => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        ref={btnRef}
        className={cn(
          "flex w-full min-w-[140px] items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm transition",
          "hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200",
          className
        )}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{current ? current.label : placeholder || "Select"}</span>
        <span
          className={cn(
            "text-slate-500 transition-transform duration-200",
            open ? "rotate-180" : "rotate-0"
          )}
        >
          ▾
        </span>
      </button>
      {open ? (
        <div
          className="absolute right-0 z-50 mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
          style={{ width: menuWidth }}
        >
          <ul className="max-h-64 overflow-auto py-2 text-sm text-slate-900">
            {options.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2 text-left transition",
                    opt.value === value
                      ? "bg-slate-100 font-semibold text-slate-900"
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  <span>{opt.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
