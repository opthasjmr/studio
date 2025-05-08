'use server';

/**
 * @fileOverview An AI agent that analyzes eye scan images (OCT, fundus) to highlight potential anomalies,
 * suggest possible diagnoses for common eye conditions like Diabetic Retinopathy, Glaucoma, AMD, and Cataracts,
 * and provide risk assessment.
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

const AnomalySchema = z.object({
  finding: z.string().describe("Specific anomaly or observation from the scan."),
  location: z.string().optional().describe("Approximate location of the finding in the image (e.g., 'optic disc', 'macula', 'superior retina')."),
  severity: z.enum(["mild", "moderate", "severe", "normal"]).optional().describe("Severity of the finding."),
});

const AnalyzeEyeImageOutputSchema = z.object({
  overallAssessment: z.string().describe('A general summary of the eye scan findings.'),
  detectedAnomalies: z.array(AnomalySchema).describe('A list of detected anomalies or key observations.'),
  potentialConditions: z.array(
    z.object({
      conditionName: z.string().describe("Name of the potential eye condition (e.g., Diabetic Retinopathy, Glaucoma, AMD, Cataracts)."),
      confidenceScore: z.number().min(0).max(1).describe("Confidence score (0.0 to 1.0) for this potential condition."),
      supportingSigns: z.array(z.string()).describe("Signs from the scan that support this potential condition."),
    })
  ).describe('Suggested potential diagnoses based on the analysis, including common conditions like Diabetic Retinopathy, Glaucoma, AMD, and Cataracts.'),
  riskFactorsHighlighted: z.array(z.string()).optional().describe("Any observable risk factors or indicators for future issues."),
  recommendedNextSteps: z.array(z.string()).optional().describe("Suggested next steps or tests based on the findings (e.g., 'Refer to specialist', 'Visual field test', 'Regular monitoring')."),
});
export type AnalyzeEyeImageOutput = z.infer<typeof AnalyzeEyeImageOutputSchema>;

export async function analyzeEyeImage(input: AnalyzeEyeImageInput): Promise<AnalyzeEyeImageOutput> {
  return analyzeEyeImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeEyeImagePrompt',
  input: {schema: AnalyzeEyeImageInputSchema},
  output: {schema: AnalyzeEyeImageOutputSchema},
  prompt: `You are an expert ophthalmologist AI assistant specializing in analyzing eye scan images (OCT, fundus).
Your task is to meticulously analyze the provided eye scan image and provide a comprehensive report.

Image to Analyze: {{media url=eyeScanDataUri}}

Please structure your response according to the output schema. Specifically:
1.  **Overall Assessment**: Provide a concise summary of the overall findings from the scan.
2.  **Detected Anomalies**: List any specific abnormalities or key observations. For each, describe the finding, its approximate location if identifiable, and its severity (mild, moderate, severe, or normal if no anomaly).
3.  **Potential Conditions**: Based on the anomalies, suggest potential eye conditions. Focus on common conditions such as:
    *   Diabetic Retinopathy (look for microaneurysms, hemorrhages, exudates, neovascularization)
    *   Glaucoma (assess optic nerve head, cup-to-disc ratio, nerve fiber layer thinning)
    *   Age-related Macular Degeneration (AMD) (look for drusen, pigmentary changes, geographic atrophy, choroidal neovascularization)
    *   Cataracts (if visible and pertinent from the scan type, though less common for OCT/fundus diagnosis directly)
    *   Other relevant conditions (e.g., retinal detachment, macular edema, optic neuritis).
    For each potential condition, provide a confidence score (0.0 to 1.0) and list the specific signs from the scan that support this assessment.
4.  **Risk Factors Highlighted** (Optional): If any observable features suggest underlying risk factors (e.g., vascular changes indicative of hypertension, extensive drusen), list them.
5.  **Recommended Next Steps** (Optional): Based on the findings, suggest appropriate next steps or further tests (e.g., 'Refer to a retina specialist', 'Visual field testing', 'IOP measurement', 'Regular monitoring and follow-up in X months').

Ensure your analysis is thorough, clinically relevant, and helpful for a consulting ophthalmologist.
Prioritize clarity and actionable insights. If the image quality is poor or insufficient for a detailed analysis, please state that.
`,
});

const analyzeEyeImageFlow = ai.defineFlow(
  {
    name: 'analyzeEyeImageFlow',
    inputSchema: AnalyzeEyeImageInputSchema,
    outputSchema: AnalyzeEyeImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("AI analysis did not return an output.");
    }
    return output;
  }
);
