"use client"

import { useMemo, useState } from "react"
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
import { PageHeader, EmptyState } from "@/components/page-header"
import { SearchInput } from "@/components/search-input"
import { useApp, useLookups } from "@/store/app-store"

export default function LocationsPage() {
  const { locations, clients, addLocation } = useApp()
  const { clientById } = useLookups()
  const [query, setQuery] = useState("")
  const [clientId, setClientId] = useState("")
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: "",
    clientId: clients[0]?.id ?? "",
    address: "",
    city: "Manaus",
    state: "AM",
  })

  const filtered = useMemo(
    () =>
      locations.filter((item) => {
        if (clientId && item.clientId !== clientId) return false
        const haystack = `${item.name} ${item.address} ${clientById(item.clientId)?.name}`.toLowerCase()
        return haystack.includes(query.toLowerCase())
      }),
    [clientById, clientId, locations, query]
  )

  return (
    <div>
      <PageHeader
        title="Locais"
        description="Locais de atendimento vinculados aos clientes."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus data-icon="inline-start" />
            Cadastrar local
          </Button>
        }
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <SearchInput
          className="max-w-md"
          value={query}
          onChange={setQuery}
          placeholder="Buscar local"
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
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="Nenhum local" description="Cadastre o primeiro local de atendimento." />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Local</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Cidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{clientById(item.clientId)?.name}</TableCell>
                  <TableCell>{item.address}</TableCell>
                  <TableCell>
                    {item.city} - {item.state}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cadastrar local</DialogTitle>
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
              <Label>Endereço</Label>
              <Input
                value={form.address}
                onChange={(event) => setForm({ ...form, address: event.target.value })}
              />
            </div>
            <Button
              onClick={() => {
                if (!form.name || !form.clientId) return
                addLocation(form)
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
