# Fuente de la Verdad (FV) - SmartDash
Este documento es la autoridad máxima para el desarrollo.

## Conexión de Datos (Neon DB)
- **Precisión:** Prohibido usar datos mock o inferidos. Todo componente debe consumir datos crudos mediante SQL o el driver de Neon.
- **Esquema:** [Aquí debes pegar el esquema de tus tablas principales de Neon].
- **Tipado:** Uso obligatorio de TypeScript para reflejar exactamente las columnas de la DB.

## Estándar Visual (UI/UX)
- **Framework:** Next.js + Tailwind CSS.
- **Depuración:** Eliminar redundancias en componentes de Dashboard. Cada widget debe tener un solo propósito.