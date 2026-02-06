"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { Bell, User, Zap } from "lucide-react";

const SEGMENTS = [
  { id: "Pyme", label: "Pyme", icon: "🏭" },
  { id: "E-commerce", label: "E-commerce", icon: "🛒" },
  { id: "Creadores", label: "Creadores", icon: "🎨" },
  { id: "Startups", label: "Startups", icon: "🚀" },
];

export function DashboardHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentRubro = searchParams.get("rubro");

  const handleRubroChange = (rubroId: string) => {
    router.push(`/?rubro=${rubroId}`, { scroll: false });
  };

  return (
    <header className="h-20 px-8 flex items-center justify-between border-b border-slate-100 bg-white/70 backdrop-blur-xl sticky top-0 z-[100] transition-all duration-300">
      {/* Logo */}
      {/* Logo - Hidden on specific breakpoints to avoid clash with Sidebar */}
      <div
        className="flex lg:hidden items-center gap-3 cursor-pointer group ml-12" // ml-12 to clear the hamburger button
        onClick={() => router.push("/")}
      >
        <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 group-hover:rotate-3 transition-all duration-500">
          <Zap size={20} fill="currentColor" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-black tracking-tighter text-slate-900 leading-tight">
            SMART<span className="text-orange-600">DASH</span>
          </span>
          <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
            Risk Analysis
          </span>
        </div>
      </div>

      {/* Segment selector */}
      {currentRubro && (
        <div className="hidden lg:flex gap-1.5 rounded-2xl border border-slate-100 bg-slate-50/50 p-1.5 backdrop-blur-sm">
          {SEGMENTS.map((seg) => {
            const isActive = seg.id === currentRubro;

            return (
              <button
                key={seg.id}
                onClick={() => handleRubroChange(seg.id)}
                className={cn(
                  "h-10 px-5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2",
                  isActive
                    ? "bg-white text-orange-600 shadow-sm ring-1 ring-slate-100 scale-100"
                    : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                )}
              >
                <span>{seg.icon}</span>
                {seg.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Profile & Notifications */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="w-11 h-11 rounded-2xl text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-all duration-300">
          <Bell size={20} />
        </Button>
        <div className="h-10 w-px bg-slate-100 mx-1" />
        <Button variant="ghost" className="h-11 px-2 pr-4 rounded-2xl hover:bg-slate-50 gap-3 transition-all duration-300">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs ring-4 ring-slate-100">
            <User size={16} />
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="text-xs font-black text-slate-900">Admin</span>
            <span className="text-[10px] font-bold text-emerald-500">Online</span>
          </div>
        </Button>
      </div>
    </header>
  );
}

