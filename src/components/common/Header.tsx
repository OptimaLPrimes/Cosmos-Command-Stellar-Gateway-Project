// src/components/common/Header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Orbit, MessageCircle, Globe, RocketIcon, Crosshair, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar"; // Import SidebarTrigger

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/galaxy", label: "Galaxy Explorer", icon: Orbit },
  { href: "/chatbot", label: "Cosmic Oracle", icon: MessageCircle },
  { href: "/planets/preview", label: "Planet Forge", icon: Globe },
  { href: "/asteroid-field", label: "Asteroid Field", icon: Crosshair },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-primary/20 bg-background/80 backdrop-blur-lg md:z-50">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden text-primary hover:text-primary/80 hover:bg-primary/10" /> {/* Sidebar trigger for mobile */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <RocketIcon className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold font-headline text-glow-primary hidden sm:inline">Cosmos Command</span>
          </Link>
        </div>
        
        {/* Desktop navigation - can be kept or removed if sidebar is preferred as primary on desktop */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              asChild
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary focus-visible:text-primary focus-visible:ring-primary",
                (pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))) 
                  ? "text-primary font-semibold" 
                  : "text-muted-foreground"
              )}
            >
              <Link href={item.href} className="flex items-center gap-2 px-3 py-2">
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>

        {/* If desktop nav is removed, add a placeholder or other actions here if needed */}
         <div className="md:hidden">
          {/* Placeholder for other mobile header actions if sidebar trigger is not enough */}
        </div>
      </div>
    </header>
  );
}
