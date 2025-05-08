
"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Search, AlertCircle, BookOpen, Link as LinkIcon, MessageSquareText, FileText, Brain } from "lucide-react";
import type { GenerateMedicalTopicSummaryOutput } from "@/ai/flows/generate-medical-topic-summary-flow";

interface SearchResultItem {
  source: string;
  title: string;
  summary: string;
  url: string;
  originalSummary?: string;
  image_url?: string;
}

interface MedicalSearchResponse {
  aiComprehensiveSummary?: GenerateMedicalTopicSummaryOutput;
  results: SearchResultItem[];
}

export function MedicalKnowledgeSearch() {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("all");
  const [aiComprehensiveSummary, setAiComprehensiveSummary] = useState<GenerateMedicalTopicSummaryOutput | null>(null);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSummaries, setExpandedSummaries] = useState<Record<number, boolean>>({});

  const toggleSummaryExpansion = (index: number) => {
    setExpandedSummaries(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) {
      setError("Please enter a search term.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResults([]);
    setAiComprehensiveSummary(null);
    setExpandedSummaries({});

    try {
      // Always request AI summary when 'all' sources or if a specific source that benefits from it is chosen.
      // For simplicity, we'll request it if source is 'all' or 'wikipedia' or 'pubmed' as these are info-dense.
      const shouldRequestAISummary = source === "all" || source === "wikipedia" || source === "pubmed";
      
      const response = await fetch(
        `/api/medical-search?query=${encodeURIComponent(query)}&source=${source}&summarize=${shouldRequestAISummary}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data: MedicalSearchResponse = await response.json();
      
      if (data.aiComprehensiveSummary) {
        setAiComprehensiveSummary(data.aiComprehensiveSummary);
      }
      setResults(data.results);

      if (!data.aiComprehensiveSummary && data.results.length === 0) {
        setError("No results found for your query. Try a broader term or different source.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch search results.");
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMarkdownList = (text: string) => {
    // Basic markdown for lists (assuming items start with "- " or "* ")
    const lines = text.split('\n');
    return lines.map((line, index) => {
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return <li key={index} className="ml-4 list-disc">{line.trim().substring(2)}</li>;
      }
      return <p key={index}>{line}</p>;
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary">Medical Knowledge Search</CardTitle>
          <CardDescription>
            Search ophthalmology topics, diseases, and research. AI provides detailed summaries for medical topics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="text"
                id="search-query"
                placeholder="e.g., Macular Degeneration, OCT..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-grow"
                aria-label="Search query"
              />
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger className="w-full sm:w-[180px]" aria-label="Source filter">
                  <SelectValue placeholder="Select Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources & AI Summary</SelectItem>
                  <SelectItem value="wikipedia">Wikipedia</SelectItem>
                  <SelectItem value="pubmed">PubMed</SelectItem>
                  <SelectItem value="medlineplus">MedlinePlus</SelectItem>
                  <SelectItem value="googlescholar">Google Scholar</SelectItem>
                  <SelectItem value="aocet">AO CET Ophthalmology</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Search
              </Button>
            </div>
          </form>

          {error && !isLoading && (
            <Alert variant="destructive" className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Search Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {isLoading && (
             <div className="flex justify-center items-center mt-8 py-10">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="ml-3 text-lg text-muted-foreground">Searching and analyzing information...</p>
            </div>
          )}

          {!isLoading && (aiComprehensiveSummary || results.length > 0) && (
            <div className="mt-8 space-y-6">
              {aiComprehensiveSummary && (
                <Card className="border-primary shadow-md">
                  <CardHeader className="bg-primary/10">
                    <CardTitle className="text-xl text-primary flex items-center">
                      <Brain className="mr-2 h-6 w-6" /> AI Comprehensive Summary: {aiComprehensiveSummary.topic}
                    </CardTitle>
                    <CardDescription>Detailed overview covering etiology, symptoms, diagnosis, treatment, and prognosis.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-4">
                    <div>
                      <h4 className="font-semibold text-md text-foreground">Overall Summary:</h4>
                      <p className="text-sm text-muted-foreground">{aiComprehensiveSummary.overallSummary}</p>
                    </div>
                     <div>
                      <h4 className="font-semibold text-md text-foreground">Etiology (Causes & Risk Factors):</h4>
                      <div className="text-sm text-muted-foreground prose prose-sm max-w-none">{renderMarkdownList(aiComprehensiveSummary.etiology)}</div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-md text-foreground">Symptoms:</h4>
                      <div className="text-sm text-muted-foreground prose prose-sm max-w-none">{renderMarkdownList(aiComprehensiveSummary.symptoms)}</div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-md text-foreground">Diagnosis:</h4>
                      <div className="text-sm text-muted-foreground prose prose-sm max-w-none">{renderMarkdownList(aiComprehensiveSummary.diagnosis)}</div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-md text-foreground">Treatment:</h4>
                      <div className="text-sm text-muted-foreground prose prose-sm max-w-none">{renderMarkdownList(aiComprehensiveSummary.treatment)}</div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-md text-foreground">Prognosis:</h4>
                      <div className="text-sm text-muted-foreground prose prose-sm max-w-none">{renderMarkdownList(aiComprehensiveSummary.prognosis)}</div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {results.length > 0 && (
                <>
                  <h3 className="text-xl font-semibold text-foreground mt-8 border-t pt-6">
                    Additional Information from Sources:
                  </h3>
                  {results.map((item, index) => (
                    <Card key={index} className="bg-secondary/50">
                      <CardHeader>
                        <CardTitle className="text-lg text-primary hover:underline">
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                            {item.title || "Untitled"}
                            <LinkIcon className="ml-2 h-4 w-4 opacity-70" />
                          </a>
                        </CardTitle>
                        <CardDescription>
                          Source: <span className="font-medium">{item.source}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {item.image_url && item.source === "Wikipedia" && (
                           <div className="my-3">
                             <Image
                                src={item.image_url}
                                alt={`Image for ${item.title}`}
                                data-ai-hint="medical illustration"
                                width={300}
                                height={200}
                                className="rounded-md object-contain border"
                              />
                           </div>
                        )}
                        {item.source === "PubMed" && item.originalSummary ? (
                          <>
                            <div className="flex items-center text-sm text-primary mb-1">
                              <MessageSquareText className="h-4 w-4 mr-1.5" /> AI-Generated Abstract Summary:
                            </div>
                            <p className="text-sm text-foreground bg-primary/10 p-2 rounded-md">
                              {item.summary}
                            </p>
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => toggleSummaryExpansion(index)}
                              className="text-xs p-0 h-auto mt-1"
                            >
                              {expandedSummaries[index] ? "Hide" : "Show"} Original Abstract
                              <FileText className="ml-1 h-3 w-3" />
                            </Button>
                            {expandedSummaries[index] && (
                              <div className="mt-2 border-t pt-2">
                                <p className="text-xs text-muted-foreground mb-1">Original Abstract:</p>
                                <p className="text-sm text-muted-foreground line-clamp-5 hover:line-clamp-none transition-all duration-300">
                                  {item.originalSummary}
                                </p>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground line-clamp-3">{item.summary || "No summary available."}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </div>
          )}
          
          <Alert className="mt-8">
            <BookOpen className="h-4 w-4" />
            <AlertTitle>Information Source & Disclaimer</AlertTitle>
            <AlertDescription>
              This search utilizes public APIs and AI summarization for informational purposes. 
              The AI-generated comprehensive summary is intended to provide a structured overview of medical topics.
              Always verify information with primary sources and consult medical professionals for advice.
            </AlertDescription>
          </Alert>

        </CardContent>
      </Card>
    </div>
  );
}
