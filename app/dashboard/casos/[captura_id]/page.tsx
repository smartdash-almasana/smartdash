import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/server/supabase";
import { cn } from "@/lib/utils";
import { CaseSelectorHeader } from "@/components/case-selector-header";
import { WhatsappChat } from "@/components/whatsapp-chat";
import {
  AlertTriangle,
  Star,
  TrendingDown,
  Clock,
  Fuel,
  DollarSign,
  Target,
  Lightbulb,
  AlertCircle,
  TrendingUp,
  Zap,
  Shield,
} from "lucide-react";

// ---------------- TIPOS Y HELPERS ----------------
type NivelRiesgo = "Bajo" | "Medio" | "Alto" | "Crítico";

function isNivelRiesgo(value: unknown): value is NivelRiesgo {
  return ["Bajo", "Medio", "Alto", "Crítico"].includes(value as string);
}

// Función para obtener color dinámico basado en el score (0-100)
function getScoreBasedGradient(score: number) {
  if (score >= 85) {
    // Crítico
    return {
      gradient: "from-red-600 via-red-700 to-red-900",
      headerBg: "bg-gradient-to-br from-red-600/95 via-red-700/95 to-red-900/95",
      accentColor: "rgb(220, 38, 38)",
      glowColor: "rgba(220, 38, 38, 0.4)",
    };
  } else if (score >= 65) {
    // Alto
    return {
      gradient: "from-orange-500 via-orange-600 to-orange-800",
      headerBg: "bg-gradient-to-br from-orange-500/95 via-orange-600/95 to-orange-800/95",
      accentColor: "rgb(249, 115, 22)",
      glowColor: "rgba(249, 115, 22, 0.4)",
    };
  } else if (score >= 40) {
    // Medio
    return {
      gradient: "from-amber-400 via-amber-500 to-amber-700",
      headerBg: "bg-gradient-to-br from-amber-400/95 via-amber-500/95 to-amber-700/95",
      accentColor: "rgb(245, 158, 11)",
      glowColor: "rgba(245, 158, 11, 0.4)",
    };
  } else {
    // Bajo
    return {
      gradient: "from-emerald-500 via-emerald-600 to-emerald-700",
      headerBg: "bg-gradient-to-br from-emerald-500/95 via-emerald-600/95 to-emerald-700/95",
      accentColor: "rgb(16, 185, 129)",
      glowColor: "rgba(16, 185, 129, 0.4)",
    };
  }
}

export function getRiskStyles(nivel: NivelRiesgo) {
  switch (nivel) {
    case "Crítico":
      return {
        gradient: "from-red-600 to-red-800",
        lightBg: "bg-red-50",
        lightText: "text-red-900",
        border: "border-red-600",
        ring: "ring-red-500/20",
        iconBg: "bg-red-100",
        iconText: "text-red-600",
      };
    case "Alto":
      return {
        gradient: "from-orange-500 to-orange-700",
        lightBg: "bg-orange-50",
        lightText: "text-orange-900",
        border: "border-orange-500",
        ring: "ring-orange-500/20",
        iconBg: "bg-orange-100",
        iconText: "text-orange-600",
      };
    case "Medio":
      return {
        gradient: "from-amber-400 to-amber-600",
        lightBg: "bg-amber-50",
        lightText: "text-amber-900",
        border: "border-amber-500",
        ring: "ring-amber-500/20",
        iconBg: "bg-amber-100",
        iconText: "text-amber-600",
      };
    default:
      return {
        gradient: "from-emerald-500 to-emerald-700",
        lightBg: "bg-emerald-50",
        lightText: "text-emerald-900",
        border: "border-emerald-500",
        ring: "ring-emerald-500/20",
        iconBg: "bg-emerald-100",
        iconText: "text-emerald-600",
      };
  }
}

const formatCurrency = (value: number, moneda: string = "USD") =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: moneda,
    minimumFractionDigits: 0,
  }).format(value);

const formatDate = (dateStr?: string) =>
  dateStr
    ? new Date(dateStr).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";

// ---------------- UI COMPONENTS ----------------
const ScoreMeter = ({ score }: { score: number }) => {
  const percentage = Math.min(100, Math.max(0, score));
  const scoreColors = getScoreBasedGradient(score);
  
  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-white/90 uppercase tracking-wider">
          Nivel de Riesgo
        </span>
        <span className="text-2xl font-black text-white">
          {score}<span className="text-lg text-white/70">/100</span>
        </span>
      </div>
      <div className="relative h-3 bg-black/30 rounded-full overflow-hidden backdrop-blur-sm">
        <div
          className="h-full bg-white transition-all duration-1000 ease-out relative"
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white animate-pulse" />
        </div>
      </div>
    </div>
  );
};

const UrgencyIndicator = ({ nivel }: { nivel: NivelRiesgo }) => {
  const urgencyConfig = {
    Crítico: { 
      icon: Zap, 
      text: "ACCIÓN INMEDIATA REQUERIDA",
      pulse: true,
      bg: "bg-white/20"
    },
    Alto: { 
      icon: AlertTriangle, 
      text: "REQUIERE ATENCIÓN URGENTE",
      pulse: true,
      bg: "bg-white/15"
    },
    Medio: { 
      icon: AlertCircle, 
      text: "MONITOREO ACTIVO NECESARIO",
      pulse: false,
      bg: "bg-white/10"
    },
    Bajo: { 
      icon: Shield, 
      text: "SITUACIÓN BAJO CONTROL",
      pulse: false,
      bg: "bg-white/10"
    },
  };

  const config = urgencyConfig[nivel];
  const Icon = config.icon;

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl border border-white/30",
      config.bg,
      "backdrop-blur-md"
    )}>
      <div className="relative">
        <Icon className="w-5 h-5 text-white" />
        {config.pulse && (
          <span className="absolute inset-0 animate-ping">
            <Icon className="w-5 h-5 text-white" />
          </span>
        )}
      </div>
      <span className="text-xs font-black text-white uppercase tracking-widest">
        {config.text}
      </span>
    </div>
  );
};

// ---------------- MAIN PAGE ----------------
export default async function CasoPage({
  params,
}: {
  params: Promise<{ captura_id: string }>;
}) {
  const { captura_id } = await params;

  const { data: caso, error } = await supabaseServer
    .from("vista_dashboard_riesgos_api")
    .select("*")
    .eq("captura_id", captura_id)
    .maybeSingle();

  if (error || !caso) notFound();

  const { data: todosLosCasosRaw } = await supabaseServer
    .from("vista_dashboard_riesgos_api")
    .select("captura_id, escenario, nivel_riesgo, puntaje_global")
    .eq("cliente_id", caso.cliente_id);

  const todosLosCasos = (todosLosCasosRaw || [])
    .filter((c: any) => c?.captura_id && c?.escenario)
    .map((c: any) => ({
      captura_id: c.captura_id,
      escenario: c.escenario,
      nivel_riesgo: c.nivel_riesgo || "Medio",
      puntaje_global: c.puntaje_global ?? 0,
    }));

  const nivel = isNivelRiesgo(caso.nivel_riesgo)
    ? caso.nivel_riesgo
    : "Medio";

  const riskStyles = getRiskStyles(nivel);
  const scoreColors = getScoreBasedGradient(caso.puntaje_global ?? 50);

  const signals = caso.signals || {};
  const financial = caso.financial_context || {};
  const montoFormateado = formatCurrency(
    financial.monto || caso.monto_en_riesgo || 0,
    financial.moneda || "USD"
  );

  const recomendacionPasos = caso.recomendacion
    ? caso.recomendacion.split(/\.\s+/).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      <div className="max-w-7xl mx-auto">
        <CaseSelectorHeader
          casos={todosLosCasos}
          currentCaso={{
            captura_id,
            escenario: caso.escenario,
            nivel_riesgo: nivel,
            puntaje_global: caso.puntaje_global ?? 0,
          }}
          clienteNombre={caso.nombre_cliente}
          clienteLogo={caso.logo_url || "/placeholder-logo.png"}
        />

        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          
          
          
          {/* HERO DE RIESGO - HEADER DINÁMICO */}
          <div
            className="relative overflow-hidden rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]"
            style={{
              boxShadow: `0 20px 60px -15px ${scoreColors.glowColor}`,
            }}
          >
            {/* Background con gradiente dinámico */}
            <div 
              className={cn(
                "absolute inset-0",
                scoreColors.headerBg
              )}
            />
            
            {/* Patrón de fondo */}
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, white 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            {/* Contenido */}
            <div className="relative z-10 p-6 sm:p-8 lg:p-10">
              {/* Cliente y Logo */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/95 p-1.5 shadow-xl ring-1 ring-black/5">
                  <img
                    src={caso.logo_url}
                    alt="Logo"
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-2 leading-tight">
                    {caso.nombre_cliente}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {[caso.segmento, caso.vertical].map((t: string) => (
                      <span
                        key={t}
                        className="text-[10px] sm:text-xs bg-white/20 text-white px-3 py-1.5 rounded-full font-bold uppercase tracking-wider backdrop-blur-sm border border-white/20"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Score Meter */}
              <div className="mb-6">
                <ScoreMeter score={caso.puntaje_global ?? 50} />
              </div>

              {/* Urgency Indicator */}
              <div className="mb-6">
                <UrgencyIndicator nivel={nivel} />
              </div>

              {/* Escenario en Card */}
              <div className="bg-black/25 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-white/20 shadow-xl">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-xl text-slate-900 shadow-md">
                    <Fuel className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                      {caso.escenario}
                    </h3>
                    <p className="text-white/90 text-sm sm:text-base leading-relaxed">
                      {caso.descripcion_base}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* GRID DE CONTENIDO */}
          <div className="grid lg:grid-cols-[1fr_340px] gap-6 lg:gap-8 items-start pb-20">
            
            {/* COLUMNA PRINCIPAL */}
            <div className="space-y-6">
              
              {/* QUÉ PASA SI NO ACTÚO - DESTACADO */}
              <div
                className={cn(
                  "rounded-2xl p-6 sm:p-8 border-2 shadow-lg relative overflow-hidden",
                  riskStyles.lightBg,
                  riskStyles.border
                )}
              >
                {/* Patrón de alerta sutil */}
                <div 
                  className="absolute top-0 right-0 w-32 h-32 opacity-5"
                  style={{
                    backgroundImage: `repeating-linear-gradient(45deg, ${scoreColors.accentColor} 0, ${scoreColors.accentColor} 2px, transparent 0, transparent 10px)`,
                  }}
                />
                
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn(
                      "p-2.5 rounded-xl shadow-md",
                      riskStyles.iconBg
                    )}>
                      <DollarSign className={cn("w-6 h-6", riskStyles.iconText)} />
                    </div>
                    <div>
                      <h3 className={cn(
                        "font-black text-xs uppercase tracking-wider mb-1",
                        riskStyles.lightText
                      )}>
                        Impacto si no se actúa
                      </h3>
                      <p className="text-[10px] text-slate-600 font-medium">
                        Pérdida proyectada de recursos
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-baseline gap-2 mb-3">
                    <p className={cn(
                      "text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight",
                      riskStyles.lightText
                    )}>
                      {montoFormateado}
                    </p>
                    <TrendingDown className={cn("w-6 h-6 mb-2", riskStyles.iconText)} />
                  </div>
                  
                  <div className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold",
                    riskStyles.iconBg,
                    riskStyles.iconText
                  )}>
                    <AlertCircle className="w-4 h-4" />
                    <span>{financial.etiqueta || "Proyección de pérdida"}</span>
                  </div>
                </div>
              </div>

              {/* SEÑAL PRINCIPAL */}
              {signals.detalle && (
                <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-slate-200">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-3 rounded-xl shadow-sm",
                      riskStyles.iconBg
                    )}>
                      <AlertTriangle className={cn("w-6 h-6", riskStyles.iconText)} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">
                        Señal Principal Detectada
                      </h3>
                      <p className="text-lg font-bold text-slate-900 mb-3">
                        {signals.detalle}
                      </p>
                      {signals.indicadores && signals.indicadores.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                            Indicadores Críticos:
                          </p>
                          {signals.indicadores.map((ind: string, i: number) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                            >
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                nivel === "Crítico" ? "bg-red-500 animate-pulse" : "bg-amber-500"
                              )} />
                              <span className="text-sm font-medium text-slate-700">
                                {ind}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* PLAN DE ACCIÓN */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-200">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
                  <div className="p-2.5 rounded-xl bg-amber-100 shadow-sm">
                    <Lightbulb className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                      Plan de Acción Recomendado
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Pasos para mitigar el riesgo
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  {recomendacionPasos.map((paso: string, i: number) => (
                    <div key={i} className="flex gap-4 group">
                      <div className="flex-shrink-0">
                        <div className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black border-2 transition-all",
                          i === 0 
                            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-600 shadow-md" 
                            : "bg-slate-100 text-slate-500 border-slate-200 group-hover:border-slate-300"
                        )}>
                          {i + 1}
                        </div>
                      </div>
                      <div className="flex-1 pt-1">
                        <p className={cn(
                          "text-sm leading-relaxed",
                          i === 0 ? "text-slate-900 font-semibold" : "text-slate-600"
                        )}>
                          {paso}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-semibold text-slate-700">
                      Estado de Acción:
                    </span>
                  </div>
                  <span
                    className={cn(
                      "px-4 py-2 rounded-full text-xs font-bold shadow-sm",
                      caso.estado_accion === "Pendiente"
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-blue-100 text-blue-800 border border-blue-200"
                    )}
                  >
                    {caso.estado_accion || "En Proceso"}
                  </span>
                </div>
              </div>
            </div>

            {/* CHAT STICKY */}
            <div className="lg:sticky lg:top-24 z-40">
              <WhatsappChat
                capturaId={captura_id}
                className="w-full h-[600px] sm:h-[650px] shadow-2xl rounded-3xl border-2 border-emerald-100 ring-4 ring-emerald-50/50"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
