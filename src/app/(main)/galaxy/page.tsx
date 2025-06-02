// src/app/(main)/galaxy/page.tsx
import { GalaxyMap } from "@/components/galaxy/GalaxyMap";

export default function GalaxyPage() {
  return (
    <div className="space-y-8 h-full">
      <div className="text-center">
        <h1 className="text-3xl font-headline font-bold text-glow-primary tracking-wider">Galaxy Explorer</h1>
        <p className="text-muted-foreground mt-2">Navigate the cosmos. Click on celestial bodies to learn more.</p>
      </div>
      <GalaxyMap />
    </div>
  );
}
