---
name: fetch-api
description: Use this skill whenever asked to fetch data, write API requests, or connect to backend endpoints in this repository.
---

# Fetch API Skill (govsuite-dms-fe)

Use this skill for any task that involves API requests.

## Goal

Write API calls that match this codebase conventions:

- Axios only (never native `fetch`).
- Service-first architecture (`src/services/*`).
- Correct axios instance (`authAxios` vs `unauthAxios`).
- Consistent response parsing and safe fallbacks.
- Predictable loading/error handling in UI hooks/pages.

## Mandatory Rules

1. Use Axios instances from `src/services/http.ts`.
2. Use `authAxios` for authenticated endpoints.
3. Use `unauthAxios` only for unauthenticated endpoints (for example login/refresh flows).
4. Build URLs with `getEnv('VITE_API_BASE_URL')` from `src/config/runtimeEnv.ts`.
5. Wrap every request in `try/catch`.
6. In service functions: `console.error(...)` then `throw error` (unless the existing function contract returns a structured error object).
7. Parse backend payload defensively:
   - Prefer `const payload = response.data?.data ?? response.data` when endpoint shape is inconsistent.
   - Use `Array.isArray(...)` for list data and fallback to `[]`.
   - Fallback nullable objects to `{}` and nullable sections to `null` where appropriate.
8. For query strings, use `URLSearchParams` instead of manual string concatenation.
9. Keep API logic inside service files; components/pages/hooks should call services, not axios directly.
10. Do not manually set Authorization headers inside service functions. Token handling is centralized in `http.ts` interceptors.
11. Always normalize response payload shape before returning from services (`response.data?.data ?? response.data`) and guard nested arrays/objects.
12. Keep service return shapes stable even when backend omits optional sections (for example `items: []`, `meta` fallback objects).

## Repository-Specific Patterns

- Base URL should always come from `getEnv('VITE_API_BASE_URL')` from `src/config/runtimeEnv.ts`.
- Use `authAxios` / `unauthAxios` from `src/services/http.ts` only.
- Keep service files aligned with current naming style (`*.svc.ts`, `deleteResend.ts`, `pdf.svc.ts`).
- Prefer typed meta fallbacks for paginated responses (see catalog service patterns).

## Data Normalization Checklist (Services)

Before returning from any fetch service, verify:

1. `payload` is resolved with fallback: `response.data?.data ?? response.data ?? {}`.
2. Every list field is guarded with `Array.isArray(...) ? ... : []`.
3. Every object section has a safe default object when nullable.
4. Pagination metadata has defaults when backend omits fields.
5. Returned object shape matches declared TypeScript return type exactly.

## UI/Hooks Integration Rules

When implementing data fetch flows in pages/hooks/components:

1. Set loading state before request starts.
2. Clear/set error state predictably before request starts.
3. Reset loading state in `finally`.
4. For backend-facing user messages, parse error with `extractBackendError` from `src/utils/extractBackendError.ts` when relevant.
5. Avoid stale-update race conditions for rapidly changing requests (use request tokens/guards where needed).
6. For request flows triggered by fast-changing filters/search, support cancellation (`AbortController` / axios `signal`) or stale-result guards.

## Common Anti-Patterns To Avoid

- Returning raw `response.data` directly from services without normalization.
- Building query strings manually with template literals.
- Calling axios directly in pages/components.
- Clearing and reapplying filter state in separate effects that cause duplicate requests.
- Overwriting newer search results with late responses from older requests.

## Preferred Service Template

```ts
import { getEnv } from '@/config/runtimeEnv'
import { authAxios } from './http'

type ExampleResponse = {
  items: Array<{ id: string; name: string }>
}

export const getExample = async (): Promise<ExampleResponse> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/example`

  try {
    const response = await authAxios.get(url)
    const payload = response.data?.data ?? response.data ?? {}

    return {
      items: Array.isArray(payload.items) ? payload.items : [],
    }
  } catch (error) {
    console.error('Error fetching example:', error)
    throw error
  }
}
```

## Preferred Paginated Fetch Template

```ts
type ListMeta = {
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

const DEFAULT_META: ListMeta = {
  currentPage: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
}

export const getExampleList = async (page = 1, limit = 10) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  const url = `${getEnv('VITE_API_BASE_URL')}/example?${params.toString()}`

  try {
    const response = await authAxios.get(url)
    const payload = response.data?.data ?? response.data ?? {}
    const items = Array.isArray(payload.items) ? payload.items : []
    const meta = payload.meta ?? {}

    return {
      items,
      meta: {
        ...DEFAULT_META,
        ...meta,
      },
    }
  } catch (error) {
    console.error('Error fetching example list:', error)
    throw error
  }
}
```

## Preferred UI Fetch Flow Template

```ts
const [isLoading, setIsLoading] = useState(false)
const [errorMessage, setErrorMessage] = useState<string | null>(null)

const loadData = async () => {
  setIsLoading(true)
  setErrorMessage(null)

  try {
    const data = await getExample()
    // set local/store state
  } catch (error) {
    const backendError = extractBackendError(error)
    setErrorMessage(backendError?.message ?? 'Permintaan gagal diproses.')
  } finally {
    setIsLoading(false)
  }
}
```

## Scope Notes

- Follow existing naming and typing style in nearby service file (`*.svc.ts`, `deleteResend.ts`, `pdf.svc.ts`).
- Keep changes minimal and scoped to requested feature.
- Do not introduce new dependencies for basic fetching.

## Pre-Handoff Verification

Before finalizing API fetch work:

1. Confirm no axios usage was added in pages/components/hooks.
2. Confirm loading/error states are deterministic (`try/catch/finally`).
3. Confirm service return type and fallback values match consumer expectations.
4. Confirm race conditions are handled for search/filter driven requests.
