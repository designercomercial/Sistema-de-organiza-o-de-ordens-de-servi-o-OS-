import { Badge } from "@/components/ui/badge"
import { statusLabels } from "@/lib/status"
import { cn } from "@/lib/utils"
import type { EmployeeStatus, EquipmentStatus, ServiceOrderStatus } from "@/types"

const osStyles: Record<ServiceOrderStatus, string> = {
  agendada: "border-transparent bg-info-subtle text-info-subtle-foreground",
  em_andamento: "border-transparent bg-brand-50 text-brand-700",
  concluida: "border-transparent bg-success-subtle text-success-subtle-foreground",
  atrasada: "border-transparent bg-danger-subtle text-danger-subtle-foreground",
  cancelada: "border-transparent bg-muted text-muted-foreground",
}

const employeeLabels: Record<EmployeeStatus, string> = {
  disponivel: "Disponível",
  em_atendimento: "Em atendimento",
  indisponivel: "Indisponível",
  ativo: "Ativo",
}

const employeeStyles: Record<EmployeeStatus, string> = {
  disponivel: "border-transparent bg-success-subtle text-success-subtle-foreground",
  em_atendimento: "border-transparent bg-brand-50 text-brand-700",
  indisponivel: "border-transparent bg-muted text-muted-foreground",
  ativo: "border-transparent bg-muted text-muted-foreground",
}

const equipmentLabels: Record<EquipmentStatus, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
  em_manutencao: "Em manutenção",
}

const equipmentStyles: Record<EquipmentStatus, string> = {
  ativo: "border-transparent bg-success-subtle text-success-subtle-foreground",
  inativo: "border-transparent bg-muted text-muted-foreground",
  em_manutencao: "border-transparent bg-warning-subtle text-warning-subtle-foreground",
}

export function StatusBadge({ status }: { status: ServiceOrderStatus }) {
  return (
    <Badge variant="outline" className={cn("font-medium", osStyles[status])}>
      {statusLabels[status]}
    </Badge>
  )
}

export function EmployeeStatusBadge({ status }: { status: EmployeeStatus }) {
  return (
    <Badge variant="outline" className={cn("font-medium", employeeStyles[status])}>
      {employeeLabels[status]}
    </Badge>
  )
}

export function EquipmentStatusBadge({ status }: { status: EquipmentStatus }) {
  return (
    <Badge variant="outline" className={cn("font-medium", equipmentStyles[status])}>
      {equipmentLabels[status]}
    </Badge>
  )
}
