import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "La Brújula de Contenido",
  description: "Tu repositorio de conocimiento estratégico. No te dice qué escribir. Te dice hacia dónde apuntar.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧭</text></svg>"
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
