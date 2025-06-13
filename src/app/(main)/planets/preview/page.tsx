// src/app/(main)/planets/preview/page.tsx
"use client";

// Removed: import { useEffect, useRef } from 'react';
// Removed: import { init } from '@stellarium/stellarium-web-engine';

export default function PlanetForgePage() {
  // Removed: const stellariumContainerRef = useRef<HTMLDivElement>(null);
  // Removed: const isInitializedRef = useRef(false);

  // Removed: useEffect hook that called init()

  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="text-center">
        <h1 className="text-3xl font-headline font-bold text-glow-primary tracking-wider">Stellarium Sky Explorer</h1>
        <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
          Explore the night sky. Discover stars, constellations, planets, comets, and more directly within your browser.
        </p>
      </div>
      <div className="flex-grow min-h-0 border border-primary/30 rounded-lg overflow-hidden shadow-xl shadow-primary/20">
        <iframe
          src="https://stellarium-web.org/"
          title="Stellarium Web"
          className="w-full h-full border-0"
          data-ai-hint="star map sky exploration interactive"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}
