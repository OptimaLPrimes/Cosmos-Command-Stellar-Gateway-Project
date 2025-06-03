// src/components/dashboard/DailyQuizCard.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { TypewriterText } from "@/components/chatbot/TypewriterText";
import { getQuizExplanation, type QuizExplanationInput } from "@/ai/flows/quiz-explanation-flow";
import { AlertCircle, CheckCircle2, HelpCircle, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizOption[];
  correctAnswerId: string;
  topic: string;
  xp: number;
}

// Hardcoded sample question
const sampleQuestion: QuizQuestion = {
  id: "q1",
  prompt: "Your starship's navigation system relies on identifying the closest star to Earth (after the Sun). Which star is it?",
  options: [
    { id: "opt1", text: "Sirius" },
    { id: "opt2", text: "Alpha Centauri A" },
    { id: "opt3", text: "Proxima Centauri" },
    { id: "opt4", text: "Barnard's Star" },
  ],
  correctAnswerId: "opt3",
  topic: "Stellar Proximity",
  xp: 50,
};

export function DailyQuizCard() {
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = sampleQuestion; // For now, always use the sample question

  const handleAnswerSubmit = async () => {
    if (!selectedAnswerId) return;

    setIsSubmitted(true);
    const correct = selectedAnswerId === currentQuestion.correctAnswerId;
    setIsCorrect(correct);

    if (!correct) {
      setIsLoadingExplanation(true);
      setShowExplanation(true); // Show container for loading/explanation
      try {
        const input: QuizExplanationInput = {
          question: currentQuestion.prompt,
          options: currentQuestion.options.map(opt => opt.text),
          correctAnswer: currentQuestion.options.find(opt => opt.id === currentQuestion.correctAnswerId)?.text || "",
          userAnswer: currentQuestion.options.find(opt => opt.id === selectedAnswerId)?.text || "",
          topic: currentQuestion.topic,
        };
        const result = await getQuizExplanation(input);
        setAiExplanation(result.explanation);
      } catch (error) {
        console.error("Error getting AI explanation:", error);
        setAiExplanation("An error occurred while fetching the explanation. Please try again later.");
      } finally {
        setIsLoadingExplanation(false);
      }
    } else {
      // If correct, reset explanation states
      setAiExplanation(null);
      setShowExplanation(false);
      setIsLoadingExplanation(false);
    }
  };

  const handleNextQuestion = () => {
    // For a real app, you'd fetch a new question here.
    // For this prototype, we'll just reset the state for the same question.
    setSelectedAnswerId(null);
    setIsSubmitted(false);
    setIsCorrect(null);
    setAiExplanation(null);
    setIsLoadingExplanation(false);
    setShowExplanation(false);
  };
  
  const getOptionFeedbackClass = (optionId: string) => {
    if (!isSubmitted) return "";
    if (optionId === currentQuestion.correctAnswerId) return "bg-green-500/30 border-green-500 text-foreground";
    if (optionId === selectedAnswerId && optionId !== currentQuestion.correctAnswerId) return "bg-red-500/30 border-red-500 text-foreground";
    return "border-transparent";
  };


  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl font-headline text-glow-primary flex items-center">
          <Sparkles className="w-6 h-6 mr-2 text-primary animate-pulse" />
          Daily Galactic Challenge
        </CardTitle>
        <CardDescription className="text-muted-foreground">Test your cosmic knowledge and earn XP!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-lg font-semibold text-foreground mb-4">{currentQuestion.prompt}</p>
          <RadioGroup
            value={selectedAnswerId || undefined}
            onValueChange={setSelectedAnswerId}
            disabled={isSubmitted}
            className="space-y-3"
          >
            {currentQuestion.options.map((option) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: currentQuestion.options.indexOf(option) * 0.1 }}
              >
                <Label
                  htmlFor={option.id}
                  className={cn(
                    "flex items-center space-x-3 p-4 rounded-lg border transition-all cursor-pointer",
                    "hover:border-primary/70 hover:bg-primary/10",
                    selectedAnswerId === option.id && "bg-primary/20 border-primary",
                    isSubmitted && getOptionFeedbackClass(option.id),
                    isSubmitted ? "cursor-not-allowed" : "cursor-pointer"
                  )}
                >
                  <RadioGroupItem value={option.id} id={option.id} disabled={isSubmitted} />
                  <span>{option.text}</span>
                </Label>
              </motion.div>
            ))}
          </RadioGroup>
        </div>

        {!isSubmitted ? (
          <Button onClick={handleAnswerSubmit} disabled={!selectedAnswerId || isSubmitted} className="w-full bg-accent hover:bg-accent/90 btn-glow-accent">
            Submit Answer
          </Button>
        ) : (
          <Button onClick={handleNextQuestion} className="w-full bg-primary hover:bg-primary/90 btn-glow-primary">
            Next Challenge
          </Button>
        )}

        <AnimatePresence>
          {isSubmitted && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-4 space-y-3"
            >
              {isCorrect === true && (
                <div className="flex items-center p-3 rounded-md bg-green-500/20 text-green-400 border border-green-500/50">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  <p>Correct! You earned {currentQuestion.xp} XP.</p>
                </div>
              )}
              {isCorrect === false && (
                 <div className="flex items-center p-3 rounded-md bg-red-500/20 text-red-400 border border-red-500/50">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <p>Incorrect. Let's see why...</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
        {showExplanation && !isCorrect && (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-4 p-4 glass-card border-accent/50"
            >
                <h3 className="text-md font-semibold text-accent mb-2 flex items-center">
                    <HelpCircle className="w-5 h-5 mr-2"/> Cosmic Explanation
                </h3>
                {isLoadingExplanation ? (
                    <div className="flex items-center text-muted-foreground">
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating explanation...
                    </div>
                ) : aiExplanation ? (
                    <TypewriterText text={aiExplanation} speed={20} className="text-sm text-foreground" />
                ) : null}
            </motion.div>
        )}
        </AnimatePresence>

      </CardContent>
    </Card>
  );
}
