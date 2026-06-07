# REPORT - AI 3D Asset Organizer

**Candidate**: [Your Name]  
**Test Duration**: 2 days  
**Submission**: AI-Powered Intern Test - Option B

---

## What I Built

A fullstack Next.js web tool that targets a real operational pain point for 3D digitization teams: messy, inconsistent asset naming.

The app takes raw text such as `lobby panorama scan` and transforms it into:
- A classified asset category such as `public_area`
- A standardized slug such as `showroom_public-lobby_panorama_v01`
- Structured JSON metadata ready for downstream ingestion
- Actionable warnings and organization recommendations

This is not a chatbot demo. It is a data normalization pipeline with AI used as a bounded classification engine.

---

## Key Technical Decisions

### 1. AI as a classification engine, not a generator

The model handles classification, confidence, and context-aware recommendations. Slug generation and validation remain deterministic in code. That keeps outputs predictable, auditable, and testable.

### 2. Strict JSON-only AI output

The Claude system prompt forces JSON-only output. The response is still normalized before parsing, so accidental markdown fences do not break the route.

### 3. Mock processor mirrors the production shape

The mock path is not a placeholder. It produces realistic categories, warnings, recommendations, timing metadata, and the same `OrganizeResult` schema. The reviewer can run the whole app without an API key.

### 4. Clear separation of concerns

```text
User intent (form) -> HTTP validation -> AI or Mock classification
                    -> Slug generation -> Typed result object
```

Each layer owns one responsibility. Switching providers only affects `lib/ai-processor.ts`.

### 5. UX used as a differentiator

- Staggered row animations make the processing flow feel intentional
- Slug tooltips explain naming anatomy instead of hiding the logic
- Dark mode, keyboard shortcut support, and responsive layout improve daily usability
- CSV and JSON export make the output immediately useful in operational workflows

---

## What I Would Build Next

| Feature | Why |
|---------|-----|
| Version auto-increment | Detect existing slugs and assign `_v02`, `_v03` |
| Batch CSV import | Reduce manual paste workflows |
| Confidence threshold filter | Surface low-confidence assets for review |
| Webhook export | Push results into project systems automatically |
| Multi-language support | Handle Vietnamese or mixed-language asset names better |

---

## AI Transparency

**AI is used for**: asset category classification, confidence scoring, contextual warning generation, and project-specific recommendations.

**AI is not used for**: slug generation, validation rules, or frontend behavior.

Every response exposes `processedBy`, and the UI also surfaces processing time plus the active model or rules engine badge.
