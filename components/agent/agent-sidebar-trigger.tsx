"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface AgentSidebarTriggerProps {
  className?: string;
}

export function AgentSidebarTrigger({ className }: AgentSidebarTriggerProps) {
  return (
    <SidebarTrigger
      className={cn("shrink-0", className)}
    />
  );
}