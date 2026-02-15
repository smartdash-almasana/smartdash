import { NextRequest, NextResponse } from 'next/server';
import { storeMeliWebhookEvent } from '@/lib/services/smartseller/meli-webhook';

/**
 * Endpoint para recibir webhooks de Mercado Libre.
 * 
 * Directiva: Responder HTTP 200 en <500ms y procesar async.
 */
export async function POST(request: NextRequest) {
    const startTime = Date.now();

    try {
        const body = await request.json();

        // Ejecutamos el guardado de forma asíncrona pero sin esperar (fire and forget)
        // para asegurar respuesta rápida, aunque por seguridad aquí esperamos el insert 
        // ya que es liviano y crítico para la idempotencia.
        const result = await storeMeliWebhookEvent(body);

        // 3. Cerrar el circuito inmediatamente (Sync/Async hybrid)
        // Según requerimiento "cerrar el circuito", procesamos inmediatamente si es un evento nuevo.
        if (result.success && !result.duplicate && result.event) {
            // Import dinámico o top-level (preferimos top-level pero processWebhookEvent ya está disponible)
            // Llama al procesador. Si falla, el webhook igual respondió 200 (fire & forget parcial, o await según SLA).
            // Para asegurar consistencia en pruebas, hacemos await (SLA risk aceptado en fase dev/test).
            const { processWebhookEvent } = await import('@/lib/engine/smartseller/processor');
            await processWebhookEvent(result.event);
        }

        const duration = Date.now() - startTime;
        console.log(`[Webhook] ML event received and stored in ${duration}ms. Dedupe: ${result.dedupeKey || 'N/A'}`);

        // Siempre responder 200 a Mercado Libre para evitar reintentos innecesarios
        return NextResponse.json({ status: 'ok', processing_time: duration }, { status: 200 });

    } catch (error) {
        console.error('[Webhook API Error] Critical failure:', error);

        // ML reintentará si no recibe 200, pero según la directiva "si falla igual 200"
        // para evitar bloqueos si el error es de nuestra parte y no queremos reintentos infinitos.
        return NextResponse.json({ status: 'error_logged' }, { status: 200 });
    }
}
