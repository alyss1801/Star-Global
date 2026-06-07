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
  original: string;
}

export interface ClassifiedAsset {
  original: string;
  category: AssetCategory;
  slug: string;
  confidence: 'high' | 'medium' | 'low';
  notes?: string;
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
  categories: Record<AssetCategory, number>;
  namingConvention: string;
  warnings: ProjectWarning[];
  recommendations: string[];
  detectedIssues: string[];
  processedBy: 'ai' | 'mock';
  processingTimeMs?: number;
  modelUsed?: string;
}

export interface OrganizeRequest {
  projectName: string;
  projectType: ProjectType;
  rawAssets: string;
}

export interface ApiErrorResponse {
  error: string;
  details?: string;
}
