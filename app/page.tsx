import { DashboardContent } from '@/components/dashboard-content'
import { filterByRubro } from '@/lib/actions'
import { RUBROS } from '@/lib/data'

export default async function SmartDashboard() {
  // Fetch initial data on the server using the unified contract
  const initialData = await filterByRubro('all')

  if (!initialData) {
    return (
      <div className="flex h-screen items-center justify-center text-center p-8 text-muted-foreground">
        <div>
          <h1 className="text-2xl font-bold mb-2">Sin datos disponibles</h1>
          <p>No se pudo cargar la informacion del dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardContent
      initialData={initialData}
      rubros={RUBROS}
    />
  )
}
