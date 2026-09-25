"use client"

import { use, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ChecklistProgress } from "@/components/checklist-progress"
import { PriorityBadge } from "@/components/priority-badge"
import { StatusBadge } from "@/components/status-badge"
import { formatOsNumber, getDisplayStatus } from "@/lib/status"
import { useApp, useLookups } from "@/store/app-store"

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { serviceOrders, updateOrderStatus, toggleChecklistItem } = useApp()
  const { clientById, employeeById, serviceTypeById } = useLookups()
  const order = serviceOrders.find((item) => item.id === id)
  if (!order) {
    return <p className="text-sm text-muted-foreground">Ordem de serviço não encontrada.</p>
  }

  const display = getDisplayStatus(order)
  const client = clientById(order.clientId)
  const service = serviceTypeById(order.serviceTypeId)
  const assignees = order.employeeIds
    .map((employeeId) => employeeById(employeeId))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  const facts = useMemo(
    () => [
      { label: "Data", value: order.date.split("-").reverse().join("/") },
      { label: "Horário", value: order.startTime },
      { label: "Prioridade", value: <PriorityBadge priority={order.priority} /> },
      { label: "Cliente", value: client?.name, href: `/clientes/${client?.id}` },
    ],
    [client, order]
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">OS {formatOsNumber(order.number)}</p>
          <h1 className="text-xl font-semibold">{service?.name}</h1>
          <p className="text-sm text-muted-foreground">{client?.name}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={display} />
          {(order.status === "agendada" || order.status === "atrasada") && (
            <Button onClick={() => updateOrderStatus(order.id, "em_andamento")}>
              Iniciar atendimento
            </Button>
          )}
          {order.status === "em_andamento" && (
            <Button onClick={() => updateOrderStatus(order.id, "concluida")}>
              Concluir atendimento
            </Button>
          )}
          {order.status !== "cancelada" && order.status !== "concluida" ? (
            <AlertDialog>
              <AlertDialogTrigger render={<Button variant="outline" />}>
                Cancelar atendimento
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancelar esta ordem de serviço?</AlertDialogTitle>
                  <AlertDialogDescription>
                    A OS {formatOsNumber(order.number)} será marcada como cancelada. Essa ação
                    faz parte da demonstração e pode ser revertida recarregando a página.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Manter OS</AlertDialogCancel>
                  <AlertDialogCancel
                    variant="destructive"
                    onClick={() => updateOrderStatus(order.id, "cancelada")}
                  >
                    Cancelar OS
                  </AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">
            {assignees.length > 1 ? "Responsáveis" : "Responsável"}
          </p>
          <div className="mt-1 space-y-1">
            {assignees.map((employee) => (
              <Link
                key={employee.id}
                href={`/colaboradores/${employee.id}`}
                className="block font-medium hover:underline"
              >
                {employee.name}
              </Link>
            ))}
          </div>
        </div>
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
        <h2 className="mb-2 font-medium">Descrição do Serviço</h2>
        <p className="text-sm leading-6 text-muted-foreground">{order.description}</p>
      </section>

      <section className="rounded-xl border bg-card p-4 shadow-sm">
        <h2 className="mb-4 font-medium">Checklist</h2>
        <ChecklistProgress
          items={order.checklist}
          onToggle={
            order.status === "cancelada" || order.status === "concluida"
              ? undefined
              : (itemId) => toggleChecklistItem(order.id, itemId)
          }
        />
      </section>


      {order.technicalReport ? (
        <section className="rounded-xl border bg-card p-4 shadow-sm">
          <h2 className="mb-4 font-medium">Dados Técnicos</h2>
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Manômetro</p>
              <p className="mt-1 font-medium">
                {order.technicalReport.manometro === "bourdon"
                  ? "Bourdon"
                  : order.technicalReport.manometro === "coluna_agua"
                    ? "Coluna d'água"
                    : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Resultado do Teste</p>
              <p className="mt-1 font-medium">
                {order.technicalReport.resultadoTeste === "aprovado"
                  ? "Aprovado"
                  : order.technicalReport.resultadoTeste === "reprovado"
                    ? "Reprovado"
                    : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Teste de Estanqueidade</p>
              <p className="mt-1 font-medium">
                {order.technicalReport.redeEstanqueidade === "primaria"
                  ? "Rede primária"
                  : order.technicalReport.redeEstanqueidade === "secundaria"
                    ? "Rede secundária"
                    : "—"}
                {order.technicalReport.tempoTeste ? ` · ${order.technicalReport.tempoTeste}` : ""}
                {order.technicalReport.fluido ? ` · ${order.technicalReport.fluido}` : ""}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Condomínio/Estabelecimento</p>
              <p className="mt-1 font-medium">{order.technicalReport.establishment || "—"}</p>
            </div>
            {order.technicalReport.servicosPrestados.length ? (
              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground">Serviços Prestados</p>
                <p className="mt-1 font-medium">
                  {order.technicalReport.servicosPrestados.join(", ")}
                </p>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  )
}
