import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-uploaded-media.ts';
import '@/ai/flows/summarize-emotions-after-drive.ts';
import '@/ai/flows/alert-on-drowsiness.ts';
import '@/ai/flows/generate-joke-flow.ts';
import '@/ai/flows/text-to-speech-flow.ts';
