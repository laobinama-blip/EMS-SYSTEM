# EMS Harness Gates

This document defines the quality gates that must be satisfied during the development of the EMS system.

---

## Gate 1: Spec Ready
- The OpenSpec proposal, spec, plan, tasks, and gap analysis are fully reviewed.
- The OpenAPI specification (`openapi.yaml`) is finalized at the root level.
- All missing endpoints are clearly identified and mapped to temporary mock paths.

---

## Gate 2: Code Quality
- **TypeScript Verification:**
  - `npm run typecheck` passes in both the `ems-backend` and `ems-frontend` directories without any compiler errors.
- **Production Build Validation:**
  - `npm run build` executes successfully in the `ems-frontend` directory, compiling all pages and dependencies into static distribution bundles without warnings.
- **Lint Checks:**
  - Coding standards (no unused imports, proper type annotations, valid React component structures) are enforced.

---

## Gate 3: Runtime Smoke Tests
- **Backend Availability:**
  - The mock backend starts on port `20003` without crash loops.
  - The health endpoint `/api/health` returns `{"status":"ok"}`.
  - Interactive Swagger documentation is accessible at `http://localhost:20003/docs` (or similar endpoint) and displays all schemas correctly.
- **API Call Correctness:**
  - The frontend fetches data from the backend using standard Axios requests.
  - The path calls for energy statistics match the provided spec (`/api/kpi/energy/...`).

---

## Gate 4: Visual Smoke Tests
- **Layout Integrity:**
  - The application renders correctly in desktop browser dimensions (1920px width).
  - No blank screens, layout overflows, or severe components overlap occur on navigation.
- **Tab Swapping Reactivity:**
  - Switching between tabs ("作业效率", "关系网", "调度分析", "能源与碳排") triggers correct page re-renders.
- **Energy Page Visual Check:**
  - The page displays:
    1. The top header and navigation layout.
    2. The interactive `FilterBar`.
    3. The three stacked bars representing single-box statistics.
    4. Two line charts (energy trend and traditional/green power comparison).
    5. The time-of-use cost matrix and the vehicle performance list.
