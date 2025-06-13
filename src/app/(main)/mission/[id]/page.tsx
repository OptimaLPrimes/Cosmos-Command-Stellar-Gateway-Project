// src/app/(main)/mission/[id]/page.tsx
"use client";

import { useEffect, use } from "react"; // Import use
import { KeplerGame } from "@/components/mission-game/KeplerGame";
import { AsteroidGame } from "@/components/mission-game/AsteroidGame";
import { MarsGame } from "@/components/mission-game/MarsGame";
import { useMissionStore, type MissionId } from "@/stores/mission-game-store";
import { AlertCircle } from "lucide-react"; 

interface MissionPageProps {
  params: Promise<{ // params is now expected to be a Promise
    id: string;
  }>;
}

export default function MissionPage({ params: paramsPromise }: MissionPageProps) {
  const params = use(paramsPromise); // Unwrap the promise using React.use()
  const { loadMissionData, resetMission } = useMissionStore();
  // missionTitle is part of the store, can be accessed by components that use the store

  useEffect(() => {
    // Reset mission state before loading new data to ensure clean state
    resetMission(); 
    loadMissionData(params.id as MissionId); // params.id is now from the resolved object

    // Cleanup function to reset store when component unmounts or params.id changes
    // This is important to avoid stale state if user navigates away and back
    return () => {
      resetMission();
    };
  }, [params.id, loadMissionData, resetMission]); // params.id is a stable string here

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
