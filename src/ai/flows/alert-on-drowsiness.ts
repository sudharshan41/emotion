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
import wav from 'wav';

const DrowsinessAlertInputSchema = z.object({
  faceVideoDataUri: z
    .string()
    .describe(
      "A video of the driver's face, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DrowsinessAlertInput = z.infer<typeof DrowsinessAlertInputSchema>;

const DrowsinessAlertOutputSchema = z.object({
  isDrowsy: z.boolean().describe('Whether the driver is drowsy or not.'),
  alertMessage: z.string().optional().describe('An alert message if drowsiness is detected.'),
  audioDataUri: z.string().optional().describe('Audio data URI for the alert sound.'),
});
export type DrowsinessAlertOutput = z.infer<typeof DrowsinessAlertOutputSchema>;

export async function alertOnDrowsiness(input: DrowsinessAlertInput): Promise<DrowsinessAlertOutput> {
  return alertOnDrowsinessFlow(input);
}

const drowsinessDetectionPrompt = ai.definePrompt({
  name: 'drowsinessDetectionPrompt',
  input: {schema: DrowsinessAlertInputSchema},
  output: {schema: DrowsinessAlertOutputSchema},
  prompt: `You are an AI safety assistant in a vehicle. Your job is to monitor the driver for drowsiness. 

  Analyze the video provided to determine if the driver is showing signs of drowsiness, such as frequent eye closures or head nodding.
  
  If the driver is drowsy, set isDrowsy to true, and generate a short alert message. If the driver is not drowsy, set isDrowsy to false and leave alertMessage blank.

  Video: {{media url=faceVideoDataUri}}`,
});

const alertOnDrowsinessFlow = ai.defineFlow(
  {
    name: 'alertOnDrowsinessFlow',
    inputSchema: DrowsinessAlertInputSchema,
    outputSchema: DrowsinessAlertOutputSchema,
  },
  async input => {
    const drowsinessResult = await drowsinessDetectionPrompt(input);

    if (drowsinessResult.output?.isDrowsy) {
      const ttsResult = await ai.generate({
        model: 'googleai/gemini-2.5-flash-preview-tts',
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Algenib' },
            },
          },
        },
        prompt: drowsinessResult.output.alertMessage!,
      });

      if (ttsResult.media) {
        const audioBuffer = Buffer.from(
          ttsResult.media.url.substring(ttsResult.media.url.indexOf(',') + 1),
          'base64'
        );
        const audioDataUri = 'data:audio/wav;base64,' + (await toWav(audioBuffer));
        return {...drowsinessResult.output, audioDataUri};
      } else {
        console.warn('TTS Conversion Failed, no media returned');
      }
    }

    return drowsinessResult.output!;
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
