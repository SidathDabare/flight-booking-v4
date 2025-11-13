"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingScreen from "@/components/ui/loading-screen";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminThemeProvider } from "@/components/admin/admin-theme-context";

export default function AdminLayout({
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

    if (session.user.role !== "admin") {
      router.push("/unauthorized");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <LoadingScreen />;
  }

  if (!session || session.user.role !== "admin") {
    return null;
  }

  return (
    <AdminThemeProvider>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </AdminThemeProvider>
  );
}
