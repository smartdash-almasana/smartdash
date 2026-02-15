import React from 'react';
import { ClinicalEvent } from '@/lib/dashboard/mock';

export const ClinicalTimeline: React.FC<{ events: ClinicalEvent[] }> = ({ events }) => {
    return (
        <div className="relative">
            {/* Background Line */}
            <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-slate-200 dark:bg-slate-700 z-0" />

            <div className="space-y-10 relative z-10">
                {events.map((event) => (
                    <div key={event.id} className="relative pl-14 group">
                        {/* Timeline Icon Node */}
                        <div className="absolute left-0 top-1 w-12 flex justify-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-background-light dark:bg-[#0A0F1D] dark:border-[#0A0F1D] shadow-sm transition-transform group-hover:scale-110 ${event.severity === 'critical' ? 'bg-red-100 text-red-600' :
                                    event.severity === 'warning' ? 'bg-amber-100 text-amber-600' :
                                        'bg-emerald-100 text-emerald-600'
                                }`}>
                                <span className="material-icons-round text-xl">{event.icon}</span>
                            </div>
                        </div>

                        {/* Event Content card */}
                        <div className={`bg-white dark:bg-[#161D2F] rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-white/5 transition-all duration-300 group-hover:shadow-md ${event.severity === 'critical' ? 'opacity-100' : 'opacity-90'
                            }`}>
                            <div className="flex justify-between items-start mb-3">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${event.severity === 'critical' ? 'bg-red-50 dark:bg-red-900/20 text-red-600' :
                                        event.severity === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' :
                                            'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
                                    }`}>
                                    {event.severity === 'critical' ? 'Prioridad Alta' : event.severity === 'warning' ? 'Advertencia' : 'Estable'}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 font-mono">{event.timestamp}</span>
                            </div>

                            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-2 leading-snug italic">
                                {event.title}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                                {event.description}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-white/5">
                                <span className="text-[10px] bg-slate-100 dark:bg-[#0A0F1D] px-2 py-1 rounded font-bold text-slate-500 uppercase">
                                    {event.category}
                                </span>
                                <button className={`text-[10px] font-black tracking-widest uppercase flex items-center gap-1 transition-colors ${event.severity === 'critical' ? 'text-[#FF5733] hover:text-[#E44D26]' : 'text-slate-400'
                                    }`}>
                                    {event.severity === 'critical' ? 'Ver Tratamiento' : 'Detalles'}
                                    <span className="material-icons-round text-sm">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Date Divider Placeholder */}
                <div className="relative py-10 flex items-center justify-center">
                    <div className="absolute left-0 right-0 h-px bg-slate-200 dark:bg-slate-800" />
                    <span className="relative px-6 bg-background-light dark:bg-[#0A0F1D] text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                        Octubre 14, 2023
                    </span>
                </div>
            </div>
        </div>
    );
};
