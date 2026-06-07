import { AssetCategory, OrganizeResult } from '@/lib/types';

interface CategoryChartProps {
  categories: OrganizeResult['categories'];
  totalAssets: number;
}

const CATEGORY_CONFIG: Record<AssetCategory, { label: string; color: string }> = {
  public_area: { label: 'Public Area', color: '#10b981' },
  private_area: { label: 'Private Area', color: '#8b5cf6' },
  service_area: { label: 'Service Area', color: '#f59e0b' },
  technical_area: { label: 'Technical Area', color: '#ef4444' },
  circulation_area: { label: 'Circulation Area', color: '#3b82f6' },
  other: { label: 'Other', color: '#9ca3af' }
};

export function CategoryChart({ categories, totalAssets }: CategoryChartProps) {
  const entries = (Object.entries(categories) as [AssetCategory, number][])
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="animate-fade-in-section" style={{ animationDelay: '100ms' }}>
      <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Category Breakdown</h3>
      <div className="space-y-3">
        {entries.map(([category, count], index) => {
          const config = CATEGORY_CONFIG[category];
          const percentage = Math.round((count / totalAssets) * 100);

          return (
            <div key={category} className="animate-slide-in" style={{ animationDelay: `${index * 80}ms` }}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{config.label}</span>
                <span className="font-mono text-xs text-gray-400 dark:text-gray-500">
                  {count} asset{count !== 1 ? 's' : ''} - {percentage}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="h-2 rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: config.color,
                    transitionDelay: `${index * 80 + 300}ms`
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
        {entries.map(([category]) => {
          const config = CATEGORY_CONFIG[category];
          return (
            <span key={category} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-500">
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: config.color }} />
              {config.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
