# Project Agent Instructions

This repository maintains curated, verbatim design-engineering and animation skills locally under `.agents/skills/` (sourced from `https://github.com/emilkowalski/skills`, commit `64eb3deb9a5fbfa041faf783e0bc3fd635872e9c`, MIT License).

## Mandatory Workflow for Coding Agents

1. **Consult the Skill Guide First**: Before planning or implementing UI, visual craft, interaction, or animation changes, read `AI_STUDIO_GUIDE.md` at the repository root to select the applicable project-local skills.
2. **Read Local Skills Directly**: Open and read the relevant `.agents/skills/<skill>/SKILL.md` files and any referenced supporting documents (`RECIPES.md`, `AUDIT.md`, `PLAN-TEMPLATE.md`, `STANDARDS.md`) directly from the repository before writing code. Do not ask the user to upload or attach these files.
3. **Preserve Upstream Skills Verbatim**: Never rewrite, summarize, or modify files inside `.agents/skills/` or remove `.agents/skills/LICENSE`.
4. **Review Completed Work**: After implementing UI or motion changes, verify the result against `.agents/skills/review-animations/SKILL.md`, `.agents/skills/review-animations/STANDARDS.md`, and `.agents/skills/animation-performance/SKILL.md` as applicable.
5. **Respect Project Architecture**: Preserve existing React, TypeScript, Tailwind CSS, design tokens, and shared portfolio components unless the user explicitly asks to change them.
