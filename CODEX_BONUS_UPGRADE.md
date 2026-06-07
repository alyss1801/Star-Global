# CODEX BONUS PROMPT — AI 3D Asset Organizer: WOW UPGRADE
> Chạy sau khi hoàn thành CODEX_MASTER_PROMPT.md đầy đủ.  
> Mỗi task dưới đây là một nâng cấp độc lập. Thực thi lần lượt, confirm từng bước.

---

## ⚠️ PREREQUISITE

Base project from `CODEX_MASTER_PROMPT.md` phải đã chạy được (`npm run dev` không lỗi) trước khi bắt đầu file này.

---

## 🎯 UPGRADE PHILOSOPHY

Base project làm đúng yêu cầu. Phần này làm project **nói lên rằng developer hiểu thực sự domain 3D digitization**, không chỉ code theo spec. Mỗi upgrade giải quyết một pain point thật sự của người dùng trong ngành.

Sau khi xong tất cả upgrade:
- Người chấm mở app → thấy UI đẹp có chiều sâu, không phải "form trắng Tailwind generic"
- Paste asset list → thấy kết quả animated xuất hiện từng dòng một, không phải "flash cả table một lúc"  
- Hover vào slug → thấy tooltip giải thích tại sao slug được gen như vậy
- Thấy category breakdown dạng visual chart, không chỉ là bảng chữ
- Export được CSV và JSON trong 1 click
- Thấy "confidence score" có màu sắc trực quan, không phải chữ high/medium/low khô khan
- Dùng được keyboard shortcut (Ctrl+Enter để submit)
- Trên mobile cũng dùng được

---

## UPGRADE 1 — Dark/Light Mode Toggle

### TASK B1 — Thêm ThemeProvider + Toggle

**Mục tiêu**: App phải có dark mode thật sự, không phải Tailwind `dark:` mà cần user cấu hình OS.

**Tạo file mới**: `components/ThemeToggle.tsx`

```typescript
// components/ThemeToggle.tsx
'use client';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initial = stored ?? preferred;
    setTheme(initial);
    document.documentElement.classList.toggle('dark', initial === 'dark');
  }, []);

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  return (
    <button
      onClick={toggle}
      className="w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
        </svg>
      ) : (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="5"/><path strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
      )}
    </button>
  );
}
```

**Sửa `tailwind.config.ts`**: thêm `darkMode: 'class'`

```typescript
import type { Config } from 'tailwindcss';
const config: Config = {
  darkMode: 'class',  // ← THÊM DÒNG NÀY
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: { extend: {} },
  plugins: []
};
export default config;
```

**Sửa `app/globals.css`**: thêm dark mode base styles

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --bg-primary: #ffffff;
    --bg-secondary: #f9fafb;
    --text-primary: #111827;
    --border-color: #e5e7eb;
  }
  .dark {
    --bg-primary: #0f1117;
    --bg-secondary: #1a1d27;
    --text-primary: #f3f4f6;
    --border-color: #2d3148;
  }
  body {
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    transition: background-color 0.2s, color 0.2s;
  }
}
```

**Sửa header trong `AssetOrganizerForm.tsx`**: thêm `ThemeToggle` vào header

```typescript
// Import ThemeToggle ở đầu file:
import { ThemeToggle } from './ThemeToggle';

// Trong phần header, thêm ThemeToggle:
<header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 backdrop-blur-sm">
  <div className="max-w-5xl mx-auto px-6 py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-lg font-bold shadow-sm">
          3D
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
            AI 3D Asset Organizer
          </h1>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Classify · Rename · Organize
          </p>
        </div>
      </div>
      <ThemeToggle />
    </div>
  </div>
</header>
```

**Cập nhật tất cả className** trong `AssetOrganizerForm.tsx`, `ResultsTable.tsx`, `WarningsList.tsx`, `MetadataPreview.tsx` — thêm dark: variants cho:
- `bg-white` → `bg-white dark:bg-gray-900`
- `bg-gray-50` → `bg-gray-50 dark:bg-gray-800`
- `border-gray-200` → `border-gray-200 dark:border-gray-700`
- `text-gray-800` → `text-gray-800 dark:text-gray-100`
- `text-gray-600` → `text-gray-600 dark:text-gray-400`
- `text-gray-500` → `text-gray-500 dark:text-gray-500`
- `text-gray-400` → `text-gray-400 dark:text-gray-600`
- Input/textarea: thêm `dark:bg-gray-800 dark:text-white dark:border-gray-600`
- Table: `bg-gray-50` header → `bg-gray-50 dark:bg-gray-800`

---

## UPGRADE 2 — Animated Streaming Results (Staggered Row Reveal)

### TASK B2 — Thêm animation cho kết quả

**Mục tiêu**: Khi kết quả xuất hiện, các row trong table không "bật" cùng lúc mà slide-in từng dòng với delay. Tạo cảm giác AI đang "xử lý và xuất kết quả" realtime.

**Sửa `app/globals.css`** — thêm animation keyframes:

```css
@keyframes slideInRow {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInSection {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-in {
  animation: slideInRow 0.25s ease-out forwards;
  opacity: 0;
}

.animate-fade-in-section {
  animation: fadeInSection 0.35s ease-out forwards;
  opacity: 0;
}

@keyframes pulse-bar {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.animate-thinking {
  animation: pulse-bar 1.2s ease-in-out infinite;
}
```

**Sửa `components/ResultsTable.tsx`** — thêm staggered animation:

```typescript
// components/ResultsTable.tsx
import { ClassifiedAsset } from '@/lib/types';

interface Props {
  assets: ClassifiedAsset[];
}

const CATEGORY_COLORS: Record<string, { badge: string; dot: string }> = {
  public_area:      { badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300', dot: 'bg-emerald-500' },
  private_area:     { badge: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',   dot: 'bg-violet-500' },
  service_area:     { badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',       dot: 'bg-amber-500' },
  technical_area:   { badge: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',               dot: 'bg-red-500' },
  circulation_area: { badge: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',               dot: 'bg-sky-500' },
  other:            { badge: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',              dot: 'bg-gray-400' },
};

const CONFIDENCE_CONFIG: Record<string, { color: string; label: string; width: string }> = {
  high:   { color: 'bg-emerald-500', label: 'High',   width: 'w-full' },
  medium: { color: 'bg-amber-500',   label: 'Medium', width: 'w-2/3' },
  low:    { color: 'bg-red-500',     label: 'Low',    width: 'w-1/3' },
};

export function ResultsTable({ assets }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800/60">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-8">#</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Original Name</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Generated Slug</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Confidence</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {assets.map((asset, i) => {
            const catConfig = CATEGORY_COLORS[asset.category] ?? CATEGORY_COLORS.other;
            const confConfig = CONFIDENCE_CONFIG[asset.confidence] ?? CONFIDENCE_CONFIG.low;
            return (
              <tr
                key={i}
                className="animate-slide-in hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <td className="px-4 py-3 text-gray-300 dark:text-gray-600 text-xs font-mono">{String(i + 1).padStart(2, '0')}</td>
                <td className="px-4 py-3">
                  <span className="font-medium text-gray-800 dark:text-gray-100">{asset.original}</span>
                  {asset.notes && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 italic">{asset.notes}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${catConfig.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${catConfig.dot}`}/>
                    {asset.category.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="group/slug relative">
                    <code className="text-xs font-mono bg-gray-100 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-md break-all">
                      {asset.slug}
                    </code>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${confConfig.color} ${confConfig.width} transition-all duration-500`} style={{ transitionDelay: `${i * 50 + 200}ms` }}/>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-12">{confConfig.label}</span>
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
```

---

## UPGRADE 3 — Category Breakdown Visual Chart

### TASK B3 — Thêm CategoryChart component

**Mục tiêu**: Thay vì chỉ hiển thị số đếm, hiển thị bar chart ngang trực quan cho breakdown theo category.

**Tạo `components/CategoryChart.tsx`**:

```typescript
// components/CategoryChart.tsx
import { AssetCategory, OrganizeResult } from '@/lib/types';

interface Props {
  categories: OrganizeResult['categories'];
  totalAssets: number;
}

const CATEGORY_CONFIG: Record<AssetCategory, { label: string; color: string; darkColor: string }> = {
  public_area:      { label: 'Public Area',      color: '#10b981', darkColor: '#34d399' },
  private_area:     { label: 'Private Area',     color: '#8b5cf6', darkColor: '#a78bfa' },
  service_area:     { label: 'Service Area',     color: '#f59e0b', darkColor: '#fbbf24' },
  technical_area:   { label: 'Technical Area',   color: '#ef4444', darkColor: '#f87171' },
  circulation_area: { label: 'Circulation Area', color: '#3b82f6', darkColor: '#60a5fa' },
  other:            { label: 'Other',            color: '#9ca3af', darkColor: '#6b7280' },
};

export function CategoryChart({ categories, totalAssets }: Props) {
  const entries = Object.entries(categories) as [AssetCategory, number][];
  const nonZero = entries.filter(([, count]) => count > 0).sort((a, b) => b[1] - a[1]);

  return (
    <div className="animate-fade-in-section" style={{ animationDelay: '100ms' }}>
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
        Category Breakdown
      </h3>
      <div className="space-y-3">
        {nonZero.map(([cat, count], i) => {
          const cfg = CATEGORY_CONFIG[cat];
          const pct = Math.round((count / totalAssets) * 100);
          return (
            <div key={cat} className="animate-slide-in" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{cfg.label}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                  {count} asset{count !== 1 ? 's' : ''} · {pct}%
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: cfg.color,
                    transitionDelay: `${i * 80 + 300}ms`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {/* Legend dots */}
      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        {nonZero.map(([cat]) => {
          const cfg = CATEGORY_CONFIG[cat];
          return (
            <span key={cat} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-500">
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: cfg.color }}/>
              {cfg.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
```

---

## UPGRADE 4 — One-Click Export (CSV + JSON)

### TASK B4 — Thêm ExportButtons component

**Mục tiêu**: Người dùng cần dùng kết quả trong Excel hoặc copy JSON vào hệ thống. Một click là xong.

**Tạo `components/ExportButtons.tsx`**:

```typescript
// components/ExportButtons.tsx
'use client';
import { useState } from 'react';
import { OrganizeResult } from '@/lib/types';

interface Props {
  result: OrganizeResult;
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function toCSV(result: OrganizeResult): string {
  const headers = ['#', 'Original Name', 'Category', 'Generated Slug', 'Confidence', 'Notes'];
  const rows = result.assets.map((a, i) => [
    i + 1,
    `"${a.original.replace(/"/g, '""')}"`,
    a.category,
    a.slug,
    a.confidence,
    `"${(a.notes ?? '').replace(/"/g, '""')}"`,
  ]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function ExportButtons({ result }: Props) {
  const [csvDone, setCsvDone] = useState(false);
  const [jsonDone, setJsonDone] = useState(false);

  const exportCSV = () => {
    const slug = result.projectName.toLowerCase().replace(/\s+/g, '-');
    downloadFile(toCSV(result), `${slug}-assets.csv`, 'text/csv;charset=utf-8;');
    setCsvDone(true);
    setTimeout(() => setCsvDone(false), 2000);
  };

  const exportJSON = () => {
    const slug = result.projectName.toLowerCase().replace(/\s+/g, '-');
    downloadFile(JSON.stringify(result, null, 2), `${slug}-metadata.json`, 'application/json');
    setJsonDone(true);
    setTimeout(() => setJsonDone(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 dark:text-gray-500 mr-1">Export:</span>
      <button
        onClick={exportCSV}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-all text-gray-600 dark:text-gray-400"
      >
        {csvDone ? (
          <><CheckIcon /> Downloaded!</>
        ) : (
          <><TableIcon /> CSV</>
        )}
      </button>
      <button
        onClick={exportJSON}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-all text-gray-600 dark:text-gray-400"
      >
        {jsonDone ? (
          <><CheckIcon /> Downloaded!</>
        ) : (
          <><CodeIcon /> JSON</>
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M10 3v18M14 3v18M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6z" />
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
```

---

## UPGRADE 5 — Keyboard Shortcut + Processing Indicator

### TASK B5 — Ctrl+Enter submit + skeleton loading

**Mục tiêu**: Power users dùng Ctrl+Enter. Trong khi chờ AI, hiển thị skeleton loader thay vì button loading state đơn giản.

**Thêm vào `components/AssetOrganizerForm.tsx`**:

```typescript
// Thêm useEffect cho keyboard shortcut (trong component body):
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, [projectName, projectType, rawAssets]);
```

**Tạo `components/ResultsSkeleton.tsx`** — skeleton loader:

```typescript
// components/ResultsSkeleton.tsx
export function ResultsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Summary bar skeleton */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex gap-6">
          {[80, 60, 50].map((w, i) => (
            <div key={i}>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2" style={{ width: w }}/>
              <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded" style={{ width: w + 20 }}/>
            </div>
          ))}
        </div>
      </div>

      {/* Table skeleton */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 flex gap-8">
          {[30, 140, 100, 200, 60].map((w, i) => (
            <div key={i} className="h-3 bg-gray-200 dark:bg-gray-700 rounded" style={{ width: w }}/>
          ))}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="px-4 py-4 flex gap-8 border-t border-gray-100 dark:border-gray-800">
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded" style={{ width: 30 }}/>
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded" style={{ width: 140 + (i % 3) * 30 }}/>
            <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded-full" style={{ width: 100 }}/>
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded font-mono" style={{ width: 200 }}/>
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full" style={{ width: 60 }}/>
          </div>
        ))}
      </div>

      {/* Status line */}
      <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-thinking"/>
        <span>AI is analyzing your asset list…</span>
      </div>
    </div>
  );
}
```

**Sửa phần render trong `AssetOrganizerForm.tsx`**:

```typescript
// Import ResultsSkeleton:
import { ResultsSkeleton } from './ResultsSkeleton';

// Trong return JSX, ngay sau form section:
{loading && <ResultsSkeleton />}

{/* Kết quả: chỉ show khi không loading VÀ có result */}
{!loading && result && (
  <div className="space-y-6">
    {/* ... toàn bộ result section ... */}
  </div>
)}
```

---

## UPGRADE 6 — Upgraded MetadataPreview với Syntax Highlighting giả

### TASK B6 — Sửa MetadataPreview để highlight JSON token

**Mục tiêu**: JSON block không phải monochrome text, mà highlight keys/values/strings theo màu như VS Code.

**Sửa `components/MetadataPreview.tsx`** toàn bộ:

```typescript
// components/MetadataPreview.tsx
'use client';
import { useState } from 'react';
import { OrganizeResult } from '@/lib/types';

interface Props {
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
        let cls = 'color:#a5d6ff'; // number (blue)
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'color:#79b8ff'; // key (lighter blue)
          } else {
            cls = 'color:#9ecbff'; // string (pale blue)
          }
        } else if (/true|false/.test(match)) {
          cls = 'color:#85e89d'; // boolean (green)
        } else if (/null/.test(match)) {
          cls = 'color:#f97583'; // null (red)
        }
        return `<span style="${cls}">${match}</span>`;
      }
    );
}

export function MetadataPreview({ result }: Props) {
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
  };

  const fullJson = JSON.stringify(result, null, 2);
  const previewJson = JSON.stringify(metadata, null, 2);
  const activeJson = expanded ? fullJson : previewJson;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in-section" style={{ animationDelay: '200ms' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Project Metadata
          </h3>
          <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded font-mono">
            JSON
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {expanded ? 'Show summary' : 'Show full result'}
          </button>
          <button
            onClick={handleCopy}
            className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors font-medium"
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      <div className="relative rounded-xl overflow-hidden border border-gray-800 dark:border-gray-700">
        {/* Editor-style top bar */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-gray-800 dark:bg-gray-900 border-b border-gray-700">
          <div className="w-3 h-3 rounded-full bg-red-500 opacity-80"/>
          <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-80"/>
          <div className="w-3 h-3 rounded-full bg-green-500 opacity-80"/>
          <span className="ml-2 text-xs text-gray-500 font-mono">
            {result.projectName.toLowerCase().replace(/\s+/g, '-')}-metadata.json
          </span>
        </div>
        <pre
          className="bg-gray-900 text-gray-300 text-xs p-5 overflow-x-auto leading-relaxed max-h-96 overflow-y-auto"
          dangerouslySetInnerHTML={{ __html: syntaxHighlight(activeJson) }}
        />
      </div>
    </div>
  );
}
```

---

## UPGRADE 7 — Tích hợp tất cả upgrades vào AssetOrganizerForm

### TASK B7 — Rebuild AssetOrganizerForm hoàn chỉnh với tất cả upgrades

**Đây là version final của `components/AssetOrganizerForm.tsx`** — viết lại toàn bộ file, tích hợp CategoryChart, ExportButtons, ResultsSkeleton, ThemeToggle, keyboard shortcut, và đầy đủ dark mode:

```typescript
// components/AssetOrganizerForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { OrganizeResult, ProjectType } from '@/lib/types';
import { ResultsTable } from './ResultsTable';
import { MetadataPreview } from './MetadataPreview';
import { WarningsList } from './WarningsList';
import { CategoryChart } from './CategoryChart';
import { ExportButtons } from './ExportButtons';
import { ResultsSkeleton } from './ResultsSkeleton';
import { ThemeToggle } from './ThemeToggle';

const PROJECT_TYPES: { value: ProjectType; label: string; desc: string }[] = [
  { value: 'apartment',  label: 'Apartment',  desc: 'Residential units' },
  { value: 'office',     label: 'Office',     desc: 'Workspaces, meeting rooms' },
  { value: 'showroom',   label: 'Showroom',   desc: 'Product display spaces' },
  { value: 'exhibition', label: 'Exhibition', desc: 'Event, expo spaces' },
  { value: 'museum',     label: 'Museum',     desc: 'Cultural institutions' },
  { value: 'retail',     label: 'Retail',     desc: 'Shops, stores' },
  { value: 'custom',     label: 'Custom',     desc: 'Other project types' },
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
    const count = rawAssets.split('\n').filter(l => l.trim()).length;
    setAssetCount(count);
  }, [rawAssets]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [projectName, projectType, rawAssets]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!projectName.trim()) errors.projectName = 'Project name is required';
    if (!projectType) errors.projectType = 'Please select a project type';
    const lines = rawAssets.split('\n').filter(l => l.trim());
    if (lines.length < 2) errors.rawAssets = 'Please enter at least 2 assets (one per line)';
    if (lines.length > 100) errors.rawAssets = 'Maximum 100 assets per request';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setApiError(null);
    setResult(null);

    try {
      const res = await fetch('/api/organize-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName, projectType, rawAssets })
      });
      const data = await res.json();
      if (!res.ok) {
        setApiError(data.error || `Request failed (${res.status})`);
        return;
      }
      setResult(data as OrganizeResult);
    } catch {
      setApiError('Network error. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setApiError(null);
    setFormErrors({});
  };

  const handleLoadExample = () => {
    setProjectName('Sunrise Showroom HCMC');
    setProjectType('showroom');
    setRawAssets(EXAMPLE_ASSETS);
    setFormErrors({});
    setResult(null);
  };

  const inputClass = (err?: string) =>
    `w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 ${
      err
        ? 'border-red-400 dark:border-red-500'
        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
    }`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                  AI 3D Asset Organizer
                </h1>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Classify · Slug · Organize
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/api/organize-assets"
                target="_blank"
                className="hidden sm:flex text-xs items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                </svg>
                API
              </a>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT: Input Form */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 space-y-4 sticky top-24">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                  Project Input
                </h2>
                <button
                  onClick={handleLoadExample}
                  className="text-xs text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
                >
                  Load example
                </button>
              </div>

              {/* Project Name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  Project Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={e => { setProjectName(e.target.value); setFormErrors(p => ({ ...p, projectName: undefined })); }}
                  placeholder="e.g. Sunrise Showroom HCMC"
                  className={inputClass(formErrors.projectName)}
                />
                {formErrors.projectName && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <span>⚠</span> {formErrors.projectName}
                  </p>
                )}
              </div>

              {/* Project Type */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  Project Type
                </label>
                <select
                  value={projectType}
                  onChange={e => { setProjectType(e.target.value as ProjectType); setFormErrors(p => ({ ...p, projectType: undefined })); }}
                  className={inputClass(formErrors.projectType)}
                >
                  <option value="">Select type…</option>
                  {PROJECT_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label} — {t.desc}</option>
                  ))}
                </select>
                {formErrors.projectType && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <span>⚠</span> {formErrors.projectType}
                  </p>
                )}
              </div>

              {/* Asset List */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Asset List
                  </label>
                  <span className={`text-xs font-mono transition-colors ${assetCount > 0 ? 'text-indigo-500' : 'text-gray-300 dark:text-gray-600'}`}>
                    {assetCount} / 100
                  </span>
                </div>
                <textarea
                  value={rawAssets}
                  onChange={e => { setRawAssets(e.target.value); setFormErrors(p => ({ ...p, rawAssets: undefined })); }}
                  rows={10}
                  placeholder={'lobby panorama scan\nmeeting room 1\nkitchen area\n…'}
                  className={`${inputClass(formErrors.rawAssets)} font-mono resize-none`}
                  spellCheck={false}
                />
                {formErrors.rawAssets && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <span>⚠</span> {formErrors.rawAssets}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-indigo-800 text-white font-semibold py-2.5 rounded-xl transition-all text-sm shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Analyzing…
                  </span>
                ) : 'Analyze Assets'}
              </button>

              <p className="text-center text-xs text-gray-300 dark:text-gray-600">
                ⌘ / Ctrl + Enter to submit
              </p>

              {/* API Error */}
              {apiError && (
                <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl p-3 text-xs text-red-700 dark:text-red-400">
                  <strong className="font-semibold">Error:</strong> {apiError}
                </div>
              )}

              {/* Reset */}
              {result && !loading && (
                <button
                  onClick={handleReset}
                  className="w-full text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 py-1 transition-colors"
                >
                  ↩ Clear results
                </button>
              )}
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="lg:col-span-2 space-y-5">
            {/* Skeleton while loading */}
            {loading && <ResultsSkeleton />}

            {/* Actual results */}
            {!loading && result && (
              <>
                {/* Summary Bar */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 animate-fade-in-section">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex flex-wrap gap-6">
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-medium mb-1">Project</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{result.projectName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-medium mb-1">Type</p>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 capitalize">{result.projectType}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-medium mb-1">Assets</p>
                        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{result.totalAssets}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-medium mb-1">Warnings</p>
                        <p className={`text-sm font-bold ${result.warnings.length > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {result.warnings.length > 0 ? `${result.warnings.length} found` : 'None ✓'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        result.processedBy === 'ai'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                      }`}>
                        {result.processedBy === 'ai' ? '✦ AI Mode' : '⚙ Mock Mode'}
                      </span>
                      <ExportButtons result={result} />
                    </div>
                  </div>
                </div>

                {/* Category Chart */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                  <CategoryChart categories={result.categories} totalAssets={result.totalAssets} />
                </div>

                {/* Classification Table */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">
                  <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Asset Classification
                    <span className="ml-2 text-xs font-normal text-gray-400 dark:text-gray-500">
                      {result.totalAssets} assets
                    </span>
                  </h2>
                  <ResultsTable assets={result.assets} />
                </div>

                {/* Warnings + Recommendations */}
                {(result.warnings.length > 0 || result.recommendations.length > 0) && (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                    <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">
                      Analysis
                    </h2>
                    <WarningsList warnings={result.warnings} recommendations={result.recommendations} />
                  </div>
                )}

                {/* Metadata JSON */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                  <MetadataPreview result={result} />
                </div>
              </>
            )}

            {/* Empty state */}
            {!loading && !result && !apiError && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center mb-4">
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#6366f1" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Enter your project details and asset list to begin
                </p>
                <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">
                  Or <button onClick={handleLoadExample} className="text-indigo-400 hover:text-indigo-600 underline">load the example</button> to see it in action
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
```

---

## UPGRADE 8 — Naming Convention Explainer Tooltip

### TASK B8 — Hiển thị slug anatomy inline

**Mục tiêu**: Khi hover vào bất kỳ slug nào trong bảng, hiển thị breakdown: mỗi phần của slug là gì.

**Tạo `components/SlugTooltip.tsx`**:

```typescript
// components/SlugTooltip.tsx
'use client';
import { useState } from 'react';

interface Props {
  slug: string;
}

function parseSlug(slug: string) {
  const parts = slug.split('_');
  if (parts.length < 4) return null;

  const [projectType, categoryRoom, assetType, version] = parts;
  const [category, ...roomParts] = categoryRoom.split('-');
  const room = roomParts.join('-');

  return [
    { part: projectType, label: 'Project type', color: 'text-violet-600 dark:text-violet-400 border-violet-300 dark:border-violet-700' },
    { part: category,    label: 'Category',     color: 'text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700' },
    { part: room,        label: 'Room / area',  color: 'text-sky-600 dark:text-sky-400 border-sky-300 dark:border-sky-700' },
    { part: assetType,   label: 'Asset type',   color: 'text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700' },
    { part: version,     label: 'Version',      color: 'text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600' },
  ];
}

export function SlugTooltip({ slug }: Props) {
  const [show, setShow] = useState(false);
  const parsed = parseSlug(slug);

  return (
    <div className="relative inline-block w-full">
      <code
        className="text-xs font-mono bg-gray-100 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-md cursor-help break-all block"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {slug}
      </code>
      {show && parsed && (
        <div className="absolute bottom-full left-0 mb-2 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-xl w-max max-w-xs">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Slug anatomy</p>
          <div className="space-y-1.5">
            {parsed.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <code className={`text-xs font-mono px-1.5 py-0.5 rounded border ${p.color} bg-transparent`}>
                  {p.part || '—'}
                </code>
                <span className="text-xs text-gray-400 dark:text-gray-500">{p.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-300 dark:text-gray-600 font-mono break-all">{slug}</p>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Sửa `components/ResultsTable.tsx`** — import và dùng SlugTooltip thay cho `<code>` thuần:

```typescript
// Thêm import:
import { SlugTooltip } from './SlugTooltip';

// Thay thế cell Slug (trong <td>):
// Cũ:
// <code className="text-xs font-mono ...">{asset.slug}</code>

// Mới:
<SlugTooltip slug={asset.slug} />
```

---

## UPGRADE 9 — Processing Time Display + AI Model Badge

### TASK B9 — Track và hiển thị processing time

**Mục tiêu**: Sau khi nhận được kết quả, hiển thị "Processed in 1.4s · claude-sonnet-4" — cho thấy transparency về AI.

**Sửa `lib/types.ts`** — thêm field vào `OrganizeResult`:

```typescript
// Thêm 2 fields vào OrganizeResult interface:
export interface OrganizeResult {
  // ... existing fields ...
  processingTimeMs?: number;  // milliseconds
  modelUsed?: string;         // e.g. "claude-sonnet-4" or "mock-rules-v1"
}
```

**Sửa `app/api/organize-assets/route.ts`** — track thời gian:

```typescript
// Trong POST handler, bọc xung quanh AI/mock call:
const startTime = Date.now();

let result;
if (hasApiKey) {
  const { processWithAI } = await import('@/lib/ai-processor');
  result = await processWithAI(req);
} else {
  const { processMock } = await import('@/lib/mock-processor');
  result = await processMock(req);
}

result.processingTimeMs = Date.now() - startTime;
```

**Sửa `lib/mock-processor.ts`** — thêm `modelUsed`:

```typescript
// Trong return của processMock, thêm:
modelUsed: 'mock-rules-v1.0',
```

**Sửa `lib/ai-processor.ts`** — thêm `modelUsed`:

```typescript
// Sau khi parse result, thêm:
result.modelUsed = 'claude-sonnet-4';
```

**Sửa Summary Bar trong `AssetOrganizerForm.tsx`** — thêm processing info:

```typescript
// Thêm vào phần cuối của Summary Bar (sau ExportButtons):
{result.processingTimeMs && (
  <p className="w-full text-xs text-gray-300 dark:text-gray-600 font-mono mt-2">
    Processed in {(result.processingTimeMs / 1000).toFixed(2)}s
    {result.modelUsed && (
      <span className="ml-2 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-400 dark:text-gray-500">
        {result.modelUsed}
      </span>
    )}
  </p>
)}
```

---

## UPGRADE 10 — Sửa README.md và REPORT.md cho xứng tầm

### TASK B10 — Rewrite README với badges + architecture diagram dạng text

**Xóa README.md cũ, viết lại toàn bộ**:

````markdown
# AI 3D Asset Organizer

> Intern Tech Test — Built with Next.js 14 + TypeScript + Anthropic Claude API

A fullstack web tool that transforms raw, messy 3D scan asset lists into organized, classified, slug-standardized project structures — using AI as the intelligence engine.

---

## What it does

**Input**: Paste raw asset names (e.g. `lobby panorama scan`, `meeting room 1`)  
**Output**: Classified assets, standardized slugs, JSON metadata, warnings, and improvement recommendations.

```
Input                          →  Output
─────────────────────────────     ──────────────────────────────────────────────
lobby panorama scan           →   showroom_public-lobby_panorama_v01   [public_area]
meeting room 1                →   showroom_public-meeting-room_asset_v02  [public_area]
technical room                →   showroom_tech-technical-room_asset_v03  [technical_area]
floor 2 corridor              →   showroom_circ-floor-2_asset_v04      [circulation_area]
```

Slug convention: `{projectType}_{category}-{room}_{assetType}_{version}`

---

## Features

| Feature | Description |
|---------|-------------|
| **AI Classification** | Claude classifies each asset into 6 categories |
| **Slug Generation** | Deterministic slug generation with naming convention |
| **Warning Detection** | Flags ambiguous names, duplicates, missing floor info |
| **Mock Fallback** | Full demo without any API key |
| **Dark Mode** | System-aware, toggleable |
| **Export** | One-click CSV and JSON download |
| **Keyboard Shortcuts** | Ctrl/⌘ + Enter to submit |
| **Animated Results** | Staggered row reveal, skeleton loading |
| **Slug Tooltip** | Hover to see slug anatomy breakdown |
| **Processing Time** | Transparent AI processing stats |

---

## Quick Start

```bash
# 1. Clone
git clone <repo-url>
cd ai-3d-asset-organizer

# 2. Install
npm install

# 3. Configure (optional)
cp .env.example .env.local
# Edit .env.local — add ANTHROPIC_API_KEY for AI mode
# Leave blank for Mock mode (still fully functional)

# 4. Run
npm run dev
# → http://localhost:3000
```

**Tip**: Click "Load example" on first launch to see a full demo instantly.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 14 App                        │
│                                                         │
│  ┌──────────────────┐     ┌──────────────────────────┐  │
│  │  Frontend (React) │     │  API Route               │  │
│  │                  │     │  POST /api/organize-assets│  │
│  │  AssetOrganizerForm◄───►                           │  │
│  │  CategoryChart   │     │  ┌────────────────────┐  │  │
│  │  ResultsTable    │     │  │ ANTHROPIC_API_KEY?  │  │  │
│  │  MetadataPreview │     │  │  Yes → ai-processor │  │  │
│  │  ExportButtons   │     │  │  No  → mock-proc.  │  │  │
│  │  SlugTooltip     │     │  └────────────────────┘  │  │
│  └──────────────────┘     └──────────────────────────┘  │
│                                                         │
│  lib/types.ts · lib/validators.ts · lib/slug-generator   │
└─────────────────────────────────────────────────────────┘
         │                        │
         ▼                        ▼
    Anthropic Claude         Mock Rules Engine
    claude-sonnet-4          (keyword matching)
```

---

## API

### `POST /api/organize-assets`

```json
{
  "projectName": "Sunrise Showroom HCMC",
  "projectType": "showroom",
  "rawAssets": "lobby panorama scan\nmeeting room 1\nkitchen area"
}
```

**Response**: `OrganizeResult` — see `lib/types.ts` for full schema.

### `GET /api/organize-assets`

Returns API health + current mode (AI vs Mock).

---

## Modes

| Mode | Condition | Behavior |
|------|-----------|----------|
| **AI Mode** | `ANTHROPIC_API_KEY` set | Claude API, real classification |
| **Mock Mode** | No API key | Keyword rules, same output structure |

Both modes return the same `OrganizeResult` schema.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript strict |
| Styling | Tailwind CSS + dark mode |
| AI | Anthropic Claude (claude-sonnet-4) |
| Package manager | npm |

---

## Requirements

- Node.js 18+
- npm 9+
- (Optional) Anthropic API key — `console.anthropic.com`
````

---

### TASK B11 — Rewrite REPORT.md

````markdown
# REPORT — AI 3D Asset Organizer

**Candidate**: [Your Name]  
**Test Duration**: 2 days  
**Submission**: AI-Powered Intern Test — Option B

---

## What I Built

A fullstack Next.js web tool that takes the real operational pain point of 3D digitization project teams — messy, inconsistent asset naming — and solves it with a structured AI pipeline.

The app takes raw text input like `lobby panorama scan` and transforms it into:
- Classified asset (`public_area`)
- Standardized slug (`showroom_public-lobby_panorama_v01`)
- Structured JSON metadata ready for ingestion into a project management system
- Actionable warnings and organization recommendations

This is not a demo chatbot. It's a data normalization tool that uses LLM as its classification engine.

---

## Key Technical Decisions

### 1. AI as a classification engine, not a generator

The LLM's job is narrow and well-defined: classify each asset into one of 6 categories and explain its confidence. Slug generation, warning detection, and metadata structure are handled deterministically in code (`lib/slug-generator.ts`). This makes the output predictable, testable, and auditable — not dependent on the model's whims.

### 2. Strict JSON-only AI output

The system prompt explicitly prohibits markdown, preambles, and explanation text. The user prompt embeds the full expected schema inline. Even so, the response goes through a fence-stripping step before `JSON.parse()`. Defense in depth for a production environment.

### 3. Mock processor mirrors AI architecture

The mock uses keyword-matching rules that reproduce the same classification logic without an API call. This is not a stub — it generates realistic warnings, recommendations, and confidence scores. The reviewer can use the full app without ever setting up a key.

### 4. Separation of concerns

```
User intent (form) → HTTP (validation) → AI/Mock (classification)
                   → Slug (deterministic) → Result (typed, structured)
```

Each layer has a single responsibility and a clear TypeScript interface. Adding a new AI provider means only touching `ai-processor.ts`.

### 5. UX as a differentiator

- Staggered row animations signal "AI working" without fake progress bars
- Slug tooltip shows the anatomy of every generated name — teaches the convention
- Dark mode, keyboard shortcut (Ctrl+Enter), responsive layout, skeleton loading — these are not extras; they signal that the developer thinks about users, not just specs
- Export to CSV/JSON is the most practical feature for a real workflow

---

## What I Would Build Next

| Feature | Why |
|---------|-----|
| Version auto-increment | Detect existing slugs, assign `_v02`, `_v03` |
| Batch CSV import | Upload a `.csv` instead of pasting text |
| Confidence threshold filter | Show only `low` confidence for human review |
| Webhook export | POST result to a project management system |
| Multi-language support | Vietnamese asset names are common in Vietnamese projects |

---

## AI Transparency

**AI is used for**: asset category classification, confidence scoring, contextual warning generation, and project-specific recommendations.

**AI is NOT used for**: slug generation (deterministic code), validation logic, or the UI.

The `processedBy` field in every response tells the reviewer whether the result came from Claude or the mock engine. Processing time and model version are also surfaced in the UI.
````

---

## UPGRADE 11 — Cập nhật package.json và thêm postcss.config.js

### TASK B12 — Đảm bảo Tailwind dark mode hoạt động

**Tạo `postcss.config.js`** nếu chưa có (Next.js 14 cần file này cho một số cấu hình):

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

---

## FINAL EXECUTION ORDER (Bonus Tasks)

Chạy theo thứ tự sau. Confirm sau mỗi task.

| # | Task | Nội dung |
|---|------|---------|
| B1 | Dark Mode | `ThemeToggle.tsx`, sửa `tailwind.config.ts`, `globals.css`, header |
| B2 | Animations | Sửa `globals.css`, rebuild `ResultsTable.tsx` |
| B3 | Category Chart | Tạo `CategoryChart.tsx` |
| B4 | Export | Tạo `ExportButtons.tsx` |
| B5 | Keyboard + Skeleton | Thêm `useEffect` keyboard, tạo `ResultsSkeleton.tsx` |
| B6 | JSON Highlight | Rebuild `MetadataPreview.tsx` |
| B7 | Final Form | Rebuild `AssetOrganizerForm.tsx` hoàn chỉnh |
| B8 | Slug Tooltip | Tạo `SlugTooltip.tsx`, sửa `ResultsTable.tsx` |
| B9 | Timing + Badge | Sửa `types.ts`, `route.ts`, `ai-processor.ts`, `mock-processor.ts`, form |
| B10 | README | Rewrite `README.md` |
| B11 | REPORT | Rewrite `REPORT.md` |
| B12 | PostCSS | Tạo `postcss.config.js` |

---

## KIỂM TRA CUỐI CÙNG SAU BONUS

- [ ] Dark mode toggle hoạt động, persist qua reload
- [ ] Kết quả animate stagger (không xuất hiện cùng lúc)
- [ ] Category chart bars animate fill khi xuất hiện
- [ ] Hover slug → tooltip hiện slug anatomy
- [ ] Export CSV → file tải về đúng tên project
- [ ] Export JSON → file đúng format, đủ fields
- [ ] Ctrl/⌘ + Enter submit form
- [ ] Skeleton loader hiện trong lúc chờ AI
- [ ] Processing time xuất hiện sau kết quả
- [ ] Mobile responsive (test ở 375px width)
- [ ] `npm run type-check` → 0 errors
- [ ] Không có `console.error` trong browser
```
