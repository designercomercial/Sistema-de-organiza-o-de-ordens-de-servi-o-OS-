import { DEMO_NOW_MINUTES, DEMO_TODAY, parseTimeToMinutes } from "@/lib/demo-date"
import type { Priority, ServiceOrder, ServiceOrderStatus } from "@/types"

export const statusLabels: Record<ServiceOrderStatus, string> = {
  agendada: "Agendada",
  em_andamento: "Em andamento",
  concluida: "Concluída",
  atrasada: "Atrasada",
  cancelada: "Cancelada",
}

export const priorityLabels: Record<Priority, string> = {
  baixa: "Baixa",
  normal: "Normal",
  alta: "Alta",
  urgente: "Urgente",
}

export function getDisplayStatus(order: ServiceOrder): ServiceOrderStatus {
  if (order.status === "agendada") {
    if (order.date < DEMO_TODAY) return "atrasada"
    if (order.date === DEMO_TODAY && parseTimeToMinutes(order.startTime) < DEMO_NOW_MINUTES) {
      return "atrasada"
    }
  }
  return order.status
}

export function isOpenStatus(status: ServiceOrderStatus) {
  return status === "agendada" || status === "em_andamento" || status === "atrasada"
}

export function formatOsNumber(number: number) {
  return `#${String(number).padStart(4, "0")}`
}
