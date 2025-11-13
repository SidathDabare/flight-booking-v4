"use client";

import { useSession } from "next-auth/react";
import { AgentSidebarTrigger } from "@/components/agent/agent-sidebar-trigger";
import { Separator } from "@/components/ui/separator";
import { BookingManagement } from "@/components/admin/booking-management";

export default function BookingsPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session || session.user.role !== "agent" || !session.user.isApproved) {
    return null;
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <AgentSidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold text-foreground">
          All System Bookings
        </h1>
        <div className="ml-auto text-xs text-muted-foreground">
          System-wide view for agents
        </div>
      </header>
      <main className="flex-1 overflow-auto">
        <BookingManagement />
      </main>
    </div>
  );
}