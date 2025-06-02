// src/app/(main)/layout.tsx
"use client";

import { Header } from "@/components/common/Header";
import { motion } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
  );
}
