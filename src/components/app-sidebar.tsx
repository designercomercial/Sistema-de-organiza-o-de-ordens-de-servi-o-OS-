"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bell,
  Building2,
  CalendarDays,
  CheckSquare,
  ClipboardCheck,
  ClipboardList,
  FileBarChart,
  ListChecks,
  MapPin,
  Palette,
  Send,
  Settings,
  Shield,
  Users,
  Wrench,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getDisplayStatus, isOpenStatus } from "@/lib/status"
import { useApp } from "@/store/app-store"

const groups = [
  {
    label: "Operação",
    items: [
      { href: "/", label: "Checklist", icon: CheckSquare, end: true },
      { href: "/ordens", label: "Ordens de serviço", icon: ClipboardList, badge: "pendentes" as const },
      { href: "/agendamentos", label: "Agendamentos", icon: CalendarDays },
      { href: "/servicos", label: "Serviços", icon: Send },
      { href: "/alertas", label: "Alertas", icon: Bell },
    ],
  },
  {
    label: "Cadastros",
    items: [
      { href: "/clientes", label: "Clientes", icon: Building2 },
      { href: "/locais", label: "Locais", icon: MapPin },
      { href: "/equipamentos", label: "Equipamentos", icon: Wrench },
      { href: "/colaboradores", label: "Colaboradores", icon: Users },
      { href: "/tipos-de-servico", label: "Tipos de serviço", icon: ListChecks },
      { href: "/questionarios", label: "Questionários", icon: ClipboardCheck },
    ],
  },
  {
    label: "Análise",
    items: [
      { href: "/relatorios", label: "Relatórios", icon: FileBarChart },
      { href: "/relatorios-mensais", label: "Relatórios mensais", icon: FileBarChart },
    ],
  },
  {
    label: "Configurações",
    items: [
      { href: "/status", label: "Status", icon: Settings },
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

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-200",
        collapsed ? "w-[72px]" : "w-[240px]"
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
      <nav className="flex-1 space-y-5 overflow-y-auto px-2 pb-4">
        {groups.map((group) => (
          <div key={group.label}>
            {!collapsed ? (
              <p className="mb-1 px-2.5 text-[11px] font-medium tracking-wide text-sidebar-foreground/50 uppercase">
                {group.label}
              </p>
            ) : null}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href, "end" in item ? item.end : false)
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
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
          </div>
        ))}
      </nav>
    </aside>
  )
}
