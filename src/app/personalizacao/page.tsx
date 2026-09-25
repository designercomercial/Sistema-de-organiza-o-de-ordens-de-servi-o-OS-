"use client"

import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

type Brand = "sasi" | "blue"
type Theme = "light" | "dark"
type Style = "refined" | "data-dense"

export default function PersonalizationPage() {
  const [theme, setTheme] = useState<Theme>("light")
  const [brand, setBrand] = useState<Brand>("sasi")
  const [style, setStyle] = useState<Style>("refined")

  useEffect(() => {
    const root = document.documentElement
    if (root.dataset.theme === "dark" || root.dataset.theme === "light") {
      setTheme(root.dataset.theme)
    }
    if (root.dataset.brand === "sasi" || root.dataset.brand === "blue") {
      setBrand(root.dataset.brand)
    }
    if (root.dataset.style === "refined" || root.dataset.style === "data-dense") {
      setStyle(root.dataset.style)
    }
  }, [])

  function applyTheme(next: Theme) {
    setTheme(next)
    document.documentElement.dataset.theme = next
    localStorage.setItem("os-theme", next)
  }

  function applyBrand(next: Brand) {
    setBrand(next)
    document.documentElement.dataset.brand = next
  }

  function applyStyle(next: Style) {
    setStyle(next)
    document.documentElement.dataset.style = next
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <p className="text-sm text-muted-foreground">
        Aparência do produto. Marca, tema e densidade mudam no html, sem recodar componentes.
      </p>
      <section className="rounded-xl border border-border-subtle bg-card p-4">
        <p className="font-medium">Empresa</p>
        <p className="mt-1 text-sm text-muted-foreground">Gestão de O.S. · SASI</p>
        <p className="text-sm text-muted-foreground">Serviços em campo, agenda e histórico de equipamento.</p>
      </section>
      <section className="space-y-4 rounded-xl border border-border-subtle bg-card p-4">
        <div>
          <p className="text-sm font-medium">Tema</p>
          <div className="mt-2 flex gap-2">
            <Choice active={theme === "light"} onClick={() => applyTheme("light")}>
              Claro
            </Choice>
            <Choice active={theme === "dark"} onClick={() => applyTheme("dark")}>
              Escuro
            </Choice>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium">Marca</p>
          <div className="mt-2 flex gap-2">
            <Choice active={brand === "sasi"} onClick={() => applyBrand("sasi")}>
              SASI
            </Choice>
            <Choice active={brand === "blue"} onClick={() => applyBrand("blue")}>
              Azul
            </Choice>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium">Estilo</p>
          <div className="mt-2 flex gap-2">
            <Choice active={style === "refined"} onClick={() => applyStyle("refined")}>
              Refined
            </Choice>
            <Choice active={style === "data-dense"} onClick={() => applyStyle("data-dense")}>
              Denso
            </Choice>
          </div>
        </div>
      </section>
      <section className="space-y-3 rounded-xl border border-border-subtle bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Label htmlFor="late-reminder">Lembrete de OS atrasada</Label>
            <p className="text-xs text-muted-foreground">Alimenta o painel e a página de alertas.</p>
          </div>
          <Switch id="late-reminder" defaultChecked />
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <Label htmlFor="auto-quiz">Vincular questionário ao tipo de serviço</Label>
            <p className="text-xs text-muted-foreground">Comportamento padrão da operação.</p>
          </div>
          <Switch id="auto-quiz" defaultChecked />
        </div>
      </section>
    </div>
  )
}

function Choice({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "h-8 rounded-lg border border-primary bg-accent px-3 text-sm text-accent-foreground"
          : "h-8 rounded-lg border px-3 text-sm"
      }
    >
      {children}
    </button>
  )
}
