'use server';

/**
 * @fileOverview An AI agent that analyzes eye scan images (OCT, fundus) to highlight potential anomalies and suggest possible diagnoses.
 *
 * - analyzeEyeImage - A function that handles the eye image analysis process.
 * - AnalyzeEyeImageInput - The input type for the analyzeEyeImage function.
 * - AnalyzeEyeImageOutput - The return type for the analyzeEyeImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeEyeImageInputSchema = z.object({
  eyeScanDataUri: z
    .string()
    .describe(
      "An eye scan image (OCT, fundus), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeEyeImageInput = z.infer<typeof AnalyzeEyeImageInputSchema>;

const AnalyzeEyeImageOutputSchema = z.object({
  analysisResult: z.string().describe('The AI analysis result of the eye scan image.'),
  suggestedDiagnoses: z.array(z.string()).describe('Suggested possible diagnoses based on the analysis.'),
});
export type AnalyzeEyeImageOutput = z.infer<typeof AnalyzeEyeImageOutputSchema>;

export async function analyzeEyeImage(input: AnalyzeEyeImageInput): Promise<AnalyzeEyeImageOutput> {
  return analyzeEyeImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeEyeImagePrompt',
  input: {schema: AnalyzeEyeImageInputSchema},
  output: {schema: AnalyzeEyeImageOutputSchema},
  prompt: `You are an expert ophthalmologist specializing in analyzing eye scan images.

You will use this information to identify potential anomalies and suggest possible diagnoses.

Analyze the following eye scan image and provide your analysis and suggested diagnoses.

Eye Scan Image: {{media url=eyeScanDataUri}}`,
});

const analyzeEyeImageFlow = ai.defineFlow(
  {
    name: 'analyzeEyeImageFlow',
    inputSchema: AnalyzeEyeImageInputSchema,
    outputSchema: AnalyzeEyeImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
