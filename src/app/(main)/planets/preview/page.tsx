// src/app/(main)/planets/preview/page.tsx

export default function PlanetForgePage() {
  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="text-center">
        <h1 className="text-3xl font-headline font-bold text-glow-primary tracking-wider">Stellarium Sky Explorer</h1>
        <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
          Explore the night sky with Stellarium Web. Discover stars, constellations, planets, comets, and more.
        </p>
      </div>
      <div className="flex-grow min-h-0">
        <iframe
          src="https://stellarium-web.org/"
          title="Stellarium Web"
          className="w-full h-full border-0 rounded-lg overflow-hidden shadow-xl shadow-primary/20"
          allowFullScreen
          data-ai-hint="star map sky exploration"
        ></iframe>
      </div>
    </div>
  );
}
