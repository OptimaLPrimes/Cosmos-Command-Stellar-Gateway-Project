// src/components/mission-game/CrewPanel.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle, Radio, Wrench, FlaskConical, Check, ShieldQuestion } from "lucide-react"; // Added Check, ShieldQuestion
import type { CrewMember } from "@/types/mission";
import { cn } from "@/lib/utils";

interface CrewPanelProps {
  crew: CrewMember[];
}

const getRoleIcon = (role: string) => {
  switch (role.toLowerCase()) {
    case "commander":
      return <UserCircle className="w-4 h-4 text-primary" />;
    case "scientist":
      return <FlaskConical className="w-4 h-4 text-accent" />;
    case "engineer":
      return <Wrench className="w-4 h-4 text-yellow-400" />;
    case "pilot":
      return <Radio className="w-4 h-4 text-blue-400" />; // Placeholder for pilot
    case "rover specialist":
        return <Check className="w-4 h-4 text-orange-400" />; // Placeholder for rover specialist
    case "android":
        return <ShieldQuestion className="w-4 h-4 text-gray-400" />; // Placeholder for android
    default:
      return <UserCircle className="w-4 h-4 text-muted-foreground" />;
  }
};

export function CrewPanel({ crew }: CrewPanelProps) {
  if (!crew || crew.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-glow-accent">Crew Manifest</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No crew assigned to this mission.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-xl font-headline text-glow-accent">Crew Manifest</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {crew.map((member) => (
          <div key={member.name} className="flex items-center justify-between p-3 bg-background/30 rounded-lg border border-primary/20 shadow-md">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-primary">
                <AvatarImage src={member.avatarUrl || `https://placehold.co/64x64/1A001A/39FF14.png?text=${member.name.charAt(0)}`} alt={member.name} data-ai-hint={member.dataAiHint || "profile astronaut"} />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">{member.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 capitalize">
                  {getRoleIcon(member.role)} {member.role}
                </p>
              </div>
            </div>
            <div className={cn(
              "text-xs px-2.5 py-1 rounded-full font-medium tracking-wide",
              member.status.toLowerCase() === "idle" ? "bg-green-500/20 text-green-300 border border-green-500/50" :
              member.status.toLowerCase() === "tasking..." || member.status.toLowerCase() === "analyzing data" ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 animate-pulse" :
              "bg-gray-500/20 text-gray-300 border border-gray-500/50"
            )}>
              {member.status}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
