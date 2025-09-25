'use server';

/**
 * @fileOverview Summarizes detected emotions and events after a drive.
 *
 * - summarizeEmotionsAfterDrive - A function that summarizes the detected emotions and events.
 * - SummarizeEmotionsAfterDriveInput - The input type for the summarizeEmotionsAfterDrive function.
 * - SummarizeEmotionsAfterDriveOutput - The return type for the summarizeEmotionsAfterDrive function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeEmotionsAfterDriveInputSchema = z.object({
  emotionData: z
    .array(z.object({
      timestamp: z.string().describe('The timestamp of the emotion detection.'),
      emotion: z.string().describe('The detected emotion.'),
      confidence: z.number().describe('The confidence level of the emotion detection.'),
    }))
    .describe('An array of emotion data points with timestamps, emotions, and confidence levels.'),
  drowsinessAlerts: z
    .array(z.string())
    .describe('An array of timestamps when drowsiness alerts were triggered.'),
});
export type SummarizeEmotionsAfterDriveInput = z.infer<typeof SummarizeEmotionsAfterDriveInputSchema>;

const SummarizeEmotionsAfterDriveOutputSchema = z.object({
  summary: z.string().describe('A summary of the detected emotions and drowsiness alerts during the drive.'),
});
export type SummarizeEmotionsAfterDriveOutput = z.infer<typeof SummarizeEmotionsAfterDriveOutputSchema>;

export async function summarizeEmotionsAfterDrive(
  input: SummarizeEmotionsAfterDriveInput
): Promise<SummarizeEmotionsAfterDriveOutput> {
  return summarizeEmotionsAfterDriveFlow(input);
}

const summarizeEmotionsAfterDrivePrompt = ai.definePrompt({
  name: 'summarizeEmotionsAfterDrivePrompt',
  input: {schema: SummarizeEmotionsAfterDriveInputSchema},
  output: {schema: SummarizeEmotionsAfterDriveOutputSchema},
  prompt: `You are an AI assistant that summarizes a driver's emotional state and drowsiness alerts during a drive.

  Summarize the emotions detected during the drive, including the types of emotions and their frequency.
  Also, include the number of drowsiness alerts triggered during the drive.

  Emotion Data:
  {{#each emotionData}}
  - Timestamp: {{timestamp}}, Emotion: {{emotion}}, Confidence: {{confidence}}
  {{/each}}

  Drowsiness Alerts:
  {{#if drowsinessAlerts}}
  - Drowsiness alerts were triggered at the following timestamps:
    {{#each drowsinessAlerts}}
    - {{this}}
    {{/each}}
  {{else}}
  - No drowsiness alerts were triggered during the drive.
  {{/if}}
  `,
});

const summarizeEmotionsAfterDriveFlow = ai.defineFlow(
  {
    name: 'summarizeEmotionsAfterDriveFlow',
    inputSchema: SummarizeEmotionsAfterDriveInputSchema,
    outputSchema: SummarizeEmotionsAfterDriveOutputSchema,
  },
  async input => {
    const {output} = await summarizeEmotionsAfterDrivePrompt(input);
    return output!;
  }
);
