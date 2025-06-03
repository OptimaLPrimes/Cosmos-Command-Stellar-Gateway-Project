// src/types/mission.ts

export interface Objective {
  id: string;
  description: string;
  completed: boolean;
}

export interface CrewMember {
  name: string;
  role: string;
  status: string; // e.g., "Idle", "Scanning", "Analyzing"
  avatarUrl?: string; // URL for the crew member's avatar image
  dataAiHint?: string; // Optional hint for AI image generation if avatarUrl is a placeholder
}

export type MissionStatus = "Planned" | "Active" | "Completed";

export type MissionId = "kepler-186f" | "asteroid-mining-run" | "terraform-mars-outpost" | string;

export interface MissionData {
  id: MissionId;
  title: string;
  description: string;
  status: MissionStatus;
  objectives: Objective[];
  crew: CrewMember[];
  progress: number; // Overall mission progress (0-100)
  imageUrl?: string;
  "data-ai-hint"?: string;
}
