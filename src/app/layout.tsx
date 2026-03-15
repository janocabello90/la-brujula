import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "La Brújula de Contenido",
  description: "Tu repositorio de conocimiento estratégico. No te dice qué escribir. Te dice hacia dónde apuntar.",
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
