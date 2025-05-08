
import { NextResponse, type NextRequest } from 'next/server';

interface SearchResultItem {
  source: string;
  title: string;
  summary: string;
  url: string;
}

// Basic cache to avoid hitting APIs too frequently during development/testing
const searchCache = new Map<string, { timestamp: number; data: SearchResultItem[] }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchWikipediaSummary(query: string): Promise<SearchResultItem | null> {
  try {
    const wikiResponse = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': 'VisionCarePlusApp/1.0 (contact@example.com)' } // Good practice to set User-Agent
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
          articles.push({
            source: "PubMed",
            title: articleData.title || "Untitled Article",
            summary: `Authors: ${articleData.authors?.map((a: {name: string}) => a.name).join(", ") || "N/A"}. Journal: ${articleData.source || "N/A"}. PubDate: ${articleData.pubdate || "N/A"}.`,
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

// Basic MedlinePlus search (might require a more sophisticated approach or API key for better results)
async function fetchMedlinePlus(query: string): Promise<SearchResultItem[]> {
    try {
        // MedlinePlus Connect is the official way, but requires setup.
        // For a quick demo, we can try to link to their search results or use a general health API if available.
        // This is a simplified placeholder linking to search.
        // A proper integration would use their Web Service: https://medlineplus.gov/medlineplus-web-service/
        const searchUrl = `https://medlineplus.gov/query?q=${encodeURIComponent(query)}`;
        // Simulate finding a few top results or topics - in a real scenario, this would parse XML from their API.
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

    // Placeholder for AI summarization if content was fetched that needs it.
    // For example, if PubMed articles had full abstracts, they could be summarized.
    // results = await Promise.all(results.map(async (item) => {
    //   if (item.summary.length > 300) { // Example condition for summarizing
    //     // const aiSummary = await getAISummary(item.summary); // Call to Genkit flow
    //     // return { ...item, summary: aiSummary || item.summary }; 
    //   }
    //   return item;
    // }));
    
    // Additional sources like university repositories, ClinicalTrials.gov, Elsevier would be added here similarly.

    searchCache.set(cacheKey, { timestamp: Date.now(), data: results });
    return NextResponse.json({ results });

  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: "Failed to fetch search results from external sources." }, { status: 500 });
  }
}
