"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  BarChart3,
  Users,
  Settings,
  Home,
  LogOut,
  User,
  Plane,
  Shield,
  ChevronRight,
  Mail,
  FileText,
  MessageSquare,
} from "lucide-react";
import { useUnreadMessages } from "@/lib/unread-messages-context";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminThemeToggle } from "@/components/admin/admin-theme-toggle";

type NavigationItem = {
  title: string;
  url: string;
  icon: React.ComponentType<any>;
  items?: { title: string; url: string }[];
};

const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: BarChart3,
  },
  {
    title: "User Management",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "All Bookings",
    url: "/admin/bookings",
    icon: Plane,
  },
  {
    title: "Messages",
    url: "/admin/messages",
    icon: MessageSquare,
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
  },
  {
    title: "Email Preview",
    url: "/admin/email-preview",
    icon: Mail,
  },
  {
    title: "PDF Preview",
    url: "/admin/pdf-preview",
    icon: FileText,
  },
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
];

export function AdminSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { unreadCount } = useUnreadMessages();
  console.log("Unread Count in Sidebar:", unreadCount);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary text-yellow-500 fill-yellow-500" />
            <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">
              Admin Panel
            </span>
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <AdminThemeToggle />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isExpanded = expandedItems.includes(item.title);
                const hasSubItems =
                  "items" in item && item.items && item.items.length > 0;

                return (
                  <SidebarMenuItem key={item.title}>
                    {hasSubItems ? (
                      <>
                        <SidebarMenuButton
                          onClick={() => toggleExpanded(item.title)}
                          className="w-full justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </div>
                          <ChevronRight
                            className={`h-4 w-4 transition-transform ${
                              isExpanded ? "rotate-90" : ""
                            }`}
                          />
                        </SidebarMenuButton>
                        {isExpanded && "items" in item && (
                          <SidebarMenuSub>
                            {item.items!.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={pathname === subItem.url}
                                >
                                  <Link href={subItem.url}>
                                    {subItem.title}
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        )}
                      </>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.url}
                      >
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          {item.title === "Messages" && unreadCount > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                              {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-12">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session?.user?.profileImage || ""} />
                    <AvatarFallback>
                      {session?.user?.name?.[0]?.toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start group-data-[collapsible=icon]:hidden">
                    <span className="font-medium text-sm">
                      {session?.user?.name || "Admin"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {session?.user?.email}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
