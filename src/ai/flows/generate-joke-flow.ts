'use server';
/**
 * @fileOverview A flow to generate a random, family-friendly joke.
 *
 * - generateJoke - A function that returns a joke.
 * - GenerateJokeOutput - The return type for the generateJoke function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateJokeOutputSchema = z.object({
  joke: z.string().describe('A short, family-friendly joke.'),
});
export type GenerateJokeOutput = z.infer<typeof GenerateJokeOutputSchema>;

export async function generateJoke(): Promise<GenerateJokeOutput> {
  return generateJokeFlow();
}

const jokePrompt = ai.definePrompt({
  name: 'jokePrompt',
  output: {schema: GenerateJokeOutputSchema},
  prompt: `You are a friendly AI assistant. Tell me a short, clean, family-friendly joke. It can be about anything.`,
});

const generateJokeFlow = ai.defineFlow(
  {
    name: 'generateJokeFlow',
    outputSchema: GenerateJokeOutputSchema,
  },
  async () => {
    const {output} = await jokePrompt();
    return output!;
  }
);
