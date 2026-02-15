import { HealthScoreCard } from '@/components/dashboard/HealthScoreCard';
import { mockHealthScore, HealthScore } from '@/lib/dashboard/mock';
import { getLatestHealthScore, listActiveSignals } from '@/lib/dashboard/data';

const SELLER_ID = '00000000-0000-0000-0000-000000000001';

async function getHealthScoreData(): Promise<HealthScore> {
  const realData = await getLatestHealthScore(SELLER_ID);

  if (!realData) {
    return mockHealthScore;
  }

  // Map real data to UI format
  return {
    score: realData.score,
    label: realData.band === 'optimal' ? 'High Health' :
      realData.band === 'stable' ? 'Stable' :
        realData.band === 'warning' ? 'Warning' : 'Critical',
    description: 'Operational systems are stable and protected.',
    drivers: realData.drivers.slice(0, 3).map((d) => ({
      key: d.scenario_key.toUpperCase().split('_')[0] || 'UNKNOWN',
      label: d.scenario_key.replace(/_/g, ' '),
      value: d.penalty > 10 ? 'Critical' : d.penalty > 5 ? 'Pending' : 'Optimal',
      severity: (d.penalty > 10 ? 'critical' : d.penalty > 5 ? 'warning' : 'optimal') as 'critical' | 'warning' | 'optimal',
    })),
  };
}

async function getActiveSignalsCount(): Promise<number> {
  const signals = await listActiveSignals(SELLER_ID);
  return signals.length;
}

export default async function DiagnosisPage() {
  const healthScore = await getHealthScoreData();
  const signalsCount = await getActiveSignalsCount();

  return (
    <div className="px-5 py-6 space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <HealthScoreCard data={healthScore} />

      {/* Urgent Action Window (replicated from HTML) */}
      <section className="p-6 rounded-3xl bg-[#FF5C35]/10 border border-[#FF5C35]/20 shadow-xl shadow-orange-500/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-1.5 bg-[#FF5C35] rounded-lg text-white">
            <span className="material-icons-round text-xl">bolt</span>
          </div>
          <h3 className="font-black text-lg text-[#FF5C35] uppercase tracking-tighter">Urgent Action Window</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
          Reputation risk detected in <span className="font-black">Electronics category</span>. Respond to 4 claims within the next 2 hours to maintain "Platinum" status.
        </p>
        <button className="mt-6 w-full bg-[#FF5C35] text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-500/30 active:scale-95 transition-all text-xs uppercase tracking-widest">
          Fix Now
        </button>
      </section>

      {/* Mitigation Plan section */}
      <section className="space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Mitigation Plan</h3>
        <div className="space-y-4">
          {[
            { label: 'Verify API connection with Mercado Libre', time: 'Now', done: true },
            { label: 'Audit logistics backlog', time: 'Today', done: false },
            { label: 'Update pricing margins', time: 'Week', done: false, inactive: true }
          ].map((item, i) => (
            <div key={i} className={`flex items-center gap-4 p-2 transition-all ${item.inactive ? 'opacity-40 grayscale' : 'opacity-100'}`}>
              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${item.done ? 'bg-[#FF5C35] border-[#FF5C35]' : 'border-slate-300 dark:border-slate-700'}`}>
                {item.done && <span className="material-icons-round text-white text-xs">check</span>}
              </div>
              <span className={`text-sm font-bold ${item.done ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{item.label}</span>
              <span className={`ml-auto text-[10px] font-black uppercase tracking-widest ${item.done ? 'text-[#FF5C35]' : 'text-slate-400'}`}>{item.time}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}