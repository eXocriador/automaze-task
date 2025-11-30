'use client';

import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const transitionClass =
    "transition-[opacity,transform] duration-220 ease-in-out";

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
      aria-hidden={!open}
    >
      <div
        className={cn(
          "absolute inset-0 bg-slate-900/60 backdrop-blur-md",
          transitionClass,
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
        aria-label="Close modal"
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl",
          transitionClass,
          open ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-95 opacity-0",
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
          aria-label="Close modal"
        >
          &#x2715;
        </button>
        {title ? <h2 className="mb-4 pr-8 text-xl font-semibold text-slate-900">{title}</h2> : null}
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
}
