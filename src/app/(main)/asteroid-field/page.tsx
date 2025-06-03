// src/app/(main)/asteroid-field/page.tsx
import { AsteroidFieldGame } from "@/components/asteroid-field/AsteroidFieldGame";

export default function AsteroidFieldPage() {
  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="text-center">
        <h1 className="text-3xl font-headline font-bold text-glow-primary tracking-wider">Asteroid Field Gauntlet</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Pilot your spacecraft and blast your way through the dense asteroid clusters! (Game under development)
        </p>
      </div>
      <div className="flex-grow min-h-0">
        <AsteroidFieldGame />
      </div>
    </div>
  );
}
