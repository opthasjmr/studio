
import { NextResponse, type NextRequest } from 'next/server';
import { analyzeDocumentContent } from '@/ai/flows/analyze-document-content-flow';
import { analyzeEyeImage } from '@/ai/flows/analyze-eye-image';
import { Buffer } from 'buffer'; 

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Basic file size validation (e.g., 10MB for raw upload)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 413 });
    }

    const fileType = file.type;
    const fileName = file.name;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileDataUri = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Gemini has an approximate 4MB limit for the data URI payload itself.
    // This check is for the base64 encoded string length.
    if (fileDataUri.length > 3.9 * 1024 * 1024) { // Slightly under 4MB to be safe
        return NextResponse.json({ error: 'Encoded file data too large for AI processing (max approx 4MB).' }, { status: 413 });
    }
    
    if (fileType.startsWith('image/')) {
      const analysisResult = await analyzeEyeImage({ eyeScanDataUri: fileDataUri });
      return NextResponse.json({ diagnosis_result: analysisResult, result_type: 'image_analysis' });

    } else if (['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/csv'].includes(fileType) || fileName.endsWith('.txt') || fileName.endsWith('.csv')) {
      let inputForAI: { textContent?: string; fileDataUri?: string; fileName?: string };

      if (fileType === 'text/plain' || fileType === 'text/csv' || fileName.endsWith('.txt') || fileName.endsWith('.csv')) {
        const textContent = buffer.toString('utf8'); // Use buffer directly if it's text
        // Approx 180k char limit for Gemini Flash text input; check raw text length
        if (textContent.length > 180000) { 
          return NextResponse.json({ error: 'Text content too large for direct processing (max 180k chars).' }, { status: 413 });
        }
        inputForAI = { textContent, fileName };
      } else { // PDF, DOCX - will be sent as data URI. Model attempts to parse.
        inputForAI = { fileDataUri, fileName };
      }

      const analysisResult = await analyzeDocumentContent(inputForAI);
      return NextResponse.json({ diagnosis_result: analysisResult, result_type: 'document_analysis' });

    } else {
      return NextResponse.json({ error: `Unsupported file type: ${fileType || 'unknown'}. Supported types for diagnosis: PDF, DOCX, TXT, CSV, common Image formats (JPG, PNG, WebP).` }, { status: 415 });
    }

  } catch (error: any) {
    console.error('Error in /api/diagnosis:', error);
    // Consider logging the full error for server-side inspection
    // e.g., Sentry.captureException(error);
    
    let errorMessage = 'Failed to process diagnosis request.';
    if (error.message) {
        errorMessage = error.message;
    }
    // If it's a Genkit specific error structure, you might extract more details
    // else if (error.details) { ... }

    return NextResponse.json({ error: errorMessage, details: error.details || null }, { status: 500 });
  }
}
