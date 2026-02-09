"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Shield,
  CheckCircle2,
  ArrowRight,
  Database,
  MessageCircle,
  AlertCircle,
  TrendingDown,
  DollarSign,
  Brain,
  Zap,
  Package,
  Tag,
  Eye,
  RotateCw,
  Trash2,
} from "lucide-react";
import WizardForm from "@/components/landing/WizardForm";
import ComparisonSection from "@/components/landing/ComparisonSection";
import { useState } from "react";
import Link from "next/link";

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden hover:border-[#FF5733]/50 transition-all bg-white shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <span className="font-semibold text-[#002D5E] text-left">
          {question}
        </span>
        <span
          className={`text-[#FF5733] transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-slate-600">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#FF5733]/30">
      <main>
        {/* Hero Section - Fondo Azul Índigo */}
        <section className="relative py-24 lg:py-32 overflow-hidden bg-[#002D5E] text-white">
          <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 relative z-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5733]/10 border border-[#FF5733]/20 text-[#FF5733] text-xs font-bold uppercase tracking-wider">
                🚨 Vigilante 24/7 de tu plata
              </div>

              {/* Título */}
              <h1 className="text-3xl lg:text-5xl font-bold tracking-tight leading-tight">
                Dejá de perder plata por errores que no ves.{" "}
                <span className="text-[#FF5733]">SmartDash te avisa antes de que sea tarde</span>
                <br className="hidden lg:block" />
                sin cambiar nada de lo que ya usás.
              </h1>

              <p className="text-lg text-indigo-100 leading-relaxed max-w-xl">
                Te conectás en minutos a Mercado Libre, Tango, Excel y AFIP. Recibís alertas por WhatsApp cuando algo anda mal. Nada más que hacer. Seguís laburando como siempre.
              </p>

              {/* Beneficios - Íconos unificados a Naranja */}
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <DollarSign className="h-6 w-6 text-[#FF5733] mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">
                      Evitá perder guita por errores invisibles
                    </p>
                    <p className="text-indigo-200 text-sm">
                      Quiebres de stock, caídas de ventas, robos hormiga o multas… te avisa antes de que duela.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MessageCircle className="h-6 w-6 text-[#FF5733] mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">
                      Alertas por WhatsApp al toque
                    </p>
                    <p className="text-indigo-200 text-sm">
                      No emails que ignorás. Un mensaje al celu y actuás ya.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Brain className="h-6 w-6 text-[#FF5733] mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">
                      Sin cambiar nada de tu laburo
                    </p>
                    <p className="text-indigo-200 text-sm">
                      Seguís con Excel, Tango y Mercado Libre como siempre. Nosotros vigilamos.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botones - CTA en Naranja */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="bg-[#FF5733] hover:bg-[#FF5733]/90 h-14 px-8 rounded-xl text-lg font-bold group border-none text-white shadow-lg shadow-orange-900/20"
                  >
                    Probá 30 días gratis
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-white/5 hover:bg-white/10 h-14 px-8 rounded-xl text-lg font-semibold text-white"
                >
                  Hablá con nosotros
                </Button>
              </div>

              {/* Disclaimer */}
              <p className="text-sm text-indigo-200">
                30 días gratis • Sin tarjeta de crédito • Cancelá cuando quieras
              </p>
            </div>

            {/* Imagen Hero - Glow ajustado */}
            <div className="relative">
              <div className="absolute -inset-4 bg-[#FF5733]/10 blur-3xl rounded-full opacity-30"></div>
              <img
                src="/assets/hero-final.jpg"
                alt="SmartDash - Sistema de Integración Multi-Plataforma"
                className="relative z-10 w-full drop-shadow-2xl rounded-2xl border border-white/10"
              />
            </div>
          </div>
        </section>

        {/* Wizard Form Section */}
        <section
          id="wizard"
          className="py-24 bg-slate-50 border-y border-slate-200"
        >
          <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-6 lg:sticky lg:top-28">
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-[#002D5E]">
                Decime en 60 segundos qué te está quitando el sueño y te muestro cómo blindar tu plata
              </h2>
              <p className="text-lg text-slate-600">
                Hacé este diagnóstico rápido (sin compromiso) y descubrí cómo SmartDash te protege sin cambiar tu forma de laburar.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-[#FF5733] mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-[#002D5E]">
                      Diagnóstico en 60 segundos
                    </p>
                    <p className="text-slate-600 text-sm">
                      Rápido y enfocado en tu realidad.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-6 w-6 text-[#FF5733] mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-[#002D5E]">
                      Privacidad 100 % garantizada
                    </p>
                    <p className="text-slate-600 text-sm">
                      No vemos ventas ni datos sensibles.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full">
              <WizardForm />
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section
          id="problem"
          className="py-24 bg-white border-y border-slate-200"
        >
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-5xl font-bold text-[#002D5E]">
                Los riesgos que te están comiendo la plata sin que te des cuenta
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto mt-4">
                Operás entre sistemas fragmentados. Cada error te cuesta guita. Y nadie te avisa hasta que el daño ya está hecho.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Enterarte tarde",
                  desc: "Mercado Libre, AFIP y los sistemas son punitivos. Cuando ves el error (quiebre de stock, bloqueo, multa), la plata ya se fue.",
                  icon: AlertCircle,
                  color: "text-[#FF5733]",
                },
                {
                  title: "Una macana que arruina todo",
                  desc: "Un robo hormiga, una caída de reputación o una multa puede borrar meses de ganancia. El riesgo se acumula en silencio.",
                  icon: TrendingDown,
                  color: "text-[#002D5E]",
                },
                {
                  title: "Estrés y errores caros",
                  desc: "Saltar entre Excel, Tango y Mercado Libre te quema la cabeza y te hace cometer errores que cuestan plata.",
                  icon: Zap,
                  color: "text-[#FF5733]",
                },
              ].map((problem, i) => (
                <Card
                  key={i}
                  className="bg-white border-slate-200 shadow-sm hover:border-[#FF5733] transition-all"
                >
                  <CardHeader>
                    <problem.icon
                      className={`h-10 w-10 ${problem.color} mb-2`}
                    />
                    <CardTitle className="text-xl text-[#002D5E]">
                      {problem.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 leading-relaxed">
                      {problem.desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Core Alerts Section */}
        <section
          id="alerts"
          className="py-24 bg-slate-50 border-y border-slate-200"
        >
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center space-y-4 mb-20">
              <h2 className="text-3xl lg:text-5xl font-bold text-[#002D5E]">
                SmartDash te avisa antes de que pierdas plata… y no te obliga a cambiar nada
              </h2>
              <p className="text-slate-600 max-w-3xl mx-auto text-lg">
                Se conecta a lo que ya usás y te alerta de los problemas que más duelen a vendedores de Mercado Libre y PYMEs.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Quiebre de Stock",
                  icon: Package,
                  desc: "Te avisa cuando un best seller está por agotarse y perdés ventas.",
                },
                {
                  title: "Caída Brusca de Ventas",
                  icon: TrendingDown,
                  desc: "Detecta desvíos anómalos que pueden llevar a bloqueos.",
                },
                {
                  title: "Robos Hormiga",
                  icon: Database,
                  desc: "Identifica movimientos raros que pueden ser desvíos internos.",
                },
                {
                  title: "Problemas de Reputación",
                  icon: Eye,
                  desc: "Alerta temprana de métricas que bajan y arriesgan tu cuenta.",
                },
                {
                  title: "Picos de Devoluciones",
                  icon: RotateCw,
                  desc: "Te avisa de reclamos anormales antes de que escalen.",
                },
                {
                  title: "Productos Muertos",
                  icon: Trash2,
                  desc: "Detecta ítems que atan capital sin venderse.",
                },
              ].map((alert, i) => (
                <div
                  key={i}
                  className="group relative p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-[#FF5733]/50 hover:shadow-lg transition-all duration-300"
                >
                  <div className="bg-[#002D5E]/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#FF5733]/10 transition-colors">
                    <alert.icon className="text-[#002D5E] h-6 w-6 group-hover:text-[#FF5733] transition-colors" />
                  </div>
                  <h3 className="font-bold text-[#002D5E] text-lg mb-2">
                    {alert.title}
                  </h3>
                  <p className="text-sm text-slate-600">{alert.desc}</p>
                </div>
              ))}
            </div>

            {/* Lo mejor: no cambiar nada */}
            <div className="mt-16 max-w-4xl mx-auto text-center">
              <h3 className="text-3xl font-bold text-[#002D5E] mb-8">
                Y lo mejor: no tenés que cambiar nada
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  "No migrás ni un dato",
                  "No dejás tu software actual",
                  "No instalás nada complicado",
                  "Funciona en minutos",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <CheckCircle2 className="h-8 w-8 text-[#FF5733] flex-shrink-0" />
                    <p className="font-semibold text-[#002D5E]">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <ComparisonSection />

        {/* Cierre - Metáfora del empleado */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 text-center space-y-10">
            <h2 className="text-4xl lg:text-6xl font-bold tracking-tight text-[#002D5E]">
              SmartDash es el empleado que nunca falta, nunca se equivoca y no cobra sueldo
            </h2>
            <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              Revisa tus números 24/7, te avisa solo cuando algo anda mal y te ahorra miles de pesos en errores, multas y ventas perdidas.<br />
              Vos seguís haciendo lo tuyo. Él vigila por vos.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-6">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-[#FF5733] hover:bg-[#FF5733]/90 h-14 px-8 rounded-xl text-lg font-bold group border-none text-white shadow-lg shadow-orange-900/20"
                >
                  Probá 30 días gratis
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 rounded-xl text-lg font-semibold border-slate-300"
              >
                Hablá con nosotros
              </Button>
            </div>

            <p className="text-sm text-slate-400">
              Sin tarjeta • Cancelá cuando quieras • Sin compromiso
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-3xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-[#002D5E]">
                Preguntas Frecuentes
              </h2>
              <p className="text-slate-600 mt-4">
                Todo lo que necesitás saber antes de empezar
              </p>
            </div>
            <div className="space-y-4">
              {[
                {
                  q: "¿Cómo recibo las alertas?",
                  a: "Por WhatsApp al instante. También por email si preferís. Vos elegís el canal.",
                },
                {
                  q: "¿Funciona con Mercado Libre?",
                  a: "Sí, se integra nativamente con Mercado Libre, Tango Gestión, Excel y AFIP.",
                },
                {
                  q: "¿Cuánto cuesta?",
                  a: "Tenés 30 días gratis para probar. Luego planes desde $29/mes según tus necesidades.",
                },
                {
                  q: "¿Puedo cancelar cuando quiera?",
                  a: "Sí, sin contratos ni permanencia. Cancelás con un clic desde tu panel.",
                },
              ].map((faq, i) => (
                <FAQItem key={i} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}