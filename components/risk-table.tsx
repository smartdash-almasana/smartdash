// components/risk-table.tsx
// Tabla de señales de riesgo con soporte para SignalCard normalizada
import { Badge } from "@/components/ui/badge";
import { getRiskToken } from "@/lib/ui/risk-tokens";
import type { NivelRiesgo } from "@/lib/domain/risk";
import type { SignalCard } from "@/lib/data/normalize-signals";
import { cn } from "@/lib/utils";

/**
 * Mapea peso numérico (1-10) a NivelRiesgo español
 */
function pesoToNivel(peso?: number): NivelRiesgo {
  if (!peso) return "Medio";
  if (peso >= 8) return "Crítico";
  if (peso >= 6) return "Alto";
  if (peso >= 4) return "Medio";
  return "Bajo";
}

interface RiskTableProps {
  signals: SignalCard[];
  className?: string;
}

export function RiskTable({ signals, className }: RiskTableProps) {
  // Manejo defensivo de datos incompletos
  const safeSignals = signals ?? [];

  if (safeSignals.length === 0) {
    return (
      <div className={cn("rounded-xl border border-slate-200 bg-slate-50 p-8 text-center", className)}>
        <p className="text-sm text-slate-500 italic font-medium">
          Sin señales de riesgo detectadas.
        </p>
      </div>
    );
  }

  // Ordenar señales por prioridad (peso descendente = más crítico primero)
  const sortedSignals = [...safeSignals].sort((a, b) => (b.peso ?? 0) - (a.peso ?? 0));

  return (
    <div className={cn("rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm", className)}>
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Nivel</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Señal</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Peso</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Indicadores</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sortedSignals.map((signal, idx) => {
            const nivel = pesoToNivel(signal.peso);
            const token = getRiskToken(nivel);

            return (
              <tr
                key={signal.id ?? idx}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                {/* Badge con token centralizado */}
                <td className="px-6 py-4">
                  <Badge
                    variant="outline"
                    className={cn(
                      "h-6 px-3 text-[10px] uppercase font-black tracking-widest",
                      token.bg,
                      token.text,
                      token.border
                    )}
                  >
                    {token.icon} {token.label}
                  </Badge>
                </td>

                {/* Título y descripción */}
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-slate-900">{signal.titulo || "—"}</div>
                  <p className="text-xs text-slate-500 mt-0.5 max-w-sm truncate">
                    {signal.descripcion || "Sin descripción"}
                  </p>
                </td>

                {/* Peso */}
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-black font-mono text-slate-900">
                    {signal.peso}/10
                  </span>
                </td>

                {/* Indicadores */}
                <td className="px-6 py-4">
                  {signal.indicadores && signal.indicadores.length > 0 ? (
                    <ul className="space-y-0.5">
                      {signal.indicadores.slice(0, 2).map((ind, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                          <span className="text-orange-400">•</span>
                          <span className="truncate max-w-[200px]">{ind}</span>
                        </li>
                      ))}
                      {signal.indicadores.length > 2 && (
                        <li className="text-[10px] text-slate-400 italic">
                          +{signal.indicadores.length - 2} más
                        </li>
                      )}
                    </ul>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Sin indicadores</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}