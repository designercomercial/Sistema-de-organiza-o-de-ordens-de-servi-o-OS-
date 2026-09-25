"use client"

import { Check } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import type { ChecklistItem } from "@/types"

export function ChecklistProgress({
  items,
  onToggle,
}: {
  items: ChecklistItem[]
  onToggle?: (id: string) => void
}) {
  const done = items.filter((item) => item.done).length
  const percent = items.length ? Math.round((done / items.length) * 100) : 0

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">
          {done} de {items.length} itens concluídos
        </p>
        <Progress value={percent} className="mt-2" />
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              disabled={!onToggle}
              onClick={() => onToggle?.(item.id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left text-sm",
                item.done && "bg-muted/40 text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-4 items-center justify-center rounded border",
                  item.done && "border-primary bg-primary text-primary-foreground"
                )}
              >
                {item.done ? <Check className="size-3" /> : null}
              </span>
              {item.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
