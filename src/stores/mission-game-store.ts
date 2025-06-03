// src/stores/mission-game-store.ts
import { create } from 'zustand';
import type { Objective, CrewMember, MissionId, MissionData } from '@/types/mission';

// Sample data for Kepler-186f mission
const keplerMissionData: MissionData = {
  id: "kepler-186f",
  title: "Explore Kepler-186f",
  description: "Chart the surface and analyze atmospheric composition of the exoplanet Kepler-186f.",
  status: "Active",
  objectives: [
    { id: "deploy_rover", description: "Deploy Surface Rover 'Pathfinder'", completed: false },
    { id: "scan_terrain_samples", description: "Collect & Scan 3 Terrain Samples", completed: false },
    { id: "measure_atmosphere", description: "Measure Atmospheric Composition", completed: false },
    { id: "return_data_to_ship", description: "Return All Collected Data to Orbital Ship", completed: false },
  ],
  crew: [
    { name: "Dr. Aris Thorne", role: "Commander", status: "Idle", avatarUrl: "https://placehold.co/64x64/1A001A/39FF14.png?text=AT", dataAiHint: "male commander" },
    { name: "Nova", role: "Rover Specialist", status: "Idle", avatarUrl: "https://placehold.co/64x64/1A001A/7DF9FF.png?text=NV", dataAiHint: "female specialist" },
    { name: "Orion Kael", role: "Scientist", status: "Idle", avatarUrl: "https://placehold.co/64x64/1A001A/FFFFFF.png?text=OK", dataAiHint: "male scientist" },
    { name: "TARS Unit 7", role: "Android", status: "Idle", avatarUrl: "https://placehold.co/64x64/1A001A/999999.png?text=T7", dataAiHint: "robot android" },
  ],
  progress: 0,
  imageUrl: "https://placehold.co/600x300/1A001A/39FF14.png?text=Kepler-186f",
  "data-ai-hint": "exoplanet surface"
};

interface MissionGameState {
  missionId: MissionId | null;
  missionTitle: string;
  objectives: Objective[];
  crew: CrewMember[];
  progress: number;
  loadMissionData: (missionId: MissionId) => void;
  completeObjective: (objectiveId: string) => void;
  updateCrewStatus: (crewMemberName: string, status: string) => void;
  resetMission: () => void;
}

export const useMissionStore = create<MissionGameState>((set, get) => ({
  missionId: null,
  missionTitle: "No Mission Loaded",
  objectives: [],
  crew: [],
  progress: 0,

  loadMissionData: (missionId) => {
    // In a real app, this would fetch data from a backend
    // For now, we'll use hardcoded data for Kepler-186f
    if (missionId === "kepler-186f") {
      set({
        missionId: keplerMissionData.id,
        missionTitle: keplerMissionData.title,
        objectives: keplerMissionData.objectives.map(obj => ({ ...obj })), // Ensure deep copy
        crew: keplerMissionData.crew.map(cr => ({ ...cr })), // Ensure deep copy
        progress: keplerMissionData.progress,
      });
    } else {
      // Placeholder for other missions
      set({
        missionId: missionId,
        missionTitle: `Mission: ${missionId}`,
        objectives: [],
        crew: [],
        progress: 0,
      });
    }
  },

  completeObjective: (objectiveId) => {
    set((state) => {
      const newObjectives = state.objectives.map((obj) =>
        obj.id === objectiveId ? { ...obj, completed: true } : obj
      );
      const completedCount = newObjectives.filter(obj => obj.completed).length;
      const newProgress = (completedCount / newObjectives.length) * 100;
      return { objectives: newObjectives, progress: Math.round(newProgress) };
    });
  },

  updateCrewStatus: (crewMemberName, status) => {
    set((state) => ({
      crew: state.crew.map((member) =>
        member.name === crewMemberName ? { ...member, status } : member
      ),
    }));
  },
  
  resetMission: () => {
    const currentMissionId = get().missionId;
    if (currentMissionId === "kepler-186f") {
         set({
            missionId: keplerMissionData.id,
            missionTitle: keplerMissionData.title,
            objectives: keplerMissionData.objectives.map(obj => ({ ...obj, completed: false })),
            crew: keplerMissionData.crew.map(cr => ({ ...cr, status: "Idle" })),
            progress: 0,
        });
    } else if (currentMissionId) {
        // Basic reset for other missions
        set({
            missionTitle: `Mission: ${currentMissionId}`,
            objectives: [], // Or re-fetch/re-initialize as needed
            crew: [],       // Or re-fetch/re-initialize as needed
            progress: 0,
        });
    }
  }
}));
