"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { formatEmployeeNames } from "@/lib/employees"
import { addHoursToTime, DEMO_TODAY } from "@/lib/demo-date"
import { getDisplayStatus } from "@/lib/status"
import { cn } from "@/lib/utils"
import { useApp, useLookups } from "@/store/app-store"

type View = "mes" | "semana" | "lista" | "timeline"

const hours = Array.from({ length: 11 }, (_, index) => 7 + index)

export function ServiceOrderCalendar() {
  const router = useRouter()
  const { serviceOrders, employees } = useApp()
  const { clientById, employeeById, equipmentById, serviceTypeById } = useLookups()
  const [cursor, setCursor] = useState(new Date(`${DEMO_TODAY}T12:00:00`))
  const [view, setView] = useState<View>("mes")

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 0 })
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 0 })
    return eachDayOfInterval({ start, end })
  }, [cursor])

  const weekDays = useMemo(() => {
    const start = startOfWeek(cursor, { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end: addDays(start, 6) })
  }, [cursor])

  const ordersOn = (day: Date) =>
    serviceOrders.filter((order) => isSameDay(new Date(`${order.date}T12:00:00`), day))

  const title =
    view === "semana"
      ? `${format(weekDays[0], "d MMM", { locale: ptBR })} — ${format(weekDays[6], "d MMM yyyy", { locale: ptBR })}`
      : format(cursor, "MMMM yyyy", { locale: ptBR })

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Período anterior"
            onClick={() =>
              setCursor((current) => addDays(current, view === "mes" ? -30 : -7))
            }
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCursor(new Date(`${DEMO_TODAY}T12:00:00`))}
          >
            Hoje
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Próximo período"
            onClick={() =>
              setCursor((current) => addDays(current, view === "mes" ? 30 : 7))
            }
          >
            <ChevronRight />
          </Button>
          <p className="ml-2 capitalize">{title}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["mes", "Mês"],
              ["semana", "Semana"],
              ["lista", "Lista"],
              ["timeline", "Linha do Tempo"],
            ] as const
          ).map(([id, label]) => (
            <Button
              key={id}
              size="sm"
              variant={view === id ? "default" : "outline"}
              onClick={() => setView(id)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {view === "mes" ? (
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="grid grid-cols-7 border-b text-center text-xs text-muted-foreground">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((label) => (
              <div key={label} className="py-2">
                {label}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthDays.map((day) => {
              const items = ordersOn(day)
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "min-h-[118px] border-r border-b p-1.5",
                    !isSameMonth(day, cursor) && "bg-muted/30 text-muted-foreground"
                  )}
                >
                  <p className="mb-1 text-xs font-medium">{format(day, "d")}</p>
                  <div className="space-y-1">
                    {items.slice(0, 3).map((order) => (
                      <button
                        key={order.id}
                        type="button"
                        onClick={() => router.push(`/ordens/${order.id}`)}
                        className={cn(
                          "w-full truncate rounded-md px-1.5 py-1 text-left text-[11px]",
                          statusTone(getDisplayStatus(order))
                        )}
                      >
                        {order.startTime} {clientById(order.clientId)?.name.split(" ")[0]} ·{" "}
                        {formatEmployeeNames(order.employeeIds, employeeById, { firstName: true })}
                      </button>
                    ))}
                    {items.length > 3 ? (
                      <p className="text-[11px] text-muted-foreground">+{items.length - 3}</p>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}

      {view === "semana" ? (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <div className="grid min-w-[900px] grid-cols-7">
            {weekDays.map((day) => (
              <div key={day.toISOString()} className="border-r p-3 last:border-r-0">
                <p className="mb-3 text-sm font-medium capitalize">
                  {format(day, "EEEE d", { locale: ptBR })}
                </p>
                <div className="space-y-2">
                  {ordersOn(day).map((order) => (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => router.push(`/ordens/${order.id}`)}
                      className="w-full rounded-lg border p-2 text-left"
                    >
                      <p className="text-xs font-semibold">{order.startTime}</p>
                      <p className="text-sm">{clientById(order.clientId)?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatEmployeeNames(order.employeeIds, employeeById)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {view === "lista" ? (
        <div className="space-y-6">
          {weekDays.map((day) => {
            const items = ordersOn(day)
            if (items.length === 0) return null
            const isToday = format(day, "yyyy-MM-dd") === DEMO_TODAY
            return (
              <section key={day.toISOString()}>
                <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {isToday ? "Hoje · " : ""}
                  {format(day, "d 'de' MMMM", { locale: ptBR })}
                </p>
                <div className="space-y-2">
                  {items
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((order) => (
                      <button
                        key={order.id}
                        type="button"
                        onClick={() => router.push(`/ordens/${order.id}`)}
                        className="grid w-full gap-2 rounded-xl border bg-card p-4 text-left sm:grid-cols-[72px_1fr_auto]"
                      >
                        <p className="font-semibold">{order.startTime}</p>
                        <div>
                          <p className="font-medium">{clientById(order.clientId)?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {serviceTypeById(order.serviceTypeId)?.name} ·{" "}
                            {formatEmployeeNames(order.employeeIds, employeeById)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.equipmentIds.map((id) => equipmentById(id)?.name).join(", ")}
                          </p>
                        </div>
                        <StatusBadge status={getDisplayStatus(order)} />
                      </button>
                    ))}
                </div>
              </section>
            )
          })}
        </div>
      ) : null}

      {view === "timeline" ? (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <div className="min-w-[1100px]">
            <div
              className="grid border-b"
              style={{ gridTemplateColumns: "180px repeat(11, 1fr)" }}
            >
              <div className="p-3 text-xs text-muted-foreground">Colaborador</div>
              {hours.map((hour) => (
                <div key={hour} className="border-l p-3 text-xs text-muted-foreground">
                  {String(hour).padStart(2, "0")}h
                </div>
              ))}
            </div>
            {employees.map((employee) => {
              const items = serviceOrders.filter(
                (order) =>
                  order.employeeIds.includes(employee.id) &&
                  order.date === format(cursor, "yyyy-MM-dd")
              )
              return (
                <div
                  key={employee.id}
                  className="grid min-h-[72px] border-b last:border-b-0"
                  style={{ gridTemplateColumns: "180px repeat(11, 1fr)" }}
                >
                  <div className="p-3">
                    <p className="text-sm font-medium">{employee.name}</p>
                    <p className="text-xs text-muted-foreground">{employee.role}</p>
                  </div>
                  <div className="relative col-span-11">
                    <div className="absolute inset-0 grid grid-cols-11">
                      {hours.map((hour) => (
                        <div key={hour} className="border-l" />
                      ))}
                    </div>
                    {items.map((order) => {
                      const start = timeToHour(order.startTime)
                      const duration = order.durationHours ?? 2
                      const left = ((start - 7) / 11) * 100
                      const width = (duration / 11) * 100
                      return (
                        <button
                          key={order.id}
                          type="button"
                          onClick={() => router.push(`/ordens/${order.id}`)}
                          className={cn(
                            "absolute top-3 overflow-hidden rounded-md px-2 py-1 text-left text-[11px]",
                            statusTone(getDisplayStatus(order))
                          )}
                          style={{ left: `${left}%`, width: `${Math.max(width, 8)}%` }}
                        >
                          <p className="truncate font-medium">
                            {order.startTime} — {addHoursToTime(order.startTime, duration)}
                          </p>
                          <p className="truncate">{clientById(order.clientId)?.name}</p>
                          <p className="truncate text-muted-foreground">
                            {serviceTypeById(order.serviceTypeId)?.name}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}

    </div>
  )
}

function timeToHour(time: string) {
  const [h, m] = time.split(":").map(Number)
  return h + m / 60
}

function statusTone(status: ReturnType<typeof getDisplayStatus>) {
  if (status === "em_andamento") return "bg-brand-50 text-brand-700"
  if (status === "atrasada") return "bg-danger-subtle text-danger-subtle-foreground"
  if (status === "concluida") return "bg-success-subtle text-success-subtle-foreground"
  if (status === "cancelada") return "bg-muted text-muted-foreground"
  return "bg-info-subtle text-info-subtle-foreground"
}
