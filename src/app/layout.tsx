import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: "Planes de Internet para tu Hogar en Ecuador | Xtrim",
    template: "%s | Xtrim",
  },
  description:
    "Conoce nuestros planes de internet, compara velocidades y precios, y solicita información de forma rápida y sencilla.",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-EC">
      <body>{children}</body>
    </html>
  );
}
