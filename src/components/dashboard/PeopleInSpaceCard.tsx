// src/components/dashboard/PeopleInSpaceCard.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getPeopleInSpace, type PeopleInSpaceOutput, type Astronaut } from "@/ai/flows/people-in-space-flow";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { UsersRound, Rocket, CalendarDays, Orbit, User, ExternalLink, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PeopleInSpaceCard() {
  const [data, setData] = useState<PeopleInSpaceOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getPeopleInSpace();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        console.error("Error fetching people in space:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
    const intervalId = setInterval(fetchData, 60000); // Refresh every minute

    return () => clearInterval(intervalId);
  }, []);

  if (isLoading && !data) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-glow-accent flex items-center">
            <UsersRound className="w-7 h-7 mr-3 text-accent" />
            People in Space
          </CardTitle>
          <CardDescription>Fetching live data from the cosmos...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-card border-destructive/50">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-red-400 flex items-center">
            <AlertTriangle className="w-7 h-7 mr-3 text-destructive" />
            Data Feed Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive-foreground">Could not load live astronaut data: {error}</p>
          <p className="text-sm text-muted-foreground mt-1">Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null; // Or some placeholder if data is null after loading (should be handled by error state)
  }

  return (
    <Card className="glass-card shadow-xl shadow-primary/20">
      <CardHeader>
        <CardTitle className="text-3xl font-headline text-glow-primary flex items-center mb-1">
          <UsersRound className="w-8 h-8 mr-3 text-primary" />
          {data.number} Astronauts Currently in Space
        </CardTitle>
        <CardDescription className="text-sm">
          Live data from Earth's orbit and beyond. Last update: {new Date(data.updated).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.people.length > 0 && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="astronauts-list">
              <AccordionTrigger className="text-lg hover:no-underline text-accent font-semibold">
                View Current Crew Manifest
              </AccordionTrigger>
              <AccordionContent className="pt-4 space-y-4">
                {data.people.map((astronaut: Astronaut) => (
                  <div key={astronaut.name} className="flex items-start gap-4 p-4 rounded-lg bg-card/50 border border-primary/20">
                    <Avatar className="h-16 w-16 border-2 border-accent">
                      <AvatarImage src={astronaut.profileimage || undefined} alt={astronaut.name} data-ai-hint="astronaut profile" />
                      <AvatarFallback>
                        <User className="w-8 h-8" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-foreground">{astronaut.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {astronaut.title || 'Crew Member'} on {astronaut.location}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Image src={astronaut.countryflag} alt={astronaut.country} width={24} height={16} className="rounded-sm" data-ai-hint="country flag" />
                        <span className="text-xs text-muted-foreground">{astronaut.country}</span>
                      </div>
                      <div className="mt-2 text-xs space-y-1">
                        <p className="flex items-center gap-1.5"><Rocket className="w-3.5 h-3.5 text-accent/80" />Craft: {astronaut.spacecraft}</p>
                        <p className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 text-accent/80" />Launched: {new Date(astronaut.launchdate).toLocaleDateString()}</p>
                        <p className="flex items-center gap-1.5"><Orbit className="w-3.5 h-3.5 text-accent/80" />Days in space (current mission): {astronaut.daysinspace}</p>
                      </div>
                    </div>
                    {astronaut.biolink && (
                      <Button variant="outline" size="sm" asChild className="ml-auto self-start border-accent/50 text-accent hover:bg-accent/10 hover:text-accent">
                        <a href={astronaut.biolink} target="_blank" rel="noopener noreferrer">
                          Bio <ExternalLink className="w-3 h-3 ml-1.5" />
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
