// src/components/planets/PlanetPreview.tsx
"use client";

import { type PlanetFormData } from "./PlanetGeneratorForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Eye, Thermometer, Wind, Mountain, Droplets, Atom } from "lucide-react";

interface PlanetPreviewProps {
  planetData: PlanetFormData | null;
}

const biomeColors: Record<PlanetFormData["biome"], string> = {
  desert: "bg-yellow-600",
  forest: "bg-green-600",
  ocean: "bg-blue-600",
  ice: "bg-sky-300",
  volcanic: "bg-red-700",
  barren: "bg-gray-500",
};

const terrainPatterns: Record<PlanetFormData["terrain"], string> = {
  mountainous: "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700 via-gray-800 to-gray-900",
  flatlands: "bg-gradient-to-br from-green-400 to-yellow-300",
  canyons: "bg-gradient-to-br from-orange-600 to-yellow-700",
  islands: "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500 via-teal-400 to-green-300",
  rolling_hills: "bg-gradient-to-br from-lime-500 to-emerald-400",
};


export function PlanetPreview({ planetData }: PlanetPreviewProps) {
  if (!planetData) {
    return (
      <div className="flex items-center justify-center h-96 glass-card text-muted-foreground">
        <Eye className="w-12 h-12 mr-4 text-primary/50" />
        <p className="text-xl">Awaiting parameters to generate planet preview...</p>
      </div>
    );
  }

  const planetStyle = {
    background: biomeColors[planetData.biome] || 'bg-gray-700',
    // More complex styles could be applied here based on planetData
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6"
    >
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-3xl font-headline text-glow-primary">
          Planet Preview: {planetData.seed.substring(0,8)}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row items-center md:items-start gap-8">
        <motion.div 
          className="w-48 h-48 md:w-64 md:h-64 rounded-full flex items-center justify-center shadow-2xl border-4 border-primary/50"
          style={{ background: biomeColors[planetData.biome] || 'bg-gray-700' }}
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          data-ai-hint="planet surface"
        >
           <div className={`w-[95%] h-[95%] rounded-full opacity-70 ${terrainPatterns[planetData.terrain] || ''}`}></div>
        </motion.div>
        
        <div className="flex-1 space-y-3 text-lg">
          <p className="flex items-center"><Atom className="w-5 h-5 mr-2 text-accent" /> <strong>Seed:</strong> {planetData.seed}</p>
          <p className="flex items-center"><Droplets className="w-5 h-5 mr-2 text-accent" /> <strong>Biome:</strong> <span className="capitalize">{planetData.biome.replace("_", " ")}</span></p>
          <p className="flex items-center"><Mountain className="w-5 h-5 mr-2 text-accent" /> <strong>Terrain:</strong> <span className="capitalize">{planetData.terrain.replace("_", " ")}</span></p>
          <p className="flex items-center"><Wind className="w-5 h-5 mr-2 text-accent" /> <strong>Atmosphere:</strong> <span className="capitalize">{planetData.atmosphere}</span></p>
          <p className="flex items-center"><Thermometer className="w-5 h-5 mr-2 text-accent" /> <strong>Gravity:</strong> {planetData.gravity} G</p>
        </div>
      </CardContent>
    </motion.div>
  );
}
