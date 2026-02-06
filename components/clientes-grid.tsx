"use client";

import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Building2, User } from "lucide-react";
import type { ClienteCard } from "@/lib/types/welcome";

// ============================================================================
// PANTALLA 1A: Cards de Clientes (Perfil Compuesto)
// Fuente de la Verdad: tabla clientes
// ============================================================================

/**
 * Tokens de color por segmento para consistencia visual.
 */
const SEGMENTO_TOKENS: Record<string, {
    bg: string;
    bgLight: string;
    text: string;
    border: string;
    badge: string;
}> = {
    Pyme: {
        bg: "bg-emerald-500",
        bgLight: "bg-emerald-50",
        text: "text-emerald-600",
        border: "border-emerald-100",
        badge: "bg-emerald-100 text-emerald-700 border-emerald-200"
    },
    "E-commerce": {
        bg: "bg-orange-500",
        bgLight: "bg-orange-50",
        text: "text-orange-600",
        border: "border-orange-100",
        badge: "bg-orange-100 text-orange-700 border-orange-200"
    },
    Startup: {
        bg: "bg-purple-500",
        bgLight: "bg-purple-50",
        text: "text-purple-600",
        border: "border-purple-100",
        badge: "bg-purple-100 text-purple-700 border-purple-200"
    },
    Creador: {
        bg: "bg-blue-500",
        bgLight: "bg-blue-50",
        text: "text-blue-600",
        border: "border-blue-100",
        badge: "bg-blue-100 text-blue-700 border-blue-200"
    }
};

/**
 * Props del componente ClienteCard.
 */
interface ClienteCardProps {
    cliente: ClienteCard;
    onClick?: () => void;
    href?: string;
}

/**
 * Card individual de cliente para la Pantalla 1A.
 * Muestra: logo/foto, nombre comercial, razón social, segmento.
 */
export function ClienteCardUI({ cliente, onClick, href }: ClienteCardProps) {
    const token = SEGMENTO_TOKENS[cliente.segmento] || SEGMENTO_TOKENS.Pyme;

    const CardContent = (
        <Card
            className={cn(
                "relative overflow-hidden rounded-3xl border-2 transition-all duration-300",
                "bg-white shadow-lg hover:shadow-2xl hover:scale-[1.02]",
                "cursor-pointer group",
                token.border,
                "hover:border-slate-300"
            )}
            onClick={onClick}
        >
            {/* Accent bar superior */}
            <div className={cn("h-1.5 w-full", token.bg)} />

            <div className="p-6 flex flex-col items-center text-center space-y-4">
                {/* Logo / Foto del dueño */}
                <div
                    className={cn(
                        "relative w-24 h-24 rounded-2xl overflow-hidden",
                        "border-2 shadow-inner flex items-center justify-center",
                        token.bgLight,
                        token.border
                    )}
                >
                    {cliente.img_clientes ? (
                        <Image
                            src={cliente.img_clientes}
                            alt={cliente.nombre_comercial}
                            fill
                            className="object-cover"
                            sizes="96px"
                        />
                    ) : (
                        <User size={40} className={cn("opacity-40", token.text)} />
                    )}
                </div>

                {/* Nombre comercial */}
                <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-slate-700 transition-colors line-clamp-2">
                    {cliente.nombre_comercial}
                </h3>

                {/* Razón social */}
                <p className="text-sm text-slate-500 font-medium leading-snug line-clamp-2 min-h-[20px]">
                    {cliente.razon_social}
                </p>

                {/* Metadata Negocio (si existe) */}
                {cliente.metadata_negocio && (
                    <p className="text-[10px] text-slate-400 font-mono leading-tight bg-slate-50 px-2 py-1 rounded border border-slate-100 w-full line-clamp-2 break-all">
                        {typeof cliente.metadata_negocio === 'object'
                            ? JSON.stringify(cliente.metadata_negocio).replace(/["{}]/g, '').replace(/:/g, ': ').replace(/,/g, ', ')
                            : String(cliente.metadata_negocio)}
                    </p>
                )}

                {/* Badge de segmento */}
                <Badge
                    variant="outline"
                    className={cn(
                        "text-[10px] font-black uppercase tracking-wider px-3 py-1 border",
                        token.badge
                    )}
                >
                    {cliente.segmento}
                </Badge>
            </div>
        </Card>
    );

    // Si hay href, envolver en Link
    if (href) {
        return (
            <Link href={href} className="block">
                {CardContent}
            </Link>
        );
    }

    return CardContent;
}

/**
 * Skeleton loader para una card de cliente.
 */
export function ClienteCardSkeleton() {
    return (
        <Card className="rounded-3xl border-2 border-slate-100 overflow-hidden">
            <Skeleton className="h-1.5 w-full" />
            <div className="p-6 flex flex-col items-center space-y-4">
                <Skeleton className="w-24 h-24 rounded-2xl" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-5 w-20 rounded-full" />
            </div>
        </Card>
    );
}

/**
 * Props del grid de clientes.
 */
interface ClientesGridProps {
    clientes: ClienteCard[];
    loading?: boolean;
    onClienteClick?: (cliente: ClienteCard) => void;
    getHref?: (cliente: ClienteCard) => string;
}

/**
 * Grid de cards de clientes para la Pantalla 1A.
 * Responsive: 4 columnas en desktop, 2 en tablet, 1 en mobile.
 */
export function ClientesGrid({
    clientes,
    loading = false,
    onClienteClick,
    getHref
}: ClientesGridProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <ClienteCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (clientes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <Building2 size={48} className="text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-600">No hay clientes registrados</h3>
                <p className="text-sm text-slate-400 mt-2">
                    Los clientes aparecerán aquí cuando se agreguen al sistema.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {clientes.map((cliente) => (
                <ClienteCardUI
                    key={cliente.id}
                    cliente={cliente}
                    onClick={onClienteClick ? () => onClienteClick(cliente) : undefined}
                    href={getHref ? getHref(cliente) : undefined}
                />
            ))}
        </div>
    );
}

export default ClientesGrid;
