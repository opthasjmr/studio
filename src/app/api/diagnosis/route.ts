
import { NextResponse, type NextRequest } from 'next/server';
import { analyzeDocumentContent } from '@/ai/flows/analyze-document-content-flow';
import { analyzeEyeImage } from '@/ai/flows/analyze-eye-image';
import { Buffer } from 'buffer'; // Import Buffer

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Basic file size validation (e.g., 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 413 });
    }

    const fileType = file.type;
    const fileName = file.name;

    if (fileType.startsWith('image/')) {
      // Handle Image Analysis
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileDataUri = `data:${file.type};base64,${buffer.toString('base64')}`;

      if (fileDataUri.length > 4 * 1024 * 1024) { // Gemini 4MB limit check
          return NextResponse.json({ error: 'Image file size too large for analysis after encoding.' }, { status: 413 });
      }

      const analysisResult = await analyzeEyeImage({ eyeScanDataUri: fileDataUri });
      return NextResponse.json({ diagnosis_result: analysisResult, result_type: 'image_analysis' });

    } else if (['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/csv'].includes(fileType) || fileName.endsWith('.txt') || fileName.endsWith('.csv')) {
      // Handle Document Analysis (PDF, DOCX, TXT, CSV)
      let inputForAI: { textContent?: string; fileDataUri?: string; fileName?: string };

      if (fileType === 'text/plain' || fileType === 'text/csv' || fileName.endsWith('.txt') || fileName.endsWith('.csv')) {
        const textContent = await file.text();
        inputForAI = { textContent, fileName };
        // Check text size limit for direct text processing
        if (textContent.length > 180000) { // Approx 180k char limit for Gemini Flash text input
          return NextResponse.json({ error: 'Text content too large for direct processing.' }, { status: 413 });
        }
      } else { // PDF, DOCX
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileDataUri = `data:${file.type};base64,${buffer.toString('base64')}`;
         if (fileDataUri.length > 4 * 1024 * 1024) { // Gemini 4MB limit check
            return NextResponse.json({ error: 'Document file size too large for analysis after encoding.' }, { status: 413 });
        }
        inputForAI = { fileDataUri, fileName };
      }


      const analysisResult = await analyzeDocumentContent(inputForAI);
      return NextResponse.json({ diagnosis_result: analysisResult, result_type: 'document_analysis' });

    } else {
      return NextResponse.json({ error: `Unsupported file type: ${fileType}. Supported types: PDF, DOCX, TXT, CSV, Images (JPG, PNG, etc.)` }, { status: 415 });
    }

  } catch (error: any) {
    console.error('Error in /api/diagnosis:', error);
    return NextResponse.json({ error: error.message || 'Failed to process diagnosis request.' }, { status: 500 });
  }
}
