"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { AlertTriangle, ClipboardList, MapPin, Phone, Send, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader, EmptyState } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { DEMO_TODAY } from "@/lib/demo-date"
import { formatEmployeeNames } from "@/lib/employees"
import { SOLICITACAO_TIPOS } from "@/lib/field-options"
import { formatOsNumber, getDisplayStatus } from "@/lib/status"
import { cn } from "@/lib/utils"
import { useApp, useLookups } from "@/store/app-store"
import type { ServiceOrder, ServiceRequest, SolicitacaoStatus } from "@/types"

type Message =
  | { id: string; kind: "solicitacao"; date: string; time: string; request: ServiceRequest }
  | { id: string; kind: "alerta"; date: string; time: string; order: ServiceOrder }

type Filter = "todas" | "nao_lidas" | "solicitacao" | "alerta"

const filters: { id: Filter; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "nao_lidas", label: "Não lidas" },
  { id: "solicitacao", label: "Solicitações" },
  { id: "alerta", label: "Alertas" },
]

const requestStatusLabels: Record<SolicitacaoStatus, string> = {
  pendente: "Pendente",
  em_analise: "Em análise",
  aprovada: "Aprovada",
  recusada: "Recusada",
  convertida: "Convertida em OS",
}

function alertReason(order: ServiceOrder) {
  const display = getDisplayStatus(order)
  if (order.priority === "urgente" && display !== "concluida") return "Prioridade urgente"
  if (order.status === "agendada" && display === "atrasada" && order.date === DEMO_TODAY) {
    return "Horário iniciado e atendimento ainda não iniciado"
  }
  if (display === "atrasada") return "Atendimento atrasado"
  return "Requer acompanhamento"
}

const formatDate = (date: string) => date.split("-").reverse().join("/")

export default function InboxPage() {
  const { serviceOrders, serviceRequests } = useApp()
  const { clientById, employeeById, locationById, serviceTypeById } = useLookups()
  const [filter, setFilter] = useState<Filter>("todas")
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set())
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const messages = useMemo<Message[]>(() => {
    const requests: Message[] = serviceRequests.map((request) => ({
      id: `sr:${request.id}`,
      kind: "solicitacao",
      date: request.createdAt,
      time: "",
      request,
    }))
    const alerts: Message[] = serviceOrders
      .filter((order) => {
        const display = getDisplayStatus(order)
        return (
          display === "atrasada" ||
          (order.priority === "urgente" && order.status !== "concluida" && order.status !== "cancelada")
        )
      })
      .map((order) => ({
        id: `os:${order.id}`,
        kind: "alerta",
        date: order.date,
        time: order.startTime,
        order,
      }))
    return [...requests, ...alerts].sort((a, b) =>
      `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`)
    )
  }, [serviceOrders, serviceRequests])

  const unreadCount = messages.filter((message) => !readIds.has(message.id)).length
  const visible = messages.filter((message) => {
    if (filter === "nao_lidas") return !readIds.has(message.id)
    if (filter === "todas") return true
    return message.kind === filter
  })
  const selected = messages.find((message) => message.id === selectedId) ?? null

  function open(message: Message) {
    setSelectedId(message.id)
    setReadIds((current) => new Set(current).add(message.id))
  }

  function titleOf(message: Message) {
    if (message.kind === "alerta") {
      return `OS ${formatOsNumber(message.order.number)} · ${clientById(message.order.clientId)?.name}`
    }
    const type = SOLICITACAO_TIPOS.find((item) => item.value === message.request.type)?.label
    return `Solicitação de ${type?.toLowerCase()} · ${clientById(message.request.clientId)?.name}`
  }

  function summaryOf(message: Message) {
    if (message.kind === "alerta") return alertReason(message.order)
    return message.request.notes || "Sem observações"
  }

  return (
    <div>
      <PageHeader
        title="Caixa de entrada"
        description={
          unreadCount
            ? `${unreadCount} ${unreadCount === 1 ? "mensagem não lida" : "mensagens não lidas"}`
            : "Tudo lido por aqui."
        }
        actions={
          unreadCount ? (
            <Button
              variant="outline"
              onClick={() => setReadIds(new Set(messages.map((message) => message.id)))}
            >
              Marcar todas como lidas
            </Button>
          ) : null
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((item) => (
          <Button
            key={item.id}
            size="sm"
            variant={filter === item.id ? "default" : "outline"}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,420px)_1fr]">
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          {visible.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">Nenhuma mensagem aqui.</p>
          ) : (
            <ul className="divide-y">
              {visible.map((message) => {
                const unread = !readIds.has(message.id)
                const Icon = message.kind === "alerta" ? AlertTriangle : Send
                return (
                  <li key={message.id}>
                    <button
                      type="button"
                      onClick={() => open(message)}
                      className={cn(
                        "flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40",
                        selectedId === message.id && "bg-muted/60"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                          message.kind === "alerta"
                            ? "bg-danger-subtle text-danger-subtle-foreground"
                            : "bg-info-subtle text-info-subtle-foreground"
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className={cn("truncate text-sm", unread && "font-semibold")}>
                            {titleOf(message)}
                          </span>
                          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                            {formatDate(message.date)}
                            {message.time ? ` ${message.time}` : ""}
                          </span>
                        </span>
                        <span className="mt-0.5 flex items-center gap-2">
                          <span className="truncate text-xs text-muted-foreground">
                            {summaryOf(message)}
                          </span>
                          {unread ? (
                            <span className="ml-auto size-2 shrink-0 rounded-full bg-primary" aria-label="Não lida" />
                          ) : null}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          {!selected ? (
            <EmptyState
              title="Selecione uma mensagem"
              description="Solicitações de serviço e alertas das ordens de serviço chegam aqui."
            />
          ) : selected.kind === "alerta" ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Badge variant="destructive">Alerta</Badge>
                  <h2 className="mt-2 text-lg font-semibold">{titleOf(selected)}</h2>
                  <p className="text-sm text-muted-foreground">{alertReason(selected.order)}</p>
                </div>
                <StatusBadge status={getDisplayStatus(selected.order)} />
              </div>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <Detail label="Serviço" value={serviceTypeById(selected.order.serviceTypeId)?.name} />
                <Detail
                  label="Agendado para"
                  value={`${formatDate(selected.order.date)} às ${selected.order.startTime}`}
                />
                <Detail
                  label="Responsáveis"
                  value={formatEmployeeNames(selected.order.employeeIds, employeeById)}
                />
                <Detail label="Cliente" value={clientById(selected.order.clientId)?.name} />
              </dl>
              <Button nativeButton={false} render={<Link href={`/ordens/${selected.order.id}`} />}>Abrir OS</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Badge variant="secondary">Solicitação de serviço</Badge>
                  <h2 className="mt-2 text-lg font-semibold">{titleOf(selected)}</h2>
                  <p className="text-sm text-muted-foreground">
                    Recebida em {formatDate(selected.request.createdAt)}
                  </p>
                </div>
                <Badge variant="outline">{requestStatusLabels[selected.request.status]}</Badge>
              </div>
              <p className="rounded-lg bg-muted/40 p-3 text-sm">
                {selected.request.notes || "Sem observações."}
              </p>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <Detail
                  label="Local"
                  icon={MapPin}
                  value={
                    selected.request.locationId
                      ? locationById(selected.request.locationId)?.name
                      : clientById(selected.request.clientId)?.address
                  }
                />
                <Detail label="Contato" icon={User} value={selected.request.contactName} />
                <Detail label="Telefone" icon={Phone} value={selected.request.phone} />
              </dl>
              <Button variant="outline" nativeButton={false} render={<Link href="/ordens" />}>
                <ClipboardList data-icon="inline-start" />
                Ir para Ordens de serviço
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Detail({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value?: string
  icon?: typeof MapPin
}) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-xs text-muted-foreground">
        {Icon ? <Icon className="size-3" /> : null}
        {label}
      </dt>
      <dd className="mt-0.5 font-medium">{value || "—"}</dd>
    </div>
  )
}
