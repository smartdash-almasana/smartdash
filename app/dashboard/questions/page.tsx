import { QuestionsBacklog } from '@/components/dashboard/QuestionsBacklog';
import { mockQuestions, Question } from '@/lib/dashboard/mock';
import { listQuestionsSnapshot } from '@/lib/dashboard/data';

const SELLER_ID = '00000000-0000-0000-0000-000000000001';

async function getQuestionsData(): Promise<Question[]> {
    const realData = await listQuestionsSnapshot(SELLER_ID);

    if (!realData || realData.length === 0) {
        return mockQuestions;
    }

    // Map question snapshots to Question format
    return realData.slice(0, 20).map((snap) => {
        const payload = snap.raw_payload as Record<string, unknown>;
        const text = (payload.text as string) || 'Question text unavailable';
        const itemId = (payload.item_id as string) || 'Unknown';

        // Calculate time difference
        const createdDate = new Date(snap.date_created);
        const now = new Date();
        const diffMs = now.getTime() - createdDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const timeStr = diffHours > 0 ? `${diffHours}h ${diffMins % 60}m` : `${diffMins}m`;

        // Determine status based on time elapsed
        const status: 'overdue' | 'pending' | 'on_time' =
            diffHours >= 2 ? 'overdue' :
                diffMins >= 30 ? 'pending' : 'on_time';

        return {
            id: snap.id,
            text: text.substring(0, 60),
            publication: itemId.substring(0, 10) + '...',
            time: timeStr,
            risk: status === 'overdue' ? 'Venta en peligro' :
                status === 'pending' ? 'Chequear Full' : 'A tiempo',
            status,
        };
    });
}

export default async function QuestionsPage() {
    const questions = await getQuestionsData();

    return (
        <div className="p-6 space-y-8 animate-in fade-in zoom-in-95 duration-700">
            <section className="space-y-2">
                <h2 className="text-3xl font-black tracking-tighter dark:text-white">Health Check: Preguntas</h2>
                <p className="text-slate-500 font-medium text-sm">Tu "Sistema Inmunológico" operativo en tiempo real.</p>
            </section>

            <QuestionsBacklog questions={questions} />

            {/* Operative Fatigue Alert matching HTML */}
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-3xl p-6 flex items-center gap-5 shadow-sm">
                <div className="bg-red-500 text-white p-3 rounded-2xl shadow-lg shadow-red-500/20">
                    <span className="material-icons-round text-2xl">warning</span>
                </div>
                <div>
                    <p className="text-sm font-black text-red-900 dark:text-red-200 uppercase tracking-tight">Alerta de Fatiga Operativa</p>
                    <p className="text-xs text-red-700/80 dark:text-red-400 mt-1 font-medium italic">
                        El backlog supera tu capacidad de respuesta actual en un 20%.
                    </p>
                </div>
            </div>
        </div>
    );
}
