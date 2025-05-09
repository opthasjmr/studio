'use server';
/**
 * @fileOverview An AI agent that generates a concise literature review snippet for a given medical topic.
 *
 * - generateLiteratureReviewSnippet - A function that handles the snippet generation.
 * - GenerateLiteratureReviewSnippetInput - The input type.
 * - GenerateLiteratureReviewSnippetOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLiteratureReviewSnippetInputSchema = z.object({
  topic: z.string().describe('The medical topic for the literature review snippet.'),
  keywords: z.string().optional().describe('Comma-separated keywords to focus the review (e.g., "glaucoma, treatment, new therapies").'),
});
export type GenerateLiteratureReviewSnippetInput = z.infer<typeof GenerateLiteratureReviewSnippetInputSchema>;

const GenerateLiteratureReviewSnippetOutputSchema = z.object({
  snippet: z.string().describe('A concise literature review snippet (2-3 paragraphs) on the topic.'),
  suggestedKeywords: z.array(z.string()).optional().describe('A list of 3-5 additional relevant keywords for further research.'),
  potentialSourceTypes: z.array(z.string()).optional().describe('A list of 2-3 types of sources where more information can be found (e.g., "PubMed Clinical Queries", "Cochrane Reviews", "Ophthalmology Journals").'),
});
export type GenerateLiteratureReviewSnippetOutput = z.infer<typeof GenerateLiteratureReviewSnippetOutputSchema>;

export async function generateLiteratureReviewSnippet(input: GenerateLiteratureReviewSnippetInput): Promise<GenerateLiteratureReviewSnippetOutput> {
  return generateLiteratureReviewSnippetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLiteratureReviewSnippetPrompt',
  input: {schema: GenerateLiteratureReviewSnippetInputSchema},
  output: {schema: GenerateLiteratureReviewSnippetOutputSchema},
  prompt: `You are an expert AI research assistant specializing in medical literature.
Your task is to generate a concise literature review snippet (2-3 paragraphs) for the provided medical topic.
If keywords are provided, focus the review around those keywords.

Topic: {{{topic}}}
{{#if keywords}}
Keywords: {{{keywords}}}
{{/if}}

In addition to the snippet, please also provide:
1.  'suggestedKeywords': A list of 3-5 additional relevant keywords that could be used for further research on this topic.
2.  'potentialSourceTypes': A list of 2-3 types of sources where more detailed information or primary studies can typically be found (e.g., "PubMed database", "ClinicalTrials.gov", "Specialized ophthalmology journals like 'Ophthalmology' or 'JAMA Ophthalmology'", "Systematic reviews from Cochrane Library").

Ensure the snippet is informative, neutral, and written in a professional tone suitable for medical researchers.
Do not invent information; base the snippet on generally established knowledge for the given topic.
Focus on summarizing existing understanding rather than presenting novel unpublished findings.
The snippet should provide a brief overview of the current understanding or key aspects of the topic.
`,
});

const generateLiteratureReviewSnippetFlow = ai.defineFlow(
  {
    name: 'generateLiteratureReviewSnippetFlow',
    inputSchema: GenerateLiteratureReviewSnippetInputSchema,
    outputSchema: GenerateLiteratureReviewSnippetOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("AI failed to generate the literature review snippet.");
    }
    return output;
  }
);