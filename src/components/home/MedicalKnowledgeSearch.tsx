
"use client";

import { useState, type ChangeEvent, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Search, AlertCircle, BookOpen, Link as LinkIcon, MessageSquareText, FileText, Brain, Eye, EyeOff, FileUp, Activity, ListChecks, ShieldAlert } from "lucide-react";
import type { GenerateMedicalTopicSummaryOutput as AIOutputType } from "@/ai/flows/generate-medical-topic-summary-flow";
import type { AnalyzeDocumentContentOutput as AIDocumentAnalysisOutputType } from "@/ai/flows/analyze-document-content-flow";
import type { AnalyzeEyeImageOutput as AIEyeImageAnalysisOutputType } from "@/ai/flows/analyze-eye-image";
import { Badge } from '@/components/ui/badge';


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

// Type for the combined diagnosis result state
type DiagnosisResultType = (AIDocumentAnalysisOutputType & { result_type: 'document_analysis' }) | (AIEyeImageAnalysisOutputType & { result_type: 'image_analysis' });

export function MedicalKnowledgeSearch() {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("all");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for file input

  // States for different result types
  const [aiComprehensiveSummary, setAiComprehensiveSummary] = useState<GenerateMedicalTopicSummaryOutput | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [aiDiagnosisResult, setAiDiagnosisResult] = useState<DiagnosisResultType | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSummaries, setExpandedSummaries] = useState<Record<number, boolean>>({});
  const [showDetailedTopicSummary, setShowDetailedTopicSummary] = useState(false);
  const [showDetailedDiagnosis, setShowDetailedDiagnosis] = useState(false);


  const toggleSummaryExpansion = (index: number) => {
    setExpandedSummaries(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError("File size exceeds 10MB. Please choose a smaller file.");
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Reset file input
        }
        return;
      }
       // Basic check for generally supported types
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/csv', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.includes(file.type) && !['txt', 'csv'].includes(fileExtension || '')) {
           setError(`Unsupported file type: ${file.type || fileExtension}. Supported: PDF, DOCX, TXT, CSV, Images.`);
           setSelectedFile(null);
           if (fileInputRef.current) {
               fileInputRef.current.value = ""; // Reset file input
           }
           return;
      }
      setSelectedFile(file);
      setQuery(""); // Clear search query when file is selected
      setError(null);
    } else {
      setSelectedFile(null);
    }
  };

  const clearSelection = () => {
      setSelectedFile(null);
      setQuery("");
      if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Reset file input
      }
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Prioritize file upload if both are somehow selected/entered
     const useFile = !!selectedFile;
     const useQuery = !!query.trim() && !useFile;

    if (!useFile && !useQuery) {
        setError("Please enter a search term or select a file to analyze.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setSearchResults([]);
    setAiComprehensiveSummary(null);
    setAiDiagnosisResult(null);
    setExpandedSummaries({});
    setShowDetailedTopicSummary(false);
    setShowDetailedDiagnosis(false);

    try {
        if (useFile && selectedFile) {
            // Handle file upload for DIAGNOSIS/ANALYSIS
            const formData = new FormData();
            formData.append("file", selectedFile);

            const response = await fetch("/api/diagnosis", { // Use /api/diagnosis for file analysis
                method: "POST",
                body: formData,
            });

             let errorText = null;
             let responseData;
             let tempResponseBodyClone = response.clone(); // Clone response

            try {
                // Attempt to parse JSON first
                responseData = await response.json();
                if (!response.ok) {
                    errorText = responseData.error || `File analysis failed: ${response.status} ${response.statusText}`;
                }
            } catch (jsonError) {
                 // If JSON parsing fails, use the cloned response to read as text
                try {
                    const text = await tempResponseBodyClone.text(); // Read text from clone
                    if (!response.ok) { // Still check original response status
                        errorText = text || `File analysis failed: ${response.status} ${response.statusText}`;
                    } else {
                        // If response was OK but not JSON, it's an unexpected format
                        errorText = "Received unexpected response format from server.";
                        console.error("Unexpected non-JSON response:", text); // Log the unexpected text
                    }
                } catch (textError) {
                    console.error("Failed to read error response body:", textError);
                    errorText = `File analysis failed: ${response.status} ${response.statusText} (Could not read response)`;
                }
            }


            if (errorText) {
                throw new Error(errorText);
            }


            // If response.ok is true, and JSON was parsed
            const data: { diagnosis_result: any, result_type: 'document_analysis' | 'image_analysis' } = responseData;
            setAiDiagnosisResult({ ...data.diagnosis_result, result_type: data.result_type });

            // Check if the result is minimal or empty
            if (data.result_type === 'document_analysis' && !data.diagnosis_result.overallSummary && !(data.diagnosis_result.keyPointsSummary && data.diagnosis_result.keyPointsSummary.length > 0)) {
                setError("AI could not extract a meaningful summary from the uploaded document.");
            } else if (data.result_type === 'image_analysis' && !data.diagnosis_result.overallAssessment && !(data.diagnosis_result.detectedAnomalies && data.diagnosis_result.detectedAnomalies.length > 0)) {
                setError("AI could not provide a meaningful analysis for the uploaded image.");
            }

        } else if (useQuery) {
            // Handle text-based SEARCH
            const shouldRequestAISummary = true;
            const response = await fetch(
                `/api/medical-search?query=${encodeURIComponent(query)}&source=${source}&summarize=${shouldRequestAISummary}`
            );

             let errorText = null;
             let responseData;
             let tempResponseBodyClone = response.clone(); // Clone response

             try {
                // Attempt to parse JSON first
                responseData = await response.json();
                 if (!response.ok) {
                     errorText = responseData.error || `Search failed: ${response.status} ${response.statusText}`;
                }
            } catch (jsonError) {
                // If JSON parsing fails, read as text from clone
                try {
                    const text = await tempResponseBodyClone.text(); // Read text from clone
                     if (!response.ok) { // Still check original response status
                        errorText = text || `Search failed: ${response.status} ${response.statusText}`;
                    } else {
                        // If response was OK but not JSON, it's an unexpected format
                        errorText = "Received unexpected response format from server.";
                        console.error("Unexpected non-JSON response:", text); // Log the unexpected text
                    }
                } catch (textError) {
                    console.error("Failed to read response body:", textError);
                    errorText = `Search failed: ${response.status} ${response.statusText} (Could not read response)`;
                }
            }


            if (errorText) {
                throw new Error(errorText);
            }


            // If response.ok is true, and JSON was parsed
            const data: MedicalSearchResponse = responseData;

            if (data.aiComprehensiveSummary) {
                setAiComprehensiveSummary(data.aiComprehensiveSummary);
            }
            setSearchResults(data.results);

            if (!data.aiComprehensiveSummary && data.results.length === 0) {
                setError("No results found for your query. Try a broader term or different source.");
            }
        }
    } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
        console.error("Form submission error:", err);
    } finally {
        setIsLoading(false);
    }
}; // End of handleSubmit

  const renderFormattedText = (text: string | undefined) => {
    if (!text) return <p className="text-sm text-muted-foreground">Not available for this section.</p>;
    // Basic formatting: split by newline, handle bold markdown
    return text.split('\n').filter(line => line.trim() !== '').map((paragraph, pIdx) => (
      <p key={pIdx} className="text-sm text-muted-foreground mb-2 last:mb-0" dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
    ));
  };


  const renderTopicSummary = (summaryData: GenerateMedicalTopicSummaryOutput | null) => {
    if (!summaryData) return null;

    const title = `AI Comprehensive Summary: ${summaryData.topic || query || "Topic"}`;
    const description = `Key points and detailed overview covering etiology, symptoms, diagnosis, treatment, and prognosis for "${summaryData.topic || query}".`;
    const hasDetailedInfo = summaryData.etiology || summaryData.symptoms || summaryData.diagnosis || summaryData.treatment || summaryData.prognosis || summaryData.overallSummary;

    return (
      <Card className="border-primary shadow-md">
        <CardHeader className="bg-primary/10">
          <CardTitle className="text-xl text-primary flex items-center">
            <Brain className="mr-2 h-6 w-6" />
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
                  <li key={`kp-topic-${index}`}>{point}</li>
                ))}
              </ul>
            </div>
          )}

          {hasDetailedInfo && (
             <Button onClick={() => setShowDetailedTopicSummary(!showDetailedTopicSummary)} variant="outline" size="sm" className="mb-3">
               {showDetailedTopicSummary ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
               {showDetailedTopicSummary ? "Hide Detailed Summary" : "Show Detailed Summary"}
             </Button>
          )}

          {showDetailedTopicSummary && hasDetailedInfo && (
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
  };


 const renderDiagnosisResult = (diagnosisData: DiagnosisResultType | null) => {
    if (!diagnosisData) return null;

    const isImageAnalysis = diagnosisData.result_type === 'image_analysis';
    const title = isImageAnalysis ? "AI Image Analysis" : "AI Document Analysis";
    const description = `AI-powered insights extracted from the uploaded file: ${selectedFile?.name || 'Uploaded File'}.`;

    const documentData = !isImageAnalysis ? diagnosisData as AIDocumentAnalysisOutputType : null;
    const imageData = isImageAnalysis ? diagnosisData as AIEyeImageAnalysisOutputType : null;

    const hasDetailedInfo = isImageAnalysis
      ? (imageData?.detectedAnomalies && imageData.detectedAnomalies.length > 0) || (imageData?.potentialConditions && imageData.potentialConditions.length > 0) || (imageData?.riskFactorsHighlighted && imageData.riskFactorsHighlighted.length > 0) || (imageData?.recommendedNextSteps && imageData.recommendedNextSteps.length > 0)
      : (documentData?.etiology || documentData?.symptoms || documentData?.diagnosis || documentData?.treatment || documentData?.prognosis || documentData?.overallSummary);

    return (
      <Card className="border-primary shadow-md">
        <CardHeader className="bg-primary/10">
          <CardTitle className="text-xl text-primary flex items-center">
            {isImageAnalysis ? <Eye className="mr-2 h-6 w-6" /> : <FileText className="mr-2 h-6 w-6" />}
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          {/* Display top-level summary based on type */}
          {isImageAnalysis && imageData?.overallAssessment && (
             <div className="mb-4">
                <h4 className="font-semibold text-md text-foreground">Overall Assessment:</h4>
                {renderFormattedText(imageData.overallAssessment)}
              </div>
          )}
          {!isImageAnalysis && documentData?.keyPointsSummary && documentData.keyPointsSummary.length > 0 && (
             <div className="mb-4">
                <h4 className="font-semibold text-md text-foreground">Key Points:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 pl-2">
                    {documentData.keyPointsSummary.map((point, index) => (
                    <li key={`kp-diag-${index}`}>{point}</li>
                    ))}
                </ul>
             </div>
          )}
          {!isImageAnalysis && documentData?.overallSummary && !documentData.keyPointsSummary && ( // Show overall if no keypoints
               <div className="mb-4">
                    <h4 className="font-semibold text-md text-foreground">Overall Summary:</h4>
                    {renderFormattedText(documentData.overallSummary)}
               </div>
           )}

          {hasDetailedInfo && (
            <Button onClick={() => setShowDetailedDiagnosis(!showDetailedDiagnosis)} variant="outline" size="sm" className="mb-3">
               {showDetailedDiagnosis ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
               {showDetailedDiagnosis ? "Hide Detailed Analysis" : "Show Detailed Analysis"}
             </Button>
          )}

          {showDetailedDiagnosis && hasDetailedInfo && (
            <div className="space-y-4 animate-accordion-down pl-2 border-l-2 border-primary/20 ml-1">
                {/* Document Specific Sections */}
                {!isImageAnalysis && documentData?.overallSummary && documentData.keyPointsSummary && ( // Show overall only if keypoints also exist here
                    <div><h4 className="font-semibold text-md text-foreground">Overall Summary:</h4>{renderFormattedText(documentData.overallSummary)}</div>
                )}
                {!isImageAnalysis && documentData?.topic && <div><h4 className="font-semibold text-md text-foreground">Identified Topic:</h4>{renderFormattedText(documentData.topic)}</div>}
                {!isImageAnalysis && documentData?.etiology && <div><h4 className="font-semibold text-md text-foreground">Etiology:</h4>{renderFormattedText(documentData.etiology)}</div>}
                {!isImageAnalysis && documentData?.symptoms && <div><h4 className="font-semibold text-md text-foreground">Symptoms:</h4>{renderFormattedText(documentData.symptoms)}</div>}
                {!isImageAnalysis && documentData?.diagnosis && <div><h4 className="font-semibold text-md text-foreground">Diagnosis:</h4>{renderFormattedText(documentData.diagnosis)}</div>}
                {!isImageAnalysis && documentData?.treatment && <div><h4 className="font-semibold text-md text-foreground">Treatment:</h4>{renderFormattedText(documentData.treatment)}</div>}
                {!isImageAnalysis && documentData?.prognosis && <div><h4 className="font-semibold text-md text-foreground">Prognosis:</h4>{renderFormattedText(documentData.prognosis)}</div>}

                 {/* Image Specific Sections */}
                {isImageAnalysis && imageData?.detectedAnomalies && imageData.detectedAnomalies.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-md text-foreground flex items-center"><Activity className="mr-2 h-5 w-5" />Detected Anomalies / Observations</h4>
                         <div className="space-y-2 mt-2">
                         {imageData.detectedAnomalies.map((anomaly, index) => (
                            <div key={`anomaly-${index}`} className="p-2 border rounded-md bg-secondary/30">
                                <p className="font-medium text-sm text-foreground">{anomaly.finding}</p>
                                {anomaly.location && <p className="text-xs text-muted-foreground">Location: {anomaly.location}</p>}
                                {anomaly.severity && <p className="text-xs text-muted-foreground">Severity: <Badge variant={anomaly.severity === "normal" ? "default" : anomaly.severity === "mild" ? "secondary" : "destructive"}>{anomaly.severity}</Badge></p>}
                            </div>
                            ))}
                        </div>
                    </div>
                )}
                 {isImageAnalysis && imageData?.potentialConditions && imageData.potentialConditions.length > 0 && (
                     <div>
                        <h4 className="font-semibold text-md text-foreground flex items-center"><Brain className="mr-2 h-5 w-5" />Potential Conditions</h4>
                         <div className="space-y-3 mt-2">
                            {imageData.potentialConditions.map((condition, index) => (
                            <div key={`cond-${index}`} className="p-2 border rounded-md bg-secondary/30">
                                <div className="flex justify-between items-center mb-1">
                                <p className="font-medium text-sm text-foreground">{condition.conditionName}</p>
                                <Badge variant="outline">Confidence: {(condition.confidenceScore * 100).toFixed(0)}%</Badge>
                                </div>
                                {condition.supportingSigns && condition.supportingSigns.length > 0 && (
                                <>
                                    <p className="text-xs text-muted-foreground mt-1 mb-0.5">Supporting Signs:</p>
                                    <ul className="list-disc list-inside text-xs text-foreground space-y-0.5">
                                    {condition.supportingSigns.map((sign, signIdx) => <li key={signIdx}>{sign}</li>)}
                                    </ul>
                                </>
                                )}
                            </div>
                            ))}
                        </div>
                    </div>
                 )}
                 {isImageAnalysis && imageData?.riskFactorsHighlighted && imageData.riskFactorsHighlighted.length > 0 && (
                     <div>
                        <h4 className="font-semibold text-md text-foreground flex items-center"><ShieldAlert className="mr-2 h-5 w-5" />Highlighted Risk Factors</h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 pl-2 mt-2">
                            {imageData.riskFactorsHighlighted.map((factor, index) => <li key={`risk-${index}`}>{factor}</li>)}
                        </ul>
                    </div>
                 )}
                 {isImageAnalysis && imageData?.recommendedNextSteps && imageData.recommendedNextSteps.length > 0 && (
                     <div>
                        <h4 className="font-semibold text-md text-foreground flex items-center"><ListChecks className="mr-2 h-5 w-5" />Recommended Next Steps</h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 pl-2 mt-2">
                            {imageData.recommendedNextSteps.map((step, index) => <li key={`step-${index}`}>{step}</li>)}
                        </ul>
                    </div>
                 )}

            </div>
          )}
        </CardContent>
      </Card>
    );
 }; // End of renderDiagnosisResult function


 return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary">Medical Knowledge Search &amp; Analysis</CardTitle>
          <CardDescription>
             Search ophthalmology topics or upload a document/image (PDF, DOCX, TXT, CSV, JPG, PNG) for AI-powered analysis, summarization, or diagnostic insights.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
             <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-2 items-end">
                {/* Search Input */}
                <div className="space-y-1">
                    <Label htmlFor="search-query" className="text-xs font-medium text-muted-foreground">Search Medical Topic</Label>
                    <Input
                        type="text"
                        id="search-query"
                        placeholder="e.g., Glaucoma treatment..."
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                        className="flex-grow h-10"
                        aria-label="Search query"
                        disabled={!!selectedFile}
                    />
                </div>

                {/* Source Filter */}
                <div className="space-y-1">
                    <Label htmlFor="source-filter" className="text-xs font-medium text-muted-foreground">Filter Sources</Label>
                    <Select value={source} onValueChange={setSource} disabled={!!selectedFile}>
                        <SelectTrigger id="source-filter" className="w-full sm:w-[220px] h-10" aria-label="Source filter">
                        <SelectValue placeholder="Select Source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Sources &amp; AI Summary</SelectItem>
                          <SelectItem value="wikipedia">Wikipedia</SelectItem>
                          <SelectItem value="pubmed">PubMed</SelectItem>
                          <SelectItem value="jmr">Journal of Medical Research (JMR)</SelectItem> {/* Added JMR */}
                          <SelectItem value="medlineplus">MedlinePlus</SelectItem>
                          <SelectItem value="googlescholar">Google Scholar</SelectItem>
                          <SelectItem value="google">Google Search</SelectItem>
                          <SelectItem value="university">University Repositories</SelectItem>
                          <SelectItem value="aocet">AO CET Ophthalmology</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                 {/* Hidden File Input */}
                 <Input
                    type="file"
                    id="file-upload"
                    ref={fileInputRef} // Attach ref
                    onChange={handleFileChange}
                    className="hidden" // Hide the default input
                    accept=".pdf,.docx,.txt,.csv,image/*"
                    disabled={!!query.trim()}
                  />

                 {/* File Upload Icon Button */}
                  <div className="space-y-1 flex flex-col items-start">
                     <Label htmlFor="file-upload" className="text-xs font-medium text-muted-foreground">&nbsp;</Label>
                     <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={!!query.trim()}
                        className="h-10 w-10"
                        aria-label="Upload file for analysis"
                        title="Upload file for analysis"
                     >
                        <FileUp className="h-5 w-5" />
                     </Button>
                 </div>


                 {/* Submit Button */}
                 <div className="space-y-1 flex flex-col items-start">
                     <Label htmlFor="submit-button" className="text-xs font-medium text-muted-foreground">&nbsp;</Label>
                     <Button id="submit-button" type="submit" disabled={isLoading || (!query.trim() && !selectedFile)} className="h-10">
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            selectedFile ? <FileUp className="mr-2 h-4 w-4" /> : <Search className="mr-2 h-4 w-4" />
                        )}
                        {selectedFile ? "Analyze" : "Search"}
                     </Button>
                 </div>
            </div>

            {selectedFile && (
             <div className="text-xs text-muted-foreground text-center pt-1 flex justify-center items-center gap-2">
                <span>Selected: {selectedFile.name} ({ (selectedFile.size / 1024).toFixed(2) } KB)</span>
                 <Button variant="link" size="sm" className="p-0 h-auto text-destructive" onClick={clearSelection}>Clear</Button>
             </div>
            )}

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
                  {selectedFile ? "Analyzing..." : "Searching..."}
                </p>
            </div>
          )}

          {!isLoading && (aiComprehensiveSummary || searchResults.length > 0 || aiDiagnosisResult) && (
            <div className="mt-8 space-y-6">
              {/* Render Diagnosis results first if a file was uploaded */}
              {renderDiagnosisResult(aiDiagnosisResult)}

              {/* Render Topic Summary if a text query was made */}
              {renderTopicSummary(aiComprehensiveSummary)}

              {/* Render Search Results if a text query was made */}
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
              This tool utilizes public APIs and AI for informational purposes and preliminary analysis.
              AI-generated summaries are intended to provide structured overviews. AI analysis of uploaded documents/images is for decision support only.
              Always verify information with primary sources and consult qualified medical professionals for diagnosis and treatment. File uploads are processed for analysis and not stored long-term.
            </AlertDescription>
          </Alert>

        </CardContent>
      </Card>
    </div>
  );
}
