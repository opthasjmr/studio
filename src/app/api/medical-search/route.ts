
import { NextResponse, type NextRequest } from 'next/server';
import { summarizeText } from '@/ai/flows/summarize-text-flow';
import { generateMedicalTopicSummary, type GenerateMedicalTopicSummaryOutput } from '@/ai/flows/generate-medical-topic-summary-flow';

interface SearchResultItem {
  source: string;
  title: string;
  summary: string;
  url: string;
  originalSummary?: string;
  image_url?: string; // For Wikipedia images
}

interface MedicalSearchResponse {
  aiComprehensiveSummary?: GenerateMedicalTopicSummaryOutput;
  results: SearchResultItem[];
}

const searchCache = new Map<string, { timestamp: number; data: MedicalSearchResponse }>();
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
      image_url: wikiData.thumbnail?.source,
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
          const initialSummary = `Authors: ${articleData.authors?.map((a: {name: string}) => a.name).join(", ") || "N/A"}. Journal: ${articleData.source || "N/A"}. PubDate: ${articleData.pubdate || "N/A"}. Title: ${articleData.title || "Untitled Article"}`;

          articles.push({
            source: "PubMed",
            title: articleData.title || "Untitled Article",
            summary: initialSummary,
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

async function fetchJMR(query: string): Promise<SearchResultItem[]> {
    try {
        // JMR doesn't have a direct search API, so link to a Google Scholar search scoped to it
        const searchQuery = `"${query}" source:"Journal of Medical Research"`; // Example scoping
        const searchUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(searchQuery)}`;
        return [{
            source: "Journal of Medical Research (JMR) (via Google Scholar)",
            title: `Search JMR for "${query}"`,
            summary: `Search for articles related to "${query}" potentially published in the Journal of Medical Research, using Google Scholar.`,
            url: searchUrl,
        }];
    } catch (error) {
        console.error(`Error creating JMR search link for "${query}":`, error);
        return [];
    }
}


async function fetchGoogleSearch(query: string): Promise<SearchResultItem[]> {
    try {
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        return [{
            source: "Google",
            title: `Google search for "${query}"`,
            summary: `General web search results for "${query}" from Google.`,
            url: searchUrl,
        }];
    } catch (error) {
        console.error(`Error creating Google search link for "${query}":`, error);
        return [];
    }
}

async function fetchUniversitySearch(query: string): Promise<SearchResultItem[]> {
    try {
        // More specific search query for university research, targeting ophthalmology
        const universityQuery = `${query} ophthalmology site:.edu OR site:.ac.uk OR site:.ac.jp OR site:.uni-heidelberg.de`; // Example TLDs
        const searchUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(universityQuery)}`;
        return [{
            source: "University Repositories (via Google Scholar)",
            title: `University & Academic Research for "${query}" in Ophthalmology`,
            summary: `Search for ophthalmology research from university domains and academic sources on Google Scholar. This search attempts to filter by common academic domains.`,
            url: searchUrl,
        }];
    } catch (error) {
        console.error(`Error creating University Repositories search link for "${query}":`, error);
        return [];
    }
}


export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");
  const source = searchParams.get("source") || "all"; // 'all' or specific source
  const summarize = searchParams.get("summarize") === "true"; // Check if AI summary is requested

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
  }

  const cacheKey = `${query}_${source}_${summarize}`;
  const cached = searchCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    return NextResponse.json(cached.data);
  }

  let results: SearchResultItem[] = [];
  let aiComprehensiveSummary: GenerateMedicalTopicSummaryOutput | undefined = undefined;

  try {
    // Generate AI comprehensive summary if requested (or always for 'all' detailed view)
    if (summarize || source === "all") { // Assuming 'all' implies wanting the detailed AI summary
        try {
            aiComprehensiveSummary = await generateMedicalTopicSummary({ topic: query });
        } catch (aiError) {
            console.error(`AI comprehensive summarization failed for query "${query}":`, aiError);
            // Optionally, set a specific error message or let it proceed without AI summary
        }
    }

    // Fetch results based on selected source
    const fetchPromises: Promise<SearchResultItem[] | SearchResultItem | null>[] = [];

    if (source === "all" || source === "wikipedia") {
      fetchPromises.push(fetchWikipediaSummary(query));
    }
    if (source === "all" || source === "pubmed") {
      fetchPromises.push(fetchPubMedArticles(query));
    }
    if (source === "all" || source === "medlineplus") {
      fetchPromises.push(fetchMedlinePlus(query));
    }
    if (source === "all" || source === "googlescholar") {
      fetchPromises.push(fetchGoogleScholar(query));
    }
    if (source === "all" || source === "google") {
      fetchPromises.push(fetchGoogleSearch(query));
    }
    if (source === "all" || source === "university") {
      fetchPromises.push(fetchUniversitySearch(query));
    }
    if (source === "all" || source === "aocet") {
      fetchPromises.push(fetchAOCET(query));
    }
    if (source === "all" || source === "jmr") { // Added JMR fetch
       fetchPromises.push(fetchJMR(query));
    }

    const fetchedResults = await Promise.all(fetchPromises);

    // Flatten and filter null results
    results = fetchedResults.flat().filter((item): item is SearchResultItem => item !== null);


    // AI Summarization for individual PubMed results (existing flow)
    results = await Promise.all(results.map(async (item) => {
      if (item.source === "PubMed" && item.summary && summarize) { // Only summarize PubMed if 'summarize' is true
        try {
          const aiSummaryResponse = await summarizeText({ textToSummarize: item.summary, context: "medical research abstract" });
          if (aiSummaryResponse.summary) {
            return { ...item, summary: aiSummaryResponse.summary, originalSummary: item.originalSummary || item.summary };
          }
        } catch (summarizationError) {
          console.error(`AI text summarization failed for PubMed item "${item.title}":`, summarizationError);
        }
      }
      return item;
    }));

    const responseData: MedicalSearchResponse = { aiComprehensiveSummary, results };
    searchCache.set(cacheKey, { timestamp: Date.now(), data: responseData });
    return NextResponse.json(responseData);

  } catch (error)
 {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: "Failed to fetch search results from external sources." }, { status: 500 });
  }
}
