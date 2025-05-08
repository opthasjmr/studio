"use client";

import { useState, type ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { analyzeEyeImage, type AnalyzeEyeImageOutput } from "@/ai/flows/analyze-eye-image";
import Image from "next/image";
import { UploadCloud, FileText, Brain, Lightbulb, Loader2, AlertCircle, CheckCircle } from "lucide-react";

export function AnalyzeScanForm() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeEyeImageOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0); // For potential future upload progress

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
      setAnalysisResult(null); // Clear previous results
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
    setProgress(0); // Reset progress

    // Simulate progress for demonstration
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += 10;
      if (currentProgress <= 70) { // Stop at 70% before AI call
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
        
        const result = await analyzeEyeImage({ eyeScanDataUri });
        clearInterval(progressInterval); // Clear simulation interval
        setProgress(100); // Set progress to 100%
        setAnalysisResult(result);

      };
      reader.onerror = (error) => {
        console.error("File reading error:", error);
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
      setIsLoading(false); // Ensure loading is false even if reader fails early
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 md:px-6 max-w-3xl">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center space-x-3 mb-2">
            <Brain className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold">AI Eye Scan Analysis</CardTitle>
              <CardDescription className="text-md">
                Upload an OCT or fundus image to get AI-powered insights and potential diagnoses.
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
              <Button onClick={handleSubmit} disabled={!file || isLoading} className="min-w-[120px]">
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
                width={500}
                height={300}
                className="rounded-md object-contain max-h-[300px] w-full shadow-md"
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
                   The AI analysis of the eye scan image has finished. See results below.
                 </AlertDescription>
              </Alert>

              <Card className="bg-background shadow-md">
                <CardHeader className="flex flex-row items-center space-x-3 bg-secondary/50 rounded-t-lg py-3 px-4">
                  <FileText className="h-6 w-6 text-primary" />
                  <CardTitle className="text-xl text-primary">Analysis Result</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 px-4 pb-4">
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">{analysisResult.analysisResult}</p>
                </CardContent>
              </Card>

              <Card className="bg-background shadow-md">
                <CardHeader className="flex flex-row items-center space-x-3 bg-secondary/50 rounded-t-lg py-3 px-4">
                  <Lightbulb className="h-6 w-6 text-primary" />
                  <CardTitle className="text-xl text-primary">Suggested Diagnoses</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 px-4 pb-4">
                  {analysisResult.suggestedDiagnoses.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-foreground">
                      {analysisResult.suggestedDiagnoses.map((diag, index) => (
                        <li key={index} className="leading-relaxed">{diag}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No specific diagnoses suggested based on this scan.</p>
                  )}
                </CardContent>
              </Card>
              
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Disclaimer</AlertTitle>
                <AlertDescription>
                  This AI analysis is for informational purposes only and not a substitute for professional medical advice. Always consult with a qualified ophthalmologist for diagnosis and treatment.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-center">
            <p className="text-xs text-muted-foreground mx-auto">
              Your data is processed securely. Results are intended to assist medical professionals.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
