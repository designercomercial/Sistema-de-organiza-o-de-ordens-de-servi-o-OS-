"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/store/auth-store"

export default function LoginPage() {
  const router = useRouter()
  const { login, user, ready } = useAuth()
  const [email, setEmail] = useState("teste@gos.demo")
  const [password, setPassword] = useState("teste")
  const [persist, setPersist] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (ready && user) router.replace("/")
  }, [ready, router, user])

  function authenticate() {
    const message = login(email, password, persist)
    if (message) {
      setError(message)
      return
    }
    setError(null)
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-sidebar px-12 py-16 text-sidebar-accent-foreground lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="gos-mark mb-8 inline-flex size-11 items-center justify-center rounded-lg text-sm font-semibold">
            GOS
          </div>
          <p className="text-sm text-white/70">SASI · Serviços em campo</p>
          <h1 className="mt-4 max-w-md font-heading text-3xl font-bold leading-tight">
            Gestão de ordens de serviço sem complexidade
          </h1>
          <p className="mt-4 max-w-md text-[14.5px] leading-relaxed text-white/70">
            Triagem, atendimento em campo e histórico do equipamento — agenda, cliente e
            questionário no mesmo fluxo.
          </p>
        </div>
        <p className="text-xs text-white/50">SESP/operação de campo · demonstração · v2.0</p>
      </section>

      <section className="flex items-center justify-center bg-card px-6 py-12">
        <div className="w-full max-w-sm space-y-5">
          <div>
            <h2 className="font-heading text-2xl font-bold">Entrar</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Acesse o painel com seu e-mail institucional.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="text"
              inputMode="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") authenticate()
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") authenticate()
              }}
            />
          </div>
          {error ? <p className="text-sm text-danger-subtle-foreground">{error}</p> : null}
          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={persist} onCheckedChange={setPersist} />
              Manter-me conectado
            </label>
          </div>
          <Button type="button" size="lg" className="w-full" onClick={authenticate}>
            Entrar
          </Button>
          <p className="text-xs text-muted-foreground">
            Acesso concedido pela administração do SASI.
          </p>
        </div>
      </section>
    </div>
  )
}
