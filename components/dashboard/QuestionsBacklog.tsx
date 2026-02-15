import React from 'react';
import { Question } from '@/lib/dashboard/mock';

export const QuestionsBacklog: React.FC<{ questions: Question[] }> = ({ questions }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-white dark:bg-[#161D2F] p-4 rounded-xl shadow-sm border border-slate-100 dark:border-white/5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Abiertas</span>
                    <span className="text-2xl font-black">24</span>
                </div>
                <div className="bg-white dark:bg-[#161D2F] p-4 rounded-xl shadow-sm border border-slate-100 dark:border-white/5">
                    <span className="text-[10px] uppercase font-bold text-red-500 block mb-1">Vencidas</span>
                    <span className="text-2xl font-black text-red-500">8</span>
                </div>
                <div className="bg-white dark:bg-[#161D2F] p-4 rounded-xl shadow-sm border border-slate-100 dark:border-white/5">
                    <span className="text-[10px] uppercase font-bold text-[#FF5733] block mb-1">Backlog</span>
                    <span className="text-2xl font-black">42</span>
                </div>
            </div>

            <section className="bg-white dark:bg-[#161D2F] rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
                <div className="p-4 border-b border-slate-50 dark:border-white/5 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 dark:text-slate-200">Alertas de Atención</h3>
                    <span className="text-[10px] text-[#FF5733] font-black uppercase tracking-tighter">Prioridad Crítica</span>
                </div>
                <div className="divide-y divide-slate-50 dark:divide-white/5">
                    {questions.map((q) => (
                        <div key={q.id} className="p-4 space-y-4 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-3">
                                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${q.status === 'overdue' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                                            q.status === 'pending' ? 'bg-yellow-400' : 'bg-green-500'
                                        }`} />
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">{q.text}</p>
                                        <p className="text-xs text-slate-400 mt-1 font-mono tracking-tight">{q.publication}</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded ${q.status === 'overdue' ? 'bg-red-50 dark:bg-red-900/20 text-red-600' :
                                        q.status === 'pending' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600' :
                                            'bg-green-50 dark:bg-green-900/20 text-green-600'
                                    }`}>
                                    {q.time}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    Impacto: <span className={q.status === 'overdue' ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'}>{q.risk}</span>
                                </span>
                                <button className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${q.status === 'overdue' ? 'bg-[#FF5733] text-white shadow-lg shadow-orange-500/20' : 'bg-slate-100 dark:bg-[#0A0F1D] text-slate-600 dark:text-slate-300'
                                    }`}>
                                    {q.status === 'overdue' ? 'Responder Ahora' : 'Gestionar'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Analytics Visualization Placeholder */}
            <section className="bg-[#103778] text-white rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-wider">Backlog Heat Map</h3>
                            <p className="text-[10px] text-blue-200 mt-1">Acumulación de preguntas por hora</p>
                        </div>
                        <div className="bg-white/10 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                            <span className="material-icons-round text-xs">trending_up</span>
                            <span>+15% ayer</span>
                        </div>
                    </div>
                    <div className="flex items-end justify-between h-20 gap-1 mt-8">
                        {[25, 45, 65, 100, 75, 50, 30, 20, 25, 40].map((h, i) => (
                            <div
                                key={i}
                                className={`w-full rounded-t-sm transition-all duration-1000 delay-${i * 100} ${h === 100 ? 'bg-[#FF5733]' : 'bg-white/20'}`}
                                style={{ height: `${h}%` }}
                            >
                                {h === 100 && <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold">PEAK</div>}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-3 text-[8px] font-bold text-blue-300 tracking-[0.2em]">
                        <span>08:00</span>
                        <span>12:00</span>
                        <span>16:00</span>
                        <span>20:00</span>
                        <span>00:00</span>
                    </div>
                </div>
            </section>
        </div>
    );
};
