"use client"

import { useState } from "react"
import { toast } from "sonner"
import { ButtonOptionGroup } from "@/components/button-option-group"
import { SearchableSelect } from "@/components/searchable-select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DEMO_TODAY } from "@/lib/demo-date"
import {
  ESTABELECIMENTOS,
  RESPONSAVEL_OPTIONS,
  TIPO_FOGAO_OPTIONS,
  UNIDADES,
  SUPERVISORES,
  toOptions,
} from "@/lib/field-options"
import { cn } from "@/lib/utils"
import { useApp } from "@/store/app-store"

const steps = ["Atendimento", "Equipamento", "Visita Técnica", "Finalização"]

const emptyForm = {
  clientName: "",
  phone: "",
  date: DEMO_TODAY,
  arrivalTime: "",
  departureTime: "",
  unit: "",
  supervisor: "",
  executorId: "",
  establishment: "",
  hasStove: null as boolean | null,
  quantity: "",
  brand: "",
  model: "",
  warranty: null as boolean | null,
  burnerCount: "",
  stoveType: "",
  problemSolved: null as boolean | null,
  complaint: "",
  diagnosis: "",
  receivedGuide: false,
  acknowledgedServices: false,
  responsibleRole: "",
  responsibleName: "",
}

export function CensoPrevioDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { employees, createCensoPrevio } = useApp()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(emptyForm)

  const canNext =
    step === 0 ? Boolean(form.clientName && form.unit && form.executorId) : true
  const canSubmit = form.receivedGuide && form.acknowledgedServices && Boolean(form.responsibleName)

  function reset() {
    setStep(0)
    setForm(emptyForm)
  }

  function close() {
    reset()
    onOpenChange(false)
  }

  function submit() {
    createCensoPrevio({
      clientName: form.clientName,
      phone: form.phone,
      date: form.date,
      arrivalTime: form.arrivalTime,
      departureTime: form.departureTime,
      unit: form.unit,
      supervisor: form.supervisor,
      executorId: form.executorId,
      establishment: form.establishment,
      equipment: {
        hasStove: Boolean(form.hasStove),
        quantity: form.quantity,
        brand: form.brand,
        model: form.model,
        warranty: Boolean(form.warranty),
        burnerCount: form.burnerCount,
        stoveType: form.stoveType,
      },
      technicalVisit: {
        problemSolved: form.problemSolved,
        complaint: form.complaint,
        diagnosis: form.diagnosis,
      },
      receivedGuide: form.receivedGuide,
      acknowledgedServices: form.acknowledgedServices,
      responsibleRole: form.responsibleRole,
      responsibleName: form.responsibleName,
    })
    toast.success("Censo prévio enviado com sucesso.")
    close()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close()
        else onOpenChange(true)
      }}
    >
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Censo Prévio</DialogTitle>
          <DialogDescription>
            Levantamento realizado antes do atendimento técnico.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-1.5">
          {steps.map((label, index) => (
            <div
              key={label}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                index <= step ? "bg-primary" : "bg-muted"
              )}
              title={label}
            />
          ))}
        </div>
        <p className="text-xs font-medium text-muted-foreground">{steps[step]}</p>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
          {step === 0 ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="cp-client">Nome do Cliente</Label>
                <Input
                  id="cp-client"
                  value={form.clientName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, clientName: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cp-phone">Telefone</Label>
                <Input
                  id="cp-phone"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, phone: event.target.value }))
                  }
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cp-date">Data</Label>
                  <Input
                    id="cp-date"
                    type="date"
                    value={form.date}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, date: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cp-arrival">Hora de Chegada</Label>
                  <Input
                    id="cp-arrival"
                    type="time"
                    value={form.arrivalTime}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, arrivalTime: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cp-departure">Hora de Saída</Label>
                  <Input
                    id="cp-departure"
                    type="time"
                    value={form.departureTime}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, departureTime: event.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Selecione Unidade</Label>
                <SearchableSelect
                  items={toOptions(UNIDADES)}
                  value={form.unit}
                  onChange={(value) => setForm((current) => ({ ...current, unit: value }))}
                  placeholder="Selecione uma opção"
                  getLabel={(item) => item.label}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Supervisor</Label>
                <SearchableSelect
                  items={toOptions(SUPERVISORES)}
                  value={form.supervisor}
                  onChange={(value) => setForm((current) => ({ ...current, supervisor: value }))}
                  placeholder="Selecione uma opção"
                  getLabel={(item) => item.label}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Executante</Label>
                <SearchableSelect
                  items={employees}
                  value={form.executorId}
                  onChange={(value) => setForm((current) => ({ ...current, executorId: value }))}
                  placeholder="Selecione uma opção"
                  getLabel={(item) => item.name}
                  getDescription={(item) => item.role}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Condomínio/Estabelecimento</Label>
                <SearchableSelect
                  items={toOptions(ESTABELECIMENTOS)}
                  value={form.establishment}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, establishment: value }))
                  }
                  placeholder="Selecione uma opção"
                  getLabel={(item) => item.label}
                />
              </div>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <div className="space-y-1.5">
                <Label>Fogão</Label>
                <ButtonOptionGroup
                  options={[
                    { value: "sim", label: "Sim" },
                    { value: "nao", label: "Não" },
                  ]}
                  value={form.hasStove === null ? "" : form.hasStove ? "sim" : "nao"}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, hasStove: value === "sim" }))
                  }
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="cp-qty">Quantidade</Label>
                  <Input
                    id="cp-qty"
                    type="number"
                    min={0}
                    value={form.quantity}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, quantity: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cp-brand">Marca</Label>
                  <Input
                    id="cp-brand"
                    value={form.brand}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, brand: event.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cp-model">Modelo</Label>
                <Input
                  id="cp-model"
                  value={form.model}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, model: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Garantia</Label>
                <ButtonOptionGroup
                  options={[
                    { value: "sim", label: "Sim" },
                    { value: "nao", label: "Não" },
                  ]}
                  value={form.warranty === null ? "" : form.warranty ? "sim" : "nao"}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, warranty: value === "sim" }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cp-burners">Número de Bocas</Label>
                <Input
                  id="cp-burners"
                  type="number"
                  min={0}
                  value={form.burnerCount}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, burnerCount: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tipo de Fogão</Label>
                <ButtonOptionGroup
                  options={TIPO_FOGAO_OPTIONS.map((option) => ({ value: option, label: option }))}
                  value={form.stoveType}
                  onChange={(value) => setForm((current) => ({ ...current, stoveType: value }))}
                />
              </div>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <div className="space-y-1.5">
                <Label>Problema Solucionado?</Label>
                <ButtonOptionGroup
                  options={[
                    { value: "sim", label: "Sim" },
                    { value: "nao", label: "Não" },
                  ]}
                  value={form.problemSolved === null ? "" : form.problemSolved ? "sim" : "nao"}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, problemSolved: value === "sim" }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cp-complaint">Queixa Relatada</Label>
                <Textarea
                  id="cp-complaint"
                  rows={3}
                  value={form.complaint}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, complaint: event.target.value }))
                  }
                />
                <div className="flex flex-wrap gap-2">
                  {["Áudio", "Foto", "Galeria", "Mais"].map((label) => (
                    <Button
                      key={label}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toast.info("Recurso disponível apenas no app de campo.")}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cp-diagnosis">Diagnóstico</Label>
                <Textarea
                  id="cp-diagnosis"
                  rows={3}
                  value={form.diagnosis}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, diagnosis: event.target.value }))
                  }
                />
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <label className="flex items-start gap-3 rounded-xl border p-4 text-sm">
                <Checkbox
                  checked={form.receivedGuide}
                  onCheckedChange={() =>
                    setForm((current) => ({ ...current, receivedGuide: !current.receivedGuide }))
                  }
                />
                Recebi o Guia do cliente com informações sobre os benefícios do Gás Natural e
                instruções de segurança na utilização do combustível.
              </label>
              <label className="flex items-start gap-3 rounded-xl border p-4 text-sm">
                <Checkbox
                  checked={form.acknowledgedServices}
                  onCheckedChange={() =>
                    setForm((current) => ({
                      ...current,
                      acknowledgedServices: !current.acknowledgedServices,
                    }))
                  }
                />
                Reconheço que os serviços acima citados foram executados, e estou ciente.
              </label>
              <div className="space-y-1.5">
                <Label>Responsável</Label>
                <ButtonOptionGroup
                  columns={1}
                  options={RESPONSAVEL_OPTIONS.map((option) => ({ value: option, label: option }))}
                  value={form.responsibleRole}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, responsibleRole: value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cp-responsible-name">Nome Completo</Label>
                <Input
                  id="cp-responsible-name"
                  value={form.responsibleName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, responsibleName: event.target.value }))
                  }
                />
              </div>
            </>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          <Button variant="outline" onClick={() => (step === 0 ? close() : setStep(step - 1))}>
            {step === 0 ? "Cancelar" : "Voltar"}
          </Button>
          {step < steps.length - 1 ? (
            <Button disabled={!canNext} onClick={() => setStep(step + 1)}>
              Próximo
            </Button>
          ) : (
            <Button disabled={!canSubmit} onClick={submit}>
              Enviar
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
