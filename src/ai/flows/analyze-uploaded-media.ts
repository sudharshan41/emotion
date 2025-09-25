'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing uploaded media (video or audio) to detect driver emotions.
 *
 * It includes:
 * - analyzeUploadedMedia: The main function to analyze uploaded media.
 * - AnalyzeUploadedMediaInput: The input type for the analyzeUploadedMedia function.
 * - AnalyzeUploadedMediaOutput: The output type for the analyzeUploadedMedia function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeUploadedMediaInputSchema = z.object({
  mediaDataUri: z
    .string()
    .describe(
      "The uploaded media file (video or audio) as a data URI. Must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeUploadedMediaInput = z.infer<typeof AnalyzeUploadedMediaInputSchema>;

const AnalyzeUploadedMediaOutputSchema = z.object({
  summary: z.string().describe('A summary of the driver\u2019s emotions detected in the uploaded media.'),
});
export type AnalyzeUploadedMediaOutput = z.infer<typeof AnalyzeUploadedMediaOutputSchema>;

export async function analyzeUploadedMedia(
  input: AnalyzeUploadedMediaInput
): Promise<AnalyzeUploadedMediaOutput> {
  return analyzeUploadedMediaFlow(input);
}

const analyzeUploadedMediaPrompt = ai.definePrompt({
  name: 'analyzeUploadedMediaPrompt',
  input: {schema: AnalyzeUploadedMediaInputSchema},
  output: {schema: AnalyzeUploadedMediaOutputSchema},
  prompt: `You are an AI expert in analyzing driver emotions from uploaded media (video or audio).

  Analyze the provided media and generate a summary of the driver's emotions throughout the recording.
  Focus on identifying key emotional states and providing a concise overview.

  Media: {{media url=mediaDataUri}}`,
});

const analyzeUploadedMediaFlow = ai.defineFlow(
  {
    name: 'analyzeUploadedMediaFlow',
    inputSchema: AnalyzeUploadedMediaInputSchema,
    outputSchema: AnalyzeUploadedMediaOutputSchema,
  },
  async input => {
    const {output} = await analyzeUploadedMediaPrompt(input);
    return output!;
  }
);
