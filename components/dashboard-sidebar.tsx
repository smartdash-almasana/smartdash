"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  MessageSquare,
  PieChart,
  Settings,
  Users,
  Activity,
  LogOut,
  ShieldAlert
} from "lucide-react"

// Datos estáticos definidos localmente para evitar dependencias circulares
const currentClient = {
  name: "Usuario Demo",
  role: "Admin",
  initials: "UD"
}

const navItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    label: "Riesgos",
    icon: ShieldAlert,
    href: "/risks",
  },
  {
    label: "Métricas",
    icon: PieChart,
    href: "/metrics",
  },
  {
    label: "Mensajes",
    icon: MessageSquare,
    href: "/messages",
  },
  {
    label: "Clientes",
    icon: Users,
    href: "/clients",
  },
  {
    label: "Configuración",
    icon: Settings,
    href: "/settings",
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col justify-between bg-card py-4 transition-all duration-300">
      <div className="px-3 py-2">
        {/* Logo Area */}
        <div className="mb-8 flex items-center justify-center lg:justify-start px-2 h-10">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="h-5 w-5" />
          </div>
          <span className="ml-3 text-lg font-bold tracking-tight text-foreground hidden lg:inline opacity-0 lg:opacity-100 transition-opacity duration-300">
            SmartDash
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} className="block group">
                <div
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                    "justify-center lg:justify-start" // Icon centered on md, left on lg
                  )}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary" : "")} />
                  <span className="ml-3 hidden lg:inline truncate transition-all">
                    {item.label}
                  </span>
                  
                  {/* Tooltip fake for icon-only mode */}
                  <span className="sr-only">{item.label}</span>
                </div>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* User Footer */}
      <div className="px-3 py-2 mt-auto border-t border-border pt-4">
        <div className="mb-2 flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-2 lg:p-3 justify-center lg:justify-start">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
            {currentClient.initials}
          </div>
          <div className="hidden lg:block overflow-hidden max-w-[120px]">
            <p className="truncate text-sm font-medium text-foreground">
              {currentClient.name}
            </p>
            <p className="truncate text-[10px] text-muted-foreground uppercase">
              {currentClient.role}
            </p>
          </div>
        </div>
        
        <button className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 justify-center lg:justify-start">
          <LogOut className="h-5 w-5 shrink-0" />
          <span className="ml-3 hidden lg:inline">Salir</span>
        </button>
      </div>
    </div>
  )
}