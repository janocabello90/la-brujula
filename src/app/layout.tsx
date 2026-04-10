import type { Metadata } from "next";
import "./globals.css";
import AuthListener from "@/components/AuthListener";

export const metadata: Metadata = {
  title: "El Sistema de Buena Vida — Jano Cabello",
  description: "Conocimiento y sistemas para seguir generando valor. Tres herramientas conectadas para construir, estructurar y ejecutar tu marca personal con estrategia.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* Material Symbols — must load via <link> for Next.js */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
        {/* Bricolage Grotesque + DM Sans + Plus Jakarta Sans */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Epilogue:wght@400;600;700;800&display=swap"
        />
      </head>
      <body className="font-body bg-surface text-on-surface min-h-screen antialiased">
        <AuthListener />
        {children}
      </body>
    </html>
  );
}
