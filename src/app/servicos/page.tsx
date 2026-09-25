"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmptyState } from "@/components/page-header"
import { PageHeader } from "@/components/page-header"
import { ServiceRequestDialog } from "@/components/service-request-dialog"
import { SOLICITACAO_TIPOS } from "@/lib/field-options"
import { useApp, useLookups } from "@/store/app-store"
import type { SolicitacaoStatus } from "@/types"

const statusLabels: Record<SolicitacaoStatus, string> = {
  pendente: "Pendente",
  em_analise: "Em análise",
  aprovada: "Aprovada",
  recusada: "Recusada",
  convertida: "Convertida em OS",
}

const statusVariants: Record<SolicitacaoStatus, "secondary" | "default" | "destructive" | "outline"> = {
  pendente: "outline",
  em_analise: "secondary",
  aprovada: "default",
  recusada: "destructive",
  convertida: "default",
}

export default function ServicosPage() {
  const { serviceRequests } = useApp()
  const { clientById, locationById } = useLookups()
  const [open, setOpen] = useState(false)

  return (
    <div>
      <PageHeader
        title="Serviços"
        description="Solicitações de instalação, manutenção, inspeção, conversão e reparo."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus data-icon="inline-start" />
            Solicitar Serviço
          </Button>
        }
      />

      {serviceRequests.length === 0 ? (
        <EmptyState
          title="Nenhuma solicitação registrada"
          description="Solicitações de serviço aparecerão aqui assim que forem criadas."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceRequests.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">#{item.number}</TableCell>
                  <TableCell>
                    {SOLICITACAO_TIPOS.find((option) => option.value === item.type)?.label}
                  </TableCell>
                  <TableCell>{clientById(item.clientId)?.name ?? "—"}</TableCell>
                  <TableCell>{item.locationId ? locationById(item.locationId)?.name ?? "—" : "—"}</TableCell>
                  <TableCell>
                    <p>{item.contactName}</p>
                    <p className="text-xs text-muted-foreground">{item.phone}</p>
                  </TableCell>
                  <TableCell>{item.createdAt.split("-").reverse().join("/")}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[item.status]}>
                      {statusLabels[item.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ServiceRequestDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}
