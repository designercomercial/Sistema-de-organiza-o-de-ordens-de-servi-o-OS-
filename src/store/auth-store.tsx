"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

export type SessionUser = {
  email: string
  name: string
  role: string
  initials: string
}

const DEMO_USERS = [
  {
    email: "teste@gos.demo",
    password: "teste",
    name: "Teste",
    role: "Demonstração",
    initials: "TE",
  },
  {
    email: "carlos.mendes@gos.demo",
    password: "demo",
    name: "Carlos Mendes",
    role: "Gerente Técnico",
    initials: "CM",
  },
] as const

const STORAGE_KEY = "gos-session"

type AuthState = {
  user: SessionUser | null
  ready: boolean
  login: (email: string, password: string, persist: boolean) => string | null
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY)
      if (raw) setUser(JSON.parse(raw) as SessionUser)
    } catch {
      /* ignore */
    }
    setReady(true)
  }, [])

  const login = useCallback((email: string, password: string, persist: boolean) => {
    const found = DEMO_USERS.find(
      (item) =>
        item.email.toLowerCase() === email.trim().toLowerCase() &&
        item.password === password.trim()
    )
    if (!found) return "E-mail ou senha inválidos."
    const session: SessionUser = {
      email: found.email,
      name: found.name,
      role: found.role,
      initials: found.initials,
    }
    setUser(session)
    const payload = JSON.stringify(session)
    sessionStorage.setItem(STORAGE_KEY, payload)
    if (persist) localStorage.setItem(STORAGE_KEY, payload)
    else localStorage.removeItem(STORAGE_KEY)
    return null
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    sessionStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const value = useMemo(() => ({ user, ready, login, logout }), [user, ready, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}

export const demoUsersPublic = DEMO_USERS.map(({ email, name, role, initials }) => ({
  email,
  name,
  role,
  initials,
}))
