"use client"

import { use } from "react"
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { DEMO_TODAY } from "@/lib/demo-date"
import { useApp } from "@/store/app-store"
import type { Question, QuestionType } from "@/types"

const types: { id: QuestionType; label: string }[] = [
  { id: "sim_nao", label: "Sim / Não" },
  { id: "texto_curto", label: "Texto curto" },
  { id: "texto_longo", label: "Texto longo" },
  { id: "numero", label: "Número" },
  { id: "selecao", label: "Seleção" },
  { id: "data", label: "Data" },
]

export default function QuestionnaireEditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { questionnaires, serviceTypes, updateQuestionnaire } = useApp()
  const item = questionnaires.find((entry) => entry.id === id)
  if (!item) return <p>Questionário não encontrado.</p>
  const current = item

  function update(partial: Partial<typeof current>) {
    updateQuestionnaire({ ...current, ...partial, updatedAt: DEMO_TODAY })
  }

  function updateQuestion(questionId: string, partial: Partial<Question>) {
    update({
      questions: current.questions.map((question) =>
        question.id === questionId ? { ...question, ...partial } : question
      ),
    })
  }

  function move(index: number, direction: -1 | 1) {
    const next = [...current.questions]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    const [removed] = next.splice(index, 1)
    next.splice(target, 0, removed)
    update({ questions: next })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Editor de questionário</h1>
        <p className="text-sm text-muted-foreground">Construtor simples. Só o necessário para o campo.</p>
      </div>
      <div className="space-y-1.5">
        <Label>Nome</Label>
        <Input value={item.name} onChange={(event) => update({ name: event.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label>Tipo de Serviço</Label>
        <select
          className="h-9 w-full rounded-lg border px-2 text-sm"
          value={item.serviceTypeId}
          onChange={(event) => update({ serviceTypeId: event.target.value })}
        >
          {serviceTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-3">
        {item.questions.map((question, index) => (
          <div key={question.id} className="rounded-xl border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Pergunta {String(index + 1).padStart(2, "0")}</p>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon-sm" onClick={() => move(index, -1)} aria-label="Subir">
                  <ArrowUp />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => move(index, 1)} aria-label="Descer">
                  <ArrowDown />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() =>
                    update({
                      questions: item.questions.filter((entry) => entry.id !== question.id),
                    })
                  }
                  aria-label="Excluir pergunta"
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
            <Input
              value={question.title}
              onChange={(event) => updateQuestion(question.id, { title: event.target.value })}
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <select
                className="h-8 rounded-lg border px-2 text-sm"
                value={question.type}
                onChange={(event) =>
                  updateQuestion(question.id, { type: event.target.value as QuestionType })
                }
              >
                {types.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={question.required}
                  onCheckedChange={(required) => updateQuestion(question.id, { required })}
                />
                Obrigatório
              </label>
            </div>
            {question.type === "selecao" ? (
              <Input
                className="mt-3"
                value={(question.options ?? []).join(", ")}
                placeholder="Opções separadas por vírgula"
                onChange={(event) =>
                  updateQuestion(question.id, {
                    options: event.target.value.split(",").map((entry) => entry.trim()).filter(Boolean),
                  })
                }
              />
            ) : null}
          </div>
        ))}
      </div>
      <Button
        variant="outline"
        onClick={() =>
          update({
            questions: [
              ...item.questions,
              {
                id: `qitem-${Date.now()}`,
                title: "Nova pergunta",
                type: "sim_nao",
                required: true,
              },
            ],
          })
        }
      >
        <Plus data-icon="inline-start" />
        Adicionar pergunta
      </Button>
    </div>
  )
}
