import { OrganizeRequest, ProjectType } from './types';

const VALID_PROJECT_TYPES: ProjectType[] = [
  'apartment',
  'office',
  'showroom',
  'exhibition',
  'museum',
  'retail',
  'custom'
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

  if (
    !req.projectName ||
    typeof req.projectName !== 'string' ||
    req.projectName.trim().length === 0
  ) {
    errors.projectName = 'Project name is required';
  } else if (req.projectName.trim().length < 2) {
    errors.projectName = 'Project name must be at least 2 characters';
  }

  if (!req.projectType || !VALID_PROJECT_TYPES.includes(req.projectType as ProjectType)) {
    errors.projectType = 'Please select a valid project type';
  }

  if (!req.rawAssets || typeof req.rawAssets !== 'string' || req.rawAssets.trim().length === 0) {
    errors.rawAssets = 'Asset list is required';
  } else {
    const lines = req.rawAssets
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

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
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'));
}
