"use client"

import { use } from "react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MetricCard } from "@/components/page-header"
import { ServiceOrderTable } from "@/components/service-order-table"
import { EquipmentStatusBadge, StatusBadge } from "@/components/status-badge"
import { formatEmployeeNames } from "@/lib/employees"
import { DEMO_TODAY } from "@/lib/demo-date"
import { formatOsNumber, getDisplayStatus } from "@/lib/status"
import { useApp, useLookups } from "@/store/app-store"

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { clients } = useApp()
  const { equipmentForClient, ordersForClient, employeeById, serviceTypeById } = useLookups()
  const client = clients.find((item) => item.id === id)
  if (!client) return <p>Cliente não encontrado.</p>

  const equipmentList = equipmentForClient(client.id)
  const orders = ordersForClient(client.id).sort((a, b) => b.date.localeCompare(a.date))
  const open = orders.filter((order) => {
    const status = getDisplayStatus(order)
    return status === "agendada" || status === "em_andamento" || status === "atrasada"
  })
  const done = orders.filter((order) => order.status === "concluida")
  const last = done[0]
  const upcoming = open.filter((order) => order.date >= DEMO_TODAY).slice(0, 3)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{client.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {client.address} · {client.city} - {client.state}
        </p>
        <p className="text-sm text-muted-foreground">
          {client.phone} · {client.email} · {client.contact}
        </p>
      </div>
      <Tabs defaultValue="geral">
        <TabsList>
          <TabsTrigger value="geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="equipamentos">Equipamentos</TabsTrigger>
          <TabsTrigger value="os">Ordens de Serviço</TabsTrigger>
        </TabsList>
        <TabsContent value="geral" className="space-y-4 pt-4">
          <div className="grid gap-3 sm:grid-cols-4">
            <MetricCard label="Equipamentos" value={equipmentList.length} />
            <MetricCard label="OS abertas" value={open.length} />
            <MetricCard label="OS concluídas" value={done.length} />
            <MetricCard
              label="Último atendimento"
              value={last ? last.date.split("-").reverse().join("/") : "—"}
            />
          </div>
          <section className="rounded-xl border bg-card p-4">
            <h2 className="mb-3 font-medium">Próximos atendimentos</h2>
            <div className="space-y-2">
              {upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum atendimento futuro.</p>
              ) : (
                upcoming.map((order) => (
                  <Link key={order.id} href={`/ordens/${order.id}`} className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <span>
                      {order.date.split("-").reverse().join("/")} · {serviceTypeById(order.serviceTypeId)?.name}
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
              {orders.slice(0, 5).map((order) => (
                <Link key={order.id} href={`/ordens/${order.id}`} className="block rounded-lg border px-3 py-2">
                  <p className="text-sm font-medium">
                    {order.date.split("-").reverse().join("/")} · OS {formatOsNumber(order.number)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {serviceTypeById(order.serviceTypeId)?.name} ·{" "}
                    {formatEmployeeNames(order.employeeIds, employeeById)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </TabsContent>
        <TabsContent value="equipamentos" className="space-y-2 pt-4">
          {equipmentList.map((item) => (
            <Link
              key={item.id}
              href={`/equipamentos/${item.id}`}
              className="flex items-center justify-between rounded-xl border bg-card p-4"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.assetTag} · {item.model}
                </p>
              </div>
              <EquipmentStatusBadge status={item.status} />
            </Link>
          ))}
        </TabsContent>
        <TabsContent value="os" className="pt-4">
          <ServiceOrderTable orders={orders} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
