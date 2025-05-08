'use server';
/**
 * @fileOverview An AI agent that generates a comprehensive summary of a medical topic,
 * including key bullet points and detailed sections like Etiology, Symptoms, Diagnosis, Treatment, and Prognosis.
 *
 * - generateMedicalTopicSummary - A function that handles the medical topic summarization process.
 * - GenerateMedicalTopicSummaryInput - The input type for the generateMedicalTopicSummary function.
 * - GenerateMedicalTopicSummaryOutput - The return type for the generateMedicalTopicSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMedicalTopicSummaryInputSchema = z.object({
  topic: z.string().describe('The medical topic or condition to summarize.'),
});
export type GenerateMedicalTopicSummaryInput = z.infer<typeof GenerateMedicalTopicSummaryInputSchema>;

const GenerateMedicalTopicSummaryOutputSchema = z.object({
  topic: z.string().describe('The medical topic that was summarized.'),
  keyPointsSummary: z.array(z.string()).describe('A concise list of 3-5 key bullet points summarizing the most critical aspects of the topic.'),
  etiology: z.string().describe('The causes and risk factors of the condition.'),
  symptoms: z.string().describe('Early signs and progression of the disease.'),
  diagnosis: z.string().describe('Methods and tools used to diagnose the condition.'),
  treatment: z.string().describe('Medical, surgical, and lifestyle treatments available.'),
  prognosis: z.string().describe('Expected outcomes and long-term outlook for the condition.'),
  overallSummary: z.string().describe('A concise overall summary of the medical topic.'),
});
export type GenerateMedicalTopicSummaryOutput = z.infer<typeof GenerateMedicalTopicSummaryOutputSchema>;

export async function generateMedicalTopicSummary(input: GenerateMedicalTopicSummaryInput): Promise<GenerateMedicalTopicSummaryOutput> {
  return generateMedicalTopicSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMedicalTopicSummaryPrompt',
  input: {schema: GenerateMedicalTopicSummaryInputSchema},
  output: {schema: GenerateMedicalTopicSummaryOutputSchema},
  prompt: `You are an expert medical information AI.
For the medical topic: {{{topic}}}, provide a comprehensive yet structured summary.

First, provide a 'keyPointsSummary' which is a concise list of 3-5 key bullet points summarizing the most critical aspects of the topic.

Then, proceed with the detailed sections:
1.  **Etiology**: Detail the primary causes and significant risk factors associated with {{{topic}}}.
2.  **Symptoms**: Describe the common early signs and how {{{topic}}} typically progresses. Include characteristic symptoms.
3.  **Diagnosis**: Explain the common diagnostic methods, tests, and tools used to confirm {{{topic}}}. Mention key diagnostic criteria if applicable.
4.  **Treatment**: Outline the main medical, surgical, and lifestyle treatment options available for {{{topic}}}. Include current best practices.
5.  **Prognosis**: Discuss the expected outcomes and long-term outlook for individuals with {{{topic}}}. Consider factors influencing prognosis.
6.  **Overall Summary**: Provide a brief, overarching summary of {{{topic}}} (this should be different and more narrative than the key points).

Ensure the information is accurate, clear, and suitable for a medical professional or a well-informed patient. Focus on key information for each section.
The topic is: {{{topic}}}
`,
});

const generateMedicalTopicSummaryFlow = ai.defineFlow(
  {
    name: 'generateMedicalTopicSummaryFlow',
    inputSchema: GenerateMedicalTopicSummaryInputSchema,
    outputSchema: GenerateMedicalTopicSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("AI medical topic summarization did not return an output.");
    }
    // Ensure the topic field in the output is set to the input topic
    return { ...output, topic: input.topic };
  }
);