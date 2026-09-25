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
import { PageHeader, EmptyState } from "@/components/page-header"
import { SearchInput } from "@/components/search-input"
import { getDisplayStatus } from "@/lib/status"
import { useApp, useLookups } from "@/store/app-store"

export default function ClientsPage() {
  const router = useRouter()
  const { clients, addClient } = useApp()
  const { equipmentForClient, ordersForClient } = useLookups()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "Manaus",
    state: "AM",
    phone: "",
    email: "",
    contact: "",
  })

  const filtered = useMemo(
    () =>
      clients.filter((client) =>
        `${client.name} ${client.city} ${client.contact}`.toLowerCase().includes(query.toLowerCase())
      ),
    [clients, query]
  )

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Gerencie os clientes e seus atendimentos."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus data-icon="inline-start" />
            Cadastrar cliente
          </Button>
        }
      />
      <SearchInput
        className="mb-4 max-w-md"
        value={query}
        onChange={setQuery}
        placeholder="Buscar cliente"
      />
      {filtered.length === 0 ? (
        <EmptyState title="Nenhum cliente" description="Cadastre o primeiro cliente da operação." />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Equipamentos</TableHead>
                <TableHead>OS abertas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((client) => {
                const openOrders = ordersForClient(client.id).filter((order) => {
                  const status = getDisplayStatus(order)
                  return status === "agendada" || status === "em_andamento" || status === "atrasada"
                }).length
                return (
                  <TableRow
                    key={client.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/clientes/${client.id}`)}
                  >
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>
                      {client.city} - {client.state}
                    </TableCell>
                    <TableCell>{client.contact}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell>{equipmentForClient(client.id).length} equipamentos</TableCell>
                    <TableCell>{openOrders} OS aberta{openOrders === 1 ? "" : "s"}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cadastrar cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Field label="Nome" value={form.name} onChange={(name) => setForm({ ...form, name })} />
            <Field label="Endereço" value={form.address} onChange={(address) => setForm({ ...form, address })} />
            <Field label="Contato" value={form.contact} onChange={(contact) => setForm({ ...form, contact })} />
            <Field label="Telefone" value={form.phone} onChange={(phone) => setForm({ ...form, phone })} />
            <Field label="E-mail" value={form.email} onChange={(email) => setForm({ ...form, email })} />
            <Button
              onClick={() => {
                if (!form.name) return
                addClient(form)
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

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  )
}
