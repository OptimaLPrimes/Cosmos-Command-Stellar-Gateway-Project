// src/components/mission-game/KeplerGame.tsx
"use client";

import { GameHUD } from "@/components/mission-game/GameHUD";
import { MissionChecklist } from "@/components/mission-game/MissionChecklist";
import { CrewPanel } from "@/components/mission-game/CrewPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useMissionStore } from "@/stores/mission-game-store";
import { ScanLine, Telescope, Rover, Bot } from "lucide-react";
import Image from "next/image";

export function KeplerGame() {
  const {
    missionTitle,
    objectives,
    crew,
    progress,
    completeObjective,
    updateCrewStatus,
  } = useMissionStore();

  const handleObjectiveAction = (objId: string, crewMemberName?: string) => {
    if (!objectives.find(obj => obj.id === objId)?.completed) {
      completeObjective(objId);
      if (crewMemberName) {
        updateCrewStatus(crewMemberName, "Tasking...");
        // Simulate task completion
        setTimeout(() => {
          updateCrewStatus(crewMemberName, "Idle");
        }, 3000);
      }
    }
  };

  return (
    <div className="space-y-6">
      <GameHUD missionTitle={missionTitle} progress={progress} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-2xl font-headline text-glow-accent flex items-center">
                <Telescope className="w-6 h-6 mr-2" /> Kepler-186f Operations
              </CardTitle>
              <CardDescription>
                Manage your crew and equipment to gather vital data from this Earth-like exoplanet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-black/20 border border-primary/20">
                <h3 className="text-lg font-semibold text-primary mb-2">Planetary Scan</h3>
                <Image 
                  src="https://placehold.co/600x300/1A001A/39FF14.png?text=Kepler-186f+Surface" 
                  alt="Kepler-186f Surface Scan" 
                  width={600} 
                  height={300} 
                  className="w-full h-auto rounded-md object-cover mb-2"
                  data-ai-hint="exoplanet surface landscape"
                />
                <p className="text-sm text-muted-foreground">
                  Current sensor readings indicate a rocky terrain with potential for liquid water. Atmospheric composition analysis pending.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Button 
                    onClick={() => handleObjectiveAction("deploy_rover", "Nova")} 
                    disabled={objectives.find(obj => obj.id === "deploy_rover")?.completed}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground btn-glow-accent"
                  >
                    <Rover className="mr-2 h-5 w-5" /> Deploy Rover
                  </Button>
                  <Button 
                    onClick={() => handleObjectiveAction("scan_terrain_samples", "Tars")}
                    disabled={objectives.find(obj => obj.id === "scan_terrain_samples")?.completed}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground btn-glow-accent"
                  >
                    <ScanLine className="mr-2 h-5 w-5" /> Scan Terrain Samples (3)
                  </Button>
                  <Button 
                    onClick={() => handleObjectiveAction("measure_atmosphere", "Orion")}
                    disabled={objectives.find(obj => obj.id === "measure_atmosphere")?.completed}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground btn-glow-accent"
                  >
                    <Bot className="mr-2 h-5 w-5" /> Measure Atmosphere
                  </Button>
                  <Button 
                    onClick={() => handleObjectiveAction("return_data_to_ship")}
                    disabled={!objectives.every(obj => obj.id === "return_data_to_ship" || obj.completed) || objectives.find(obj => obj.id === "return_data_to_ship")?.completed}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground btn-glow-primary"
                  >
                    Return Data to Ship
                  </Button>
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
