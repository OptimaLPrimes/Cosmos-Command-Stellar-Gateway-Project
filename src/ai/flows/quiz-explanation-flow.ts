// src/ai/flows/quiz-explanation-flow.ts
'use server';
/**
 * @fileOverview Provides AI-generated explanations for quiz questions.
 *
 * - getQuizExplanation - A function that generates an explanation for a quiz answer.
 * - QuizExplanationInput - The input type for the getQuizExplanation function.
 * - QuizExplanationOutput - The return type for the getQuizExplanation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuizExplanationInputSchema = z.object({
  question: z.string().describe('The quiz question that was asked.'),
  options: z.array(z.string()).describe('The list of multiple choice options provided to the user.'),
  correctAnswer: z.string().describe('The correct answer text.'),
  userAnswer: z.string().describe('The answer text selected by the user.'),
  topic: z.string().describe('The general topic or context of the question (e.g., "Solar System Moons", "Astrophysics").'),
});
export type QuizExplanationInput = z.infer<typeof QuizExplanationInputSchema>;

const QuizExplanationOutputSchema = z.object({
  explanation: z.string().describe('A concise and engaging explanation. It should clarify why the correct answer is right and, if the user was wrong, gently explain their mistake within the given topic. The explanation should be suitable for a space-themed educational game.'),
});
export type QuizExplanationOutput = z.infer<typeof QuizExplanationOutputSchema>;

export async function getQuizExplanation(input: QuizExplanationInput): Promise<QuizExplanationOutput> {
  return quizExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'quizExplanationPrompt',
  input: {schema: QuizExplanationInputSchema},
  output: {schema: QuizExplanationOutputSchema},
  prompt: `You are an AI space science expert integrated into the "Cosmos Command" educational game.
A user has just answered a quiz question.
Topic: {{{topic}}}
Question: "{{{question}}}"
Options Presented: {{#each options}}- {{{this}}}{{/each}}
Correct Answer: "{{{correctAnswer}}}"
User's Answer: "{{{userAnswer}}}"

Please provide a concise, engaging, and encouraging explanation.
If the user was correct, briefly reinforce why their answer is right.
If the user was incorrect, gently explain why their answer was not the best choice and why the correct answer is right.
Keep the tone friendly and educational. Aim for 2-3 sentences.

Explanation:
`,
});

const quizExplanationFlow = ai.defineFlow(
  {
    name: 'quizExplanationFlow',
    inputSchema: QuizExplanationInputSchema,
    outputSchema: QuizExplanationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
