"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { demoUsersPublic } from "@/store/auth-store"

export default function UsersPage() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Contas com acesso ao painel. A autenticação desta demo é local.
      </p>
      {demoUsersPublic.map((item) => (
        <div key={item.email} className="flex items-center gap-3 rounded-xl border bg-card p-4">
          <Avatar>
            <AvatarFallback className="bg-brand-700 text-fg-on-brand">{item.initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-muted-foreground">
              {item.role} · {item.email}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
