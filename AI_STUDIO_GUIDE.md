# AI Studio Agent Skills Guide

This repository includes a curated, verbatim set of project-local UI design and motion engineering skills stored under `.agents/skills/`. Keeping these files inside the repository eliminates manually downloading and attaching `SKILL.md` files on every Google AI Studio session.

---

## 1. What These Skills Are & Provenance

All seven skills below are retrieved **unmodified** from Emil Kowalski's open-source skills repository under the **MIT License** (full license text preserved verbatim at `.agents/skills/LICENSE`, Copyright © 2026 Emil Kowalski).

- **Upstream Repository**: `https://github.com/emilkowalski/skills`
- **Pinned Commit SHA**: `64eb3deb9a5fbfa041faf783e0bc3fd635872e9c` (`2026-11-15`, *"Add /ask-emil skill to find the right skill for your situation (#52)"*)
- **License**: MIT (`.agents/skills/LICENSE`)
- **Integrity Policy**: Do not rewrite, summarize, or edit files inside `.agents/skills/`. Relative sibling links (such as `../choreograph/SKILL.md`, `../animation-performance/SKILL.md`, and `../review-animations/STANDARDS.md`) resolve directly to single canonical copies with zero file duplication.

### Installed Skill Inventory

| Skill | Local Directory | Included Files (Verbatim from Upstream) | Upstream Source Path |
| :--- | :--- | :--- | :--- |
| **apple-design** | `.agents/skills/apple-design/` | `SKILL.md` | `skills/apple-design/SKILL.md` |
| **emil-design-eng** | `.agents/skills/emil-design-eng/` | `SKILL.md` | `skills/emil-design-eng/SKILL.md` |
| **animate** | `.agents/skills/animate/` | `SKILL.md`, `RECIPES.md` | `skills/animate/*` |
| **choreograph** | `.agents/skills/choreograph/` | `SKILL.md`, `RECIPES.md` | `skills/choreograph/*` |
| **improve-animations** | `.agents/skills/improve-animations/` | `SKILL.md`, `AUDIT.md`, `PLAN-TEMPLATE.md` | `skills/improve-animations/*` |
| **review-animations** | `.agents/skills/review-animations/` | `SKILL.md`, `STANDARDS.md` | `skills/review-animations/*` |
| **animation-performance** | `.agents/skills/animation-performance/` | `SKILL.md` | `skills/animation-performance/SKILL.md` |

> **Intentional Exclusion Note**: Upstream `.agents/skills/animate/SKILL.md` contains one optional cross-link to `../pick-ui-library/SKILL.md`. Because `pick-ui-library` is not part of the seven requested skills and this repository preserves its existing React + Tailwind + Coss UI architecture, `pick-ui-library` is intentionally not installed. Ignore that single optional link unless explicitly requested later.

---

## 2. Which Skills to Consult by Task

Use this routing matrix before planning or editing UI, layout, interaction, or motion code:

| Task / Situation | Primary Skill(s) to Read First | Supporting Reference Files to Read |
| :--- | :--- | :--- |
| Interface craft, visual polish, spacing, shadows, borders, tactile feel | `.agents/skills/emil-design-eng/SKILL.md` | `.agents/skills/choreograph/SKILL.md` (when motion coordinates multiple elements) |
| Apple HIG-inspired surfaces, fluid interaction feel, spatial continuity | `.agents/skills/apple-design/SKILL.md` | `.agents/skills/animation-performance/SKILL.md` |
| Designing or implementing a new animation from scratch | `.agents/skills/animate/SKILL.md` | `.agents/skills/animate/RECIPES.md` |
| Coordinating multi-element transitions (staggers, drawers, modals, route transitions) | `.agents/skills/choreograph/SKILL.md` | `.agents/skills/choreograph/RECIPES.md` |
| Auditing existing codebase animations and producing an improvement plan | `.agents/skills/improve-animations/SKILL.md` | `.agents/skills/improve-animations/AUDIT.md`, `.agents/skills/improve-animations/PLAN-TEMPLATE.md`, `.agents/skills/review-animations/STANDARDS.md` |
| Reviewing completed animations against strict craft standards | `.agents/skills/review-animations/SKILL.md` | `.agents/skills/review-animations/STANDARDS.md`, `.agents/skills/choreograph/SKILL.md` |
| Fixing dropped frames, janky transitions, scroll/blur/layout-thrashing issues | `.agents/skills/animation-performance/SKILL.md` | — |

---

## 3. Mandatory Pre-Implementation Reading Workflow

Before modifying components, styles, layouts, or motion code in this repository:

1. **Identify applicable skills** from the table in Section 2 based on the task.
2. **Read every relevant `SKILL.md` directly from disk** (using `view_file` on `/.agents/skills/<skill>/SKILL.md`).
3. **Read required supporting references** (`RECIPES.md`, `AUDIT.md`, `PLAN-TEMPLATE.md`, `STANDARDS.md`, or linked sibling `SKILL.md` files) before proposing or writing code.
4. **Apply project constraints alongside skill guidance**: preserve the existing React, TypeScript, Tailwind CSS, and design token architecture unless a prompt explicitly asks to change it.

---

## 4. Post-Implementation Review Checklist

After implementing UI or animation changes:

1. Re-read `.agents/skills/review-animations/SKILL.md` and `.agents/skills/review-animations/STANDARDS.md` whenever motion or interactive transitions were added or modified.
2. Check `.agents/skills/animation-performance/SKILL.md` to confirm only compositor-friendly properties (`transform`, `opacity`, `clip-path`) animate on hot paths and `prefers-reduced-motion` is respected.
3. Verify visual restraint, surface contrast, touch/keyboard ergonomics, and tactile polish against `.agents/skills/emil-design-eng/SKILL.md` and `.agents/skills/apple-design/SKILL.md`.
4. Fix any violations discovered during review before finishing the turn.

---

## 5. Reliable Access in Google AI Studio (Important Limitation)

> **Important**: Google AI Studio Build does **not** automatically discover `.agents/skills/` or auto-inject `AGENTS.md` into fresh sessions the way it loads system-managed skills. **File installation** (confirming files exist verbatim in `.agents/skills/`) is distinct from **fresh-session discovery** (confirming a new AI Studio session actually reads them). Do not assume automatic discovery without explicitly testing a fresh session.

### Most Reliable Workflow for Future Sessions

Paste this one-line directive into Google AI Studio's **Additional Instructions** (or at the top of any future implementation prompt) so the coding agent reads the local skills directly from the repository without requiring file uploads:

```text
Before planning or implementing UI, interaction, or animation changes, read /AGENTS.md and /AI_STUDIO_GUIDE.md, then read the relevant project-local SKILL.md and supporting reference files under /.agents/skills/ directly from the repository.
```

### How to Test Fresh-Session Discovery

In a brand-new AI Studio chat session (with no attachments), ask:
*"Which project-local skills are installed in this repository, what commit are they pinned to, and which skill files should you read before reviewing animations?"*

If the agent reads `/AGENTS.md`, `/AI_STUDIO_GUIDE.md`, and `/.agents/skills/` directly and answers with commit `64eb3deb9a5fbfa041faf783e0bc3fd635872e9c` and `.agents/skills/review-animations/STANDARDS.md`, fresh-session discovery is confirmed working for your prompt setup.
