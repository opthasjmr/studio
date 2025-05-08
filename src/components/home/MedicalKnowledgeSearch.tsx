"use client";

import { useState, type ChangeEvent } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Added import for Label
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Search, AlertCircle, BookOpen, Link as LinkIcon, MessageSquareText, FileText, Brain, Eye, EyeOff, UploadCloud, FileUp } from "lucide-react";
import type { GenerateMedicalTopicSummaryOutput as AIOutputType } from "@/ai/flows/generate-medical-topic-summary-flow";
import type { AnalyzeDocumentContentOutput as AIDocumentAnalysisOutputType } from "@/ai/flows/analyze-document-content-flow";


// Make keyPointsSummary optional as it might not always be present if the flow changes or fails partially
interface GenerateMedicalTopicSummaryOutput extends AIOutputType {
  keyPointsSummary?: string[];
  // Etiology, Symptoms, Diagnosis, Treatment, Prognosis are already part of AIOutputType
}


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

interface FileAnalysisResponse extends AIDocumentAnalysisOutputType {
  // Inherits structure from AnalyzeDocumentContentOutput
}


export function MedicalKnowledgeSearch() {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("all");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [aiComprehensiveSummary, setAiComprehensiveSummary] = useState<GenerateMedicalTopicSummaryOutput | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [aiFileAnalysisResult, setAiFileAnalysisResult] = useState<FileAnalysisResponse | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSummaries, setExpandedSummaries] = useState<Record<number, boolean>>({});
  const [showDetailedTopicSummary, setShowDetailedTopicSummary] = useState(false);
  const [showDetailedFileSummary, setShowDetailedFileSummary] = useState(false);


  const toggleSummaryExpansion = (index: number) => {
    setExpandedSummaries(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Basic validation (optional, can be expanded)
      // Supported types are handled by the API route now, but basic checks can remain
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError("File size exceeds 10MB. Please choose a smaller file.");
        setSelectedFile(null);
        event.target.value = ""; // Reset file input
        return;
      }
      setSelectedFile(file);
      setQuery(""); // Clear search query when file is selected
      setError(null); // Clear previous errors
    } else {
      setSelectedFile(null);
    }
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);
    setError(null);
    setSearchResults([]);
    setAiComprehensiveSummary(null);
    setAiFileAnalysisResult(null);
    setExpandedSummaries({});
    setShowDetailedTopicSummary(false);
    setShowDetailedFileSummary(false);

    if (selectedFile) {
      // Handle file upload and analysis
      const formData = new FormData();
      formData.append("file", selectedFile);
      try {
        const response = await fetch("/api/analyze-document", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `File analysis failed: ${response.statusText}`);
        }
        const data: FileAnalysisResponse = await response.json();
        setAiFileAnalysisResult(data);
        if(!data.overallSummary && !(data.keyPointsSummary && data.keyPointsSummary.length > 0)) {
            setError("AI could not extract a meaningful summary from the uploaded document.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to analyze uploaded file.");
        console.error("File analysis error:", err);
      }
    } else if (query.trim()) {
      // Handle text-based search
      try {
        const shouldRequestAISummary = true; // Always request AI summary for text search now
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
        setSearchResults(data.results);

        if (!data.aiComprehensiveSummary && data.results.length === 0) {
          setError("No results found for your query. Try a broader term or different source.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch search results.");
        console.error("Search error:", err);
      }
    } else {
       setError("Please enter a search term or select a file to analyze.");
    }
    setIsLoading(false);
  };

  const renderFormattedText = (text: string | undefined) => {
    if (!text) return <p className="text-sm text-muted-foreground">Not available for this section.</p>;
    // Basic formatting: split by newline, handle bold markdown
    return text.split('\n').filter(line => line.trim() !== '').map((paragraph, pIdx) => (
      <p key={pIdx} className="text-sm text-muted-foreground mb-2 last:mb-0" dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
    ));
  };


  const renderAISummarySections = (summaryData: GenerateMedicalTopicSummaryOutput | FileAnalysisResponse | null, isFileSummary: boolean) => {
    if (!summaryData) return null;

    const title = isFileSummary ? "AI Analysis of Uploaded Document" : `AI Comprehensive Summary: ${summaryData.topic || "Topic"}`;
    const description = isFileSummary ? `Insights extracted from the uploaded document: ${selectedFile?.name}` : `Key points and detailed overview covering etiology, symptoms, diagnosis, treatment, and prognosis for "${query}".`;
    const showDetailedState = isFileSummary ? showDetailedFileSummary : showDetailedTopicSummary;
    const setShowDetailedState = isFileSummary ? setShowDetailedFileSummary : setShowDetailedTopicSummary;

    const hasDetailedInfo = summaryData.etiology || summaryData.symptoms || summaryData.diagnosis || summaryData.treatment || summaryData.prognosis || summaryData.overallSummary;

    return (
      <Card className="border-primary shadow-md">
        <CardHeader className="bg-primary/10">
          <CardTitle className="text-xl text-primary flex items-center">
            {isFileSummary ? <FileText className="mr-2 h-6 w-6" /> : <Brain className="mr-2 h-6 w-6" />}
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          {summaryData.keyPointsSummary && summaryData.keyPointsSummary.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-md text-foreground">Key Points:</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 pl-2">
                {summaryData.keyPointsSummary.map((point, index) => (
                  <li key={`kp-${isFileSummary ? 'file' : 'topic'}-${index}`}>{point}</li>
                ))}
              </ul>
            </div>
          )}

          {hasDetailedInfo && (
             <Button onClick={() => setShowDetailedState(!showDetailedState)} variant="outline" size="sm" className="mb-3">
               {showDetailedState ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
               {showDetailedState ? "Hide Detailed Analysis" : "Show Detailed Analysis"}
             </Button>
          )}


          {showDetailedState && hasDetailedInfo && (
            <div className="space-y-4 animate-accordion-down pl-2 border-l-2 border-primary/20 ml-1">
              {summaryData.overallSummary && (
                <div>
                  <h4 className="font-semibold text-md text-foreground">Overall Summary:</h4>
                  {renderFormattedText(summaryData.overallSummary)}
                </div>
              )}
              {summaryData.etiology && (
                <div>
                  <h4 className="font-semibold text-md text-foreground">Etiology (Causes &amp; Risk Factors):</h4>
                  {renderFormattedText(summaryData.etiology)}
                </div>
              )}
              {summaryData.symptoms && (
                <div>
                  <h4 className="font-semibold text-md text-foreground">Symptoms:</h4>
                  {renderFormattedText(summaryData.symptoms)}
                </div>
              )}
              {summaryData.diagnosis && (
                <div>
                  <h4 className="font-semibold text-md text-foreground">Diagnosis:</h4>
                  {renderFormattedText(summaryData.diagnosis)}
                </div>
              )}
              {summaryData.treatment && (
                <div>
                  <h4 className="font-semibold text-md text-foreground">Treatment:</h4>
                  {renderFormattedText(summaryData.treatment)}
                </div>
              )}
              {summaryData.prognosis && (
                <div>
                  <h4 className="font-semibold text-md text-foreground">Prognosis:</h4>
                  {renderFormattedText(summaryData.prognosis)}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }; // End of renderAISummarySections

  // Component's return statement starts here
  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary">Medical Knowledge Search &amp; Analysis</CardTitle>
          <CardDescription>
            Search ophthalmology topics across various sources, or upload a document (PDF, DOCX, TXT, CSV, Image) for AI-powered analysis and summarization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 items-end">
              <Label htmlFor="search-query" className="sr-only">Search query</Label>
              <Input
                type="text"
                id="search-query"
                placeholder="e.g., Macular Degeneration, OCT..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); if (selectedFile) { setSelectedFile(null); const fileInput = document.getElementById("file-upload") as HTMLInputElement; if(fileInput) fileInput.value = ""; } }}
                className="flex-grow"
                aria-label="Search query"
                disabled={!!selectedFile}
              />
               <Label htmlFor="source-filter" className="sr-only">Source filter</Label>
              <Select value={source} onValueChange={setSource} disabled={!!selectedFile}>
                <SelectTrigger id="source-filter" className="w-full sm:w-[220px]" aria-label="Source filter">
                  <SelectValue placeholder="Select Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources &amp; AI Summary</SelectItem>
                  <SelectItem value="wikipedia">Wikipedia</SelectItem>
                  <SelectItem value="pubmed">PubMed</SelectItem>
                  <SelectItem value="medlineplus">MedlinePlus</SelectItem>
                  <SelectItem value="googlescholar">Google Scholar</SelectItem>
                  <SelectItem value="google">Google Search</SelectItem>
                  <SelectItem value="university">University Repositories</SelectItem>
                  <SelectItem value="aocet">AO CET Ophthalmology</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-center my-2 text-sm text-muted-foreground">OR</div>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 items-center">
               <Label htmlFor="file-upload" className="sr-only">Upload document</Label>
               <Input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                accept=".pdf,.docx,.txt,.csv,image/*" // Accept images too
                disabled={!!query.trim()}
              />
              <Button type="submit" disabled={isLoading || (!query.trim() && !selectedFile)} className="w-full sm:w-auto mt-2 sm:mt-0">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  selectedFile ? <FileUp className="mr-2 h-4 w-4" /> : <Search className="mr-2 h-4 w-4" />
                )}
                {selectedFile ? "Analyze File" : "Search"}
              </Button>
            </div>
             {selectedFile && <p className="text-xs text-muted-foreground text-center">Selected file: {selectedFile.name} ({ (selectedFile.size / 1024).toFixed(2) } KB). Clear search box to deselect file upload.</p>}
          </form>

          {error && !isLoading && (
            <Alert variant="destructive" className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && (
             <div className="flex justify-center items-center mt-8 py-10">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="ml-3 text-lg text-muted-foreground">
                  {selectedFile ? "Analyzing document..." : "Searching and analyzing information..."}
                </p>
            </div>
          )}

          {!isLoading && (aiComprehensiveSummary || searchResults.length > 0 || aiFileAnalysisResult) && (
            <div className="mt-8 space-y-6">
              {renderAISummarySections(aiFileAnalysisResult, true)}
              {renderAISummarySections(aiComprehensiveSummary, false)}

              {searchResults.length > 0 && (
                <>
                  <h3 className="text-xl font-semibold text-foreground mt-8 border-t pt-6">
                    Information from Sources:
                  </h3>
                  {searchResults.map((item, index) => (
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
            <AlertTitle>Information Source &amp; Disclaimer</AlertTitle>
            <AlertDescription>
              This tool utilizes public APIs and AI for informational purposes.
              AI-generated summaries are intended to provide structured overviews and analyze provided documents.
              Always verify information with primary sources and consult medical professionals for advice. File uploads are processed for analysis and not stored long-term.
            </AlertDescription>
          </Alert>

        </CardContent>
      </Card>
    </div>
  ); // End of return statement
} // End of MedicalKnowledgeSearch component function
