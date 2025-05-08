import { NextResponse, type NextRequest } from 'next/server';
import { analyzeDocumentContent } from '@/ai/flows/analyze-document-content-flow';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Max file size (e.g., 10MB) - can also be checked on client
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 413 });
    }
    
    let inputForAI: { textContent?: string; fileDataUri?: string; fileName?: string };
    const fileName = file.name;

    // For simplicity in this example, we'll treat PDF and DOCX as something the AI model might directly interpret from a data URI.
    // Robust text extraction for PDF/DOCX on the server would typically require libraries like pdf-parse, mammoth.js, etc.
    // For .txt and .csv, we can read content as text.
    if (file.type === 'text/plain' || file.type === 'text/csv' || file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
      const textContent = await file.text();
      inputForAI = { textContent, fileName };
    } else if (file.type.startsWith('image/') || file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // For images, PDF, DOCX, send as data URI. The AI model (e.g., Gemini) might be able to process it.
      // Note: Gemini's capability to extract detailed structured text from DOCX via data URI is limited.
      // For PDF, it's better but OCR quality varies. Images with text also depend on OCR.
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileDataUri = `data:${file.type};base64,${buffer.toString('base64')}`;
      inputForAI = { fileDataUri, fileName };
    } else {
      return NextResponse.json({ error: `Unsupported file type: ${file.type}. Supported types for this demo: TXT, CSV, PDF, DOCX, Images.` }, { status: 415 });
    }

    if ((inputForAI.textContent?.length || 0) > 180000 &amp;&amp; !inputForAI.fileDataUri) { // Approx 180k char limit for Gemini Flash text input
        return NextResponse.json({ error: 'Text content too large for direct processing. Consider using smaller files or ensure PDF/Image for data URI processing.'}, { status: 413 });
    }


    const aiAnalysisResult = await analyzeDocumentContent(inputForAI);
    return NextResponse.json(aiAnalysisResult);

  } catch (error: any) {
    console.error('Error in /api/analyze-document:', error);
    // Differentiate Genkit errors or other specific errors if needed
    return NextResponse.json({ error: error.message || 'Failed to analyze document.' }, { status: 500 });
  }
}

    