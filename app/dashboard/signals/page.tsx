import { SignalsGrid } from '@/components/dashboard/SignalsGrid';
import { mockSignals, Signal } from '@/lib/dashboard/mock';
import { listActiveSignals } from '@/lib/dashboard/data';

const SELLER_ID = '00000000-0000-0000-0000-000000000001';

async function getSignalsData(): Promise<Signal[]> {
    const realData = await listActiveSignals(SELLER_ID);

    if (!realData || realData.length === 0) {
        return mockSignals;
    }

    // Map clinical events to Signal format
    return realData.slice(0, 20).map((event) => ({
        id: event.id,
        title: event.scenario_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: JSON.stringify(event.evidence).substring(0, 100) + '...',
        severity: event.severity === 'critical' ? 'high' :
            event.severity === 'high' ? 'medium' :
                event.severity === 'medium' ? 'low' : 'preventive',
        probability: Math.min(Math.abs(event.score_impact) * 10, 100),
        type: event.scenario_key.includes('reputation') ? 'Reputación' :
            event.scenario_key.includes('stock') ? 'Operaciones' :
                event.scenario_key.includes('price') ? 'Pricing' : 'Operaciones',
        status: event.severity === 'critical' ? 'Activo' :
            event.severity === 'high' ? 'Monitoreando' : 'Estable',
        icon: event.scenario_key.includes('sla') ? 'warning' :
            event.scenario_key.includes('stock') ? 'inventory_2' :
                event.scenario_key.includes('reputation') ? 'trending_down' : 'payments',
    }));
}

export default async function SignalsPage() {
    const signals = await getSignalsData();

    return (
        <div className="p-6 space-y-8 animate-in fade-in slide-in-from-right-5 duration-700">
            <section>
                <div className="flex items-end justify-between mb-2">
                    <h1 className="text-3xl font-black tracking-tight">Escenarios Clínicos</h1>
                    <span className="text-xs font-bold text-[#FF5C35] bg-orange-50 dark:bg-orange-950/30 px-2 py-1 rounded">{signals.length} Activos</span>
                </div>
                <p className="text-slate-500 text-sm font-medium">Monitoreo de salud operativa en tiempo real.</p>
            </section>

            {/* Filter Tabs matching HTML */}
            <section className="space-y-4">
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                    {['Todas', 'Reputación', 'Operaciones', 'Pricing'].map((tab, i) => (
                        <button
                            key={tab}
                            className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${i === 0 ? 'bg-[#113E87] text-white shadow-lg' : 'bg-white dark:bg-[#161D2F] border border-slate-100 dark:border-white/5 text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Severity Selector */}
                <div className="flex items-center justify-between bg-white dark:bg-[#161D2F] p-1.5 rounded-2xl shadow-inner border border-slate-50 dark:border-white/5">
                    <button className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest text-[#113E87] dark:text-blue-400 bg-slate-50 dark:bg-[#0A0F1D] rounded-xl shadow-sm border border-slate-100 dark:border-white/5">Severidad Alta</button>
                    <button className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Media</button>
                    <button className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Baja</button>
                </div>
            </section>

            <SignalsGrid signals={signals} />

            {/* CTA Footer found in HTML */}
            <section className="mt-6 pb-10">
                <div className="bg-[#113E87] rounded-3xl p-8 text-center text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
                    <h4 className="text-xl font-black mb-3 tracking-tight relative z-10">¿Querés prevenir antes de que pase?</h4>
                    <p className="text-blue-100 text-sm mb-8 font-medium relative z-10">Activá alertas automáticas vía WhatsApp para todo tu equipo.</p>
                    <button className="w-full bg-[#FF5C35] text-white py-5 rounded-2xl font-black shadow-2xl shadow-orange-500/40 active:scale-95 transition-all text-xs uppercase tracking-[0.2em] relative z-10">
                        Probar 30 días GRATIS
                    </button>
                    <p className="text-[10px] text-blue-300 mt-4 font-bold uppercase tracking-widest opacity-60">Sin tarjeta • Cancela cuando quieras</p>
                </div>
            </section>
        </div>
    );
}
