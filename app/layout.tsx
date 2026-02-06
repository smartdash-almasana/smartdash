import { ReactNode } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import "./globals.css";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">



        {/* Dashboard con sidebar + main content */}
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </body>
    </html>
  );
}




