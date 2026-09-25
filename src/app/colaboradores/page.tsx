"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageHeader } from "@/components/page-header"
import { SearchInput } from "@/components/search-input"
import { EmployeeStatusBadge } from "@/components/status-badge"
import { useApp } from "@/store/app-store"
import type { EmployeeStatus } from "@/types"

export default function EmployeesPage() {
  const router = useRouter()
  const { employees, addEmployee } = useApp()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: "",
    role: "",
    phone: "",
    email: "",
    status: "disponivel" as EmployeeStatus,
  })
  const filtered = employees.filter((item) =>
    `${item.name} ${item.role}`.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div>
      <PageHeader
        title="Colaboradores"
        description="Quem executa os atendimentos em campo."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus data-icon="inline-start" />
            Cadastrar colaborador
          </Button>
        }
      />
      <SearchInput
        className="mb-4 max-w-md"
        value={query}
        onChange={setQuery}
        placeholder="Buscar colaborador"
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {filtered.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => router.push(`/colaboradores/${item.id}`)}
            className="rounded-xl border bg-card p-4 text-left shadow-sm hover:border-primary/40"
          >
            <div className="mb-3 flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{item.initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.role}</p>
              </div>
            </div>
            <p className="mb-3 text-sm text-muted-foreground">{item.phone}</p>
            <EmployeeStatusBadge status={item.status} />
          </button>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cadastrar colaborador</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Função</Label>
              <Input value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Telefone</Label>
              <Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
            </div>
            <Button
              onClick={() => {
                if (!form.name) return
                addEmployee(form)
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
