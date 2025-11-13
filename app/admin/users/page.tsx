"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UserManagement } from "@/components/admin/user-management";
import { AdminSidebarTrigger } from "@/components/admin/admin-sidebar-trigger";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "client" | "agent" | "admin";
  isApproved: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data.users);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while fetching users",
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

    fetchUsers();
  }, [session, status, router, fetchUsers]);

  if (status === "loading" || loading) {
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
        <h1 className="text-lg font-semibold text-foreground">User Management</h1>
      </header>
      <main className="flex-1 overflow-auto">
        <UserManagement users={users} onUserUpdate={fetchUsers} />
      </main>
    </div>
  );
}