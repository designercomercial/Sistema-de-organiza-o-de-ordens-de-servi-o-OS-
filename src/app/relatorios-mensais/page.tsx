"use client"

import { MetricCard } from "@/components/page-header"
import { DEMO_TODAY } from "@/lib/demo-date"
import { useApp } from "@/store/app-store"

export default function MonthlyReportsPage() {
  const { serviceOrders } = useApp()
  const month = serviceOrders.filter((order) => order.date.startsWith(DEMO_TODAY.slice(0, 7)))
  const done = month.filter((order) => order.status === "concluida")

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Setembro de 2026 — recorte mensal da operação.</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="OS no mês" value={month.length} />
        <MetricCard label="Concluídas" value={done.length} tone="success" />
        <MetricCard
          label="Taxa de conclusão"
          value={month.length ? `${Math.round((done.length / month.length) * 100)}%` : "—"}
        />
      </div>
    </div>
  )
}
