
import { NextResponse, type NextRequest } from 'next/server';
import { summarizeText } from '@/ai/flows/summarize-text-flow'; // Import the new AI summarization flow

interface SearchResultItem {
  source: string;
  title: string;
  summary: string;
  url: string;
  originalSummary?: string; // To store the original summary if AI summarization is applied
}

// Basic cache to avoid hitting APIs too frequently during development/testing
const searchCache = new Map<string, { timestamp: number; data: SearchResultItem[] }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchWikipediaSummary(query: string): Promise<SearchResultItem | null> {
  try {
    const wikiResponse = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': 'VisionCarePlusApp/1.0 (contact@example.com)' } 
    });
    if (!wikiResponse.ok) {
      console.warn(`Wikipedia API error for query "${query}": ${wikiResponse.status}`);
      return null;
    }
    const wikiData = await wikiResponse.json();
    if (wikiData.type === 'disambiguation' || !wikiData.extract) {
        console.warn(`Wikipedia returned disambiguation or no extract for "${query}"`);
        return null;
    }
    return {
      source: "Wikipedia",
      title: wikiData.title || query,
      summary: wikiData.extract || "No summary available.",
      url: wikiData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,
    };
  } catch (error) {
    console.error(`Error fetching Wikipedia summary for "${query}":`, error);
    return null;
  }
}

async function fetchPubMedArticles(query: string, retmax = 3): Promise<SearchResultItem[]> {
  try {
    const esearchResponse = await fetch(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&retmax=${retmax}&sort=relevance`
    );
    if (!esearchResponse.ok) {
      console.warn(`PubMed esearch API error for query "${query}": ${esearchResponse.status}`);
      return [];
    }
    const esearchData = await esearchResponse.json();
    const idList = esearchData.esearchresult?.idlist;

    if (!idList || idList.length === 0) {
      return [];
    }

    // Fetch summaries (abstracts) for the found IDs
    const efetchResponse = await fetch(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${idList.join(",")}&retmode=json`
    );
    if (!efetchResponse.ok) {
      console.warn(`PubMed esummary API error for IDs "${idList.join(",")}": ${efetchResponse.status}`);
      return [];
    }
    const efetchData = await efetchResponse.json();
    
    const articles: SearchResultItem[] = [];
    if (efetchData.result) {
      for (const id of idList) {
        const articleData = efetchData.result[id];
        if (articleData) {
          // For PubMed, the "abstract" is usually within a structured field, 
          // but esummary often provides title, authors, source, pubdate directly.
          // A more detailed fetch (efetch with rettype='abstract') would be needed for full abstracts,
          // but for simplicity, we'll use the available info from esummary.
          // We will construct a placeholder summary and then try to AI summarize it if it's deemed complex.
          // Actual abstract fetching can be complex due to XML parsing.
          // For now, let's assume `articleData.title` and a generic statement will be summarized.
          const initialSummary = `Authors: ${articleData.authors?.map((a: {name: string}) => a.name).join(", ") || "N/A"}. Journal: ${articleData.source || "N/A"}. PubDate: ${articleData.pubdate || "N/A"}. Title: ${articleData.title || "Untitled Article"}`;
          
          articles.push({
            source: "PubMed",
            title: articleData.title || "Untitled Article",
            summary: initialSummary, // This will be potentially replaced by AI summary
            originalSummary: initialSummary,
            url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
          });
        }
      }
    }
    return articles;
  } catch (error) {
    console.error(`Error fetching PubMed articles for "${query}":`, error);
    return [];
  }
}

// Basic MedlinePlus search 
async function fetchMedlinePlus(query: string): Promise<SearchResultItem[]> {
    try {
        const searchUrl = `https://medlineplus.gov/query?q=${encodeURIComponent(query)}`;
        return [{
            source: "MedlinePlus",
            title: `MedlinePlus Health Topics on "${query}"`,
            summary: `Information on "${query}" from MedlinePlus, a service of the National Library of Medicine.`,
            url: searchUrl,
        }];
    } catch (error) {
        console.error(`Error fetching MedlinePlus data for "${query}":`, error);
        return [];
    }
}

async function fetchGoogleScholar(query: string): Promise<SearchResultItem[]> {
    try {
        const searchUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`;
        return [{
            source: "Google Scholar",
            title: `Google Scholar search results for "${query}"`,
            summary: `Scholarly articles related to "${query}" from Google Scholar.`,
            url: searchUrl,
        }];
    } catch (error) {
        console.error(`Error creating Google Scholar link for "${query}":`, error);
        return [];
    }
}

async function fetchAOCET(query: string): Promise<SearchResultItem[]> {
    try {
        const searchQuery = `AO CET Ophthalmology ${query}`;
        const searchUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(searchQuery)}`;
        return [{
            source: "AO CET Ophthalmology (via Google Scholar)",
            title: `Search results for "AO CET Ophthalmology ${query}"`,
            summary: `Potentially relevant articles for "AO CET Ophthalmology ${query}" from Google Scholar.`,
            url: searchUrl,
        }];
    } catch (error) {
        console.error(`Error creating AO CET link for "${query}":`, error);
        return [];
    }
}


export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");
  const source = searchParams.get("source") || "all";

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
  }

  const cacheKey = `${query}_${source}`;
  const cached = searchCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    return NextResponse.json({ results: cached.data });
  }

  let results: SearchResultItem[] = [];

  try {
    if (source === "all" || source === "wikipedia") {
      const wikiResult = await fetchWikipediaSummary(query);
      if (wikiResult) results.push(wikiResult);
    }

    if (source === "all" || source === "pubmed") {
      const pubmedResults = await fetchPubMedArticles(query);
      results.push(...pubmedResults);
    }
    
    if (source === "all" || source === "medlineplus") {
        const medlineResults = await fetchMedlinePlus(query);
        results.push(...medlineResults);
    }

    if (source === "all" || source === "googlescholar") {
        const googleScholarResults = await fetchGoogleScholar(query);
        results.push(...googleScholarResults);
    }

    if (source === "all" || source === "aocet") {
        const aoCETResults = await fetchAOCET(query);
        results.push(...aoCETResults);
    }

    // AI Summarization for specific sources (e.g., PubMed)
    results = await Promise.all(results.map(async (item) => {
      // Prioritize summarizing PubMed results as their abstracts can be dense.
      if (item.source === "PubMed" && item.summary) {
        try {
          const aiSummaryResponse = await summarizeText({ textToSummarize: item.summary, context: "medical research abstract" });
          if (aiSummaryResponse.summary) {
            return { ...item, summary: aiSummaryResponse.summary, originalSummary: item.summary };
          }
        } catch (summarizationError) {
          console.error(`AI summarization failed for PubMed item "${item.title}":`, summarizationError);
          // Keep original summary if AI fails
        }
      }
      // Add conditions for other sources if needed, e.g., if item.summary.length > 300
      return item;
    }));
    
    searchCache.set(cacheKey, { timestamp: Date.now(), data: results });
    return NextResponse.json({ results });

  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: "Failed to fetch search results from external sources." }, { status: 500 });
  }
}
