'use client';

import { useState } from 'react';
import { OrganizeResult } from '@/lib/types';

interface MetadataPreviewProps {
  result: OrganizeResult;
}

function syntaxHighlight(json: string): string {
  return json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let style = 'color:#a5d6ff';
        if (/^"/.test(match)) {
          style = /:$/.test(match) ? 'color:#79b8ff' : 'color:#9ecbff';
        } else if (/true|false/.test(match)) {
          style = 'color:#85e89d';
        } else if (/null/.test(match)) {
          style = 'color:#f97583';
        }
        return `<span style="${style}">${match}</span>`;
      }
    );
}

export function MetadataPreview({ result }: MetadataPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const metadata = {
    projectName: result.projectName,
    projectType: result.projectType,
    totalAssets: result.totalAssets,
    categories: result.categories,
    namingConvention: result.namingConvention,
    detectedIssues: result.detectedIssues,
    recommendations: result.recommendations,
    processedBy: result.processedBy,
    processingTimeMs: result.processingTimeMs,
    modelUsed: result.modelUsed
  };

  const fullJson = JSON.stringify(result, null, 2);
  const previewJson = JSON.stringify(metadata, null, 2);
  const activeJson = expanded ? fullJson : previewJson;

  async function handleCopy() {
    await navigator.clipboard.writeText(activeJson);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="animate-fade-in-section" style={{ animationDelay: '200ms' }}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Project Metadata</h3>
          <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            JSON
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="text-xs text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            {expanded ? 'Show summary' : 'Show full result'}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-xl border border-gray-800 dark:border-gray-700">
        <div className="flex items-center gap-1.5 border-b border-gray-700 bg-gray-800 px-4 py-2 dark:bg-gray-900">
          <div className="h-3 w-3 rounded-full bg-red-500 opacity-80" />
          <div className="h-3 w-3 rounded-full bg-yellow-500 opacity-80" />
          <div className="h-3 w-3 rounded-full bg-green-500 opacity-80" />
          <span className="ml-2 font-mono text-xs text-gray-500">
            {result.projectName.toLowerCase().replace(/\s+/g, '-')}-metadata.json
          </span>
        </div>
        <pre
          className="max-h-96 overflow-x-auto overflow-y-auto bg-gray-900 p-5 text-xs leading-relaxed text-gray-300"
          dangerouslySetInnerHTML={{ __html: syntaxHighlight(activeJson) }}
        />
      </div>
    </div>
  );
}
