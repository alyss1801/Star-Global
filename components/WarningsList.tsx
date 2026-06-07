import { ProjectWarning } from '@/lib/types';

interface WarningsListProps {
  warnings: ProjectWarning[];
  recommendations: string[];
}

const WARNING_LABELS: Record<ProjectWarning['warningType'], string> = {
  ambiguous_name: 'Ambiguous name',
  duplicate_likely: 'Potential duplicate',
  missing_floor_info: 'Missing floor info',
  not_following_convention: 'Naming convention issue',
  missing_asset_type: 'Missing asset type'
};

export function WarningsList({ warnings, recommendations }: WarningsListProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <section className="animate-fade-in-section space-y-3" style={{ animationDelay: '120ms' }}>
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Warnings</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Potential issues detected in the submitted asset list.</p>
        </div>

        {warnings.length === 0 ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
            No warnings detected. The asset list already follows a clean enough structure.
          </div>
        ) : (
          <ul className="space-y-3">
            {warnings.map((warning, index) => (
              <li
                key={`${warning.assetName}-${warning.warningType}-${index}`}
                className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/70 dark:bg-amber-950/30"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                    {WARNING_LABELS[warning.warningType]}
                  </span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-gray-900 dark:text-amber-300">
                    {warning.assetName}
                  </span>
                </div>
                <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">{warning.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="animate-fade-in-section space-y-3" style={{ animationDelay: '180ms' }}>
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Recommendations</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Operational improvements suggested for future uploads.</p>
        </div>

        <ul className="space-y-3">
          {recommendations.map((recommendation, index) => (
            <li
              key={`${recommendation}-${index}`}
              className="rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-900/70 dark:bg-sky-950/20"
            >
              <p className="text-sm text-sky-900 dark:text-sky-200">{recommendation}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
