---
name: mutate-api
description: Use this skill whenever asked to create, update, delete, approve, reject, upload, resend, or otherwise mutate backend data in this repository.
---

# Mutate API Skill (govsuite-dms-fe)

Use this skill for write operations only.

## Goal

Implement mutation requests in the same style as existing code:

- Axios-based service calls in `src/services/*`.
- Correct auth instance selection (`authAxios` or `unauthAxios`).
- Defensive response handling.
- Predictable progress/loading/success/error state transitions in UI/hooks.
- Backend error normalization for user-facing feedback.

## Mandatory Rules

1. Use axios instances from `src/services/http.ts` (never native fetch).
2. Use `authAxios` for authenticated mutations.
3. Use `unauthAxios` only for public/auth mutations.
4. Build endpoints using `getEnv('VITE_API_BASE_URL')`.
5. Wrap mutation calls in `try/catch`.
6. In services, log with `console.error(...)` and rethrow, unless a stable structured error return is already established by the surrounding module.
7. Keep mutation logic in service files; UI layers should call services, not axios directly.
8. Do not set Authorization headers manually in service methods; auth is managed centrally by interceptors.
9. Use explicit payload types for request body shape and explicit response types for service returns.
10. Keep mutation changes scoped and avoid unrelated refactors.
11. Normalize mutation responses before returning (`response.data?.data ?? response.data`) and provide safe defaults when backend shape varies.
12. For upload endpoints, prefer `FormData` payloads when backend expects multipart and let axios set boundary headers automatically.

## Repository-Specific Patterns

- Build URLs with `getEnv('VITE_API_BASE_URL')` from `src/config/runtimeEnv.ts`.
- Keep mutation services inside `src/services/*` and align with existing files such as `approval.svc.ts`, `deleteResend.ts`, and `catalog.svc.ts`.
- Use `extractBackendError` for user-facing failures in hooks/pages/components.
- Reuse in-flight guards (`useRef` flags) for destructive or repeatable actions.

## Mutation UX State Rules

When wiring create/update/delete actions in pages/components/hooks:

1. Set action progress state to loading before request starts.
2. Reset action error state before request starts.
3. Guard duplicate submissions while request is in flight (disabled controls or in-flight refs).
4. On success, set success state and trigger only the minimum required UI refresh.
5. On failure, parse with `extractBackendError` when user-facing messaging is needed.
6. Always clear in-flight guard in `finally`.
7. Ensure button/action disabled state is tied to in-flight state for keyboard and mouse interactions.

## Data Consistency Rules After Mutation

1. Prefer targeted update/refetch over full-page reload.
2. For list/detail pages, keep pagination/filter context intact after mutation.
3. If optimistic update is used, ensure rollback or follow-up refetch to prevent stale UI.
4. Keep request ordering safe when multiple actions can overlap.
5. Preserve current pagination/filter/sort context after mutation-triggered refresh.

## Common Anti-Patterns To Avoid

- Fire-and-forget mutation calls without awaiting completion.
- Returning raw backend payload without type-safe normalization.
- Triggering full route reloads when targeted state update/refetch is enough.
- Allowing duplicate submissions from rapid clicks/keypress.
- Losing current list context (page/filter/sort) after successful mutation.

## Preferred Service Template (Mutation)

Example pattern to follow:

- Build URL from runtime env base URL.
- Call `authAxios.post|put|delete` with typed payload and response.
- Return normalized payload.
- Catch, log, and rethrow.

```ts
type UpdatePayload = {
  id: string
  title: string
}

type UpdateResponse = {
  id: string
  title: string
  updatedAt: string
}

export const updateExample = async (body: UpdatePayload): Promise<UpdateResponse> => {
  const url = `${getEnv('VITE_API_BASE_URL')}/example/${body.id}`

  try {
    const response = await authAxios.put(url, body)
    const payload = response.data?.data ?? response.data ?? {}

    return {
      id: String(payload.id ?? ''),
      title: String(payload.title ?? ''),
      updatedAt: String(payload.updatedAt ?? ''),
    }
  } catch (error) {
    console.error('Error updating example:', error)
    throw error
  }
}
```

## Preferred Hook/UI Action Template

Example flow to follow:

- `setProgress('loading')`
- `setError(null)`
- `try { await serviceMutation(...) ; setProgress('success') }`
- `catch (error) { const backendError = extractBackendError(error); setProgress('error'); setError(...) }`
- `finally { clearInFlightGuard() }`

## Scope Notes

- Align naming and structure with nearby files like `src/services/approval.svc.ts`, `src/services/deleteResend.ts`, and `src/hooks/useResubmitDokumen.ts`.
- Do not add new dependencies for mutation helpers.

## Pre-Handoff Verification

Before finalizing mutation work:

1. Confirm no direct axios mutation calls were added in UI layers.
2. Confirm action loading/success/error states transition predictably.
3. Confirm duplicate-submit guards are active.
4. Confirm post-mutation refresh preserves user context (filters/page/sort).
5. Confirm backend errors shown to users pass through `extractBackendError` where relevant.
