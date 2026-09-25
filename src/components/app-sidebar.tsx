"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2,
  ChevronDown,
  CircleDot,
  ClipboardList,
  FileBarChart,
  FolderOpen,
  Inbox,
  MapPin,
  Palette,
  Settings,
  Shield,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getDisplayStatus, isOpenStatus } from "@/lib/status"
import { useApp } from "@/store/app-store"

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  end?: boolean
  badge?: "pendentes"
}

// label: título da seção; dropdown: título vira um botão que abre/fecha os itens;
// bottom: grupo fixado no rodapé da barra lateral.
type NavGroup = {
  id: string
  label?: string
  icon?: LucideIcon
  dropdown?: boolean
  bottom?: boolean
  items: NavItem[]
}

const groups: NavGroup[] = [
  {
    id: "operacao",
    items: [
      { href: "/", label: "Caixa de entrada", icon: Inbox, end: true },
      { href: "/ordens", label: "Ordens de serviço", icon: ClipboardList, badge: "pendentes" },
    ],
  },
  {
    id: "cadastros",
    label: "Cadastros",
    icon: FolderOpen,
    dropdown: true,
    items: [
      { href: "/clientes", label: "Clientes", icon: Building2 },
      { href: "/locais", label: "Locais", icon: MapPin },
      { href: "/equipamentos", label: "Equipamentos", icon: Wrench },
      { href: "/colaboradores", label: "Colaboradores", icon: Users },
    ],
  },
  {
    id: "analise",
    items: [{ href: "/relatorios", label: "Relatórios", icon: FileBarChart }],
  },
  {
    id: "configuracoes",
    bottom: true,
    label: "Configurações",
    icon: Settings,
    dropdown: true,
    items: [
      { href: "/status", label: "Status", icon: CircleDot },
      { href: "/prioridades", label: "Prioridades", icon: Shield },
      { href: "/personalizacao", label: "Personalização", icon: Palette },
      { href: "/usuarios", label: "Usuários", icon: Users },
    ],
  },
]

export function AppSidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname()
  const { serviceOrders } = useApp()
  const pendentes = serviceOrders.filter((order) => isOpenStatus(getDisplayStatus(order))).length

  const isActive = (href: string, end?: boolean) =>
    end || href === "/" ? pathname === href : pathname.startsWith(href)
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(
    () =>
      new Set(
        groups
          .filter(
            (group) => group.dropdown && group.items.some((item) => isActive(item.href, item.end)),
          )
          .map((group) => group.id),
      ),
  )
  const toggleDropdown = (id: string) =>
    setOpenDropdowns((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const renderGroup = (group: NavGroup) => {
    const GroupIcon = group.icon
    // Com a barra recolhida não há espaço para o título: os itens do dropdown ficam sempre visíveis.
    const expanded = !group.dropdown || collapsed || openDropdowns.has(group.id)
    return (
      <div key={group.id}>
        {group.dropdown && GroupIcon && !collapsed ? (
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => toggleDropdown(group.id)}
            className="flex w-full items-center justify-between gap-2 rounded-[9px] px-2.5 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <GroupIcon className="size-4 shrink-0" />
              <span className="truncate">{group.label}</span>
            </span>
            <ChevronDown
              className={cn("size-4 shrink-0 transition-transform", expanded && "rotate-180")}
            />
          </button>
        ) : group.label && !collapsed ? (
          <p className="mb-1 px-2.5 text-[11px] font-medium tracking-wide text-sidebar-foreground/50 uppercase">
            {group.label}
          </p>
        ) : null}
        {expanded ? (
          <div
            className={cn(
              "space-y-0.5",
              group.dropdown && !collapsed && "mt-0.5 ml-4 border-l border-white/10 pl-2",
            )}
          >
            {group.items.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href, item.end)
              const count = item.badge === "pendentes" ? pendentes : 0
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-[9px] px-2.5 py-2 text-sm font-medium transition-colors",
                    collapsed && "justify-center px-0",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <Icon className="size-4 shrink-0" />
                    {!collapsed ? <span className="truncate">{item.label}</span> : null}
                  </span>
                  {!collapsed && count > 0 ? (
                    <span className="rounded-full bg-white/15 px-1.5 text-[11px] tabular-nums">
                      {count}
                    </span>
                  ) : null}
                </Link>
              )
            })}
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-200",
        collapsed ? "w-[72px]" : "w-[240px]",
      )}
    >
      <div className={cn("flex items-center gap-2 px-3 py-5", collapsed && "justify-center")}>
        <div className="gos-mark flex size-9 items-center justify-center rounded-lg text-xs font-semibold">
          GOS
        </div>
        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Gestão de O.S.</p>
            <p className="truncate text-xs text-sidebar-foreground/70">SASI · Campo</p>
          </div>
        ) : null}
      </div>
      <nav className="flex min-h-0 flex-1 flex-col px-2 pb-3">
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto">
          {groups.filter((group) => !group.bottom).map(renderGroup)}
        </div>
        <div className="mt-3 space-y-1 border-t border-white/10 pt-3">
          {groups.filter((group) => group.bottom).map(renderGroup)}
        </div>
      </nav>
    </aside>
  )
}
