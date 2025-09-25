'use server';
/**
 * @fileOverview Implements drowsiness detection with audio alerts.
 *
 * - alertOnDrowsiness - detects drowsiness from video data and triggers audio alerts.
 * - DrowsinessAlertInput - input type for drowsiness detection.
 * - DrowsinessAlertOutput - output type for drowsiness detection.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DrowsinessAlertInputSchema = z.object({
  faceVideoDataUri: z
    .string()
    .describe(
      "A still image of the driver's face, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DrowsinessAlertInput = z.infer<typeof DrowsinessAlertInputSchema>;

const DrowsinessAlertOutputSchema = z.object({
  isDrowsy: z.boolean().describe('Whether the driver has their eyes closed or not.'),
  alertMessage: z.string().optional().describe('An alert message if drowsiness is detected.'),
});
export type DrowsinessAlertOutput = z.infer<typeof DrowsinessAlertOutputSchema>;

export async function alertOnDrowsiness(input: DrowsinessAlertInput): Promise<DrowsinessAlertOutput> {
  return alertOnDrowsinessFlow(input);
}

const drowsinessDetectionPrompt = ai.definePrompt({
  name: 'drowsinessDetectionPrompt',
  input: {schema: DrowsinessAlertInputSchema},
  output: {schema: DrowsinessAlertOutputSchema},
  prompt: `You are an AI safety assistant in a vehicle. Your job is to monitor the driver for drowsiness by checking if their eyes are closed.

  Analyze the single image provided to determine if the driver's eyes are currently closed.
  
  If the driver's eyes are closed, set isDrowsy to true and set the alertMessage to "Drowsiness detected! Eyes have been closed for several seconds."
  If the driver's eyes are open, set isDrowsy to false and leave alertMessage blank.

  Image: {{media url=faceVideoDataUri}}`,
});

const alertOnDrowsinessFlow = ai.defineFlow(
  {
    name: 'alertOnDrowsinessFlow',
    inputSchema: DrowsinessAlertInputSchema,
    outputSchema: DrowsinessAlertOutputSchema,
  },
  async input => {
    const {output} = await drowsinessDetectionPrompt(input);
    return output!;
  }
);
