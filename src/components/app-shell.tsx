"use client"

import { useEffect, useState, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"
import { NewServiceOrderDialog } from "@/components/new-service-order-dialog"
import { useAuth } from "@/store/auth-store"

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, ready } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const isLogin = pathname === "/login"

  useEffect(() => {
    if (!ready || isLogin) return
    if (!user) router.replace("/login")
  }, [isLogin, ready, router, user])

  if (isLogin) return children
  if (!ready || !user) {
    return <div className="min-h-dvh bg-sidebar" />
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-sidebar">
      <AppSidebar collapsed={collapsed} />
      <div className="flex min-h-0 min-w-0 flex-1 p-[10px]">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl bg-card shadow-sm">
          <AppHeader
            collapsed={collapsed}
            onToggleSidebar={() => setCollapsed((value) => !value)}
          />
          <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 lg:px-6">{children}</main>
        </div>
      </div>
      <NewServiceOrderDialog />
    </div>
  )
}
