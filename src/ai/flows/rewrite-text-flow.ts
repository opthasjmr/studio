
'use server';
/**
 * @fileOverview An AI agent that rewrites or generates new research articles based on existing article content.
 *
 * - rewriteResearchArticle - A function that handles the rewriting/generation process.
 * - RewriteResearchArticleInput - The input type for the rewriteResearchArticle function.
 * - RewriteResearchArticleOutput - The return type for the rewriteResearchArticle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema: Accepts the text of an existing article and desired output format/style
const RewriteResearchArticleInputSchema = z.object({
  originalArticleText: z.string().describe('The full text content of the original research article.'),
  rewriteInstructions: z.string().optional().describe('Specific instructions for rewriting (e.g., "summarize for a lay audience", "focus on methodology", "generate an abstract", "expand on the discussion section"). If empty, generate a comprehensive new article based on the key findings.'),
  targetAudience: z.enum(["general", "medical_professional", "researcher"]).optional().default("researcher").describe('The intended audience for the rewritten/generated article.'),
});
export type RewriteResearchArticleInput = z.infer<typeof RewriteResearchArticleInputSchema>;

// Output Schema: The rewritten or generated article content
const RewriteResearchArticleOutputSchema = z.object({
  generatedContent: z.string().describe('The rewritten or newly generated article content based on the original article and instructions.'),
  sourceSummary: z.string().optional().describe('A brief summary of the key points from the original article used for generation.'),
});
export type RewriteResearchArticleOutput = z.infer<typeof RewriteResearchArticleOutputSchema>;

// Exported function to be called from the application
export async function rewriteResearchArticle(input: RewriteResearchArticleInput): Promise<RewriteResearchArticleOutput> {
  return rewriteResearchArticleFlow(input);
}

// Genkit Prompt Definition
const prompt = ai.definePrompt({
  name: 'rewriteResearchArticlePrompt',
  input: {schema: RewriteResearchArticleInputSchema},
  output: {schema: RewriteResearchArticleOutputSchema},
  prompt: `You are an expert academic AI assistant specializing in medical research writing.
Your task is to process the provided original research article text and generate new content based on the instructions.

**Original Article Text:**
{{{originalArticleText}}}

**Instructions:**
{{#if rewriteInstructions}}
{{{rewriteInstructions}}}
Target Audience: {{{targetAudience}}}
{{else}}
Generate a comprehensive new research article based on the key findings, methodology, and discussion presented in the original text. Ensure the structure includes an Abstract, Introduction, Methods, Results, Discussion, and Conclusion.
Target Audience: {{{targetAudience}}}
{{/if}}

**Output Requirements:**
1.  **Generated Content**: Provide the rewritten or newly generated article content as requested. Structure it appropriately (e.g., abstract, sections).
2.  **Source Summary** (Optional but recommended): Briefly summarize the key findings/points from the original article that informed your generation.

Adhere strictly to the instructions and maintain a formal, academic tone appropriate for the target audience ({{targetAudience}}). Focus on clarity, accuracy, and coherence. If generating a new article, synthesize the information logically.
`,
});

// Genkit Flow Definition
const rewriteResearchArticleFlow = ai.defineFlow(
  {
    name: 'rewriteResearchArticleFlow',
    inputSchema: RewriteResearchArticleInputSchema,
    outputSchema: RewriteResearchArticleOutputSchema,
  },
  async (input) => {
    // Input validation (e.g., check text length if necessary)
    if (input.originalArticleText.length < 100) { // Example minimum length
      throw new Error("Original article text is too short for meaningful rewriting.");
    }
     if (input.originalArticleText.length > 50000) { // Example maximum length
        // Potentially truncate or handle large inputs
        console.warn("Input text is very long, potentially truncating for AI processing.");
        // input.originalArticleText = input.originalArticleText.substring(0, 50000);
     }

    const {output} = await prompt(input);
    if (!output) {
      throw new Error("AI failed to generate rewritten content.");
    }
    return output;
  }
);
