import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-uploaded-media.ts';
import '@/ai/flows/summarize-emotions-after-drive.ts';
import '@/ai/flows/alert-on-drowsiness.ts';