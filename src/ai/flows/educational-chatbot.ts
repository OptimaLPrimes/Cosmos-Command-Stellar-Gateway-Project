// src/ai/flows/educational-chatbot.ts
'use server';
/**
 * @fileOverview A GPT-4 powered chatbot for space science education.
 *
 * - askQuestion - A function that takes a question about space science and returns an informative answer.
 * - EducationalChatbotInput - The input type for the askQuestion function.
 * - EducationalChatbotOutput - The return type for the askQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EducationalChatbotInputSchema = z.object({
  question: z.string().describe('The question about space science to ask the chatbot.'),
});
export type EducationalChatbotInput = z.infer<typeof EducationalChatbotInputSchema>;

const EducationalChatbotOutputSchema = z.object({
  answer: z.string().describe('The informative and engaging answer from the chatbot.'),
});
export type EducationalChatbotOutput = z.infer<typeof EducationalChatbotOutputSchema>;

export async function askQuestion(input: EducationalChatbotInput): Promise<EducationalChatbotOutput> {
  return educationalChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'educationalChatbotPrompt',
  input: {schema: EducationalChatbotInputSchema},
  output: {schema: EducationalChatbotOutputSchema},
  prompt: `You are an AI chatbot expert in space science.

  Answer the following question about space science in an informative and engaging way:

  Question: {{{question}}}
  `,
});

const educationalChatbotFlow = ai.defineFlow(
  {
    name: 'educationalChatbotFlow',
    inputSchema: EducationalChatbotInputSchema,
    outputSchema: EducationalChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
