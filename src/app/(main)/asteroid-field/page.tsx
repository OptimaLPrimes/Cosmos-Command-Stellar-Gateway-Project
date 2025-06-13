// src/app/(main)/asteroid-field/page.tsx

export default function AsteroidFieldPage() {
  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="text-center">
        <h1 className="text-3xl font-headline font-bold text-glow-primary tracking-wider">Survival Karts Challenge</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Jump into the chaotic action of Survival Karts! Drive, battle, and survive on an icy, hole-riddled track in this multiplayer racing game.
        </p>
      </div>
      <div className="flex-grow min-h-0 border border-primary/30 rounded-lg overflow-hidden shadow-xl shadow-primary/20">
        <iframe
          src="https://cloud.onlinegames.io/games/2024/unity3/survival-karts/index-og.html"
          title="Survival Karts Game"
          className="w-full h-full border-0"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms" // Common sandbox attributes for embedded games
          data-ai-hint="kart racing battle"
        ></iframe>
      </div>
    </div>
  );
}
