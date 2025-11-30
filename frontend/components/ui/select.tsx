'use client';

import * as RadixSelect from "@radix-ui/react-select";
import { ChevronDownIcon, CheckIcon } from "@radix-ui/react-icons";

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
  return (
    <RadixSelect.Root value={value} onValueChange={onChange}>
      <RadixSelect.Trigger
        className={cn(
          "flex h-10 w-full min-w-[140px] items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm transition",
          "hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200",
          className
        )}
      >
        <RadixSelect.Value placeholder={placeholder ?? "Select"} />
        <RadixSelect.Icon className="ml-auto">
          <ChevronDownIcon className="h-4 w-4 text-slate-500" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          side="bottom"
          align="start"
          position="popper"
          sideOffset={6}
          className="z-[120] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl"
        >
          <RadixSelect.Viewport className="max-h-64 min-w-[var(--radix-select-trigger-width)]">
            {options.map((opt) => (
              <RadixSelect.Item
                key={opt.value}
                value={opt.value}
                className={cn(
                  "flex cursor-pointer select-none items-center justify-between px-3 py-2 text-sm text-slate-800 outline-none transition",
                  "data-[highlighted]:bg-slate-50 data-[highlighted]:text-slate-900",
                  "data-[state=checked]:bg-slate-100 data-[state=checked]:font-semibold"
                )}
              >
                <RadixSelect.ItemText className="mr-auto">{opt.label}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
