import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ComparisonSection() {
  return (
    <section className="py-20 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-[#002D5E]">
            Una semana operando a ciegas vs. teniendo un vigilante que cuida tu plata
          </h2>
          <p className="text-slate-600 max-w-3xl mx-auto text-lg">
            Esto no es teoría. Es lo que les pasa a miles de vendedores de Mercado Libre todos los meses. Elegí en qué lado querés estar.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Sin SmartDash – Más visceral, más dolor */}
          <Card className="border-red-300 bg-red-50/70 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-red-700">
                <AlertCircle className="h-8 w-8" />
                Sin SmartDash: Perdés guita todos los días y ni te enterás
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-5">
                <div className="border-l-4 border-red-500 pl-5 py-3 bg-red-100/50 rounded-r-lg">
                  <p className="font-bold text-slate-900">
                    Lunes – Quiebre de stock invisible
                  </p>
                  <p className="text-slate-700 text-sm mt-1">
                    Tu producto estrella se agotó el sábado. Seguís recibiendo órdenes que después tenés que cancelar.
                  </p>
                  <p className="text-red-700 font-bold mt-2">
                    💸 Perdiste $3.200 en ventas + reputación dañada
                  </p>
                </div>

                <div className="border-l-4 border-red-500 pl-5 py-3 bg-red-100/50 rounded-r-lg">
                  <p className="font-bold text-slate-900">
                    Miércoles – Caída de ventas que no viste venir
                  </p>
                  <p className="text-slate-700 text-sm mt-1">
                    Tus ventas bajaron 40%. Te enterás 15 días después mirando el reporte de ML.
                  </p>
                  <p className="text-red-700 font-bold mt-2">
                    💸 $7.800 que se fueron al competidor
                  </p>
                </div>

                <div className="border-l-4 border-red-500 pl-5 py-3 bg-red-100/50 rounded-r-lg">
                  <p className="font-bold text-slate-900">
                    Viernes – Bloqueo de cuenta sorpresa
                  </p>
                  <p className="text-slate-700 text-sm mt-1">
                    Mercado Libre te suspende por tasa de reclamos. Te llega el mail cuando ya perdiste el fin de semana fuerte.
                  </p>
                  <p className="text-red-700 font-bold mt-2">
                    💸 $15.000+ en ventas evaporadas
                  </p>
                </div>

                <div className="border-l-4 border-red-500 pl-5 py-3 bg-red-100/50 rounded-r-lg">
                  <p className="font-bold text-slate-900">
                    Todo el fin de semana
                  </p>
                  <p className="text-slate-700 text-sm mt-1">
                    Estrés, llamados, mails a soporte. No dormís pensando si vas a quebrar.
                  </p>
                  <p className="text-red-700 font-bold mt-2">
                    😰 Costo emocional: no tiene precio
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t-2 border-red-400 bg-red-100/70 rounded-lg p-4">
                <p className="text-lg font-bold text-red-800 text-center">
                  Total en una sola semana: más de $26.000 perdidos + estrés que te quema
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Con SmartDash – Alivio inmediato, acción, tranquilidad */}
          <Card className="border-[#FF5733] bg-orange-50/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-[#FF5733]">
                <CheckCircle2 className="h-8 w-8" />
                Con SmartDash: Te avisa antes y salvás la plata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-5">
                <div className="border-l-4 border-[#FF5733] pl-5 py-3 bg-orange-100/50 rounded-r-lg">
                  <p className="font-bold text-slate-900">
                    Lunes 9:30 AM – WhatsApp
                  </p>
                  <p className="text-slate-700 text-sm mt-1">
                    “⚠️ Stock crítico: Auriculares Pro quedan 5 unidades. Reabastecé hoy para no perder ventas.”
                  </p>
                  <p className="text-[#FF5733] font-bold mt-2">
                    ✅ Actuás ya → No perdés ni un peso
                  </p>
                </div>

                <div className="border-l-4 border-[#FF5733] pl-5 py-3 bg-orange-100/50 rounded-r-lg">
                  <p className="font-bold text-slate-900">
                    Miércoles 2 PM – WhatsApp
                  </p>
                  <p className="text-slate-700 text-sm mt-1">
                    “📉 Ventas cayeron 38% vs promedio. Revisá precios o competencia. Posible bloqueo si sigue así.”
                  </p>
                  <p className="text-[#FF5733] font-bold mt-2">
                    ✅ Ajustás precios → Recuperás el terreno
                  </p>
                </div>

                <div className="border-l-4 border-[#FF5733] pl-5 py-3 bg-orange-100/50 rounded-r-lg">
                  <p className="font-bold text-slate-900">
                    Viernes 11 AM – WhatsApp
                  </p>
                  <p className="text-slate-700 text-sm mt-1">
                    “⚠️ Tasa de reclamos al límite. Mejorá envíos hoy o ML te suspende el lunes.”
                  </p>
                  <p className="text-[#FF5733] font-bold mt-2">
                    ✅ Coordinás logística → Evitás el bloqueo
                  </p>
                </div>

                <div className="border-l-4 border-[#FF5733] pl-5 py-3 bg-orange-100/50 rounded-r-lg">
                  <p className="font-bold text-slate-900">
                    Todo el fin de semana
                  </p>
                  <p className="text-slate-700 text-sm mt-1">
                    Tranquilidad total. Sabés que SmartDash está vigilando 24/7. Disfrutás la familia.
                  </p>
                  <p className="text-[#FF5733] font-bold mt-2">
                    😌 Paz mental que no se compra
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t-2 border-[#FF5733] bg-orange-100/50 rounded-lg p-4">
                <p className="text-lg font-bold text-[#FF5733] text-center">
                  Total salvado en una semana: +$26.000 + tranquilidad para dormir
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ROI + CTA fuerte */}
        <div className="mt-16 p-10 rounded-2xl bg-slate-900 text-white text-center">
          <h3 className="text-3xl lg:text-4xl font-bold mb-6">
            Pagás poco y evitás perder miles
          </h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-8">
            <div>
              <p className="text-slate-300 text-sm mb-2">
                Costo de SmartDash
              </p>
              <p className="text-4xl font-bold">desde $29/mes</p>
              <p className="text-xs text-slate-400 mt-1">Plan inicial</p>
            </div>
            <div>
              <p className="text-slate-300 text-sm mb-2">
                Guita que evitás perder por mes
              </p>
              <p className="text-5xl font-bold text-green-400">$8.000+</p>
              <p className="text-sm text-slate-400 mt-1">Casos reales de clientes</p>
            </div>
            <div>
              <p className="text-slate-300 text-sm mb-2">
                Retorno real
              </p>
              <p className="text-5xl font-bold text-[#FF5733]">250x+</p>
              <p className="text-sm text-slate-400 mt-1">En el primer mes</p>
            </div>
          </div>

          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            SmartDash no es un gasto. Es el seguro más barato y efectivo que vas a contratar para tu negocio.
          </p>

          <Link href="/dashboard">
            <Button
              size="lg"
              className="bg-[#FF5733] hover:bg-[#FF5733]/90 h-16 px-10 rounded-xl text-xl font-bold group text-white"
            >
              Probá 30 días gratis (sin tarjeta)
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
            </Button>
          </Link>

          <p className="text-sm text-slate-400 mt-4">
            Cancelá cuando quieras • No pedimos datos de pago • Empezás a proteger tu plata hoy
          </p>
        </div>
      </div>
    </section>
  );
}