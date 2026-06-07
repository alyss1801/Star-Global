import { ClassifiedAsset } from '@/lib/types';
import { SlugTooltip } from '@/components/SlugTooltip';

interface ResultsTableProps {
  assets: ClassifiedAsset[];
}

const CATEGORY_COLORS: Record<string, { badge: string; dot: string }> = {
  public_area: {
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    dot: 'bg-emerald-500'
  },
  private_area: {
    badge: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
    dot: 'bg-violet-500'
  },
  service_area: {
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    dot: 'bg-amber-500'
  },
  technical_area: {
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    dot: 'bg-red-500'
  },
  circulation_area: {
    badge: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
    dot: 'bg-sky-500'
  },
  other: {
    badge: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    dot: 'bg-gray-400'
  }
};

const CONFIDENCE_CONFIG: Record<string, { color: string; label: string; width: string }> = {
  high: { color: 'bg-emerald-500', label: 'High', width: 'w-full' },
  medium: { color: 'bg-amber-500', label: 'Medium', width: 'w-2/3' },
  low: { color: 'bg-red-500', label: 'Low', width: 'w-1/3' }
};

export function ResultsTable({ assets }: ResultsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800/60">
            <th className="w-8 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              #
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Original Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Category
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Generated Slug
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Confidence
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {assets.map((asset, index) => {
            const categoryConfig = CATEGORY_COLORS[asset.category] ?? CATEGORY_COLORS.other;
            const confidenceConfig = CONFIDENCE_CONFIG[asset.confidence] ?? CONFIDENCE_CONFIG.low;

            return (
              <tr
                key={`${asset.slug}-${index}`}
                className="group animate-slide-in transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="px-4 py-3 font-mono text-xs text-gray-300 dark:text-gray-600">
                  {String(index + 1).padStart(2, '0')}
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium text-gray-800 dark:text-gray-100">{asset.original}</span>
                  {asset.notes ? (
                    <p className="mt-0.5 text-xs italic text-gray-400 dark:text-gray-500">{asset.notes}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${categoryConfig.badge}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${categoryConfig.dot}`} />
                    {asset.category.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <SlugTooltip slug={asset.slug} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className={`h-1.5 rounded-full ${confidenceConfig.color} ${confidenceConfig.width} transition-all duration-500`}
                        style={{ transitionDelay: `${index * 50 + 200}ms` }}
                      />
                    </div>
                    <span className="w-12 text-xs text-gray-500 dark:text-gray-400">{confidenceConfig.label}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
