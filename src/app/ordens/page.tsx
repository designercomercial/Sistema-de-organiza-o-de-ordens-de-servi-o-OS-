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
      <div className="mb-4 inline-flex rounded-lg border bg-muted/40 p-0.5">
        {(
          [
            ["lista", "Lista de OS", List],
            ["agendamentos", "Agendamentos", CalendarDays],
          ] as const
        ).map(([id, label, Icon]) => (
          <Button
            key={id}
            size="sm"
            variant={mode === id ? "default" : "ghost"}
            onClick={() => setMode(id)}
          >
            <Icon data-icon="inline-start" />
            {label}
          </Button>
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
