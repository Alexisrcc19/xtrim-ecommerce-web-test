import type { Metadata } from "next";
import "./admin.css";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { default: "Administración | Xtrim", template: "%s | Xtrim CRM" },
  description: "Administración comercial de la demostración Xtrim.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
