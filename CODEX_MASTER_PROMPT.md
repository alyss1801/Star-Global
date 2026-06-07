# CODEX MASTER PROMPT — AI 3D Asset Organizer
> Intern Tech Test | Next.js Fullstack | TypeScript | Claude/OpenAI API

---

## ⚠️ INSTRUCTIONS FOR CODEX (READ FIRST)

This prompt is divided into **numbered tasks**. Execute them **one task at a time**, in order.  
Do NOT generate everything at once. After each task, stop and confirm before proceeding.  
Each task is self-contained and references a specific file or feature.

---

## 1. PROJECT OVERVIEW

### Goal
Build a mini fullstack web app called **AI 3D Asset Organizer** that helps 3D digitization project teams automatically classify, rename, and organize their 3D scan assets using AI.

This is not a chatbot. This is a **structured data pipeline tool** that takes raw, messy asset names and transforms them into organized, standardized, metadata-rich project structures — using LLM as the intelligence engine.

### Core Value Proposition
- Input: unstructured asset list (e.g., "lobby panorama scan", "meeting room 1")
- Output: classified assets, standardized slugs, structured JSON metadata, warnings, and recommendations

### Context
The company builds 3D digital space solutions. Their pain point: project teams upload assets with inconsistent names, no classification, and no metadata → chaos in file management. This tool solves that with AI.

---

## 2. TECH STACK

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Next.js 14 (App Router) | Fullstack in one repo, API routes built-in |
| Language | TypeScript (strict) | Type safety, clarity for reviewers |
| Styling | Tailwind CSS | Fast, utility-first, professional look |
| AI API | Anthropic Claude (`claude-sonnet-4-20250514`) | Primary LLM |
| Fallback | Mock AI module | Works without any API key |
| Runtime | Node.js 18+ | Required by Next.js 14 |
| Package manager | npm | Keep it simple |

**No database needed.** Stateless per-request processing only.

---

## 3. DIRECTORY STRUCTURE

Generate exactly this structure. Do not add extra files unless specified.

```
ai-3d-asset-organizer/
├── app/
│   ├── layout.tsx                  # Root layout with metadata
│   ├── page.tsx                    # Main page (renders AssetOrganizerForm)
│   ├── globals.css                 # Tailwind base styles
│   └── api/
│       └── organize-assets/
│           └── route.ts            # POST /api/organize-assets
├── components/
│   ├── AssetOrganizerForm.tsx      # Main form component
│   ├── ResultsTable.tsx            # Asset classification results table
│   ├── MetadataPreview.tsx         # JSON metadata viewer
│   └── WarningsList.tsx            # Warnings + recommendations display
├── lib/
│   ├── ai-processor.ts             # Calls Claude API, returns OrganizeResult
│   ├── mock-processor.ts           # Fallback mock logic (no API key needed)
│   ├── validators.ts               # Input validation logic
│   ├── slug-generator.ts           # Slug generation utility
│   └── types.ts                    # All shared TypeScript interfaces
├── .env.example
├── .env.local                      # (gitignored, user creates this)
├── README.md
├── REPORT.md
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. APP FLOW (End to End)

```
User fills form
  → [projectName] [projectType] [assetList textarea]
  → clicks "Analyze Assets"

Frontend validation
  → all fields required
  → assetList must have at least 2 lines
  → show inline errors if invalid

POST /api/organize-assets
  Body: { projectName, projectType, rawAssets }

API Route (route.ts)
  → parse + validate body
  → if ANTHROPIC_API_KEY exists → call ai-processor.ts
  → else → call mock-processor.ts
  → return OrganizeResult JSON

Frontend receives result
  → show ResultsTable (classified assets + slugs)
  → show MetadataPreview (JSON block)
  → show WarningsList (warnings + recommendations)
```

---

## 5. TYPESCRIPT TYPES (lib/types.ts)

### TASK 1 — Create lib/types.ts

Create this file first. All other files depend on it.

```typescript
// lib/types.ts

export type ProjectType =
  | 'apartment'
  | 'office'
  | 'showroom'
  | 'exhibition'
  | 'museum'
  | 'retail'
  | 'custom';

export type AssetCategory =
  | 'public_area'
  | 'private_area'
  | 'service_area'
  | 'technical_area'
  | 'circulation_area'
  | 'other';

export interface RawAsset {
  original: string; // original input line
}

export interface ClassifiedAsset {
  original: string;         // original input
  category: AssetCategory;  // assigned category
  slug: string;             // generated slug e.g. showroom_public-lobby_panorama_v01
  confidence: 'high' | 'medium' | 'low'; // AI confidence in classification
  notes?: string;           // optional AI note about this asset
}

export interface ProjectWarning {
  assetName: string;
  warningType:
    | 'ambiguous_name'
    | 'duplicate_likely'
    | 'missing_floor_info'
    | 'not_following_convention'
    | 'missing_asset_type';
  message: string;
}

export interface OrganizeResult {
  projectName: string;
  projectType: ProjectType;
  totalAssets: number;
  assets: ClassifiedAsset[];
  categories: Record<AssetCategory, number>; // count per category
  namingConvention: string;                  // e.g. "{projectType}_{area}-{room}_{assetType}_v01"
  warnings: ProjectWarning[];
  recommendations: string[];                 // 2–3 improvement suggestions
  detectedIssues: string[];                  // summary list of issues found
  processedBy: 'ai' | 'mock';               // for transparency
}

export interface OrganizeRequest {
  projectName: string;
  projectType: ProjectType;
  rawAssets: string; // raw textarea content, newline-separated
}

export interface ApiErrorResponse {
  error: string;
  details?: string;
}
```

---

## 6. VALIDATION (lib/validators.ts)

### TASK 2 — Create lib/validators.ts

```typescript
// lib/validators.ts

import { OrganizeRequest, ProjectType } from './types';

const VALID_PROJECT_TYPES: ProjectType[] = [
  'apartment', 'office', 'showroom', 'exhibition', 'museum', 'retail', 'custom'
];

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateOrganizeRequest(body: unknown): ValidationResult {
  const errors: Record<string, string> = {};

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: { root: 'Invalid request body' } };
  }

  const req = body as Partial<OrganizeRequest>;

  // projectName
  if (!req.projectName || typeof req.projectName !== 'string' || req.projectName.trim().length === 0) {
    errors.projectName = 'Project name is required';
  } else if (req.projectName.trim().length < 2) {
    errors.projectName = 'Project name must be at least 2 characters';
  }

  // projectType
  if (!req.projectType || !VALID_PROJECT_TYPES.includes(req.projectType as ProjectType)) {
    errors.projectType = 'Please select a valid project type';
  }

  // rawAssets
  if (!req.rawAssets || typeof req.rawAssets !== 'string' || req.rawAssets.trim().length === 0) {
    errors.rawAssets = 'Asset list is required';
  } else {
    const lines = req.rawAssets.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) {
      errors.rawAssets = 'Please provide at least 2 assets (one per line)';
    }
    if (lines.length > 100) {
      errors.rawAssets = 'Maximum 100 assets per request';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

export function parseAssetLines(rawAssets: string): string[] {
  return rawAssets
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#'));
}
```

---

## 7. SLUG GENERATOR (lib/slug-generator.ts)

### TASK 3 — Create lib/slug-generator.ts

Convention: `{projectType}_{category-abbreviation}-{room-slug}_{assetType}_v01`

```typescript
// lib/slug-generator.ts

import { AssetCategory, ProjectType } from './types';

const CATEGORY_ABBREVIATIONS: Record<AssetCategory, string> = {
  public_area: 'public',
  private_area: 'private',
  service_area: 'service',
  technical_area: 'tech',
  circulation_area: 'circ',
  other: 'other'
};

// Detect asset type from name
export function detectAssetType(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('panorama') || lower.includes('pano')) return 'panorama';
  if (lower.includes('scan')) return 'scan';
  if (lower.includes('photo') || lower.includes('image')) return 'photo';
  if (lower.includes('video')) return 'video';
  if (lower.includes('model') || lower.includes('3d')) return 'model';
  if (lower.includes('plan') || lower.includes('map')) return 'plan';
  if (lower.includes('render')) return 'render';
  return 'asset';
}

// Convert a string to a slug-safe format
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Generate the full slug for an asset
export function generateSlug(
  projectType: ProjectType,
  category: AssetCategory,
  assetName: string,
  version: string = 'v01'
): string {
  const catAbbr = CATEGORY_ABBREVIATIONS[category];
  const assetType = detectAssetType(assetName);

  // Extract room name (remove asset type words)
  const roomName = assetName
    .toLowerCase()
    .replace(/panorama|pano|scan|photo|image|video|model|3d|plan|map|render/gi, '')
    .trim();

  const roomSlug = toSlug(roomName) || 'area';
  const projectSlug = toSlug(projectType);

  return `${projectSlug}_${catAbbr}-${roomSlug}_${assetType}_${version}`;
}
```

---

## 8. MOCK PROCESSOR (lib/mock-processor.ts)

### TASK 4 — Create lib/mock-processor.ts

This runs when no API key is set. It must produce a realistic, useful output using deterministic rules.

```typescript
// lib/mock-processor.ts

import { OrganizeRequest, OrganizeResult, ClassifiedAsset, AssetCategory, ProjectWarning } from './types';
import { parseAssetLines } from './validators';
import { generateSlug } from './slug-generator';

// Keyword → category mapping (order matters: first match wins)
const CATEGORY_RULES: Array<{ keywords: string[]; category: AssetCategory }> = [
  { keywords: ['lobby', 'reception', 'entrance', 'foyer', 'showroom floor', 'gallery', 'exhibition hall', 'retail floor', 'shop floor'], category: 'public_area' },
  { keywords: ['bedroom', 'master', 'private office', 'vip', 'suite', 'changing room', 'dressing'], category: 'private_area' },
  { keywords: ['kitchen', 'bathroom', 'toilet', 'restroom', 'wc', 'pantry', 'break room', 'canteen'], category: 'service_area' },
  { keywords: ['technical', 'server', 'electrical', 'mechanical', 'hvac', 'plant room', 'utility', 'pump', 'generator'], category: 'technical_area' },
  { keywords: ['corridor', 'hallway', 'staircase', 'elevator', 'lift', 'landing', 'passage', 'walkway', 'floor'], category: 'circulation_area' },
  { keywords: ['meeting', 'conference', 'boardroom', 'office', 'workspace', 'workstation'], category: 'public_area' },
];

function classifyAsset(name: string): AssetCategory {
  const lower = name.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some(k => lower.includes(k))) {
      return rule.category;
    }
  }
  return 'other';
}

function detectWarnings(assets: string[], classified: ClassifiedAsset[]): ProjectWarning[] {
  const warnings: ProjectWarning[] = [];
  const slugsSeen = new Map<string, string>();

  for (const asset of classified) {
    const name = asset.original.toLowerCase();

    // Ambiguous name (too short or too generic)
    if (asset.original.split(' ').length <= 1 || name.length < 5) {
      warnings.push({
        assetName: asset.original,
        warningType: 'ambiguous_name',
        message: `"${asset.original}" is too vague. Consider adding room type or floor info.`
      });
    }

    // Missing floor info (multi-floor projects often need this)
    if (!name.includes('floor') && !name.includes('level') && !name.match(/f[0-9]|b[0-9]|[0-9]f/)) {
      if (asset.category === 'circulation_area') {
        warnings.push({
          assetName: asset.original,
          warningType: 'missing_floor_info',
          message: `"${asset.original}" is a circulation area but has no floor indicator (e.g., floor-1, f02).`
        });
      }
    }

    // Duplicate slug detection
    if (slugsSeen.has(asset.slug)) {
      warnings.push({
        assetName: asset.original,
        warningType: 'duplicate_likely',
        message: `"${asset.original}" generates the same slug as "${slugsSeen.get(asset.slug)}". These may be duplicates.`
      });
    } else {
      slugsSeen.set(asset.slug, asset.original);
    }

    // Not following convention (has special characters or uppercase)
    if (/[A-Z]/.test(asset.original) || /[^a-zA-Z0-9\s\-_\/]/.test(asset.original)) {
      warnings.push({
        assetName: asset.original,
        warningType: 'not_following_convention',
        message: `"${asset.original}" contains uppercase or special characters. Use lowercase and spaces only.`
      });
    }
  }

  return warnings;
}

export async function processMock(request: OrganizeRequest): Promise<OrganizeResult> {
  const assetLines = parseAssetLines(request.rawAssets);
  const projectType = request.projectType;

  const classifiedAssets: ClassifiedAsset[] = assetLines.map((line, index) => {
    const category = classifyAsset(line);
    const slug = generateSlug(projectType, category, line, `v${String(index + 1).padStart(2, '0')}`);
    return {
      original: line,
      category,
      slug,
      confidence: category === 'other' ? 'low' : 'high',
      notes: category === 'other' ? 'Could not determine category from name. Please review.' : undefined
    };
  });

  const categoryCounts: Record<string, number> = {
    public_area: 0, private_area: 0, service_area: 0,
    technical_area: 0, circulation_area: 0, other: 0
  };
  classifiedAssets.forEach(a => { categoryCounts[a.category]++; });

  const warnings = detectWarnings(assetLines, classifiedAssets);

  const recommendations: string[] = [
    `Add floor/level indicators to all asset names (e.g., "lobby-f01", "meeting-room-f02") for multi-floor ${projectType} projects.`,
    `Standardize asset type suffixes before import: use "panorama", "scan", or "model" consistently rather than mixing terms.`,
    `Group assets by category folder (public_area/, private_area/, etc.) in your project storage to match this classification.`
  ];

  const detectedIssues = [
    ...new Set(warnings.map(w => w.warningType))
  ].map(type => {
    const map: Record<string, string> = {
      ambiguous_name: 'Some asset names are too vague for reliable classification',
      duplicate_likely: 'Potential duplicate assets detected',
      missing_floor_info: 'Floor/level information missing from some assets',
      not_following_convention: 'Some names use uppercase or special characters',
      missing_asset_type: 'Asset type not specified in some names'
    };
    return map[type] || type;
  });

  return {
    projectName: request.projectName,
    projectType: request.projectType,
    totalAssets: classifiedAssets.length,
    assets: classifiedAssets,
    categories: categoryCounts as any,
    namingConvention: `{projectType}_{category}-{room}_{assetType}_v{nn}`,
    warnings,
    recommendations,
    detectedIssues,
    processedBy: 'mock'
  };
}
```

---

## 9. AI PROCESSOR (lib/ai-processor.ts)

### TASK 5 — Create lib/ai-processor.ts

This calls the Claude API. It must always return valid JSON matching `OrganizeResult`.

#### System Prompt for LLM (embed this exactly in the code):

```
You are an expert 3D project asset manager for a digital space and 3D scanning company.
Your job is to analyze raw 3D project asset lists and return structured JSON.

RULES:
- You MUST return ONLY valid JSON. No markdown, no backticks, no explanation text.
- The JSON must exactly match the schema provided.
- Classify each asset into exactly one category: public_area, private_area, service_area, technical_area, circulation_area, or other.
- Generate a slug for each asset following the convention: {projectType}_{categoryAbbr}-{roomSlug}_{assetType}_v01
  - Category abbreviations: public_area→public, private_area→private, service_area→service, technical_area→tech, circulation_area→circ, other→other
  - Asset types: panorama, scan, photo, video, model, plan, render, asset (detect from name)
  - Room slug: lowercase, hyphens only, no special chars
- Generate warnings for: ambiguous names, likely duplicates, missing floor info, non-convention names
- Generate 2–3 actionable recommendations for this specific project type
- If you cannot classify confidently, use category "other" and confidence "low"
- detectedIssues should be a deduplicated summary list of issue types found
```

#### JSON Schema to return:

```json
{
  "projectName": "string",
  "projectType": "string",
  "totalAssets": 0,
  "assets": [
    {
      "original": "string",
      "category": "public_area|private_area|service_area|technical_area|circulation_area|other",
      "slug": "string",
      "confidence": "high|medium|low",
      "notes": "string or null"
    }
  ],
  "categories": {
    "public_area": 0,
    "private_area": 0,
    "service_area": 0,
    "technical_area": 0,
    "circulation_area": 0,
    "other": 0
  },
  "namingConvention": "string",
  "warnings": [
    {
      "assetName": "string",
      "warningType": "ambiguous_name|duplicate_likely|missing_floor_info|not_following_convention|missing_asset_type",
      "message": "string"
    }
  ],
  "recommendations": ["string", "string"],
  "detectedIssues": ["string"],
  "processedBy": "ai"
}
```

```typescript
// lib/ai-processor.ts

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
- detectedIssues: deduplicated list of issue type descriptions found`;

function buildUserPrompt(request: OrganizeRequest, assetLines: string[]): string {
  return `Analyze this 3D project and return JSON only.

Project Name: ${request.projectName}
Project Type: ${request.projectType}
Total Assets: ${assetLines.length}

Asset List:
${assetLines.map((a, i) => `${i + 1}. ${a}`).join('\n')}

Return a JSON object with this exact schema:
{
  "projectName": "${request.projectName}",
  "projectType": "${request.projectType}",
  "totalAssets": ${assetLines.length},
  "assets": [{ "original": "", "category": "", "slug": "", "confidence": "", "notes": null }],
  "categories": { "public_area": 0, "private_area": 0, "service_area": 0, "technical_area": 0, "circulation_area": 0, "other": 0 },
  "namingConvention": "",
  "warnings": [{ "assetName": "", "warningType": "", "message": "" }],
  "recommendations": [],
  "detectedIssues": [],
  "processedBy": "ai"
}`;
}

export async function processWithAI(request: OrganizeRequest): Promise<OrganizeResult> {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!
  });

  const assetLines = parseAssetLines(request.rawAssets);

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: buildUserPrompt(request, assetLines)
      }
    ]
  });

  const rawText = message.content
    .filter(block => block.type === 'text')
    .map(block => (block as { type: 'text'; text: string }).text)
    .join('');

  // Strip any accidental markdown fences
  const cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let result: OrganizeResult;
  try {
    result = JSON.parse(cleaned) as OrganizeResult;
  } catch {
    throw new Error(`AI returned invalid JSON. Raw response: ${rawText.substring(0, 200)}`);
  }

  // Safety: ensure processedBy is set
  result.processedBy = 'ai';

  return result;
}
```

---

## 10. API ROUTE (app/api/organize-assets/route.ts)

### TASK 6 — Create API route

```typescript
// app/api/organize-assets/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { validateOrganizeRequest } from '@/lib/validators';
import { OrganizeRequest, ApiErrorResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate
    const validation = validateOrganizeRequest(body);
    if (!validation.valid) {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Validation failed', details: JSON.stringify(validation.errors) },
        { status: 422 }
      );
    }

    const req = body as OrganizeRequest;

    // Route to AI or Mock
    const hasApiKey = Boolean(process.env.ANTHROPIC_API_KEY);

    let result;
    if (hasApiKey) {
      const { processWithAI } = await import('@/lib/ai-processor');
      result = await processWithAI(req);
    } else {
      const { processMock } = await import('@/lib/mock-processor');
      result = await processMock(req);
    }

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[organize-assets] Error:', message);
    return NextResponse.json<ApiErrorResponse>(
      { error: 'Processing failed', details: message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: 'POST /api/organize-assets',
    status: 'ok',
    aiEnabled: Boolean(process.env.ANTHROPIC_API_KEY),
    version: '1.0.0'
  });
}
```

---

## 11. FRONTEND COMPONENTS

### TASK 7 — Create components/WarningsList.tsx

```typescript
// components/WarningsList.tsx
import { ProjectWarning } from '@/lib/types';

interface Props {
  warnings: ProjectWarning[];
  recommendations: string[];
}

const WARNING_LABELS: Record<string, string> = {
  ambiguous_name: '⚠️ Ambiguous',
  duplicate_likely: '🔁 Duplicate Risk',
  missing_floor_info: '🏢 Missing Floor',
  not_following_convention: '📝 Bad Format',
  missing_asset_type: '❓ No Asset Type'
};

export function WarningsList({ warnings, recommendations }: Props) {
  if (warnings.length === 0 && recommendations.length === 0) return null;

  return (
    <div className="space-y-4">
      {warnings.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-amber-700 mb-2">
            ⚠️ Warnings ({warnings.length})
          </h3>
          <ul className="space-y-2">
            {warnings.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-sm bg-amber-50 border border-amber-200 rounded-md p-3">
                <span className="font-medium text-amber-800 whitespace-nowrap">
                  {WARNING_LABELS[w.warningType] || w.warningType}
                </span>
                <span className="text-amber-700">{w.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {recommendations.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-blue-700 mb-2">
            💡 Recommendations
          </h3>
          <ul className="space-y-2">
            {recommendations.map((r, i) => (
              <li key={i} className="text-sm bg-blue-50 border border-blue-200 rounded-md p-3 text-blue-800">
                {i + 1}. {r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### TASK 8 — Create components/ResultsTable.tsx

```typescript
// components/ResultsTable.tsx
import { ClassifiedAsset } from '@/lib/types';

interface Props {
  assets: ClassifiedAsset[];
}

const CATEGORY_COLORS: Record<string, string> = {
  public_area: 'bg-green-100 text-green-800',
  private_area: 'bg-purple-100 text-purple-800',
  service_area: 'bg-yellow-100 text-yellow-800',
  technical_area: 'bg-red-100 text-red-800',
  circulation_area: 'bg-blue-100 text-blue-800',
  other: 'bg-gray-100 text-gray-700'
};

const CONFIDENCE_COLORS: Record<string, string> = {
  high: 'text-green-600',
  medium: 'text-yellow-600',
  low: 'text-red-500'
};

export function ResultsTable({ assets }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-4 py-3 text-left">#</th>
            <th className="px-4 py-3 text-left">Original Name</th>
            <th className="px-4 py-3 text-left">Category</th>
            <th className="px-4 py-3 text-left">Generated Slug</th>
            <th className="px-4 py-3 text-left">Confidence</th>
            <th className="px-4 py-3 text-left">Notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {assets.map((asset, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-400">{i + 1}</td>
              <td className="px-4 py-3 font-medium text-gray-800">{asset.original}</td>
              <td className="px-4 py-3">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[asset.category]}`}>
                  {asset.category.replace('_', ' ')}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-gray-600 bg-gray-50">{asset.slug}</td>
              <td className={`px-4 py-3 font-medium ${CONFIDENCE_COLORS[asset.confidence]}`}>
                {asset.confidence}
              </td>
              <td className="px-4 py-3 text-gray-500 text-xs">{asset.notes || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### TASK 9 — Create components/MetadataPreview.tsx

```typescript
// components/MetadataPreview.tsx
import { OrganizeResult } from '@/lib/types';
import { useState } from 'react';

interface Props {
  result: OrganizeResult;
}

export function MetadataPreview({ result }: Props) {
  const [copied, setCopied] = useState(false);

  const metadata = {
    projectName: result.projectName,
    projectType: result.projectType,
    totalAssets: result.totalAssets,
    categories: result.categories,
    namingConvention: result.namingConvention,
    detectedIssues: result.detectedIssues,
    processedBy: result.processedBy
  };

  const json = JSON.stringify(metadata, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">📋 Project Metadata (JSON)</h3>
        <button
          onClick={handleCopy}
          className="text-xs px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
        >
          {copied ? '✓ Copied!' : 'Copy JSON'}
        </button>
      </div>
      <pre className="bg-gray-900 text-green-400 text-xs p-4 rounded-lg overflow-x-auto leading-relaxed">
        {json}
      </pre>
    </div>
  );
}
```

### TASK 10 — Create components/AssetOrganizerForm.tsx

This is the main component. It orchestrates the form and results.

```typescript
// components/AssetOrganizerForm.tsx
'use client';

import { useState } from 'react';
import { OrganizeResult, ProjectType } from '@/lib/types';
import { ResultsTable } from './ResultsTable';
import { MetadataPreview } from './MetadataPreview';
import { WarningsList } from './WarningsList';

const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: 'apartment', label: '🏠 Apartment' },
  { value: 'office', label: '🏢 Office' },
  { value: 'showroom', label: '🪑 Showroom' },
  { value: 'exhibition', label: '🖼️ Exhibition' },
  { value: 'museum', label: '🏛️ Museum' },
  { value: 'retail', label: '🛍️ Retail' },
  { value: 'custom', label: '⚙️ Custom' }
];

const EXAMPLE_ASSETS = `lobby panorama scan
meeting room 1
kitchen area
bedroom master
technical room
reception desk
bathroom scan
floor 2 corridor`;

interface FormErrors {
  projectName?: string;
  projectType?: string;
  rawAssets?: string;
}

export function AssetOrganizerForm() {
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState<ProjectType | ''>('');
  const [rawAssets, setRawAssets] = useState('');
  const [result, setResult] = useState<OrganizeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!projectName.trim()) errors.projectName = 'Project name is required';
    if (!projectType) errors.projectType = 'Please select a project type';
    const lines = rawAssets.split('\n').filter(l => l.trim());
    if (lines.length < 2) errors.rawAssets = 'Please enter at least 2 assets (one per line)';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setApiError(null);
    setResult(null);

    try {
      const res = await fetch('/api/organize-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName, projectType, rawAssets })
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error || `Request failed with status ${res.status}`);
        return;
      }

      setResult(data as OrganizeResult);
    } catch (err) {
      setApiError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadExample = () => {
    setProjectName('Sunrise Showroom');
    setProjectType('showroom');
    setRawAssets(EXAMPLE_ASSETS);
    setFormErrors({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-lg">
              🗂️
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">AI 3D Asset Organizer</h1>
              <p className="text-xs text-gray-500">Classify · Rename · Organize your 3D project assets</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Input Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Project Input</h2>
            <button
              onClick={handleLoadExample}
              className="text-xs text-indigo-600 hover:text-indigo-800 underline"
            >
              Load example
            </button>
          </div>

          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              placeholder="e.g. Sunrise Showroom HCMC"
              className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                formErrors.projectName ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {formErrors.projectName && (
              <p className="text-xs text-red-500 mt-1">{formErrors.projectName}</p>
            )}
          </div>

          {/* Project Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Type *
            </label>
            <select
              value={projectType}
              onChange={e => setProjectType(e.target.value as ProjectType)}
              className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                formErrors.projectType ? 'border-red-400' : 'border-gray-300'
              }`}
            >
              <option value="">Select project type…</option>
              {PROJECT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            {formErrors.projectType && (
              <p className="text-xs text-red-500 mt-1">{formErrors.projectType}</p>
            )}
          </div>

          {/* Asset List */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asset List * <span className="text-gray-400 font-normal">(one per line)</span>
            </label>
            <textarea
              value={rawAssets}
              onChange={e => setRawAssets(e.target.value)}
              rows={10}
              placeholder={'lobby panorama scan\nmeeting room 1\nkitchen area\n...'}
              className={`w-full px-3 py-2 rounded-md border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                formErrors.rawAssets ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            <div className="flex justify-between items-center mt-1">
              {formErrors.rawAssets ? (
                <p className="text-xs text-red-500">{formErrors.rawAssets}</p>
              ) : (
                <p className="text-xs text-gray-400">
                  {rawAssets.split('\n').filter(l => l.trim()).length} assets entered
                </p>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium py-2.5 rounded-lg transition text-sm"
          >
            {loading ? '⏳ Analyzing…' : '🔍 Analyze Assets'}
          </button>

          {/* API Error */}
          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 text-sm text-red-700">
              <strong>Error:</strong> {apiError}
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Summary Bar */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
              <div className="flex flex-wrap gap-4 items-center">
                <div>
                  <p className="text-xs text-indigo-500 font-medium uppercase tracking-wide">Project</p>
                  <p className="text-base font-bold text-indigo-900">{result.projectName}</p>
                </div>
                <div>
                  <p className="text-xs text-indigo-500 font-medium uppercase tracking-wide">Type</p>
                  <p className="text-base font-semibold text-indigo-800">{result.projectType}</p>
                </div>
                <div>
                  <p className="text-xs text-indigo-500 font-medium uppercase tracking-wide">Total Assets</p>
                  <p className="text-base font-bold text-indigo-900">{result.totalAssets}</p>
                </div>
                <div className="ml-auto">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    result.processedBy === 'ai'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {result.processedBy === 'ai' ? '✨ AI Processed' : '🔧 Mock Mode'}
                  </span>
                </div>
              </div>
            </div>

            {/* Classification Table */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
              <h2 className="font-semibold text-gray-800">📊 Asset Classification</h2>
              <ResultsTable assets={result.assets} />
            </div>

            {/* Warnings + Recommendations */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-800 mb-4">🔍 Analysis</h2>
              <WarningsList warnings={result.warnings} recommendations={result.recommendations} />
            </div>

            {/* Metadata JSON */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <MetadataPreview result={result} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
```

---

## 12. PAGES & LAYOUT

### TASK 11 — Create app/page.tsx

```typescript
// app/page.tsx
import { AssetOrganizerForm } from '@/components/AssetOrganizerForm';

export default function Home() {
  return <AssetOrganizerForm />;
}
```

### TASK 12 — Create app/layout.tsx

```typescript
// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI 3D Asset Organizer',
  description: 'Classify and organize 3D project assets with AI'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### TASK 13 — Create app/globals.css

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 13. CONFIG FILES

### TASK 14 — Create package.json

```json
{
  "name": "ai-3d-asset-organizer",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@anthropic-ai/sdk": "^0.27.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.39",
    "tailwindcss": "^3.4.6",
    "typescript": "^5"
  }
}
```

### TASK 15 — Create next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {};
module.exports = nextConfig;
```

### TASK 16 — Create tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### TASK 17 — Create tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: { extend: {} },
  plugins: []
};

export default config;
```

### TASK 18 — Create .env.example

```
# AI 3D Asset Organizer — Environment Variables
# Copy this file to .env.local and fill in your values

# Optional: Add your Anthropic API key to enable real AI processing
# If not set, the app will use mock AI (still functional for demo)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional: For future support of other AI providers
# OPENAI_API_KEY=sk-...
# GEMINI_API_KEY=AIza...
```

---

## 14. README.md CONTENT

### TASK 19 — Create README.md

Write this file exactly:

```markdown
# AI 3D Asset Organizer

A fullstack web app that uses AI to automatically classify, rename, and organize 3D project assets.
Built with Next.js 14, TypeScript, and the Anthropic Claude API.

## What it does

Given a raw list of 3D project asset names (e.g., "lobby panorama scan", "meeting room 1"), the app:

1. **Classifies** each asset into: `public_area`, `private_area`, `service_area`, `technical_area`, `circulation_area`, or `other`
2. **Generates standardized slugs** following the convention: `{projectType}_{category}-{room}_{assetType}_v01`
3. **Produces structured JSON metadata** for the project
4. **Flags warnings**: ambiguous names, duplicates, missing floor info, format issues
5. **Suggests improvements** for better asset organization

## Quick Start

### 1. Clone and install

```bash
git clone <repo-url>
cd ai-3d-asset-organizer
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
- **With AI**: Add your `ANTHROPIC_API_KEY` (get one at console.anthropic.com)
- **Without AI**: Leave it empty — the app runs in Mock Mode automatically

### 3. Run locally

```bash
npm run dev
```

Open http://localhost:3000

## Usage

1. Enter your **project name**
2. Select the **project type** (apartment, office, showroom, etc.)
3. Paste your **asset list** — one asset per line
4. Click **Analyze Assets**
5. View classification table, warnings, and exportable JSON metadata

**Tip**: Click "Load example" to try with sample data instantly.

## API

### POST /api/organize-assets

```json
{
  "projectName": "Sunrise Showroom",
  "projectType": "showroom",
  "rawAssets": "lobby panorama scan\nmeeting room 1\nkitchen area"
}
```

Returns an `OrganizeResult` JSON object. See `lib/types.ts` for full schema.

### GET /api/organize-assets

Returns API status and whether AI mode is active.

## Project Structure

```
app/api/organize-assets/route.ts  — API endpoint
lib/ai-processor.ts               — Claude API integration
lib/mock-processor.ts             — Fallback without API key
lib/types.ts                      — TypeScript interfaces
lib/validators.ts                 — Input validation
lib/slug-generator.ts             — Slug generation utility
components/                       — React UI components
```

## Modes

| Mode | When | Description |
|------|------|-------------|
| **AI Mode** | `ANTHROPIC_API_KEY` is set | Real AI classification via Claude |
| **Mock Mode** | No API key | Rule-based classification, still fully functional |

## Requirements

- Node.js 18+
- npm 9+
- (Optional) Anthropic API key
```

---

## 15. REPORT.md CONTENT

### TASK 20 — Create REPORT.md

```markdown
# REPORT — AI 3D Asset Organizer

## What I Built

A fullstack Next.js app that automates 3D project asset organization using AI.  
The tool takes unstructured asset name lists and outputs:
- AI-powered category classification
- Standardized file slugs following naming conventions
- Structured project metadata as JSON
- Warnings for naming issues
- Organization recommendations

## Technical Decisions

### Why Next.js 14 (App Router)?
One codebase for frontend and API. No need for a separate Express server. The API route (`/api/organize-assets`) lives alongside the UI — simpler to deploy, easier to review.

### Why TypeScript strict mode?
The core of this tool is data transformation. Strict types prevent silent bugs when parsing AI responses or building slugs. `OrganizeResult`, `ClassifiedAsset`, and `ProjectWarning` are all fully typed.

### Why a Fallback Mock?
The reviewer needs to run this without an API key. The mock uses deterministic keyword rules — the same architecture as the AI path, just without the LLM call. It produces realistic output including warnings and recommendations.

### AI Prompt Design
The system prompt explicitly instructs Claude to return only JSON, with no markdown, no explanation. The user prompt includes the full expected schema inline. The response is cleaned of accidental markdown fences before parsing.

## What I Learned / Would Improve

- **Version tracking**: Currently all slugs use `v01`. A production version would track existing assets and auto-increment.
- **Batch processing**: Large projects (200+ assets) would benefit from chunked API calls.
- **Export**: Adding CSV/JSON download would make this more useful in real workflows.
- **Confidence scoring**: The AI returns confidence levels — these could drive a "review queue" UI for low-confidence classifications.

## AI Usage Disclosure

AI (Claude via Anthropic API) is used:
- In production mode: for asset classification, slug validation, warning detection, and recommendation generation
- In mock mode: replaced with keyword-matching rules that mirror the AI logic

AI was NOT used to write this codebase. The architecture, types, validation, and slug logic were designed and implemented by the developer.
```

---

## 16. TEST CASES

### TASK 21 — Manual test cases (verify all pass before submission)

#### Test Case 1: Happy path with API key

Input:
```json
{
  "projectName": "Sunrise Showroom HCMC",
  "projectType": "showroom",
  "rawAssets": "lobby panorama scan\nmeeting room 1\nkitchen area\nbedroom master\ntechnical room\nreception desk\nbathroom scan\nfloor 2 corridor"
}
```

Expected:
- `totalAssets: 8`
- `lobby panorama scan` → `public_area`, slug contains `showroom_public`
- `technical room` → `technical_area`
- `floor 2 corridor` → `circulation_area`
- At least 2 warnings
- At least 2 recommendations
- Valid JSON returned

#### Test Case 2: Mock mode (no API key)

Same input, `ANTHROPIC_API_KEY` not set.  
Expected: identical structure, `processedBy: "mock"`

#### Test Case 3: Validation — empty fields

```json
{ "projectName": "", "projectType": "office", "rawAssets": "" }
```
Expected: HTTP 422, errors object with `projectName` and `rawAssets` messages

#### Test Case 4: Validation — single asset

```json
{ "projectName": "Test", "projectType": "office", "rawAssets": "lobby" }
```
Expected: HTTP 422, `rawAssets` error "at least 2 assets"

#### Test Case 5: GET /api/organize-assets

Expected:
```json
{ "endpoint": "POST /api/organize-assets", "status": "ok", "aiEnabled": false, "version": "1.0.0" }
```

#### Test Case 6: UI — Load example button

Click "Load example" → form fills with "Sunrise Showroom", "showroom", and 8 assets.  
Click "Analyze Assets" → results render with table, warnings, JSON.

#### Test Case 7: UI — Error state

Temporarily break the API URL in fetch call → error banner shows with message.

---

## 17. FINAL CHECKLIST (run before submission)

### TASK 22 — Verify all items

**Functionality**
- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts without errors
- [ ] Form loads at http://localhost:3000
- [ ] "Load example" fills form correctly
- [ ] Submit with empty fields shows inline validation errors
- [ ] Submit with valid data shows results (mock mode or AI mode)
- [ ] Results table shows all assets with category, slug, confidence
- [ ] Warnings section shows (if any warnings)
- [ ] Recommendations section shows 2–3 items
- [ ] JSON metadata block renders and "Copy JSON" works
- [ ] API mode badge shows "AI Processed" or "Mock Mode"
- [ ] `GET /api/organize-assets` returns status JSON

**Code Quality**
- [ ] `npm run type-check` passes with zero errors
- [ ] No `any` types without comment explaining why
- [ ] All files have correct paths matching directory structure
- [ ] `.env.example` has correct variable names
- [ ] `.env.local` is NOT committed (in .gitignore)

**Documentation**
- [ ] `README.md` has working install instructions
- [ ] `README.md` explains mock mode vs AI mode
- [ ] `REPORT.md` explains decisions made
- [ ] `REPORT.md` mentions AI usage disclosure

**Edge Cases**
- [ ] Very long asset name (50+ chars) — doesn't break UI
- [ ] Asset with special characters — warning generated
- [ ] All assets in same category — no crash
- [ ] API key wrong/expired — error state shown in UI

---

## 18. .gitignore

### TASK 23 — Create .gitignore

```
# dependencies
node_modules/
.pnp
.pnp.js

# Next.js
.next/
out/

# environment (NEVER commit)
.env.local
.env.*.local

# misc
.DS_Store
*.pem
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# TypeScript
*.tsbuildinfo
next-env.d.ts
```

---

## 19. EXECUTION ORDER SUMMARY

Execute tasks in this exact order:

| # | Task | File |
|---|------|------|
| 1 | Types | `lib/types.ts` |
| 2 | Validators | `lib/validators.ts` |
| 3 | Slug Generator | `lib/slug-generator.ts` |
| 4 | Mock Processor | `lib/mock-processor.ts` |
| 5 | AI Processor | `lib/ai-processor.ts` |
| 6 | API Route | `app/api/organize-assets/route.ts` |
| 7 | WarningsList | `components/WarningsList.tsx` |
| 8 | ResultsTable | `components/ResultsTable.tsx` |
| 9 | MetadataPreview | `components/MetadataPreview.tsx` |
| 10 | AssetOrganizerForm | `components/AssetOrganizerForm.tsx` |
| 11 | Page | `app/page.tsx` |
| 12 | Layout | `app/layout.tsx` |
| 13 | Global CSS | `app/globals.css` |
| 14 | package.json | `package.json` |
| 15 | next.config.js | `next.config.js` |
| 16 | tsconfig.json | `tsconfig.json` |
| 17 | tailwind.config.ts | `tailwind.config.ts` |
| 18 | .env.example | `.env.example` |
| 19 | README.md | `README.md` |
| 20 | REPORT.md | `REPORT.md` |
| 21 | Test all cases | Manual verification |
| 22 | Checklist | Final review |
| 23 | .gitignore | `.gitignore` |

---

## 20. NOTES FOR CODEX

- Do not add extra dependencies not listed in package.json
- Do not use `any` without justification
- The `@anthropic-ai/sdk` import in `ai-processor.ts` requires the package from package.json
- `'use client'` is only needed in `AssetOrganizerForm.tsx` (it uses `useState`)
- All other components can be server components (no `'use client'`)
- The API route (`route.ts`) is always server-side — never add `'use client'` there
- Tailwind classes must use only standard utility classes (no custom config needed)
- Do not add `postcss.config.js` — Next.js 14 handles PostCSS automatically with Tailwind
```
