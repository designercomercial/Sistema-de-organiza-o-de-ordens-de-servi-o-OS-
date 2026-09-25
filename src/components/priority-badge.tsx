import { Badge } from "@/components/ui/badge"
import { priorityLabels } from "@/lib/status"
import { cn } from "@/lib/utils"
import type { Priority } from "@/types"

const styles: Record<Priority, string> = {
  baixa: "border-transparent bg-muted text-muted-foreground",
  normal: "border-transparent bg-muted text-foreground",
  alta: "border-transparent bg-warning-subtle text-warning-subtle-foreground",
  urgente: "border-transparent bg-danger-subtle text-danger-subtle-foreground",
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Badge variant="outline" className={cn("font-medium", styles[priority])}>
      {priorityLabels[priority]}
    </Badge>
  )
}
