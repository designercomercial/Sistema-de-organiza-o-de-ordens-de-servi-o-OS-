"use client"

import { MetricCard } from "@/components/page-header"
import { getDisplayStatus } from "@/lib/status"
import { useApp } from "@/store/app-store"

export default function ReportsPage() {
  const { serviceOrders, employees, serviceTypes } = useApp()
  const displayed = serviceOrders.map((order) => ({ ...order, display: getDisplayStatus(order) }))

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Visão operacional do parque de OS — volume, status e carga da equipe.
      </p>
      <div className="grid gap-3 sm:grid-cols-4">
        <MetricCard label="Total de OS" value={serviceOrders.length} />
        <MetricCard
          label="Abertas"
          value={displayed.filter((item) => item.display !== "concluida" && item.display !== "cancelada").length}
        />
        <MetricCard
          label="Concluídas"
          value={displayed.filter((item) => item.display === "concluida").length}
          tone="success"
        />
        <MetricCard
          label="Atrasadas"
          value={displayed.filter((item) => item.display === "atrasada").length}
          tone="warning"
        />
      </div>
      <section className="rounded-xl border bg-card p-4">
        <h2 className="mb-3 font-medium">Por colaborador</h2>
        <div className="space-y-2">
          {employees.map((employee) => {
            const count = serviceOrders.filter((order) => order.employeeIds.includes(employee.id)).length
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
            const count = serviceOrders.filter((order) => order.serviceTypeId === type.id).length
            return (
              <div key={type.id} className="flex justify-between text-sm">
                <span>{type.name}</span>
                <span className="tabular-nums text-muted-foreground">{count} OS</span>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
