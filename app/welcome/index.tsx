import { WelcomeScreen } from "@/components/welcome-screen";
import { getClientesFromDB } from "@/lib/actions";

/**
 * Página de Bienvenida - SmartDash FV
 * 
 * Esta página muestra:
 * - Pantalla 1A: Cards de Clientes (Perfil Compuesto)
 * - Pantalla 1B: Cards de Casos Testigo (Indicadores de Riesgo)
 * 
 * Fuentes de Verdad:
 * - Clientes: tabla `clientes`
 * - Casos: vista `vista_dashboard_riesgos_api`
 */
export default async function WelcomePage() {
    const clientes = await getClientesFromDB();
    return <WelcomeScreen initialClientes={clientes} />;
}

export const metadata = {
    title: "Bienvenida | SmartDash FV",
    description: "Motor de Detección de Riesgos - Protocolo de Auditoría",
};
