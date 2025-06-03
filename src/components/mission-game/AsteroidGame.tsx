// src/components/mission-game/AsteroidGame.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameHUD } from "./GameHUD";
import { ShieldAlert, Mine } from "lucide-react";
import { useMissionStore } from "@/stores/mission-game-store";

export function AsteroidGame() {
  const { missionTitle, progress } = useMissionStore();

  return (
    <div className="space-y-6">
      <GameHUD missionTitle={missionTitle || "Asteroid Mining Run"} progress={progress || 0} />
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-glow-accent flex items-center">
            <Mine className="w-6 h-6 mr-2" /> Asteroid Field Operations
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <ShieldAlert className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Engines Priming...</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            The "Asteroid Mining Run" game module is currently under intensive development.
            Prepare your mining lasers and cargo drones for an upcoming resource extraction challenge!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
