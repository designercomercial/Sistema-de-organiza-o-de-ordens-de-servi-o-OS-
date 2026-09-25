"use client"

import { use } from "react"
import Link from "next/link"
import { EquipmentStatusBadge, StatusBadge } from "@/components/status-badge"
import { formatEmployeeNames } from "@/lib/employees"
import { formatOsNumber, getDisplayStatus } from "@/lib/status"
import { useApp, useLookups } from "@/store/app-store"

export default function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { equipment } = useApp()
  const { clientById, ordersForEquipment, employeeById, serviceTypeById } = useLookups()
  const item = equipment.find((entry) => entry.id === id)
  if (!item) return <p>Equipamento não encontrado.</p>
  const client = clientById(item.clientId)
  const history = ordersForEquipment(item.id).sort((a, b) => b.date.localeCompare(a.date))

  const facts = [
    { label: "Cliente", value: client?.name, href: `/clientes/${client?.id}` },
    { label: "Patrimônio", value: item.assetTag },
    { label: "Modelo", value: item.model },
    { label: "Número de Série", value: item.serialNumber },
    { label: "Potência", value: item.power },
    { label: "Status", value: <EquipmentStatusBadge status={item.status} /> },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{item.name}</h1>
        <p className="text-sm text-muted-foreground">{client?.name}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {facts.map((fact) => (
          <div key={fact.label} className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">{fact.label}</p>
            {fact.href && typeof fact.value === "string" ? (
              <Link href={fact.href} className="mt-1 block font-medium hover:underline">
                {fact.value}
              </Link>
            ) : (
              <div className="mt-1 font-medium">{fact.value}</div>
            )}
          </div>
        ))}
      </div>
      <section className="rounded-xl border bg-card p-4 shadow-sm">
        <h2 className="mb-4 font-medium">Histórico de Atendimentos</h2>
        <div className="space-y-2">
          {history.map((order) => (
            <Link
              key={order.id}
              href={`/ordens/${order.id}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-3 hover:bg-muted/40"
            >
              <div>
                <p className="text-sm font-medium">
                  {order.date.split("-").reverse().join("/")} · {serviceTypeById(order.serviceTypeId)?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  OS {formatOsNumber(order.number)} · {formatEmployeeNames(order.employeeIds, employeeById)}
                </p>
              </div>
              <StatusBadge status={getDisplayStatus(order)} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
