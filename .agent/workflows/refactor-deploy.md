# Workflow: Refactor y Deploy SmartDash
1. **Análisis de Deuda Técnica:** Revisar componentes en `src/components/dashboard` y comparar contra la FV.
2. **Depuración Visual:** Simplificar el uso de Tailwind, remover estilos no usados y asegurar la consistencia del tema.
3. **Validación de Datos Neon:** Verificar que las queries SQL en los Server Components coincidan con el esquema de la DB.
4. **Pre-check de Vercel:** - Verificar `next.config.js`.
   - Asegurar que las variables de entorno (`DATABASE_URL`) estén configuradas para el runtime de Vercel.
5. **Simulación de Build:** Ejecutar un build local para detectar errores de tipado antes del deploy.