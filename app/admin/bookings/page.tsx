"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookingManagement } from "@/components/admin/booking-management";
import { AdminSidebarTrigger } from "@/components/admin/admin-sidebar-trigger";
import { Separator } from "@/components/ui/separator";

export default function AdminBookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (session.user.role !== "admin") {
      router.push("/unauthorized");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session || session.user.role !== "admin") {
    return null;
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <AdminSidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold text-foreground">Booking Management</h1>
      </header>
      <main className="flex-1 overflow-auto">
        <BookingManagement />
      </main>
    </div>
  );
}