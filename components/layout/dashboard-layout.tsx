"use client";

import { ReactNode, useState } from "react";
import { Sidebar } from "../sidebar";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#FDFDFF]">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main content with dynamic margin */}
      <main
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          "w-full",
          isCollapsed ? "lg:ml-20" : "lg:ml-64" // Alignment with sidebar width
        )}
      >
        {children}
      </main>
    </div>
  );
}
