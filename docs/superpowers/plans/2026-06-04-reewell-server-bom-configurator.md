# Reewell Server BOM Configurator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Reewell server hardware BOM configurator page with real local cost calculation.

**Architecture:** Add a new BOM feature folder with data, calculation helpers, focused tests, and a page component. Wire the page into the existing top navigation as a new tab while leaving existing dashboards intact.

**Tech Stack:** React 19, TypeScript, Vite, lucide-react, Vitest for calculation tests.

---

### Task 1: Cost Calculation Core

**Files:**
- Create: `ems-frontend/src/bom/bomData.ts`
- Create: `ems-frontend/src/bom/bomMath.ts`
- Create: `ems-frontend/src/bom/bomMath.test.ts`
- Modify: `ems-frontend/package.json`

- [ ] **Step 1: Add a failing test**

Create tests that call `buildBomQuote` for 50 vehicles without HA, 100 vehicles with HA, and 500 vehicles with GPU and backup storage.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/bom/bomMath.test.ts`

Expected: FAIL because `buildBomQuote` does not exist yet.

- [ ] **Step 3: Implement data and calculation helper**

Define tier data, optional add-ons, BOM line construction, and summary totals.

- [ ] **Step 4: Run tests**

Run: `npm test -- --run src/bom/bomMath.test.ts`

Expected: PASS.

### Task 2: Page Component

**Files:**
- Create: `ems-frontend/src/bom/ServerBomPage.tsx`
- Modify: `ems-frontend/src/App.tsx`
- Modify: `ems-frontend/src/App.css`

- [ ] **Step 1: Add `BOM配置` to navigation**

Extend `PageKey`, `tabs`, and the page map.

- [ ] **Step 2: Create the interactive page**

Render vehicle tier controls, HA toggle, add-on options, recommended spec, summary, and BOM table.

- [ ] **Step 3: Add styles**

Use existing tokens plus scoped `.bom-*` classes for the new page.

- [ ] **Step 4: Run typecheck and build**

Run: `npm run typecheck` and `npm run build`.

Expected: both exit 0.

### Task 3: Browser Verification and Git

**Files:**
- Verify rendered app only.

- [ ] **Step 1: Start Vite dev server**

Run: `npm run dev -- --host 127.0.0.1`.

- [ ] **Step 2: Verify UI**

Open the BOM page, switch tiers, toggle HA, change add-ons, and inspect desktop/mobile layout.

- [ ] **Step 3: Review Git diff**

Run: `git diff --stat` and `git diff`.

- [ ] **Step 4: Commit and push**

Commit with `feat: add reewell server bom configurator` and push to `origin/main`.
