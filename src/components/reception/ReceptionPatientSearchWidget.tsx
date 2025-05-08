
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserCircle, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
// import { searchMedicalKnowledgeBase } from "@/ai/flows/search-knowledge-base"; // Assuming this flow exists

export function ReceptionPatientSearchWidget() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any | null>(null); // Type according to your AI flow's output
  const [searchError, setSearchError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Search Term Required",
        description: "Please enter a term to search for.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setSearchError(null);
    setSearchResults(null); // Clear previous results

    try {
      // Simulate patient search or knowledge base search
      // For actual patient search, you'd query Firestore here.
      // For AI knowledge base search, you'd call the Genkit flow.
      
      // Mocking a delay and result for demonstration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // This is where you would call your actual search flow:
      // const result = await searchMedicalKnowledgeBase({ query: searchTerm });
      // setSearchResults(result);

      // Mocked result:
      if (searchTerm.toLowerCase().includes("fever")) {
        setSearchResults({
          summary: "Fever is a common symptom indicating an elevated body temperature, often a sign of infection or illness.",
          possibleCauses: ["Viral infection (e.g., flu, common cold)", "Bacterial infection (e.g., strep throat, UTI)", "Inflammatory conditions"],
          recommendations: ["Monitor temperature", "Ensure hydration", "Rest", "Consider over-the-counter fever reducers (e.g., acetaminophen, ibuprofen) as appropriate", "Seek medical attention if fever is high, persistent, or accompanied by severe symptoms."],
          source: "Simulated Medical Knowledge Base"
        });
      } else if (searchTerm.toLowerCase().includes("doe")) {
         setSearchResults({
          patientName: "John Doe",
          patientId: "P00123",
          lastVisit: "2024-07-15",
          upcomingAppointment: "2024-08-10 with Dr. Smith",
          notes: "Follow-up for routine check."
        });
      } else {
        setSearchError("No relevant information found for your query.");
      }
      
      setIsDialogOpen(true);

    } catch (error: any) {
      console.error("Search error:", error);
      setSearchError("An error occurred while searching. Please try again.");
      toast({
        title: "Search Failed",
        description: error.message || "Could not retrieve search results.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="shadow-md hover:shadow-lg transition-shadow col-span-1 md:col-span-2 lg:col-span-1"> {/* Adjust span as needed */}
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl font-semibold">Patient & Knowledge Search</CardTitle>
          </div>
          <CardDescription>
            Quickly find patients or medical information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex space-x-2">
            <Input
              type="search"
              placeholder="Search by name, ID, symptoms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Access patient records or query the AI-powered medical knowledge base.
          </p>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Search className="mr-2 h-5 w-5 text-primary" /> Search Results for &quot;{searchTerm}&quot;
            </DialogTitle>
            <DialogDescription>
              AI-assisted information retrieval. This is for informational purposes and not a substitute for professional medical advice.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 max-h-[60vh] overflow-y-auto">
            {isLoading && <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <span className="ml-2">Searching...</span></div>}
            {searchError && !isLoading && (
              <div className="text-center text-destructive p-4 border border-destructive/50 rounded-md">
                <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                <p className="font-semibold">Search Error</p>
                <p>{searchError}</p>
              </div>
            )}
            {searchResults && !searchError && !isLoading && (
              <div className="space-y-4">
                {searchResults.patientName ? ( // Patient search result structure
                  <>
                    <h3 className="text-lg font-semibold text-primary">{searchResults.patientName} (ID: {searchResults.patientId})</h3>
                    <p><strong>Last Visit:</strong> {searchResults.lastVisit || "N/A"}</p>
                    <p><strong>Upcoming Appointment:</strong> {searchResults.upcomingAppointment || "None"}</p>
                    <p><strong>Notes:</strong> {searchResults.notes || "No specific notes."}</p>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/patients/${searchResults.patientId}`}>View Full Record</Link>
                    </Button>
                  </>
                ) : searchResults.summary ? ( // Knowledge base result structure
                  <>
                    <Card className="bg-secondary/30">
                      <CardHeader><CardTitle className="text-md text-primary">Summary</CardTitle></CardHeader>
                      <CardContent><p>{searchResults.summary}</p></CardContent>
                    </Card>
                    {searchResults.possibleCauses && (
                      <Card>
                        <CardHeader><CardTitle className="text-md text-primary">Possible Causes / Considerations</CardTitle></CardHeader>
                        <CardContent>
                          <ul className="list-disc list-inside space-y-1">
                            {searchResults.possibleCauses.map((cause: string, index: number) => <li key={index}>{cause}</li>)}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                    {searchResults.recommendations && (
                       <Card>
                        <CardHeader><CardTitle className="text-md text-primary">General Recommendations / Next Steps</CardTitle></CardHeader>
                        <CardContent>
                          <ul className="list-disc list-inside space-y-1">
                            {searchResults.recommendations.map((rec: string, index: number) => <li key={index}>{rec}</li>)}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                     <p className="text-xs text-muted-foreground">Source: {searchResults.source}</p>
                  </>
                ) : (
                  <p>No structured results to display. Raw output: <pre className="whitespace-pre-wrap bg-muted p-2 rounded-md text-xs">{JSON.stringify(searchResults, null, 2)}</pre></p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
