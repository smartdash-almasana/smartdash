// app/(marketing)/page.tsx completo y corregido
"use client";

import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, CheckCircle2, Zap, 
  MessageCircle, TrendingUp, Lock, Terminal, ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- MENU PROVISORIO (Mantenemos tu acceso rápido) ---
const DevNav = () => (
  <div className="fixed bottom-4 left-4 z-[100] flex flex-col gap-2 p-3 bg-slate-900/90 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700 text-white animate-in slide-in-from-bottom-5">
    <div className="flex items-center gap-2 pb-2 border-b border-slate-700 mb-1">
      <Terminal className="w-4 h-4 text-orange-500" />
      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Dev Links</span>
    </div>
    <Link href="/" className="text-xs hover:text-orange-400 transition-colors px-2 py-1">🏠 Landing</Link>
    <Link href="/demo/casos/12bbe369-cea2-45d9-882f-ce09578fd204" className="text-xs hover:text-green-400 transition-colors px-2 py-1">🚀 Caso: FinTech Pro</Link>
  </div>
);

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <DevNav />

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-orange-200">SD</div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">SmartDash</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors">Soluciones</Link>
            <Link href="#pricing" className="text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors">Precios</Link>
            <Link href="/demo" className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-all">Prueba Gratis</Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION PRO --- */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 bg-[#FDFDFF]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          {/* Badge de Alerta Realista */}
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 px-4 py-1.5 rounded-full text-orange-700 text-xs font-bold mb-8 shadow-sm">
            <ShieldAlert size={14} className="animate-pulse" />
            <span>SmartDash IA: Detectado Riesgo Crítico en FinTech Pro (USD 382.5K)</span> 
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1]">
            Tu negocio te avisa <span className="text-orange-600">antes de perder dinero.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 mb-12 leading-relaxed">
            No pierdas tiempo en dashboards estáticos. Recibe alertas dinámicas y planes de mitigación accionables directamente en tu WhatsApp.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-24">
            <Link href="/demo" className="w-full sm:w-auto px-10 py-4 bg-orange-600 text-white rounded-full font-bold text-lg hover:bg-orange-700 hover:shadow-xl hover:shadow-orange-200 transition-all flex items-center justify-center gap-2">
              Comenzar ahora <ArrowRight size={20} />
            </Link>
            <button className="w-full sm:w-auto px-10 py-4 bg-white border border-slate-200 text-slate-700 rounded-full font-bold text-lg hover:bg-slate-50 transition-all">
              Ver Demo Interactiva
            </button>
          </div>

          {/* Mockup del Dashboard con la sombra "Pro" */}
          <div className="relative max-w-5xl mx-auto rounded-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] border border-slate-200 overflow-hidden bg-white">
            <div className="h-10 bg-slate-50 border-b border-slate-100 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
              </div>
              <div className="mx-auto bg-white border border-slate-200 rounded px-20 py-0.5 text-[10px] text-slate-400">
                smartdash.ia/dashboard/fintech-pro
              </div>
            </div>
            {/* Espacio para la imagen del dashboard que subiste */}
            <div className="aspect-video bg-slate-50 flex items-center justify-center text-slate-400 font-medium italic">
              Dashboard: FinTech Pro - Riesgo Crítico detectado 
            </div>
          </div>
        </div>
      </section>

      {/* --- VALUE PROPS (Versión Clean) --- */}
      <section id="features" className="py-24 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600"><Zap /></div>
            <h3 className="text-xl font-bold text-slate-900 leading-tight">Acción Directa vía WhatsApp</h3>
            <p className="text-slate-500 leading-relaxed">Respondé al chat para ejecutar planes de mitigación. Olvidate de los mails ignorados.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600"><TrendingUp /></div>
            <h3 className="text-xl font-bold text-slate-900 leading-tight">Impacto Proyectado en USD</h3> 
            <p className="text-slate-500 leading-relaxed">Sabé exactamente cuánto dinero hay en juego antes de que impacte en tu balance.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600"><Lock /></div>
            <h3 className="text-xl font-bold text-slate-900 leading-tight">Seguridad de Grado Bancario</h3>
            <p className="text-slate-500 leading-relaxed">Encriptación total. Solo leemos las métricas que necesitás proteger.</p>
          </div>
        </div>
      </section>
    </div>
  );
}