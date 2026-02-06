import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { DashboardContent } from '@/components/dashboard-content';
import { getDashboardData, getHistoryFromDB } from '@/lib/actions';
import { getDashboardRisks } from '@/lib/data/risks';

// Force dynamic rendering since we depend on searchParams
export const dynamic = 'force-dynamic';

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const clienteId = typeof params.cliente === 'string' ? params.cliente : undefined;
    const segmento = typeof params.segmento === 'string' ? params.segmento : undefined;
    const capturaId = typeof params.id === 'string' ? params.id : undefined;

    // 1. Resolver el ID de la captura (Risk ID)
    let targetCapturaId = capturaId;
    let targetSegmento = segmento;

    // Si no tenemos ID directo, buscamos el riesgo más relevante para el cliente
    if (!targetCapturaId && clienteId) {
        try {
            const allRisks = await getDashboardRisks();

            // Filtramos riesgos del cliente
            const clientRisks = allRisks.filter(r => r.cliente_id === clienteId);

            if (clientRisks.length > 0) {
                // Seleccionamos el de mayor puntaje global (más crítico)
                const topRisk = clientRisks.sort((a, b) => b.puntaje_global - a.puntaje_global)[0];
                targetCapturaId = topRisk.captura_id;

                // Aseguramos tener el segmento correcto del riesgo encontrado
                if (!targetSegmento) targetSegmento = topRisk.segmento;
            }
        } catch (error) {
            console.error('Error resolving client risks:', error);
        }
    }

    // 2. Si fallamos en encontrar un riesgo válido, redirigimos o mostramos error
    if (!targetCapturaId) {
        // Si tenemos segmento, volvemos a la demo de ese segmento
        if (segmento) {
            redirect(`/demo?segmento=${segmento}`);
        }
        // Fallback general
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                    <h1 className="text-2xl font-bold text-slate-800 mb-4">Caso no encontrado</h1>
                    <p className="text-slate-600 mb-6">No pudimos localizar el análisis de riesgo solicitado.</p>
                    <a href="/demo" className="text-blue-600 hover:underline font-medium">Volver al inicio</a>
                </div>
            </DashboardLayout>
        );
    }

    // 3. Obtener Data Completa del Dashboard
    const [dashboardData, historyLog] = await Promise.all([
        getDashboardData(targetCapturaId),
        targetSegmento ? getHistoryFromDB(targetSegmento) : Promise.resolve([])
    ]);

    if (!dashboardData) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Error de Carga</h1>
                    <p className="text-slate-600">No se pudieron cargar los datos detallados del caso.</p>
                </div>
            </DashboardLayout>
        );
    }

    // 4. Renderizar
    return (
        <DashboardLayout>
            <DashboardContent
                data={dashboardData}
                history={historyLog}
                rubro={targetSegmento || 'General'}
            />
        </DashboardLayout>
    );
}
