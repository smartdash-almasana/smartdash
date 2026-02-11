import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ComparisonSection() {
  return (
    <section className="py-20 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-[#002D5E]">
            Una semana operando a ciegas vs. teniendo un vigilante que cuida tu
            capital
          </h2>
          <p className="text-slate-600 max-w-3xl mx-auto text-lg">
            Esto no es teoría. Es lo que les pasa a miles de vendedores de
            Mercado Libre todos los meses. Elegí en qué lado querés estar.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Sin SmartDash */}
          <Card className="border-red-500/50 bg-[#1a0505] shadow-xl relative overflow-hidden text-red-50">
            <div className="absolute inset-0 bg-red-900/10 pointer-events-none z-0"></div>
            <CardHeader className="relative z-10 border-b border-red-900/30 pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl text-red-400">
                <AlertCircle className="h-8 w-8 text-red-500" />
                Sin SmartDash: Perdés guita todos los días y ni te enterás
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10 pt-6">
              <div className="space-y-6">
                <div className="border-l-4 border-red-600 pl-5">
                  <p className="font-bold text-white text-lg">
                    Lunes – Falta de stock inesperada
                  </p>
                  <p className="text-red-200 text-sm mt-1 mb-2">
                    El producto que más vendés se agotó el finde. Seguís
                    recibiendo pedidos, los cancelás y la reputación se te va al
                    carajo.
                  </p>
                  <p className="text-red-400 font-bold bg-red-950/50 inline-block px-2 py-1 rounded border border-red-900/50">
                    💸 Pérdida de $320.000.- en ventas y reputación
                  </p>
                </div>

                <div className="border-l-4 border-red-600 pl-5">
                  <p className="font-bold text-white text-lg">
                    Miércoles – Pérdida de oportunidades de venta
                  </p>
                  <p className="text-red-200 text-sm mt-1 mb-2">
                    Bajaron 40% de golpe. Te das cuenta dos semanas después
                    cuando mirás el reporte de Mercado Libre.
                  </p>
                  <p className="text-red-400 font-bold bg-red-950/50 inline-block px-2 py-1 rounded border border-red-900/50">
                    💸 $780.000 desviados hacia competidores
                  </p>
                </div>

                <div className="border-l-4 border-red-600 pl-5">
                  <p className="font-bold text-white text-lg">
                    El bloqueo que genera ansiedad
                  </p>
                  <p className="text-red-200 text-sm mt-1 mb-2">
                    Mercado Libre suspende la cuenta por reclamos acumulados.
                  </p>
                  <p className="text-red-400 font-bold bg-red-950/50 inline-block px-2 py-1 rounded border border-red-900/50">
                    💸 $15.000+ que se evaporaron de un día para el otro
                  </p>
                </div>

                <div className="border-l-4 border-red-600 pl-5">
                  <p className="font-bold text-white text-lg">
                    Todo el fin de semana
                  </p>
                  <p className="text-red-200 text-sm mt-1 mb-2">
                    Llamados, mails a soporte, estrés total. No pegás un ojo
                    pensando que la próxima factura no entra.
                  </p>
                  <p className="text-red-400 font-bold bg-red-950/50 inline-block px-2 py-1 rounded border border-red-900/50">
                    😰 El estrés que nadie te paga
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-red-900/50 mt-4">
                <p className="text-lg font-bold text-red-400 text-center">
                  Total en una semana: más de $26.000 perdidos + noches sin
                  dormir
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Con SmartDash */}
          <Card className="border-emerald-500/50 bg-[#021a12] shadow-xl relative overflow-hidden text-emerald-50">
            <div className="absolute inset-0 bg-emerald-900/10 pointer-events-none z-0"></div>
            <CardHeader className="relative z-10 border-b border-emerald-900/30 pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl text-emerald-400">
                <ShieldCheck className="h-8 w-8 text-emerald-500" />
                Con SmartDash: Te avisa antes y salvás la plata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10 pt-6">
              <div className="space-y-6">
                <div className="border-l-4 border-emerald-500 pl-5">
                  <p className="font-bold text-white text-lg">
                    Lunes 9:30 AM – Alerta por WhatsApp
                  </p>
                  <p className="text-emerald-200 text-sm mt-1 mb-2">
                    "⚠️ Stock crítico: quedan 5 unidades. Reabastecé para evitar
                    quiebres."
                  </p>
                  <p className="text-emerald-400 font-bold bg-emerald-950/50 inline-block px-2 py-1 rounded border border-emerald-900/50 flex items-center gap-2">
                    ✅ Contactás al proveedor y resolvés el faltante
                  </p>
                </div>

                <div className="border-l-4 border-emerald-500 pl-5">
                  <p className="font-bold text-white text-lg">
                    Miércoles 2 PM – Notificación por WhatsApp
                  </p>
                  <p className="text-emerald-200 text-sm mt-1 mb-2">
                    "📉 Ventas bajaron 38% vs lo habitual. Revisá precios y
                    competencia."
                  </p>
                  <p className="text-emerald-400 font-bold bg-emerald-950/50 inline-block px-2 py-1 rounded border border-emerald-900/50 flex items-center gap-2">
                    ✅ Ajustás precios y recuperás competitividad
                  </p>
                </div>

                <div className="border-l-4 border-emerald-500 pl-5">
                  <p className="font-bold text-white text-lg">
                    Viernes 11 AM – Notificación por WhatsApp
                  </p>
                  <p className="text-emerald-200 text-sm mt-1 mb-2">
                    "⚠️ Reclamos al límite. Riesgo de suspensión. Revisión de
                    envíos recomendada."
                  </p>
                  <p className="text-emerald-400 font-bold bg-emerald-950/50 inline-block px-2 py-1 rounded border border-emerald-900/50 flex items-center gap-2">
                    ✅ Hablás con el courier y evitás el bloqueo
                  </p>
                </div>

                <div className="border-l-4 border-emerald-500 pl-5">
                  <p className="font-bold text-white text-lg">
                    Todo el fin de semana
                  </p>
                  <p className="text-emerald-200 text-sm mt-1 mb-2">
                    Trabajás con tranquilidad, sabiendo que el riesgo está
                    controlado.
                  </p>
                  <p className="text-emerald-400 font-bold bg-emerald-950/50 inline-block px-2 py-1 rounded border border-emerald-900/50 flex items-center gap-2">
                    Dormís tranquilo
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-emerald-900/50 mt-4">
                <p className="text-lg font-bold text-emerald-400 text-center">
                  Impacto evitado: $260.000
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ROI + CTA fuerte */}
        <div className="mt-16 p-6 sm:p-10 rounded-2xl bg-slate-900 text-white text-center shadow-2xl">
          <h3 className="text-3xl lg:text-4xl font-bold mb-6">
            Con una inversión muy baja, evitás pérdidas muy altas.
          </h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-8">
            <div>
              <p className="text-slate-400 text-sm mb-2 uppercase tracking-wider font-semibold">
                Costo de SmartDash
              </p>
              <p className="text-4xl font-bold text-white">desde $29/mes</p>
              <p className="text-xs text-slate-500 mt-1">Plan inicial</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-2 uppercase tracking-wider font-semibold">
                Guita que evitás perder
              </p>
              <p className="text-5xl font-bold text-emerald-400">$8.000+</p>
              <p className="text-sm text-slate-500 mt-1">
                Promedio mensual de clientes reales
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-2 uppercase tracking-wider font-semibold">
                Retorno de Inversión
              </p>
              <p className="text-5xl font-bold text-[#FF5733]">250x+</p>
              <p className="text-sm text-slate-500 mt-1">En el primer mes</p>
            </div>
          </div>

          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            SmartDash no es un gasto. Es el seguro más barato que vas a tener
            para tu negocio.
          </p>

          <Link href="/dashboard">
            <Button
              size="lg"
              className="
                bg-[#FF5733] hover:bg-[#FF5733]/90 
                h-auto min-h-[4rem] py-4 px-6 sm:px-12 
                rounded-xl 
                text-lg sm:text-xl font-bold 
                group text-white 
                shadow-lg shadow-orange-500/20 
                whitespace-normal text-center leading-tight
              "
            >
              <span className="flex items-center justify-center gap-2 flex-wrap sm:flex-nowrap">
                Probá 30 días GRATIS ahora (sin tarjeta)
                <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform shrink-0" />
              </span>
            </Button>
          </Link>

          <p className="text-sm text-slate-500 mt-6">
            Sin tarjeta de crédito • Cancelá cuando quieras • Empezás hoy
          </p>
        </div>
      </div>
    </section>
  );
}
