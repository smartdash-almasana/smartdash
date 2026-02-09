"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { CasosTestigoGrid } from "@/components/casos-testigo-grid";
import type { CasoTestigoCardUI } from "@/components/casos-testigo-grid";

type NivelRiesgo = "Bajo" | "Medio" | "Alto" | "Crítico";

function isNivelRiesgo(value: unknown): value is NivelRiesgo {
  return (
    value === "Bajo" ||
    value === "Medio" ||
    value === "Alto" ||
    value === "Crítico"
  );
}

export default function ClientePage() {
  const { clienteId } = useParams<{ clienteId: string }>();

  const [loading, setLoading] = useState(true);
  const [casos, setCasos] = useState<CasoTestigoCardUI[]>([]);
  const [clienteNombre, setClienteNombre] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function fetchCasosCliente() {
      setLoading(true);

      const res = await fetch(`/api/clientes/${clienteId}/casos`);
      if (!res.ok) {
        if (!cancelled) {
          setCasos([]);
          setClienteNombre("");
          setLoading(false);
        }
        return;
      }

      const body = (await res.json()) as { casos?: CasoTestigoCardUI[] };
      const valid = (body.casos || []).filter((item) => {
        if (!item.captura_id) return false;
        return true;
      });

      if (!cancelled) {
        setCasos(valid);
        setClienteNombre(valid[0]?.cliente_nombre_comercial || "");
        setLoading(false);
      }
    }

    if (clienteId) {
      fetchCasosCliente();
    }

    return () => {
      cancelled = true;
    };
  }, [clienteId]);

  const segmento = useMemo(() => clienteNombre, [clienteNombre]);

  return (
    <div className="min-h-screen bg-[#FDFDFF] px-6 sm:px-8 py-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Casos Testigo
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {segmento || "Cliente"}
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl">
            Revisión de escenarios críticos detectados para este cliente.
            Ordenados por criticidad.
          </p>
        </div>

        <CasosTestigoGrid
          segmento={segmento}
          casos={casos}
          loading={loading}
          getHref={(caso) => `/dashboard/casos/${caso.captura_id}`}
        />
      </div>
    </div>
  );
}
