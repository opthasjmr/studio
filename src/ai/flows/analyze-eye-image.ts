'use server';

/**
 * @fileOverview An AI agent that analyzes eye scan images (OCT, fundus) using Gemini
 * to highlight potential anomalies, suggest possible diagnoses for common eye conditions
 * like Diabetic Retinopathy, Glaucoma, AMD, and Cataracts, and provide risk assessment.
 *
 * - analyzeEyeImage - A function that handles the eye image analysis process.
 * - AnalyzeEyeImageInput - The input type for the analyzeEyeImage function.
 * - AnalyzeEyeImageOutput - The return type for the analyzeEyeImage function.
 */

import {ai} from '@/ai/genkit'; // Uses the default configured Gemini model
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
  severity: z.enum(["mild", "moderate", "severe", "normal", "indeterminate"]).optional().describe("Severity of the finding. Use 'indeterminate' if severity cannot be assessed from the image."),
});

const AnalyzeEyeImageOutputSchema = z.object({
  overallAssessment: z.string().describe('A general summary of the eye scan findings, mentioning image quality if relevant.'),
  detectedAnomalies: z.array(AnomalySchema).describe('A list of detected anomalies or key observations. If none are detected, return an empty array or an array with a "normal" finding.'),
  potentialConditions: z.array(
    z.object({
      conditionName: z.string().describe("Name of the potential eye condition (e.g., Diabetic Retinopathy, Glaucoma, AMD, Cataracts, Hypertensive Retinopathy, Retinal Detachment)."),
      confidenceScore: z.number().min(0).max(1).describe("Confidence score (0.0 to 1.0) for this potential condition based *only* on the visual evidence in the image."),
      supportingSigns: z.array(z.string()).describe("Specific visual signs observed in the image that support this potential condition."),
    })
  ).describe('Suggested potential diagnoses based *solely* on the image analysis. Focus on common conditions like Diabetic Retinopathy, Glaucoma, AMD, Cataracts, Hypertensive Retinopathy. Only include conditions for which visual evidence is present.'),
  riskFactorsHighlighted: z.array(z.string()).optional().describe("Any directly observable visual risk factors or indicators for future issues visible in the image (e.g., significant drusen, optic nerve cupping, vascular changes). Do not infer risks based on assumed patient history."),
  recommendedNextSteps: z.array(z.string()).optional().describe("Suggested next steps or further tests based *only* on the image findings (e.g., 'Consider OCT for macular thickness', 'Visual field test recommended', 'IOP measurement correlation needed', 'Referral to retina specialist suggested', 'Regular monitoring indicated'). Do not suggest general health advice."),
});
export type AnalyzeEyeImageOutput = z.infer<typeof AnalyzeEyeImageOutputSchema>;

export async function analyzeEyeImage(input: AnalyzeEyeImageInput): Promise<AnalyzeEyeImageOutput> {
  // The flow will use the Gemini model configured in genkit.ts
  return analyzeEyeImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeEyeImagePromptWithGemini', // Updated name
  input: {schema: AnalyzeEyeImageInputSchema},
  output: {schema: AnalyzeEyeImageOutputSchema},
  // Ensure the model used supports multimodal input (Gemini models generally do)
  // The specific model is configured in genkit.ts or could be overridden here if needed.
  // model: 'googleai/gemini-pro-vision', // Example if specific model needed

  prompt: `You are an expert ophthalmologist AI assistant using Google Gemini, specializing in analyzing eye scan images (OCT, fundus).
Your task is to meticulously analyze the provided eye scan image and provide a comprehensive report structured according to the output schema.

**IMPORTANT**: Your analysis MUST be based *solely* on the visual information present in the image provided. Do not infer patient history, age, or other conditions not visible in the scan. State if image quality limits assessment.

Image to Analyze: {{media url=eyeScanDataUri}}

Please provide the following based *only* on the image:
1.  **Overall Assessment**: Provide a concise summary of the overall findings from the scan. Mention image quality if it impacts analysis (e.g., "Good quality fundus photo", "OCT scan with some motion artifact").
2.  **Detected Anomalies**: List *specific* visual abnormalities or key observations. For each: finding, approximate location, and severity (mild, moderate, severe, normal, indeterminate). If the scan appears normal, state "Normal fundus/OCT appearance" or similar as a finding with 'normal' severity.
3.  **Potential Conditions**: Based *only* on the detected anomalies, suggest potential eye conditions. Focus on common conditions like Diabetic Retinopathy (DR), Glaucoma, Age-related Macular Degeneration (AMD), Cataracts (if visible), Hypertensive Retinopathy, Retinal Detachment, Macular Edema, Optic Neuritis.
    *   For DR: Look for microaneurysms, hemorrhages, exudates, neovascularization, macular edema.
    *   For Glaucoma: Assess optic nerve head (cup-to-disc ratio), nerve fiber layer thinning, disc hemorrhages.
    *   For AMD: Look for drusen (size, type), pigmentary changes, geographic atrophy, choroidal neovascularization, subretinal fluid.
    *   For Cataracts: Note lens opacities if clearly visible and relevant (less common for fundus/OCT).
    *   For Hypertensive Retinopathy: Look for AV nicking, copper/silver wiring, cotton wool spots, flame hemorrhages.
    For each *potential* condition suggested, provide a confidence score (0.0-1.0) based *only* on the image evidence and list the specific *visual signs* from the scan supporting it. Only include conditions with direct visual evidence.
4.  **Risk Factors Highlighted** (Optional): List *only* observable visual risk factors (e.g., "Extensive large drusen", "Significant optic nerve cupping", "Arteriolar narrowing"). Do not list general risk factors like age or diabetes unless *visually evident* (e.g., clear signs of DR).
5.  **Recommended Next Steps** (Optional): Suggest appropriate next steps or tests *directly indicated by the image findings* (e.g., 'Visual field testing due to optic nerve appearance', 'OCT scan suggested for macular thickening', 'IOP correlation needed for cupping assessment', 'Urgent referral to retina specialist for suspected detachment'). Avoid generic advice.

Ensure your analysis is objective, clinically relevant, and based strictly on the provided image. Prioritize clarity and actionable visual insights.
`,
});

const analyzeEyeImageFlow = ai.defineFlow(
  {
    name: 'analyzeEyeImageFlowWithGemini', // Updated name
    inputSchema: AnalyzeEyeImageInputSchema,
    outputSchema: AnalyzeEyeImageOutputSchema,
  },
  async input => {
    // The prompt call will use the configured Gemini model
    const {output} = await prompt(input);
    if (!output) {
      // Attempt to provide a structured error response
      const errorOutput: AnalyzeEyeImageOutput = {
        overallAssessment: "AI analysis failed to return a valid output. This might be due to image quality, content policy restrictions, or an internal error.",
        detectedAnomalies: [],
        potentialConditions: [],
        riskFactorsHighlighted: [],
        recommendedNextSteps: ["Review image quality and consider re-uploading or manual review."],
      };
      console.error("AI analysis did not return an output for input:", input);
      return errorOutput; // Return structured error instead of throwing
      // throw new Error("AI analysis did not return an output.");
    }
    // Add a check for empty/minimal results and potentially enhance the output message
     if (!output.overallAssessment && output.detectedAnomalies.length === 0 && output.potentialConditions.length === 0) {
       output.overallAssessment = output.overallAssessment || "AI analysis completed, but no specific findings or conditions were identified based on the provided image. Manual review is recommended.";
     }

    return output;
  }
);
