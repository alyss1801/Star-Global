'use client';

import { useState } from 'react';
import { OrganizeResult } from '@/lib/types';

interface ExportButtonsProps {
  result: OrganizeResult;
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function toCSV(result: OrganizeResult): string {
  const headers = ['#', 'Original Name', 'Category', 'Generated Slug', 'Confidence', 'Notes'];
  const rows = result.assets.map((asset, index) => [
    index + 1,
    `"${asset.original.replace(/"/g, '""')}"`,
    asset.category,
    asset.slug,
    asset.confidence,
    `"${(asset.notes ?? '').replace(/"/g, '""')}"`
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

export function ExportButtons({ result }: ExportButtonsProps) {
  const [csvDone, setCsvDone] = useState(false);
  const [jsonDone, setJsonDone] = useState(false);
  const baseName = result.projectName.toLowerCase().replace(/\s+/g, '-');

  function exportCSV() {
    downloadFile(toCSV(result), `${baseName}-assets.csv`, 'text/csv;charset=utf-8;');
    setCsvDone(true);
    window.setTimeout(() => setCsvDone(false), 2000);
  }

  function exportJSON() {
    downloadFile(JSON.stringify(result, null, 2), `${baseName}-metadata.json`, 'application/json');
    setJsonDone(true);
    window.setTimeout(() => setJsonDone(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="mr-1 text-xs text-gray-400 dark:text-gray-500">Export:</span>
      <button
        type="button"
        onClick={exportCSV}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:border-indigo-400 hover:text-indigo-600 dark:border-gray-700 dark:text-gray-400 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
      >
        {csvDone ? (
          <>
            <CheckIcon />
            Downloaded!
          </>
        ) : (
          <>
            <TableIcon />
            CSV
          </>
        )}
      </button>
      <button
        type="button"
        onClick={exportJSON}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:border-indigo-400 hover:text-indigo-600 dark:border-gray-700 dark:text-gray-400 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
      >
        {jsonDone ? (
          <>
            <CheckIcon />
            Downloaded!
          </>
        ) : (
          <>
            <CodeIcon />
            JSON
          </>
        )}
      </button>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function TableIcon() {
  return (
    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 10h18M3 14h18M10 3v18M14 3v18M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6z"
      />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  );
}
