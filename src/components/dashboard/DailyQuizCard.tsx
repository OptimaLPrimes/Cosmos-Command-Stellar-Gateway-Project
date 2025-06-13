// src/components/dashboard/DailyQuizCard.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { TypewriterText } from "@/components/chatbot/TypewriterText";
import { getQuizExplanation, type QuizExplanationInput } from "@/ai/flows/quiz-explanation-flow";
import { AlertCircle, CheckCircle2, HelpCircle, Loader2, Sparkles, Award } from "lucide-react";
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

const sampleQuestions: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "Your starship's navigation system relies on identifying the closest star to Earth (after the Sun). Which star is it?",
    options: [
      { id: "q1_opt1", text: "Sirius" },
      { id: "q1_opt2", text: "Alpha Centauri A" },
      { id: "q1_opt3", text: "Proxima Centauri" },
      { id: "q1_opt4", text: "Barnard's Star" },
    ],
    correctAnswerId: "q1_opt3",
    topic: "Stellar Proximity",
    xp: 50,
  },
  {
    id: "q2",
    prompt: "What is the term for a region in space where gravity is so strong that nothing, not even light, can escape?",
    options: [
      { id: "q2_opt1", text: "Nebula" },
      { id: "q2_opt2", text: "Quasar" },
      { id: "q2_opt3", text: "Black Hole" },
      { id: "q2_opt4", text: "Pulsar" },
    ],
    correctAnswerId: "q2_opt3",
    topic: "Astrophysical Objects",
    xp: 75,
  },
  {
    id: "q3",
    prompt: "Which of Jupiter's moons is known for its extensive volcanic activity, the most geologically active object in the Solar System?",
    options: [
      { id: "q3_opt1", text: "Europa" },
      { id: "q3_opt2", text: "Ganymede" },
      { id: "q3_opt3", text: "Callisto" },
      { id: "q3_opt4", text: "Io" },
    ],
    correctAnswerId: "q3_opt4",
    topic: "Solar System Moons",
    xp: 60,
  },
  {
    id: "q4",
    prompt: "What fundamental force is responsible for holding galaxies together?",
    options: [
      { id: "q4_opt1", text: "Electromagnetism" },
      { id: "q4_opt2", text: "Strong Nuclear Force" },
      { id: "q4_opt3", text: "Weak Nuclear Force" },
      { id: "q4_opt4", text: "Gravity" },
    ],
    correctAnswerId: "q4_opt4",
    topic: "Cosmology & Forces",
    xp: 65,
  },
  {
    id: "q5",
    prompt: "What is the name of the NASA rover that successfully landed on Mars in February 2021?",
    options: [
      { id: "q5_opt1", text: "Curiosity" },
      { id: "q5_opt2", text: "Spirit" },
      { id: "q5_opt3", text: "Perseverance" },
      { id: "q5_opt4", text: "Opportunity" },
    ],
    correctAnswerId: "q5_opt3",
    topic: "Space Exploration",
    xp: 55,
  }
];

interface DailyQuizCardProps {
  onCorrectAnswer: (xp: number) => void;
}

export function DailyQuizCard({ onCorrectAnswer }: DailyQuizCardProps) {
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);


  const loadNewQuestion = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * sampleQuestions.length);
    setCurrentQuestion(sampleQuestions[randomIndex]);
    setSelectedAnswerId(null);
    setIsSubmitted(false);
    setIsCorrect(null);
    setAiExplanation(null);
    setIsLoadingExplanation(false);
    setShowExplanation(false);
    setFetchError(null);
  }, []);

  useEffect(() => {
    loadNewQuestion();
  }, [loadNewQuestion]);

  const handleAnswerSubmit = async () => {
    if (!selectedAnswerId || !currentQuestion) return;

    setIsSubmitted(true);
    setFetchError(null);
    const correct = selectedAnswerId === currentQuestion.correctAnswerId;
    setIsCorrect(correct);

    if (correct) {
      onCorrectAnswer(currentQuestion.xp);
      setAiExplanation(null);
      setShowExplanation(false);
      setIsLoadingExplanation(false);
    } else {
      setIsLoadingExplanation(true);
      setShowExplanation(true);
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
        let message = "An error occurred while fetching the explanation. Perhaps the AI is stargazing?";
        if (error instanceof Error && error.message.toLowerCase().includes('failed to fetch')) {
            message = "Network error fetching AI explanation. Please check your connection or API key setup."
        } else if (error instanceof Error) {
            message = `Error: ${error.message}`;
        }
        setAiExplanation(message);
        setFetchError(message); // Keep for specific display if needed
      } finally {
        setIsLoadingExplanation(false);
      }
    }
  };

  const handleNextQuestion = () => {
    loadNewQuestion();
  };
  
  const getOptionFeedbackClass = (optionId: string) => {
    if (!isSubmitted || !currentQuestion) return "";
    if (optionId === currentQuestion.correctAnswerId) return "bg-green-500/30 border-green-500 text-foreground";
    if (optionId === selectedAnswerId && optionId !== currentQuestion.correctAnswerId) return "bg-red-500/30 border-red-500 text-foreground";
    return "border-transparent";
  };

  if (!currentQuestion) {
    return (
      <Card className="glass-card overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-glow-primary flex items-center">
            <Sparkles className="w-6 h-6 mr-2 text-primary animate-pulse" />
            Daily Galactic Challenge
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="ml-3 text-muted-foreground">Loading challenge...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl font-headline text-glow-primary flex items-center">
          <Sparkles className="w-6 h-6 mr-2 text-primary animate-pulse" />
          Daily Galactic Challenge
        </CardTitle>
        <CardDescription className="text-muted-foreground">Test your cosmic knowledge and earn XP! Current Topic: {currentQuestion.topic}</CardDescription>
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
            {currentQuestion.options.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Label
                  htmlFor={option.id}
                  className={cn(
                    "flex items-center space-x-3 p-4 rounded-lg border transition-all",
                    "hover:border-primary/70 hover:bg-primary/10",
                    selectedAnswerId === option.id && "bg-primary/20 border-primary",
                    isSubmitted && getOptionFeedbackClass(option.id),
                    isSubmitted ? "cursor-not-allowed opacity-70" : "cursor-pointer"
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
          <Button onClick={handleAnswerSubmit} disabled={!selectedAnswerId || isSubmitted} className="w-full bg-accent hover:bg-accent/90 btn-glow-accent text-lg py-3">
            Submit Answer
          </Button>
        ) : (
          <Button onClick={handleNextQuestion} className="w-full bg-primary hover:bg-primary/90 btn-glow-primary text-lg py-3">
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
                  <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0" />
                  <p>Correct! You earned <span className="font-bold text-glow-primary">{currentQuestion.xp} XP</span>. Well done, Commander!</p>
                </div>
              )}
              {isCorrect === false && (
                 <div className="flex items-center p-3 rounded-md bg-red-500/20 text-red-400 border border-red-500/50">
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                  <p>Incorrect. Don't worry, every commander learns from experience. Here's the debrief:</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
        {showExplanation && !isCorrect && ( // Only show for incorrect answers
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{delay: 0.2}}
                className="mt-4 p-4 glass-card border-accent/50" 
            >
                <h3 className="text-md font-semibold text-accent mb-2 flex items-center">
                    <HelpCircle className="w-5 h-5 mr-2"/> Cosmic Explanation
                </h3>
                {isLoadingExplanation ? (
                    <div className="flex items-center text-muted-foreground">
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Consulting the star charts...
                    </div>
                ) : aiExplanation ? (
                    <TypewriterText text={aiExplanation} speed={20} className="text-sm text-foreground" />
                ) : (
                   <p className="text-sm text-muted-foreground">No explanation available at this moment.</p>
                )}
            </motion.div>
        )}
        </AnimatePresence>

      </CardContent>
    </Card>
  );
}
