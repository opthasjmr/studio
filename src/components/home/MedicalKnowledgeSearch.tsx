
"use client";

import { useState } from "react";
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
import { Loader2, Search, AlertCircle, BookOpen, Link as LinkIcon } from "lucide-react";

interface SearchResultItem {
  source: string;
  title: string;
  summary: string;
  url: string;
}

interface SearchResponse {
  results: SearchResultItem[];
}

export function MedicalKnowledgeSearch() {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("all");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) {
      setError("Please enter a search term.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch(
        `/api/medical-search?query=${encodeURIComponent(query)}&source=${source}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data: SearchResponse = await response.json();
      setResults(data.results);
      if (data.results.length === 0) {
        setError("No results found for your query. Try a broader term or different source.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch search results.");
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary">Medical Knowledge Search</CardTitle>
          <CardDescription>
            Search ophthalmology topics, diseases, and research from various authoritative sources.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="text"
                id="search-query"
                placeholder="e.g., Diabetic Retinopathy, OCT advancements..."
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
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="wikipedia">Wikipedia</SelectItem>
                  <SelectItem value="pubmed">PubMed</SelectItem>
                  <SelectItem value="medlineplus">MedlinePlus</SelectItem>
                  {/* Add other sources like university repositories when implemented */}
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

          {results.length > 0 && !isLoading && (
            <div className="mt-8 space-y-6">
              <h3 className="text-xl font-semibold text-foreground">Search Results:</h3>
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
                    <p className="text-sm text-muted-foreground line-clamp-3">{item.summary || "No summary available."}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {isLoading && (
             <div className="flex justify-center items-center mt-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Fetching information...</p>
            </div>
          )}

          <Alert className="mt-8">
            <BookOpen className="h-4 w-4" />
            <AlertTitle>Information Source</AlertTitle>
            <AlertDescription>
              This search utilizes public APIs (Wikipedia, PubMed, etc.) and AI summarization for informational purposes. 
              Always verify information with primary sources and consult medical professionals for advice. 
              Advanced filters (Retina, Glaucoma) and integrations (Elsevier, ClinicalTrials.gov) are planned.
            </AlertDescription>
          </Alert>

        </CardContent>
      </Card>
    </div>
  );
}
