import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-eye-image.ts';
import '@/ai/flows/summarize-text-flow.ts';
import '@/ai/flows/generate-medical-topic-summary-flow.ts';
import '@/ai/flows/analyze-document-content-flow.ts'; // Added new flow

    