import React from 'react';
import { Telemetry } from '@/lib/dashboard/mock';

export const TelemetryPanel: React.FC<{ data: Telemetry }> = ({ data }) => {
    return (
        <div className="space-y-8 pb-10">
            <section className="bg-[#061d41] dark:bg-black text-white px-6 py-12 rounded-3xl overflow-hidden relative shadow-2xl">
                {/* Animated telemetery pulse */}
                <div className="absolute top-6 left-6 flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
                    <span className="text-[10px] font-black uppercase tracking-wider opacity-90">Live Telemetry Active</span>
                </div>

                <h1 className="text-3xl font-black leading-tight mt-10 mb-4 tracking-tight">
                    Transparencia total en tu <span className="text-[#ff5a36]">Salud Operativa</span>
                </h1>
                <p className="text-blue-200/80 text-sm leading-relaxed mb-10">
                    El sistema inmune de SmartDash monitorea cada interacción. No es magia, es una auditoría determinística constante.
                </p>

                <div className="relative flex flex-col items-center justify-center py-6">
                    <div className="w-52 h-52 rounded-full border-[10px] border-slate-800 flex items-center justify-center relative shadow-inner">
                        <div
                            className="absolute inset-0 rounded-full border-[10px] border-[#ff5a36] border-t-transparent -rotate-45"
                            style={{ strokeDashoffset: 100 }}
                        />
                        <div className="text-center">
                            <span className="font-mono text-5xl font-black tracking-tighter">{data.score}</span>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mt-2 font-black">Immune Score</p>
                        </div>
                    </div>
                    <div className="absolute -bottom-2 bg-white text-[#061d41] px-4 py-2 rounded-xl flex items-center gap-2 shadow-2xl border border-white/20">
                        <span className="material-icons-round text-lg text-green-500">verified_user</span>
                        <span className="text-[10px] font-black uppercase tracking-tighter">Deterministic Audit</span>
                    </div>
                </div>
            </section>

            {/* Technical Data Card */}
            <section className="px-1 -mt-12 relative z-20">
                <div className="bg-white dark:bg-[#161D2F] rounded-3xl shadow-2xl p-6 border border-slate-100 dark:border-white/5">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Technical Data Sheet</h2>
                        <span className="material-icons-round text-slate-300">analytics</span>
                    </div>

                    <div className="space-y-8">
                        {[
                            { label: 'Half-life Hours', subTitle: 'Operational decay frequency', value: data.halfLife },
                            { label: 'Floor Factor', subTitle: 'Minimum safety threshold', value: data.floorFactor },
                            {
                                label: 'Penalties vs Positives',
                                subTitle: 'Raw impact ratio',
                                render: () => (
                                    <div className="flex flex-col items-end font-mono">
                                        <span className="text-lg font-black text-red-500">{data.penalties}</span>
                                        <span className="text-xs font-bold text-green-500 border-t border-slate-100 dark:border-white/10 mt-1 pt-1">{data.positives}</span>
                                    </div>
                                )
                            },
                            { label: 'Sync Latency', subTitle: 'Cloud to App bridge', value: data.syncLatency },
                        ].map((metric, idx) => (
                            <div key={idx} className="flex items-center justify-between group">
                                <div>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-[#ff5a36] transition-colors">{metric.label}</p>
                                    <p className="text-[10px] text-slate-400 mt-1 font-medium">{metric.subTitle}</p>
                                </div>
                                <div className="text-right">
                                    {metric.render ? metric.render() : (
                                        <span className="font-mono text-xl font-black text-[#0c3b84] dark:text-white">{metric.value}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-slate-50 dark:bg-[#161D2F]/50 rounded-2xl p-6 border border-slate-100 dark:border-white/5">
                <div className="flex items-start gap-4">
                    <div className="bg-[#0c3b84] text-white p-2.5 rounded-xl shadow-lg">
                        <span className="material-icons-round">psychology</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-[#061d41] dark:text-white mb-2 tracking-tight">Lógica de "Sistema Inmune"</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                            SmartDash no solo observa; detecta "patógenos" operativos (como quiebres de stock o demoras en envíos) antes de que afecten tu reputación. El algoritmo proyecta el impacto de cada error.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};
