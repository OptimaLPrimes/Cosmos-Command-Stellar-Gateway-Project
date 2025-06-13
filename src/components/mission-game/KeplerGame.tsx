// src/components/mission-game/KeplerGame.tsx
"use client";

import { GameHUD } from "@/components/mission-game/GameHUD";
import { MissionChecklist } from "@/components/mission-game/MissionChecklist";
import { CrewPanel } from "@/components/mission-game/CrewPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useMissionStore } from "@/stores/mission-game-store";
import { ScanLine, Telescope, Navigation2, Bot, SendToBack } from "lucide-react";
import Image from "next/image";

export function KeplerGame() {
  const {
    missionTitle,
    objectives,
    crew,
    progress,
    imageUrl,
    dataAiHint,
    completeObjective,
    updateCrewStatus,
  } = useMissionStore();

  const handleObjectiveAction = (objId: string, crewMemberName?: string) => {
    if (!objectives.find(obj => obj.id === objId)?.completed) {
      completeObjective(objId);
      if (crewMemberName) {
        updateCrewStatus(crewMemberName, "Tasking...");
        // Simulate task completion with varied time
        setTimeout(() => {
          updateCrewStatus(crewMemberName, "Idle");
        }, 2000 + Math.random() * 3000);
      }
    }
  };

  return (
    <div className="space-y-6">
      <GameHUD missionTitle={missionTitle || "Explore Kepler-186f"} progress={progress || 0} />

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
                  src={imageUrl || "https://placehold.co/600x300/1A001A/39FF14.png?text=Kepler-186f+Surface"} 
                  alt="Kepler-186f Surface Scan" 
                  width={600} 
                  height={300} 
                  className="w-full h-auto rounded-md object-cover mb-2"
                  data-ai-hint={dataAiHint || "exoplanet surface landscape"}
                />
                <p className="text-sm text-muted-foreground">
                  Current sensor readings indicate a rocky terrain with potential for liquid water. Atmospheric composition analysis pending.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Button 
                    onClick={() => handleObjectiveAction("kepler_deploy_rover", "Nova 'Zip' Skyrider")} 
                    disabled={objectives.find(obj => obj.id === "kepler_deploy_rover")?.completed}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground btn-glow-accent"
                  >
                    <Navigation2 className="mr-2 h-5 w-5" /> Deploy Rover
                  </Button>
                  <Button 
                    onClick={() => handleObjectiveAction("kepler_scan_terrain", "TARS Unit 7")}
                    disabled={objectives.find(obj => obj.id === "kepler_scan_terrain")?.completed || !objectives.find(obj => obj.id === "kepler_deploy_rover")?.completed}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground btn-glow-accent"
                  >
                    <ScanLine className="mr-2 h-5 w-5" /> Scan Terrain Samples
                  </Button>
                  <Button 
                    onClick={() => handleObjectiveAction("kepler_measure_atmosphere", "Dr. Orion Kael")}
                    disabled={objectives.find(obj => obj.id === "kepler_measure_atmosphere")?.completed || !objectives.find(obj => obj.id === "kepler_deploy_rover")?.completed}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground btn-glow-accent"
                  >
                    <Bot className="mr-2 h-5 w-5" /> Measure Atmosphere
                  </Button>
                  <Button 
                    onClick={() => handleObjectiveAction("kepler_return_data", "Dr. Aris Thorne")}
                    disabled={!objectives.filter(o => o.id !== "kepler_return_data").every(obj => obj.completed) || objectives.find(obj => obj.id === "kepler_return_data")?.completed}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground btn-glow-primary"
                  >
                    <SendToBack className="mr-2 h-5 w-5" /> Return Data to Ship
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
