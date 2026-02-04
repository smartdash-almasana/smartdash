import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-[calc(100vh-64px)]"> {/* Restamos header */}
      
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border p-4 hidden md:block">
        <h2 className="text-lg font-semibold mb-4">Dashboard</h2>
        <ul className="space-y-2">
          <li className="hover:text-primary cursor-pointer">Inicio</li>
          <li className="hover:text-primary cursor-pointer">Riesgos</li>
          <li className="hover:text-primary cursor-pointer">Reportes</li>
          <li className="hover:text-primary cursor-pointer">Configuración</li>
        </ul>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 bg-background">
        {children}
      </main>
    </div>
  );
}
