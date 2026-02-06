"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MessageSquare,
  PieChart,
  Settings,
  Users,
  LogOut,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Datos de usuario
const currentClient = {
  name: "Usuario Demo",
  role: "Administrador",
  initials: "UD",
};

const navItems = [
  { label: "Panel de Control", icon: LayoutDashboard, href: "/" },
  { label: "Evidencia del Escenario", icon: ShieldAlert, href: "/riesgos" },
  { label: "Métricas", icon: PieChart, href: "/metricas" },
  { label: "Cierre de Ciclo", icon: MessageSquare, href: "/mensajes" },
  { label: "Clientes", icon: Users, href: "/clientes" },
  { label: "Configuración", icon: Settings, href: "/configuracion" },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-white text-gray-700 transition-all duration-300 ease-in-out border-r border-gray-200 shadow-sm",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header / Logo */}
      <div className="h-20 flex items-center justify-center border-b border-gray-200 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-md text-white font-black text-lg">
            SD
          </div>
          {!isCollapsed && (
            <span className="font-bold text-xl text-gray-900 tracking-tight animate-in fade-in duration-300">
              SmartDash
            </span>
          )}
        </div>

        {/* Toggle Button (Desktop) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn(
            "absolute -right-4 top-1/2 -translate-y-1/2 rounded-full border border-gray-300 bg-white text-gray-500 hover:text-gray-900 shadow-md w-8 h-8 z-50 hidden lg:flex",
            isCollapsed && "rotate-180"
          )}
        >
          <ChevronLeft size={14} />
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className="block group">
              <div
                className={cn(
                  "flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 group-hover:bg-gray-100",
                  isActive
                    ? "bg-orange-50 text-orange-600 shadow-sm border border-orange-100"
                    : "text-gray-600 hover:text-gray-900",
                  isCollapsed ? "justify-center" : ""
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 shrink-0 transition-colors",
                    isActive ? "text-orange-600" : "text-gray-400 group-hover:text-gray-600"
                  )}
                />
                {!isCollapsed && (
                  <span className="ml-3 truncate animate-in fade-in slide-in-from-left-2 duration-300">
                    {item.label}
                  </span>
                )}

                {/* Active Indicator Strip */}
                {isActive && !isCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500 shadow-sm" />
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className={cn(
          "flex items-center gap-3 rounded-xl bg-white p-2 border border-gray-200 shadow-sm",
          isCollapsed ? "justify-center" : ""
        )}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-xs font-bold text-white ring-2 ring-orange-100">
            {currentClient.initials}
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="truncate text-sm font-bold text-gray-900">
                {currentClient.name}
              </p>
              <p className="truncate text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                {currentClient.role}
              </p>
            </div>
          )}
        </div>

        <button
          className={cn(
            "mt-2 w-full flex items-center rounded-lg px-2 py-2 text-xs font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors uppercase tracking-wider",
            isCollapsed ? "justify-center" : "justify-start pl-3"
          )}
        >
          <LogOut size={16} />
          {!isCollapsed && <span className="ml-2">Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
}