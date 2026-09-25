"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SearchableSelect } from "@/components/searchable-select"
import { SOLICITACAO_TIPOS } from "@/lib/field-options"
import { useApp, useLookups } from "@/store/app-store"
import type { SolicitacaoTipo } from "@/types"

const emptyForm = {
  type: "" as SolicitacaoTipo | "",
  clientId: "",
  locationId: "",
  contactName: "",
  phone: "",
  notes: "",
}

export function ServiceRequestDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { clients, createServiceRequest } = useApp()
  const { locationsForClient } = useLookups()
  const [form, setForm] = useState(emptyForm)

  const canSubmit = Boolean(form.type && form.clientId && form.contactName)

  function reset() {
    setForm(emptyForm)
  }

  function submit() {
    if (!form.type) return
    createServiceRequest({
      type: form.type,
      clientId: form.clientId,
      locationId: form.locationId || undefined,
      contactName: form.contactName,
      phone: form.phone,
      notes: form.notes,
    })
    toast.success("Solicitação de serviço enviada.")
    onOpenChange(false)
    reset()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset()
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Solicitar Serviço</DialogTitle>
          <DialogDescription>
            Registre uma nova solicitação para triagem da equipe.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Tipo de Solicitação</Label>
            <SearchableSelect
              items={SOLICITACAO_TIPOS.map((item) => ({ id: item.value, label: item.label }))}
              value={form.type}
              onChange={(value) =>
                setForm((current) => ({ ...current, type: value as SolicitacaoTipo }))
              }
              placeholder="Selecione uma opção"
              getLabel={(item) => item.label}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Cliente</Label>
            <SearchableSelect
              items={clients}
              value={form.clientId}
              onChange={(clientId) =>
                setForm((current) => ({ ...current, clientId, locationId: "" }))
              }
              placeholder="Selecionar cliente"
              getLabel={(item) => item.name}
              getDescription={(item) => `${item.city} - ${item.state}`}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Local</Label>
            <SearchableSelect
              items={locationsForClient(form.clientId)}
              value={form.locationId}
              onChange={(locationId) => setForm((current) => ({ ...current, locationId }))}
              placeholder={form.clientId ? "Selecionar local" : "Selecione o cliente primeiro"}
              getLabel={(item) => item.name}
              getDescription={(item) => item.address}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="sr-contact">Nome de Contato</Label>
              <Input
                id="sr-contact"
                value={form.contactName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, contactName: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sr-phone">Telefone</Label>
              <Input
                id="sr-phone"
                value={form.phone}
                onChange={(event) =>
                  setForm((current) => ({ ...current, phone: event.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sr-notes">Observações</Label>
            <Textarea
              id="sr-notes"
              rows={3}
              placeholder="Detalhe o motivo da solicitação"
              value={form.notes}
              onChange={(event) =>
                setForm((current) => ({ ...current, notes: event.target.value }))
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={!canSubmit} onClick={submit}>
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
