'use client';

import { useEffect, useState } from 'react';
import { CategoryChart } from '@/components/CategoryChart';
import { ExportButtons } from '@/components/ExportButtons';
import { MetadataPreview } from '@/components/MetadataPreview';
import { ResultsSkeleton } from '@/components/ResultsSkeleton';
import { ResultsTable } from '@/components/ResultsTable';
import { ThemeToggle } from '@/components/ThemeToggle';
import { WarningsList } from '@/components/WarningsList';
import { ApiErrorResponse, OrganizeRequest, OrganizeResult, ProjectType } from '@/lib/types';
import { validateOrganizeRequest } from '@/lib/validators';

const PROJECT_TYPES: Array<{ value: ProjectType; label: string; desc: string }> = [
  { value: 'apartment', label: 'Apartment', desc: 'Residential units' },
  { value: 'office', label: 'Office', desc: 'Workspaces and meeting rooms' },
  { value: 'showroom', label: 'Showroom', desc: 'Product display spaces' },
  { value: 'exhibition', label: 'Exhibition', desc: 'Events and expo spaces' },
  { value: 'museum', label: 'Museum', desc: 'Cultural institutions' },
  { value: 'retail', label: 'Retail', desc: 'Shops and stores' },
  { value: 'custom', label: 'Custom', desc: 'Other project types' }
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

function isApiErrorResponse(data: OrganizeResult | ApiErrorResponse): data is ApiErrorResponse {
  return 'error' in data;
}

export function AssetOrganizerForm() {
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState<ProjectType | ''>('');
  const [rawAssets, setRawAssets] = useState('');
  const [result, setResult] = useState<OrganizeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [assetCount, setAssetCount] = useState(0);

  useEffect(() => {
    setAssetCount(
      rawAssets
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean).length
    );
  }, [rawAssets]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        void handleSubmit();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [projectName, projectType, rawAssets]);

  function validateForm(): boolean {
    const payload: Partial<OrganizeRequest> = {
      projectName,
      projectType: projectType || undefined,
      rawAssets
    };

    const validation = validateOrganizeRequest(payload);
    setFormErrors(validation.errors);
    return validation.valid;
  }

  async function handleSubmit() {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setApiError(null);
    setResult(null);

    try {
      const response = await fetch('/api/organize-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName, projectType, rawAssets })
      });

      const data = (await response.json()) as OrganizeResult | ApiErrorResponse;

      if (!response.ok) {
        if (isApiErrorResponse(data)) {
          let message = data.details || data.error || `Request failed (${response.status})`;
          if (typeof message === 'string' && message.startsWith('{')) {
            try {
              message = Object.values(JSON.parse(message) as Record<string, string>).join(' ');
            } catch {
              message = data.details || data.error;
            }
          }
          setApiError(message || `Request failed (${response.status})`);
          return;
        }

        setApiError(`Request failed (${response.status})`);
        return;
      }

      setResult(data as OrganizeResult);
    } catch {
      setApiError('Network error. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setApiError(null);
    setFormErrors({});
  }

  function handleLoadExample() {
    setProjectName('Sunrise Showroom HCMC');
    setProjectType('showroom');
    setRawAssets(EXAMPLE_ASSETS);
    setFormErrors({});
    setResult(null);
    setApiError(null);
  }

  function inputClass(error?: string) {
    return `w-full rounded-xl border px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 ${
      error
        ? 'border-red-400 dark:border-red-500'
        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
    }`;
  }

  return (
    <div className="min-h-screen bg-gray-50 transition-colors dark:bg-gray-950">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-sm">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.8}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-base font-bold leading-tight text-gray-900 dark:text-white">
                  AI 3D Asset Organizer
                </h1>
                <p className="text-xs text-gray-400 dark:text-gray-500">Classify · Rename · Organize</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[420px,1fr]">
          <aside>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-colors dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Project Input</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Paste raw asset names and let the pipeline normalize them into structured metadata.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLoadExample}
                  className="rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:border-indigo-900 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
                >
                  Load example
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Project name</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(event) => setProjectName(event.target.value)}
                    placeholder="e.g. Sunrise Showroom HCMC"
                    className={inputClass(formErrors.projectName)}
                  />
                  {formErrors.projectName ? (
                    <p className="mt-1.5 text-xs text-red-500">{formErrors.projectName}</p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Project type</label>
                  <select
                    value={projectType}
                    onChange={(event) => setProjectType(event.target.value as ProjectType)}
                    className={inputClass(formErrors.projectType)}
                  >
                    <option value="">Select project type...</option>
                    {PROJECT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    {projectType ? PROJECT_TYPES.find((type) => type.value === projectType)?.desc : 'Pick the closest project context for better classification.'}
                  </p>
                  {formErrors.projectType ? (
                    <p className="mt-1.5 text-xs text-red-500">{formErrors.projectType}</p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Asset list <span className="text-gray-400 dark:text-gray-500">(one per line)</span>
                  </label>
                  <textarea
                    value={rawAssets}
                    onChange={(event) => setRawAssets(event.target.value)}
                    rows={12}
                    placeholder={'lobby panorama scan\nmeeting room 1\nkitchen area'}
                    className={inputClass(formErrors.rawAssets)}
                  />
                  <div className="mt-1.5 flex items-center justify-between">
                    <p className="text-xs text-gray-400 dark:text-gray-500">{assetCount} assets entered</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Ctrl/⌘ + Enter to submit</p>
                  </div>
                  {formErrors.rawAssets ? (
                    <p className="mt-1.5 text-xs text-red-500">{formErrors.rawAssets}</p>
                  ) : null}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => void handleSubmit()}
                    disabled={loading}
                    className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
                  >
                    {loading ? 'Analyzing...' : 'Analyze Assets'}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                  >
                    Reset
                  </button>
                </div>

                {apiError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                    <span className="font-semibold">Error:</span> {apiError}
                  </div>
                ) : null}
              </div>
            </div>
          </aside>

          <section className="space-y-6">
            {loading ? <ResultsSkeleton /> : null}

            {!loading && result ? (
              <>
                <div
                  className="animate-fade-in-section rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                  style={{ animationDelay: '40ms' }}
                >
                  <div className="flex flex-wrap items-start gap-5">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500">Project</p>
                      <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{result.projectName}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500">Type</p>
                      <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{result.projectType}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500">Total Assets</p>
                      <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{result.totalAssets}</p>
                    </div>
                    <div className="ml-auto flex flex-col items-end gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          result.processedBy === 'ai'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                        }`}
                      >
                        {result.processedBy === 'ai' ? 'AI Processed' : 'Mock Mode'}
                      </span>
                      <ExportButtons result={result} />
                    </div>
                  </div>
                  {result.processingTimeMs ? (
                    <p className="mt-4 w-full font-mono text-xs text-gray-400 dark:text-gray-500">
                      Processed in {(result.processingTimeMs / 1000).toFixed(2)}s
                      {result.modelUsed ? (
                        <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                          {result.modelUsed}
                        </span>
                      ) : null}
                    </p>
                  ) : null}
                </div>

                <div className="animate-fade-in-section rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <ResultsTable assets={result.assets} />
                </div>

                <div className="animate-fade-in-section rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <CategoryChart categories={result.categories} totalAssets={result.totalAssets} />
                </div>

                <div className="animate-fade-in-section rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <WarningsList warnings={result.warnings} recommendations={result.recommendations} />
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <MetadataPreview result={result} />
                </div>
              </>
            ) : null}

            {!loading && !result && !apiError ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white/60 py-20 text-center dark:border-gray-800 dark:bg-gray-900/50">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50">
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#6366f1" strokeWidth={1.5}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Enter project details and asset names to begin analysis
                </p>
                <p className="mt-1 text-xs text-gray-300 dark:text-gray-600">
                  Or{' '}
                  <button
                    type="button"
                    onClick={handleLoadExample}
                    className="text-indigo-400 underline hover:text-indigo-600"
                  >
                    load the example
                  </button>{' '}
                  to see the full workflow
                </p>
              </div>
            ) : null}
          </section>
        </div>
      </main>
    </div>
  );
}
