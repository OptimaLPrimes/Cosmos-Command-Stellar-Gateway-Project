// src/components/planets/PlanetGeneratorForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Wand2 } from "lucide-react";

export const planetFormSchema = z.object({
  seed: z.string().min(1, "Seed is required").max(50, "Seed too long"),
  biome: z.enum(["desert", "forest", "ocean", "ice", "volcanic", "barren"]),
  terrain: z.enum(["mountainous", "flatlands", "canyons", "islands", "rolling_hills"]),
  atmosphere: z.enum(["none", "thin", "moderate", "thick", "toxic"]),
  gravity: z.coerce.number().min(0.1, "Gravity must be at least 0.1 G").max(3, "Gravity cannot exceed 3 G"),
});

export type PlanetFormData = z.infer<typeof planetFormSchema>;

interface PlanetGeneratorFormProps {
  onSubmit: (data: PlanetFormData) => void;
  defaultValues?: Partial<PlanetFormData>;
}

const biomeOptions = [
  { value: "desert", label: "Desert" },
  { value: "forest", label: "Forest" },
  { value: "ocean", label: "Ocean" },
  { value: "ice", label: "Ice" },
  { value: "volcanic", label: "Volcanic" },
  { value: "barren", label: "Barren" },
];

const terrainOptions = [
  { value: "mountainous", label: "Mountainous" },
  { value: "flatlands", label: "Flatlands" },
  { value: "canyons", label: "Canyons" },
  { value: "islands", label: "Islands" },
  { value: "rolling_hills", label: "Rolling Hills" },
];

const atmosphereOptions = [
  { value: "none", label: "None" },
  { value: "thin", label: "Thin" },
  { value: "moderate", label: "Moderate" },
  { value: "thick", label: "Thick" },
  { value: "toxic", label: "Toxic" },
];


export function PlanetGeneratorForm({ onSubmit, defaultValues }: PlanetGeneratorFormProps) {
  const form = useForm<PlanetFormData>({
    resolver: zodResolver(planetFormSchema),
    defaultValues: defaultValues || {
      seed: Math.random().toString(36).substring(7),
      biome: "desert",
      terrain: "mountainous",
      atmosphere: "moderate",
      gravity: 1.0,
    },
  });

  const handleSubmit = (data: PlanetFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 p-6 glass-card">
        <FormField
          control={form.control}
          name="seed"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary">Planet Seed</FormLabel>
              <FormControl>
                <Input placeholder="Enter a seed string" {...field} className="bg-background/50 focus:ring-accent focus:border-accent" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="biome"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-primary">Biome Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-background/50 focus:ring-accent focus:border-accent">
                      <SelectValue placeholder="Select biome" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-popover border-primary/50">
                    {biomeOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="terrain"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-primary">Terrain Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-background/50 focus:ring-accent focus:border-accent">
                      <SelectValue placeholder="Select terrain" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-popover border-primary/50">
                     {terrainOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="atmosphere"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-primary">Atmosphere</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-background/50 focus:ring-accent focus:border-accent">
                      <SelectValue placeholder="Select atmosphere" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-popover border-primary/50">
                     {atmosphereOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gravity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-primary">Gravity (G)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 1.0" {...field} className="bg-background/50 focus:ring-accent focus:border-accent" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>


        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 btn-glow-primary text-lg py-6">
          <Wand2 className="mr-2 h-5 w-5" />
          Generate Planet
        </Button>
      </form>
    </Form>
  );
}
