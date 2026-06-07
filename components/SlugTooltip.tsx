'use client';

import { useState } from 'react';

interface SlugTooltipProps {
  slug: string;
}

function parseSlug(slug: string) {
  const parts = slug.split('_');
  if (parts.length < 4) {
    return null;
  }

  const [projectType, categoryRoom, assetType, version] = parts;
  const [category, ...roomParts] = categoryRoom.split('-');
  const room = roomParts.join('-');

  return [
    {
      part: projectType,
      label: 'Project type',
      color: 'text-violet-600 dark:text-violet-400 border-violet-300 dark:border-violet-700'
    },
    {
      part: category,
      label: 'Category',
      color: 'text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700'
    },
    {
      part: room,
      label: 'Room / area',
      color: 'text-sky-600 dark:text-sky-400 border-sky-300 dark:border-sky-700'
    },
    {
      part: assetType,
      label: 'Asset type',
      color: 'text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700'
    },
    {
      part: version,
      label: 'Version',
      color: 'text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600'
    }
  ];
}

export function SlugTooltip({ slug }: SlugTooltipProps) {
  const [show, setShow] = useState(false);
  const parsed = parseSlug(slug);

  return (
    <div className="relative inline-block w-full">
      <code
        className="block cursor-help break-all rounded-md bg-gray-100 px-2 py-1 text-xs font-mono text-indigo-600 dark:bg-gray-800 dark:text-indigo-400"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {slug}
      </code>
      {show && parsed ? (
        <div className="absolute bottom-full left-0 z-50 mb-2 w-max max-w-xs rounded-xl border border-gray-200 bg-white p-3 shadow-xl dark:border-gray-700 dark:bg-gray-900">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Slug anatomy
          </p>
          <div className="space-y-1.5">
            {parsed.map((part, index) => (
              <div key={index} className="flex items-center gap-2">
                <code className={`rounded border bg-transparent px-1.5 py-0.5 text-xs font-mono ${part.color}`}>
                  {part.part || '-'}
                </code>
                <span className="text-xs text-gray-400 dark:text-gray-500">{part.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 border-t border-gray-100 pt-2 dark:border-gray-800">
            <p className="break-all font-mono text-xs text-gray-300 dark:text-gray-600">{slug}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
