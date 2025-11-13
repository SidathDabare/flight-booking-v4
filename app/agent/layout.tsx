"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingScreen from "@/components/ui/loading-screen";
import { AgentSidebar } from "@/components/agent/agent-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function AgentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (session.user.role !== "agent") {
      router.push("/unauthorized");
      return;
    }

    if (!session.user.isApproved) {
      router.push("/pending-approval");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <LoadingScreen />;
  }

  if (!session || session.user.role !== "agent" || !session.user.isApproved) {
    return null;
  }

  return (
    <SidebarProvider>
      <AgentSidebar />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}