// src/app/(main)/asteroid-field/page.tsx

export default function AsteroidFieldPage() {
  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="text-center">
        <h1 className="text-3xl font-headline font-bold text-glow-primary tracking-wider">Run 3 Space</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Run 3 Space is a 3D arcade game where you help the spaceman run through the tunnel with obstacles on a galactical dimension. You need to guide this spaceman through the tunnel and bring him to the blue portal at the end of the platform. But you need to pay attention to the tiles on the platform. You will see gaps in some places.
        </p>
      </div>
      <div className="flex-grow min-h-0 border border-primary/30 rounded-lg overflow-hidden shadow-xl shadow-primary/20">
        <iframe
          src="https://www.onlinegames.io/games/2023/construct/192/run-3-space/index.html"
          title="Run 3 Space Game"
          className="w-full h-full border-0"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms" // Common sandbox attributes for embedded games
          data-ai-hint="space runner obstacle"
        ></iframe>
      </div>
    </div>
  );
}
