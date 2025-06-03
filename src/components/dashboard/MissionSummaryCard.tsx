// src/components/dashboard/MissionSummaryCard.tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Users, Target } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface MissionSummaryCardProps {
  id: string;
  title: string;
  description: string;
  status: "Planned" | "Active" | "Completed";
  progress: number;
  deadline?: string;
  crewSize?: number;
  objectiveCount?: number;
  imageUrl?: string;
  "data-ai-hint"?: string;
}

export function MissionSummaryCard({
  title,
  description,
  status,
  progress,
  deadline,
  crewSize,
  objectiveCount,
  imageUrl = "https://placehold.co/300x150.png",
  "data-ai-hint": dataAiHint = "space mission",
}: MissionSummaryCardProps) {
  const statusColors = {
    Planned: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    Active: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    Completed: "bg-green-500/20 text-green-400 border-green-500/50",
  };

  return (
    <Card className="glass-card overflow-hidden transform transition-all hover:scale-[1.02] hover:shadow-primary/40">
      <CardHeader className="p-0">
        <Image 
          src={imageUrl} 
          alt={title} 
          width={300} 
          height={150} 
          className="w-full h-36 object-cover"
          data-ai-hint={dataAiHint} 
        />
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <CardTitle className="text-xl font-headline text-glow-primary">{title}</CardTitle>
            <Badge variant="outline" className={cn("text-xs", statusColors[status])}>{status}</Badge>
          </div>
          <CardDescription className="text-sm text-muted-foreground mb-3 h-10 overflow-hidden text-ellipsis">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="mb-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-accent [&>div]:to-primary" />
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
          {deadline && (
            <div className="flex items-center gap-1">
              <CalendarDays className="w-3 h-3 text-accent" />
              <span>{deadline}</span>
            </div>
          )}
          {crewSize && (
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-accent" />
              <span>{crewSize} Crew</span>
            </div>
          )}
          {objectiveCount && (
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3 text-accent" />
              <span>{objectiveCount} Objectives</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
