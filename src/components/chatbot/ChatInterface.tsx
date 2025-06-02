// src/components/chatbot/ChatInterface.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { askQuestion, type EducationalChatbotInput, type EducationalChatbotOutput } from "@/ai/flows/educational-chatbot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, User, Sparkles, Loader2 } from "lucide-react";
import { TypewriterText } from "./TypewriterText";
import { Card } from "../ui/card";
import { motion, AnimatePresence } from "framer-motion";

const chatSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(500, "Message too long"),
});

type ChatFormData = z.infer<typeof chatSchema>;

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChatFormData>({
    resolver: zodResolver(chatSchema),
  });

  const onSubmit = async (data: ChatFormData) => {
    const userMessage: Message = {
      id: Date.now().toString() + "-user",
      text: data.message,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    reset();
    setIsLoading(true);

    try {
      const input: EducationalChatbotInput = { question: data.message };
      const output: EducationalChatbotOutput = await askQuestion(input);
      const aiMessage: Message = {
        id: Date.now().toString() + "-ai",
        text: output.answer,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error asking question:", error);
      const errorMessage: Message = {
        id: Date.now().toString() + "-error",
        text: "Sorry, I encountered an error. Please try again.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-3xl mx-auto glass-card p-1 sm:p-2">
      <ScrollArea className="flex-1 p-4 sm:p-6" ref={scrollAreaRef}>
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-end gap-3 mb-6 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "ai" && (
                <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-accent">
                  <AvatarFallback>
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                  </AvatarFallback>
                </Avatar>
              )}
              <Card
                className={`max-w-[75%] p-3 sm:p-4 rounded-xl shadow-md ${
                  msg.sender === "user"
                    ? "bg-primary/80 text-primary-foreground rounded-br-none"
                    : "bg-background/70 text-foreground rounded-bl-none border border-accent/30"
                }`}
              >
                {msg.sender === "ai" ? (
                  <TypewriterText text={msg.text} speed={20} className="text-sm sm:text-base" />
                ) : (
                  <p className="text-sm sm:text-base">{msg.text}</p>
                )}
                <p className={`text-xs mt-2 ${msg.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground/70'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </Card>
              {msg.sender === "user" && (
                 <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-primary">
                  <AvatarFallback>
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </AvatarFallback>
                </Avatar>
              )}
            </motion.div>
          ))}
          {isLoading && messages[messages.length -1]?.sender === 'user' && (
             <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-end gap-3 mb-6 justify-start"
            >
              <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-accent">
                  <AvatarFallback>
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                  </AvatarFallback>
              </Avatar>
              <Card className="max-w-[75%] p-3 sm:p-4 rounded-xl shadow-md bg-background/70 text-foreground rounded-bl-none border border-accent/30">
                <Loader2 className="w-5 h-5 animate-spin text-accent" />
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollArea>
      <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-2 sm:gap-4 p-4 border-t border-primary/20">
        <Input
          {...register("message")}
          placeholder="Ask about space science..."
          className="flex-1 bg-background/50 focus:ring-accent focus:border-accent text-base"
          autoComplete="off"
          disabled={isLoading}
        />
        <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90 btn-glow-primary rounded-full w-10 h-10 sm:w-12 sm:h-12" disabled={isLoading}>
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          <span className="sr-only">Send</span>
        </Button>
      </form>
      {errors.message && <p className="text-xs text-destructive p-2 text-center">{errors.message.message}</p>}
    </div>
  );
}
