"use client"

import { useMemo, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ButtonOptionGroup } from "@/components/button-option-group"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SearchableMultiSelect, SearchableSelect } from "@/components/searchable-select"
import { PriorityBadge } from "@/components/priority-badge"
import { DEMO_TODAY } from "@/lib/demo-date"
import {
  ESTABELECIMENTOS,
  QUANTIDADE_LEITURAS_OPTIONS,
  SERVICOS_PRESTADOS_OPTIONS,
  toOptions,
} from "@/lib/field-options"
import { formatOsNumber, priorityLabels } from "@/lib/status"
import { cn } from "@/lib/utils"
import { useApp } from "@/store/app-store"
import type { ManometroTipo, Priority, RedeTipo, ResultadoTeste, ServiceOrder } from "@/types"

const steps = ["Atendimento", "Cliente", "Dados Técnicos", "Revisão"]

const priorities: Priority[] = ["baixa", "normal", "alta", "urgente"]

const emptyForm = {
  employeeIds: [] as string[],
  date: DEMO_TODAY,
  startTime: "08:00",
  durationHours: "2",
  serviceTypeId: "",
  priority: "normal" as Priority,
  description: "",
  clientId: "",
  useRegisteredAddress: true,
  customAddress: "",
  manometro: "" as ManometroTipo | "",
  quantidadeLeituras: "",
  resultadoTeste: "" as ResultadoTeste | "",
  redeEstanqueidade: "" as RedeTipo | "",
  tempoTeste: "",
  fluido: "",
  establishment: "",
  servicosPrestados: [] as string[],
}

export function NewServiceOrderDialog() {
  const router = useRouter()
  const {
    newOsOpen,
    setNewOsOpen,
    employees,
    clients,
    serviceTypes,
    questionnaires,
    createServiceOrder,
  } = useApp()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(emptyForm)
  const [created, setCreated] = useState<ServiceOrder | null>(null)

  const selectedType = serviceTypes.find((item) => item.id === form.serviceTypeId)
  const selectedQuestionnaire = questionnaires.find(
    (item) => item.id === selectedType?.questionnaireId
  )
  const selectedClient = clients.find((item) => item.id === form.clientId)
  const selectedEmployees = employees.filter((item) => form.employeeIds.includes(item.id))

  const canNext = useMemo(() => {
    if (step === 0) return Boolean(form.employeeIds.length && form.date && form.startTime && form.serviceTypeId)
    if (step === 1) return Boolean(form.clientId)
    return true
  }, [form, step])

  function reset() {
    setStep(0)
    setForm(emptyForm)
    setCreated(null)
  }

  function close() {
    setNewOsOpen(false)
    reset()
  }

  function submit() {
    const duration = form.durationHours ? Number(form.durationHours) : null
    const order = createServiceOrder({
      employeeIds: form.employeeIds,
      clientId: form.clientId,
      equipmentIds: [],
      serviceTypeId: form.serviceTypeId,
      questionnaireId: selectedType?.questionnaireId ?? "",
      date: form.date,
      startTime: form.startTime,
      durationHours: Number.isFinite(duration) ? duration : null,
      priority: form.priority,
      description: form.description,
      useRegisteredAddress: form.useRegisteredAddress,
      customAddress: form.useRegisteredAddress ? undefined : form.customAddress,
      technicalReport: {
        manometro: form.manometro,
        quantidadeLeituras: form.quantidadeLeituras,
        resultadoTeste: form.resultadoTeste,
        redeEstanqueidade: form.redeEstanqueidade,
        tempoTeste: form.tempoTeste,
        fluido: form.fluido,
        establishment: form.establishment,
        servicosPrestados: form.servicosPrestados,
      },
    })
    setCreated(order)
    toast.success("Ordem de Serviço criada com sucesso.", {
      description: `OS ${formatOsNumber(order.number)}`,
    })
  }

  return (
    <Dialog
      open={newOsOpen}
      onOpenChange={(open) => {
        if (!open) close()
        else setNewOsOpen(true)
      }}
    >
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col overflow-hidden sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {created ? "Ordem de serviço criada" : "Nova ordem de serviço"}
          </DialogTitle>
          <DialogDescription>
            {created
              ? `${formatOsNumber(created.number)} já aparece na lista e no histórico.`
              : "Quatro etapas. Sem abas extras e sem salvar no meio do caminho."}
          </DialogDescription>
        </DialogHeader>

        {created ? (
          <div className="space-y-4">
            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">OS criada</p>
              <p className="text-lg font-semibold">{formatOsNumber(created.number)}</p>
              <p className="text-sm">{selectedType?.name}</p>
              <p className="text-sm text-muted-foreground">{selectedClient?.name}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  const id = created.id
                  close()
                  router.push(`/ordens/${id}`)
                }}
              >
                Visualizar OS
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  close()
                  router.push("/ordens")
                }}
              >
                Ir para Ordens
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ol className="grid grid-cols-4 gap-2">
              {steps.map((label, index) => (
                <li key={label} className="text-center">
                  <div
                    className={cn(
                      "mx-auto mb-1 flex size-6 items-center justify-center rounded-full text-xs font-medium",
                      index === step
                        ? "bg-primary text-primary-foreground"
                        : index < step
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {index + 1}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{label}</p>
                </li>
              ))}
            </ol>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              {step === 0 ? (
                <div className="space-y-4">
                  <h3 className="font-medium">Dados do Atendimento</h3>
                  <div className="space-y-1.5">
                    <Label>Responsáveis</Label>
                    <SearchableMultiSelect
                      items={employees}
                      values={form.employeeIds}
                      onChange={(employeeIds) => setForm((current) => ({ ...current, employeeIds }))}
                      placeholder="Selecionar colaboradores"
                      getLabel={(item) => item.name}
                      getDescription={(item) => item.role}
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="os-date">Data</Label>
                      <Input
                        id="os-date"
                        type="date"
                        value={form.date}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, date: event.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="os-time">Horário inicial</Label>
                      <Input
                        id="os-time"
                        type="time"
                        value={form.startTime}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, startTime: event.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="os-duration">Duração estimada (h)</Label>
                      <Input
                        id="os-duration"
                        type="number"
                        min={0.5}
                        step={0.5}
                        placeholder="Opcional"
                        value={form.durationHours}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            durationHours: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tipo de Serviço</Label>
                    <SearchableSelect
                      items={serviceTypes}
                      value={form.serviceTypeId}
                      onChange={(serviceTypeId) =>
                        setForm((current) => ({ ...current, serviceTypeId }))
                      }
                      placeholder="Selecionar tipo"
                      getLabel={(item) => item.name}
                    />
                    {selectedQuestionnaire ? (
                      <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
                        <div>
                          <p className="text-sm font-medium">{selectedQuestionnaire.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedQuestionnaire.questions.length} perguntas
                          </p>
                        </div>
                        <Badge variant="secondary">Adicionado automaticamente</Badge>
                      </div>
                    ) : null}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Prioridade</Label>
                    <div className="flex flex-wrap gap-2">
                      {priorities.map((priority) => (
                        <button
                          key={priority}
                          type="button"
                          onClick={() => setForm((current) => ({ ...current, priority }))}
                          className={cn(
                            "rounded-full",
                            form.priority === priority && "ring-2 ring-primary/30"
                          )}
                        >
                          <PriorityBadge priority={priority} />
                          <span className="sr-only">{priorityLabels[priority]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="os-desc">Descrição do Serviço</Label>
                    <Textarea
                      id="os-desc"
                      rows={4}
                      placeholder="Realizar manutenção preventiva do fogão principal conforme plano trimestral."
                      value={form.description}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, description: event.target.value }))
                      }
                    />
                  </div>
                </div>
              ) : null}

              {step === 1 ? (
                <div className="space-y-4">
                  <h3 className="font-medium">Cliente e localização</h3>
                  <div className="space-y-1.5">
                    <Label>Cliente</Label>
                    <SearchableSelect
                      items={clients}
                      value={form.clientId}
                      onChange={(clientId) =>
                        setForm((current) => ({
                          ...current,
                          clientId,
                          useRegisteredAddress: true,
                        }))
                      }
                      placeholder="Selecionar cliente"
                      getLabel={(item) => item.name}
                      getDescription={(item) => `${item.city} - ${item.state}`}
                    />
                  </div>
                  {selectedClient ? (
                    <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
                      <div className="rounded-xl border p-4">
                        <p className="font-medium">{selectedClient.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {selectedClient.address}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedClient.city} - {selectedClient.state}
                        </p>
                        <p className="mt-3 text-sm">
                          Contato: {selectedClient.contact}
                        </p>
                        <p className="text-sm text-muted-foreground">{selectedClient.phone}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant={form.useRegisteredAddress ? "default" : "outline"}
                            onClick={() =>
                              setForm((current) => ({ ...current, useRegisteredAddress: true }))
                            }
                          >
                            Usar endereço cadastrado
                          </Button>
                          <Button
                            size="sm"
                            variant={!form.useRegisteredAddress ? "default" : "outline"}
                            onClick={() =>
                              setForm((current) => ({ ...current, useRegisteredAddress: false }))
                            }
                          >
                            Informar outro local
                          </Button>
                        </div>
                        {!form.useRegisteredAddress ? (
                          <Input
                            className="mt-3"
                            placeholder="Endereço do atendimento"
                            value={form.customAddress}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                customAddress: event.target.value,
                              }))
                            }
                          />
                        ) : null}
                      </div>
                      <MapPlaceholder />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Ao selecionar o cliente, endereço, contato e equipamentos são carregados.
                    </p>
                  )}
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-5">
                  <h3 className="font-medium">Dados Técnicos</h3>

                  <div className="space-y-1.5">
                    <Label>Manômetro</Label>
                    <ButtonOptionGroup
                      options={[
                        { value: "bourdon", label: "Bourdon" },
                        { value: "coluna_agua", label: "Coluna d'água" },
                      ]}
                      value={form.manometro}
                      onChange={(value) =>
                        setForm((current) => ({
                          ...current,
                          manometro: value as ManometroTipo,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Quantidade de Leituras</Label>
                    <SearchableSelect
                      items={toOptions(QUANTIDADE_LEITURAS_OPTIONS)}
                      value={form.quantidadeLeituras}
                      onChange={(value) =>
                        setForm((current) => ({ ...current, quantidadeLeituras: value }))
                      }
                      placeholder="Selecione uma opção"
                      getLabel={(item) => item.label}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Resultado do Teste</Label>
                    <ButtonOptionGroup
                      options={[
                        { value: "aprovado", label: "Aprovado" },
                        { value: "reprovado", label: "Reprovado" },
                      ]}
                      value={form.resultadoTeste}
                      onChange={(value) =>
                        setForm((current) => ({
                          ...current,
                          resultadoTeste: value as ResultadoTeste,
                        }))
                      }
                    />
                  </div>

                  <div className="rounded-xl border p-4">
                    <p className="mb-3 font-medium">Teste de Estanqueidade</p>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label>Rede</Label>
                        <ButtonOptionGroup
                          options={[
                            { value: "primaria", label: "Primária" },
                            { value: "secundaria", label: "Secundária" },
                          ]}
                          value={form.redeEstanqueidade}
                          onChange={(value) =>
                            setForm((current) => ({
                              ...current,
                              redeEstanqueidade: value as RedeTipo,
                            }))
                          }
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label htmlFor="os-tempo-teste">Tempo de Teste</Label>
                          <Input
                            id="os-tempo-teste"
                            placeholder="Ex.: 15 min"
                            value={form.tempoTeste}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                tempoTeste: event.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="os-fluido">Fluído</Label>
                          <Input
                            id="os-fluido"
                            placeholder="Ex.: Água e sabão"
                            value={form.fluido}
                            onChange={(event) =>
                              setForm((current) => ({ ...current, fluido: event.target.value }))
                            }
                          />
                        </div>
                      </div>
                    </div>
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

                  <div className="space-y-1.5">
                    <Label>Serviços Prestados</Label>
                    <div className="flex flex-wrap gap-2">
                      {SERVICOS_PRESTADOS_OPTIONS.map((option) => {
                        const selected = form.servicosPrestados.includes(option)
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() =>
                              setForm((current) => ({
                                ...current,
                                servicosPrestados: selected
                                  ? current.servicosPrestados.filter((item) => item !== option)
                                  : [...current.servicosPrestados, option],
                              }))
                            }
                            className={cn(
                              "rounded-full border px-3 py-1.5 text-sm transition-colors",
                              selected
                                ? "border-primary bg-primary/10 text-primary"
                                : "hover:border-primary/40"
                            )}
                          >
                            {option}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="space-y-3">
                  <h3 className="font-medium">Revisar Ordem de Serviço</h3>
                  <ReviewBlock title="Atendimento">
                    <p>{selectedType?.name}</p>
                    <p>
                      {form.date.split("-").reverse().join("/")} · {form.startTime}
                    </p>
                    <p>Duração estimada: {form.durationHours ? `${form.durationHours}h` : "—"}</p>
                    <p>Prioridade: {priorityLabels[form.priority]}</p>
                    {form.description ? (
                      <p className="text-muted-foreground">{form.description}</p>
                    ) : null}
                  </ReviewBlock>
                  <ReviewBlock title="Responsáveis">
                    {selectedEmployees.map((employee) => (
                      <p key={employee.id}>
                        {employee.name}
                        <span className="text-muted-foreground"> · {employee.role}</span>
                      </p>
                    ))}
                  </ReviewBlock>
                  <ReviewBlock title="Cliente">
                    <p>{selectedClient?.name}</p>
                    <p className="text-muted-foreground">
                      {form.useRegisteredAddress
                        ? `${selectedClient?.address} · ${selectedClient?.city} - ${selectedClient?.state}`
                        : form.customAddress}
                    </p>
                  </ReviewBlock>
                  <ReviewBlock title="Checklist">
                    <p>{selectedQuestionnaire?.name}</p>
                    <p className="text-muted-foreground">
                      {selectedQuestionnaire?.questions.length} perguntas
                    </p>
                  </ReviewBlock>
                  <ReviewBlock title="Dados Técnicos">
                    <p>
                      Manômetro:{" "}
                      {form.manometro === "bourdon"
                        ? "Bourdon"
                        : form.manometro === "coluna_agua"
                          ? "Coluna d'água"
                          : "—"}
                      {" · "}
                      Resultado:{" "}
                      {form.resultadoTeste === "aprovado"
                        ? "Aprovado"
                        : form.resultadoTeste === "reprovado"
                          ? "Reprovado"
                          : "—"}
                    </p>
                    <p className="text-muted-foreground">
                      Estanqueidade:{" "}
                      {form.redeEstanqueidade === "primaria"
                        ? "Rede primária"
                        : form.redeEstanqueidade === "secundaria"
                          ? "Rede secundária"
                          : "—"}
                      {form.tempoTeste ? ` · ${form.tempoTeste}` : ""}
                      {form.fluido ? ` · ${form.fluido}` : ""}
                    </p>
                    {form.servicosPrestados.length ? (
                      <p className="text-muted-foreground">
                        Serviços prestados: {form.servicosPrestados.join(", ")}
                      </p>
                    ) : null}
                  </ReviewBlock>
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-between border-t pt-3">
              <Button variant="outline" onClick={() => (step === 0 ? close() : setStep(step - 1))}>
                {step === 0 ? "Cancelar" : "Voltar e editar"}
              </Button>
              {step < 3 ? (
                <Button disabled={!canNext} onClick={() => setStep(step + 1)}>
                  Continuar
                </Button>
              ) : (
                <Button onClick={submit}>Criar Ordem de Serviço</Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function ReviewBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border p-4">
      <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {title}
      </p>
      <div className="space-y-1 text-sm">{children}</div>
    </section>
  )
}

function MapPlaceholder() {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-muted">
      <svg viewBox="0 0 240 180" className="h-full w-full">
        <rect width="240" height="180" fill="var(--bg-muted)" />
        <path d="M0 110 C40 90 80 130 120 100 S200 70 240 95 L240 180 L0 180 Z" fill="var(--border-subtle)" />
        <path d="M20 40 L220 50" stroke="var(--border)" strokeWidth="6" />
        <path d="M40 20 L50 160" stroke="var(--border)" strokeWidth="5" />
        <path d="M0 80 L240 70" stroke="var(--border)" strokeWidth="3" />
        <circle cx="118" cy="96" r="10" fill="var(--bg-brand)" />
        <circle cx="118" cy="96" r="18" fill="var(--bg-brand)" opacity="0.2" />
      </svg>
      <p className="absolute bottom-2 left-2 rounded bg-white/90 px-2 py-1 text-[11px] text-muted-foreground">
        Mapa ilustrativo
      </p>
    </div>
  )
}
