'use server';
/**
 * @fileOverview An AI agent that analyzes uploaded document content (text or from data URI)
 * and generates a structured summary including key points, etiology, symptoms, diagnosis,
 * treatment, prognosis, and an overall summary.
 *
 * - analyzeDocumentContent - A function that handles the document content analysis process.
 * - AnalyzeDocumentContentInput - The input type for the analyzeDocumentContent function.
 * - AnalyzeDocumentContentOutput - The return type for the analyzeDocumentContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeDocumentContentInputSchema = z.object({
  textContent: z.string().optional().describe('The text content of the document.'),
  fileDataUri: z.string().optional().describe("The document file as a data URI (e.g., for PDFs, images that might contain text). Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  fileName: z.string().optional().describe('The name of the uploaded file, for context.'),
});
export type AnalyzeDocumentContentInput = z.infer<typeof AnalyzeDocumentContentInputSchema>;

export const AnalyzeDocumentContentOutputSchema = z.object({
  topic: z.string().optional().describe('The main medical topic identified in the document.'),
  keyPointsSummary: z.array(z.string()).optional().describe('A concise list of 3-5 key bullet points summarizing the most critical aspects of the document relevant to a medical condition or topic.'),
  etiology: z.string().optional().describe('The causes and risk factors discussed in the document.'),
  symptoms: z.string().optional().describe('Early signs and progression of diseases/conditions mentioned.'),
  diagnosis: z.string().optional().describe('Methods and tools for diagnosis mentioned in the document.'),
  treatment: z.string().optional().describe('Medical, surgical, and lifestyle treatments discussed.'),
  prognosis: z.string().optional().describe('Expected outcomes and long-term outlook if discussed.'),
  overallSummary: z.string().optional().describe('A concise overall summary of the document content, focusing on medical relevance.'),
});
export type AnalyzeDocumentContentOutput = z.infer<typeof AnalyzeDocumentContentOutputSchema>;

export async function analyzeDocumentContent(input: AnalyzeDocumentContentInput): Promise<AnalyzeDocumentContentOutput> {
  if (!input.textContent &amp;&amp; !input.fileDataUri) {
    throw new Error("Either textContent or fileDataUri must be provided.");
  }
  return analyzeDocumentContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeDocumentContentPrompt',
  input: {schema: AnalyzeDocumentContentInputSchema},
  output: {schema: AnalyzeDocumentContentOutputSchema},
  prompt: `You are an expert medical information AI.
Your task is to analyze the provided document content{{#if fileName}} (from file: {{{fileName}}}){{/if}} and generate a structured medical summary.
The document content is provided either as direct text or as a media URI.

{{#if textContent}}
Document Text:
{{{textContent}}}
{{else if fileDataUri}}
Document Media: {{media url=fileDataUri}}
{{/if}}

Based on the document, please provide the following:
1.  **Topic**: Identify the main medical topic or condition discussed.
2.  **Key Points Summary**: A concise list of 3-5 key bullet points summarizing the most critical aspects relevant to a medical condition or topic found in the document.
3.  **Etiology**: If discussed, detail the primary causes and significant risk factors.
4.  **Symptoms**: If discussed, describe common early signs and progression.
5.  **Diagnosis**: If discussed, explain diagnostic methods, tests, or tools.
6.  **Treatment**: If discussed, outline main medical, surgical, or lifestyle treatment options.
7.  **Prognosis**: If discussed, discuss expected outcomes and long-term outlook.
8.  **Overall Summary**: Provide a brief, overarching summary of the document's medically relevant content.

If some sections (e.g., Prognosis) are not applicable or not found in the document, you may omit them or state "Not discussed in the document."
Focus on extracting and summarizing information explicitly present in or directly inferable from the provided document.
`,
});

const analyzeDocumentContentFlow = ai.defineFlow(
  {
    name: 'analyzeDocumentContentFlow',
    inputSchema: AnalyzeDocumentContentInputSchema,
    outputSchema: AnalyzeDocumentContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("AI document analysis did not return an output.");
    }
    return output;
  }
);

    