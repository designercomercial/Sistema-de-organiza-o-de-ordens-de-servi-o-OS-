"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PageHeader } from "@/components/page-header"
import { useApp } from "@/store/app-store"

export default function ServiceTypesPage() {
  const router = useRouter()
  const { serviceTypes, questionnaires, addServiceType } = useApp()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: "",
    description: "",
    questionnaireId: questionnaires[0]?.id ?? "",
    status: "ativo" as const,
  })

  return (
    <div>
      <PageHeader
        title="Tipos de Serviço"
        description="Cada tipo já nasce com o questionário certo. Sem escolher checklist à parte."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus data-icon="inline-start" />
            Cadastrar tipo de serviço
          </Button>
        }
      />
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo de Serviço</TableHead>
              <TableHead>Questionário Associado</TableHead>
              <TableHead>Quantidade de Perguntas</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {serviceTypes.map((item) => {
              const questionnaire = questionnaires.find((entry) => entry.id === item.questionnaireId)
              return (
                <TableRow
                  key={item.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/tipos-de-servico/${item.id}`)}
                >
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{questionnaire?.name}</TableCell>
                  <TableCell>{questionnaire?.questions.length ?? 0} perguntas</TableCell>
                  <TableCell>
                    <Badge variant={item.status === "ativo" ? "secondary" : "outline"}>
                      {item.status === "ativo" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cadastrar tipo de serviço</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Nome do Serviço</Label>
              <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Textarea
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Questionário associado</Label>
              <select
                className="h-9 w-full rounded-lg border px-2 text-sm"
                value={form.questionnaireId}
                onChange={(event) => setForm({ ...form, questionnaireId: event.target.value })}
              >
                {questionnaires.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={() => {
                if (!form.name) return
                addServiceType(form)
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
