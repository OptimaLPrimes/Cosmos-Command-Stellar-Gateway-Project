// src/components/mission-game/MarsGame.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameHUD } from "@/components/mission-game/GameHUD";
import { Rocket, HardHat } from "lucide-react";
import { useMissionStore } from "@/stores/mission-game-store";

export function MarsGame() {
  const { missionTitle, progress } = useMissionStore();

  return (
    <div className="space-y-6">
      <GameHUD missionTitle={missionTitle || "Terraform Mars Outpost"} progress={progress || 0} />
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-glow-accent flex items-center">
            <Rocket className="w-6 h-6 mr-2" /> Mars Colonization Initiative
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <HardHat className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Blueprints Received...</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            The "Terraform Mars Outpost" game module is in its planning phase.
            Get ready to manage resources, build habitats, and establish a thriving Martian colony!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
