"use client"

import { use } from "react"
import Link from "next/link"
import { MetricCard } from "@/components/page-header"
import { EmployeeStatusBadge, StatusBadge } from "@/components/status-badge"
import { DEMO_TODAY } from "@/lib/demo-date"
import { formatOsNumber, getDisplayStatus } from "@/lib/status"
import { useApp, useLookups } from "@/store/app-store"

export default function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { employees } = useApp()
  const { ordersForEmployee, clientById, serviceTypeById } = useLookups()
  const employee = employees.find((item) => item.id === id)
  if (!employee) return <p>Colaborador não encontrado.</p>
  const orders = ordersForEmployee(employee.id).sort((a, b) =>
    `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`)
  )
  const today = orders.filter((order) => order.date === DEMO_TODAY)
  const doneMonth = orders.filter(
    (order) => order.status === "concluida" && order.date.startsWith("2026-09")
  )
  const next = orders
    .filter((order) => {
      const status = getDisplayStatus(order)
      return (
        (status === "agendada" || status === "em_andamento") &&
        `${order.date}${order.startTime}` >= `${DEMO_TODAY}09:15`
      )
    })
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))[0]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{employee.name}</h1>
          <p className="text-sm text-muted-foreground">{employee.role}</p>
          <p className="text-sm text-muted-foreground">{employee.phone}</p>
        </div>
        <EmployeeStatusBadge status={employee.status} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="OS hoje" value={today.length} />
        <MetricCard label="OS concluídas no mês" value={doneMonth.length} />
        <MetricCard label="Próximo atendimento" value={next?.startTime ?? "—"} />
      </div>
      <section className="rounded-xl border bg-card p-4">
        <h2 className="mb-3 font-medium">Agenda do colaborador</h2>
        <div className="space-y-2">
          {today.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem OS neste dia.</p>
          ) : (
            today.map((order) => (
              <Link
                key={order.id}
                href={`/ordens/${order.id}`}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <span>
                  {order.startTime} · {clientById(order.clientId)?.name} ·{" "}
                  {serviceTypeById(order.serviceTypeId)?.name}
                </span>
                <StatusBadge status={getDisplayStatus(order)} />
              </Link>
            ))
          )}
        </div>
      </section>
      <section className="rounded-xl border bg-card p-4">
        <h2 className="mb-3 font-medium">Histórico recente</h2>
        <div className="space-y-2">
          {orders.slice(0, 6).map((order) => (
            <Link key={order.id} href={`/ordens/${order.id}`} className="block rounded-lg border px-3 py-2">
              <p className="text-sm font-medium">
                {order.date.split("-").reverse().join("/")} · OS {formatOsNumber(order.number)}
              </p>
              <p className="text-sm text-muted-foreground">
                {clientById(order.clientId)?.name} · {serviceTypeById(order.serviceTypeId)?.name}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
