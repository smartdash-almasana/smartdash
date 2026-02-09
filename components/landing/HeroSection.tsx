"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, DollarSign, MessageCircle, Brain } from "lucide-react";

export default function HeroSection() {
    return (
        <section className="relative py-16 lg:py-24 overflow-hidden bg-[#002D5E] text-white">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                    {/* Columna de Texto */}
                    <div className="space-y-8 text-center lg:text-left">
                        {/* Badge */}
                        <div className="flex justify-center lg:justify-start mb-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF5733]/20 border border-[#FF5733]/40 text-[#FF5733] text-sm font-bold uppercase tracking-wider">
                                🔥 Evitás perder u$s 8.000+ por mes en promedio
                            </div>
                        </div>

                        {/* H1 – Tamaños más controlados */}
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                            Dejá de perder u$s 8.000+ por mes por errores que no ves.
                            <br />
                            <span className="text-[#FF5733] block mt-2">
                                SmartDash te avisa por WhatsApp antes de que sea tarde
                            </span>
                        </h1>

                        <p className="text-base lg:text-lg text-indigo-100 mx-auto lg:mx-0 max-w-xl">
                            Te conectás en minutos a Mercado Libre, Tango, Excel y AFIP.
                            Recibís alertas instantáneas cuando algo anda mal.
                        </p>

                        {/* Beneficios en Grilla (2 columnas) para equilibrar */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl mx-auto lg:mx-0">
                            <div className="flex items-start gap-3 text-left">
                                <DollarSign className="h-6 w-6 text-[#FF5733] mt-1 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-white">Salvás guita real</p>
                                    <p className="text-indigo-200 text-sm leading-snug">
                                        Clientes evitan pérdidas por quiebres y robos.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 text-left">
                                <MessageCircle className="h-6 w-6 text-[#FF5733] mt-1 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-white">Alertas por WhatsApp</p>
                                    <p className="text-indigo-200 text-sm leading-snug">
                                        Mensaje directo al celu. Actuás al toque.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 text-left sm:col-span-2">
                                <Brain className="h-6 w-6 text-[#FF5733] mt-1 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-white">
                                        Cero cambios en tu laburo
                                    </p>
                                    <p className="text-indigo-200 text-sm leading-snug">
                                        Seguís con tus sistemas. SmartDash solo vigila.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="pt-4 flex flex-col items-center lg:items-start">
                            <Link href="/dashboard">
                                <Button className="bg-[#FF5733] hover:bg-[#FF5733]/90 h-14 sm:h-16 px-8 sm:px-10 rounded-xl text-lg sm:text-xl font-bold shadow-xl transition-all hover:scale-105 group w-full sm:w-auto">
                                    Probá 30 días GRATIS ahora
                                    <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                                </Button>
                            </Link>
                            <p className="text-sm text-indigo-200 mt-3">
                                Sin tarjeta • Cancelá cuando quieras • Empezás hoy
                            </p>
                        </div>
                    </div>

                    {/* Imagen – Más grande y dominante */}
                    <div className="relative flex items-center justify-center lg:justify-end mx-auto mt-8 lg:mt-0 w-full">
                        {/* Glow abrazando la imagen */}
                        <div className="absolute inset-0 bg-[#FF5733]/20 blur-3xl rounded-full opacity-50 scale-110 -z-10"></div>

                        <img
                            src="/images/vendedor9.webp"
                            alt="Vendedor argentino salvado por alerta WhatsApp de SmartDash"
                            className="relative z-10 w-full max-w-lg lg:max-w-none h-auto object-cover rounded-2xl shadow-2xl border border-white/10 hover:shadow-[#FF5733]/20 transition-shadow duration-500 lg:-mr-8"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}