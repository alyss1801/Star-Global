import { AssetCategory, ProjectType } from './types';

const CATEGORY_ABBREVIATIONS: Record<AssetCategory, string> = {
  public_area: 'public',
  private_area: 'private',
  service_area: 'service',
  technical_area: 'tech',
  circulation_area: 'circ',
  other: 'other'
};

export function detectAssetType(name: string): string {
  const lower = name.toLowerCase();

  if (lower.includes('panorama') || lower.includes('pano')) {
    return 'panorama';
  }
  if (lower.includes('scan')) {
    return 'scan';
  }
  if (lower.includes('photo') || lower.includes('image')) {
    return 'photo';
  }
  if (lower.includes('video')) {
    return 'video';
  }
  if (lower.includes('model') || lower.includes('3d')) {
    return 'model';
  }
  if (lower.includes('plan') || lower.includes('map')) {
    return 'plan';
  }
  if (lower.includes('render')) {
    return 'render';
  }

  return 'asset';
}

export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function generateSlug(
  projectType: ProjectType,
  category: AssetCategory,
  assetName: string,
  version = 'v01'
): string {
  const catAbbr = CATEGORY_ABBREVIATIONS[category];
  const assetType = detectAssetType(assetName);
  const roomName = assetName
    .toLowerCase()
    .replace(/panorama|pano|scan|photo|image|video|model|3d|plan|map|render/gi, '')
    .trim();
  const roomSlug = toSlug(roomName) || 'area';
  const projectSlug = toSlug(projectType);

  return `${projectSlug}_${catAbbr}-${roomSlug}_${assetType}_${version}`;
}
