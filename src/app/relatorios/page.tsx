"use client"

import { useMemo, useState } from "react"
import { addDays, endOfMonth, format, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import { EmptyState, MetricCard } from "@/components/page-header"
import { DEMO_TODAY } from "@/lib/demo-date"
import { getDisplayStatus } from "@/lib/status"
import { useApp } from "@/store/app-store"

const monthStart = `${DEMO_TODAY.slice(0, 7)}-01`
const monthEnd = format(endOfMonth(parseISO(DEMO_TODAY)), "yyyy-MM-dd")

// Atalhos que preenchem o intervalo de datas.
const periods: { id: string; label: string; from: string; to: string }[] = [
  { id: "todos", label: "Todo o período", from: "", to: "" },
  { id: "hoje", label: "Hoje", from: DEMO_TODAY, to: DEMO_TODAY },
  {
    id: "7dias",
    label: "Últimos 7 dias",
    from: format(addDays(parseISO(DEMO_TODAY), -6), "yyyy-MM-dd"),
    to: DEMO_TODAY,
  },
  { id: "mes", label: "Este mês", from: monthStart, to: monthEnd },
]

const emptyFilters = { from: "", to: "" }

export default function ReportsPage() {
  const { serviceOrders, employees, serviceTypes } = useApp()
  const [filters, setFilters] = useState(emptyFilters)
  const set = (patch: Partial<typeof emptyFilters>) =>
    setFilters((current) => ({ ...current, ...patch }))

  const filtered = useMemo(() => {
    return serviceOrders
      .map((order) => ({ ...order, display: getDisplayStatus(order) }))
      .filter((order) => {
        if (filters.from && order.date < filters.from) return false
        if (filters.to && order.date > filters.to) return false
        return true
      })
  }, [filters, serviceOrders])

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Visão operacional do parque de OS — volume, status e carga da equipe.
      </p>

      <div className="rounded-xl border bg-card p-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="space-y-1">
            <span className="block text-xs text-muted-foreground">De</span>
            <input
              type="date"
              value={filters.from}
              max={filters.to || undefined}
              onChange={(event) => set({ from: event.target.value })}
              className="h-8 rounded-lg border border-input bg-background px-2 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="block text-xs text-muted-foreground">Até</span>
            <input
              type="date"
              value={filters.to}
              min={filters.from || undefined}
              onChange={(event) => set({ to: event.target.value })}
              className="h-8 rounded-lg border border-input bg-background px-2 text-sm"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {periods.map((item) => (
              <Button
                key={item.id}
                size="sm"
                variant={filters.from === item.from && filters.to === item.to ? "default" : "outline"}
                onClick={() => set({ from: item.from, to: item.to })}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <MetricCard label="Total de OS" value={filtered.length} />
        <MetricCard
          label="Abertas"
          value={filtered.filter((item) => item.display !== "concluida" && item.display !== "cancelada").length}
        />
        <MetricCard
          label="Concluídas"
          value={filtered.filter((item) => item.display === "concluida").length}
          tone="success"
        />
        <MetricCard
          label="Atrasadas"
          value={filtered.filter((item) => item.display === "atrasada").length}
          tone="warning"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhuma OS encontrada"
          description="Ajuste os filtros para ver os números do período."
        />
      ) : (
        <>
          <section className="rounded-xl border bg-card p-4">
            <h2 className="mb-3 font-medium">Por colaborador</h2>
            <div className="space-y-2">
              {employees.map((employee) => {
                const count = filtered.filter((order) => order.employeeIds.includes(employee.id)).length
                if (!count) return null
                return (
                  <div key={employee.id} className="flex justify-between text-sm">
                    <span>{employee.name}</span>
                    <span className="tabular-nums text-muted-foreground">{count} OS</span>
                  </div>
                )
              })}
            </div>
          </section>
          <section className="rounded-xl border bg-card p-4">
            <h2 className="mb-3 font-medium">Por tipo de serviço</h2>
            <div className="space-y-2">
              {serviceTypes.map((type) => {
                const count = filtered.filter((order) => order.serviceTypeId === type.id).length
                if (!count) return null
                return (
                  <div key={type.id} className="flex justify-between text-sm">
                    <span>{type.name}</span>
                    <span className="tabular-nums text-muted-foreground">{count} OS</span>
                  </div>
                )
              })}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
