"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PageHeader } from "@/components/page-header"
import { SearchInput } from "@/components/search-input"
import { EquipmentStatusBadge } from "@/components/status-badge"
import { useApp, useLookups } from "@/store/app-store"
import type { EquipmentStatus } from "@/types"

export default function EquipmentPage() {
  const router = useRouter()
  const { equipment, clients, addEquipment } = useApp()
  const { clientById } = useLookups()
  const [query, setQuery] = useState("")
  const [clientId, setClientId] = useState("")
  const [status, setStatus] = useState("")
  const [type, setType] = useState("")
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: "",
    clientId: clients[0]?.id ?? "",
    assetTag: "",
    model: "",
    serialNumber: "",
    power: "",
    type: "Gerador",
    status: "ativo" as EquipmentStatus,
  })

  const types = Array.from(new Set(equipment.map((item) => item.type)))
  const filtered = useMemo(
    () =>
      equipment.filter((item) => {
        if (clientId && item.clientId !== clientId) return false
        if (status && item.status !== status) return false
        if (type && item.type !== type) return false
        const haystack = `${item.name} ${item.assetTag} ${item.serialNumber} ${clientById(item.clientId)?.name}`.toLowerCase()
        return haystack.includes(query.toLowerCase())
      }),
    [clientById, clientId, equipment, query, status, type]
  )

  return (
    <div>
      <PageHeader
        title="Equipamentos"
        description="Equipamentos instalados ou vinculados aos clientes."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus data-icon="inline-start" />
            Cadastrar equipamento
          </Button>
        }
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <SearchInput
          className="max-w-md"
          value={query}
          onChange={setQuery}
          placeholder="Buscar equipamento"
        />
        <select
          className="h-9 rounded-lg border px-2 text-sm"
          value={clientId}
          onChange={(event) => setClientId(event.target.value)}
        >
          <option value="">Cliente</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
        <select
          className="h-9 rounded-lg border px-2 text-sm"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="">Status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
          <option value="em_manutencao">Em manutenção</option>
        </select>
        <select
          className="h-9 rounded-lg border px-2 text-sm"
          value={type}
          onChange={(event) => setType(event.target.value)}
        >
          <option value="">Tipo</option>
          {types.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipamento</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Patrimônio</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Número de Série</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => (
              <TableRow
                key={item.id}
                className="cursor-pointer"
                onClick={() => router.push(`/equipamentos/${item.id}`)}
              >
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{clientById(item.clientId)?.name}</TableCell>
                <TableCell>{item.assetTag}</TableCell>
                <TableCell>{item.model}</TableCell>
                <TableCell>{item.serialNumber}</TableCell>
                <TableCell>
                  <EquipmentStatusBadge status={item.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cadastrar equipamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Cliente</Label>
              <select
                className="h-9 w-full rounded-lg border px-2 text-sm"
                value={form.clientId}
                onChange={(event) => setForm({ ...form, clientId: event.target.value })}
              >
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Patrimônio</Label>
              <Input
                value={form.assetTag}
                onChange={(event) => setForm({ ...form, assetTag: event.target.value })}
              />
            </div>
            <Button
              onClick={() => {
                if (!form.name) return
                addEquipment(form)
                setOpen(false)
              }}
            >
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
