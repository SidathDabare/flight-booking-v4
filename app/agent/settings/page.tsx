"use client";

import { AgentSidebarTrigger } from "@/components/agent/agent-sidebar-trigger";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <AgentSidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold text-foreground">
          Agent Settings
        </h1>
      </header>
      <main className="flex-1 overflow-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>
              Configure your agent preferences and account settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Settings className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Settings Coming Soon</h3>
              <p className="text-muted-foreground">
                Agent configuration options will be available here
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}