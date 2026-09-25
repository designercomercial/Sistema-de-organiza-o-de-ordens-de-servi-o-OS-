"use client"

import { useMemo, useState } from "react"
import { CalendarDays, List, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader, EmptyState } from "@/components/page-header"
import { SearchInput } from "@/components/search-input"
import { ServiceOrderCalendar } from "@/components/service-order-calendar"
import { ServiceOrderTable } from "@/components/service-order-table"
import { DEMO_TODAY } from "@/lib/demo-date"
import { formatOsNumber, getDisplayStatus } from "@/lib/status"
import { cn } from "@/lib/utils"
import { useApp, useLookups } from "@/store/app-store"
import type { ServiceOrderStatus } from "@/types"

const quickFilters: { id: "todas" | "hoje" | ServiceOrderStatus; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "hoje", label: "Hoje" },
  { id: "agendada", label: "Agendadas" },
  { id: "em_andamento", label: "Em andamento" },
  { id: "concluida", label: "Concluídas" },
  { id: "atrasada", label: "Atrasadas" },
]

export default function OrdersPage() {
  const { serviceOrders, setNewOsOpen, employees, clients, serviceTypes } = useApp()
  const { clientById, employeeById, serviceTypeById } = useLookups()
  const [mode, setMode] = useState<"lista" | "agendamentos">("lista")
  const [query, setQuery] = useState("")
  const [quick, setQuick] = useState<(typeof quickFilters)[number]["id"]>("todas")
  const [employeeId, setEmployeeId] = useState("")
  const [clientId, setClientId] = useState("")
  const [serviceTypeId, setServiceTypeId] = useState("")
  const [priority, setPriority] = useState("")
  const [date, setDate] = useState("")

  const filtered = useMemo(() => {
    return serviceOrders
      .filter((order) => {
        const display = getDisplayStatus(order)
        if (quick === "hoje" && order.date !== DEMO_TODAY) return false
        if (quick !== "todas" && quick !== "hoje" && display !== quick) return false
        if (employeeId && !order.employeeIds.includes(employeeId)) return false
        if (clientId && order.clientId !== clientId) return false
        if (serviceTypeId && order.serviceTypeId !== serviceTypeId) return false
        if (priority && order.priority !== priority) return false
        if (date && order.date !== date) return false
        const term = query.toLowerCase().trim()
        if (!term) return true
        const haystack = [
          formatOsNumber(order.number),
          String(order.number),
          clientById(order.clientId)?.name,
          ...order.employeeIds.map((id) => employeeById(id)?.name),
          serviceTypeById(order.serviceTypeId)?.name,
        ]
          .join(" ")
          .toLowerCase()
        return haystack.includes(term)
      })
      .sort((a, b) => b.number - a.number)
  }, [
    clientById,
    clientId,
    date,
    employeeById,
    employeeId,
    priority,
    query,
    quick,
    serviceOrders,
    serviceTypeById,
    serviceTypeId,
  ])

  return (
    <div>
      <PageHeader
        title="Ordens de Serviço"
        description="Acompanhe e gerencie todos os atendimentos da equipe."
        actions={
          <Button onClick={() => setNewOsOpen(true)}>
            <Plus data-icon="inline-start" />
            Nova ordem de serviço
          </Button>
        }
      />
      <div
        role="radiogroup"
        aria-label="Visualização"
        className="relative mb-4 inline-grid grid-cols-2 rounded-full border bg-muted p-0.5"
      >
        <span
          aria-hidden
          className={cn(
            "absolute top-0.5 bottom-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-primary shadow-sm transition-transform duration-200",
            mode === "agendamentos" && "translate-x-full"
          )}
        />
        {(
          [
            ["lista", "Lista de OS", List],
            ["agendamentos", "Agendamentos", CalendarDays],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={mode === id}
            aria-label={label}
            title={label}
            onClick={() => setMode(id)}
            className={cn(
              "relative z-10 flex h-8 w-11 items-center justify-center rounded-full transition-colors",
              mode === id ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
          </button>
        ))}
      </div>
      {mode === "agendamentos" ? (
        <ServiceOrderCalendar />
      ) : (
        <>
          <div className="mb-4 space-y-3">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Buscar por cliente, técnico ou número da OS"
              className="max-w-xl"
            />
            <div className="flex flex-wrap gap-2">
              {quickFilters.map((filter) => (
                <Button
                  key={filter.id}
                  size="sm"
                  variant={quick === filter.id ? "default" : "outline"}
                  onClick={() => setQuick(filter.id)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <FilterSelect
                value={employeeId}
                onChange={setEmployeeId}
                label="Responsáveis"
                options={employees.map((item) => ({ id: item.id, label: item.name }))}
              />
              <FilterSelect
                value={clientId}
                onChange={setClientId}
                label="Cliente"
                options={clients.map((item) => ({ id: item.id, label: item.name }))}
              />
              <FilterSelect
                value={serviceTypeId}
                onChange={setServiceTypeId}
                label="Tipo de Serviço"
                options={serviceTypes.map((item) => ({ id: item.id, label: item.name }))}
              />
              <FilterSelect
                value={priority}
                onChange={setPriority}
                label="Prioridade"
                options={[
                  { id: "baixa", label: "Baixa" },
                  { id: "normal", label: "Normal" },
                  { id: "alta", label: "Alta" },
                  { id: "urgente", label: "Urgente" },
                ]}
              />
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="h-8 rounded-lg border border-input bg-background px-2 text-sm"
              />
            </div>
          </div>
          {filtered.length === 0 ? (
            <EmptyState title="Nenhuma OS encontrada" description="Ajuste os filtros ou crie uma nova OS." />
          ) : (
            <ServiceOrderTable orders={filtered} />
          )}
        </>
      )}
    </div>
  )
}

function FilterSelect({
  value,
  onChange,
  label,
  options,
}: {
  value: string
  onChange: (value: string) => void
  label: string
  options: { id: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-8 rounded-lg border border-input bg-background px-2 text-sm"
    >
      <option value="">{label}</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
