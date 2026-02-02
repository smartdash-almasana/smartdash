"use client"

import React from "react"
import { Bell, Loader2, Search } from "lucide-react"
import { RUBROS } from "@/lib/data"

interface DashboardHeaderProps {
  selectedRubro: string
  onRubroChange: (rubro: string) => void
  isLoading: boolean
  alertsCount: number
}

export function DashboardHeader({
  selectedRubro,
  onRubroChange,
  isLoading,
  alertsCount,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center gap-4 border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      
      {/* Selector de Rubro (Filtro Global) */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative min-w-[200px] max-w-[300px]">
          <select
            value={selectedRubro}
            onChange={(e) => onRubroChange(e.target.value)}
            disabled={isLoading}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
          >
            {RUBROS.map((rubro) => (
              <option key={rubro} value={rubro}>
                {rubro}
              </option>
            ))}
          </select>
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        
        {/* Placeholder de búsqueda visual */}
        <div className="hidden md:flex items-center relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar señales o métricas..." 
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      {/* Acciones y Notificaciones */}
      <div className="flex items-center gap-4">
        <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors">
          <Bell className="h-4 w-4" />
          {alertsCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-in zoom-in">
              {alertsCount}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}