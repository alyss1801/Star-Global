# AI 3D Asset Organizer

> Intern Tech Test - Built with Next.js 14 + TypeScript + Anthropic Claude API

A fullstack web tool that transforms raw, messy 3D scan asset lists into organized, classified, slug-standardized project structures using AI as the intelligence engine.

---

## What it does

**Input**: Paste raw asset names such as `lobby panorama scan` or `meeting room 1`  
**Output**: Classified assets, standardized slugs, JSON metadata, warnings, and improvement recommendations.

```text
Input                          ->  Output
----------------------------       ------------------------------------------------
lobby panorama scan           ->  showroom_public-lobby_panorama_v01   [public_area]
meeting room 1                ->  showroom_public-meeting-room-1_asset_v02 [public_area]
technical room                ->  showroom_tech-technical-room_asset_v03 [technical_area]
floor 2 corridor              ->  showroom_circ-floor-2-corridor_asset_v04 [circulation_area]
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
| **Dark Mode** | Toggleable and persisted across reloads |
| **Export** | One-click CSV and JSON download |
| **Keyboard Shortcuts** | Ctrl/⌘ + Enter submits the form |
| **Animated Results** | Staggered row reveal and skeleton loading |
| **Slug Tooltip** | Hover to see slug anatomy breakdown |
| **Processing Time** | Transparent processing stats and model badge |

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
# Edit .env.local and add ANTHROPIC_API_KEY for AI mode
# Leave blank for Mock mode

# 4. Run
npm run dev
```

Open `http://localhost:3000`.

Tip: Click `Load example` on first launch to see a full demo instantly.

---

## Architecture

```text
+-------------------------------------------------------------+
|                    Next.js 14 Application                   |
|                                                             |
|  +----------------------+   +-----------------------------+ |
|  | Frontend (React)     |   | API Route                   | |
|  |                      |   | POST /api/organize-assets   | |
|  | AssetOrganizerForm   |<->|                             | |
|  | CategoryChart        |   |  ANTHROPIC_API_KEY?         | |
|  | ResultsTable         |   |   Yes -> ai-processor       | |
|  | MetadataPreview      |   |   No  -> mock-processor     | |
|  | ExportButtons        |   +-----------------------------+ |
|  | SlugTooltip          |                                   |
|  +----------------------+                                   |
|                                                             |
|  lib/types.ts · lib/validators.ts · lib/slug-generator.ts  |
+-------------------------------------------------------------+
                 |                              |
                 v                              v
          Anthropic Claude                Mock Rules Engine
          claude-sonnet-4                 keyword matching
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

Response: `OrganizeResult`. See [lib/types.ts](/d:/Star%20Global/lib/types.ts) for the full schema.

### `GET /api/organize-assets`

Returns API health and whether AI mode is currently enabled.

---

## Modes

| Mode | Condition | Behavior |
|------|-----------|----------|
| **AI Mode** | `ANTHROPIC_API_KEY` is set | Claude API classification |
| **Mock Mode** | No API key | Rule-based processing with the same schema |

Both modes return the same `OrganizeResult` shape.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript strict |
| Styling | Tailwind CSS + dark mode |
| AI | Anthropic Claude |
| Package manager | npm |

---

## Requirements

- Node.js 18+
- npm 9+
- Optional Anthropic API key from `console.anthropic.com`
