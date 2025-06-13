// src/stores/mission-game-store.ts
import { create } from 'zustand';
import type { Objective, CrewMember, MissionId, MissionData } from '@/types/mission';

// Sample data for missions
const keplerMissionData: MissionData = {
  id: "kepler-186f",
  title: "Explore Kepler-186f",
  description: "Chart the surface and analyze atmospheric composition of the exoplanet Kepler-186f.",
  status: "Active",
  objectives: [
    { id: "kepler_deploy_rover", description: "Deploy Surface Rover 'Pathfinder'", completed: false },
    { id: "kepler_scan_terrain", description: "Collect & Scan 3 Terrain Samples", completed: false },
    { id: "kepler_measure_atmosphere", description: "Measure Atmospheric Composition", completed: false },
    { id: "kepler_return_data", description: "Return All Collected Data to Orbital Ship", completed: false },
  ],
  crew: [
    { name: "Dr. Aris Thorne", role: "Commander", status: "Idle", avatarUrl: "https://placehold.co/64x64/1A001A/39FF14.png?text=AT", dataAiHint: "male commander" },
    { name: "Nova 'Zip' Skyrider", role: "Rover Specialist", status: "Idle", avatarUrl: "https://placehold.co/64x64/1A001A/7DF9FF.png?text=NS", dataAiHint: "female specialist" },
    { name: "Dr. Orion Kael", role: "Scientist", status: "Idle", avatarUrl: "https://placehold.co/64x64/1A001A/FFFFFF.png?text=OK", dataAiHint: "male scientist" },
    { name: "TARS Unit 7", role: "Android", status: "Idle", avatarUrl: "https://placehold.co/64x64/1A001A/999999.png?text=T7", dataAiHint: "robot android" },
  ],
  progress: 0,
  imageUrl: "https://placehold.co/600x300/1A001A/39FF14.png?text=Kepler-186f",
  "data-ai-hint": "exoplanet surface"
};

const asteroidMissionData: MissionData = {
  id: "asteroid-mining-run",
  title: "Asteroid Mining Run",
  description: "Collect valuable minerals from the Psyche asteroid belt.",
  status: "Planned",
  objectives: [
    { id: "asteroid_deploy_drones", description: "Deploy Mining Drones (3)", completed: false },
    { id: "asteroid_analyze_ore", description: "Analyze Ore Composition", completed: false },
    { id: "asteroid_collect_samples", description: "Collect 500kg of Target Minerals", completed: false },
    { id: "asteroid_return_cargo", description: "Return Cargo to Collection Point", completed: false },
  ],
  crew: [
    { name: "Jax 'Rubble' Riker", role: "Pilot", status: "Idle", avatarUrl: "https://placehold.co/64x64/1A001A/FFD700.png?text=JR", dataAiHint: "male pilot rugged" },
    { name: "Bolt Unit 42", role: "Mining Specialist", status: "Idle", avatarUrl: "https://placehold.co/64x64/1A001A/B0B0B0.png?text=B42", dataAiHint: "mining robot" },
  ],
  progress: 0,
  imageUrl: "https://placehold.co/600x300/1A001A/7DF9FF.png?text=Asteroid+Belt",
  "data-ai-hint": "asteroid mining"
};

const marsMissionData: MissionData = {
  id: "terraform-mars-outpost",
  title: "Terraform Mars Outpost Alpha",
  description: "Establish a self-sustaining habitat on the Martian surface.",
  status: "Completed",
  objectives: [
    { id: "mars_deploy_habitat", description: "Deploy Main Habitat Module", completed: true },
    { id: "mars_setup_solar", description: "Activate Solar Power Array", completed: true },
    { id: "mars_water_extraction", description: "Establish Water Extraction Unit", completed: true },
    { id: "mars_first_crop", description: "Plant First Hydroponic Crop", completed: true },
    { id: "mars_system_check", description: "Run Full Systems Diagnostic", completed: true },
  ],
  crew: [
    { name: "Commander Eva Rostova", role: "Lead Engineer", status: "Mission Complete", avatarUrl: "https://placehold.co/64x64/1A001A/FF69B4.png?text=ER", dataAiHint: "female engineer" },
    { name: "Dr. Jian Li", role: "Botanist", status: "Mission Complete", avatarUrl: "https://placehold.co/64x64/1A001A/228B22.png?text=JL", dataAiHint: "asian botanist" },
    { name: "Marcus 'Mac' Cole", role: "Technician", status: "Mission Complete", avatarUrl: "https://placehold.co/64x64/1A001A/FFA500.png?text=MC", dataAiHint: "male technician" },
    { name: "Atlas Unit 03", role: "Construction Android", status: "Standby", avatarUrl: "https://placehold.co/64x64/1A001A/A9A9A9.png?text=A03", dataAiHint: "construction robot" },
  ],
  progress: 100,
  imageUrl: "https://placehold.co/600x300/1A001A/FFFFFF.png?text=Mars+Outpost",
  "data-ai-hint": "mars habitat"
};


const missionRegistry: Record<MissionId, MissionData> = {
  "kepler-186f": keplerMissionData,
  "asteroid-mining-run": asteroidMissionData,
  "terraform-mars-outpost": marsMissionData,
};

interface MissionGameState {
  missionId: MissionId | null;
  missionTitle: string;
  objectives: Objective[];
  crew: CrewMember[];
  progress: number;
  imageUrl?: string;
  dataAiHint?: string;
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
  imageUrl: undefined,
  dataAiHint: undefined,

  loadMissionData: (missionId) => {
    const missionData = missionRegistry[missionId];
    if (missionData) {
      set({
        missionId: missionData.id,
        missionTitle: missionData.title,
        objectives: missionData.objectives.map(obj => ({ ...obj })), // Ensure deep copy
        crew: missionData.crew.map(cr => ({ ...cr })), // Ensure deep copy
        progress: missionData.progress,
        imageUrl: missionData.imageUrl,
        dataAiHint: missionData["data-ai-hint"],
      });
    } else {
      // Fallback for unknown missions
      set({
        missionId: missionId,
        missionTitle: `Mission: ${missionId} (Data not found)`,
        objectives: [],
        crew: [],
        progress: 0,
        imageUrl: undefined,
        dataAiHint: undefined,
      });
    }
  },

  completeObjective: (objectiveId) => {
    set((state) => {
      const newObjectives = state.objectives.map((obj) =>
        obj.id === objectiveId ? { ...obj, completed: true } : obj
      );
      const completedCount = newObjectives.filter(obj => obj.completed).length;
      const newProgress = newObjectives.length > 0 ? (completedCount / newObjectives.length) * 100 : 0;
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
    if (currentMissionId && missionRegistry[currentMissionId]) {
         const missionData = missionRegistry[currentMissionId];
         set({
            missionId: missionData.id,
            missionTitle: missionData.title,
            objectives: missionData.objectives.map(obj => ({ ...obj, completed: missionData.status === "Completed" ? true : false })),
            crew: missionData.crew.map(cr => ({ ...cr, status: missionData.status === "Completed" ? "Mission Complete" : "Idle" })),
            progress: missionData.progress,
            imageUrl: missionData.imageUrl,
            dataAiHint: missionData["data-ai-hint"],
        });
    } else if (currentMissionId) {
        // Basic reset for other missions if they somehow get loaded without full data
        set({
            missionTitle: `Mission: ${currentMissionId}`,
            objectives: [], 
            crew: [],       
            progress: 0,
            imageUrl: undefined,
            dataAiHint: undefined,
        });
    }
  }
}));
