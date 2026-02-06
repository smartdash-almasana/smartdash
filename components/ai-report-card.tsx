"use client";

import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface AiReportCardProps {
  evaluation: string;
  className?: string;
}

export function AiReportCard({ evaluation, className }: AiReportCardProps) {
  return (
    <div className={cn("bg-slate-50/80 rounded-2xl p-6 text-left border border-slate-100 w-full relative group hover:bg-slate-100 transition-colors", className)}>
      <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 rounded-l-2xl" />
      <h3 className="text-sm font-black text-slate-900 mb-2 flex items-center gap-2">
        <ShieldAlert size={16} className="text-orange-500" />
        Hallazgos Clave
      </h3>
      <p className="text-slate-600 font-medium leading-relaxed text-sm">
        "{evaluation}"
      </p>
    </div>
  );
}
