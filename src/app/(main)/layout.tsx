// src/app/(main)/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Header } from "@/components/common/Header";
import { motion } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from "@/components/ui/sidebar";
import { RocketIcon, LayoutDashboard, Orbit, MessageCircle, Globe, Crosshair } from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/galaxy", label: "Galaxy Explorer", icon: Orbit },
  { href: "/chatbot", label: "Cosmic Oracle", icon: MessageCircle },
  { href: "/planets/preview", label: "Planet Forge", icon: Globe },
  { href: "/asteroid-field", label: "Asteroid Field", icon: Crosshair },
];

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarHeader className="p-4">
          <Link href="/dashboard" className="flex items-center gap-2 group/sidebar-item">
            <RocketIcon className="h-8 w-8 text-primary transition-transform duration-300 group-hover/sidebar-item:rotate-[15deg] group-data-[collapsible=icon]:mx-auto" />
            <span className="text-xl font-bold font-headline text-glow-primary group-data-[collapsible=icon]:hidden">
              Cosmos Command
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {sidebarNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
                  tooltip={{ children: item.label, className: "bg-background border-primary/50 text-foreground" }}
                  className={cn(
                    "group-data-[collapsible=icon]:justify-center",
                    (pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))) 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90"
                      : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Link href={item.href}>
                    <item.icon className="group-data-[collapsible=icon]:mx-auto" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        {/* Optional SidebarFooter can go here */}
      </Sidebar>
      <SidebarInset>
        <div className="flex min-h-screen flex-col">
          <Header />
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 container py-8 px-4 md:px-6"
          >
            {children}
          </motion.main>
          <Toaster />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
