"use client"

import { use } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useApp } from "@/store/app-store"

export default function ServiceTypeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { serviceTypes, questionnaires, updateServiceType } = useApp()
  const item = serviceTypes.find((entry) => entry.id === id)
  if (!item) return <p>Tipo de serviço não encontrado.</p>
  const questionnaire = questionnaires.find((entry) => entry.id === item.questionnaireId)

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-xl font-semibold">Tipo de Serviço</h1>
      <div className="space-y-1.5">
        <Label>Nome do Serviço</Label>
        <Input
          value={item.name}
          onChange={(event) => updateServiceType({ ...item, name: event.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Descrição</Label>
        <Textarea
          value={item.description}
          onChange={(event) => updateServiceType({ ...item, description: event.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Questionário associado</Label>
        <select
          className="h-9 w-full rounded-lg border px-2 text-sm"
          value={item.questionnaireId}
          onChange={(event) =>
            updateServiceType({ ...item, questionnaireId: event.target.value })
          }
        >
          {questionnaires.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.name}
            </option>
          ))}
        </select>
        {questionnaire ? (
          <p className="text-sm text-muted-foreground">
            {questionnaire.questions.length} perguntas · {questionnaire.name}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">Status</span>
        <Badge variant="secondary">{item.status === "ativo" ? "Ativo" : "Inativo"}</Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            updateServiceType({
              ...item,
              status: item.status === "ativo" ? "inativo" : "ativo",
            })
          }
        >
          Alternar
        </Button>
      </div>
    </div>
  )
}
