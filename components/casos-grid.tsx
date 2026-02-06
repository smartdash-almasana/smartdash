'use client';

import React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { CasoTestigoCard } from '@/lib/types/welcome';
import { AlertTriangle, TrendingUp, DollarSign, User } from 'lucide-react';

interface CasosGridProps {
    casos: CasoTestigoCard[];
    loading?: boolean;
    segmento: string;
}

const RIESGO_COLORS = {
    'Crítico': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', badge: 'bg-red-100 text-red-800' },
    'Alto': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-800' },
    'Medio': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-800' },
    'Bajo': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', badge: 'bg-green-100 text-green-800' },
};

import Link from 'next/link';

function CasoCardUI({ caso }: { caso: CasoTestigoCard }) {
    // Determinar nivel de riesgo (prioridad sugerido, luego actual)
    const riesgo = caso.nivel_riesgo_sugerido || caso.nivel_riesgo;
    const colors = RIESGO_COLORS[riesgo] || RIESGO_COLORS['Medio'];

    return (
        <Link
            href={`/dashboard?cliente=${caso.cliente_id}&segmento=${caso.segmento}`}
            className={cn(
                "group relative flex flex-col bg-white rounded-3xl border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full block"
            )}>
            {/* Título y Descripción (Parte Superior) */}
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">
                    {caso.segmento}
                </h3>

                <h2 className="text-lg font-black text-slate-900 leading-tight mb-3 line-clamp-2 min-h-[3.5rem]">
                    {caso.escenario}
                </h2>

                <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4 flex-grow">
                    {caso.descripcion_base || "Sin descripción disponible."}
                </p>

                {/* Badge de Riesgo */}
                <div className="mb-4">
                    <Badge variant="outline" className={cn("font-bold border-0 px-3 py-1", colors.badge)}>
                        Nivel de Riesgo: {riesgo.toUpperCase()}
                    </Badge>
                </div>
            </div>

            {/* Footer con Datos Financieros y Cliente */}
            <div className="bg-slate-50/80 px-6 py-4 border-t border-slate-100 mt-auto">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Monto en Riesgo</p>
                        <div className="flex items-baseline text-slate-800 font-bold text-lg leading-none">
                            <span className="text-slate-400 text-sm mr-1">{caso.moneda || '$'}</span>
                            {caso.monto_en_riesgo?.toLocaleString() || '0'}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Score Global</p>
                        <span className={cn("text-xs font-extrabold px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-600")}>
                            {caso.puntaje_global} pts
                        </span>
                    </div>
                </div>

                {/* Cliente */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-200/60">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border shadow-sm bg-white shrink-0">
                        {caso.img_clientes ? (
                            <Image
                                src={caso.img_clientes}
                                alt={caso.nombre_comercial}
                                fill
                                className="object-cover"
                                sizes="32px"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                                <User size={14} />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-700 truncate">
                            {caso.nombre_comercial}
                        </h4>
                    </div>
                </div>
            </div>
        </Link>
    );
}

function CasoCardSkeleton() {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="flex justify-between">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24" />
            </div>
            <div className="flex flex-col items-center space-y-3 pt-4">
                <Skeleton className="w-16 h-16 rounded-xl" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        </div>
    );
}

export function CasosGrid({ casos, loading, segmento }: CasosGridProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <CasoCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (casos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                    <AlertTriangle className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                    No hay casos testigo disponibles
                </h3>
                <p className="text-slate-500 max-w-md">
                    No se encontraron casos de riesgo para el segmento <span className="font-bold text-slate-700">{segmento}</span>.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-500">
            {casos.map((caso) => (
                <CasoCardUI key={caso.captura_id} caso={caso} />
            ))}
        </div>
    );
}
