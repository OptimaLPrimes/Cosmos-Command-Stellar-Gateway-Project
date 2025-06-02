// src/app/(main)/chatbot/page.tsx
import { ChatInterface } from "@/components/chatbot/ChatInterface";

export default function ChatbotPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold text-center text-glow-primary tracking-wider">Cosmic Oracle</h1>
      <p className="text-center text-muted-foreground max-w-2xl mx-auto">
        Engage with our AI expert on all things space! Ask questions about planets, stars, galaxies, physics, and the mysteries of the universe.
      </p>
      <ChatInterface />
    </div>
  );
}
