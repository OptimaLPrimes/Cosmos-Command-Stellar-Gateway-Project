// src/components/mission-game/MarsGame.tsx
"use client";

import { GameHUD } from "@/components/mission-game/GameHUD";
import { MissionChecklist } from "@/components/mission-game/MissionChecklist";
import { CrewPanel } from "@/components/mission-game/CrewPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMissionStore } from "@/stores/mission-game-store";
import { CheckSquare, Users, Medal } from "lucide-react";
import Image from "next/image";

export function MarsGame() {
  const {
    missionTitle,
    objectives,
    crew,
    progress,
    imageUrl,
    dataAiHint,
  } = useMissionStore();

  // For completed missions, onObjectiveToggle might not do anything or could navigate elsewhere
  const handleObjectiveAction = (objId: string) => {
    // console.log("Objective clicked (completed mission):", objId);
  };

  return (
    <div className="space-y-6">
      <GameHUD missionTitle={missionTitle || "Mars Outpost Debrief"} progress={progress || 0} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-2xl font-headline text-glow-accent flex items-center">
                <Medal className="w-6 h-6 mr-2" /> Mission Debrief: Mars Outpost Alpha
              </CardTitle>
              <CardDescription>
                Review of the successful establishment of the first self-sustaining Martian habitat.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-black/20 border border-primary/20">
                <h3 className="text-lg font-semibold text-primary mb-2">Outpost Status: Fully Operational</h3>
                <Image 
                  src={imageUrl || "https://placehold.co/600x300/1A001A/FFFFFF.png?text=Mars+Outpost"} 
                  alt="Mars Outpost View" 
                  width={600} 
                  height={300} 
                  className="w-full h-auto rounded-md object-cover mb-2"
                  data-ai-hint={dataAiHint || "mars colony habitat"}
                />
                <p className="text-sm text-muted-foreground">
                  All systems nominal. The outpost is self-sufficient and supporting a crew of {crew.length}. Initial terraforming experiments are underway.
                </p>
              </div>
              
              <div className="p-4 glass-card border-green-500/50">
                <h4 className="text-md font-semibold text-green-400 mb-2 flex items-center">
                    <CheckSquare className="w-5 h-5 mr-2"/> Mission Accomplished
                </h4>
                <p className="text-sm text-muted-foreground">
                    All primary objectives for the establishment of Mars Outpost Alpha have been successfully completed. 
                    The crew performed exceptionally, overcoming numerous challenges to secure humanity's foothold on Mars.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <MissionChecklist objectives={objectives} onObjectiveToggle={handleObjectiveAction} />
          <CrewPanel crew={crew} />
        </div>
      </div>
    </div>
  );
}
