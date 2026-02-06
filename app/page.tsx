import { DashboardHeader } from "@/components/dashboard-header";
import { CaseSelector } from "@/components/case-selector";
import { DashboardContent } from "@/components/dashboard-content";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getScenariosFromDB, getDashboardData, getHistoryFromDB } from "@/lib/actions";
import { RUBRO_TO_SEGMENT } from "@/lib/constants";

export const dynamic = 'force-dynamic';

export default async function Page(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams;
  const rubro = searchParams.rubro;
  const scenarioId = searchParams.scenario;

  // Mapeo de rubro (URL) a segmento (DB) para la Fuente de la Verdad
  const segment = rubro ? (RUBRO_TO_SEGMENT[rubro] || rubro) : null;

  // LAYOUT BASE
  const Header = (
    <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm border-slate-100">
      <DashboardHeader />
    </header>
  );

  // PANTALLA 1: Hero de Bienvenida
  // URL: / → Solo hero con CTA hacia /demo
  if (!rubro || !segment) {
    const { HeroWelcome } = await import("@/components/hero-welcome");
    return <HeroWelcome />;
  }

  // PANTALLA 2: Selección de Escenario
  if (rubro && !scenarioId) {
    const scenarios = await getScenariosFromDB(segment);
    return (
      <div className="min-h-screen bg-[#FDFDFF]">
        {Header}
        <div className="max-w-6xl mx-auto px-6 pt-12 animate-in fade-in slide-in-from-left-4 duration-700">
          <Link href="/" className="inline-flex items-center text-xs font-black text-slate-400 hover:text-orange-600 transition-all uppercase tracking-widest group">
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Volver a Segmentos
          </Link>
        </div>
        <CaseSelector currentRubro={rubro} scenarios={scenarios} />
      </div>
    );
  }

  // PANTALLA 3: Dashboard Detallado
  const [data, history] = await Promise.all([
    getDashboardData(scenarioId!),
    getHistoryFromDB(segment)
  ]);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#FDFDFF]">
        {Header}
        <div className="flex flex-col items-center justify-center p-20 text-center min-h-[60vh]">
          <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6 text-slate-300">
            <ArrowLeft size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Escenario no encontrado</h2>
          <p className="text-slate-500 mt-2 mb-8 font-medium">El registro solicitado no existe en la Fuente de la Verdad.</p>
          <Link href={`/?rubro=${rubro}`} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl">
            Volver a Escenarios
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFF] flex flex-col font-sans selection:bg-orange-100 selection:text-orange-900">
      {Header}
      <DashboardContent data={data} history={history} rubro={rubro} />
    </div>
  );
}