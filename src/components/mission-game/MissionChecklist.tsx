// src/components/mission-game/MissionChecklist.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, CircleDot, ListChecks } from "lucide-react";
import type { Objective } from "@/types/mission";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MissionChecklistProps {
  objectives: Objective[];
  onObjectiveToggle: (objectiveId: string) => void; 
}

export function MissionChecklist({ objectives, onObjectiveToggle }: MissionChecklistProps) {
  if (!objectives || objectives.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-glow-accent flex items-center">
            <ListChecks className="w-5 h-5 mr-2" /> Mission Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No objectives defined for this mission.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-xl font-headline text-glow-accent flex items-center">
           <ListChecks className="w-5 h-5 mr-2" /> Mission Objectives
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {objectives.map((obj, index) => (
          <motion.div
            key={obj.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ease-in-out",
              obj.completed 
                ? "bg-green-600/30 border-green-500/60 shadow-lg shadow-green-500/20" 
                : "bg-background/30 border-primary/30 hover:border-primary/60 hover:shadow-primary/20",
            )}
          >
            <div className="flex items-center gap-3">
              {obj.completed ? (
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 animate-pulse" />
              ) : (
                <CircleDot className="w-5 h-5 text-primary/80 flex-shrink-0" />
              )}
              <span
                // htmlFor={`obj-${obj.id}`} // No checkbox, so no htmlFor needed
                className={cn(
                  "text-sm font-medium",
                  obj.completed ? "text-green-300 line-through opacity-80" : "text-foreground"
                )}
              >
                {obj.description}
              </span>
            </div>
            {/* Removed checkbox, as completion is usually tied to game actions */}
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
