
import { NextResponse, type NextRequest } from 'next/server';
import { analyzeDocumentContent } from '@/ai/flows/analyze-document-content-flow';
import { Buffer } from 'buffer'; // Ensure Buffer is imported

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Max raw file size (e.g., 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 413 });
    }
    
    let inputForAI: { textContent?: string; fileDataUri?: string; fileName?: string };
    const fileName = file.name;
    const fileType = file.type;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (fileType === 'text/plain' || fileType === 'text/csv' || fileName.endsWith('.txt') || fileName.endsWith('.csv')) {
      const textContent = buffer.toString('utf8');
      // Check text size limit for direct text processing by model
      if (textContent.length > 180000) { // Approx 180k char limit for Gemini Flash text input
          return NextResponse.json({ error: 'Text content too large for direct processing. Max 180k characters.'}, { status: 413 });
      }
      inputForAI = { textContent, fileName };
    } else if (fileType.startsWith('image/') || fileType === 'application/pdf' || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // For images, PDF, DOCX, send as data URI.
      const fileDataUri = `data:${file.type};base64,${buffer.toString('base64')}`;
      // Gemini has an approximate 4MB limit for the data URI payload.
      if (fileDataUri.length > 3.9 * 1024 * 1024) { // Slightly under 4MB
          return NextResponse.json({ error: 'Encoded file data too large for AI processing (max approx 4MB).' }, { status: 413 });
      }
      inputForAI = { fileDataUri, fileName };
    } else {
      return NextResponse.json({ error: `Unsupported file type: ${fileType || 'unknown'}. Supported types for document analysis: TXT, CSV, PDF, DOCX, Images.` }, { status: 415 });
    }

    const aiAnalysisResult = await analyzeDocumentContent(inputForAI);
    return NextResponse.json(aiAnalysisResult);

  } catch (error: any) {
    console.error('Error in /api/analyze-document:', error);
    return NextResponse.json({ error: error.message || 'Failed to analyze document.', details: error.details || null }, { status: 500 });
  }
}
