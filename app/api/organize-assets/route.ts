import { NextResponse } from 'next/server';
import { processWithAi } from '@/lib/ai-processor';
import { processMock } from '@/lib/mock-processor';
import { ApiErrorResponse, OrganizeRequest } from '@/lib/types';
import { validateOrganizeRequest } from '@/lib/validators';

export async function GET() {
  return NextResponse.json({
    endpoint: 'POST /api/organize-assets',
    status: 'ok',
    aiEnabled: Boolean(process.env.ANTHROPIC_API_KEY),
    version: '1.0.0'
  });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    const errorResponse: ApiErrorResponse = {
      error: 'Invalid JSON body'
    };
    return NextResponse.json(errorResponse, { status: 400 });
  }

  const validation = validateOrganizeRequest(body);

  if (!validation.valid) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: JSON.stringify(validation.errors)
      },
      { status: 422 }
    );
  }

  const payload = body as OrganizeRequest;
  const startTime = Date.now();

  try {
    const result = process.env.ANTHROPIC_API_KEY
      ? await processWithAi(payload)
      : await processMock(payload);
    result.processingTimeMs = Date.now() - startTime;

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json(
      {
        error: 'Failed to organize assets',
        details: message
      },
      { status: 500 }
    );
  }
}
