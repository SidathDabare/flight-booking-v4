"use client";

import { forwardRef } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAdminTheme } from "./admin-theme-context";
import { cn } from "@/lib/utils";

type AdminSidebarTriggerProps = React.ComponentProps<typeof SidebarTrigger>

export const AdminSidebarTrigger = forwardRef<
  React.ElementRef<typeof SidebarTrigger>,
  AdminSidebarTriggerProps
>(({ className, ...props }, ref) => {
  const { theme } = useAdminTheme();

  return (
    <SidebarTrigger
      ref={ref}
      className={cn(
        "transition-colors duration-200",
        className
      )}
      {...props}
    />
  );
});

AdminSidebarTrigger.displayName = "AdminSidebarTrigger";