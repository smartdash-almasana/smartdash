import { ReactNode } from "react";
import "./globals.css";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        {/* Aquí NO incluimos el DashboardLayout ni el Sidebar */}
        {children}
      </body>
    </html>
  );
}




