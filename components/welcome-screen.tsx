"use client";

import { useState } from "react";
import { ClientesGrid } from "@/components/clientes-grid";
import { CasosGrid } from "@/components/casos-grid";
import type { ClienteCard, CasoTestigoCard } from "@/lib/types/welcome";
import { AlertCircle, ArrowRight, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ============================================================================
// PANTALLA DE BIENVENIDA (INTEGRADA 1A y 1B)
// ============================================================================

interface WelcomeScreenProps {
  initialClientes?: ClienteCard[];
  initialCasos?: CasoTestigoCard[];
  initialMode?: "clientes" | "casos";
  segmento?: string;
  serverError?: string;
}

/**
 * Componente principal de la Pantalla de Bienvenida.
 * Muestra dinámicamente el grid de Clientes (1A) o Casos Testigo (1B) según props.
 */
export function WelcomeScreen({
  initialClientes = [],
  initialCasos = [],
  initialMode = "clientes",
  segmento,
  serverError,
}: WelcomeScreenProps) {
  const [clientes] = useState<ClienteCard[]>(initialClientes);
  const [casos] = useState<CasoTestigoCard[]>(initialCasos);
  const [loading] = useState(false);
  const [error] = useState<string | null>(serverError || null);

  const isCasosMode = initialMode === "casos";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Header Adaptativo */}
      <header className="relative overflow-hidden bg-slate-900 text-white transition-all duration-500">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        <div className="relative max-w-7xl mx-auto px-6 py-16 text-center">
          {/* Navigation Bar */}
          <div className="absolute top-6 left-6 flex items-center gap-3 z-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-bold hover:bg-white/20 transition-all group"
            >
              <ArrowLeft
                size={14}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Inicio
            </Link>

            {isCasosMode && (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/90 backdrop-blur-sm border border-orange-400/20 text-white text-xs font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-900/20 animate-in fade-in slide-in-from-left-2"
              >
                <ArrowLeft size={14} />
                Volver a Clientes
              </Link>
            )}
          </div>

          {/* Dynamic Title */}
          <div className="mt-8 animate-in zoom-in-95 duration-500">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              <Shield size={14} className="text-orange-400" />
              {isCasosMode
                ? "Análisis de Segmento"
                : "Protocolo de Auditoría Activo"}
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none mb-6">
              {isCasosMode ? (
                <>
                  Casos Testigo:{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-200">
                    {segmento}
                  </span>
                </>
              ) : (
                <>
                  SmartDash <span className="text-orange-500">FV</span>
                </>
              )}
            </h1>

            <p className="max-w-2xl mx-auto text-lg text-slate-300 font-medium leading-relaxed">
              {isCasosMode ? (
                `Explora los escenarios de riesgo más críticos identificados para el segmento ${segmento}.`
              ) : (
                <>
                  Bienvenido al{" "}
                  <span className="text-white font-bold">
                    Motor de Detección de Riesgos
                  </span>
                  . Visualiza clientes activos en tiempo real.
                </>
              )}
            </p>
          </div>

          {/* Stats (Solo en modo clientes) */}
          {!isCasosMode && (
            <div className="mt-8">
              <div className="inline-block px-6 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-3xl font-black text-white leading-none">
                  {clientes.length}
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1">
                  Clientes
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-10 min-h-[500px]">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium flex items-center gap-3 animate-in fade-in">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Conditional Rendering */}
        {isCasosMode ? (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CasosGrid
              casos={casos}
              loading={loading}
              segmento={segmento || "Unknown"}
            />
          </section>
        ) : (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  Clientes Registrados
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Selecciona un cliente para ver sus casos testigo.
                </p>
              </div>
            </div>
            <ClientesGrid
              clientes={clientes}
              loading={loading}
              getHref={(cliente) => `/dashboard?segmento=${cliente.segmento}`}
            />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
          <p className="text-xs text-slate-400 font-medium">
            SmartDash FV &bull; Protocolo v1.0
          </p>
        </div>
      </footer>
    </div>
  );
}

export default WelcomeScreen;
