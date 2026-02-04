"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

const SEGMENTS = [
  { id: "Pyme", label: "🏭 Pyme" },
  { id: "E-commerce", label: "🛒 E-commerce" },
  { id: "Creadores", label: "🎨 Creadores" },
  { id: "Startups", label: "🚀 Startups" },
];

export function DashboardHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentRubro = searchParams.get("rubro") || "Pyme";

  const handleRubroChange = (rubroId: string) => {
    router.push(`/?rubro=${rubroId}`, { scroll: false });
  };

  return (
    <header className="h-20 px-6 flex items-center justify-between border-b border-border bg-background">
      {/* Logo */}
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => router.push("/")}
      >
        <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-sm">
          SD
        </div>
        <span className="hidden sm:block text-lg font-bold tracking-tight text-foreground">
          SmartDash
        </span>
      </div>

      {/* Segment selector */}
      <div className="flex gap-1 rounded-xl border border-border bg-muted p-1.5 overflow-x-auto">
        {SEGMENTS.map((seg) => {
          const isActive = seg.id === currentRubro;

          return (
            <Button
              key={seg.id}
              variant="ghost"
              onClick={() => handleRubroChange(seg.id)}
              className={cn(
                "h-9 px-4 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                isActive
                  ? "bg-card text-foreground font-semibold shadow-sm ring-1 ring-ring/20"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {seg.label}
            </Button>
          );
        })}
      </div>

      {/* Spacer */}
      <div className="w-8 hidden sm:block" />
    </header>
  );
}
