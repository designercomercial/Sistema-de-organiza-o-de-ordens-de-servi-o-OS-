"use client"

import { StatusBadge } from "@/components/status-badge"
import { statusLabels } from "@/lib/status"
import type { ServiceOrderStatus } from "@/types"

const items: { status: ServiceOrderStatus; hint: string }[] = [
  { status: "agendada", hint: "OS criada e ainda não iniciada." },
  { status: "em_andamento", hint: "Equipe em atendimento." },
  { status: "concluida", hint: "Serviço encerrado." },
  { status: "atrasada", hint: "Calculada quando o horário passa e a OS não iniciou." },
  { status: "cancelada", hint: "Atendimento descontinuado." },
]

export default function StatusConfigPage() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Status usados na operação. Atraso é derivado do horário, sem etapa extra no fluxo.
      </p>
      {items.map((item) => (
        <div key={item.status} className="flex items-center justify-between rounded-xl border bg-card p-4">
          <div>
            <p className="font-medium">{statusLabels[item.status]}</p>
            <p className="text-sm text-muted-foreground">{item.hint}</p>
          </div>
          <StatusBadge status={item.status} />
        </div>
      ))}
    </div>
  )
}
