"use client"

import Link from "next/link"
import { DEMO_TODAY } from "@/lib/demo-date"
import { formatEmployeeNames } from "@/lib/employees"
import { formatOsNumber, getDisplayStatus } from "@/lib/status"
import { StatusBadge } from "@/components/status-badge"
import { useApp, useLookups } from "@/store/app-store"

import type { ServiceOrder } from "@/types"

function reasonFor(order: ServiceOrder) {
  const display = getDisplayStatus(order)
  if (order.priority === "urgente" && display !== "concluida") return "Prioridade urgente"
  if (order.status === "agendada" && display === "atrasada" && order.date === DEMO_TODAY) {
    return "Horário iniciado e atendimento ainda não iniciado"
  }
  if (display === "atrasada") return "Atendimento atrasado"
  return "Requer acompanhamento"
}

export default function AlertsPage() {
  const { serviceOrders } = useApp()
  const { clientById, employeeById } = useLookups()
  const alerts = serviceOrders.filter((order) => {
    const display = getDisplayStatus(order)
    return (
      display === "atrasada" ||
      (order.priority === "urgente" && order.status !== "concluida" && order.status !== "cancelada")
    )
  })

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Exceções da operação: atraso, urgência e horário iniciado sem atendimento.
      </p>
      {alerts.length === 0 ? (
        <p className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
          Nenhuma OS em atraso ou urgente no momento.
        </p>
      ) : (
        alerts.map((order) => (
          <Link
            key={order.id}
            href={`/ordens/${order.id}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4 hover:bg-muted/40"
          >
            <div>
              <p className="font-medium">
                OS {formatOsNumber(order.number)} · {clientById(order.clientId)?.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {reasonFor(order)} · {formatEmployeeNames(order.employeeIds, employeeById)}
              </p>
            </div>
            <StatusBadge status={getDisplayStatus(order)} />
          </Link>
        ))
      )}
    </div>
  )
}
