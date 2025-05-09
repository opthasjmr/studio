
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Bot, FileText, Wand2, AlertCircle, BookOpen, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { rewriteResearchArticle, type RewriteResearchArticleInput, type RewriteResearchArticleOutput } from "@/ai/flows/rewrite-text-flow";
import { generateLiteratureReviewSnippet, type GenerateLiteratureReviewSnippetInput, type GenerateLiteratureReviewSnippetOutput } from "@/ai/flows/generate-literature-review-snippet-flow";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';

export default function ResearchAssistantPage() {
  // State for Rewrite Article
  const [originalArticle, setOriginalArticle] = useState<string>("");
  const [rewriteInstructions, setRewriteInstructions] = useState<string>("");
  const [rewriteAudience, setRewriteAudience] = useState<"researcher" | "medical_professional" | "general">("researcher");
  const [rewriteGeneratedContent, setRewriteGeneratedContent] = useState<RewriteResearchArticleOutput | null>(null);
  const [isRewriteLoading, setIsRewriteLoading] = useState<boolean>(false);
  const [rewriteError, setRewriteError] = useState<string | null>(null);

  // State for Literature Review Snippet
  const [reviewTopic, setReviewTopic] = useState<string>("");
  const [reviewKeywords, setReviewKeywords] = useState<string>("");
  const [reviewGeneratedContent, setReviewGeneratedContent] = useState<GenerateLiteratureReviewSnippetOutput | null>(null);
  const [isReviewLoading, setIsReviewLoading] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const { toast } = useToast();

  const handleRewriteGenerate = async () => {
    if (!originalArticle.trim()) {
      setRewriteError("Please paste the original article text.");
      return;
    }
    setRewriteError(null);
    setIsRewriteLoading(true);
    setRewriteGeneratedContent(null);

    try {
      const input: RewriteResearchArticleInput = {
        originalArticleText: originalArticle,
        rewriteInstructions: rewriteInstructions || undefined,
        targetAudience: rewriteAudience,
      };
      const result = await rewriteResearchArticle(input);
      setRewriteGeneratedContent(result);
      toast({
        title: "Content Rewritten",
        description: "AI has finished processing the article for rewriting.",
      });
    } catch (e: any) {
      console.error("Rewrite error:", e);
      setRewriteError(e.message || "An unexpected error occurred during rewriting.");
      toast({
        title: "Rewrite Failed",
        description: e.message || "Could not rewrite content.",
        variant: "destructive",
      });
    } finally {
      setIsRewriteLoading(false);
    }
  };

  const handleReviewGenerate = async () => {
    if (!reviewTopic.trim()) {
      setReviewError("Please enter a topic for the literature review snippet.");
      return;
    }
    setReviewError(null);
    setIsReviewLoading(true);
    setReviewGeneratedContent(null);

    try {
      const input: GenerateLiteratureReviewSnippetInput = {
        topic: reviewTopic,
        keywords: reviewKeywords || undefined,
      };
      const result = await generateLiteratureReviewSnippet(input);
      setReviewGeneratedContent(result);
      toast({
        title: "Literature Review Snippet Generated",
        description: "AI has finished generating the snippet.",
      });
    } catch (e: any) {
      console.error("Literature review generation error:", e);
      setReviewError(e.message || "An unexpected error occurred during snippet generation.");
      toast({
        title: "Snippet Generation Failed",
        description: e.message || "Could not generate snippet.",
        variant: "destructive",
      });
    } finally {
      setIsReviewLoading(false);
    }
  };
  
  const renderFormattedText = (text: string | undefined) => {
     if (!text) return null;
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
            Utilize AI for various research tasks like rewriting articles or generating literature review snippets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="rewrite-article" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="rewrite-article">Rewrite Article</TabsTrigger>
              <TabsTrigger value="literature-review">Literature Review Snippet</TabsTrigger>
            </TabsList>

            {/* Rewrite Article Tab */}
            <TabsContent value="rewrite-article" className="mt-6">
              <div className="space-y-6">
                {rewriteError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{rewriteError}</AlertDescription>
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
                    className="min-h-[200px] text-sm"
                    disabled={isRewriteLoading}
                  />
                  <p className="text-xs text-muted-foreground">Paste the content of the article you want to process.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rewrite-instructions" className="text-lg font-semibold">
                    Instructions for AI (Optional)
                  </Label>
                  <Textarea
                    id="rewrite-instructions"
                    placeholder='e.g., "Summarize for a lay audience", "Focus on methodology", "Generate an abstract", "Expand discussion". Leave empty to generate a new comprehensive article.'
                    value={rewriteInstructions}
                    onChange={(e) => setRewriteInstructions(e.target.value)}
                    className="min-h-[80px] text-sm"
                    disabled={isRewriteLoading}
                  />
                  <p className="text-xs text-muted-foreground">Provide specific instructions or leave blank for general rewriting.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rewrite-target-audience" className="text-lg font-semibold">Target Audience</Label>
                  <Select
                      value={rewriteAudience}
                      onValueChange={(value: "researcher" | "medical_professional" | "general") => setRewriteAudience(value)}
                      disabled={isRewriteLoading}
                  >
                      <SelectTrigger id="rewrite-target-audience" className="w-full md:w-[250px]">
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
                  <Button onClick={handleRewriteGenerate} disabled={isRewriteLoading || !originalArticle.trim()} size="lg">
                    {isRewriteLoading ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...</>
                    ) : (
                      <><Wand2 className="mr-2 h-5 w-5" /> Rewrite Content</>
                    )}
                  </Button>
                </div>
                {rewriteGeneratedContent && !isRewriteLoading && (
                  <Card className="shadow-md mt-6">
                    <CardHeader className="bg-secondary/50">
                      <CardTitle className="text-xl font-bold text-primary flex items-center">
                        <Bot className="mr-3 h-6 w-6" /> Rewritten Content
                      </CardTitle>
                      {rewriteGeneratedContent.sourceSummary && (
                          <CardDescription>Based on summary: {rewriteGeneratedContent.sourceSummary}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="prose prose-sm max-w-none dark:prose-invert text-foreground leading-relaxed">
                        {renderFormattedText(rewriteGeneratedContent.generatedContent)}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Literature Review Snippet Tab */}
            <TabsContent value="literature-review" className="mt-6">
              <div className="space-y-6">
                {reviewError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{reviewError}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="review-topic" className="text-lg font-semibold flex items-center">
                    <BookOpen className="mr-2 h-5 w-5" /> Medical Topic
                  </Label>
                  <Textarea
                    id="review-topic"
                    placeholder="e.g., Diabetic Retinopathy, Glaucoma Pathophysiology, Advances in Cataract Surgery..."
                    value={reviewTopic}
                    onChange={(e) => setReviewTopic(e.target.value)}
                    className="min-h-[80px] text-sm"
                    disabled={isReviewLoading}
                  />
                  <p className="text-xs text-muted-foreground">Enter the main medical topic for the literature review snippet.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="review-keywords" className="text-lg font-semibold">
                    Keywords (Optional)
                  </Label>
                  <Input
                    id="review-keywords"
                    placeholder="e.g., treatment, new therapies, diagnosis, AI"
                    value={reviewKeywords}
                    onChange={(e) => setReviewKeywords(e.target.value)}
                    className="text-sm"
                    disabled={isReviewLoading}
                  />
                  <p className="text-xs text-muted-foreground">Provide comma-separated keywords to focus the review.</p>
                </div>
                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={handleReviewGenerate} disabled={isReviewLoading || !reviewTopic.trim()} size="lg">
                    {isReviewLoading ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Snippet...</>
                    ) : (
                      <><Search className="mr-2 h-5 w-5" /> Generate Snippet</>
                    )}
                  </Button>
                </div>
                {reviewGeneratedContent && !isReviewLoading && (
                  <Card className="shadow-md mt-6">
                    <CardHeader className="bg-secondary/50">
                      <CardTitle className="text-xl font-bold text-primary flex items-center">
                        <Bot className="mr-3 h-6 w-6" /> Literature Review Snippet
                      </CardTitle>
                      <CardDescription>Topic: {reviewTopic}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      <div>
                        <h3 className="font-semibold text-md mb-1">Generated Snippet:</h3>
                        <div className="prose prose-sm max-w-none dark:prose-invert text-foreground leading-relaxed p-3 border rounded-md bg-background">
                          {renderFormattedText(reviewGeneratedContent.snippet)}
                        </div>
                      </div>
                      {reviewGeneratedContent.suggestedKeywords && reviewGeneratedContent.suggestedKeywords.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-md mb-1">Suggested Keywords for Further Research:</h3>
                          <div className="flex flex-wrap gap-2">
                            {reviewGeneratedContent.suggestedKeywords.map(keyword => (
                              <Badge key={keyword} variant="outline">{keyword}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {reviewGeneratedContent.potentialSourceTypes && reviewGeneratedContent.potentialSourceTypes.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-md mb-1">Potential Source Types:</h3>
                          <ul className="list-disc list-inside text-sm text-muted-foreground">
                            {reviewGeneratedContent.potentialSourceTypes.map(sourceType => (
                              <li key={sourceType}>{sourceType}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="text-center mt-4">
            <p className="text-xs text-muted-foreground mx-auto">
              AI-generated content is for research assistance and should be critically reviewed. Always consult primary sources and experts.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
