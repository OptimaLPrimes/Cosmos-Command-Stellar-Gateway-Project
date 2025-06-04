// src/components/common/Header.tsx
"use client";

import Link from "next/link";
import { RocketIcon } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar"; 

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-primary/20 bg-background/80 backdrop-blur-lg md:z-50">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3"> {/* Increased gap for better spacing */}
          <SidebarTrigger className="md:hidden text-primary hover:text-primary/80 hover:bg-primary/10" /> {/* Sidebar trigger for mobile */}
          <Link href="/dashboard" className="flex items-center gap-3"> {/* Increased gap */}
            <RocketIcon className="h-9 w-9 text-primary" /> {/* Increased icon size */}
            <span className="text-3xl font-bold font-headline text-glow-primary hidden sm:inline"> {/* Increased text size */}
              Stellar Gateway Quest
            </span>
          </Link>
        </div>
        
        {/* Desktop navigation has been removed as it's handled by the sidebar */}

         <div className="md:hidden">
          {/* Placeholder for other mobile header actions if sidebar trigger is not enough */}
        </div>
      </div>
    </header>
  );
}
