import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import Script from "next/script"
import { AuthProvider } from "@/store/auth-store"
import { AppProvider } from "@/store/app-store"
import { AppShell } from "@/components/app-shell"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Gestão de O.S. — SASI",
  description: "Gestão simples e eficiente de serviços em campo.",
  icons: { icon: "/favicon.svg" },
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      data-theme="light"
      data-brand="sasi"
      data-style="refined"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-sidebar font-sans text-foreground">
        <Script id="gos-theme" strategy="beforeInteractive">{`
          (function () {
            var d = document.documentElement
            var t = 'light'
            try {
              var saved = localStorage.getItem('os-theme')
              t = saved === 'light' || saved === 'dark'
                ? saved
                : window.matchMedia('(prefers-color-scheme: dark)').matches
                  ? 'dark'
                  : 'light'
            } catch (e) {}
            d.setAttribute('data-theme', t)
            d.setAttribute('data-brand', 'sasi')
            d.setAttribute('data-style', 'refined')
          })()
        `}</Script>
        <TooltipProvider>
          <AuthProvider>
            <AppProvider>
              <AppShell>{children}</AppShell>
            </AppProvider>
          </AuthProvider>
        </TooltipProvider>
        <Toaster />
      </body>
    </html>
  )
}
