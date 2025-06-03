// src/app/(main)/dashboard/page.tsx
"use client";

import { useState } from "react";
import { MissionSummaryCard } from "@/components/dashboard/MissionSummaryCard";
import { DailyQuizCard } from "@/components/dashboard/DailyQuizCard";
import { Zap, BarChart3, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const sampleMissions = [
  {
    id: "m1",
    title: "Explore Kepler-186f",
    description: "Chart the surface and analyze atmospheric composition of the exoplanet Kepler-186f.",
    status: "Active",
    progress: 65,
    deadline: "2024-12-31",
    crewSize: 4,
    objectiveCount: 5,
    imageUrl: "https://placehold.co/600x300/1A001A/39FF14.png?text=Kepler-186f",
    dataAiHint: "exoplanet surface",
  },
  {
    id: "m2",
    title: "Asteroid Mining Run",
    description: "Collect valuable minerals from the Psyche asteroid belt.",
    status: "Planned",
    progress: 0,
    deadline: "2025-03-15",
    crewSize: 2,
    objectiveCount: 3,
    imageUrl: "https://placehold.co/600x300/1A001A/7DF9FF.png?text=Asteroid+Belt",
    dataAiHint: "asteroid mining",
  },
  {
    id: "m3",
    title: "Terraform Mars Outpost",
    description: "Establish a self-sustaining habitat on the Martian surface.",
    status: "Completed",
    progress: 100,
    crewSize: 8,
    objectiveCount: 12,
    imageUrl: "https://placehold.co/600x300/1A001A/FFFFFF.png?text=Mars+Outpost",
    dataAiHint: "mars habitat",
  },
];

const MISSIONS_COMPLETED_STATIC = 1; // Number of missions with status "Completed"
const XP_PER_LEVEL = 500; // Example: XP needed to level up

export default function DashboardPage() {
  const [totalXp, setTotalXp] = useState(125); // Initial XP
  const [missionsCompleted, setMissionsCompleted] = useState(MISSIONS_COMPLETED_STATIC);

  const handleQuizCorrect = (xpEarned: number) => {
    setTotalXp(prevXp => prevXp + xpEarned);
  };

  const currentLevel = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const xpForNextLevel = totalXp % XP_PER_LEVEL;
  const progressToNextLevel = (xpForNextLevel / XP_PER_LEVEL) * 100;


  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-headline font-bold text-glow-primary tracking-wider">Mission Dashboard</h1>
        <div className="flex items-center gap-2 p-2 px-3 rounded-md bg-card/20 border border-accent/30 text-sm text-accent">
          <Zap className="w-4 h-4 animate-pulse" />
          <span>System Status: All Systems Nominal</span>
        </div>
      </div>

      <section>
        <h2 className="text-2xl font-headline font-semibold mb-4 text-glow-accent">Active & Upcoming Missions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleMissions.map((mission) => (
            <MissionSummaryCard key={mission.id} {...mission} data-ai-hint={mission.dataAiHint} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-headline font-semibold mb-4 text-glow-accent">Daily Galactic Challenge</h2>
        <DailyQuizCard onCorrectAnswer={handleQuizCorrect} />
      </section>

      <section>
        <h2 className="text-2xl font-headline font-semibold mb-4 text-glow-accent">Commander Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-2 text-primary flex items-center">
                  <Activity className="w-5 h-5 mr-2" /> Explorer XP
                </h3>
                <p className="text-4xl font-bold text-foreground mb-1">{totalXp.toLocaleString()} <span className="text-xl text-muted-foreground">XP</span></p>
                <div className="text-xs text-muted-foreground mb-2">Level {currentLevel}</div>
                <Progress value={progressToNextLevel} className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-accent [&>div]:to-primary" />
                <p className="text-xs text-muted-foreground mt-1 text-right">{XP_PER_LEVEL - xpForNextLevel} XP to next level</p>
            </div>
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-2 text-primary flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" /> Missions Completed
                </h3>
                <p className="text-4xl font-bold text-foreground">{missionsCompleted}</p>
                <p className="text-sm text-muted-foreground mt-1">Keep up the great work!</p>
            </div>
             <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-2 text-primary flex items-center">
                  <Zap className="w-5 h-5 mr-2" /> System Checks
                </h3>
                <p className="text-2xl font-bold text-green-400">All Nominal</p>
                <p className="text-sm text-muted-foreground mt-1">Last check: {new Date().toLocaleTimeString()}</p>
            </div>
        </div>
      </section>
    </div>
  );
}
