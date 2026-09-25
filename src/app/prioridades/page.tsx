"use client"

import { PriorityBadge } from "@/components/priority-badge"
import { priorityLabels } from "@/lib/status"
import type { Priority } from "@/types"

const items: { priority: Priority; hint: string }[] = [
  { priority: "baixa", hint: "Pode aguardar a janela planejada." },
  { priority: "normal", hint: "Padrão da operação." },
  { priority: "alta", hint: "Antecipar na agenda do dia." },
  { priority: "urgente", hint: "Entra em alertas e no painel de atenção." },
]

export default function PrioritiesPage() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Prioridades discretas, sem excesso de cor. Urgente gera alerta operacional.
      </p>
      {items.map((item) => (
        <div key={item.priority} className="flex items-center justify-between rounded-xl border bg-card p-4">
          <div>
            <p className="font-medium">{priorityLabels[item.priority]}</p>
            <p className="text-sm text-muted-foreground">{item.hint}</p>
          </div>
          <PriorityBadge priority={item.priority} />
        </div>
      ))}
    </div>
  )
}
