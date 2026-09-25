"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { PageHeader, EmptyState } from "@/components/page-header"
import { CensoPrevioDialog } from "@/components/censo-previo-dialog"
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
import { useApp, useLookups } from "@/store/app-store"

export default function ChecklistPage() {
  const { censusRecords } = useApp()
  const { employeeById } = useLookups()
  const [open, setOpen] = useState(false)

  return (
    <div>
      <PageHeader
        title="Checklist"
        description="Censo prévio realizado antes do atendimento técnico em campo."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus data-icon="inline-start" />
            Novo Censo Prévio
          </Button>
        }
      />

      {censusRecords.length === 0 ? (
        <EmptyState
          title="Nenhum censo prévio registrado"
          description="Os levantamentos realizados em campo aparecerão aqui."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Executante</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {censusRecords.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">#{item.number}</TableCell>
                  <TableCell>{item.clientName}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{employeeById(item.executorId)?.name ?? "—"}</TableCell>
                  <TableCell>{item.date.split("-").reverse().join("/")}</TableCell>
                  <TableCell>{item.responsibleName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Enviado</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CensoPrevioDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}
