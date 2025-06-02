// src/app/(main)/planets/preview/page.tsx
"use client";

import { useState } from "react";
import { PlanetGeneratorForm, type PlanetFormData } from "@/components/planets/PlanetGeneratorForm";
import { PlanetPreview } from "@/components/planets/PlanetPreview";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PlanetPreviewPage() {
  const [currentPlanet, setCurrentPlanet] = useState<PlanetFormData | null>(null);
  const { toast } = useToast();

  const handleGeneratePlanet = (data: PlanetFormData) => {
    setCurrentPlanet(data);
    toast({
      title: "Planet Generated!",
      description: `Preview for planet with seed "${data.seed.substring(0,8)}" is now visible.`,
      variant: "default",
    });
  };

  const handleSavePlanet = () => {
    if (currentPlanet) {
      // Here you would typically save to a database
      console.log("Saving planet:", currentPlanet);
      toast({
        title: "Planet Saved (Simulated)",
        description: `Planet "${currentPlanet.seed.substring(0,8)}" has been added to your library.`,
        variant: "default",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-headline font-bold text-glow-primary tracking-wider">Planet Forge</h1>
        <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
          Craft unique celestial bodies. Adjust parameters and visualize your own alien worlds.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <PlanetGeneratorForm onSubmit={handleGeneratePlanet} />
        </div>
        <div className="lg:col-span-2">
          <PlanetPreview planetData={currentPlanet} />
          {currentPlanet && (
            <div className="mt-6 text-center">
              <Button onClick={handleSavePlanet} size="lg" className="bg-accent hover:bg-accent/90 btn-glow-accent">
                <Save className="mr-2 h-5 w-5" />
                Save to Explored Library
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
