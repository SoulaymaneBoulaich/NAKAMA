---
name: react-query-master
description: >
  Handles frontend data fetching, caching, and state management using TanStack Query v5 
  for Nakama. Use when implementing API calls, managing query keys, configuring 
  caching (staleTime/gcTime), or creating optimistic UI updates. Trigger when 
  the user says "react query", "cache", "staleTime", "optimistic update", or 
  "invalidateQueries". Do NOT trigger for backend Express logic or basic 
  React local state (non-async).
---

# Nakama React Query Master

Expert advisor for TanStack Query v5. This skill ensures that Nakama's frontend remains snappy, minimizes redundant network requests, and provides a "zero-latency" feel through optimistic updates.

---

## Phase 1: Query Key & Structure Design

**Entry:** Creating a new `useQuery` or `useMutation` hook.

1. **Hierarchical Keys**: Use a consistent, array-based hierarchy for query keys (e.g., `['animes']`, `['animes', id]`, `['users', 'feed']`).
2. **Key Factories**: Recommend using a central `queryKeys` object to manage keys and avoid string typos across the app.
3. **Dependency Injection**: Ensure all variables used in the `queryFn` are also included in the `queryKey` to trigger automatic refetching on change.

**Exit:** Query keys are structured, predictable, and fully dependent on their parameters.

---

## Phase 2: Caching & Performance Tuning

**Entry:** Optimizing existing data fetching or reducing server load.

1. **staleTime vs gcTime**: Set `staleTime` appropriately (e.g., 5 mins for static anime details, 0 for live notifications). Set `gcTime` to control how long unused data persists in memory.
2. **Prefetching**: Use `queryClient.prefetchQuery` for predictable navigation (e.g., prefetching an anime's details when the user hovers over its card).
3. **Placeholder Data**: Use `placeholderData` (from previous queries or initial state) to show immediate content while fetching the latest version.

**Exit:** Caching parameters are tuned for the specific data volatility of the feature.

---

## Phase 3: Mutations & Optimistic UI

**Entry:** Implementing "Likes," "Comments," or "Playlist Updates" that require immediate UI feedback.

1. **Optimistic Updates**: On `onMutate`, manually update the cache using `setQueryData` to reflect the change before the server responds.
2. **Error Rollback**: Ensure `onError` correctly restores the previous cache state using the context returned from `onMutate`.
3. **Automatic Invalidation**: Use `onSettled` to call `invalidateQueries` for relevant keys, ensuring the UI stays in sync with the server's final state.

**Exit:** Mutations provide immediate visual feedback with robust error handling.

---

## Common Traps

| Trap | Correct Behavior |
|---|---|
| Fetching in `useEffect` | Use `useQuery` to handle loading, error, and caching states automatically. |
| Over-invalidating queries | Be surgical with `invalidateQueries`; use specific keys or filters to avoid refetching the whole app. |
| Hardcoded query keys | Use a key factory to ensure consistency and prevent "missing update" bugs. |
| Ignoring `isPending` state | Always handle the "pending" state to show spinners or skeletons, preventing a broken UI. |

---

## Eval Cases (evals.json)

```json
[
  {
    "query": "How do I implement an optimistic update for the 'Like' button in Nakama?",
    "should_trigger": true,
    "label": "true_positive",
    "notes": "Direct request for advanced React Query mutation logic."
  },
  {
    "query": "What should the staleTime be for the anime details page?",
    "should_trigger": true,
    "label": "true_positive",
    "notes": "Caching configuration question."
  },
  {
    "query": "How do I invalidate the user feed query after a new post?",
    "should_trigger": true,
    "label": "true_positive",
    "notes": "Query invalidation request."
  },
  {
    "query": "How do I setup a Prisma migration?",
    "should_trigger": false,
    "label": "true_negative",
    "notes": "Backend/DB task, not related to frontend caching."
  },
  {
    "query": "Center this button using Tailwind.",
    "should_trigger": false,
    "label": "true_negative",
    "notes": "UI styling is out of scope."
  },
  {
    "query": "My data isn't updating on the screen.",
    "should_trigger": true,
    "label": "edge_case",
    "notes": "Vague but likely a caching/invalidation issue in the target domain."
  }
]
```
