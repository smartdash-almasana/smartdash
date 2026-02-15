import React from 'react';
import { Signal } from '@/lib/dashboard/mock';

export const SignalsGrid: React.FC<{ signals: Signal[] }> = ({ signals }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {signals.map((signal) => (
                <div
                    key={signal.id}
                    className={`bg-white dark:bg-[#161D2F] border rounded-2xl p-5 relative overflow-hidden group shadow-sm transition-all duration-300 ${signal.severity === 'high' ? 'border-red-100 dark:border-red-900/30' :
                            signal.severity === 'medium' ? 'border-amber-100 dark:border-amber-900/30' :
                                'border-slate-100 dark:border-white/5'
                        }`}
                >
                    {signal.severity === 'high' && (
                        <div className="absolute top-0 right-0 p-4">
                            <span className="flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                            </span>
                        </div>
                    )}

                    <div className="flex items-start gap-4 mb-5">
                        <div className={`p-2.5 rounded-xl ${signal.severity === 'high' ? 'bg-red-50 dark:bg-red-900/20 text-red-600' :
                                signal.severity === 'medium' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' :
                                    'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                            }`}>
                            <span className="material-icons-round">{signal.icon}</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white tracking-tight">{signal.title}</h3>
                            <div className="flex items-center gap-2 mt-1.5 text-[10px] font-bold uppercase tracking-wider">
                                <span className={`px-2 py-0.5 rounded ${signal.severity === 'high' ? 'bg-red-100 dark:bg-red-900/40 text-red-700' :
                                        signal.severity === 'medium' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700' :
                                            'bg-blue-100 dark:bg-blue-900/40 text-blue-700'
                                    }`}>
                                    {signal.severity === 'preventive' ? 'Preventivo' : signal.severity}
                                </span>
                                <span className="text-slate-400">• {signal.status}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <span className="text-xs text-slate-500 font-medium">Probabilidad de Daño</span>
                            <span className={`text-lg font-black ${signal.probability > 70 ? 'text-red-500' :
                                    signal.probability > 30 ? 'text-amber-500' : 'text-blue-500'
                                }`}>{signal.probability}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-[#0A0F1D] rounded-full h-2 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${signal.probability > 70 ? 'bg-red-500' :
                                        signal.probability > 30 ? 'bg-amber-500' : 'bg-blue-500'
                                    }`}
                                style={{ width: `${signal.probability}%` }}
                            />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                            {signal.description}
                        </p>
                    </div>

                    <button className={`w-full mt-5 py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all ${signal.severity === 'high'
                            ? 'bg-[#113E87] text-white shadow-lg shadow-blue-900/20'
                            : 'bg-slate-50 dark:bg-[#0A0F1D] text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-white/5'
                        }`}>
                        {signal.severity === 'high' ? 'Intervenir Ahora' : 'Ver Detalles'}
                    </button>
                </div>
            ))}
        </div>
    );
};
