"use client"

import { useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Contrast, Globe, PanelLeft, Plus, Search, Sun } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatOsNumber } from "@/lib/status"
import { useApp, useLookups } from "@/store/app-store"
import { useAuth } from "@/store/auth-store"

const titles: Record<string, string> = {
  "/": "Checklist",
  "/ordens": "Ordens de serviço",
  "/agendamentos": "Agendamentos",
  "/servicos": "Serviços",
  "/alertas": "Alertas",
  "/clientes": "Clientes",
  "/locais": "Locais",
  "/equipamentos": "Equipamentos",
  "/colaboradores": "Colaboradores",
  "/tipos-de-servico": "Tipos de serviço",
  "/questionarios": "Questionários",
  "/relatorios": "Relatórios",
  "/relatorios-mensais": "Relatórios mensais",
  "/status": "Configurar status",
  "/prioridades": "Prioridades",
  "/personalizacao": "Personalização",
  "/usuarios": "Usuários",
  "/configuracoes": "Personalização",
}

export function AppHeader({
  collapsed,
  onToggleSidebar,
}: {
  collapsed: boolean
  onToggleSidebar: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { setNewOsOpen, serviceOrders, clients, equipment } = useApp()
  const { user, logout } = useAuth()
  const { clientById, serviceTypeById, employeeById } = useLookups()
  const [query, setQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)

  const title = useMemo(() => {
    if (pathname.startsWith("/ordens/") && pathname !== "/ordens") return "Detalhe da OS"
    if (pathname.startsWith("/clientes/") && pathname !== "/clientes") return "Cliente"
    if (pathname.startsWith("/equipamentos/") && pathname !== "/equipamentos") {
      return "Equipamento"
    }
    if (pathname.startsWith("/colaboradores/") && pathname !== "/colaboradores") {
      return "Colaborador"
    }
    if (pathname.startsWith("/questionarios/") && pathname !== "/questionarios") {
      return "Questionário"
    }
    if (pathname.startsWith("/tipos-de-servico/") && pathname !== "/tipos-de-servico") {
      return "Tipo de serviço"
    }
    return titles[pathname] ?? "Gerenciamento de OS"
  }, [pathname])

  const results = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (term.length < 2) return []
    const osHits = serviceOrders
      .filter((order) => {
        const client = clientById(order.clientId)?.name ?? ""
        const service = serviceTypeById(order.serviceTypeId)?.name ?? ""
        const assignees = order.employeeIds
          .map((id) => employeeById(id)?.name ?? "")
          .join(" ")
        return (
          formatOsNumber(order.number).toLowerCase().includes(term) ||
          String(order.number).includes(term) ||
          client.toLowerCase().includes(term) ||
          service.toLowerCase().includes(term) ||
          assignees.toLowerCase().includes(term)
        )
      })
      .slice(0, 4)
      .map((order) => ({
        href: `/ordens/${order.id}`,
        title: `OS ${formatOsNumber(order.number)}`,
        subtitle: `${serviceTypeById(order.serviceTypeId)?.name} · ${clientById(order.clientId)?.name}`,
      }))
    const clientHits = clients
      .filter((client) => client.name.toLowerCase().includes(term))
      .slice(0, 3)
      .map((client) => ({
        href: `/clientes/${client.id}`,
        title: client.name,
        subtitle: `Cliente · ${equipment.filter((item) => item.clientId === client.id).length} equipamentos`,
      }))
    const equipmentHits = equipment
      .filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.assetTag.toLowerCase().includes(term)
      )
      .slice(0, 3)
      .map((item) => ({
        href: `/equipamentos/${item.id}`,
        title: item.name,
        subtitle: `Equipamento · ${clientById(item.clientId)?.name}`,
      }))
    return [...osHits, ...clientHits, ...equipmentHits]
  }, [clientById, clients, employeeById, equipment, query, serviceOrders, serviceTypeById])

  function toggleTheme() {
    const root = document.documentElement
    const next = root.dataset.theme === "dark" ? "light" : "dark"
    root.dataset.theme = next
    localStorage.setItem("os-theme", next)
  }

  return (
    <header className="flex h-[76px] shrink-0 items-center">
      <div className="flex h-full w-12 shrink-0 items-center justify-center border-r border-border-subtle py-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          onClick={onToggleSidebar}
        >
          <PanelLeft className="size-5" />
        </Button>
      </div>

      <div className="flex min-w-0 flex-1 items-center px-4">
        <h1 className="truncate font-heading text-2xl font-bold leading-none tracking-tight">
          {title}
        </h1>
      </div>

      <div className="flex h-full shrink-0 items-center gap-4 px-4">
        <div className="relative hidden md:block">
          {searchOpen ? (
            <Input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onBlur={() => {
                window.setTimeout(() => {
                  if (!query) setSearchOpen(false)
                }, 150)
              }}
              placeholder="Buscar OS, cliente ou equipamento..."
              className="h-9 w-[280px]"
            />
          ) : (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Buscar"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="size-5" />
            </Button>
          )}
          {searchOpen && query.trim().length > 0 ? (
            <div className="absolute top-[calc(100%+8px)] right-0 z-50 w-[320px] rounded-lg border bg-popover p-1 shadow-md">
              {results.length === 0 ? (
                <p className="px-3 py-4 text-sm text-muted-foreground">Nenhum resultado.</p>
              ) : (
                results.map((item) => (
                  <button
                    key={item.href + item.title}
                    type="button"
                    className="flex w-full flex-col rounded-md px-3 py-2 text-left hover:bg-muted"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setSearchOpen(false)
                      setQuery("")
                      router.push(item.href)
                    }}
                  >
                    <span className="text-sm font-medium">{item.title}</span>
                    <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                  </button>
                ))
              )}
            </div>
          ) : null}
        </div>

        <Button size="lg" onClick={() => setNewOsOpen(true)}>
          <Plus data-icon="inline-start" />
          Nova OS
        </Button>

        <Button variant="ghost" className="hidden h-9 gap-2 px-2.5 font-medium lg:inline-flex">
          <Globe className="size-4" />
          Português (BR)
        </Button>

        <Button variant="ghost" size="icon" aria-label="Alto contraste" onClick={toggleTheme}>
          <Contrast className="size-5" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Alternar tema claro" onClick={toggleTheme}>
          <Sun className="size-5" />
        </Button>

        <button
          type="button"
          onClick={() => {
            logout()
            router.replace("/login")
          }}
          className="flex items-center gap-2 rounded-lg p-1 text-left hover:bg-muted"
          title="Sair"
        >
          <Avatar className="size-8">
            <AvatarFallback className="bg-brand-700 text-xs font-bold text-fg-on-brand">
              {user?.initials ?? "—"}
            </AvatarFallback>
          </Avatar>
          <div className="hidden min-w-0 sm:block">
            <p className="text-xs font-semibold leading-4">{user?.name}</p>
            <p className="text-[11px] leading-[1.2] text-muted-foreground">
              {user?.role} • Sistema
            </p>
          </div>
        </button>
      </div>
    </header>
  )
}
