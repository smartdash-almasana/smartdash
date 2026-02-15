import { TelemetryPanel } from '@/components/dashboard/TelemetryPanel';
import { mockTelemetry, Telemetry } from '@/lib/dashboard/mock';
import { getTelemetryCount, getLatestHealthScore } from '@/lib/dashboard/data';

const SELLER_ID = '00000000-0000-0000-0000-000000000001';

async function getTelemetryData(): Promise<Telemetry> {
    const [telemetryStats, healthScore] = await Promise.all([
        getTelemetryCount(SELLER_ID),
        getLatestHealthScore(SELLER_ID),
    ]);

    if (!healthScore) {
        return mockTelemetry;
    }

    // Calculate derived metrics from real data
    const driversCount = healthScore.drivers?.length || 0;
    const totalPenalty = healthScore.drivers?.reduce((sum, d) => sum + d.penalty, 0) || 0;

    return {
        score: healthScore.score,
        halfLife: '72.0h', // Static for now - would need calculation from telemetry history
        floorFactor: 0.80, // Static - from engine constants
        penalties: Math.floor(totalPenalty / 10),
        positives: Math.max(100 - Math.floor(totalPenalty), 0),
        syncLatency: telemetryStats.count > 0 ? '120ms' : '0ms',
    };
}

export default async function TelemetryPage() {
    const telemetry = await getTelemetryData();

    return (
        <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <TelemetryPanel data={telemetry} />

            {/* Footer CTA and metrics section matching HTML */}
            <section className="px-6 space-y-5">
                {[
                    { icon: 'security', title: 'Privacidad por diseño', sub: 'Tus datos financieros están encriptados AES-256.' },
                    { icon: 'analytics', title: 'Modelos Determinísticos', sub: 'Sin predicciones vacías. Resultados basados en data real.' }
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-5 p-5 bg-white dark:bg-[#161D2F] border border-slate-100 dark:border-white/5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                            <span className="material-icons-round text-[#ff5a36]">{item.icon}</span>
                        </div>
                        <div>
                            <h4 className="font-black text-sm tracking-tight">{item.title}</h4>
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">{item.sub}</p>
                        </div>
                    </div>
                ))}
            </section>

            <section className="px-6 pt-16 pb-20 text-center space-y-8">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em]">Protegiendo a +127 vendedores</p>
                <button className="w-full bg-[#ff5a36] hover:bg-orange-600 text-white font-black py-5 px-8 rounded-3xl shadow-2xl shadow-orange-500/30 transition-all active:scale-[0.98] text-sm uppercase tracking-[0.2em]">
                    MEJORAR MI HEALTH SCORE
                </button>
                <p className="text-[10px] text-slate-400 italic font-medium">30 días de prueba sin tarjeta • Cancela cuando quieras</p>
            </section>
        </div>
    );
}
