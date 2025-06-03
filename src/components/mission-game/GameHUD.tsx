// src/components/mission-game/GameHUD.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";

interface GameHUDProps {
  missionTitle: string;
  progress: number;
}

export function GameHUD({ missionTitle, progress }: GameHUDProps) {
  return (
    <Card className="glass-card shadow-lg shadow-primary/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-headline text-glow-primary flex items-center justify-between">
          <span>{missionTitle}</span>
          <Target className="w-6 h-6 text-primary" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground w-20">Progress:</span>
          <Progress value={progress} className="flex-1 h-3 [&>div]:bg-gradient-to-r [&>div]:from-accent [&>div]:to-primary" />
          <span className="text-sm font-semibold text-primary w-10 text-right">{progress}%</span>
        </div>
      </CardContent>
    </Card>
  );
}
