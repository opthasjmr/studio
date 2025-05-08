"use client";

import { useState, type ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { analyzeEyeImage, type AnalyzeEyeImageOutput, type AnalyzeEyeImageInput } from "@/ai/flows/analyze-eye-image";
import Image from "next/image";
import { UploadCloud, FileText, Brain, Lightbulb, Loader2, AlertCircle, CheckCircle, Activity, ListChecks, ShieldAlert, Eye } from "lucide-react";
import { Badge } from '@/components/ui/badge';

export function AnalyzeScanForm() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeEyeImageOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        setError("File size exceeds 5MB. Please choose a smaller file.");
        setFile(null);
        setPreviewUrl(null);
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(selectedFile.type)) {
        setError("Invalid file type. Please upload an image (JPEG, PNG, GIF, WebP).");
        setFile(null);
        setPreviewUrl(null);
        return;
      }
      setError(null);
      setFile(selectedFile);
      setAnalysisResult(null); 
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select an eye scan image to analyze.");
      return;
    }
    setError(null);
    setIsLoading(true);
    setAnalysisResult(null);
    setProgress(0);

    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += 10;
      if (currentProgress <= 70) {
        setProgress(currentProgress);
      } else {
        clearInterval(progressInterval);
      }
    }, 100);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async (event) => {
        const eyeScanDataUri = event.target?.result as string;
        if (!eyeScanDataUri) {
          throw new Error("Failed to read file data.");
        }
        
        const input: AnalyzeEyeImageInput = { eyeScanDataUri };
        const result = await analyzeEyeImage(input);
        clearInterval(progressInterval);
        setProgress(100);
        setAnalysisResult(result);
      };
      reader.onerror = (err) => {
        console.error("File reading error:", err);
        setError("Failed to read file. Please try again.");
        setIsLoading(false);
        setProgress(0);
        clearInterval(progressInterval);
      };
    } catch (e: any) {
      console.error("Analysis error:", e);
      setError(e.message || "An unexpected error occurred during analysis.");
      setProgress(0);
      clearInterval(progressInterval);
    } finally {
       // setIsLoading(false) will be handled by reader.onload or reader.onerror to ensure it's called after async op
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 md:px-6 max-w-4xl"> {/* Increased max-width for better layout */}
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center space-x-3 mb-2">
            <Brain className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold">AI Eye Scan Analysis</CardTitle>
              <CardDescription className="text-md">
                Upload an OCT or fundus image. Our AI will help detect signs of conditions like Diabetic Retinopathy, Glaucoma, AMD, and Cataracts.
              </CardDescription>
            </div>
          </div>
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
            <Label htmlFor="eye-scan" className="text-lg font-semibold">Upload Eye Scan Image</Label>
            <div className="flex items-center space-x-2">
              <Input id="eye-scan" type="file" accept="image/*" onChange={handleFileChange} className="flex-grow file:text-primary file:font-semibold hover:file:bg-primary/10"/>
              <Button onClick={() => { handleSubmit().finally(() => setIsLoading(false)); }} disabled={!file || isLoading} className="min-w-[120px]">
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <UploadCloud className="mr-2 h-5 w-5" />
                )}
                Analyze
              </Button>
            </div>
             <p className="text-xs text-muted-foreground">Supported formats: JPG, PNG, GIF, WebP. Max file size: 5MB.</p>
          </div>

          {previewUrl && (
            <div className="mt-6 border rounded-lg p-4 bg-secondary/30">
              <h3 className="text-lg font-semibold mb-2 text-primary">Image Preview</h3>
              <Image
                src={previewUrl}
                alt="Eye scan preview"
                data-ai-hint="eye scan"
                width={0}
                height={0}
                sizes="100vw"
                style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'contain' }}
                className="rounded-md shadow-md"
              />
            </div>
          )}

          {isLoading && (
            <div className="space-y-2 pt-4">
              <Label className="text-primary font-semibold">Analysis in progress...</Label>
              <Progress value={progress} className="w-full h-3" />
              <p className="text-sm text-muted-foreground text-center">{progress}% completed</p>
            </div>
          )}

          {analysisResult && !isLoading && (
            <div className="mt-8 space-y-6">
              <Alert variant="default" className="bg-green-50 border-green-300">
                 <CheckCircle className="h-5 w-5 text-green-600" />
                 <AlertTitle className="text-green-700 font-semibold">Analysis Complete</AlertTitle>
                 <AlertDescription className="text-green-600">
                   The AI analysis has finished. Review the detailed findings below.
                 </AlertDescription>
              </Alert>

              <Card className="bg-background shadow-md">
                <CardHeader className="flex flex-row items-center space-x-3 bg-secondary/50 rounded-t-lg py-3 px-4">
                  <Eye className="h-6 w-6 text-primary" />
                  <CardTitle className="text-xl text-primary">Overall Assessment</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 px-4 pb-4">
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">{analysisResult.overallAssessment}</p>
                </CardContent>
              </Card>
              
              {analysisResult.detectedAnomalies && analysisResult.detectedAnomalies.length > 0 && (
                <Card className="bg-background shadow-md">
                  <CardHeader className="flex flex-row items-center space-x-3 bg-secondary/50 rounded-t-lg py-3 px-4">
                    <Activity className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl text-primary">Detected Anomalies / Observations</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 px-4 pb-4 space-y-3">
                    {analysisResult.detectedAnomalies.map((anomaly, index) => (
                      <div key={index} className="p-3 border rounded-md bg-secondary/20">
                        <p className="font-semibold text-foreground">{anomaly.finding}</p>
                        {anomaly.location && <p className="text-sm text-muted-foreground">Location: {anomaly.location}</p>}
                        {anomaly.severity && <p className="text-sm text-muted-foreground">Severity: <Badge variant={anomaly.severity === "normal" ? "default" : anomaly.severity === "mild" ? "secondary" : "destructive" }>{anomaly.severity}</Badge></p>}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {analysisResult.potentialConditions && analysisResult.potentialConditions.length > 0 && (
                <Card className="bg-background shadow-md">
                  <CardHeader className="flex flex-row items-center space-x-3 bg-secondary/50 rounded-t-lg py-3 px-4">
                    <Lightbulb className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl text-primary">Potential Conditions</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 px-4 pb-4 space-y-4">
                    {analysisResult.potentialConditions.map((condition, index) => (
                      <div key={index} className="p-3 border rounded-md bg-secondary/20">
                        <div className="flex justify-between items-center mb-1">
                           <p className="font-semibold text-foreground">{condition.conditionName}</p>
                           <Badge variant="outline">Confidence: {(condition.confidenceScore * 100).toFixed(0)}%</Badge>
                        </div>
                        {condition.supportingSigns && condition.supportingSigns.length > 0 && (
                          <>
                            <p className="text-xs text-muted-foreground mt-1 mb-0.5">Supporting Signs:</p>
                            <ul className="list-disc list-inside text-sm text-foreground space-y-0.5">
                              {condition.supportingSigns.map((sign, signIdx) => <li key={signIdx}>{sign}</li>)}
                            </ul>
                          </>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
              
              {analysisResult.riskFactorsHighlighted && analysisResult.riskFactorsHighlighted.length > 0 && (
                <Card className="bg-background shadow-md">
                  <CardHeader className="flex flex-row items-center space-x-3 bg-secondary/50 rounded-t-lg py-3 px-4">
                    <ShieldAlert className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl text-primary">Highlighted Risk Factors</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 px-4 pb-4">
                    <ul className="list-disc list-inside space-y-1 text-foreground">
                      {analysisResult.riskFactorsHighlighted.map((factor, index) => (
                        <li key={index} className="leading-relaxed">{factor}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {analysisResult.recommendedNextSteps && analysisResult.recommendedNextSteps.length > 0 && (
                <Card className="bg-background shadow-md">
                  <CardHeader className="flex flex-row items-center space-x-3 bg-secondary/50 rounded-t-lg py-3 px-4">
                    <ListChecks className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl text-primary">Recommended Next Steps</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 px-4 pb-4">
                     <ul className="list-disc list-inside space-y-1 text-foreground">
                      {analysisResult.recommendedNextSteps.map((step, index) => (
                        <li key={index} className="leading-relaxed">{step}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Disclaimer</AlertTitle>
                <AlertDescription>
                  This AI analysis is a decision support tool and not a substitute for professional medical advice. Always consult with a qualified ophthalmologist for diagnosis and treatment.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-center">
            <p className="text-xs text-muted-foreground mx-auto">
              Patient data is processed securely. Results are intended to assist medical professionals in their decision-making process.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
