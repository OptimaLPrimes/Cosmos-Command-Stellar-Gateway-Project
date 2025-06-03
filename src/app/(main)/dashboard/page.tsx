// src/app/(main)/dashboard/page.tsx
import { MissionSummaryCard } from "@/components/dashboard/MissionSummaryCard";
import { DailyQuizCard } from "@/components/dashboard/DailyQuizCard";
import { Zap } from "lucide-react";

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

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-headline font-bold text-glow-primary tracking-wider">Mission Dashboard</h1>
        <div className="flex items-center gap-2 p-2 px-3 rounded-md bg-card/20 border border-accent/30 text-sm text-accent">
          <Zap className="w-4 h-4 animate-pulse" />
          <span>Live Event Ticker: System Check Complete</span>
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
        <DailyQuizCard />
      </section>

      <section>
        <h2 className="text-2xl font-headline font-semibold mb-4 text-glow-accent">Overall Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-2 text-primary">Explorer XP</h3>
                <p className="text-3xl font-bold text-foreground">12,500 XP</p>
                {/* Add progress meter here */}
            </div>
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-2 text-primary">Missions Completed</h3>
                <p className="text-3xl font-bold text-foreground">27</p>
                 {/* Add progress meter here */}
            </div>
        </div>
      </section>
    </div>
  );
}
