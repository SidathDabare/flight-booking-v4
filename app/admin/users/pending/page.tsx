"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PendingApprovals } from "@/components/admin/pending-approvals";
import { AdminSidebarTrigger } from "@/components/admin/admin-sidebar-trigger";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import LoadingScreen from "@/components/ui/loading-screen";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "client" | "agent" | "admin";
  isApproved: boolean;
  createdAt: string;
  emailVerified?: string;
}

export default function PendingApprovalsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/users?approved=false&role=agent");
      const data = await response.json();
      
      if (response.ok) {
        setPendingUsers(data.users);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch pending users",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while fetching pending users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

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

    fetchPendingUsers();
  }, [session, status, router, fetchPendingUsers]);

  if (status === "loading" || loading) {
    return <LoadingScreen />;
  }

  if (!session || session.user.role !== "admin") {
    return null;
  }

  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <AdminSidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold text-foreground">Pending Approvals</h1>
      </header>
      <main className="flex-1 overflow-auto">
        <PendingApprovals 
          pendingUsers={pendingUsers} 
          onUserUpdate={fetchPendingUsers} 
        />
      </main>
    </div>
  );
}