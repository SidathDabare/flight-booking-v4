"use client";

import { Separator } from "@/components/ui/separator";
import { CarouselManagement } from "@/components/admin/carousel-management";
import { OfferManagement } from "@/components/admin/offer-management";
import { LanguageSettings } from "@/components/admin/language-settings";
import { AdminSidebarTrigger } from "@/components/admin/admin-sidebar-trigger";

export default function AdminSettingsPage() {
  return (
    <div className="flex flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <AdminSidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h2 className="text-lg font-semibold text-foreground">Settings</h2>
      </header>

      {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize the admin panel appearance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Theme</p>
                <p className="text-xs text-muted-foreground">
                  Toggle between light and dark mode
                </p>
              </div>
              <AdminThemeToggle />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System</CardTitle>
            <CardDescription>
              System configuration and maintenance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              System settings and maintenance options will be available here.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Security and access control settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Security configuration options will be available here.
            </div>
          </CardContent>
        </Card>
      </div> */}

      <main className="flex-1 overflow-auto p-6 space-y-6">
        <LanguageSettings />
        <CarouselManagement />
        <OfferManagement />
      </main>
    </div>
  );
}
