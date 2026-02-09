import { ClientesGrid } from "@/components/clientes-grid";
import { getClientesFromDB } from "@/lib/actions";
import { HeroWelcome } from "@/components/hero-welcome";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Obtener clientes desde servidor
  const clientesRaw = await getClientesFromDB();

  // Filtrar clientes válidos con id y preparar href directamente
  const clientes = (clientesRaw || [])
    .filter((c) => c.id)
    .map((c) => ({
      ...c,
      href: `/dashboard/casos/${c.id}`, // Actualizado a la nueva ruta
    }));

  return (
    <div className="min-h-screen bg-[#FDFDFF]">
      {/* Componente Header / Hero */}
      <HeroWelcome />

      {/* Contenido Principal - SE AÑADIÓ EL ID AQUÍ */}
      <div
        id="clientes-section"
        className="px-8 py-12 max-w-7xl mx-auto scroll-mt-20"
      >
        <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
          Panel de Clientes
        </h1>

        <p className="text-sm sm:text-base text-slate-600 mb-8 leading-relaxed max-w-3xl">
          Seleccioná un cliente para descubrir los escenarios de riesgo que
          enfrenta, y cómo{" "}
          <span className="font-semibold text-orange-600">SmartDash</span>{" "}
          detecta, comunica y te ayudará a prevenir problemas antes de que
          ocurran.
        </p>

        {/* Grid de clientes */}
        <ClientesGrid
          clientes={clientes}
          loading={!clientes || clientes.length === 0}
        />
      </div>
    </div>
  );
}
