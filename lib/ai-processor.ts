import Anthropic from '@anthropic-ai/sdk';
import { OrganizeRequest, OrganizeResult } from './types';
import { parseAssetLines } from './validators';

const SYSTEM_PROMPT = `You are an expert 3D project asset manager for a digital space and 3D scanning company.
Your job is to analyze raw 3D project asset lists and return structured JSON.

RULES:
- You MUST return ONLY valid JSON. No markdown, no backticks, no explanation text.
- The JSON must exactly match the schema provided.
- Classify each asset into exactly one category: public_area, private_area, service_area, technical_area, circulation_area, or other.
- Generate a slug for each asset following the convention: {projectType}_{categoryAbbr}-{roomSlug}_{assetType}_v01
  - Category abbreviations: public_area=public, private_area=private, service_area=service, technical_area=tech, circulation_area=circ, other=other
  - Asset types: panorama, scan, photo, video, model, plan, render, asset (detect from name or default to "asset")
  - Room slug: lowercase, hyphens only, no special characters
- Generate warnings for: ambiguous names, likely duplicates, missing floor info, non-convention names
- Generate exactly 2-3 actionable recommendations specific to this project type
- Set processedBy to "ai"
- If you cannot classify confidently, use category "other" and confidence "low"
- detectedIssues should be a deduplicated summary list of issue types found`;

function extractTextContent(content: Anthropic.Messages.ContentBlock[]): string {
  return content
    .filter((block): block is Anthropic.Messages.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim();
}

function cleanJsonPayload(payload: string): string {
  return payload.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
}

export async function processWithAi(request: OrganizeRequest): Promise<OrganizeResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const client = new Anthropic({ apiKey });
  const assetLines = parseAssetLines(request.rawAssets);

  const userPrompt = JSON.stringify(
    {
      schema: {
        projectName: 'string',
        projectType: 'string',
        totalAssets: 0,
        assets: [
          {
            original: 'string',
            category:
              'public_area|private_area|service_area|technical_area|circulation_area|other',
            slug: 'string',
            confidence: 'high|medium|low',
            notes: 'string or null'
          }
        ],
        categories: {
          public_area: 0,
          private_area: 0,
          service_area: 0,
          technical_area: 0,
          circulation_area: 0,
          other: 0
        },
        namingConvention: 'string',
        warnings: [
          {
            assetName: 'string',
            warningType:
              'ambiguous_name|duplicate_likely|missing_floor_info|not_following_convention|missing_asset_type',
            message: 'string'
          }
        ],
        recommendations: ['string', 'string'],
        detectedIssues: ['string'],
        processedBy: 'ai'
      },
      input: {
        projectName: request.projectName,
        projectType: request.projectType,
        rawAssets: assetLines
      }
    },
    null,
    2
  );

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2500,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: userPrompt
      }
    ]
  });

  const rawText = extractTextContent(response.content);
  const cleaned = cleanJsonPayload(rawText);

  try {
    const result = JSON.parse(cleaned) as OrganizeResult;
    result.modelUsed = 'claude-sonnet-4';
    return result;
  } catch (error) {
    throw new Error(
      `Failed to parse AI response as JSON: ${error instanceof Error ? error.message : 'unknown error'}`
    );
  }
}
