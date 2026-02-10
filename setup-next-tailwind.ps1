<#
.SYNOPSIS
  Setup completo de Next.js 15 + Tailwind 4 en Windows
.DESCRIPTION
  - Limpia proyecto (node_modules, .next, package-lock.json)
  - Crea carpetas components/ y lib/
  - Genera package.json, next.config.js, app/globals.css, layout.tsx y page.tsx
  - Instala dependencias
  - Deja npm run dev listo para usar
.NOTES
  - PowerShell 7+ recomendado
  - Node.js >=18.17.0
#>

Write-Host "🔥 Setup Limpio Next.js 15 + Tailwind 4 para Windows..." -ForegroundColor Cyan

# -----------------------------
# 1. Limpiar proyecto
# -----------------------------
Write-Host "`nLimpiando proyecto..." -ForegroundColor Yellow
If (Test-Path "node_modules") { Remove-Item "node_modules" -Recurse -Force }
If (Test-Path ".next") { Remove-Item ".next" -Recurse -Force }
If (Test-Path "package-lock.json") { Remove-Item "package-lock.json" -Force }

# -----------------------------
# 2. Crear carpetas
# -----------------------------
Write-Host "Creando carpetas components/ y lib/ ..." -ForegroundColor Yellow
If (-Not (Test-Path "components")) { New-Item -ItemType Directory components | Out-Null }
If (-Not (Test-Path "lib")) { New-Item -ItemType Directory lib | Out-Null }
If (-Not (Test-Path "app")) { New-Item -ItemType Directory app | Out-Null }

# -----------------------------
# 3. Generar package.json
# -----------------------------
Write-Host "Generando package.json..." -ForegroundColor Yellow
$packageJson = @"
{
  "name": "smartd-dashboard",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "SET NODE_OPTIONS=--no-warnings && next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "15.1.3",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.4",
    "lucide-react": "^0.468.0",
    "@radix-ui/react-select": "^2.1.2",
    "react-select": "^5.8.2"
  },
  "devDependencies": {
    "@types/node": "^22.10.2",
    "@types/react": "^19.0.1",
    "@types/react-dom": "^19.0.2",
    "typescript": "^5.7.2",
    "tailwindcss": "^4.0.0",
    "eslint": "^9.17.0",
    "eslint-config-next": "^15.1.3",
    "prettier": "^3.4.2"
  }
}
"@
$packageJson | Out-File -Encoding UTF8 package.json

# -----------------------------
# 4. Generar next.config.js
# -----------------------------
Write-Host "Generando next.config.js..." -ForegroundColor Yellow
$nextConfig = @"
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    unoptimized: true
  }
};

module.exports = nextConfig;
"@
$nextConfig | Out-File -Encoding UTF8 next.config.js

# -----------------------------
# 5. Generar app/globals.css
# -----------------------------
Write-Host "Generando app/globals.css..." -ForegroundColor Yellow
$globalsCss = @"
@import 'tailwindcss';

/* Variables de color */
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --border: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --radius: 0.625rem;
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --border: oklch(0.269 0 0);
  --ring: oklch(0.439 0 0);
}

html, body {
  @apply overflow-hidden h-screen w-screen m-0 p-0 antialiased;
  background-color: var(--background);
  color: var(--foreground);
}
"@
$globalsCss | Out-File -Encoding UTF8 app/globals.css

# -----------------------------
# 6. Generar app/layout.tsx
# -----------------------------
Write-Host "Generando app/layout.tsx..." -ForegroundColor Yellow
$layoutTsx = @"
import './globals.css';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='es'>
      <body>{children}</body>
    </html>
  );
}
"@
$layoutTsx | Out-File -Encoding UTF8 app/layout.tsx

# -----------------------------
# 7. Generar app/page.tsx
# -----------------------------
Write-Host "Generando app/page.tsx..." -ForegroundColor Yellow
$pageTsx = @"
export default function Home() {
  return (
    <main className='flex items-center justify-center h-screen'>
      <h1 className='text-3xl font-bold'>¡Next.js + Tailwind 4 Listo!</h1>
    </main>
  );
}
"@
$pageTsx | Out-File -Encoding UTF8 app/page.tsx

# -----------------------------
# 8. Instalar dependencias
# -----------------------------
Write-Host "Instalando dependencias npm (esto puede tardar un minuto)..." -ForegroundColor Yellow
npm install

Write-Host "`n✅ Proyecto configurado correctamente. Ejecuta:" -ForegroundColor Green
Write-Host "   npm run dev" -ForegroundColor Green
Write-Host "y abre http://localhost:3000" -ForegroundColor Green
