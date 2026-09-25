"use client"

import { cn } from "@/lib/utils"

export function ButtonOptionGroup({
  options,
  value,
  onChange,
  columns = 2,
  className,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  columns?: 1 | 2
  className?: string
}) {
  return (
    <div className={cn("grid gap-2", columns === 2 && "sm:grid-cols-2", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-colors",
            value === option.value
              ? "border-primary bg-primary/10 text-primary"
              : "hover:border-primary/40"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
