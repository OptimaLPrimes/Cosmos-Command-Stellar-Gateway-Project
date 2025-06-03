// src/app/(main)/mission/[id]/page.tsx
"use client";

import { useEffect } from "react";
import { KeplerGame } from "@/components/mission-game/KeplerGame";
import { AsteroidGame } from "@/components/mission-game/AsteroidGame";
import { MarsGame } from "@/components/mission-game/MarsGame";
import { useMissionStore, type MissionId } from "@/stores/mission-game-store";
import { AlertCircle, Construction } from "lucide-react";

interface MissionPageProps {
  params: {
    id: string;
  };
}

export default function MissionPage({ params }: MissionPageProps) {
  const { loadMissionData, missionTitle } = useMissionStore();

  useEffect(() => {
    // For now, only Kepler mission has actual data loading logic.
    // This can be expanded as other missions are developed.
    if (params.id === "kepler-186f") {
      loadMissionData(params.id as MissionId);
    } else if (params.id === "asteroid-mining-run") {
      // Placeholder for loading asteroid mission data
      useMissionStore.setState({ missionTitle: "Asteroid Mining Run", objectives: [], crew: [], progress: 0 });
    } else if (params.id === "terraform-mars-outpost") {
      // Placeholder for loading Mars mission data
      useMissionStore.setState({ missionTitle: "Terraform Mars Outpost", objectives: [], crew: [], progress: 0 });
    } else {
      useMissionStore.setState({ missionTitle: "Unknown Mission", objectives: [], crew: [], progress: 0 });
    }
  }, [params.id, loadMissionData]);

  const renderMissionContent = () => {
    switch (params.id) {
      case "kepler-186f":
        return <KeplerGame />;
      case "asteroid-mining-run":
        return <AsteroidGame />;
      case "terraform-mars-outpost":
        return <MarsGame />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center glass-card p-8">
            <AlertCircle className="w-16 h-16 text-destructive mb-4" />
            <h1 className="text-3xl font-bold text-glow-primary mb-2">Mission Not Found</h1>
            <p className="text-muted-foreground">
              The mission ID "{params.id}" does not correspond to a known mission.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      {renderMissionContent()}
    </div>
  );
}
