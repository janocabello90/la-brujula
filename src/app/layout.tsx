import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "El Sistema de Buena Vida — Jano Cabello",
  description: "Conocimiento y sistemas para seguir generando valor. Tres herramientas conectadas para construir, estructurar y ejecutar tu marca personal con estrategia.",
  icons: {
    icon: "/favicon.svg",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="font-body bg-crema text-negro min-h-screen">
        {children}
      </body>
    </html>
  );
}
