import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function VigilantSection() {
    return (
        <section className="relative py-16 sm:py-20 overflow-hidden bg-gradient-to-br from-[#002D5E] via-[#0F3F7A] to-[#1E3A8A]">

            {/* Elementos de textura */}
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">

                    {/* 1. Columna de Imagen (IZQUIERDA) */}
                    <div className="relative order-1 lg:order-1">
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/30 to-blue-500/30 blur-2xl rounded-3xl transform -rotate-2 scale-105 -z-10"></div>

                        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-white/5 backdrop-blur-sm z-10">
                            <Image
                                src="/assets/vendedora3.webp"
                                alt="Vendedor operando tranquilo con SmartDash"
                                width={600}
                                height={400}
                                className="w-full h-auto object-cover"
                                priority
                            />
                            <div className="absolute inset-0 bg-indigo-900/10 mix-blend-multiply"></div>
                        </div>
                    </div>

                    {/* 2. Columna de Texto (DERECHA) */}
                    <div className="space-y-6 order-2 lg:order-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-800/50 text-indigo-200 text-xs font-medium border border-indigo-700/50">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Protección 24/7</span>
                        </div>

                        {/* Título más chico (de 5xl bajó a 3xl/4xl) */}
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                            SmartDash es el empleado que nunca falta, nunca se equivoca y no cobra sueldo
                        </h2>

                        {/* Texto cuerpo más chico (de lg bajó a base) */}
                        <div className="space-y-4 text-base text-indigo-100/90 leading-relaxed">
                            <p>
                                Vigila tus números 24/7, te avisa solo cuando hay peligro y te ahorra miles todos los meses.
                            </p>
                            <p className="text-lg font-semibold text-white">
                                Vos seguís creciendo. Él protege tu plata.
                            </p>
                        </div>

                        <div className="pt-2 space-y-3">
                            <Link href="/dashboard" className="inline-block w-full sm:w-auto">
                                <Button
                                    size="lg"
                                    // Botón ajustado: menos padding exagerado, texto base
                                    className="bg-[#FF5733] hover:bg-[#FF5733]/90 text-white font-bold text-base px-6 py-6 h-auto w-full sm:w-auto rounded-xl shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] group whitespace-normal"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        Probá 30 días GRATIS ahora (sin tarjeta)
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform shrink-0" />
                                    </span>
                                </Button>
                            </Link>
                            <p className="text-xs text-indigo-300/80 font-medium text-center sm:text-left">
                                Cancelá cuando quieras • Sin compromiso • Empezás hoy
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}