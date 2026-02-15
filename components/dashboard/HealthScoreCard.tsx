import React from 'react';
import { HealthScore } from '@/lib/dashboard/mock';

export const HealthScoreCard: React.FC<{ data: HealthScore }> = ({ data }) => {
    return (
        <section className="relative pt-6 flex flex-col items-center">
            <div className="relative w-56 h-56 flex items-center justify-center">
                {/* Progress Background */}
                <div
                    className="absolute inset-0 rounded-full opacity-20"
                    style={{
                        background: `conic-gradient(#10B981 ${data.score}%, #1e293b 0)`
                    }}
                />
                {/* Inner Card */}
                <div className="absolute inset-4 rounded-full bg-background-light dark:bg-[#0A0F1D] flex flex-col items-center justify-center border-4 border-[#10B981] shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all duration-700">
                    <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-[0.2em] mb-1">Immunity</span>
                    <span className="text-6xl font-black text-slate-900 dark:text-white">{data.score}</span>
                    <span className="text-sm font-medium text-slate-500 mt-1">{data.label}</span>
                </div>
            </div>
            <div className="mt-8 text-center px-4">
                <h2 className="text-2xl font-bold tracking-tight">Clinical Diagnosis</h2>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">{data.description}</p>
            </div>

            <div className="mt-10 w-full space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Top Risk Drivers</h3>
                <div className="grid grid-cols-3 gap-3">
                    {data.drivers.map((driver) => (
                        <div key={driver.key} className="p-4 rounded-2xl bg-white dark:bg-[#161D2F] border border-slate-100 dark:border-white/5 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow">
                            <span className={`material-icons-round mb-2 ${driver.severity === 'critical' ? 'text-[#EF4444]' :
                                    driver.severity === 'warning' ? 'text-[#F59E0B]' : 'text-[#3B82F6]'
                                }`}>
                                {driver.key === 'SLA' ? 'speed' : driver.key === 'BACKLOG' ? 'hourglass_empty' : 'trending_up'}
                            </span>
                            <span className="text-[10px] font-bold uppercase text-slate-400 mb-1">{driver.label}</span>
                            <span className="text-sm font-bold truncate w-full text-center">{driver.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
