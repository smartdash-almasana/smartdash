"use client";

import Link from "next/link";
import { ArrowRight, Shield, Eye, Zap, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// PANTALLA 1: HERO DE BIENVENIDA
// URL: /
// Objetivo: Experiencia inmersiva para ver, entender y actuar sobre riesgos
// ============================================================================

export function HeroWelcome() {
    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0">
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

                {/* Gradient Orbs */}
                <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-orange-500/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-800/50 rounded-full blur-[150px]" />
            </div>

            {/* Content */}
            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Header */}
                <header className="w-full py-6 px-8">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                                <Shield size={20} className="text-white" />
                            </div>
                            <span className="text-xl font-black tracking-tight">
                                SmartDash <span className="text-orange-500">FV</span>
                            </span>
                        </div>

                        <nav className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors font-medium">
                                Características
                            </a>
                            <a href="#demo" className="text-sm text-slate-400 hover:text-white transition-colors font-medium">
                                Demo
                            </a>
                        </nav>
                    </div>
                </header>

                {/* Hero Content */}
                <main className="flex-1 flex items-center justify-center px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-orange-400 text-xs font-bold uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <Eye size={14} />
                            Motor de Detección de Riesgos
                        </div>

                        {/* Main Title */}
                        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                            Bienvenido a{" "}
                            <span className="bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600 bg-clip-text text-transparent">
                                SmartDash FV
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-xl md:text-2xl text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                            Aquí podrás{" "}
                            <span className="text-white font-bold">ver tus riesgos</span>,{" "}
                            <span className="text-white font-bold">conocer sus causas</span> y{" "}
                            <span className="text-orange-400 font-bold">actuar antes de perder dinero</span>.
                        </p>

                        {/* CTA Button */}
                        <div className="animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                            <Link
                                href="/demo"
                                className={cn(
                                    "inline-flex items-center gap-3 px-8 py-5 rounded-2xl",
                                    "bg-gradient-to-r from-orange-500 to-amber-600",
                                    "text-white text-lg font-black uppercase tracking-wider",
                                    "shadow-2xl shadow-orange-500/30",
                                    "hover:shadow-orange-500/50 hover:scale-105",
                                    "transition-all duration-300 group"
                                )}
                            >
                                Ir al Demo
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </main>

                {/* Features Cards */}
                <section id="features" className="w-full py-16 px-6">
                    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Feature 1 */}
                        <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
                                <Eye size={24} className="text-emerald-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Ver</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Visualiza todos tus riesgos en tiempo real, organizados por segmento y prioridad.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                                <Zap size={24} className="text-blue-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Entender</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Conoce las causas de cada riesgo con análisis detallado y señales claras.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-700">
                            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center mb-4">
                                <TrendingDown size={24} className="text-orange-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Actuar</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Toma decisiones informadas y mitiga riesgos antes de perder dinero.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="w-full py-6 px-8 border-t border-white/5">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <p className="text-xs text-slate-500 font-medium">
                            SmartDash FV &bull; Fuente de la Verdad
                        </p>
                        <p className="text-xs text-slate-600">
                            Protocolo de Auditoría v1.0
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
}

export default HeroWelcome;
