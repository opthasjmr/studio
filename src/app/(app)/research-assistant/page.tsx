
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Bot, FileText, Wand2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { rewriteResearchArticle, type RewriteResearchArticleInput, type RewriteResearchArticleOutput } from "@/ai/flows/rewrite-text-flow";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ResearchAssistantPage() {
  const [originalArticle, setOriginalArticle] = useState<string>("");
  const [instructions, setInstructions] = useState<string>("");
  const [audience, setAudience] = useState<"researcher" | "medical_professional" | "general">("researcher");
  const [generatedContent, setGeneratedContent] = useState<RewriteResearchArticleOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!originalArticle.trim()) {
      setError("Please paste the original article text.");
      return;
    }
    setError(null);
    setIsLoading(true);
    setGeneratedContent(null);

    try {
      const input: RewriteResearchArticleInput = {
        originalArticleText: originalArticle,
        rewriteInstructions: instructions || undefined, // Pass undefined if empty
        targetAudience: audience,
      };
      const result = await rewriteResearchArticle(input);
      setGeneratedContent(result);
      toast({
        title: "Content Generated",
        description: "AI has finished processing the article.",
      });
    } catch (e: any) {
      console.error("Generation error:", e);
      setError(e.message || "An unexpected error occurred during generation.");
      toast({
        title: "Generation Failed",
        description: e.message || "Could not generate content.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormattedContent = (text: string | undefined) => {
     if (!text) return null;
     // Simple paragraph splitting
     return text.split('\n').map((paragraph, index) => (
       <p key={index} className="mb-4 last:mb-0">{paragraph}</p>
     ));
  };


  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary flex items-center">
            <Wand2 className="mr-3 h-8 w-8" /> AI Research Assistant
          </CardTitle>
          <CardDescription className="text-lg mt-1">
            Rewrite, summarize, or generate new research articles based on existing content using AI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="original-article" className="text-lg font-semibold flex items-center">
              <FileText className="mr-2 h-5 w-5" /> Original Article Text
            </Label>
            <Textarea
              id="original-article"
              placeholder="Paste the full text of the research article here..."
              value={originalArticle}
              onChange={(e) => setOriginalArticle(e.target.value)}
              className="min-h-[250px] text-sm"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">Paste the content of the article you want to process.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions" className="text-lg font-semibold">
              Instructions for AI (Optional)
            </Label>
            <Textarea
              id="instructions"
              placeholder='e.g., "Summarize for a lay audience", "Focus on the methodology section", "Generate an abstract based on these findings", "Expand the discussion section with potential future research directions". Leave empty to generate a new comprehensive article.'
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="min-h-[100px] text-sm"
              disabled={isLoading}
            />
             <p className="text-xs text-muted-foreground">Provide specific instructions or leave blank to generate a new article.</p>
          </div>

          <div className="space-y-2">
             <Label htmlFor="target-audience" className="text-lg font-semibold">Target Audience</Label>
             <Select
                value={audience}
                onValueChange={(value: "researcher" | "medical_professional" | "general") => setAudience(value)}
                disabled={isLoading}
             >
                <SelectTrigger id="target-audience" className="w-full md:w-[250px]">
                    <SelectValue placeholder="Select target audience" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="researcher">Researcher</SelectItem>
                    <SelectItem value="medical_professional">Medical Professional</SelectItem>
                    <SelectItem value="general">General Audience</SelectItem>
                </SelectContent>
             </Select>
          </div>


          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleGenerate} disabled={isLoading || !originalArticle.trim()} size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5" /> Generate Content
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {generatedContent && !isLoading && (
        <Card className="shadow-xl mt-8">
          <CardHeader className="bg-secondary/50">
            <CardTitle className="text-2xl font-bold text-primary flex items-center">
              <Bot className="mr-3 h-7 w-7" /> Generated Content
            </CardTitle>
             {generatedContent.sourceSummary && (
                <CardDescription>Based on summary: {generatedContent.sourceSummary}</CardDescription>
             )}
          </CardHeader>
          <CardContent className="pt-6">
            <div className="prose prose-sm max-w-none dark:prose-invert text-foreground leading-relaxed">
               {renderFormattedContent(generatedContent.generatedContent)}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
