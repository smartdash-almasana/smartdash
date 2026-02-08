"use client";

import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Building2, User } from "lucide-react";
import type { ClienteCard } from "@/lib/types/welcome";

// Tokens de color por segmento
const SEGMENTO_TOKENS: Record<string, { bg: string; bgLight: string; text: string; border: string; badge: string }> = {
  Pyme: { bg: "bg-emerald-500", bgLight: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100", badge: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  "E-commerce": { bg: "bg-orange-500", bgLight: "bg-orange-50", text: "text-orange-600", border: "border-orange-100", badge: "bg-orange-100 text-orange-700 border-orange-200" },
  Startup: { bg: "bg-purple-500", bgLight: "bg-purple-50", text: "text-purple-600", border: "border-purple-100", badge: "bg-purple-100 text-purple-700 border-purple-200" },
  Creador: { bg: "bg-blue-500", bgLight: "bg-blue-50", text: "text-blue-600", border: "border-blue-100", badge: "bg-blue-100 text-blue-700 border-blue-200" }
};

interface ClienteCardProps {
  cliente: ClienteCard & { href?: string };
  onClick?: () => void;
}

/**
 * Card individual de cliente reforzada
 */
export function ClienteCardUI({ cliente, onClick }: ClienteCardProps) {
  const token = SEGMENTO_TOKENS[cliente.segmento] || SEGMENTO_TOKENS.Pyme;

  // Formatear metadata de negocio de forma consistente
  const metadata = cliente.metadata_negocio
    ? [
        cliente.metadata_negocio.empleados ? `Empleados: ${cliente.metadata_negocio.empleados}` : null,
        cliente.metadata_negocio.industria ? `Industria: ${cliente.metadata_negocio.industria}` : null,
        cliente.metadata_negocio.ubicacion ? `Ubicación: ${cliente.metadata_negocio.ubicacion}` : null,
        cliente.metadata_negocio.anio_fundacion ? `Fundado: ${cliente.metadata_negocio.anio_fundacion}` : null
      ]
        .filter(Boolean)
        .join(" • ")
    : null;

  const CardContent = (
    <Card
      className={cn(
        "relative overflow-hidden rounded-3xl border-2 transition-all duration-300 bg-white shadow-lg hover:shadow-2xl hover:scale-[1.02] cursor-pointer group",
        token.border
      )}
      onClick={onClick}
    >
      <div className={cn("h-1.5 w-full", token.bg)} />
      <div className="p-6 flex flex-col items-center text-center space-y-3">
        <div className={cn("relative w-24 h-24 rounded-2xl overflow-hidden border-2 shadow-inner flex items-center justify-center", token.bgLight, token.border)}>
          {cliente.img_clientes ? (
            <Image src={cliente.img_clientes} alt={cliente.nombre_comercial} fill className="object-cover" sizes="96px" />
          ) : (
            <User size={40} className={cn("opacity-40", token.text)} />
          )}
        </div>
        <h3 className="text-lg font-black text-slate-900 leading-tight line-clamp-2">{cliente.nombre_comercial}</h3>
        <p className="text-sm text-slate-500 font-medium line-clamp-2">{cliente.razon_social}</p>
        {metadata && <p className="text-xs text-slate-400">{metadata}</p>}
        <Badge variant="outline" className={cn("text-[10px] font-black uppercase tracking-wider px-3 py-1 border", token.badge)}>
          {cliente.segmento}
        </Badge>
      </div>
    </Card>
  );

  const hrefCliente = cliente.id ? `/demo/clientes/${cliente.id}` : cliente.href;
  return hrefCliente ? <Link href={hrefCliente}>{CardContent}</Link> : CardContent;
}

// Skeleton loader reforzado
export function ClienteCardSkeleton() {
  return (
    <Card className="rounded-3xl border-2 border-slate-100 overflow-hidden">
      <Skeleton className="h-1.5 w-full" />
      <div className="p-6 flex flex-col items-center space-y-3">
        <Skeleton className="w-24 h-24 rounded-2xl" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </Card>
  );
}

// Grid de clientes
interface ClientesGridProps {
  clientes: (ClienteCard & { href?: string })[];
  loading?: boolean;
}

export function ClientesGrid({ clientes, loading = false }: ClientesGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <ClienteCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!clientes.length) {
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
        <ClienteCardUI key={cliente.id} cliente={cliente} />
      ))}
    </div>
  );
}

export default ClientesGrid;
