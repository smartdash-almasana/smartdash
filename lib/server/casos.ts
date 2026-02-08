import { supabaseServer } from "@/lib/server/supabase";
import type { CasoTestigoCardUI } from "@/components/casos-testigo-grid";

type NivelRiesgo = "Bajo" | "Medio" | "Alto" | "Crítico";

function isNivelRiesgo(value: unknown): value is NivelRiesgo {
  return value === "Bajo" || value === "Medio" || value === "Alto" || value === "Crítico";
}

const CLIENTE_LOGOS: Record<string, string> = {
  "Laura Méndez - Coach Digital":
    "https://amygbmnjjwtnyjclghok.supabase.co/storage/v1/object/public/img_clientes/logos-perfil/laura.png",
  "Distribuidora San Martín":
    "https://amygbmnjjwtnyjclghok.supabase.co/storage/v1/object/public/img_clientes/logos-perfil/sanmartin.png",
  "FinTech Pro":
    "https://amygbmnjjwtnyjclghok.supabase.co/storage/v1/object/public/img_clientes/logos-perfil/fintech.png",
  "ModaClick Store":
    "https://amygbmnjjwtnyjclghok.supabase.co/storage/v1/object/public/img_clientes/logos-perfil/modaclick.png"
};

export async function fetchCasosCliente(clienteId: string): Promise<CasoTestigoCardUI[]> {
  const { data, error } = await supabaseServer
    .from("vista_dashboard_riesgos_api")
    .select(
      `
        captura_id,
        cliente_id,
        nombre_cliente,
        vertical,
        escenario,
        nivel_riesgo,
        puntaje_global,
        monto_en_riesgo,
        financial_context
      `
    )
    .eq("cliente_id", clienteId)
    .order("puntaje_global", { ascending: false });

  let rows = data as any[] | null;
  if (error || !rows) {
    // Fallback: select "*" to avoid column mismatch errors in the view
    const fallback = await supabaseServer
      .from("vista_dashboard_riesgos_api")
      .select("*")
      .eq("cliente_id", clienteId);
    rows = (fallback.data as any[]) || null;
  }

  if (!rows) {
    return [];
  }

  const mapped = rows.map((item) => {
    const moneda = item.financial_context?.moneda ?? null;
    const nivel = item.nivel_riesgo ?? "Medio";

    const dto: CasoTestigoCardUI = {
      captura_id: item.captura_id,
      cliente_nombre_comercial: item.nombre_cliente || "Cliente sin nombre",
      logo_url: item.logo_url ?? CLIENTE_LOGOS[item.nombre_cliente] ?? null,
      escenario: item.escenario || "Sin escenario",
      vertical: item.vertical || "Sin vertical",
      nivel_riesgo: isNivelRiesgo(nivel) ? nivel : "Medio",
      puntaje_global: item.puntaje_global ?? null,
      descripcion_base: null,
      monto_en_riesgo: item.monto_en_riesgo ?? null,
      moneda
    };

    return dto;
  });

  return mapped.filter((item) => {
    if (!item.captura_id) return false;
    return true;
  });
}
