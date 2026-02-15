import { ClinicalTimeline } from '@/components/dashboard/ClinicalTimeline';
import { mockClinicalHistory, ClinicalEvent } from '@/lib/dashboard/mock';
import { listActiveSignals } from '@/lib/dashboard/data';

const SELLER_ID = '00000000-0000-0000-0000-000000000001';

async function getHistoryData(): Promise<ClinicalEvent[]> {
    const realData = await listActiveSignals(SELLER_ID);

    if (!realData || realData.length === 0) {
        return mockClinicalHistory;
    }

    // Map clinical events to timeline format
    return realData.slice(0, 10).map((event) => {
        const createdDate = new Date(event.detected_at);
        const now = new Date();
        const diffMs = now.getTime() - createdDate.getTime();
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffHours / 24);

        const timestamp = diffDays > 0 ? `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}` :
            diffHours > 0 ? `Hoy, hace ${diffHours}h` : 'Hoy, reciente';

        const evidenceStr = JSON.stringify(event.evidence);
        const description = evidenceStr.substring(0, 150).replace(/[{}"\[\]]/g, '') + '...';

        return {
            id: event.id,
            timestamp,
            title: `"${event.scenario_key.replace(/_/g, ' ')}"`,
            description,
            severity: event.severity === 'critical' ? 'critical' :
                event.severity === 'high' ? 'warning' : 'stable',
            icon: event.scenario_key.includes('sla') ? 'report_problem' :
                event.scenario_key.includes('stock') ? 'inventory_2' :
                    event.scenario_key.includes('reputation') ? 'trending_down' : 'verified',
            category: event.scenario_key.split('_')[0] || 'General',
        };
    });
}

export default async function HistoryPage() {
    const events = await getHistoryData();

    return (
        <div className="p-6 space-y-8 animate-in fade-in slide-in-from-left-5 duration-700">
            <section className="flex items-center justify-between">
                <h1 className="text-3xl font-black tracking-tight text-[#0F3470] dark:text-white">Historial Clínico</h1>
                <button className="p-3 bg-white dark:bg-[#161D2F] rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 text-slate-500 hover:text-[#FF5733] transition-colors">
                    <span className="material-icons-round">tune</span>
                </button>
            </section>

            {/* Summary Cards matching HTML */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-[#161D2F] p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Estado de Salud</span>
                    <div className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                        <span className="text-xl font-black text-[#0F3470] dark:text-white">Bajo Riesgo</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#161D2F] p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Eventos 24h</span>
                    <div className="flex items-center gap-3">
                        <span className="text-xl font-black text-[#0F3470] dark:text-white">{events.length} Alertas</span>
                        <span className="text-xs font-black text-red-500">+{Math.floor(events.length / 4)}</span>
                    </div>
                </div>
            </div>

            {/* Categories matching HTML */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {['Todos', 'Críticos', 'Logística', 'Reputación'].map((cat, i) => (
                    <button
                        key={cat}
                        className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${i === 0 ? 'bg-[#0F3470] text-white shadow-lg' : 'bg-white dark:bg-[#161D2F] border border-slate-100 dark:border-white/5 text-slate-500 hover:border-slate-300'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <ClinicalTimeline events={events} />

            {/* Floating Scan Action matching HTML */}
            <div className="fixed bottom-24 left-0 right-0 px-6 flex justify-center pointer-events-none z-30">
                <button className="pointer-events-auto bg-[#FF5733] text-white font-black py-5 px-10 rounded-full shadow-2xl shadow-orange-500/40 flex items-center gap-3 transform active:scale-95 hover:scale-105 transition-all text-sm uppercase tracking-[0.2em]">
                    <span className="material-icons-round text-xl">medical_services</span>
                    SCANEAR SISTEMA AHORA
                </button>
            </div>
        </div>
    );
}
