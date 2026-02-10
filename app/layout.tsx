import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Rutas corregidas apuntando a la subcarpeta landing
import Header from "../components/landing/Header";
import Footer from "../components/landing/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SmartDash | Inteligencia Anticipatoria",
  description: "Plataforma de seguridad operativa y análisis de riesgos B2B.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen flex flex-col antialiased bg-background text-foreground`}>
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}