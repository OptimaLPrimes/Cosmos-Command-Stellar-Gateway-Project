'use server';
/**
 * @fileOverview Fetches live data about people currently in space.
 *
 * - getPeopleInSpace - A function that returns the number of people and their details.
 * - PeopleInSpaceOutput - The return type for the getPeopleInSpace function.
 * - Astronaut - The type for individual astronaut details.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AstronautSchema = z.object({
    name: z.string(),
    title: z.string().optional().nullable(),
    country: z.string(),
    countryflag: z.string().url(),
    launchdate: z.string(),
    daysinspace: z.number(),
    careerdays: z.number().optional().nullable(),
    biolink: z.string().url().optional().nullable(),
    twitter: z.string().url().optional().nullable(),
    profileimage: z.string().url().optional().nullable(),
    location: z.string(),
    spacecraft: z.string(),
});
export type Astronaut = z.infer<typeof AstronautSchema>;

const PeopleInSpaceOutputSchema = z.object({
    updated: z.string().describe("Timestamp of the last data update from the source."),
    number: z.number().describe("The total number of people currently in space."),
    people: z.array(AstronautSchema).describe("An array of astronauts currently in space."),
});
export type PeopleInSpaceOutput = z.infer<typeof PeopleInSpaceOutputSchema>;

// Input schema is empty as this flow doesn't take dynamic input for the API call
const PeopleInSpaceInputSchema = z.object({});
export type PeopleInSpaceInput = z.infer<typeof PeopleInSpaceInputSchema>;


export async function getPeopleInSpace(input?: PeopleInSpaceInput): Promise<PeopleInSpaceOutput> {
  return peopleInSpaceFlow(input || {});
}

const peopleInSpaceFlow = ai.defineFlow(
  {
    name: 'peopleInSpaceFlow',
    inputSchema: PeopleInSpaceInputSchema, // Technically no input needed for this API
    outputSchema: PeopleInSpaceOutputSchema,
  },
  async () => {
    const response = await fetch('https://www.howmanypeopleareinspacerightnow.com/peopleinspace.json', {
      cache: 'no-store', // Ensure fresh data
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch people in space data: ${response.statusText}`);
    }
    const data = await response.json();
    
    // Validate data with Zod schema before returning
    const validationResult = PeopleInSpaceOutputSchema.safeParse(data);
    if (!validationResult.success) {
        console.error("Zod validation error:", validationResult.error.issues);
        throw new Error("Invalid data structure received from API.");
    }
    return validationResult.data;
  }
);
