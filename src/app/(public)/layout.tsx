import { Header, Footer } from "@/components/site";
import { PlanModals } from "@/components/plan-modals";
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlanModals>
      <Header />
      {children}
      <Footer />
    </PlanModals>
  );
}
