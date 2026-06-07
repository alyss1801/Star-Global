import {
  AssetCategory,
  ClassifiedAsset,
  OrganizeRequest,
  OrganizeResult,
  ProjectWarning
} from './types';
import { generateSlug, detectAssetType } from './slug-generator';
import { parseAssetLines } from './validators';

const CATEGORY_RULES: Array<{ keywords: string[]; category: AssetCategory }> = [
  {
    keywords: [
      'lobby',
      'reception',
      'entrance',
      'foyer',
      'showroom floor',
      'gallery',
      'exhibition hall',
      'retail floor',
      'shop floor'
    ],
    category: 'public_area'
  },
  {
    keywords: [
      'bedroom',
      'master',
      'private office',
      'vip',
      'suite',
      'changing room',
      'dressing'
    ],
    category: 'private_area'
  },
  {
    keywords: [
      'kitchen',
      'bathroom',
      'toilet',
      'restroom',
      'wc',
      'pantry',
      'break room',
      'canteen'
    ],
    category: 'service_area'
  },
  {
    keywords: [
      'technical',
      'server',
      'electrical',
      'mechanical',
      'hvac',
      'plant room',
      'utility',
      'pump',
      'generator'
    ],
    category: 'technical_area'
  },
  {
    keywords: [
      'corridor',
      'hallway',
      'staircase',
      'elevator',
      'lift',
      'landing',
      'passage',
      'walkway',
      'floor'
    ],
    category: 'circulation_area'
  },
  {
    keywords: ['meeting', 'conference', 'boardroom', 'office', 'workspace', 'workstation'],
    category: 'public_area'
  }
];

const EMPTY_CATEGORY_COUNTS: Record<AssetCategory, number> = {
  public_area: 0,
  private_area: 0,
  service_area: 0,
  technical_area: 0,
  circulation_area: 0,
  other: 0
};

function classifyAsset(name: string): AssetCategory {
  const lower = name.toLowerCase();

  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((keyword) => lower.includes(keyword))) {
      return rule.category;
    }
  }

  return 'other';
}

function detectWarnings(classified: ClassifiedAsset[]): ProjectWarning[] {
  const warnings: ProjectWarning[] = [];
  const slugsSeen = new Map<string, string>();

  for (const asset of classified) {
    const normalizedName = asset.original.toLowerCase();

    if (asset.original.split(' ').length <= 1 || normalizedName.length < 5) {
      warnings.push({
        assetName: asset.original,
        warningType: 'ambiguous_name',
        message: `"${asset.original}" is too vague. Consider adding room type or floor info.`
      });
    }

    if (
      asset.category === 'circulation_area' &&
      !normalizedName.includes('floor') &&
      !normalizedName.includes('level') &&
      !normalizedName.match(/f[0-9]|b[0-9]|[0-9]f/)
    ) {
      warnings.push({
        assetName: asset.original,
        warningType: 'missing_floor_info',
        message: `"${asset.original}" is a circulation area but has no floor indicator (e.g., floor-1, f02).`
      });
    }

    if (slugsSeen.has(asset.slug)) {
      warnings.push({
        assetName: asset.original,
        warningType: 'duplicate_likely',
        message: `"${asset.original}" generates the same slug as "${slugsSeen.get(asset.slug)}". These may be duplicates.`
      });
    } else {
      slugsSeen.set(asset.slug, asset.original);
    }

    if (/[A-Z]/.test(asset.original) || /[^a-zA-Z0-9\s\-_/]/.test(asset.original)) {
      warnings.push({
        assetName: asset.original,
        warningType: 'not_following_convention',
        message: `"${asset.original}" contains uppercase or special characters. Use lowercase and spaces only.`
      });
    }

    if (detectAssetType(asset.original) === 'asset') {
      warnings.push({
        assetName: asset.original,
        warningType: 'missing_asset_type',
        message: `"${asset.original}" does not clearly specify an asset type like scan, panorama, model, or photo.`
      });
    }
  }

  return warnings;
}

function mapDetectedIssues(warnings: ProjectWarning[]): string[] {
  const issueMap: Record<ProjectWarning['warningType'], string> = {
    ambiguous_name: 'Some asset names are too vague for reliable classification',
    duplicate_likely: 'Potential duplicate assets detected',
    missing_floor_info: 'Floor or level information missing from some assets',
    not_following_convention: 'Some names use uppercase or special characters',
    missing_asset_type: 'Asset type not specified in some names'
  };

  return [...new Set(warnings.map((warning) => warning.warningType))].map(
    (warningType) => issueMap[warningType]
  );
}

export async function processMock(request: OrganizeRequest): Promise<OrganizeResult> {
  const assetLines = parseAssetLines(request.rawAssets);

  const assets: ClassifiedAsset[] = assetLines.map((line, index) => {
    const category = classifyAsset(line);

    return {
      original: line,
      category,
      slug: generateSlug(request.projectType, category, line, `v${String(index + 1).padStart(2, '0')}`),
      confidence: category === 'other' ? 'low' : 'high',
      notes:
        category === 'other'
          ? 'Could not determine category from name. Please review.'
          : undefined
    };
  });

  const categories = assets.reduce<Record<AssetCategory, number>>((acc, asset) => {
    acc[asset.category] += 1;
    return acc;
  }, { ...EMPTY_CATEGORY_COUNTS });

  const warnings = detectWarnings(assets);

  return {
    projectName: request.projectName,
    projectType: request.projectType,
    totalAssets: assets.length,
    assets,
    categories,
    namingConvention: '{projectType}_{category}-{room}_{assetType}_v{nn}',
    warnings,
    recommendations: [
      `Add floor or level indicators to all asset names for multi-floor ${request.projectType} projects.`,
      'Standardize asset type suffixes before import: use panorama, scan, model, or photo consistently.',
      'Store assets in category-based folders so the file system mirrors the classification output.'
    ],
    detectedIssues: mapDetectedIssues(warnings),
    processedBy: 'mock',
    modelUsed: 'mock-rules-v1.0'
  };
}
