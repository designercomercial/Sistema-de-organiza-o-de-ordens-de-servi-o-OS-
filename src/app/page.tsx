"use client"

import { useMemo, useState, type ReactNode } from "react"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import type { DateRange } from "react-day-picker"
import { ptBR } from "date-fns/locale"
import {
  ArrowDownUp,
  ArrowRight,
  BellRing,
  Building2,
  CalendarDays,
  ChevronDown,
  CircleCheck,
  Download,
  LayoutGrid,
  ListFilter,
  MailOpen,
  Search,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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

type Row = {
  message: Message
  category: string
  channel: string
  client: string
  clientDetail: string
  location: string
  contact: string
  text: string
}

const PAGE_SIZE = 10

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
const weekday = (date: string) =>
  format(parseISO(date), "EEE", { locale: ptBR }).slice(0, 3).toUpperCase()

export default function InboxPage() {
  const { serviceOrders, serviceRequests, clients } = useApp()
  const { clientById, employeeById, locationById, serviceTypeById } = useLookups()
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("")
  const [clientId, setClientId] = useState("")
  const [readFilter, setReadFilter] = useState("")
  const [range, setRange] = useState<DateRange | undefined>()
  const [newestFirst, setNewestFirst] = useState(true)
  const [page, setPage] = useState(1)
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set())
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const rows = useMemo<Row[]>(() => {
    const messages: Message[] = [
      ...serviceRequests.map((request) => ({
        id: `sr:${request.id}`,
        kind: "solicitacao" as const,
        date: request.createdAt,
        time: request.createdTime ?? "00:00",
        request,
      })),
      ...serviceOrders
        .filter((order) => {
          const display = getDisplayStatus(order)
          return (
            display === "atrasada" ||
            (order.priority === "urgente" &&
              order.status !== "concluida" &&
              order.status !== "cancelada")
          )
        })
        .map((order) => ({
          id: `os:${order.id}`,
          kind: "alerta" as const,
          date: order.date,
          time: order.startTime,
          order,
        })),
    ]
    return messages.map((message) => {
      if (message.kind === "alerta") {
        const { order } = message
        const client = clientById(order.clientId)
        return {
          message,
          category: "Alerta",
          channel: `OS ${formatOsNumber(order.number)}`,
          client: client?.name ?? "—",
          clientDetail: serviceTypeById(order.serviceTypeId)?.name ?? "",
          location: order.useRegisteredAddress ? (client?.address ?? "") : (order.customAddress ?? ""),
          contact: formatEmployeeNames(order.employeeIds, employeeById),
          text: alertReason(order),
        }
      }
      const { request } = message
      const client = clientById(request.clientId)
      return {
        message,
        category: "Solicitação",
        channel: SOLICITACAO_TIPOS.find((item) => item.value === request.type)?.label ?? "",
        client: client?.name ?? "—",
        clientDetail: requestStatusLabels[request.status],
        location: request.locationId ? (locationById(request.locationId)?.name ?? "") : "",
        contact: request.contactName,
        text: request.notes,
      }
    })
  }, [clientById, employeeById, locationById, serviceOrders, serviceRequests, serviceTypeById])

  const fromKey = range?.from ? format(range.from, "yyyy-MM-dd") : ""
  // Com só o primeiro dia escolhido, o filtro vale para aquele dia.
  const toKey = range?.to ? format(range.to, "yyyy-MM-dd") : fromKey

  const filtered = useMemo(() => {
    const term = query.toLowerCase().trim()
    return rows
      .filter(({ message, ...row }) => {
        if (category && message.kind !== category) return false
        if (fromKey && message.date < fromKey) return false
        if (toKey && message.date > toKey) return false
        const rowClientId =
          message.kind === "alerta" ? message.order.clientId : message.request.clientId
        if (clientId && rowClientId !== clientId) return false
        if (readFilter === "nao_lidas" && readIds.has(message.id)) return false
        if (readFilter === "lidas" && !readIds.has(message.id)) return false
        if (!term) return true
        return Object.values(row).join(" ").toLowerCase().includes(term)
      })
      .sort((a, b) => {
        const order = `${a.message.date}${a.message.time}`.localeCompare(
          `${b.message.date}${b.message.time}`
        )
        return newestFirst ? -order : order
      })
  }, [category, clientId, fromKey, newestFirst, query, readFilter, readIds, rows, toKey])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const selected = rows.find((row) => row.message.id === selectedId) ?? null
  const hasFilters = Boolean(query || category || clientId || readFilter || fromKey)

  // Qualquer filtro novo volta para a primeira página.
  const withReset =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value)
      setPage(1)
    }

  function open(row: Row) {
    setSelectedId(row.message.id)
    setReadIds((current) => new Set(current).add(row.message.id))
  }

  function exportCsv() {
    const header = ["Status", "Criado", "Categoria", "Canal", "Cliente", "Localização", "Contato", "Mensagem"]
    const lines = filtered.map((row) =>
      [
        readIds.has(row.message.id) ? "Lida" : "Não lida",
        `${formatDate(row.message.date)} ${row.message.time}`,
        row.category,
        row.channel,
        row.client,
        row.location,
        row.contact,
        row.text,
      ]
        .map((cell) => `"${cell.replaceAll('"', '""')}"`)
        .join(";")
    )
    const blob = new Blob([`﻿${[header.join(";"), ...lines].join("\n")}`], {
      type: "text/csv;charset=utf-8",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `caixa-de-entrada-${DEMO_TODAY}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex flex-wrap gap-2">
        <div className="relative min-w-[220px] flex-[2]">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => withReset(setQuery)(event.target.value)}
            placeholder="Pesquisar"
            className="h-10 bg-background pl-9"
          />
        </div>
        <IconSelect
          icon={LayoutGrid}
          label="Categoria"
          value={category}
          onChange={withReset(setCategory)}
          options={[
            { id: "solicitacao", label: "Solicitação" },
            { id: "alerta", label: "Alerta" },
          ]}
        />
        <IconSelect
          icon={Building2}
          label="Cliente"
          value={clientId}
          onChange={withReset(setClientId)}
          options={clients.map((client) => ({ id: client.id, label: client.name }))}
        />
        <IconSelect
          icon={MailOpen}
          label="Leitura"
          value={readFilter}
          onChange={withReset(setReadFilter)}
          options={[
            { id: "nao_lidas", label: "Não lidas" },
            { id: "lidas", label: "Lidas" },
          ]}
        />
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger
              render={<Button variant="outline" size="sm" className="bg-muted/50 font-medium" />}
            >
              <CalendarDays data-icon="inline-start" className="text-muted-foreground" />
              {fromKey
                ? fromKey === toKey
                  ? formatDate(fromKey)
                  : `${formatDate(fromKey)} até ${formatDate(toKey)}`
                : "Selecionar data"}
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <div className="border-b px-3 py-2 text-xs text-muted-foreground">
                {!range?.from
                  ? "Escolha a data de início"
                  : !range.to
                    ? "Agora escolha a data de fim"
                    : `De ${formatDate(fromKey)} até ${formatDate(toKey)}`}
              </div>
              <Calendar
                mode="range"
                numberOfMonths={2}
                locale={ptBR}
                today={parseISO(DEMO_TODAY)}
                defaultMonth={range?.from ?? parseISO(DEMO_TODAY)}
                selected={range}
                onSelect={withReset(setRange)}
              />
              <div className="flex justify-end border-t p-2">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={!range?.from}
                  onClick={() => withReset(setRange)(undefined)}
                >
                  Limpar datas
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Limpar filtros"
            title="Limpar filtros"
            disabled={!hasFilters}
            onClick={() => {
              setQuery("")
              setCategory("")
              setClientId("")
              setReadFilter("")
              setRange(undefined)
              setPage(1)
            }}
          >
            <ListFilter />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "mensagem" : "mensagens"}
          </span>
          <Button onClick={exportCsv} disabled={filtered.length === 0}>
            <Download data-icon="inline-start" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="sticky top-0 z-10 bg-muted text-left text-xs font-semibold tracking-wide uppercase">
              <tr>
                <th className="w-20 px-4 py-3">Status</th>
                <th className="w-40 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setNewestFirst((value) => !value)}
                    title={newestFirst ? "Mais recentes primeiro" : "Mais antigas primeiro"}
                    className="inline-flex items-center gap-2 uppercase"
                  >
                    <ArrowDownUp className="size-3.5" />
                    Criado
                  </button>
                </th>
                <th className="px-4 py-3">Categoria/Canal</th>
                <th className="px-4 py-3">Cliente/Serviço</th>
                <th className="px-4 py-3">Localização</th>
                <th className="px-4 py-3">Contato</th>
                <th className="px-4 py-3">Mensagem</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    Nenhuma mensagem encontrada.
                  </td>
                </tr>
              ) : (
                pageRows.map((row) => {
                  const read = readIds.has(row.message.id)
                  return (
                    <tr
                      key={row.message.id}
                      onClick={() => open(row)}
                      className={cn(
                        "cursor-pointer transition-colors hover:bg-muted/40",
                        !read && "font-medium"
                      )}
                    >
                      <td className="px-4 py-3">
                        <span
                          title={read ? "Lida" : "Não lida"}
                          className={cn(
                            "flex size-10 items-center justify-center rounded-lg border",
                            read
                              ? "border-success-subtle-foreground/30 bg-success-subtle text-success-subtle-foreground"
                              : row.message.kind === "alerta"
                                ? "border-danger-subtle-foreground/30 bg-danger-subtle text-danger-subtle-foreground"
                                : "bg-muted text-muted-foreground"
                          )}
                        >
                          {read ? <CircleCheck className="size-5" /> : <BellRing className="size-5" />}
                        </span>
                      </td>
                      <Cell
                        title={row.message.time}
                        detail={`${formatDate(row.message.date)} ${weekday(row.message.date)}`}
                      />
                      <Cell title={row.category} detail={row.channel} />
                      <Cell title={row.client} detail={row.clientDetail} />
                      <td className="px-4 py-3 text-muted-foreground">
                        {row.location || "Localização não disponível"}
                      </td>
                      <td className="px-4 py-3">{row.contact || "—"}</td>
                      <td className="max-w-[260px] truncate px-4 py-3 font-normal text-muted-foreground">
                        {row.text}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-end gap-1 border-t bg-muted/40 px-4 py-2 text-sm">
          <span className="mr-2 text-muted-foreground">
            {filtered.length
              ? `${(currentPage - 1) * PAGE_SIZE + 1}-${Math.min(currentPage * PAGE_SIZE, filtered.length)} de ${filtered.length}`
              : "0 de 0"}
          </span>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
            <Button
              key={number}
              size="icon-sm"
              variant={number === currentPage ? "secondary" : "ghost"}
              onClick={() => setPage(number)}
            >
              {number}
            </Button>
          ))}
          <Button
            size="sm"
            variant="ghost"
            disabled={currentPage >= pageCount}
            onClick={() => setPage(currentPage + 1)}
          >
            Próximo
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(next) => !next && setSelectedId(null)}>
        <DialogContent className="sm:max-w-lg">
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  {selected.category} · {selected.channel}
                </DialogTitle>
              </DialogHeader>
              <p className="rounded-lg bg-muted/40 p-3 text-sm">{selected.text || "Sem observações."}</p>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <Detail label="Criado">
                  {formatDate(selected.message.date)} às {selected.message.time}
                </Detail>
                <Detail label="Cliente">{selected.client}</Detail>
                <Detail label="Localização">{selected.location || "Localização não disponível"}</Detail>
                <Detail label={selected.message.kind === "alerta" ? "Responsáveis" : "Contato"}>
                  {selected.contact || "—"}
                </Detail>
                {selected.message.kind === "solicitacao" ? (
                  <>
                    <Detail label="Telefone">{selected.message.request.phone || "—"}</Detail>
                    <Detail label="Situação">{selected.clientDetail}</Detail>
                  </>
                ) : (
                  <>
                    <Detail label="Serviço">{selected.clientDetail}</Detail>
                    <Detail label="Status da OS">
                      <StatusBadge status={getDisplayStatus(selected.message.order)} />
                    </Detail>
                  </>
                )}
              </dl>
              {selected.message.kind === "alerta" ? (
                <Button
                  nativeButton={false}
                  render={<Link href={`/ordens/${selected.message.order.id}`} />}
                  className="justify-self-start"
                >
                  Abrir OS
                </Button>
              ) : null}
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Cell({ title, detail }: { title: string; detail: string }) {
  return (
    <td className="px-4 py-3">
      <p className="tabular-nums">{title}</p>
      {detail ? <p className="text-xs font-normal text-muted-foreground">{detail}</p> : null}
    </td>
  )
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{children}</dd>
    </div>
  )
}

function IconSelect({
  icon: Icon,
  label,
  value,
  onChange,
  options,
}: {
  icon: LucideIcon
  label: string
  value: string
  onChange: (value: string) => void
  options: { id: string; label: string }[]
}) {
  return (
    <div className="relative min-w-[180px] flex-1">
      <Icon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full appearance-none rounded-lg border border-input bg-background pr-9 pl-9 text-sm"
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}
