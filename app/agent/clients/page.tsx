"use client";

import { AgentSidebarTrigger } from "@/components/agent/agent-sidebar-trigger";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Search } from "lucide-react";
import Link from "next/link";

export default function ClientsPage() {
  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <AgentSidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold text-foreground">
          Client Management
        </h1>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
          <Button asChild size="sm">
            <Link href="/agent/clients/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>My Clients</CardTitle>
            <CardDescription>
              Manage your client relationships and contact information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No clients yet</h3>
              <p className="text-muted-foreground mb-4">
                Start building your client base by adding your first client
              </p>
              <Button asChild>
                <Link href="/agent/clients/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Client
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}