// src/components/mission-game/AsteroidGame.tsx
"use client";

import { GameHUD } from "@/components/mission-game/GameHUD";
import { MissionChecklist } from "@/components/mission-game/MissionChecklist";
import { CrewPanel } from "@/components/mission-game/CrewPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useMissionStore } from "@/stores/mission-game-store";
import { Bot, ScanSearch, PackageCheck, DraftingCompass } from "lucide-react";
import Image from "next/image";

export function AsteroidGame() {
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
        setTimeout(() => {
          updateCrewStatus(crewMemberName, "Idle");
        }, 3000 + Math.random() * 2000); // Simulate varied task time
      }
    }
  };

  return (
    <div className="space-y-6">
      <GameHUD missionTitle={missionTitle || "Asteroid Mining Run"} progress={progress || 0} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-2xl font-headline text-glow-accent flex items-center">
                <DraftingCompass className="w-6 h-6 mr-2" /> Asteroid Belt Operations
              </CardTitle>
              <CardDescription>
                Manage your mining operation to extract valuable resources from the asteroid field.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-black/20 border border-primary/20">
                <h3 className="text-lg font-semibold text-primary mb-2">Sector Scan</h3>
                <Image 
                  src={imageUrl || "https://placehold.co/600x300/1A001A/7DF9FF.png?text=Asteroid+Field"} 
                  alt="Asteroid Field Scan" 
                  width={600} 
                  height={300} 
                  className="w-full h-auto rounded-md object-cover mb-2"
                  data-ai-hint={dataAiHint || "asteroid field space"}
                />
                <p className="text-sm text-muted-foreground">
                  Sensors indicate rich deposits of Iridium and Platinum. Watch out for unstable clusters.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Button 
                    onClick={() => handleObjectiveAction("asteroid_deploy_drones", "Bolt Unit 42")} 
                    disabled={objectives.find(obj => obj.id === "asteroid_deploy_drones")?.completed}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground btn-glow-accent"
                  >
                    <Bot className="mr-2 h-5 w-5" /> Deploy Mining Drones
                  </Button>
                  <Button 
                    onClick={() => handleObjectiveAction("asteroid_analyze_ore", "Bolt Unit 42")}
                    disabled={objectives.find(obj => obj.id === "asteroid_analyze_ore")?.completed || !objectives.find(obj => obj.id === "asteroid_deploy_drones")?.completed}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground btn-glow-accent"
                  >
                    <ScanSearch className="mr-2 h-5 w-5" /> Analyze Ore Composition
                  </Button>
                  <Button 
                    onClick={() => handleObjectiveAction("asteroid_collect_samples", "Jax 'Rubble' Riker")}
                    disabled={objectives.find(obj => obj.id === "asteroid_collect_samples")?.completed || !objectives.find(obj => obj.id === "asteroid_analyze_ore")?.completed}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground btn-glow-accent"
                  >
                    <PackageCheck className="mr-2 h-5 w-5" /> Collect Target Minerals
                  </Button>
                  <Button 
                    onClick={() => handleObjectiveAction("asteroid_return_cargo")}
                    disabled={!objectives.every(obj => obj.id === "asteroid_return_cargo" || obj.completed) || objectives.find(obj => obj.id === "asteroid_return_cargo")?.completed}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground btn-glow-primary"
                  >
                    Return Cargo to Base
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
