"use client";

import { usePathname } from "next/navigation";
import ClientNavbar from "@/components/client ui/ClientNavbar";
import Footer from "@/components/client ui/Footer";
import { ClientChatPopup } from "@/components/client ui/ClientChatPopup";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide navbar and footer on client dashboard routes
  const isClientDashboard = pathname?.startsWith('/client');

  return (
    <div className="flex min-h-screen w-full flex-col">
      {!isClientDashboard && <ClientNavbar />}
      <main className={!isClientDashboard ? "relative mt-[50px]" : ""}>
        {children}
      </main>
      {!isClientDashboard && <Footer />}
      {!isClientDashboard && <ClientChatPopup />}
    </div>
  );
}
